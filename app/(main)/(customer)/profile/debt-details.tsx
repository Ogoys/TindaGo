/**
 * CUSTOMER DEBT DETAILS SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1571-1103 (Debt Details)
 * Baseline: 440x956
 *
 * PIXEL-PERFECT IMPLEMENTATION:
 * Shows full details of a specific debt order.
 * Features:
 * - Order information (order number, store name, date)
 * - Product items list with quantities and prices
 * - Debt information (due date, amount owed, status)
 * - "Proceed to Pay" button for settling debt
 *
 * Design Pattern: Similar to order-details-history with debt-specific features
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, get, update, onValue } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import type { Order, OrderItem } from '../../../../src/models/Order';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

// Extended colors for this screen
const ScreenColors = {
  ...Colors,
  pendingOrange: '#FFA500',
  paidGreen: '#3BB77E',
  overdueRed: '#E92B45',
  debtCardBg: '#FFF3E0', // Light orange background for debt info card
  tealText: '#02545F',
};

export default function DebtDetailsScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // ✅ REAL-TIME listener for debt status updates (automatically shows "Paid" after Xendit payment)
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    console.log('[Debt Details] Setting up real-time listener for order:', orderId);
    const orderRef = ref(database, `orders/${orderId}`);
    let hasAlerted = false; // Prevent duplicate alerts

    // Real-time listener - automatically updates when payment status changes
    const unsubscribe = onValue(orderRef, (snapshot) => {
      setLoading(false);

      if (snapshot.exists()) {
        const orderData = { ...snapshot.val(), id: orderId };

        // Calculate if overdue
        if (orderData.debtStatus === 'pending' && orderData.debtDueDate) {
          const dueDate = new Date(orderData.debtDueDate);
          const today = new Date();
          if (today > dueDate) {
            orderData.debtStatus = 'overdue';
          }
        }

        console.log('[Debt Details] Order updated - debtStatus:', orderData.debtStatus, 'paymentStatus:', orderData.paymentStatus);

        // ✅ Only update state (triggers re-render) - no loops, React handles state changes efficiently
        setOrder(orderData);
      } else {
        // Only show alert once
        if (!hasAlerted) {
          hasAlerted = true;
          Alert.alert('Error', 'Debt order not found');
          router.back();
        }
      }
    }, (error) => {
      console.error('[Debt Details] Error listening to order:', error);
      if (!hasAlerted) {
        hasAlerted = true;
        Alert.alert('Error', 'Failed to load debt details');
      }
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      console.log('[Debt Details] Cleaning up listener for order:', orderId);
      unsubscribe();
    };
  }, [orderId]);

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Format short date
  const formatShortDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Safe number formatter
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  // Get status configuration
  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return {
          backgroundColor: ScreenColors.pendingOrange,
          color: '#FFFFFF',
          label: 'Pending',
        };
      case 'paid':
        return {
          backgroundColor: ScreenColors.paidGreen,
          color: '#FFFFFF',
          label: 'Paid',
        };
      case 'overdue':
        return {
          backgroundColor: ScreenColors.overdueRed,
          color: '#FFFFFF',
          label: 'Overdue',
        };
      default:
        return {
          backgroundColor: '#9CA3AF',
          color: '#FFFFFF',
          label: 'Unknown',
        };
    }
  };

  // Handle pay now - navigate to payment or mark as paid
  const handlePayNow = async () => {
    if (!order) return;

    // Show confirmation dialog
    Alert.alert(
      'Pay Debt',
      `Are you sure you want to pay P${formatCurrency(order.total)} for this order?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Pay Now',
          onPress: async () => {
            setPaying(true);
            try {
              // Navigate to payment screen with order details
              router.push({
                pathname: '/(main)/(customer)/payment',
                params: {
                  orderId: order.id,
                  amount: order.total?.toString() || '0',
                  isDebtPayment: 'true',
                  storeName: order.storeName || '',
                },
              });
            } catch (error) {
              console.error('Error navigating to payment:', error);
              Alert.alert('Error', 'Failed to proceed to payment');
            } finally {
              setPaying(false);
            }
          },
        },
      ]
    );
  };

  // Calculate days until due or overdue
  const getDaysInfo = () => {
    if (!order?.debtDueDate) return null;

    const dueDate = new Date(order.debtDueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false };
    } else {
      return { text: `${diffDays} days remaining`, isOverdue: false };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading debt details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Debt order not found</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Safe order data
  const safeOrder = {
    ...order,
    items: order.items || [],
    subtotal: order.subtotal ?? 0,
    total: order.total ?? 0,
    orderNumber: order.orderNumber || 'N/A',
    storeName: order.storeName || 'N/A',
    customerName: order.customerName || 'N/A',
    debtStatus: order.debtStatus || 'pending',
    debtDueDate: order.debtDueDate || '',
  };

  const statusConfig = getStatusConfig(safeOrder.debtStatus);
  const daysInfo = getDaysInfo();
  const isPaid = safeOrder.debtStatus === 'paid';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../../../src/assets/images/customer-debt-history/chevron-left.png')}
              style={styles.backIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Debt Details</Text>
        </View>

        {/* Debt Status Card */}
        <View style={styles.debtStatusCard}>
          <View style={styles.debtStatusHeader}>
            <View style={styles.debtIconContainer}>
              <Text style={styles.debtIconText}>💳</Text>
            </View>
            <View style={styles.debtStatusInfo}>
              <Text style={styles.debtAmountLabel}>Amount Due</Text>
              <Text style={styles.debtAmount}>P{formatCurrency(safeOrder.total)}</Text>
            </View>
            <View
              style={[
                styles.statusBadgeLarge,
                { backgroundColor: statusConfig.backgroundColor },
              ]}
            >
              <Text style={[styles.statusTextLarge, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Due Date Info */}
          <View style={styles.dueDateContainer}>
            <View style={styles.dueDateRow}>
              <Text style={styles.dueDateLabel}>Due Date:</Text>
              <Text style={styles.dueDateValue}>{formatShortDate(safeOrder.debtDueDate)}</Text>
            </View>
            {daysInfo && !isPaid && (
              <Text
                style={[
                  styles.daysRemainingText,
                  daysInfo.isOverdue && styles.overdueText,
                ]}
              >
                {daysInfo.text}
              </Text>
            )}
            {isPaid && safeOrder.debtPaidDate && (
              <Text style={styles.paidDateText}>
                Paid on: {formatShortDate(safeOrder.debtPaidDate)}
              </Text>
            )}
          </View>
        </View>

        {/* Order Items Card */}
        <View style={styles.orderItemsCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>Order Items</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>
                {safeOrder.items.length} {safeOrder.items.length === 1 ? 'Item' : 'Items'}
              </Text>
            </View>
          </View>

          {/* Header Divider */}
          <View style={styles.headerDivider} />

          {/* Items List */}
          <View style={styles.itemsList}>
            {safeOrder.items.map((item: OrderItem, index: number) => {
              const imageSource = getProductImageSource(
                {
                  productImageUrl: (item as any).productImageUrl,
                  productImage: item.productImage,
                },
                'small'
              );

              return (
                <View key={item.productId || index} style={styles.itemRow}>
                  {/* Product Image */}
                  <View style={styles.productImageContainer}>
                    <Image
                      source={imageSource}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Product Details */}
                  <View style={styles.productDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.productName}
                    </Text>
                    {item.weight && item.unit && (
                      <Text style={styles.itemWeight}>
                        {item.weight} {item.unit}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>
                      P{formatCurrency(item.price)} each
                    </Text>
                  </View>

                  {/* Quantity & Amount */}
                  <View style={styles.itemQuantitySection}>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>x{item.quantity}</Text>
                    </View>
                    <Text style={styles.itemAmount}>
                      P{formatCurrency(item.subtotal)}
                    </Text>
                  </View>

                  {/* Divider */}
                  {index < safeOrder.items.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Billing Section */}
          <View style={styles.billingSection}>
            <View style={styles.billingSeparator} />

            {/* Subtotal Row */}
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Subtotal</Text>
              <Text style={styles.billingValue}>
                P{formatCurrency(safeOrder.subtotal)}
              </Text>
            </View>

            {/* Total Divider */}
            <View style={styles.totalDivider} />

            {/* Grand Total Row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                P{formatCurrency(safeOrder.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          {/* Order ID Row */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>{safeOrder.orderNumber}</Text>
          </View>

          {/* Date Row */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Date</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>{formatDate(safeOrder.createdAt)}</Text>
          </View>

          {/* Shop Row */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shop</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>{safeOrder.storeName}</Text>
          </View>

          {/* Buyer Row */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Buyer</Text>
            <Text style={styles.detailColon}>:</Text>
            <Text style={styles.detailValue}>{safeOrder.customerName}</Text>
          </View>
        </View>

        {/* Payment Method Section */}
        <Text style={styles.paymentMethodLabel}>Payment Method</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentContent}>
            <View style={styles.debtPaymentIcon}>
              <Text style={styles.debtPaymentIconText}>💳</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentText}>Debt (Pay Later)</Text>
              <Text style={styles.paymentSubtext}>
                Due: {formatShortDate(safeOrder.debtDueDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Proceed to Pay Button (only show if not paid) */}
        {!isPaid && (
          <TouchableOpacity
            style={[styles.payButton, paying && styles.payButtonDisabled]}
            onPress={handlePayNow}
            activeOpacity={0.7}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.payButtonText}>Proceed to Pay</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Already Paid Section */}
        {isPaid && (
          <View style={styles.paidSection}>
            {/* Paid Success Message */}
            <View style={styles.paidMessageContainer}>
              <Text style={styles.paidMessageIcon}>✓</Text>
              <Text style={styles.paidMessageText}>This debt has been paid</Text>
            </View>

            {/* View Invoice Button */}
            <TouchableOpacity
              style={styles.viewInvoiceButton}
              onPress={() =>
                router.push({
                  pathname: '/(main)/(customer)/profile/debt-invoice',
                  params: { orderId: safeOrder.id },
                } as any)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.viewInvoiceButtonText}>View Invoice</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  // Header
  headerContainer: {
    paddingTop: vs(20),
    paddingBottom: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Back Button
  backButton: {
    position: 'absolute',
    left: 0,
    top: vs(20),
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
    zIndex: 10,
  },

  backIconImage: {
    width: s(15),
    height: s(15),
  },

  // Title
  title: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: 'center',
    color: '#1E1E1E',
  },

  // Debt Status Card
  debtStatusCard: {
    backgroundColor: '#FFF3E0', // Light orange background
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  debtStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  debtIconContainer: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: '#FF8D2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(15),
  },

  debtIconText: {
    fontSize: ms(28),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  debtStatusInfo: {
    flex: 1,
  },

  debtAmountLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.6)',
    marginBottom: vs(4),
  },

  debtAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(24),
    color: '#FF8D2F',
  },

  statusBadgeLarge: {
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    borderRadius: s(10),
  },

  statusTextLarge: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
  },

  dueDateContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 141, 47, 0.3)',
    paddingTop: vs(15),
  },

  dueDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },

  dueDateLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
    fontWeight: '500',
  },

  dueDateValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#FF8D2F',
    fontWeight: '600',
  },

  daysRemainingText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#FF8D2F',
    fontWeight: '500',
    textAlign: 'right',
  },

  overdueText: {
    color: '#E92B45',
  },

  paidDateText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#3BB77E',
    fontWeight: '500',
    textAlign: 'right',
  },

  // Order Items Card
  orderItemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  cardHeaderTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: '#1E1E1E',
  },

  itemCountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },

  itemCountText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(12),
    color: '#3BB77E',
  },

  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: vs(15),
  },

  itemsList: {
    marginBottom: vs(15),
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    position: 'relative',
  },

  productImageContainer: {
    width: s(48),
    height: s(48),
    borderRadius: s(12),
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: s(12),
  },

  productImage: {
    width: s(48),
    height: s(48),
  },

  productDetails: {
    flex: 1,
  },

  itemName: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: '#1E1E1E',
    lineHeight: ms(14) * 1.4,
    marginBottom: vs(2),
  },

  itemWeight: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#6B7280',
    marginBottom: vs(2),
  },

  itemPrice: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#9CA3AF',
  },

  itemQuantitySection: {
    alignItems: 'flex-end',
  },

  quantityBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
    marginBottom: vs(6),
  },

  quantityText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: '#374151',
  },

  itemAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#3BB77E',
  },

  itemDivider: {
    position: 'absolute',
    bottom: 0,
    left: s(60),
    right: 0,
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  // Billing Section
  billingSection: {
    marginTop: vs(10),
  },

  billingSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: vs(15),
  },

  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },

  billingLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#6B7280',
  },

  billingValue: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: '#1E1E1E',
  },

  totalDivider: {
    height: 2,
    backgroundColor: '#3BB77E',
    marginVertical: vs(12),
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
  },

  totalValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: '#3BB77E',
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },

  detailLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: '#1E1E1E',
    width: s(90),
  },

  detailColon: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.5)',
    marginRight: s(10),
  },

  detailValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.6)',
    flex: 1,
    textAlign: 'right',
  },

  // Payment Method
  paymentMethodLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(18),
    color: '#1E1E1E',
    marginBottom: vs(15),
  },

  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  debtPaymentIcon: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FF8D2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(15),
  },

  debtPaymentIconText: {
    fontSize: ms(20),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  paymentInfo: {
    flex: 1,
  },

  paymentText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
    marginBottom: vs(4),
  },

  paymentSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#FF8D2F',
  },

  // Pay Button
  payButton: {
    backgroundColor: '#3BB77E',
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: vs(20),
  },

  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },

  payButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: '#FFFFFF',
  },

  // Paid Section
  paidSection: {
    marginBottom: vs(20),
  },

  // Paid Message
  paidMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: s(12),
    padding: s(15),
    marginBottom: vs(15),
  },

  paidMessageIcon: {
    fontSize: ms(20),
    color: '#3BB77E',
    marginRight: s(10),
  },

  paidMessageText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: '#3BB77E',
  },

  // View Invoice Button
  viewInvoiceButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  viewInvoiceButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: '#FFFFFF',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(100),
  },

  loadingText: {
    marginTop: vs(15),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(16),
    color: 'rgba(30, 30, 30, 0.5)',
  },

  // Error State
  errorText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
    marginBottom: vs(20),
  },

  goBackButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(32),
  },

  goBackButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: '#FFFFFF',
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(40),
  },
});
