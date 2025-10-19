/**
 * PAYMENT SCREEN - COMPLETE INTEGRATION EXAMPLE
 *
 * This is a complete example showing how to integrate OrderErrorModal
 * into the payment screen with proper error handling, retry logic,
 * and state management.
 *
 * Copy relevant sections to your actual payment.tsx file.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ref, get, set, push } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { useUser } from '../../../src/contexts/UserContext';
import { Colors } from '../../../src/constants/Colors';
import { Fonts } from '../../../src/constants/Fonts';
import { s, vs } from '../../../src/constants/responsive';
import { OrderCompleteModal, OrderErrorModal } from '../../../src/components/ui';

type PaymentMethod = 'gcash' | 'paymaya' | 'cash' | null;

interface OrderSummary {
  items: number;
  subtotal: number;
  serviceFee: number;
  discount: number;
  grandTotal: number;
}

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  storeId: string;
  storeName: string;
}

const PaymentScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Order summary state
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    items: 0,
    subtotal: 0,
    serviceFee: 0,
    discount: 0,
    grandTotal: 0,
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);

  // Load order summary from cart
  useEffect(() => {
    loadOrderSummary();
  }, [user]);

  const loadOrderSummary = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Load cart items from Firebase
      const cartRef = ref(database, `carts/${user.id}/items`);
      const snapshot = await get(cartRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const items: CartItem[] = Object.values(data);

        setCartItems(items);

        const itemCount = items.length;
        const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const serviceFee = subtotal * 0.05; // 5% service fee
        const discount = 0; // Will be calculated based on user type (senior/PWD)

        setOrderSummary({
          items: itemCount,
          subtotal,
          serviceFee,
          discount,
          grandTotal: subtotal + serviceFee - discount,
        });
      }
    } catch (error) {
      console.error('Error loading order summary:', error);
      setPaymentError('Failed to load order details.\nPlease try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
  };

  /**
   * Create order in Firebase
   * Returns orderId on success, null on failure
   */
  const createOrder = async (
    userId: string,
    summary: OrderSummary,
    paymentMethod: PaymentMethod
  ): Promise<string | null> => {
    try {
      // Create order in Firebase Realtime Database
      const ordersRef = ref(database, 'orders');
      const newOrderRef = push(ordersRef);
      const newOrderId = newOrderRef.key;

      if (!newOrderId) {
        throw new Error('Failed to generate order ID');
      }

      const orderData = {
        orderId: newOrderId,
        userId: userId,
        items: cartItems,
        summary: summary,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save order to Firebase
      await set(newOrderRef, orderData);

      // Clear cart after successful order
      const cartRef = ref(database, `carts/${userId}/items`);
      await set(cartRef, null);

      return newOrderId;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  };

  /**
   * Process GCash payment
   * This is a placeholder - implement actual GCash API integration
   */
  const processGCashPayment = async (summary: OrderSummary): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      // TODO: Implement actual GCash API integration
      // For now, simulate a payment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate 70% success rate for testing
      const success = Math.random() > 0.3;

      if (success) {
        const orderId = await createOrder(user!.id, summary, 'gcash');
        if (orderId) {
          return { success: true, orderId };
        } else {
          return { success: false, error: 'Failed to create order after payment' };
        }
      } else {
        return { success: false, error: 'GCash payment declined' };
      }
    } catch (error) {
      return { success: false, error: 'GCash connection failed' };
    }
  };

  /**
   * Process PayMaya payment
   * This is a placeholder - implement actual PayMaya API integration
   */
  const processPayMayaPayment = async (summary: OrderSummary): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      // TODO: Implement actual PayMaya API integration
      // For now, simulate a payment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate 70% success rate for testing
      const success = Math.random() > 0.3;

      if (success) {
        const orderId = await createOrder(user!.id, summary, 'paymaya');
        if (orderId) {
          return { success: true, orderId };
        } else {
          return { success: false, error: 'Failed to create order after payment' };
        }
      } else {
        return { success: false, error: 'PayMaya payment declined' };
      }
    } catch (error) {
      return { success: false, error: 'PayMaya connection failed' };
    }
  };

  /**
   * Main checkout handler with complete error handling
   */
  const handleProceedToCheckout = async () => {
    // Validation
    if (!selectedPayment) {
      Alert.alert('Select Payment Method', 'Please select a payment method to continue');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to continue');
      router.push('/(auth)/signin');
      return;
    }

    if (cartItems.length === 0) {
      setPaymentError('Your cart is empty.\nPlease add items before checkout.');
      setShowErrorModal(true);
      return;
    }

    setProcessing(true);

    try {
      if (selectedPayment === 'cash') {
        // Cash on Pickup - create order directly
        const newOrderId = await createOrder(user.id, orderSummary, 'cash');

        if (newOrderId) {
          setOrderId(newOrderId);
          setShowCompleteModal(true);
        } else {
          setPaymentError('Failed to create your order.\nPlease try again.');
          setShowErrorModal(true);
        }
      } else if (selectedPayment === 'gcash') {
        // GCash payment flow
        const result = await processGCashPayment(orderSummary);

        if (result.success && result.orderId) {
          setOrderId(result.orderId);
          setShowCompleteModal(true);
        } else {
          // Handle specific GCash errors
          if (result.error === 'GCash payment declined') {
            setPaymentError('GCash payment declined.\nPlease check your account balance.');
          } else if (result.error === 'GCash connection failed') {
            setPaymentError('Unable to connect to GCash.\nPlease check your internet connection.');
          } else {
            setPaymentError('GCash payment failed.\nPlease try again or use a different payment method.');
          }
          setShowErrorModal(true);
        }
      } else if (selectedPayment === 'paymaya') {
        // PayMaya payment flow
        const result = await processPayMayaPayment(orderSummary);

        if (result.success && result.orderId) {
          setOrderId(result.orderId);
          setShowCompleteModal(true);
        } else {
          // Handle specific PayMaya errors
          if (result.error === 'PayMaya payment declined') {
            setPaymentError('PayMaya payment declined.\nPlease check your account balance.');
          } else if (result.error === 'PayMaya connection failed') {
            setPaymentError('Unable to connect to PayMaya.\nPlease check your internet connection.');
          } else {
            setPaymentError('PayMaya payment failed.\nPlease try again or use a different payment method.');
          }
          setShowErrorModal(true);
        }
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);

      // Handle network errors
      if (error.message?.includes('network') || error.message?.includes('connection')) {
        setPaymentError('Network error occurred.\nPlease check your internet connection.');
      }
      // Handle Firebase errors
      else if (error.code === 'PERMISSION_DENIED') {
        setPaymentError('Access denied.\nPlease sign in and try again.');
      } else if (error.code === 'UNAVAILABLE') {
        setPaymentError('Service temporarily unavailable.\nPlease try again later.');
      }
      // Generic error
      else {
        setPaymentError('An unexpected error occurred.\nPlease try again.');
      }

      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Retry payment after error
   */
  const handleRetryPayment = () => {
    // Reset error state
    setPaymentError(undefined);
    // Retry the payment with same selected method
    handleProceedToCheckout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Image
              source={require('../../../src/assets/images/payment/chevron-left.png')}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Payment</Text>

          <TouchableOpacity style={styles.notificationButton}>
            <Image
              source={require('../../../src/assets/images/payment/notification-icon.png')}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading order summary...</Text>
          </View>
        ) : (
          <>
            {/* Bill Card */}
            <View style={styles.billCard}>
              <View style={styles.billCardBackground}>
                <Image
                  source={require('../../../src/assets/images/payment/bill-card-background.png')}
                  style={styles.billCardBackgroundImage}
                  resizeMode="cover"
                />
              </View>

              {/* Item count */}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item</Text>
                <Text style={styles.billValue}>{orderSummary.items}</Text>
              </View>

              {/* Sub Total */}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Sub Total</Text>
                <Text style={styles.billValue}>₱ {orderSummary.subtotal.toFixed(2)}</Text>
              </View>

              {/* Service Fee */}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Service Fee</Text>
                <Text style={styles.billValue}>₱ {orderSummary.serviceFee.toFixed(2)}</Text>
              </View>

              {/* Discount */}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Discount (20%)</Text>
                <Text style={styles.billValue}>₱ {orderSummary.discount.toFixed(2)}</Text>
              </View>

              {/* Discount Note */}
              <Text style={styles.discountNote}>
                Discount depend on what you are{'\n'}senior of pwd.
              </Text>

              {/* Dotted Line */}
              <View style={styles.dottedLine} />

              {/* Grand Total */}
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>₱ {orderSummary.grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* Payment Methods Label */}
            <Text style={styles.paymentMethodsLabel}>Credit /Debit Card</Text>

            {/* Payment Methods */}
            <View style={styles.paymentMethodsContainer}>
              {/* GCash */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'gcash' && styles.paymentOptionSelected
                ]}
                onPress={() => handlePaymentMethodSelect('gcash')}
              >
                <View style={styles.paymentOptionContent}>
                  <Image
                    source={require('../../../src/assets/images/payment/gcash-icon.png')}
                    style={styles.paymentIcon}
                  />
                  <Text style={styles.paymentMethodText}>GCash</Text>
                </View>
                <View style={[
                  styles.radioCircle,
                  selectedPayment === 'gcash' && styles.radioCircleSelected
                ]}>
                  {selectedPayment === 'gcash' && <View style={styles.radioCircleInner} />}
                </View>
              </TouchableOpacity>

              {/* PayMaya */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'paymaya' && styles.paymentOptionSelected
                ]}
                onPress={() => handlePaymentMethodSelect('paymaya')}
              >
                <View style={styles.paymentOptionContent}>
                  <Image
                    source={require('../../../src/assets/images/payment/paypal-icon.png')}
                    style={styles.paymentIcon}
                  />
                  <Text style={styles.paymentMethodText}>PayMaya</Text>
                </View>
                <View style={[
                  styles.radioCircle,
                  selectedPayment === 'paymaya' && styles.radioCircleSelected
                ]}>
                  {selectedPayment === 'paymaya' && <View style={styles.radioCircleInner} />}
                </View>
              </TouchableOpacity>

              {/* Cash on Pickup */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPayment === 'cash' && styles.paymentOptionSelected
                ]}
                onPress={() => handlePaymentMethodSelect('cash')}
              >
                <View style={styles.paymentOptionContent}>
                  <Image
                    source={require('../../../src/assets/images/payment/cash-icon.png')}
                    style={styles.paymentIcon}
                  />
                  <Text style={styles.paymentMethodText}>Cash on Pickup</Text>
                </View>
                <View style={[
                  styles.radioCircle,
                  selectedPayment === 'cash' && styles.radioCircleSelected
                ]}>
                  {selectedPayment === 'cash' && <View style={styles.radioCircleInner} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Spacer for bottom button */}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

      {/* Proceed to Checkout Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (!selectedPayment || processing) && styles.proceedButtonDisabled
          ]}
          onPress={handleProceedToCheckout}
          disabled={!selectedPayment || processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.proceedButtonText}>Proceed to Checkout</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Order Complete Modal */}
      <OrderCompleteModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        orderId={orderId}
      />

      {/* Order Error Modal */}
      <OrderErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={handleRetryPayment}
        errorMessage={paymentError}
      />
    </SafeAreaView>
  );
};

