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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, get, update } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { createPurchaseOrder } from '../../../../src/api/purchaseOrders';
import { PurchaseOrderItem, PurchasePaymentMethod } from '../../../../src/models/PurchaseOrder';
import { xenditService } from '../../../../src/services/payment/XenditService';
import * as Linking from 'expo-linking';

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

  // Additional payment details
  const [debtDueDate, setDebtDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default: 30 days from now
  );

  useEffect(() => {
    fetchStoreInfo();
    parseOrderData();
  }, []);

  const [storeOwnerPhone, setStoreOwnerPhone] = useState('');

  const fetchStoreInfo = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const storeRef = ref(database, `stores/${currentUser.uid}`);
      const storeSnapshot = await get(storeRef);

      if (storeSnapshot.exists()) {
        const storeData = storeSnapshot.val();
        setStoreName(storeData.storeName || storeData.businessInfo?.storeName || 'My Store');

        // Get phone number from store data or user profile
        const phoneNumber = storeData.contactInfo?.phoneNumber ||
                          storeData.phoneNumber ||
                          currentUser.phoneNumber ||
                          '';
        setStoreOwnerPhone(phoneNumber);

        console.log('[Purchase Payment] Store owner phone:', phoneNumber);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  const parseOrderData = async () => {
    try {
      // ✅ FIX: Load from AsyncStorage instead of URL params
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('[Purchase Payment] No current user');
        setLoading(false);
        return;
      }

      const storageKey = `purchase_order_payment_${currentUser.uid}`;
      console.log('[Purchase Payment] === DEBUG: Parse Order Data ===');
      console.log('[Purchase Payment] Current user ID:', currentUser.uid);
      console.log('[Purchase Payment] Storage key:', storageKey);

      const storedData = await AsyncStorage.getItem(storageKey);
      console.log('[Purchase Payment] Loaded from AsyncStorage:', !!storedData);
      console.log('[Purchase Payment] Data length:', storedData?.length || 0);

      if (!storedData) {
        console.error('[Purchase Payment] No data in AsyncStorage');
        console.error('[Purchase Payment] This might happen if you navigated directly or app reloaded');
        Alert.alert('Error', 'Order data not found. Please go back and try again.');
        setLoading(false);
        return;
      }

      const orderDataFromStorage = JSON.parse(storedData);
      const items: PurchaseOrderItem[] = orderDataFromStorage.items || [];

      console.log('[Purchase Payment] Parsed items count:', items.length);
      console.log('[Purchase Payment] First item:', JSON.stringify(items[0], null, 2));
      console.log('[Purchase Payment] First item has productId?', !!items[0]?.productId);

      const totalCost = items.reduce((sum, item) => sum + item.subtotal, 0);

      setOrderData({
        supplierName: orderDataFromStorage.supplierName || '',
        supplierContact: orderDataFromStorage.supplierContact || '',
        purchaseDate: orderDataFromStorage.purchaseDate || new Date().toISOString().split('T')[0],
        items,
        notes: orderDataFromStorage.notes || '',
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
      // For GCash/PayMaya: Process via Xendit
      if (selectedPayment === 'gcash' || selectedPayment === 'paymaya') {
        await handleXenditPayment(currentUser);
      }
      // For Cash: Create order as paid (manual payment tracking)
      else if (selectedPayment === 'cash') {
        await handleCashPayment(currentUser);
      }
      // For Debt: Create order as unpaid (debt tracking)
      else if (selectedPayment === 'debt') {
        await handleDebtPayment(currentUser);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
      setProcessing(false);
    }
  };

  const handleXenditPayment = async (currentUser: any) => {
    try {
      if (!orderData) return;

      // Validate phone number for GCash/PayMaya (Xendit requirement)
      if (!storeOwnerPhone || storeOwnerPhone.trim() === '') {
        Alert.alert(
          'Phone Number Required',
          'GCash and PayMaya payments require a valid phone number. Please update your store contact information in Profile > My Account.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setProcessing(false),
            },
            {
              text: 'Go to Profile',
              onPress: () => {
                setProcessing(false);
                router.push('/(main)/(store-owner)/profile/my-account' as any);
              },
            },
          ]
        );
        return;
      }

      // Ensure phone number is in valid format (Philippine format)
      let formattedPhone = storeOwnerPhone.trim();

      // Add +63 prefix if missing (Philippine country code)
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          // Replace leading 0 with +63
          formattedPhone = '+63' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('63')) {
          formattedPhone = '+' + formattedPhone;
        } else {
          formattedPhone = '+63' + formattedPhone;
        }
      }

      console.log('[Purchase Payment] Using phone number:', formattedPhone);

      // First create the purchase order with pending payment
      const poResult = await createPurchaseOrder(
        currentUser.uid,
        storeName,
        {
          supplierName: orderData.supplierName.trim() || undefined,
          supplierContact: orderData.supplierContact.trim() || undefined,
          items: orderData.items,
          purchaseDate: orderData.purchaseDate,
          notes: orderData.notes.trim() || undefined,
          paymentMethod: selectedPayment,
          paymentStatus: 'unpaid', // Will be updated after Xendit payment
        }
      );

      if (!poResult.success || !poResult.purchaseOrderId || !poResult.purchaseOrderNumber) {
        Alert.alert('Error', poResult.error || 'Failed to create purchase order');
        setProcessing(false);
        return;
      }

      // Create Xendit invoice for B2B payment tracking
      const paymentResult = await xenditService.createPurchaseOrderPayment({
        purchaseOrderId: poResult.purchaseOrderId,
        purchaseOrderNumber: poResult.purchaseOrderNumber,
        amount: orderData.totalCost,
        storeOwnerEmail: currentUser.email || 'storeowner@tindago.com',
        storeOwnerName: storeName,
        storeOwnerPhone: formattedPhone, // ✅ Use formatted phone number
        storeId: currentUser.uid,
        storeName: storeName,
        supplierName: orderData.supplierName || 'Supplier',
        items: orderData.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.costPerUnit,
        })),
        paymentMethod: selectedPayment as 'gcash' | 'paymaya',
      });

      setProcessing(false);

      if (paymentResult.success && paymentResult.invoiceUrl) {
        // ✅ Cleanup: Remove data from AsyncStorage
        await AsyncStorage.removeItem(`purchase_order_payment_${currentUser.uid}`);

        // Open Xendit payment page
        await Linking.openURL(paymentResult.invoiceUrl);

        // Navigate to purchase details (payment pending)
        router.replace({
          pathname: '/(main)/(store-owner)/profile/purchase-details' as any,
          params: {
            purchaseOrderId: poResult.purchaseOrderId,
            fromPayment: 'true',
          },
        });
      } else {
        // More detailed error message for debugging
        const errorDetails = paymentResult.error || 'Unknown error';
        console.error('[Purchase Payment] Xendit error details:', errorDetails);
        console.error('[Purchase Payment] Full response:', JSON.stringify(paymentResult));

        Alert.alert(
          'Payment Error',
          `Failed to create payment invoice.\n\nError: ${errorDetails}\n\nThe purchase order has been created but payment is pending. You can retry payment from the purchase order details.`
        );

        // Still navigate to details
        router.replace({
          pathname: '/(main)/(store-owner)/profile/purchase-details' as any,
          params: {
            purchaseOrderId: poResult.purchaseOrderId,
          },
        });
      }
    } catch (error: any) {
      console.error('[Purchase Payment] Xendit payment exception:', error);
      console.error('[Purchase Payment] Error message:', error?.message);
      console.error('[Purchase Payment] Error stack:', error?.stack);
      setProcessing(false);
      Alert.alert(
        'Payment Error',
        `Failed to process Xendit payment.\n\nDetails: ${error?.message || JSON.stringify(error)}`
      );
    }
  };

  const handleCashPayment = async (currentUser: any) => {
    try {
      if (!orderData) return;

      // Create purchase order as paid (store owner paid supplier in cash)
      const result = await createPurchaseOrder(
        currentUser.uid,
        storeName,
        {
          supplierName: orderData.supplierName.trim() || undefined,
          supplierContact: orderData.supplierContact.trim() || undefined,
          items: orderData.items,
          purchaseDate: orderData.purchaseDate,
          notes: orderData.notes.trim() || undefined,
          paymentMethod: 'cash',
          paymentStatus: 'paid', // Cash payment is considered immediate
        }
      );

      setProcessing(false);

      if (result.success && result.purchaseOrderId) {
        // ✅ Cleanup: Remove data from AsyncStorage
        await AsyncStorage.removeItem(`purchase_order_payment_${currentUser.uid}`);

        Alert.alert(
          'Purchase Order Created',
          'Cash payment recorded. Purchase order has been created successfully.',
          [
            {
              text: 'View Details',
              onPress: () => {
                router.replace({
                  pathname: '/(main)/(store-owner)/profile/purchase-details' as any,
                  params: {
                    purchaseOrderId: result.purchaseOrderId,
                  },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create purchase order');
      }
    } catch (error) {
      console.error('Cash payment error:', error);
      setProcessing(false);
      Alert.alert('Error', 'Failed to record cash payment');
    }
  };

  const handleDebtPayment = async (currentUser: any) => {
    try {
      if (!orderData) return;

      // Create purchase order as unpaid (debt/loan tracking)
      const result = await createPurchaseOrder(
        currentUser.uid,
        storeName,
        {
          supplierName: orderData.supplierName.trim() || undefined,
          supplierContact: orderData.supplierContact.trim() || undefined,
          items: orderData.items,
          purchaseDate: orderData.purchaseDate,
          notes: orderData.notes.trim() || undefined,
          paymentMethod: 'debt',
          paymentStatus: 'unpaid', // Debt tracking
          debtDueDate: debtDueDate, // ✅ Include debt due date
        }
      );

      setProcessing(false);

      if (result.success && result.purchaseOrderId) {
        // ✅ Cleanup: Remove data from AsyncStorage
        await AsyncStorage.removeItem(`purchase_order_payment_${currentUser.uid}`);

        Alert.alert(
          'Purchase Order Created',
          `Debt of ₱${orderData.totalCost.toFixed(2)} has been recorded. Remember to pay the supplier later.`,
          [
            {
              text: 'View Details',
              onPress: () => {
                router.replace({
                  pathname: '/(main)/(store-owner)/profile/purchase-details' as any,
                  params: {
                    purchaseOrderId: result.purchaseOrderId,
                  },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create purchase order');
      }
    } catch (error) {
      console.error('Debt payment error:', error);
      setProcessing(false);
      Alert.alert('Error', 'Failed to record debt');
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
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                if (!orderData) {
                  Alert.alert('Error', 'No order data available');
                  return;
                }
                // Show preview - navigate with preview=true flag
                router.push({
                  pathname: '/(main)/(store-owner)/profile/purchase-invoice' as any,
                  params: {
                    preview: 'true',
                    supplierName: orderData.supplierName,
                    supplierContact: orderData.supplierContact,
                    purchaseDate: orderData.purchaseDate,
                    items: JSON.stringify(orderData.items),
                    totalCost: orderData.totalCost.toString(),
                    notes: orderData.notes,
                    paymentMethod: selectedPayment || 'cash',
                  },
                });
              }}
            >
              <Text style={styles.viewInvoiceText}>View Invoice Preview</Text>
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
              <View style={styles.cashIconContainer}>
                <Text style={styles.cashIcon}>₱</Text>
              </View>
              <View style={styles.paymentMethodTextContainer}>
                <Text style={styles.paymentMethodText}>Cash</Text>
                <Text style={styles.paymentMethodDescription}>Paid cash to supplier</Text>
              </View>
            </View>
            <View style={[
              styles.radioCircle,
              selectedPayment === 'cash' && styles.radioCircleSelected
            ]}>
              {selectedPayment === 'cash' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* GCash Option - Digital payment */}
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPayment === 'gcash' && styles.paymentMethodCardSelected
            ]}
            onPress={() => handlePaymentSelect('gcash')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodLeft}>
              <Image
                source={require('../../../../src/assets/images/store-owner-purchase-payment/gcash-icon.png')}
                style={styles.paymentIcon}
              />
              <Text style={styles.paymentMethodText}>GCash</Text>
            </View>
            <View style={[
              styles.radioCircle,
              selectedPayment === 'gcash' && styles.radioCircleSelected
            ]}>
              {selectedPayment === 'gcash' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* PayMaya Option - Digital payment */}
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              selectedPayment === 'paymaya' && styles.paymentMethodCardSelected
            ]}
            onPress={() => handlePaymentSelect('paymaya')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodLeft}>
              <Image
                source={require('../../../../src/assets/images/store-owner-purchase-payment/paymaya-icon.png')}
                style={styles.paymentIcon}
              />
              <Text style={styles.paymentMethodText}>PayMaya</Text>
            </View>
            <View style={[
              styles.radioCircle,
              selectedPayment === 'paymaya' && styles.radioCircleSelected
            ]}>
              {selectedPayment === 'paymaya' && <View style={styles.radioInner} />}
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

        {/* Debt Information Card - Only shows when Debt is selected */}
        {selectedPayment === 'debt' && (
          <View style={styles.debtInfoCard}>
            <View style={styles.debtInfoHeader}>
              <Text style={styles.debtInfoTitle}>💳 Debt/Loan Selected</Text>
            </View>

            <View style={styles.debtInfoContent}>
              <View style={styles.debtInfoRow}>
                <Text style={styles.debtInfoLabel}>Purchase Date:</Text>
                <Text style={styles.debtInfoValue}>
                  {orderData ? formatDate(orderData.purchaseDate) : '--/--/----'}
                </Text>
              </View>

              <View style={styles.debtInfoRow}>
                <Text style={styles.debtInfoLabel}>Amount Owed:</Text>
                <Text style={styles.debtInfoValueAmount}>₱{orderData?.totalCost.toFixed(2) || '0.00'}</Text>
              </View>

              <View style={styles.debtInfoRow}>
                <Text style={styles.debtInfoLabel}>Supplier:</Text>
                <Text style={styles.debtInfoValue}>
                  {orderData?.supplierName || 'Not specified'}
                </Text>
              </View>

              {/* Due Date Input */}
              <View style={styles.debtDueDateSection}>
                <Text style={styles.debtDueDateLabel}>When will you pay this debt?</Text>
                <TextInput
                  style={styles.debtDueDateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={debtDueDate}
                  onChangeText={setDebtDueDate}
                />
                <Text style={styles.debtDueDateHint}>
                  Set a payment deadline to track when you need to pay the supplier
                </Text>
              </View>
            </View>

            <View style={styles.debtWarningBox}>
              <Text style={styles.debtWarningIcon}>⚠️</Text>
              <Text style={styles.debtWarningText}>
                This purchase will be recorded as UNPAID. Remember to pay the supplier later. You can track this debt in your purchase order history.
              </Text>
            </View>
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

  // Bill Card - Figma: x: 20, y: 296, width: 400, height: 208
  billCard: {
    marginHorizontal: s(20),
    marginTop: vs(20),
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
    flex: 1,
  },

  paymentIcon: {
    width: s(30),
    height: s(30),
  },

  paymentMethodTextContainer: {
    flex: 1,
  },

  paymentMethodText: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '600',
    color: '#1E1E1E',
    lineHeight: s(22),
  },

  paymentMethodDescription: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '400',
    color: '#666666',
    lineHeight: s(16),
    marginTop: vs(2),
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

  // Debt Information Card (shows only when debt is selected)
  debtInfoCard: {
    marginHorizontal: s(20),
    marginTop: vs(20),
    marginBottom: vs(20),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    borderWidth: 2,
    borderColor: '#FF8D2F',
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },

  debtInfoHeader: {
    backgroundColor: '#FF8D2F',
    paddingVertical: vs(15),
    paddingHorizontal: s(20),
  },

  debtInfoTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '600',
    color: Colors.white,
    lineHeight: s(22),
  },

  debtInfoContent: {
    padding: s(20),
    gap: vs(15),
  },

  debtInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  debtInfoLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  debtInfoValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '600',
    color: Colors.darkGray,
  },

  debtInfoValueAmount: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '700',
    color: '#FF8D2F',
  },

  debtWarningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    paddingVertical: vs(15),
    paddingHorizontal: s(15),
    gap: s(10),
    alignItems: 'flex-start',
  },

  debtWarningIcon: {
    fontSize: s(20),
    marginTop: vs(2),
  },

  debtWarningText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: s(13),
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

  // Cash icon styles
  cashIconContainer: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cashIcon: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Debt Due Date Section
  debtDueDateSection: {
    marginTop: vs(15),
    paddingTop: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  debtDueDateLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  debtDueDateInput: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    color: Colors.darkGray,
    backgroundColor: Colors.white,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(15),
    borderWidth: 1.5,
    borderColor: '#FF8D2F',
    marginBottom: vs(8),
  },

  debtDueDateHint: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.textSecondary,
    lineHeight: s(16),
    fontStyle: 'italic',
  },
});

export default PurchasePaymentScreen;
