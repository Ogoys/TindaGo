import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { auth } from '@/lib/firebase';
import { s, vs } from '@/constants/responsive';
import { StoreRegistrationService } from '@/services';
import LocationPicker from '@/components/maps/LocationPicker';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function SetStoreLocationScreen() {
  // Get params from previous screen
  const { storeName, ownerName, ownerEmail } = useLocalSearchParams<{
    storeName?: string;
    ownerName?: string;
    ownerEmail?: string;
  }>();

  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const handleConfirmLocation = async () => {
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
        setMethod: 'manual', // Can be 'gps' if they used the GPS button
      });

      Alert.alert(
        'Location Saved!',
        'Your store location has been saved successfully. Next, add your bank details.',
        [
          {
            text: 'Continue to Bank Details',
            onPress: () => {
              console.log('Store location saved at:', selectedLocation);
              router.push({
                pathname: '/(auth)/(store-owner)/BankDetails',
                params: {
                  storeName: storeName || '',
                  ownerName: ownerName || '',
                  ownerEmail: ownerEmail || '',
                },
              });
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

  const handleSkip = () => {
    Alert.alert(
      'Skip Location?',
      'You can add your store location later from your profile settings. However, customers won\'t be able to find your store on the map until you do.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip for Now',
          style: 'destructive',
          onPress: () => {
            router.push({
              pathname: '/(auth)/(store-owner)/BankDetails',
              params: {
                storeName: storeName || '',
                ownerName: ownerName || '',
                ownerEmail: ownerEmail || '',
              },
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background with purple gradient */}
      <View style={styles.backgroundContainer}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.subtitleText}>Register to create an account</Text>

          {/* Number 3 illustration */}
          <Image
            source={require('../../../src/assets/images/store-registration/logo-number-4.png')}
            style={styles.illustration}
          />
        </View>

        {/* White Card Container */}
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.registerTitle}>Register</Text>

            {/* Progress Line - Step 3 */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentCurrent]} />
              <View style={[styles.progressSegment, styles.progressSegmentInactive]} />
            </View>

            <Text style={styles.sectionLabel}>Set Store Location</Text>
            <Text style={styles.sectionSubtitle}>
              Pin your store location so customers can find you on the map
            </Text>
          </View>

          {/* Location Picker (Full remaining space) */}
          <View style={styles.mapContainer}>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={undefined}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.confirmButton, isSaving && styles.confirmButtonDisabled]}
              onPress={handleConfirmLocation}
              disabled={isSaving || !selectedLocation}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#652A70',
  },
  backgroundContainer: {
    flex: 1,
  },

  // Top Section
  topSection: {
    height: vs(150),
    position: 'relative',
  },

  getStartedText: {
    position: 'absolute',
    left: s(22),
    top: vs(84),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(24),
    lineHeight: vs(22),
    color: '#FFFFFF',
  },

  subtitleText: {
    position: 'absolute',
    left: s(20),
    top: vs(106),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(14),
    lineHeight: vs(22),
    color: 'rgba(255, 255, 255, 0.5)',
  },

  illustration: {
    position: 'absolute',
    left: s(329),
    top: vs(45),
    width: s(100),
    height: vs(100),
  },

  // White Card Container
  cardContainer: {
    flex: 1,
    backgroundColor: '#F4F6F6',
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    marginTop: vs(150),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Header Section
  header: {
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(10),
    backgroundColor: '#F4F6F6',
  },

  registerTitle: {
    textAlign: 'center',
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: vs(22),
    color: '#000000',
    marginBottom: vs(20),
  },

  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(20),
  },

  progressSegment: {
    width: s(88),
    height: s(4),
    borderRadius: s(2),
  },

  progressSegmentActive: {
    backgroundColor: '#02545F',
  },

  progressSegmentCurrent: {
    backgroundColor: '#3BB77E',
  },

  progressSegmentInactive: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },

  sectionLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: vs(22),
    color: '#1E1E1E',
    marginBottom: vs(5),
  },

  sectionSubtitle: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(14),
    lineHeight: vs(18),
    color: '#666',
  },

  // Map Container
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

  // Button Container
  buttonContainer: {
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    backgroundColor: '#F4F6F6',
  },

  confirmButton: {
    backgroundColor: '#3BB77E',
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
    marginBottom: vs(10),
  },

  confirmButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: vs(22),
    color: '#FFFFFF',
  },

  confirmButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
  },

  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(20),
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  skipButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(18),
    lineHeight: vs(22),
    color: '#02545F',
  },
});
