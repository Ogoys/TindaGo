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
import MapView, { PROVIDER_GOOGLE, Marker, Region, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { database } from '@/lib/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { getDistance } from 'geolib';
import { s, vs } from '@/constants/responsive';

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
  const mapRef = useRef<MapView>(null);
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

  // Load user location
  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('❌ Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);
        setRegion({
          ...userCoords,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        console.log('📍 User location loaded:', userCoords);
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    };

    loadUserLocation();
  }, []);

  // Load all active stores with location
  useEffect(() => {
    const loadStores = async () => {
      try {
        setIsLoading(true);
        const storesRef = ref(database, 'stores');
        const snapshot = await get(storesRef);

        if (snapshot.exists()) {
          const storesData = snapshot.val();
          const storesList: StoreLocation[] = [];

          Object.keys(storesData).forEach((storeId) => {
            const store = storesData[storeId];

            // Only include active stores with location set
            if (
              store.status === 'active' &&
              store.location?.coordinates?.latitude &&
              store.location?.coordinates?.longitude
            ) {
              const storeLocation: StoreLocation = {
                id: storeId,
                storeName: store.businessInfo?.storeName || 'Unnamed Store',
                address: store.location.address || 'Address not available',
                coordinates: {
                  latitude: store.location.coordinates.latitude,
                  longitude: store.location.coordinates.longitude,
                },
                logo: store.businessInfo?.logo,
                isOpen: store.isOpen ?? true,
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
            }
          });

          // Sort by distance (closest first)
          storesList.sort((a, b) => (a.distance || 999) - (b.distance || 999));

          setStores(storesList);
          setFilteredStores(storesList);

          console.log(`✅ Loaded ${storesList.length} active stores with location`);
        } else {
          console.log('⚠️ No stores found');
        }
      } catch (error) {
        console.error('Error loading stores:', error);
        Alert.alert('Error', 'Failed to load stores. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userLocation) {
      loadStores();
    }
  }, [userLocation]);

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
    setSelectedStore(store);
    
    // Animate to store location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: store.coordinates.latitude,
        longitude: store.coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleNavigate = () => {
    if (!selectedStore) return;

    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${selectedStore.coordinates.latitude},${selectedStore.coordinates.longitude}`,
      android: `${scheme}${selectedStore.coordinates.latitude},${selectedStore.coordinates.longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleViewProducts = () => {
    if (!selectedStore) return;
    router.push({
      pathname: '/(main)/shared/store-details',
      params: { storeId: selectedStore.id },
    });
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3BB77E" />
        <Text style={styles.loadingText}>Loading stores map...</Text>
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
        <View style={styles.backButton} />
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

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Store Markers */}
        {filteredStores.map((store) => (
          <Marker
            key={store.id}
            coordinate={store.coordinates}
            onPress={() => handleMarkerPress(store)}
          >
            <View style={styles.markerContainer}>
              {store.logo ? (
                <Image source={{ uri: store.logo }} style={styles.markerLogo} />
              ) : (
                <Ionicons name="storefront" size={24} color="#3BB77E" />
              )}
              {!store.isOpen && <View style={styles.closedOverlay} />}
            </View>
          </Marker>
        ))}
      </MapView>

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
              <Text style={styles.infoAddress} numberOfLines={1}>
                {selectedStore.address}
              </Text>
              {selectedStore.distance !== undefined && (
                <Text style={styles.infoDistance}>
                  📍 {selectedStore.distance.toFixed(2)} km away
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setSelectedStore(null)}>
              <Ionicons name="close-circle" size={28} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
              <Ionicons name="navigate" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={handleViewProducts}
            >
              <Ionicons name="cart" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>View Products</Text>
            </TouchableOpacity>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#3BB77E',
  },
  markerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  closedOverlay: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  infoDistance: {
    fontSize: s(14),
    color: '#3BB77E',
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
  },
  infoActions: {
    flexDirection: 'row',
    gap: s(10),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066FF',
    borderRadius: s(12),
    paddingVertical: vs(12),
    gap: s(6),
  },
  actionButtonPrimary: {
    backgroundColor: '#3BB77E',
  },
  actionButtonText: {
    fontSize: s(16),
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Clash Grotesk Variable',
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
});
