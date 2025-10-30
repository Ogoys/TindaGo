/**
 * PAYMENT SCREEN - Payment method selection
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1196-1375 (Payment)
 * Baseline: 440x956
 *
 * Features:
 * - Display order summary bill with decorative background
 * - Payment method selection (PayMaya, GCash, Cash on Pickup)
 * - Calculate order total (no tax added - sari-sari stores include tax in prices)
 * - Navigate to payment processing or order confirmation
 * - Green peso circle icon for Cash on Pickup option
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { useUser } from '../../../src/contexts/UserContext';
import { Colors } from '../../../src/constants/Colors';
import { Fonts } from '../../../src/constants/Fonts';
import { s, vs, ms } from '../../../src/constants/responsive';
import { OrderCompleteModal } from '../../../src/components/ui/OrderCompleteModal';
import { OrderErrorModal } from '../../../src/components/ui/OrderErrorModal';
import { PaymentMethodSelector, PaymentMethod } from '../../../src/components/ui/PaymentMethodSelector';
import { createOrder } from '../../../src/api/orders';
import { clearCart } from '../../../src/api/cart';
import { xenditService } from '../../../src/services/payment/XenditService';
import { Linking } from 'react-native';

interface OrderSummary {
  items: number;
  subtotal: number;
  discount: number;
  grandTotal: number;
}

const PaymentScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const params = useLocalSearchParams();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    items: 0,
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
  });

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Load order summary from cart or params
  useEffect(() => {
    loadOrderSummary();
  }, [user]);

  const loadOrderSummary = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Try to get cart items to calculate summary
      const cartRef = ref(database, `carts/${user.id}/items`);
      const snapshot = await get(cartRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.values(data) as any[];
        setCartItems(items);

        const itemCount = items.length;
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
        const discount = 0; // Will be calculated based on user type (senior/PWD)

        setOrderSummary({
          items: itemCount,
          subtotal,
          discount,
          grandTotal: subtotal - discount, // No tax added (sari-sari stores include tax in prices)
        });
      }
    } catch (error) {
      console.error('Error loading order summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPayment(method);
  };

  const handleProceedToCheckout = async () => {
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
      setErrorMessage('Your cart is empty.\nPlease add items to your cart.');
      setShowErrorModal(true);
      return;
    }

    setProcessing(true);

    try {
      // Get first item's store info (all items should be from same store)
      const firstItem = cartItems[0];
      const storeId = firstItem.storeId || 'unknown';
      const storeName = firstItem.storeName || 'Unknown Store';

      // Generate order number
      const now = new Date();
      const year = now.getFullYear();
      const orderNumber = `ORD-${year}-${Date.now()}`;

      // Create order data
      const orderData = {
        orderNumber,
        customerId: user.id,
        customerName: user.name || user.email || 'Customer',
        customerPhone: user.phoneNumber || '',
        storeId,
        storeName,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
          weight: item.weight || '',
          unit: item.unit || '',
          subtotal: item.subtotal,
          notes: item.notes || '',
        })),
        subtotal: orderSummary.subtotal,
        total: orderSummary.grandTotal,
        status: 'pending' as const,
        notes: '',
        paymentMethod: selectedPayment,
        paymentStatus: selectedPayment === 'cash' ? ('pending' as const) : ('pending' as const), // Will be updated after payment
      };

      // Check if online payment (GCash/PayMaya)
      if (selectedPayment === 'gcash' || selectedPayment === 'paymaya') {
        console.log('Processing online payment with Xendit...');

        // Create Xendit payment invoice
        const paymentResponse = await xenditService.createPayment({
          orderId: orderNumber, // Use order number as external ID
          orderNumber,
          amount: orderSummary.grandTotal,
          customerEmail: user.email || `${user.id}@tindago.com`,
          customerName: user.name || user.email || 'Customer',
          customerPhone: user.phoneNumber || '',
          storeId,
          storeName,
          items: cartItems.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod: selectedPayment,
        });

        if (!paymentResponse.success || !paymentResponse.invoiceUrl) {
          setProcessing(false);
          setErrorMessage(`Failed to create payment:\n${paymentResponse.error || 'Unknown error'}`);
          setShowErrorModal(true);
          return;
        }

        console.log('Xendit invoice created:', paymentResponse.invoiceId);

        // Create order in Firebase BEFORE opening payment
        const orderId = await createOrder({
          ...orderData,
          xenditInvoiceId: paymentResponse.invoiceId, // Store Xendit invoice ID
          platformCommission: paymentResponse.platformCommission,
          storeAmount: paymentResponse.storeAmount,
        });

        if (!orderId) {
          setProcessing(false);
          setErrorMessage('Failed to create order in database.\nPlease try again.');
          setShowErrorModal(true);
          return;
        }

        // Open Xendit payment page in browser
        const supported = await Linking.canOpenURL(paymentResponse.invoiceUrl);
        if (supported) {
          await Linking.openURL(paymentResponse.invoiceUrl);

          // Show info message
          Alert.alert(
            'Payment Page Opened',
            'Complete your payment in the browser that just opened. Once paid, return to the app to see your order.',
            [
              {
                text: 'I Completed Payment',
                onPress: async () => {
                  // Clear cart
                  await clearCart(user.id);
                  // Show success modal
                  setCompletedOrderId(orderNumber);
                  setShowSuccessModal(true);
                  setCartItems([]);
                },
              },
              {
                text: 'Cancel Payment',
                style: 'cancel',
              },
            ]
          );
        } else {
          setErrorMessage('Cannot open payment page.\nPlease check your internet connection.');
          setShowErrorModal(true);
        }

      } else {
        // Cash on Pickup - create order directly
        const orderId = await createOrder(orderData);

        if (orderId) {
          // Clear cart after successful order
          await clearCart(user.id);

          // Show success modal
          setCompletedOrderId(orderNumber);
          setShowSuccessModal(true);
          setCartItems([]);
        } else {
          // Show error modal
          setErrorMessage('Failed to create your order.\nPlease try again.');
          setShowErrorModal(true);
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrorMessage('An unexpected error occurred.\nPlease try again.');
      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    setShowErrorModal(false);
    setErrorMessage(undefined);
    // Retry checkout
    setTimeout(() => {
      handleProceedToCheckout();
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header - Figma: y: 74-114 */}
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
            {/* Bill Card - Figma: x: 20, y: 166, width: 400, height: 300 */}
            <View style={styles.billCard}>

              {/* Item count - Figma: y: 189 */}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item</Text>
                <Text style={styles.billValue}>{orderSummary.items}</Text>
              </View>

              {/* Sub Total - Figma: y: 226 */}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Sub Total</Text>
                <Text style={styles.billValue}>₱ {orderSummary.subtotal.toFixed(2)}</Text>
              </View>

              {/* Discount - Figma: y: 263 (if applicable) */}
              {orderSummary.discount > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Discount (20%)</Text>
                  <Text style={styles.billValue}>- ₱ {orderSummary.discount.toFixed(2)}</Text>
                </View>
              )}

              {orderSummary.discount > 0 && (
                <Text style={styles.discountNote}>
                  Discount depend on what you are{'\n'}senior of pwd.
                </Text>
              )}

              {/* Dotted Line - Figma: y: 372 */}
              <View style={styles.dottedLine} />

              {/* Grand Total - Figma: y: 394 */}
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>₱ {orderSummary.grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* Payment Methods Label - Figma: x: 20, y: 486 */}
            <Text style={styles.paymentMethodsLabel}>Payment Method</Text>

            {/* Payment Methods - Using reusable component */}
            <View style={styles.paymentMethodsContainer}>
              <PaymentMethodSelector
                selectedPayment={selectedPayment}
                onPaymentSelect={handlePaymentMethodSelect}
                disabled={processing}
              />
            </View>

            {/* Spacer for bottom button */}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

      {/* Proceed to Checkout Button - Figma: x: 20, y: 839, width: 400, height: 50 */}
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
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderId={completedOrderId}
      />

      {/* Order Error Modal */}
      <OrderErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={handleRetryPayment}
        errorMessage={errorMessage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // #F4F6F6 from Figma
  },
  scrollView: {
    flex: 1,
  },

  // Header - Figma: y: 74-114
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(20),
  },

  // Back button - Figma: x: 20, y: 79, width: 30, height: 30
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

  // Header title - Figma: x: 179, y: 83, width: 83, height: 22
  headerTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: s(22),
  },

  // Notification - Figma: x: 375, y: 74, width: 40, height: 40
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

  // Loading state
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

  // Bill Card - Figma: x: 20, y: 166, width: 400, height: 300
  billCard: {
    marginHorizontal: s(20),
    marginTop: vs(15),
    marginBottom: vs(20),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingTop: vs(23), // Figma: First element (Item) at y: 189, relative to card y: 166 = 23px
    paddingBottom: vs(28), // Figma: Last element (Grand Total) at y: 394+17=411, card ends at 466 = 55px bottom padding
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  // Bill rows
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

  // Discount note - Figma: y: 322
  discountNote: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: s(15),
    marginBottom: vs(20),
  },

  // Dotted line - Figma: y: 372
  dottedLine: {
    height: vs(2),
    backgroundColor: Colors.textSecondary,
    marginBottom: vs(20),
    opacity: 0.3,
  },

  // Grand Total - Figma: y: 394
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

  // Payment Methods Label - Figma: x: 20, y: 486, width: 164, height: 22
  paymentMethodsLabel: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.darkGray,
    lineHeight: s(22),
  },

  // Payment Methods Container - Figma: x: 20, y: 528, width: 400, height: 140
  paymentMethodsContainer: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
  },

  bottomSpacer: {
    height: vs(100),
  },

  // Proceed button - Figma: x: 20, y: 839, width: 400, height: 50
  buttonContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
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