// Styles remain the same as original payment.tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(20),
  },
  backButton: {
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  chevronIcon: {
    width: s(15),
    height: vs(15),
  },
  headerTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: s(22),
  },
  notificationButton: {
    width: s(40),
    height: vs(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  notificationIcon: {
    width: s(25),
    height: vs(25),
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: vs(100),
  },
  loadingText: {
    marginTop: vs(15),
    fontSize: s(16),
    fontWeight: '500',
    color: Colors.textSecondary,
    fontFamily: Fonts.primary,
  },
  billCard: {
    marginHorizontal: s(20),
    marginTop: vs(15),
    marginBottom: vs(20),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  billCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  billCardBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(17),
  },
  billLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: s(17),
  },
  billValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: s(17),
  },
  discountNote: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: s(15),
    marginBottom: vs(20),
  },
  dottedLine: {
    height: vs(2),
    backgroundColor: Colors.textSecondary,
    marginBottom: vs(20),
    opacity: 0.3,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: '#FF8D2F',
    lineHeight: s(17),
  },
  grandTotalValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: '#FF8D2F',
    lineHeight: s(17),
  },
  paymentMethodsLabel: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: s(22),
  },
  paymentMethodsContainer: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  paymentOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(20),
  },
  paymentIcon: {
    width: s(30),
    height: vs(30),
  },
  paymentMethodText: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: s(22),
  },
  radioCircle: {
    width: s(15),
    height: vs(15),
    borderRadius: s(7.5),
    borderWidth: 1,
    borderColor: '#7A7B7B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  radioCircleInner: {
    width: s(7),
    height: vs(7),
    borderRadius: s(3.5),
    backgroundColor: Colors.primary,
  },
  bottomSpacer: {
    height: vs(100),
  },
  buttonContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
    backgroundColor: '#F4F6F6',
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    height: vs(50),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  proceedButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.white,
    lineHeight: s(22),
  },
  proceedButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
    opacity: 0.6,
  },
});

export default PaymentScreen;
