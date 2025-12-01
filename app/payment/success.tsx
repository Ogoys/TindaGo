/**
 * Payment Success Redirect Screen
 * 
 * This screen is shown when Xendit redirects back after successful payment.
 * It checks if this is a purchase order payment (store-owner) or customer order,
 * and redirects accordingly.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ref, get, onValue, update } from 'firebase/database';
import { database, auth } from '../../FirebaseConfig';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs } from '../../src/constants/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderCompleteModal } from '../../src/components/ui/OrderCompleteModal';
import { DebtReminderScheduler } from '../../src/services/notifications/DebtReminderScheduler';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);

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
            pathname: '/(main)/(store-owner)/suppliers/purchase-details',
            params: { purchaseOrderId: pendingPurchaseOrderId }
          });
          return;
        }

        // Check for customer order payment
        console.log('[Payment Success] Checking for pending customer order');
        const pendingOrderKey = `pending_customer_order_${currentUser.uid}`;
        const pendingOrderData = await AsyncStorage.getItem(pendingOrderKey);
        
        if (pendingOrderData) {
          const { orderId, orderNumber, isDebtSettlement } = JSON.parse(pendingOrderData);
          console.log('[Payment Success] Found pending order:', orderId, orderNumber, 'isDebtSettlement:', isDebtSettlement);
          
          // Listen for payment status update (webhook might still be processing)
          const orderRef = ref(database, `orders/${orderId}`);
          const unsubscribe = onValue(orderRef, async (snapshot) => {
            if (snapshot.exists()) {
              const orderData = snapshot.val();
              console.log('[Payment Success] Order status:', orderData.paymentStatus);
              
              if (orderData.paymentStatus === 'PAID' || orderData.paymentStatus === 'SETTLED') {
                console.log('[Payment Success] Payment confirmed!');

                // ✅ For debt settlement, ensure debt status is updated BEFORE navigating
                if (isDebtSettlement) {
                  console.log('[Payment Success] Debt settlement - updating debt status');
                  try {
                    await update(orderRef, {
                      debtStatus: 'paid',
                      debtPaidDate: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });

                    // ✅ Cancel all scheduled debt reminders
                    await DebtReminderScheduler.cancelReminders(orderId);
                    console.log('[Payment Success] Debt status updated to paid and reminders cancelled');
                  } catch (error) {
                    console.error('[Payment Success] Error updating debt status:', error);
                  }
                }

                // Clear pending order
                await AsyncStorage.removeItem(pendingOrderKey);
                // Stop listening
                unsubscribe();

                // ✅ Check if this is debt settlement or new order
                if (isDebtSettlement) {
                  // Debt settlement - redirect to debt-details
                  console.log('[Payment Success] Debt settlement - redirecting to debt-details');
                  router.replace({
                    pathname: '/(main)/(customer)/profile/debt-details',
                    params: { orderId }
                  });
                } else {
                  // New order - show OrderCompleteModal
                  console.log('[Payment Success] New order - showing OrderCompleteModal');
                  setCompletedOrderId(orderId);
                  setShowOrderModal(true);
                  setIsCheckingPayment(false);
                }
              }
            }
          });
          
          // Timeout after 30 seconds
          setTimeout(async () => {
            unsubscribe();
            await AsyncStorage.removeItem(pendingOrderKey);
            
            if (isDebtSettlement) {
              // Debt settlement - redirect to debt-details
              router.replace({
                pathname: '/(main)/(customer)/profile/debt-details',
                params: { orderId }
              });
            } else {
              // New order - show modal anyway
              setCompletedOrderId(orderId);
              setShowOrderModal(true);
              setIsCheckingPayment(false);
            }
          }, 30000);
        } else {
          console.log('[Payment Success] No pending order found - redirecting to home');
          // No pending order, just go home
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

  const handleCloseModal = () => {
    setShowOrderModal(false);
    // Navigate to home after modal closes
    router.replace('/(main)/(customer)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isCheckingPayment && (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.title}>Payment Processing</Text>
            <Text style={styles.subtitle}>
              Please wait while we confirm your payment...
            </Text>
          </>
        )}
      </View>
      
      {/* Order Complete Modal */}
      <OrderCompleteModal
        visible={showOrderModal}
        onClose={handleCloseModal}
        orderId={completedOrderId}
      />
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
