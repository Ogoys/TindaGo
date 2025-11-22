import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { s, vs, ms } from '../../../src/constants/responsive';
import { Colors } from '../../../src/constants/Colors';
import type { Order } from '../../../src/models/Order';
import { OrderProcessCompleteModal } from '../../../src/components/ui';

/**
 * TRACK STORE SCREEN
 * 
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1585&m=dev
 * 
 * Shows real-time map with customer and store locations, route visualization,
 * and order status timeline. Provides navigation to Google Maps.
 */

interface LatLng {
  latitude: number;
  longitude: number;
}

export default function TrackStoreScreen() {
  const params = useLocalSearchParams();
  const testMode = params.test === 'true'; // Enable test mode via ?test=true
  const orderId = testMode ? 'TEST-ORDER-001' : (params.orderId as string);
  const mapRef = useRef<MapView>(null);

  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerLocation, setCustomerLocation] = useState<LatLng | null>(null);
  const [storeLocation, setStoreLocation] = useState<LatLng | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  // Get customer location (or use mock data in test mode)
  useEffect(() => {
    if (testMode) {
      // Mock customer location (Davao City example)
      setCustomerLocation({
        latitude: 7.0731,
        longitude: 125.6128,
      });
      return;
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to show your position');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setCustomerLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get your location');
      }
    })();
  }, [testMode]);

  // Fetch order and store data (or use mock data in test mode)
  useEffect(() => {
    if (testMode) {
      // Mock order data for testing
      setOrder({
        id: 'TEST-ORDER-001',
        orderNumber: 'ORD-2025-001234',
        status: 'preparing',
        storeName: 'Sample Sari-Sari Store',
        storeId: 'test-store-123',
        total: 350.50,
        paymentStatus: 'paid',
        paymentMethod: 'gcash',
        xenditInvoiceId: 'XNDT-INV-2025-001234',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);

      // Mock store location (nearby Davao City)
      setStoreLocation({
        latitude: 7.0850,
        longitude: 125.6200,
      });

      setLoading(false);
      return;
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    const orderRef = ref(database, `orders/${orderId}`);
    const unsubscribe = onValue(orderRef, async (snapshot) => {
      if (snapshot.exists()) {
        const orderData = snapshot.val();
        setOrder({ ...orderData, id: orderId } as Order);

        // Show modal when order is completed (picked_up or completed status)
        // AND user hasn't given feedback yet (feedbackGiven is not true)
        const shouldShowModal = 
          (orderData.status === 'picked_up' || orderData.status === 'completed') && 
          !orderData.feedbackGiven && 
          !hasShownModal;
        
        if (shouldShowModal) {
          setTimeout(() => {
            setShowCompleteModal(true);
            setHasShownModal(true);
          }, 500); // Small delay for smooth transition
        }

        // Get store location
        if (orderData.storeId) {
          try {
            const storeRef = ref(database, `stores/${orderData.storeId}`);
            const storeSnap = await get(storeRef);

            if (storeSnap.exists()) {
              const storeData = storeSnap.val();
              if (storeData.location?.coordinates) {
                setStoreLocation({
                  latitude: storeData.location.coordinates.latitude,
                  longitude: storeData.location.coordinates.longitude,
                });
              }
            }
          } catch (error) {
            console.error('Error fetching store location:', error);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId, testMode, hasShownModal]);

  // Fit map to show both locations
  useEffect(() => {
    if (mapReady && customerLocation && storeLocation && mapRef.current) {
      mapRef.current.fitToCoordinates([customerLocation, storeLocation], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [mapReady, customerLocation, storeLocation]);

  // Show route between customer and store (SAME AS stores-map.tsx)
  const handleShowRoute = async () => {
    if (!customerLocation || !storeLocation || loadingRoute) {
      Alert.alert('Error', 'Locations not available');
      return;
    }

    // Toggle route if already loaded
    if (routeCoordinates.length > 0) {
      setShowRoute(!showRoute);
      return;
    }

    setLoadingRoute(true);

    try {
      // Static route using OSRM (free, no API key needed)
      const url = `https://router.project-osrm.org/route/v1/driving/${customerLocation.longitude},${customerLocation.latitude};${storeLocation.longitude},${storeLocation.latitude}?overview=full&geometries=geojson`;

      console.log('🔍 Requesting route:', url);

      // Implement timeout using AbortController (5 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ OSRM API response not OK:', response.status);
        throw new Error('Route API failed');
      }

      const data = await response.json();
      console.log('📍 OSRM Response:', data.code, data.routes?.length || 0, 'routes');

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        // Convert coordinates from [lng, lat] to {latitude, longitude}
        const coords = route.geometry.coordinates.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        console.log(`✅ Route calculated with ${coords.length} points`);

        if (coords.length >= 2) {
          setRouteCoordinates(coords);

          // Wait a bit before showing polyline (prevents race condition)
          setTimeout(() => {
            setShowRoute(true);
            console.log('✅ Route displayed on map');
          }, 200);
        }
      } else {
        console.error('❌ No valid route in response:', data);
        throw new Error('No route found');
      }
    } catch (error: any) {
      console.error('❌ Route error:', error.message || error);
      
      // Show user-friendly message
      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'Route calculation took too long. Please try again.');
      } else {
        Alert.alert('Route Error', 'Could not calculate route. Showing direct path.');
        
        // Fallback: straight line
        setRouteCoordinates([customerLocation, storeLocation]);
        setShowRoute(true);
      }
    } finally {
      setLoadingRoute(false);
    }
  };


  // Navigate to Google Maps with AUTO-START navigation
  const handleNavigate = () => {
    if (!storeLocation) {
      Alert.alert('Error', 'Store location not available');
      return;
    }

    // Use platform-specific deep links to auto-start navigation
    const destination = `${storeLocation.latitude},${storeLocation.longitude}`;
    const label = encodeURIComponent(order?.storeName || 'Store');

    let url: string;

    if (Platform.OS === 'ios') {
      // iOS: Apple Maps with auto-start navigation
      // OR Google Maps app if installed
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

  // Navigate to store details
  const handleViewProducts = () => {
    if (order?.storeId) {
      router.push(`/(main)/shared/store-details?storeId=${order.storeId}` as any);
    }
  };

  // Set as favorite store (placeholder)
  const handleSetFavoriteStore = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon!');
  };

  // Format time
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'Pending';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Render order timeline
  const renderTimeline = () => {
    if (!order) return null;

    const steps = [
      { status: 'pending', label: 'Order Placed', icon: '📋' },
      { status: 'preparing', label: 'Preparing Your Order', icon: '🛍️' },
      { status: 'ready', label: 'Ready for Pickup', icon: '✅' },
      { status: 'picked_up', label: 'Order Completed', icon: '📦' },
    ];

    const statusOrder = ['pending', 'preparing', 'ready', 'picked_up'];
    const currentIndex = statusOrder.indexOf(order.status);

    return (
      <View style={styles.timeline}>
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <View key={step.status} style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.timelineDot,
                    isCompleted && styles.timelineDotCompleted,
                    isActive && styles.timelineDotActive,
                  ]}
                />
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      isCompleted && styles.timelineLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineLabel,
                    isActive && styles.timelineLabelActive,
                    !isCompleted && styles.timelineLabelInactive,
                  ]}
                >
                  {step.icon} {step.label}
                </Text>
                <Text
                  style={[
                    styles.timelineTime,
                    !isCompleted && styles.timelineTimeInactive,
                  ]}
                >
                  {isCompleted ? formatTime(order.updatedAt) : 'Pending'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order tracking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Store</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          {customerLocation && storeLocation ? (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: customerLocation.latitude,
                longitude: customerLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onMapReady={() => setMapReady(true)}
            >
              {/* Customer Marker */}
              <Marker
                coordinate={customerLocation}
                title="Your Location"
                pinColor="blue"
              >
                <View style={styles.customerMarker}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
              </Marker>

              {/* Store Marker */}
              <Marker
                coordinate={storeLocation}
                title={order?.storeName || 'Store'}
                pinColor="red"
              >
                <View style={styles.storeMarker}>
                  <Ionicons name="storefront" size={20} color="#FFFFFF" />
                </View>
              </Marker>

              {/* Route Polyline */}
              {showRoute && routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#0066FF"
                  strokeWidth={4}
                />
              )}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.mapPlaceholderText}>Loading map...</Text>
            </View>
          )}
        </View>

        {/* Order Info Card */}
        <View style={styles.orderInfoCard}>
          <Text style={styles.orderStatusLabel}>Order is On Process</Text>
          <View style={styles.orderDetailsRow}>
            <View style={styles.orderDetailItem}>
              <Text style={styles.orderDetailLabel}>Order ID:</Text>
              <Text style={styles.orderDetailValue}>{order?.orderNumber || 'N/A'}</Text>
            </View>
            <View style={styles.orderDetailItem}>
              <Text style={styles.orderDetailLabel}>Payment:</Text>
              <View style={[
                styles.paymentBadge,
                order?.paymentStatus === 'paid'
                  ? styles.paymentBadgePaid
                  : styles.paymentBadgePending
              ]}>
                <Text style={[
                  styles.paymentBadgeText,
                  order?.paymentStatus === 'paid'
                    ? styles.paymentBadgeTextPaid
                    : styles.paymentBadgeTextPending
                ]}>
                  {order?.paymentStatus === 'paid'
                    ? 'Paid'
                    : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.orderDetailsRow}>
            <View style={styles.orderDetailItem}>
              <Text style={styles.orderDetailLabel}>Store:</Text>
              <Text style={styles.orderDetailValue}>{order?.storeName || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.orderDetailItem}>
            <Text style={styles.orderDetailLabel}>Transaction ID:</Text>
            <Text style={styles.orderDetailValue} numberOfLines={1} ellipsizeMode="tail">
              {order?.xenditInvoiceId || order?.id || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Action Buttons - Only Show Route and Navigate */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonBlue]}
            onPress={handleShowRoute}
            disabled={loadingRoute}
          >
            {loadingRoute ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="map-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {showRoute ? 'Hide Route' : 'Show Route'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonBlue]}
            onPress={handleNavigate}
          >
            <Ionicons name="navigate-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Navigate</Text>
          </TouchableOpacity>
        </View>

        {/* Order Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>Order Status</Text>
          {renderTimeline()}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            const targetOrderId = order?.id || orderId;
            if (testMode) {
              // In test mode, navigate to order-details with test=true
              router.push(`/(main)/(customer)/order-details?id=${targetOrderId}&test=true` as any);
            } else {
              router.push(`/(main)/(customer)/order-details?id=${targetOrderId}` as any);
            }
          }}
        >
          <Text style={styles.bottomButtonText}>Order View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Order Complete Modal */}
      <OrderProcessCompleteModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        orderId={order?.id || orderId}
      />
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  notificationButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    height: vs(350),
    backgroundColor: '#E0E0E0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },
  customerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  storeMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E92B45',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  orderInfoCard: {
    backgroundColor: '#FFFFFF',
    margin: s(20),
    marginTop: s(15),
    padding: s(20),
    borderRadius: s(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderStatusLabel: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#3BB77E',
    marginBottom: vs(15),
  },
  orderDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  orderDetailItem: {
    flex: 1,
  },
  orderDetailLabel: {
    fontSize: ms(13),
    color: '#666666',
    marginBottom: vs(4),
  },
  orderDetailValue: {
    fontSize: ms(15),
    fontWeight: '600',
    color: '#1E1E1E',
  },
  paymentBadge: {
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(8),
    alignSelf: 'flex-start',
  },
  paymentBadgePaid: {
    backgroundColor: 'rgba(52,199,89,0.15)',
  },
  paymentBadgePending: {
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  paymentBadgeText: {
    fontSize: ms(13),
    fontWeight: '700',
  },
  paymentBadgeTextPaid: {
    color: '#34C759',
  },
  paymentBadgeTextPending: {
    color: '#666666',
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: s(20),
    paddingBottom: s(15),
    gap: s(10),
  },
  actionButton: {
    flex: 1,
    height: vs(70),
    borderRadius: s(15),
    justifyContent: 'center',
    alignItems: 'center',
    gap: vs(5),
  },
  actionButtonBlue: {
    backgroundColor: '#0066FF',
  },
  actionButtonGreen: {
    backgroundColor: '#3BB77E',
  },
  actionButtonText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    padding: s(20),
    marginHorizontal: s(20),
    marginBottom: vs(100),
    borderRadius: s(15),
  },
  timelineTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: vs(20),
  },
  timeline: {
    gap: vs(10),
  },
  timelineItem: {
    flexDirection: 'row',
    gap: s(15),
  },
  timelineIconContainer: {
    alignItems: 'center',
  },
  timelineDot: {
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
  timelineDotCompleted: {
    backgroundColor: '#3BB77E',
    borderColor: '#3BB77E',
  },
  timelineDotActive: {
    backgroundColor: '#3BB77E',
    borderColor: '#3BB77E',
    width: s(20),
    height: s(20),
    borderRadius: s(10),
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: vs(5),
  },
  timelineLineCompleted: {
    backgroundColor: '#3BB77E',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: vs(10),
  },
  timelineLabel: {
    fontSize: ms(15),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(3),
  },
  timelineLabelActive: {
    color: '#3BB77E',
  },
  timelineLabelInactive: {
    color: '#999999',
  },
  timelineTime: {
    fontSize: ms(13),
    color: '#666666',
  },
  timelineTimeInactive: {
    color: '#CCCCCC',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomButton: {
    backgroundColor: '#3BB77E',
    height: vs(50),
    borderRadius: s(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
