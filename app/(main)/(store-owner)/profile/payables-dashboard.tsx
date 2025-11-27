/**
 * PAYABLES DASHBOARD SCREEN
 *
 * Professional accounting-style view of all outstanding debts to suppliers.
 * Shows aging report, payment due dates, and quick payment actions.
 *
 * Features:
 * - Total payables summary
 * - Overdue count and urgent warnings
 * - Aging report (0-30, 31-60, 61-90, 90+ days)
 * - Supplier-wise breakdown
 * - Quick "Mark as Paid" actions
 * - Due soon alerts
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
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ref, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { PurchaseOrder } from '../../../../src/models/PurchaseOrder';

interface PayableItem {
  id: string;
  orderNumber: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  purchaseDate: string;
  daysOverdue: number;
  isOverdue: boolean;
  isDueSoon: boolean; // Due within 7 days
}

interface AgingBucket {
  label: string;
  amount: number;
  count: number;
  color: string;
}

interface SupplierPayables {
  name: string;
  totalAmount: number;
  orders: PayableItem[];
  overdueCount: number;
}

const PayablesDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payables, setPayables] = useState<PayableItem[]>([]);
  const [totalPayables, setTotalPayables] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueSoonCount, setDueSoonCount] = useState(0);
  const [agingBuckets, setAgingBuckets] = useState<AgingBucket[]>([]);
  const [supplierPayables, setSupplierPayables] = useState<SupplierPayables[]>([]);

  useEffect(() => {
    fetchPayables();
  }, []);

  const fetchPayables = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch all purchase orders
      const purchaseOrdersRef = ref(database, 'purchase_orders');
      const userOrdersQuery = query(
        purchaseOrdersRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );

      const snapshot = await get(userOrdersQuery);

      if (!snapshot.exists()) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const orders = snapshot.val();
      const payablesList: PayableItem[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Extract unpaid orders
      Object.keys(orders).forEach((orderId) => {
        const order: PurchaseOrder = orders[orderId];

        // Only include unpaid debt orders
        if (order.paymentStatus === 'unpaid' && order.paymentMethod === 'debt' && order.debtDueDate) {
          const dueDate = new Date(order.debtDueDate);
          dueDate.setHours(0, 0, 0, 0);

          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const isOverdue = today > dueDate;
          const isDueSoon = !isOverdue && diffDays >= -7; // Due within 7 days

          const purchaseDate = order.purchaseDate || order.createdAt;
          const orderYear = purchaseDate ? new Date(purchaseDate).getFullYear() : 2025;
          const orderCount = payablesList.length + 1;
          const orderNumber = order.purchaseOrderNumber || `${orderYear}-${String(orderCount).padStart(3, '0')}`;

          payablesList.push({
            id: orderId,
            orderNumber,
            supplierName: order.supplierName || 'Unknown Supplier',
            amount: order.totalCost || 0,
            dueDate: order.debtDueDate,
            purchaseDate: purchaseDate || '',
            daysOverdue: isOverdue ? diffDays : 0,
            isOverdue,
            isDueSoon,
          });
        }
      });

      // Calculate totals
      const total = payablesList.reduce((sum, item) => sum + item.amount, 0);
      const overdue = payablesList.filter(item => item.isOverdue).length;
      const dueSoon = payablesList.filter(item => item.isDueSoon).length;

      // Calculate aging buckets
      const aging = calculateAgingBuckets(payablesList);

      // Group by supplier
      const bySupplier = groupBySupplier(payablesList);

      // Sort: Overdue first, then due soon, then by due date
      payablesList.sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        if (a.isDueSoon !== b.isDueSoon) return a.isDueSoon ? -1 : 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      setPayables(payablesList);
      setTotalPayables(total);
      setOverdueCount(overdue);
      setDueSoonCount(dueSoon);
      setAgingBuckets(aging);
      setSupplierPayables(bySupplier);
    } catch (error) {
      console.error('Error fetching payables:', error);
      Alert.alert('Error', 'Failed to load payables');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateAgingBuckets = (items: PayableItem[]): AgingBucket[] => {
    const buckets = [
      { label: 'Current (0-30 days)', amount: 0, count: 0, color: '#4CAF50' },
      { label: '31-60 days', amount: 0, count: 0, color: '#FF9800' },
      { label: '61-90 days', amount: 0, count: 0, color: '#FF5722' },
      { label: 'Over 90 days', amount: 0, count: 0, color: '#E92B45' },
    ];

    items.forEach(item => {
      if (item.isOverdue) {
        const days = item.daysOverdue;
        if (days <= 30) {
          buckets[0].amount += item.amount;
          buckets[0].count++;
        } else if (days <= 60) {
          buckets[1].amount += item.amount;
          buckets[1].count++;
        } else if (days <= 90) {
          buckets[2].amount += item.amount;
          buckets[2].count++;
        } else {
          buckets[3].amount += item.amount;
          buckets[3].count++;
        }
      } else {
        // Not overdue = current
        buckets[0].amount += item.amount;
        buckets[0].count++;
      }
    });

    return buckets.filter(b => b.count > 0);
  };

  const groupBySupplier = (items: PayableItem[]): SupplierPayables[] => {
    const grouped = new Map<string, SupplierPayables>();

    items.forEach(item => {
      if (!grouped.has(item.supplierName)) {
        grouped.set(item.supplierName, {
          name: item.supplierName,
          totalAmount: 0,
          orders: [],
          overdueCount: 0,
        });
      }

      const supplier = grouped.get(item.supplierName)!;
      supplier.totalAmount += item.amount;
      supplier.orders.push(item);
      if (item.isOverdue) supplier.overdueCount++;
    });

    return Array.from(grouped.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const handleMarkAsPaid = async (item: PayableItem) => {
    Alert.alert(
      'Mark as Paid?',
      `Confirm payment of ₱${formatCurrency(item.amount)} to ${item.supplierName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          onPress: async () => {
            try {
              const orderRef = ref(database, `purchase_orders/${item.id}`);
              await update(orderRef, {
                paymentStatus: 'paid',
                'paymentInfo/paidAt': new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              Alert.alert('Success', 'Payment marked as paid!');
              fetchPayables(); // Refresh
            } catch (error) {
              console.error('Error marking as paid:', error);
              Alert.alert('Error', 'Failed to update payment status');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayables();
  };

  const handleBack = () => {
    router.back();
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Image
              source={require('../../../../src/assets/images/store-product/chevron-left.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payables</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading payables...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/store-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payables Dashboard</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>💳 Outstanding Payables</Text>
          <Text style={styles.summaryAmount}>₱{formatCurrency(totalPayables)}</Text>

          {overdueCount > 0 && (
            <View style={styles.urgentBanner}>
              <Text style={styles.urgentText}>
                🔴 URGENT: {overdueCount} overdue payment{overdueCount > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {dueSoonCount > 0 && (
            <View style={styles.dueSoonBanner}>
              <Text style={styles.dueSoonText}>
                ⏰ {dueSoonCount} payment{dueSoonCount > 1 ? 's' : ''} due within 7 days
              </Text>
            </View>
          )}

          {payables.length === 0 && (
            <View style={styles.noPayablesContainer}>
              <Text style={styles.noPayablesIcon}>✅</Text>
              <Text style={styles.noPayablesText}>All Caught Up!</Text>
              <Text style={styles.noPayablesSubtext}>No outstanding payables</Text>
            </View>
          )}
        </View>

        {/* Aging Report */}
        {agingBuckets.length > 0 && (
          <View style={styles.agingCard}>
            <Text style={styles.agingTitle}>📊 Aging Report</Text>
            {agingBuckets.map((bucket, index) => (
              <View key={index} style={styles.agingRow}>
                <View style={styles.agingLabelRow}>
                  <View style={[styles.agingDot, { backgroundColor: bucket.color }]} />
                  <Text style={styles.agingLabel}>{bucket.label}</Text>
                </View>
                <View style={styles.agingValueRow}>
                  <Text style={styles.agingAmount}>₱{formatCurrency(bucket.amount)}</Text>
                  <Text style={styles.agingCount}>({bucket.count})</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* By Supplier */}
        {supplierPayables.length > 0 && (
          <View style={styles.supplierSection}>
            <Text style={styles.sectionTitle}>By Supplier</Text>
            {supplierPayables.map((supplier, index) => (
              <View key={index} style={styles.supplierCard}>
                <View style={styles.supplierHeader}>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.supplierAmount}>₱{formatCurrency(supplier.totalAmount)}</Text>
                </View>
                <Text style={styles.supplierOrders}>
                  {supplier.orders.length} order{supplier.orders.length > 1 ? 's' : ''}
                  {supplier.overdueCount > 0 && (
                    <Text style={styles.supplierOverdue}> • 🔴 {supplier.overdueCount} overdue</Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* All Payables List */}
        {payables.length > 0 && (
          <View style={styles.payablesSection}>
            <Text style={styles.sectionTitle}>All Payables</Text>
            {payables.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.payableCard,
                  item.isOverdue && styles.payableCardOverdue,
                  item.isDueSoon && !item.isOverdue && styles.payableCardDueSoon,
                ]}
              >
                <View style={styles.payableHeader}>
                  <Text style={styles.payableOrderNumber}>{item.orderNumber}</Text>
                  {item.isOverdue ? (
                    <View style={styles.overdueBadge}>
                      <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                    </View>
                  ) : item.isDueSoon ? (
                    <View style={styles.dueSoonBadge}>
                      <Text style={styles.dueSoonBadgeText}>DUE SOON</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.payableSupplier}>{item.supplierName}</Text>
                <Text style={styles.payableAmount}>₱{formatCurrency(item.amount)}</Text>

                {item.isOverdue ? (
                  <Text style={styles.payableOverdueText}>
                    🔴 Overdue by {item.daysOverdue} day{item.daysOverdue > 1 ? 's' : ''}
                  </Text>
                ) : (
                  <Text style={styles.payableDueDate}>Due: {formatDate(item.dueDate)}</Text>
                )}

                <TouchableOpacity
                  style={styles.markPaidButton}
                  onPress={() => handleMarkAsPaid(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.markPaidButtonText}>✅ MARK AS PAID</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },

  header: {
    backgroundColor: '#F4F6F6',
    paddingTop: vs(79),
    paddingBottom: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(79),
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  backIcon: {
    width: s(15),
    height: s(15),
  },

  headerTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    color: '#1E1E1E',
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(30),
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vs(100),
  },

  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: '#64748B',
    marginTop: vs(15),
  },

  // Summary Card
  summaryCard: {
    width: s(400),
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },

  summaryTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
    marginBottom: vs(10),
  },

  summaryAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(36),
    color: '#FF9800',
    marginBottom: vs(15),
  },

  urgentBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: s(10),
    padding: s(12),
    marginBottom: vs(8),
    borderLeftWidth: 4,
    borderLeftColor: '#E92B45',
  },

  urgentText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#E92B45',
    fontWeight: '700',
  },

  dueSoonBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: s(10),
    padding: s(12),
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  dueSoonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#FF9800',
    fontWeight: '600',
  },

  noPayablesContainer: {
    alignItems: 'center',
    paddingVertical: vs(20),
  },

  noPayablesIcon: {
    fontSize: ms(48),
    marginBottom: vs(10),
  },

  noPayablesText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.primary,
    marginBottom: vs(5),
  },

  noPayablesSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#64748B',
  },

  // Aging Report
  agingCard: {
    width: s(400),
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  agingTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
    marginBottom: vs(15),
  },

  agingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  agingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  agingDot: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    marginRight: s(10),
  },

  agingLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#1E1E1E',
  },

  agingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  agingAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: '#1E1E1E',
    marginRight: s(5),
  },

  agingCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#64748B',
  },

  // Supplier Section
  supplierSection: {
    marginBottom: vs(20),
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
    marginBottom: vs(12),
  },

  supplierCard: {
    width: s(400),
    backgroundColor: '#FFFFFF',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(10),
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },

  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(6),
  },

  supplierName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: '#1E1E1E',
    flex: 1,
  },

  supplierAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: '#FF9800',
  },

  supplierOrders: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#64748B',
  },

  supplierOverdue: {
    color: '#E92B45',
    fontWeight: '600',
  },

  // Payables List
  payablesSection: {
    marginBottom: vs(20),
  },

  payableCard: {
    width: s(400),
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(12),
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  payableCardOverdue: {
    borderColor: '#E92B45',
    backgroundColor: '#FFEBEE',
  },

  payableCardDueSoon: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },

  payableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },

  payableOrderNumber: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
  },

  overdueBadge: {
    backgroundColor: '#E92B45',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
  },

  overdueBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  dueSoonBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
  },

  dueSoonBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  payableSupplier: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#64748B',
    marginBottom: vs(4),
  },

  payableAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(28),
    color: '#FF9800',
    marginBottom: vs(8),
  },

  payableOverdueText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#E92B45',
    fontWeight: '600',
    marginBottom: vs(12),
  },

  payableDueDate: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#64748B',
    marginBottom: vs(12),
  },

  markPaidButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  markPaidButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(15),
    color: '#FFFFFF',
  },
});

export default PayablesDashboardScreen;
