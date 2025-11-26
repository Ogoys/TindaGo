/**
 * Payment Success Redirect Screen
 * 
 * This screen is shown when Xendit redirects back after successful payment.
 * It checks if this is a purchase order payment (store-owner) or customer order,
 * and redirects accordingly.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs } from '../../src/constants/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../FirebaseConfig';

export default function PaymentSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('[Payment Success] No user authenticated - redirecting to onboarding');
          router.replace('/(auth)/onboarding');
          return;
        }

        // Check if this is a purchase order payment (store-owner)
        const pendingNavKey = `pending_purchase_order_navigation_${currentUser.uid}`;
        const pendingPurchaseOrderId = await AsyncStorage.getItem(pendingNavKey);
        
        if (pendingPurchaseOrderId) {
          console.log('[Payment Success] Purchase order payment detected - redirecting to purchase details');
          console.log('[Payment Success] Purchase Order ID:', pendingPurchaseOrderId);
          
          // Clear the pending navigation
          await AsyncStorage.removeItem(pendingNavKey);
          
          // Redirect to store-owner purchase details page
          router.replace({
            pathname: '/(main)/(store-owner)/profile/purchase-details',
            params: { purchaseOrderId: pendingPurchaseOrderId }
          });
        } else {
          console.log('[Payment Success] Customer order payment - redirecting to customer home');
          // Navigate back to customer home - the payment listener will show the modal
          router.replace('/(main)/(customer)/home');
        }
      } catch (error) {
        console.error('[Payment Success] Error handling redirect:', error);
        // Fallback to customer home
        router.replace('/(main)/(customer)/home');
      }
    };

    // Wait a moment for any animations, then navigate
    const timer = setTimeout(() => {
      handleRedirect();
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
