import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
  Image,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Region, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { database } from '../../../FirebaseConfig';
import { ref, get } from 'firebase/database';
import { getDistance } from 'geolib';
import { s, vs } from '../../../src/constants/responsive';
import { MapErrorBoundary } from '../../../src/components/MapErrorBoundary';
import { getSelectedStoreId, setSelectedStoreId } from '../../../src/lib/storage/selectedStore';
import { useUser } from '../../../src/contexts/UserContext';

interface StoreLocation {
  id: string;
  storeName: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  logo?: string;
  distance?: number;
  isOpen?: boolean;
  status?: string;
}

const DAVAO_CITY_DEFAULT = {
  latitude: 7.0731,
  longitude: 125.6128,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};


const DISTANCE_FILTERS = [
  { label: 'All', value: 999 },
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
];

export default function StoresMapScreen() {
  console.log('🗺️ [StoresMap] Component mounted');
  
  const { user } = useUser();
  console.log('👤 [StoresMap] User:', user?.id ? 'Logged in' : 'Not logged in');
  
  const mapRef = useRef<MapView>(null);
  const isMounted = useRef(true);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreLocation[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState<Region>(DAVAO_CITY_DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(999); // All stores
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [mapKey, setMapKey] = useState(0); // For retry mechanism
  const [mapReady, setMapReady] = useState(false); // Delayed initialization
  const [mapFullyLoaded, setMapFullyLoaded] = useState(false); // Native map ready
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number, longitude: number}>>([]);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Delayed map initialization (prevents race condition)
  useEffect(() => {
    console.log('⏱️ [StoresMap] Starting map initialization delay...');
    const timer = setTimeout(() => {
      if (isMounted.current) {
        console.log('✅ [StoresMap] Map ready flag set to true');
        setMapReady(true);
      }
    }, 500); // 500ms delay to ensure Google Maps SDK fully loaded
    return () => clearTimeout(timer);
  }, [mapKey]);

  // Load user location
  useEffect(() => {
    if (mapReady) {
      console.log('📍 [StoresMap] Map ready, loading user location...');
      loadUserLocation();
    } else {
      console.log('⏳ [StoresMap] Waiting for map to be ready...');
    }
  }, [mapReady]);

  const loadUserLocation = async () => {
    console.log('🔍 [StoresMap] loadUserLocation() started');
    try {
      // Check existing permission first
      console.log('🔐 [StoresMap] Checking location permissions...');
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      console.log('🔐 [StoresMap] Existing permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      
      // If not determined, request permission
      if (existingStatus !== 'granted') {
        console.log('🔐 [StoresMap] Requesting location permission...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('🔐 [StoresMap] Permission request result:', status);
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Location permission denied');
        setLocationPermissionDenied(true);
        setIsLoading(false);
        Alert.alert(
          'Location Permission Required',
          'TindaGo needs access to your location to show nearby stores and calculate distances. Please enable location permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }

      // Get location with high accuracy for precise map positioning
      console.log('📍 [StoresMap] Getting current position...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      console.log('📍 [StoresMap] Location retrieved:', location.coords);

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      if (isMounted.current) {
        setUserLocation(userCoords);
        setRegion({
          ...userCoords,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setLocationPermissionDenied(false);

        console.log('📍 User location loaded:', userCoords);
      }
    } catch (error) {
      console.error('❌ [StoresMap] Error in loadUserLocation:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Unable to get your location. Please check if location services are enabled.');
    }
  };

  // Load all active stores with location
  const hasSuggestedNearest = useRef(false);

  useEffect(() => {
    const loadStores = async () => {
      console.log('🏪 [StoresMap] loadStores() started');
      try {
        // Don't load stores if permission denied
        if (locationPermissionDenied) {
          console.log('⚠️ [StoresMap] Location permission denied, skipping store load');
          return;
        }
        
        console.log('🏪 [StoresMap] Fetching stores from Firebase...');
        setIsLoading(true);
        const storesRef = ref(database, 'stores');
        const snapshot = await get(storesRef);
        console.log('🏪 [StoresMap] Firebase snapshot received');

        if (snapshot.exists()) {
          const storesData = snapshot.val();
          const storesList: StoreLocation[] = [];

          console.log('📊 [StoresMap] Total stores in Firebase:', Object.keys(storesData).length);
          
          Object.keys(storesData).forEach((storeId) => {
            const store = storesData[storeId];

            // Check for location in multiple possible structures
            const hasLocationNew = store.location?.coordinates?.latitude && store.location?.coordinates?.longitude;
            const hasLocationLegacy = store.coordinates?.latitude && store.coordinates?.longitude;
            const hasLocationCoords = store.locationCoordinates?.latitude && store.locationCoordinates?.longitude;
            
            const storeName = store.businessInfo?.storeName || store.storeName || 'Unnamed Store';
            
            // Debug logging for each store
            console.log(`🏪 [Store ${storeId.substring(0, 8)}...] ${storeName}`, {
              status: store.status,
              hasLocationNew,
              hasLocationLegacy,
              hasLocationCoords,
              locationStructure: store.location ? Object.keys(store.location) : 'no location object',
            });

            // Include stores with location (active or pending with location)
            // This allows newly registered stores to appear on map before admin approval
            const hasLocation = hasLocationNew || hasLocationLegacy || hasLocationCoords;
            const canShowOnMap = store.status === 'active' || store.status === 'pending' || store.status === 'pending_documents';
            
            if (!hasLocation && canShowOnMap) {
              console.warn(`⚠️ [Store ${storeName}] Has status '${store.status}' but NO LOCATION DATA!`);
              console.warn('   Store keys:', Object.keys(store));
              if (store.businessInfo) {
                console.warn('   businessInfo keys:', Object.keys(store.businessInfo));
              }
            }
            
            if (hasLocation && canShowOnMap) {
              // Get coordinates from whichever structure exists
              let coordinates: { latitude: number; longitude: number } | undefined;
              let address: string | undefined;
              
              if (hasLocationNew) {
                coordinates = {
                  latitude: store.location.coordinates.latitude,
                  longitude: store.location.coordinates.longitude,
                };
                address = store.location.address || store.location.formattedAddress || 'Address not available';
              } else if (hasLocationLegacy) {
                coordinates = {
                  latitude: store.coordinates.latitude,
                  longitude: store.coordinates.longitude,
                };
                address = store.address || store.businessInfo?.address || 'Address not available';
              } else if (hasLocationCoords) {
                coordinates = {
                  latitude: store.locationCoordinates.latitude,
                  longitude: store.locationCoordinates.longitude,
                };
                address = store.address || store.businessInfo?.address || 'Address not available';
              }
              
              // Skip if coordinates not set (safety check)
              if (!coordinates) return;
              
              const storeLocation: StoreLocation = {
                id: storeId,
                storeName,
                address: address || 'Address not available',
                coordinates,
                logo: store.businessInfo?.logo || store.logo,
                isOpen: store.isOpen ?? true,
                status: store.status,
              };

              // Calculate distance from user if location available
              if (userLocation) {
                const distance = getDistance(
                  { latitude: userLocation.latitude, longitude: userLocation.longitude },
                  {
                    latitude: storeLocation.coordinates.latitude,
                    longitude: storeLocation.coordinates.longitude,
                  }
                );
                storeLocation.distance = distance / 1000; // Convert to km
              }

              storesList.push(storeLocation);
              console.log(`✅ [Store ${storeName}] Added to map (${storeLocation.distance?.toFixed(2) || '?'} km away)`);
            }
          });

          // Sort by distance (closest first)
          storesList.sort((a, b) => (a.distance || 999) - (b.distance || 999));

          if (isMounted.current) {
            setStores(storesList);
            setFilteredStores(storesList);

            console.log(`✅ Loaded ${storesList.length} stores with location`);
            storesList.forEach(s => {
              console.log(`  - ${s.storeName}: ${s.status} (${s.distance?.toFixed(2) || '?'} km)`);
            });

            // Suggest nearest open store on first launch when none selected
            try {
              const already = await getSelectedStoreId(user?.id);
              if (!already && !hasSuggestedNearest.current && storesList.length > 0) {
                const openStores = storesList.filter(s => s.isOpen !== false && s.distance != null);
                if (openStores.length > 0) {
                  const nearest = [...openStores].sort((a,b) => (a.distance! - b.distance!))[0];
                  hasSuggestedNearest.current = true;
                  Alert.alert(
                    'Shop at nearest store?',
                    `${nearest.storeName} · ${nearest.distance?.toFixed(2)} km away`,
                    [
                      {
                        text: 'See others', style: 'cancel'
                      },
                      {
                        text: 'Shop here',
                        onPress: async () => {
                          await setSelectedStoreId(nearest.id, user?.id);
                          setSelectedStore(nearest);
                          Alert.alert('Store selected', `${nearest.storeName} set as your store.`);
                          router.push('/(main)/(customer)/home' as any);
                        }
                      }
                    ]
                  );
                }
              }
            } catch (e) {
              console.warn('Nearest store suggestion skipped:', e);
            }
          }
        } else {
          console.log('⚠️ No stores found');
        }
      } catch (error) {
        console.error('❌ [StoresMap] Error loading stores:', error);
        Alert.alert('Error', 'Failed to load stores. Please try again.');
      } finally {
        console.log('🏁 [StoresMap] loadStores() finished, loading = false');
        setIsLoading(false);
      }
    };

    if (userLocation) {
      console.log('📍 [StoresMap] User location available, loading stores...');
      loadStores();
    } else if (!locationPermissionDenied) {
      console.log('⏳ [StoresMap] Waiting for user location...');
      // Still loading location
      setIsLoading(true);
    }
  }, [userLocation, locationPermissionDenied]);

  // Apply distance filter
  useEffect(() => {
    if (selectedFilter === 999) {
      setFilteredStores(stores);
    } else {
      const filtered = stores.filter(
        (store) => store.distance && store.distance <= selectedFilter
      );
      setFilteredStores(filtered);
    }
  }, [selectedFilter, stores]);

  const handleMarkerPress = (store: StoreLocation) => {
    if (!isMounted.current) return;
    // Clear route when selecting different store
    if (selectedStore?.id !== store.id) {
      setShowRoute(false);
      setRouteCoordinates([]);
      setRouteDistance(null);
      setRouteDuration(null);
    }
    setSelectedStore(store);
  };

  const handleNavigate = () => {
    if (!selectedStore) return;

    // Use platform-specific deep links to auto-start navigation
    const destination = `${selectedStore.coordinates.latitude},${selectedStore.coordinates.longitude}`;

    let url: string;

    if (Platform.OS === 'ios') {
      // iOS: Google Maps app with auto-start navigation
      url = `comgooglemaps://?daddr=${destination}&directionsmode=driving&navigate=1`;
      
      // Fallback to Apple Maps if Google Maps not installed
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Apple Maps with navigation
          Linking.openURL(`maps://?daddr=${destination}&dirflg=d`);
        }
      });
    } else {
      // Android: Google Maps with auto-start navigation
      url = `google.navigation:q=${destination}&mode=d`;
      
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web Google Maps
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
          );
        }
      });
    }
  };

  const handleShowRoute = async () => {
    if (!selectedStore || !userLocation || isLoadingRoute || !isMounted.current || !mapFullyLoaded) return;
    
    setIsLoadingRoute(true);
    
    try {
      // Static route using OSRM (free, no card needed)
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${selectedStore.coordinates.longitude},${selectedStore.coordinates.latitude}?overview=full&geometries=geojson`;
      
      // Implement timeout using AbortController (5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Route API failed');
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0 && isMounted.current) {
        const route = data.routes[0];
        
        // Convert coordinates (static, no updates)
        const coords = route.geometry.coordinates.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        
        if (isMounted.current && coords.length >= 2) {
          setRouteCoordinates(coords);
          setRouteDistance((route.distance / 1000).toFixed(2));
          setRouteDuration(Math.round(route.duration / 60).toString());
          
          // Wait a bit before showing polyline (prevents race condition)
          setTimeout(() => {
            if (isMounted.current) {
              setShowRoute(true);
              console.log('✅ Static route displayed');
            }
          }, 200);
        }
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('❌ Route error:', error);
      if (isMounted.current) {
        Alert.alert('Route Error', 'Could not calculate route. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingRoute(false);
      }
    }
  };


  const handleViewProducts = () => {
    if (!selectedStore) return;
    router.push({
      pathname: '/(main)/shared/store-details',
      params: { id: selectedStore.id },
    });
  };

  const handleSetMyStore = async () => {
    if (!selectedStore) return;
    try {
      await setSelectedStoreId(selectedStore.id, user?.id);
      Alert.alert('Store selected', `${selectedStore.storeName} set as your store.`);
      router.push('/(main)/(customer)/home' as any);
    } catch (e) {
      console.error('Failed setting selected store', e);
      Alert.alert('Error', 'Could not set your store. Please try again.');
    }
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current && isMounted.current) {
      // Just set region via state - safest way
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retrying map load...');
    setMapKey((prev) => prev + 1);
    setMapReady(false);
    setMapFullyLoaded(false);
    setShowRoute(false);
    setRouteCoordinates([]);
    setIsLoading(true);
  };

  const handleMapReady = () => {
    if (isMounted.current) {
      setMapFullyLoaded(true);
      console.log('✅ Google Maps fully loaded');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if ((isLoading || !mapReady) && !locationPermissionDenied) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3BB77E" />
        <Text style={styles.loadingText}>Loading stores map...</Text>
      </View>
    );
  }

  // Show permission denied screen
  if (locationPermissionDenied) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby Stores</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.permissionContainer}>
          <Ionicons name="location-outline" size={80} color="#CCC" />
          <Text style={styles.permissionTitle}>Location Permission Required</Text>
          <Text style={styles.permissionText}>
            TindaGo needs access to your location to show nearby stores and calculate distances.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => {
              setLocationPermissionDenied(false);
              setIsLoading(true);
              loadUserLocation();
            }}
          >
            <Ionicons name="location" size={20} color="#FFF" />
            <Text style={styles.permissionButtonText}>Allow Location Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.permissionButtonSecondary}
            onPress={() => Linking.openSettings()}
          >
            <Ionicons name="settings-outline" size={20} color="#3BB77E" />
            <Text style={styles.permissionButtonTextSecondary}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Stores</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={24} color="#3BB77E" />
        </TouchableOpacity>
      </View>

      {/* Distance Filter */}
      <View style={styles.filterContainer}>
        {DISTANCE_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.value && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.storeCount}>
          <Text style={styles.storeCountText}>{filteredStores.length} stores</Text>
        </View>
      </View>

      {/* Map with Error Boundary */}
      <MapErrorBoundary onRetry={handleRetry}>
        <MapView
          key={mapKey}
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
          loadingEnabled
          loadingIndicatorColor="#3BB77E"
          onMapReady={handleMapReady}
          moveOnMarkerPress={false}
        >
        {/* Store Markers - only show when map fully loaded */}
        {mapFullyLoaded && (() => {
          console.log(`📍 [Markers] Rendering ${filteredStores.length} markers. Map loaded: ${mapFullyLoaded}`);
          filteredStores.forEach(s => console.log(`  Marker: ${s.storeName} at ${s.coordinates.latitude}, ${s.coordinates.longitude}`));
          return null;
        })()}
        {mapFullyLoaded && filteredStores.map((store) => (
          <Marker
            key={store.id}
            coordinate={store.coordinates}
            onPress={() => handleMarkerPress(store)}
            title={store.storeName}
            description={store.distance ? `${store.distance.toFixed(2)} km away` : 'Distance unknown'}
            pinColor={
              !store.isOpen ? '#666666' : 
              store.status === 'pending' ? '#FF9500' : 
              '#E92B45'
            }
          />
        ))}
        
        {/* Static Route Polyline - only renders after map fully loaded */}
        {mapFullyLoaded && showRoute && routeCoordinates.length >= 2 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0066FF"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
        </MapView>
      </MapErrorBoundary>

      {/* Center on User Button */}
      {userLocation && (
        <TouchableOpacity style={styles.centerButton} onPress={handleCenterOnUser}>
          <Ionicons name="locate" size={24} color="#FFF" />
        </TouchableOpacity>
      )}


      {/* Store Info Card */}
      {selectedStore && (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            {selectedStore.logo ? (
              <Image source={{ uri: selectedStore.logo }} style={styles.infoLogo} />
            ) : (
              <View style={styles.infoLogoPlaceholder}>
                <Ionicons name="storefront" size={32} color="#3BB77E" />
              </View>
            )}
            <View style={styles.infoDetails}>
              <Text style={styles.infoStoreName}>{selectedStore.storeName}</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Text style={[styles.infoStatus, selectedStore.isOpen === false ? styles.closed : styles.open]}>
                  {selectedStore.isOpen === false ? 'Closed' : 'Open now'}
                </Text>
                {selectedStore.status === 'pending' && (
                  <Text style={styles.pendingBadge}>⌛ Pending Approval</Text>
                )}
              </View>
              <Text style={styles.infoAddress} numberOfLines={1}>
                {selectedStore.address}
              </Text>
              {!showRoute && selectedStore.distance !== undefined && (
                <Text style={styles.infoDistance}>
                  📍 {selectedStore.distance.toFixed(2)} km away
                </Text>
              )}
              {showRoute && routeDistance && routeDuration && (
                <Text style={styles.infoDistance}>
                  🚗 {routeDistance} km · {routeDuration} min (via road)
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => {
              setSelectedStore(null);
              setShowRoute(false);
              setRouteCoordinates([]);
            }}>
              <Ionicons name="close-circle" size={28} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons - 2x2 Grid Layout */}
          <View style={styles.infoActions}>
            {/* Row 1: Show Route + View Products */}
            <View style={styles.actionRow}>
              {!showRoute ? (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonNavigate]}
                  onPress={handleShowRoute}
                  disabled={isLoadingRoute || !mapFullyLoaded}
                >
                  {isLoadingRoute ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="map" size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>Show Route</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonNavigate]}
                  onPress={() => {
                    setShowRoute(false);
                    setRouteCoordinates([]);
                  }}
                >
                  <Ionicons name="close" size={18} color="#FFF" />
                  <Text style={styles.actionButtonText}>Hide Route</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleViewProducts}
              >
                <Ionicons name="cart" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>View Products</Text>
              </TouchableOpacity>
            </View>

            {/* Row 2: Navigate + Set as My Store */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonNavigate, selectedStore?.isOpen === false && { opacity: 0.6 }]} 
                onPress={handleNavigate} 
                disabled={selectedStore?.isOpen === false}
              >
                <Ionicons name="navigate" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleSetMyStore}
                disabled={selectedStore?.isOpen === false}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Set as My Store</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* No Stores Message */}
      {filteredStores.length === 0 && !isLoading && (
        <View style={styles.noStoresContainer}>
          <View style={styles.noStoresCard}>
            <Ionicons name="location-outline" size={48} color="#CCC" />
            <Text style={styles.noStoresTitle}>No stores nearby</Text>
            <Text style={styles.noStoresText}>
              Try increasing the distance filter or check back later
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F6',
  },
  loadingText: {
    marginTop: vs(10),
    fontSize: s(16),
    color: '#666',
    fontFamily: 'Clash Grotesk Variable',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(50),
    paddingBottom: vs(15),
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: s(20),
    fontWeight: '600',
    color: '#1E1E1E',
    fontFamily: 'Clash Grotesk Variable',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: s(15),
    paddingVertical: vs(10),
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: s(8),
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: s(20),
    backgroundColor: '#F4F6F6',
  },
  filterButtonActive: {
    backgroundColor: '#3BB77E',
  },
  filterText: {
    fontSize: s(14),
    color: '#666',
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
  },
  storeCount: {
    marginLeft: 'auto',
  },
  storeCountText: {
    fontSize: s(12),
    color: '#999',
    fontFamily: 'Clash Grotesk Variable',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E92B45',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  markerClosed: {
    backgroundColor: '#666',
  },
  markerPending: {
    backgroundColor: '#FF9500',
  },
  markerPin: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E92B45',
    marginTop: -2,
  },
  markerPinClosed: {
    borderTopColor: '#666',
  },
  markerPinPending: {
    borderTopColor: '#FF9500',
  },
  centerButton: {
    position: 'absolute',
    bottom: vs(220),
    right: s(20),
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    padding: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(15),
    gap: s(12),
  },
  infoLogo: {
    width: s(60),
    height: s(60),
    borderRadius: s(30),
  },
  infoLogoPlaceholder: {
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    backgroundColor: '#F4F6F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoDetails: {
    flex: 1,
  },
  infoStoreName: {
    fontSize: s(18),
    fontWeight: '600',
    color: '#1E1E1E',
    fontFamily: 'Clash Grotesk Variable',
    marginBottom: vs(4),
  },
  infoAddress: {
    fontSize: s(14),
    color: '#666',
    fontFamily: 'Clash Grotesk Variable',
    marginBottom: vs(2),
  },
  infoStatus: {
    fontSize: s(12),
    marginTop: vs(2),
  },
  open: { color: '#3BB77E', fontWeight: '600' },
  closed: { color: '#E92B45', fontWeight: '600' },
  pendingBadge: {
    fontSize: s(10),
    color: '#FF9500',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: s(4),
  },
  infoDistance: {
    fontSize: s(14),
    color: '#3BB77E',
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
  },
  infoActions: {
    flexDirection: 'column',
    gap: s(8),
  },
  actionRow: {
    flexDirection: 'row',
    gap: s(8),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(10),
    paddingVertical: vs(10),
    gap: s(4),
    minHeight: vs(42),
  },
  actionButtonPrimary: {
    backgroundColor: '#3BB77E',
  },
  actionButtonSecondary: {
    backgroundColor: '#F4F6F6',
  },
  actionButtonNavigate: {
    backgroundColor: '#0066FF',
  },
  actionButtonText: {
    fontSize: s(13),
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Clash Grotesk Variable',
  },
  actionButtonTextSecondary: {
    color: '#666',
  },
  noStoresContainer: {
    position: 'absolute',
    top: '40%',
    left: s(20),
    right: s(20),
  },
  noStoresCard: {
    backgroundColor: '#FFF',
    borderRadius: s(15),
    padding: s(30),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  noStoresTitle: {
    fontSize: s(20),
    fontWeight: '600',
    color: '#1E1E1E',
    fontFamily: 'Clash Grotesk Variable',
    marginTop: vs(15),
    marginBottom: vs(8),
  },
  noStoresText: {
    fontSize: s(14),
    color: '#666',
    fontFamily: 'Clash Grotesk Variable',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(40),
  },
  permissionTitle: {
    fontSize: s(22),
    fontWeight: '600',
    color: '#1E1E1E',
    fontFamily: 'Clash Grotesk Variable',
    marginTop: vs(20),
    marginBottom: vs(10),
    textAlign: 'center',
  },
  permissionText: {
    fontSize: s(16),
    color: '#666',
    fontFamily: 'Clash Grotesk Variable',
    textAlign: 'center',
    marginBottom: vs(30),
    lineHeight: s(24),
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3BB77E',
    paddingHorizontal: s(30),
    paddingVertical: vs(15),
    borderRadius: s(12),
    gap: s(10),
    marginBottom: vs(15),
  },
  permissionButtonText: {
    fontSize: s(16),
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Clash Grotesk Variable',
  },
  permissionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: s(30),
    paddingVertical: vs(15),
    borderRadius: s(12),
    gap: s(10),
    borderWidth: 2,
    borderColor: '#3BB77E',
  },
  permissionButtonTextSecondary: {
    fontSize: s(16),
    fontWeight: '600',
    color: '#3BB77E',
    fontFamily: 'Clash Grotesk Variable',
  },
});
