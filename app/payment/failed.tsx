/**
 * Payment Failed Redirect Screen
 * 
 * This screen is shown when Xendit redirects back after failed payment.
 * It shows an error message and navigates back to the payment screen.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs } from '../../src/constants/responsive';

export default function PaymentFailedScreen() {
  const router = useRouter();

  const handleRetry = () => {
    // Go back to payment screen to retry
    router.replace('/(main)/(customer)/payment');
  };

  const handleGoHome = () => {
    router.replace('/(main)/(customer)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconX}>✕</Text>
          </View>
        </View>

        {/* Error Message */}
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>
          Your payment could not be processed.{'\n'}
          Please try again or use a different payment method.
        </Text>

        {/* Retry Button */}
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>

        {/* Home Button */}
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: s(40),
    width: '100%',
  },
  iconContainer: {
    marginBottom: vs(30),
  },
  iconCircle: {
    width: s(100),
    height: s(100),
    borderRadius: s(50),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconX: {
    fontSize: s(50),
    color: '#EF4444',
    fontWeight: 'bold',
  },
  title: {
    fontFamily: Fonts.primary,
    fontSize: s(24),
    fontWeight: '600',
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: vs(10),
  },
  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.6)',
    textAlign: 'center',
    lineHeight: s(20),
    marginBottom: vs(30),
  },
  retryButton: {
    width: '100%',
    maxWidth: s(300),
    height: vs(50),
    backgroundColor: Colors.primary,
    borderRadius: s(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.white,
  },
  homeButton: {
    width: '100%',
    maxWidth: s(300),
    height: vs(50),
    backgroundColor: Colors.white,
    borderRadius: s(10),
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.primary,
  },
});
