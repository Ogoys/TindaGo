/**
 * ENABLE LOCATION SCREEN
 * 
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1196-2259&m=dev
 * 
 * This screen prompts users to enable location services after signing in as a customer.
 * Features location permission request and navigation to the main app.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs, ms } from '../../src/constants/responsive';

export default function EnableLocationScreen() {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableLocation = async () => {
    try {
      setIsRequesting(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // Get current location to verify
        const location = await Location.getCurrentPositionAsync({});
        console.log('✅ Location enabled:', location);
        
        // Navigate to main customer screen
        router.replace('/(main)/(customer)/home');
      } else {
        Alert.alert(
          'Permission Denied',
          'Location access is required to show nearby stores. You can enable it later in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Go to Settings', 
              onPress: () => {
                // On iOS, open app settings
                if (Platform.OS === 'ios') {
                  Location.requestForegroundPermissionsAsync();
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      Alert.alert('Error', 'Failed to enable location services. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    // Navigate to main customer screen without location
    router.replace('/(main)/(customer)/home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* Main Content Container */}
      <View style={styles.contentContainer}>
        
        {/* Title */}
        <Text style={styles.title}>Allow access location</Text>

        {/* Description */}
        <Text style={styles.description}>
          Please enter your location or allow access to your location to find store near you
        </Text>

        {/* Location Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../src/assets/images/enable-location/location-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        
        {/* Allow Location Access Button */}
        <TouchableOpacity
          style={styles.allowButton}
          onPress={handleEnableLocation}
          activeOpacity={0.8}
          disabled={isRequesting}
        >
          <Text style={styles.allowButtonText}>
            {isRequesting ? 'Requesting...' : 'Allow location access'}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  contentContainer: {
    flex: 1,
    paddingTop: vs(60),
    paddingHorizontal: s(32),
  },

  // Title Text
  title: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(22),
    lineHeight: vs(30),
    color: '#000000',
    marginBottom: vs(12),
  },

  // Description Text
  description: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(14),
    lineHeight: vs(20),
    color: '#757575',
    marginBottom: vs(80),
  },

  // Location Illustration Container
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  illustration: {
    width: s(350),
    height: vs(350),
  },

  // Bottom Container
  bottomContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  // Allow Button
  allowButton: {
    width: '100%',
    height: vs(56),
    backgroundColor: Colors.primary,
    borderRadius: s(28),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(59, 183, 126, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },

  allowButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(16),
    color: '#FFFFFF',
  },
});
