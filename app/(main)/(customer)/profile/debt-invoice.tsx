/**
 * DEBT INVOICE SCREEN - Receipt-style invoice for paid debts
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Baseline: 440x956
 *
 * Shows paid debt invoice in receipt format with scalloped edges
 * Similar to regular invoice but includes debt-specific information
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ref, get } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import type { Order, OrderItem } from '../../../../src/models/Order';
import { Share } from 'react-native';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

export default function DebtInvoiceScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const invoiceRef = useRef<View>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderRef = ref(database, `orders/${orderId}`);
      const snapshot = await get(orderRef);
      if (snapshot.exists()) {
        setOrder({ ...snapshot.val(), id: orderId } as Order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleShareText = async () => {
    if (!order) return;

    try {
      setSharing(true);

      const invoiceText = `
🧾 DEBT PAYMENT INVOICE - ${order.storeName || 'Store'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 DEBT PAYMENT CONFIRMED
Status: PAID ✓

Order #: ${order.orderNumber || order.id}
Order Date: ${formatDate(order.createdAt)}
Due Date: ${formatDate(order.debtDueDate)}
Paid Date: ${formatDate(order.debtPaidDate)}

📦 ITEMS:
${order.items.map((item, i) =>
  `${i + 1}. ${item.productName}\n   Qty: ${item.quantity} × ₱${item.price?.toFixed(2) || '0.00'} = ₱${item.subtotal?.toFixed(2) || '0.00'}`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: ₱${order.subtotal?.toFixed(2) || '0.00'}
TOTAL PAID: ₱${order.total?.toFixed(2) || '0.00'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment Method: Debt (Pay Later)
Customer: ${order.customerName}

Thank you for settling your debt! 🙏
      `.trim();

      await Share.share(
        {
          message: invoiceText,
          title: `Debt Invoice ${order.orderNumber || order.id}`,
        },
        {
          dialogTitle: 'Share Debt Invoice',
        }
      );

      console.log('✅ Debt invoice shared successfully');
    } catch (error) {
      console.error('❌ Error sharing invoice:', error);
      Alert.alert('Share Failed', 'Could not share invoice. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

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

  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debt Invoice</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Paid Status Banner */}
        <View style={styles.paidBanner}>
          <View style={styles.paidIconContainer}>
            <Ionicons name="checkmark-circle" size={ms(32)} color="#FFFFFF" />
          </View>
          <View style={styles.paidBannerText}>
            <Text style={styles.paidTitle}>Debt Payment Confirmed</Text>
            <Text style={styles.paidSubtitle}>
              Paid on {formatShortDate(order.debtPaidDate)}
            </Text>
          </View>
        </View>

        {/* Receipt Card */}
        <View ref={invoiceRef} collapsable={false} style={styles.captureContainer}>
          <View style={styles.receiptCard}>
            {/* Scalloped Top */}
            <View style={styles.scallopTop}>
              {[...Array(13)].map((_, i) => (
                <View key={`top-${i}`} style={styles.scallopCircle} />
              ))}
            </View>

            {/* Bill Content */}
            <View style={styles.billContent}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Count</Text>
                <Text style={styles.billValue}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Subtotal</Text>
                <Text style={styles.billValue}>
                  P{formatCurrency(order.subtotal)}
                </Text>
              </View>

              {/* Dashed Line */}
              <View style={styles.dashedContainer}>
                {[...Array(20)].map((_, i) => (
                  <View key={i} style={styles.dash} />
                ))}
              </View>

              {/* Grand Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>
                  P{formatCurrency(order.total)}
                </Text>
              </View>
            </View>

            {/* Scalloped Bottom */}
            <View style={styles.scallopBottom}>
              {[...Array(13)].map((_, i) => (
                <View key={`bot-${i}`} style={styles.scallopCircle} />
              ))}
            </View>
          </View>

          {/* Order Items Card */}
          <View style={styles.itemsCard}>
            <Text style={styles.itemsCardTitle}>Order Items</Text>
            {order.items?.map((item: OrderItem, index: number) => {
              const imageSource = getProductImageSource(
                {
                  productImageUrl: (item as any).productImageUrl,
                  productImage: item.productImage,
                },
                'small'
              );

              return (
                <View key={item.productId || index} style={styles.itemRow}>
                  <View style={styles.productImageContainer}>
                    <Image
                      source={imageSource}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.productName}
                    </Text>
                    <Text style={styles.itemPrice}>
                      P{formatCurrency(item.price)} x {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.itemSubtotal}>
                    P{formatCurrency(item.subtotal)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Order Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{order.orderNumber || order.id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Date</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{formatDate(order.createdAt)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{formatDate(order.debtDueDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid Date</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={[styles.detailValue, { color: '#3BB77E' }]}>
                {formatDate(order.debtPaidDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shop</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{order.storeName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Buyer</Text>
              <Text style={styles.detailColon}>:</Text>
              <Text style={styles.detailValue}>{order.customerName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={styles.detailColon}>:</Text>
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentBadgeText}>💳 Debt (Pay Later)</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Share Button */}
      <View style={styles.shareContainer}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShareText}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="share-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.shareText}>Share Invoice</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: vs(10),
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    color: '#666',
  },
  errorText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#666',
    marginBottom: vs(20),
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: s(30),
    paddingVertical: vs(12),
    borderRadius: s(10),
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: s(20),
    paddingBottom: vs(100),
  },

  // Paid Banner
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3BB77E',
    borderRadius: s(16),
    padding: s(16),
    marginBottom: vs(20),
  },
  paidIconContainer: {
    marginRight: s(15),
  },
  paidBannerText: {
    flex: 1,
  },
  paidTitle: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: vs(4),
  },
  paidSubtitle: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  captureContainer: {
    backgroundColor: '#F4F6F6',
  },
  receiptCard: {
    backgroundColor: '#FFF',
    borderRadius: s(20),
    marginBottom: vs(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scallopTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  scallopBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  scallopCircle: {
    width: s(26),
    height: vs(20),
    backgroundColor: '#F4F6F6',
    borderRadius: s(13),
  },
  billContent: {
    paddingHorizontal: s(20),
    paddingTop: vs(35),
    paddingBottom: vs(35),
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(14),
  },
  billLabel: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: '#1E1E1E',
  },
  billValue: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  dashedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: vs(18),
    paddingHorizontal: s(5),
  },
  dash: {
    width: s(7),
    height: 2,
    backgroundColor: '#1E1E1E',
    borderRadius: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: vs(5),
  },
  totalLabel: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#3BB77E',
  },
  totalValue: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '700',
    color: '#3BB77E',
  },

  // Items Card
  itemsCard: {
    backgroundColor: '#FFF',
    padding: s(20),
    borderRadius: s(20),
    marginBottom: vs(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  itemsCardTitle: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(15),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImageContainer: {
    width: s(45),
    height: s(45),
    borderRadius: s(10),
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: s(12),
  },
  productImage: {
    width: s(45),
    height: s(45),
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: '#1E1E1E',
    marginBottom: vs(4),
  },
  itemPrice: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    color: '#9CA3AF',
  },
  itemSubtotal: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#3BB77E',
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#FFF',
    padding: s(20),
    borderRadius: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(14),
  },
  detailLabel: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#1E1E1E',
    width: s(85),
  },
  detailColon: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: '#1E1E1E',
    marginHorizontal: s(8),
  },
  detailValue: {
    flex: 1,
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: '#555',
    lineHeight: ms(20),
  },
  paymentBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(8),
  },
  paymentBadgeText: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#FF8D2F',
  },

  // Share Button
  shareContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  shareBtn: {
    backgroundColor: '#3BB77E',
    height: vs(50),
    borderRadius: s(15),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: '#FFF',
  },
});
