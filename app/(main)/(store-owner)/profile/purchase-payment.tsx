/**
 * PURCHASE PAYMENT SCREEN - Payment method selection for Purchase Orders
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1571-343 (Payment)
 * Baseline: 440x956
 *
 * Features:
 * - Display order summary with supplier name, date, products list
 * - Payment method selection (Cash, Debt/Loan option)
 * - Total amount display with bill card UI
 * - Confirm payment button
 * - Debt tracking for unpaid purchases
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, get, update } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { createPurchaseOrder } from '../../../../src/api/purchaseOrders';
import { PurchaseOrderItem } from '../../../../src/models/PurchaseOrder';

// Payment method types
type PurchasePaymentMethod = 'cash' | 'debt';

interface OrderData {
  supplierName: string;
  supplierContact: string;
  purchaseDate: string;
  items: PurchaseOrderItem[];
  notes: string;
  totalCost: number;
}

const PurchasePaymentScreen = () => {
  const params = useLocalSearchParams();

  const [selectedPayment, setSelectedPayment] = useState<PurchasePaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [storeName, setStoreName] = useState('My Store');
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    fetchStoreInfo();
    parseOrderData();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const storeRef = ref(database, `stores/${currentUser.uid}`);
      const storeSnapshot = await get(storeRef);

      if (storeSnapshot.exists()) {
        const storeData = storeSnapshot.val();
        setStoreName(storeData.storeName || storeData.businessInfo?.storeName || 'My Store');
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  const parseOrderData = () => {
    try {
      // Parse items from params
      const itemsString = typeof params.items === 'string' ? params.items : '';
      const items: PurchaseOrderItem[] = itemsString ? JSON.parse(itemsString) : [];

      const totalCost = items.reduce((sum, item) => sum + item.subtotal, 0);

      setOrderData({
        supplierName: typeof params.supplierName === 'string' ? params.supplierName : '',
        supplierContact: typeof params.supplierContact === 'string' ? params.supplierContact : '',
        purchaseDate: typeof params.purchaseDate === 'string' ? params.purchaseDate : new Date().toISOString().split('T')[0],
        items,
        notes: typeof params.notes === 'string' ? params.notes : '',
        totalCost,
      });
    } catch (error) {
      console.error('Error parsing order data:', error);
      Alert.alert('Error', 'Invalid order data. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handlePaymentSelect = (method: PurchasePaymentMethod) => {
    setSelectedPayment(method);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleProceedToCheckout = async () => {
    if (!selectedPayment) {
      Alert.alert('Select Payment Method', 'Please select a payment method to continue');
      return;
    }

    if (!orderData || orderData.items.length === 0) {
      Alert.alert('Error', 'No items in purchase order');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setProcessing(true);

    try {
      // Create purchase order with payment info
      const result = await createPurchaseOrder(
        currentUser.uid,
        storeName,
        {
          supplierName: orderData.supplierName.trim() || undefined,
          supplierContact: orderData.supplierContact.trim() || undefined,
          items: orderData.items,
          purchaseDate: orderData.purchaseDate,
          notes: orderData.notes.trim() || undefined,
          paymentMethod: selectedPayment,
          paymentStatus: selectedPayment === 'cash' ? 'paid' : 'unpaid',
        }
      );

      if (result.success && result.purchaseOrderId) {
        // Navigate to invoice screen
        router.replace({
          pathname: '/(main)/(store-owner)/profile/purchase-invoice' as any,
          params: {
            id: result.purchaseOrderId,
            paymentMethod: selectedPayment,
          },
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to create purchase order');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header - Figma: y: 74-114 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../../../src/assets/images/store-owner-purchase-payment/chevron-left.png')}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Payment</Text>

        <TouchableOpacity style={styles.notificationButton}>
          <Image
            source={require('../../../../src/assets/images/store-owner-purchase-payment/notification-icon.png')}
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Pay Loan / Order Details Card - Figma: x: 20, y: 136, width: 399, height: 144 */}
        <View style={styles.orderDetailsCard}>
          <Text style={styles.payLoanTitle}>Pay Loan</Text>

          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Date</Text>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>
                {orderData ? formatDate(orderData.purchaseDate) : '--/--/----'}
              </Text>
              <Image
                source={require('../../../../src/assets/images/store-owner-purchase-payment/calendar-icon.png')}
                style={styles.calendarIcon}
              />
            </View>
          </View>
        </View>

        {/* Bill Card - Figma: x: 20, y: 296, width: 400, height: 208 */}
        <View style={styles.billCard}>
          {/* Item count - Figma: Item row */}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item</Text>
            <Text style={styles.billValue}>{orderData?.items.length || 0}</Text>
          </View>

          {/* Sub Total - Figma: Sub Total row */}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Sub Total</Text>
            <Text style={styles.billValue}>
              ₱ {orderData?.totalCost.toFixed(2) || '0.00'}
            </Text>
          </View>

          {/* Invoice Link */}
          <View style={styles.invoiceRow}>
            <Text style={styles.billLabel}>Invoice</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewInvoiceText}>View Invoice</Text>
            </TouchableOpacity>
          </View>

          {/* Dotted Line - Figma: y: 372 */}
          <View style={styles.dottedLine} />

          {/* Grand Total - Figma: Grand Total row */}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              ₱ {orderData?.totalCost.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        {/* Payment Methods Label - Figma: x: 20, y: 524 */}
        <Text style={styles.paymentMethodsLabel}>Payment Method</Text>

        {/* Payment Methods - Figma: x: 20, y: 566, width: 400, height: 220 */}
        <View style={styles.paymentMethodsContainer}>
          {/* Cash Option - Paid upfront */}
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPayment === 'cash' && styles.paymentMethodCardSelected
            ]}
            onPress={() => handlePaymentSelect('cash')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodLeft}>
              <Image
                source={require('../../../../src/assets/images/store-owner-purchase-payment/gcash-icon.png')}
                style={styles.paymentIcon}
              />
              <Text style={styles.paymentMethodText}>Cash</Text>
            </View>
            <View style={[
              styles.radioCircle,
              selectedPayment === 'cash' && styles.radioCircleSelected
            ]}>
              {selectedPayment === 'cash' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Debt Option - Unpaid/Loan */}
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPayment === 'debt' && styles.paymentMethodCardSelected
            ]}
            onPress={() => handlePaymentSelect('debt')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodLeft}>
              <Image
                source={require('../../../../src/assets/images/store-owner-purchase-payment/debt-icon.png')}
                style={styles.paymentIcon}
              />
              <Text style={styles.paymentMethodText}>Debt</Text>
            </View>
            <View style={[
              styles.radioCircle,
              selectedPayment === 'debt' && styles.radioCircleSelected
            ]}>
              {selectedPayment === 'debt' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Debt Warning Message */}
        {selectedPayment === 'debt' && (
          <View style={styles.debtWarningCard}>
            <Text style={styles.debtWarningTitle}>Debt/Loan Selected</Text>
            <Text style={styles.debtWarningText}>
              This purchase will be recorded as UNPAID. You can mark it as paid later from the purchase order history.
            </Text>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
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
          activeOpacity={0.7}
        >
          {processing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.proceedButtonText}>Proceed to Checkout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma: fill_665VZV
  },

  // Header - Figma: y: 74-114
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(74),
    paddingBottom: vs(20),
    backgroundColor: '#F4F6F6',
  },

  // Back button - Figma: x: 20, y: 79, width: 30, height: 30
  backButton: {
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  chevronIcon: {
    width: s(15),
    height: s(15),
  },

  // Header title - Figma: x: 179, y: 83, width: 83, height: 22
  headerTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '600',
    color: '#1E1E1E', // Figma: fill_GNOP0M
    lineHeight: s(22),
  },

  // Notification - Figma: x: 375, y: 74, width: 40, height: 40
  notificationButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  notificationIcon: {
    width: s(25),
    height: s(25),
  },

  scrollView: {
    flex: 1,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: vs(15),
    fontSize: s(16),
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
    fontFamily: Fonts.primary,
  },

  // Order Details Card - Figma: x: 20, y: 136, width: 399, height: 144
  orderDetailsCard: {
    marginHorizontal: s(20),
    marginTop: vs(10),
    marginBottom: vs(20),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  payLoanTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '500',
    color: '#000000', // Figma: fill_OZM8EW
    lineHeight: s(22),
    marginBottom: vs(15),
  },

  dateSection: {
    gap: vs(5),
  },

  dateLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '500',
    color: '#1E1E1E',
    lineHeight: s(22),
  },

  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(14),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },

  dateText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: '#1E1E1E',
    lineHeight: s(22),
  },

  calendarIcon: {
    width: s(25),
    height: s(25),
  },

  // Bill Card - Figma: x: 20, y: 296, width: 400, height: 208
  billCard: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },

  billLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: '#1E1E1E',
    lineHeight: s(17),
  },

  billValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: '#1E1E1E',
    lineHeight: s(17),
    textAlign: 'right',
  },

  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  viewInvoiceText: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '500',
    color: '#02545F', // Figma: fill_P2KLBO
    lineHeight: s(15),
  },

  dottedLine: {
    height: vs(2),
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(15),
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
    color: '#FF8D2F', // Figma: fill_IT2FZ8
    lineHeight: s(17),
  },

  grandTotalValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: '#FF8D2F',
    lineHeight: s(17),
    textAlign: 'right',
  },

  // Payment Methods Label - Figma: x: 20, y: 524, width: 164, height: 22
  paymentMethodsLabel: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '500',
    color: '#1E1E1E',
    lineHeight: s(22),
  },

  // Payment Methods Container - Figma: x: 20, y: 566, width: 400, height: 220
  paymentMethodsContainer: {
    marginHorizontal: s(20),
    gap: vs(20),
  },

  // Payment Method Card - Figma: width: 400, height: 60
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  paymentMethodCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(20),
  },

  paymentIcon: {
    width: s(30),
    height: s(30),
  },

  paymentMethodText: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: '600',
    color: '#1E1E1E',
    lineHeight: s(22),
  },

  radioCircle: {
    width: s(15),
    height: s(15),
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

  radioInner: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: Colors.primary,
  },

  // Debt Warning Card
  debtWarningCard: {
    marginHorizontal: s(20),
    marginTop: vs(15),
    backgroundColor: '#FFF3E0',
    borderRadius: s(16),
    padding: s(15),
    borderWidth: 1,
    borderColor: '#FF8D2F',
  },

  debtWarningTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: '#FF8D2F',
    marginBottom: vs(5),
  },

  debtWarningText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '400',
    color: '#1E1E1E',
    lineHeight: s(20),
  },

  bottomSpacer: {
    height: vs(100),
  },

  // Proceed button - Figma: x: 20, y: 839, width: 400, height: 50
  buttonContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
    backgroundColor: '#F4F6F6',
  },

  proceedButton: {
    backgroundColor: Colors.primary, // #3BB77E
    borderRadius: s(20),
    height: vs(50),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
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

export default PurchasePaymentScreen;
