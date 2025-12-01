/**
 * Payment Failed Redirect Screen
 * 
 * This screen is shown when Xendit redirects back after failed payment.
 * It shows an error message and navigates back to the payment screen.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../FirebaseConfig';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs } from '../../src/constants/responsive';

export default function PaymentFailedScreen() {
  const router = useRouter();
  const [isPurchaseOrder, setIsPurchaseOrder] = useState(false);
  const [purchaseOrderId, setPurchaseOrderId] = useState<string | null>(null);
  const [isDebtSettlement, setIsDebtSettlement] = useState(false);
  const [customerOrderId, setCustomerOrderId] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentType = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Check if this is a purchase order payment
        const pendingNavKey = `pending_purchase_order_navigation_${currentUser.uid}`;
        const pendingPurchaseOrderId = await AsyncStorage.getItem(pendingNavKey);
        
        if (pendingPurchaseOrderId) {
          console.log('[Payment Failed] Purchase order payment detected');
          setIsPurchaseOrder(true);
          setPurchaseOrderId(pendingPurchaseOrderId);
          // Clear the pending navigation
          await AsyncStorage.removeItem(pendingNavKey);
          return;
        }

        // Check if this is a customer order payment (or debt settlement)
        const pendingOrderKey = `pending_customer_order_${currentUser.uid}`;
        const pendingOrderData = await AsyncStorage.getItem(pendingOrderKey);
        
        if (pendingOrderData) {
          const { orderId, isDebtSettlement: isDebt } = JSON.parse(pendingOrderData);
          console.log('[Payment Failed] Customer order payment detected, isDebtSettlement:', isDebt);
          setCustomerOrderId(orderId);
          setIsDebtSettlement(isDebt || false);
          // Clear the pending order
          await AsyncStorage.removeItem(pendingOrderKey);
        }
      } catch (error) {
        console.error('[Payment Failed] Error checking payment type:', error);
      }
    };

    checkPaymentType();
  }, []);

  const handleRetry = () => {
    if (isPurchaseOrder && purchaseOrderId) {
      // Navigate to purchase details where they can retry payment
      router.replace({
        pathname: '/(main)/(store-owner)/suppliers/purchase-details',
        params: { purchaseOrderId }
      });
    } else if (isDebtSettlement && customerOrderId) {
      // Navigate back to debt details to retry payment
      router.replace({
        pathname: '/(main)/(customer)/profile/debt-details',
        params: { orderId: customerOrderId }
      });
    } else {
      // Go back to customer payment screen to retry
      router.replace('/(main)/(customer)/payment');
    }
  };

  const handleGoHome = () => {
    if (isPurchaseOrder) {
      // Navigate to suppliers/purchase orders page
      router.replace('/(main)/(store-owner)/suppliers');
    } else if (isDebtSettlement) {
      // Navigate to debt history page
      router.replace('/(main)/(customer)/profile/debt-history');
    } else {
      router.replace('/(main)/(customer)/home');
    }
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
          <Text style={styles.retryButtonText}>
            {isPurchaseOrder 
              ? 'View Purchase Order' 
              : isDebtSettlement 
                ? 'View Debt Details' 
                : 'Try Again'}
          </Text>
        </TouchableOpacity>

        {/* Home Button */}
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>
            {isPurchaseOrder 
              ? 'Back to Suppliers' 
              : isDebtSettlement 
                ? 'Back to Debt History' 
                : 'Back to Home'}
          </Text>
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
