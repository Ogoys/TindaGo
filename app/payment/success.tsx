/**
 * Payment Success Redirect Screen
 * 
 * This screen is shown when Xendit redirects back after successful payment.
 * It navigates back to the customer home page since the payment listener
 * on the payment screen will handle showing the OrderCompleteModal.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs } from '../../src/constants/responsive';

export default function PaymentSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    // Wait a moment for any animations, then navigate back
    const timer = setTimeout(() => {
      // Navigate back to customer home - the payment listener will show the modal
      router.replace('/(main)/(customer)/home');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.title}>Payment Processing</Text>
        <Text style={styles.subtitle}>
          Please wait while we confirm your payment...
        </Text>
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
  },
  title: {
    marginTop: vs(20),
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '600',
    color: Colors.darkGray,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: vs(10),
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.6)',
    textAlign: 'center',
    lineHeight: s(20),
  },
});
