import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getAddressFromCoordinates,
  validateCoordinates,
  formatCoordinates,
} from '../../utils/geocoding';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

const DAVAO_CITY_DEFAULT = {
  latitude: 7.0731,
  longitude: 125.6128,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) {
  const [region, setRegion] = useState<Region>({
    ...DAVAO_CITY_DEFAULT,
    ...(initialLocation && {
      latitude: initialLocation.latitude,
      longitude: initialLocation.longitude,
    }),
  });

  const [centerCoords, setCenterCoords] = useState({
    latitude: initialLocation?.latitude || DAVAO_CITY_DEFAULT.latitude,
    longitude: initialLocation?.longitude || DAVAO_CITY_DEFAULT.longitude,
  });

  const [address, setAddress] = useState<string>('Loading address...');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  // Fetch address whenever center coordinates change
  useEffect(() => {
    let isMounted = true;

    const fetchAddress = async () => {
      if (!validateCoordinates(centerCoords.latitude, centerCoords.longitude)) {
        setAddress('Invalid coordinates');
        return;
      }

      setIsLoadingAddress(true);
      const fetchedAddress = await getAddressFromCoordinates(
        centerCoords.latitude,
        centerCoords.longitude
      );

      if (isMounted) {
        setAddress(fetchedAddress);
        setIsLoadingAddress(false);

        // Notify parent component
        onLocationSelect({
          ...centerCoords,
          address: fetchedAddress,
        });
      }
    };

    // Debounce address fetching (wait 500ms after user stops moving map)
    const timer = setTimeout(fetchAddress, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [centerCoords]);

  // Update center coordinates when region changes
  const handleRegionChangeComplete = (newRegion: Region) => {
    setCenterCoords({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });
  };

  // Get user's GPS location
  const handleUseMyLocation = async () => {
    try {
      setIsLoadingGPS(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.'
        );
        setIsLoadingGPS(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Update map region and center
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005, // Zoom in closer
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      setCenterCoords({ latitude, longitude });
      setIsLoadingGPS(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location. Please try again.');
      setIsLoadingGPS(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* Fixed Center Pin */}
      <View style={styles.centerMarker} pointerEvents="none">
        <MaterialIcons name="place" size={48} color="#E53E3E" />
      </View>

      {/* Address Display Card */}
      <View style={styles.addressCard}>
        {isLoadingAddress ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0066FF" />
            <Text style={styles.loadingText}>Fetching address...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.addressLabel}>Selected Location:</Text>
            <Text style={styles.addressText}>{address}</Text>
            <Text style={styles.coordinatesText}>
              {formatCoordinates(centerCoords.latitude, centerCoords.longitude)}
            </Text>
          </>
        )}
      </View>

      {/* GPS Button */}
      <TouchableOpacity
        style={styles.gpsButton}
        onPress={handleUseMyLocation}
        disabled={isLoadingGPS}
      >
        {isLoadingGPS ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <MaterialIcons name="my-location" size={24} color="#FFF" />
        )}
      </TouchableOpacity>

      {/* Help Text */}
      <View style={styles.helpCard}>
        <MaterialIcons name="info-outline" size={20} color="#666" />
        <Text style={styles.helpText}>Drag the map to adjust pin location</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  gpsButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  helpCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
  },
});
