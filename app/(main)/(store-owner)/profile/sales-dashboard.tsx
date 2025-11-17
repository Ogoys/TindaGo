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
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';
import PaymentMethodBadge from '../../../../src/components/common/PaymentMethodBadge';

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
  orderId?: string;
  orderNumber?: string;
  customerEmail?: string;
  customerPhone?: string;
  storeName?: string;
  invoiceId?: string;
  items?: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

const SalesDashboardScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [headerRefreshing, setHeaderRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('all');

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
  
  // Modal state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

      // Sales Dashboard only shows APP ORDERS (not walk-in sales)
      // Walk-in sales are tracked in Sales History instead
      
      // Fetch ledger transactions (SAME AS WALLET/EARNINGS SCREEN)
      const ledgerRef = ref(database, `ledgers/stores/${currentUser.uid}/transactions`);
      const ledgerSnapshot = await get(ledgerRef);
      
      const appOrders: Transaction[] = [];
      
      if (ledgerSnapshot.exists()) {
        const ledgerData = ledgerSnapshot.val();
        
        // Fetch all orders first for efficient lookup
        const ordersRef = ref(database, 'orders');
        const ordersSnapshot = await get(ordersRef);
        const allOrders = ordersSnapshot.exists() ? ordersSnapshot.val() : {};
        
        // Use ledger transactions (which have PAID/SETTLED status)
        for (const [txnId, txn] of Object.entries(ledgerData)) {
          const txnData: any = txn;
          // Only include PAID or SETTLED transactions (same as Wallet)
          if (txnData.status === 'PAID' || txnData.status === 'SETTLED') {
            const totalAmount = txnData.amount || 0;
            const commission = txnData.commission || 0;
            const storeAmount = txnData.storeAmount || (totalAmount - commission);
            const orderNumber = txnData.orderNumber;
            
            // Fetch order items right away
            let orderItems: any[] = [];
            let itemCount = 1;
            
            // Get real customer name from users table
            let realCustomerName = txnData.customerName || 'Customer';
            if (txnData.customerId) {
              try {
                const userRef = ref(database, `users/${txnData.customerId}`);
                const userSnapshot = await get(userRef);
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.val();
                  realCustomerName = userData.name || userData.firstName || txnData.customerName || 'Customer';
                }
              } catch (err) {
                console.error('Error fetching customer name:', err);
              }
            }
            
            if (orderNumber) {
              // Find order by orderNumber
              const orderEntry = Object.entries(allOrders).find(
                ([_, order]: [string, any]) => order.orderNumber === orderNumber
              );
              
              if (orderEntry) {
                const [orderId, orderData]: [string, any] = orderEntry;
                orderItems = orderData.items || [];
                itemCount = orderItems.length || 1;
              }
            }
            
            appOrders.push({
              id: txnId,
              type: 'app-order',
              totalAmount: totalAmount,
              itemsCount: itemCount,
              createdAt: txnData.paidAt || txnData.createdAt,
              customerName: realCustomerName,
              customerEmail: txnData.customerEmail,
              customerPhone: txnData.customerPhone,
              storeName: txnData.storeName,
              status: txnData.status,
              commission: commission,
              storeAmount: storeAmount,
              paymentMethod: txnData.paymentMethod || txnData.method || 'cash',
              orderNumber: orderNumber,
              invoiceId: txnData.invoiceId,
              items: orderItems.map((item: any) => ({
                productName: item.productName || item.name || 'Product',
                quantity: item.quantity || 0,
                price: item.price || 0,
                // Normalize image fields for consistent display
                productImageUrl: item.productImageUrl || item.imageUrl || '',
                productImage: item.productImage || item.image || '',
              })),
            });
          }
        }
      }

      // Sort app orders by date (newest first)
      const allTransactions = appOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

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
  
  // Header refresh button handler
  const handleHeaderRefresh = () => {
    setHeaderRefreshing(true);
    fetchAllSalesData().finally(() => setHeaderRefreshing(false));
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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
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
      <View>
        <ProfileScreenHeader title="Sales Dashboard" />
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleHeaderRefresh}
          disabled={headerRefreshing}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshIcon}>{headerRefreshing ? '⏳' : '🔄'}</Text>
        </TouchableOpacity>
      </View>

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
                style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
                onPress={() => setSelectedFilter('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

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
            </View>

            {/* Filtered Total */}
            <View style={styles.filteredTotalCard}>
              <Text style={styles.filteredTotalLabel}>
                {selectedFilter === 'all' ? 'Total Sales' :
                 selectedFilter === 'today' ? "Today's Total" :
                 selectedFilter === 'week' ? 'This Week Total' :
                 'This Month Total'}
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
                <TouchableOpacity 
                  key={transaction.id} 
                  style={styles.transactionCard}
                  onPress={() => handleTransactionClick(transaction)}
                  activeOpacity={0.7}
                >
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
                      
                      {/* Always show only item count on card */}
                      <Text style={styles.transactionItems}>
                        {transaction.itemsCount} item{transaction.itemsCount > 1 ? 's' : ''}
                      </Text>
                      
                      {transaction.paymentMethod && (
                        <View style={styles.paymentMethodContainer}>
                          <PaymentMethodBadge method={transaction.paymentMethod} size="small" />
                        </View>
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
                  
                  {/* Tap indicator */}
                  <View style={styles.tapIndicator}>
                    <Text style={styles.tapIndicatorText}>Tap for details ›</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
      
      {/* Transaction Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity 
                onPress={() => setShowDetailsModal(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTransaction && (
                <>
                  {/* Order Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Order Information</Text>
                    {selectedTransaction.orderNumber && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Order Number:</Text>
                        <Text style={styles.detailValue}>{selectedTransaction.orderNumber}</Text>
                      </View>
                    )}
                    {selectedTransaction.invoiceId && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Invoice ID:</Text>
                        <Text style={styles.detailValue}>{selectedTransaction.invoiceId.slice(0, 12)}...</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>
                        {selectedTransaction.type === 'walk-in' ? 'Walk-in Sale' : 'App Order'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date & Time:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedTransaction.createdAt)}</Text>
                    </View>
                  </View>
                  
                  {/* Customer Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Customer Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailValue}>{selectedTransaction.customerName}</Text>
                    </View>
                    {selectedTransaction.customerEmail && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Email:</Text>
                        <Text style={styles.detailValue}>{selectedTransaction.customerEmail}</Text>
                      </View>
                    )}
                    {selectedTransaction.customerPhone && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Phone:</Text>
                        <Text style={styles.detailValue}>{selectedTransaction.customerPhone}</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Store Info */}
                  {selectedTransaction.storeName && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Store</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Store Name:</Text>
                        <Text style={styles.detailValue}>{selectedTransaction.storeName}</Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Items */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Items ({selectedTransaction.itemsCount})</Text>
                    {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                      selectedTransaction.items.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.productName}</Text>
                            <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                          </View>
                          <Text style={styles.itemPrice}>₱{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noItemsText}>
                        {selectedTransaction.itemsCount} item{selectedTransaction.itemsCount > 1 ? 's' : ''} (Item details not available)
                      </Text>
                    )}
                  </View>
                  
                  {/* Payment Details */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Payment Details</Text>
                    {selectedTransaction.paymentMethod && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Method:</Text>
                        <PaymentMethodBadge method={selectedTransaction.paymentMethod} size="medium" />
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Amount:</Text>
                      <Text style={[styles.detailValue, styles.amountText]}>₱{selectedTransaction.totalAmount.toFixed(2)}</Text>
                    </View>
                    {selectedTransaction.commission && selectedTransaction.commission > 0 && (
                      <>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Commission (1%):</Text>
                          <Text style={[styles.detailValue, styles.commissionAmount]}>-₱{selectedTransaction.commission.toFixed(2)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                          <Text style={[styles.detailLabel, styles.netLabel]}>Net Earnings:</Text>
                          <Text style={[styles.detailValue, styles.netAmount]}>₱{(selectedTransaction.storeAmount || 0).toFixed(2)}</Text>
                        </View>
                      </>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  
  refreshButton: {
    position: 'absolute',
    right: s(20),
    top: vs(79),
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  
  refreshIcon: {
    fontSize: ms(20),
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
    padding: s(16),
    marginBottom: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
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
    alignItems: 'flex-start',
  },

  transactionInfo: {
    flex: 1,
    marginRight: s(10),
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
    marginBottom: vs(4),
  },
  
  paymentMethodContainer: {
    marginTop: vs(4),
  },
  
  transactionOrderId: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#9E9E9E',
    marginTop: vs(2),
    marginBottom: vs(4),
  },
  
  itemsList: {
    marginTop: vs(6),
    marginBottom: vs(4),
  },
  
  itemDetail: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.darkGray,
    lineHeight: vs(18),
    marginBottom: vs(2),
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
  
  tapIndicator: {
    marginTop: vs(8),
    paddingTop: vs(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  
  tapIndicatorText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: s(24),
    borderTopRightRadius: s(24),
    maxHeight: '90%',
    paddingBottom: vs(30),
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
  },
  
  closeButton: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeButtonText: {
    fontSize: ms(18),
    color: Colors.darkGray,
  },
  
  detailSection: {
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  detailSectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(12),
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(8),
  },
  
  detailLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    flex: 1,
  },
  
  detailValue: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    flex: 1,
    textAlign: 'right',
  },
  
  paymentMethodBadge: {
    backgroundColor: Colors.primary,
    color: Colors.white,
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(6),
    overflow: 'hidden',
  },
  
  amountText: {
    fontSize: ms(16),
    color: Colors.primary,
  },
  
  commissionAmount: {
    color: '#EF5350',
  },
  
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: vs(10),
  },
  
  netLabel: {
    fontWeight: '700',
    fontSize: ms(15),
  },
  
  netAmount: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#4CAF50',
  },
  
  loadingItems: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
  },
  
  loadingItemsText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
    marginLeft: s(10),
  },
  
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
    backgroundColor: 'rgba(59, 183, 126, 0.05)',
    borderRadius: s(8),
    marginBottom: vs(6),
  },
  
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  itemName: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    flex: 1,
  },
  
  itemQuantity: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: s(8),
  },
  
  itemPrice: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginLeft: s(12),
  },
  
  noItemsText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default SalesDashboardScreen;
