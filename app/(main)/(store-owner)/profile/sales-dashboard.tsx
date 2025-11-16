/**
 * SALES DASHBOARD SCREEN
 * 
 * Comprehensive sales module showing:
 * - Daily/Weekly/Monthly sales totals
 * - Transaction history (Walk-in + App Orders)
 * - Sales analytics for decision-making
 * - Date filtering
 * 
 * Objective: Track daily sales activities, provide transaction history,
 * and support better business decision-making through accurate sales data
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
} from 'react-native';
import { router } from 'expo-router';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { getWalkInSales } from '../../../../src/api/walkInSales';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';

interface Transaction {
  id: string;
  type: 'walk-in' | 'app-order';
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  customerName?: string;
  status?: string;
  commission?: number;
  storeAmount?: number;
  paymentMethod?: string;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

const SalesDashboardScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('today');

  // Sales totals
  const [todaySales, setTodaySales] = useState(0);
  const [weekSales, setWeekSales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  
  // Commission tracking
  const [todayCommission, setTodayCommission] = useState(0);
  const [weekCommission, setWeekCommission] = useState(0);
  const [monthCommission, setMonthCommission] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    fetchAllSalesData();
  }, []);

  const fetchAllSalesData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch walk-in sales
      const walkInSales = await getWalkInSales(currentUser.uid);

      // Fetch app orders and their ledger transactions (OPTIMIZED: single get() call)
      const ordersRef = ref(database, 'orders');
      const ordersQuery = query(
        ordersRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );

      const snapshot = await get(ordersQuery);
      const appOrders: Transaction[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Fetch ledger transactions for commission data
        const ledgerRef = ref(database, `ledgers/stores/${currentUser.uid}/transactions`);
        const ledgerSnapshot = await get(ledgerRef);
        
        const ledgerData = ledgerSnapshot.exists() ? ledgerSnapshot.val() : {};
        
        Object.keys(data).forEach(key => {
          const order = data[key];
          // Only include completed orders
          if (order.status === 'completed' || order.status === 'delivered') {
            // Find matching ledger transaction
            const ledgerTxn = Object.values(ledgerData).find(
              (txn: any) => txn.orderId === key || txn.orderNumber === order.orderNumber
            ) as any;
            
            appOrders.push({
              id: key,
              type: 'app-order',
              totalAmount: order.totalAmount || 0,
              itemsCount: order.items?.length || 0,
              createdAt: order.createdAt,
              customerName: order.customerName || 'Customer',
              status: order.status,
              commission: ledgerTxn?.commission || 0,
              storeAmount: ledgerTxn?.storeAmount || order.totalAmount || 0,
              paymentMethod: order.paymentMethod || 'COD',
            });
          }
        });
      }

      // Combine walk-in and app orders
      const walkInTransactions: Transaction[] = walkInSales.map(sale => ({
        id: sale.id,
        type: 'walk-in' as const,
        totalAmount: sale.totalAmount,
        itemsCount: sale.items.length,
        createdAt: sale.createdAt,
        customerName: sale.customerName || 'Walk-in Customer',
      }));

      const allTransactions = [...walkInTransactions, ...appOrders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setTransactions(allTransactions);
      calculateTotals(allTransactions);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchAllSalesData();
  };

  const calculateTotals = (allTransactions: Transaction[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0;
    let week = 0;
    let month = 0;
    let total = 0;
    
    let todayComm = 0;
    let weekComm = 0;
    let monthComm = 0;
    let totalComm = 0;

    allTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      const amount = transaction.totalAmount;
      const commission = transaction.commission || 0;

      total += amount;
      totalComm += commission;

      if (transactionDate >= todayStart) {
        today += amount;
        todayComm += commission;
      }
      if (transactionDate >= weekStart) {
        week += amount;
        weekComm += commission;
      }
      if (transactionDate >= monthStart) {
        month += amount;
        monthComm += commission;
      }
    });

    setTodaySales(today);
    setWeekSales(week);
    setMonthSales(month);
    setTotalSales(total);
    
    setTodayCommission(todayComm);
    setWeekCommission(weekComm);
    setMonthCommission(monthComm);
    setTotalCommission(totalComm);
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    
    switch (selectedFilter) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return transactions.filter(t => new Date(t.createdAt) >= todayStart);
      
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactions.filter(t => new Date(t.createdAt) >= weekStart);
      
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactions.filter(t => new Date(t.createdAt) >= monthStart);
      
      case 'all':
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();
  const filteredTotal = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

  const handleBack = () => {
    router.back();
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <ProfileScreenHeader title="Sales Dashboard" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading sales data...</Text>
          </View>
        ) : (
          <>
            {/* Sales Summary Cards */}
            <Text style={styles.sectionTitle}>Sales Overview</Text>
            
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.todayCard]}>
                <Text style={styles.summaryLabel}>Today</Text>
                <Text style={styles.summaryAmount}>₱{todaySales.toFixed(2)}</Text>
                {todayCommission > 0 && (
                  <Text style={styles.commissionText}>-₱{todayCommission.toFixed(2)} comm</Text>
                )}
                <Text style={styles.summarySubtext}>
                  {transactions.filter(t => {
                    const today = new Date();
                    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    return new Date(t.createdAt) >= todayStart;
                  }).length} transactions
                </Text>
                {todayCommission > 0 && (
                  <Text style={styles.netEarnings}>Net: ₱{(todaySales - todayCommission).toFixed(2)}</Text>
                )}
              </View>

              <View style={[styles.summaryCard, styles.weekCard]}>
                <Text style={styles.summaryLabel}>This Week</Text>
                <Text style={styles.summaryAmount}>₱{weekSales.toFixed(2)}</Text>
                {weekCommission > 0 && (
                  <Text style={styles.commissionText}>-₱{weekCommission.toFixed(2)} comm</Text>
                )}
                <Text style={styles.summarySubtext}>
                  {transactions.filter(t => {
                    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(t.createdAt) >= weekStart;
                  }).length} transactions
                </Text>
                {weekCommission > 0 && (
                  <Text style={styles.netEarnings}>Net: ₱{(weekSales - weekCommission).toFixed(2)}</Text>
                )}
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.monthCard]}>
                <Text style={styles.summaryLabel}>This Month</Text>
                <Text style={styles.summaryAmount}>₱{monthSales.toFixed(2)}</Text>
                {monthCommission > 0 && (
                  <Text style={styles.commissionText}>-₱{monthCommission.toFixed(2)} comm</Text>
                )}
                <Text style={styles.summarySubtext}>
                  {transactions.filter(t => {
                    const now = new Date();
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    return new Date(t.createdAt) >= monthStart;
                  }).length} transactions
                </Text>
                {monthCommission > 0 && (
                  <Text style={styles.netEarnings}>Net: ₱{(monthSales - monthCommission).toFixed(2)}</Text>
                )}
              </View>

              <View style={[styles.summaryCard, styles.totalCard]}>
                <Text style={styles.summaryLabel}>All Time</Text>
                <Text style={styles.summaryAmount}>₱{totalSales.toFixed(2)}</Text>
                {totalCommission > 0 && (
                  <Text style={styles.commissionText}>-₱{totalCommission.toFixed(2)} comm</Text>
                )}
                <Text style={styles.summarySubtext}>{transactions.length} transactions</Text>
                {totalCommission > 0 && (
                  <Text style={styles.netEarnings}>Net: ₱{(totalSales - totalCommission).toFixed(2)}</Text>
                )}
              </View>
            </View>

            {/* Filter Buttons */}
            <Text style={styles.sectionTitle}>Transaction History</Text>
            
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, selectedFilter === 'today' && styles.filterButtonActive]}
                onPress={() => setSelectedFilter('today')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, selectedFilter === 'today' && styles.filterTextActive]}>
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, selectedFilter === 'week' && styles.filterButtonActive]}
                onPress={() => setSelectedFilter('week')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, selectedFilter === 'week' && styles.filterTextActive]}>
                  This Week
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, selectedFilter === 'month' && styles.filterButtonActive]}
                onPress={() => setSelectedFilter('month')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, selectedFilter === 'month' && styles.filterTextActive]}>
                  This Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
                onPress={() => setSelectedFilter('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filtered Total */}
            <View style={styles.filteredTotalCard}>
              <Text style={styles.filteredTotalLabel}>
                {selectedFilter === 'today' ? "Today's Total" :
                 selectedFilter === 'week' ? 'This Week Total' :
                 selectedFilter === 'month' ? 'This Month Total' :
                 'Total Sales'}
              </Text>
              <Text style={styles.filteredTotalAmount}>₱{filteredTotal.toFixed(2)}</Text>
            </View>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No transactions found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {selectedFilter !== 'all' 
                    ? 'Try selecting a different time period'
                    : 'Start recording sales to see them here'}
                </Text>
              </View>
            ) : (
              filteredTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionHeader}>
                    <View style={[
                      styles.transactionTypeBadge,
                      transaction.type === 'walk-in' ? styles.walkInBadge : styles.appOrderBadge
                    ]}>
                      <Text style={styles.transactionTypeText}>
                        {transaction.type === 'walk-in' ? 'Walk-in' : 'App Order'}
                      </Text>
                    </View>
                    <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
                  </View>

                  <View style={styles.transactionBody}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCustomer}>
                        {transaction.customerName || 'Customer'}
                      </Text>
                      <Text style={styles.transactionItems}>
                        {transaction.itemsCount} item{transaction.itemsCount > 1 ? 's' : ''}
                      </Text>
                      {transaction.paymentMethod && (
                        <Text style={styles.paymentMethod}>{transaction.paymentMethod}</Text>
                      )}
                    </View>
                    <View style={styles.transactionAmountContainer}>
                      <Text style={styles.transactionAmount}>₱{transaction.totalAmount.toFixed(2)}</Text>
                      {transaction.commission && transaction.commission > 0 && (
                        <>
                          <Text style={styles.transactionCommission}>-₱{transaction.commission.toFixed(2)}</Text>
                          <Text style={styles.transactionNetAmount}>Net: ₱{(transaction.storeAmount || 0).toFixed(2)}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  loadingContainer: {
    alignItems: 'center',
    paddingTop: vs(100),
  },

  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: Colors.textSecondary,
    marginTop: vs(15),
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginBottom: vs(15),
    marginTop: vs(5),
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(15),
    gap: s(10),
  },

  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },

  weekCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },

  monthCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  summaryLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
    marginBottom: vs(6),
  },

  summaryAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },

  summarySubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
  },
  
  commissionText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#EF5350',
    marginTop: vs(2),
  },
  
  netEarnings: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: '#4CAF50',
    marginTop: vs(4),
  },

  filterContainer: {
    flexDirection: 'row',
    marginBottom: vs(15),
    gap: s(8),
  },

  filterButton: {
    flex: 1,
    paddingVertical: vs(10),
    paddingHorizontal: s(10),
    borderRadius: s(10),
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.darkGray,
  },

  filterTextActive: {
    color: Colors.white,
  },

  filteredTotalCard: {
    backgroundColor: Colors.primary,
    borderRadius: s(16),
    paddingVertical: vs(18),
    paddingHorizontal: s(20),
    marginBottom: vs(20),
    alignItems: 'center',
  },

  filteredTotalLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.white,
    marginBottom: vs(6),
  },

  filteredTotalAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(28),
    color: Colors.white,
  },

  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingVertical: vs(50),
    alignItems: 'center',
  },

  emptyStateText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(6),
  },

  emptyStateSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  transactionCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(12),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },

  transactionTypeBadge: {
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: s(8),
  },

  walkInBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },

  appOrderBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
  },

  transactionTypeText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: Colors.darkGray,
  },

  transactionDate: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  transactionBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  transactionInfo: {
    flex: 1,
  },

  transactionCustomer: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
    marginBottom: vs(3),
  },

  transactionItems: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
  },
  
  paymentMethod: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#2196F3',
    marginTop: vs(2),
    fontWeight: '500',
  },
  
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },

  transactionAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
  },
  
  transactionCommission: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#EF5350',
    marginTop: vs(2),
  },
  
  transactionNetAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: '#4CAF50',
    marginTop: vs(2),
  },
});

export default SalesDashboardScreen;
