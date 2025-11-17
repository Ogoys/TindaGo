import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { s, vs } from '@/constants/responsive';
import { StoreRegistrationService } from '@/services';
import LocationPicker from '@/components/maps/LocationPicker';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function EditStoreLocationScreen() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [existingLocation, setExistingLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing location from Firebase
  useEffect(() => {
    const loadExistingLocation = async () => {
      try {
        if (!auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const storeRef = ref(database, `stores/${userId}/location`);
        const snapshot = await get(storeRef);

        if (snapshot.exists()) {
          const locationData = snapshot.val();
          if (locationData.coordinates) {
            setExistingLocation({
              latitude: locationData.coordinates.latitude,
              longitude: locationData.coordinates.longitude,
            });
            setSelectedLocation({
              latitude: locationData.coordinates.latitude,
              longitude: locationData.coordinates.longitude,
              address: locationData.address || 'Loading address...',
            });
            console.log('📍 Loaded existing location:', locationData.coordinates);
          }
        } else {
          console.log('ℹ️ No existing location found');
        }
      } catch (error) {
        console.error('Error loading location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingLocation();
  }, []);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Location Required', 'Please select a location for your store.');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Error', 'Authentication required. Please sign in again.');
      router.push('/(auth)/signin');
      return;
    }

    setIsSaving(true);

    try {
      // Save location to Firebase
      await StoreRegistrationService.updateStoreLocation({
        coordinates: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        },
        address: selectedLocation.address,
        formattedAddress: selectedLocation.address,
        setAt: new Date(),
        setMethod: 'manual',
      });

      Alert.alert(
        'Location Updated!',
        'Your store location has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Store location updated:', selectedLocation);
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving store location:', error);

      let errorMessage = 'Failed to save store location. Please try again.';

      if (error.code === 'database/permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication.';
      } else if (error.code === 'database/network-error') {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Save Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (selectedLocation && existingLocation) {
      // Check if location changed
      const hasChanged =
        selectedLocation.latitude !== existingLocation.latitude ||
        selectedLocation.longitude !== existingLocation.longitude;

      if (hasChanged) {
        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Do you want to discard them?',
          [
            { text: 'Keep Editing', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => router.back() },
          ]
        );
        return;
      }
    }
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3BB77E" />
        <Text style={styles.loadingText}>Loading location...</Text>
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
        <View style={styles.backButton} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#0066FF" />
        <Text style={styles.infoText}>
          {existingLocation
            ? 'Drag the map to update your store location'
            : 'Set your store location so customers can find you'}
        </Text>
      </View>

      {/* Location Picker */}
      <View style={styles.mapContainer}>
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={existingLocation}
        />
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveLocation}
          disabled={isSaving || !selectedLocation}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>
                {existingLocation ? 'Update Location' : 'Save Location'}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: s(18),
    lineHeight: s(24),
    fontWeight: '600',
    color: '#1E1E1E',
    fontFamily: 'Clash Grotesk Variable',
    includeFontPadding: false,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    marginHorizontal: s(10),
    marginTop: vs(10),
    borderRadius: s(10),
    gap: s(10),
  },
  infoText: {
    flex: 1,
    fontSize: s(14),
    color: '#0066FF',
    fontFamily: 'Clash Grotesk Variable',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: s(10),
    marginVertical: vs(10),
    borderRadius: s(15),
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonContainer: {
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  saveButton: {
    backgroundColor: '#3BB77E',
    borderRadius: s(15),
    paddingVertical: vs(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },
  saveButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(18),
    color: '#FFFFFF',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
  },
});
