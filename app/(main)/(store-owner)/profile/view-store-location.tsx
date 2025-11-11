import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { s, vs } from '@/constants/responsive';

export default function ViewStoreLocationScreen() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load store location from Firebase
  useEffect(() => {
    const loadLocation = async () => {
      try {
        if (!auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const storeRef = ref(database, `stores/${userId}/location`);
        const snapshot = await get(storeRef);

        if (snapshot.exists()) {
          const locationData = snapshot.val();
          if (locationData.coordinates) {
            setLocation({
              latitude: locationData.coordinates.latitude,
              longitude: locationData.coordinates.longitude,
              address: locationData.address || 'Store Location',
            });
            console.log('📍 Loaded store location for viewing');
          }
        } else {
          console.log('⚠️ No location set for this store');
        }
      } catch (error) {
        console.error('Error loading location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocation();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push('/(main)/(store-owner)/profile/edit-store-location');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3BB77E" />
        <Text style={styles.loadingText}>Loading location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store Location</Text>
          <View style={styles.backButton} />
        </View>

        {/* No Location Set */}
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No Location Set</Text>
          <Text style={styles.emptyText}>
            You haven't set your store location yet
          </Text>
          <TouchableOpacity style={styles.setLocationButton} onPress={handleEdit}>
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <Text style={styles.setLocationButtonText}>Set Location</Text>
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
        <Text style={styles.headerTitle}>Store Location</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="pencil" size={20} color="#3BB77E" />
        </TouchableOpacity>
      </View>

      {/* Map (Read-Only) */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Store Marker */}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Store"
            description={location.address}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="storefront" size={32} color="#3BB77E" />
            </View>
          </Marker>
        </MapView>
      </View>

      {/* Address Card */}
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <Ionicons name="location" size={24} color="#3BB77E" />
          <Text style={styles.addressTitle}>Store Address</Text>
        </View>
        <Text style={styles.addressText}>{location.address}</Text>
        <Text style={styles.coordinatesText}>
          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
      </View>
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
  editButton: {
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
  mapContainer: {
    flex: 1,
    marginHorizontal: s(10),
    marginTop: vs(10),
    borderRadius: s(15),
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addressCard: {
    marginHorizontal: s(10),
    marginVertical: vs(10),
    backgroundColor: '#FFF',
    borderRadius: s(15),
    padding: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
    gap: s(8),
  },
  addressTitle: {
    fontSize: s(18),
    fontWeight: '600',
    color: '#1E1E1E',
    fontFamily: 'Clash Grotesk Variable',
  },
  addressText: {
    fontSize: s(16),
    color: '#1E1E1E',
    fontFamily: 'Clash Grotesk Variable',
    marginBottom: vs(5),
  },
  coordinatesText: {
    fontSize: s(14),
    color: '#999',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(40),
  },
  emptyTitle: {
    fontSize: s(24),
    fontWeight: '600',
    color: '#1E1E1E',
    fontFamily: 'Clash Grotesk Variable',
    marginTop: vs(20),
    marginBottom: vs(10),
  },
  emptyText: {
    fontSize: s(16),
    color: '#666',
    fontFamily: 'Clash Grotesk Variable',
    textAlign: 'center',
    marginBottom: vs(30),
  },
  setLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3BB77E',
    borderRadius: s(15),
    paddingVertical: vs(15),
    paddingHorizontal: s(30),
    gap: s(8),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },
  setLocationButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(18),
    color: '#FFFFFF',
  },
});
