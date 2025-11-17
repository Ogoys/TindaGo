/**
 * SALES HISTORY SCREEN
 * 
 * Complete transaction records for both walk-in and in-app sales
 * Features:
 * - Search by customer name
 * - Filter by type (walk-in/app order), payment method, date range
 * - Detailed transaction view with commission breakdown
 * - Chronological listing with all sales records
 */

import { router } from 'expo-router';
import { equalTo, get, orderByChild, query, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth, database } from '../../../../FirebaseConfig';
import { getWalkInSales } from '../../../../src/api/walkInSales';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { ms, s, vs } from '../../../../src/constants/responsive';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';
import PaymentMethodBadge from '../../../../src/components/common/PaymentMethodBadge';

interface SaleTransaction {
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
  items: any[];
}

type FilterType = 'all' | 'walk-in' | 'app-order';
type PaymentFilter = 'all' | 'Cash' | 'COD' | 'GCash' | 'PayMaya';

const SalesHistoryScreen = () => {
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [headerRefreshing, setHeaderRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SaleTransaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  useEffect(() => {
    fetchAllSales();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, typeFilter, paymentFilter]);

  const fetchAllSales = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Fetch walk-in sales
      const walkInSales = await getWalkInSales(currentUser.uid);

      // Fetch app orders from LEDGER (same as Sales Dashboard)
      const ledgerRef = ref(database, `ledgers/stores/${currentUser.uid}/transactions`);
      const ledgerSnapshot = await get(ledgerRef);
      
      const appOrders: SaleTransaction[] = [];

      if (ledgerSnapshot.exists()) {
        const ledgerData = ledgerSnapshot.val();
        
        // Fetch all orders first for efficient lookup
        const ordersRef = ref(database, 'orders');
        const ordersSnapshot = await get(ordersRef);
        const allOrders = ordersSnapshot.exists() ? ordersSnapshot.val() : {};
        
        // Use ledger transactions (which have PAID/SETTLED status)
        for (const [txnId, txn] of Object.entries(ledgerData)) {
          const txnData: any = txn;
          // Only include PAID or SETTLED transactions (same as Sales Dashboard)
          if (txnData.status === 'PAID' || txnData.status === 'SETTLED') {
            const totalAmount = txnData.amount || 0;
            const commission = txnData.commission || 0;
            const storeAmount = txnData.storeAmount || (totalAmount - commission);
            const orderNumber = txnData.orderNumber;
            
            // Fetch order items
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
                // Normalize item fields for consistent display
                orderItems = (orderData.items || []).map((item: any) => ({
                  ...item,
                  // Ensure consistent field names for images
                  productImageUrl: item.productImageUrl || item.imageUrl || '',
                  productImage: item.productImage || item.image || '',
                  // Ensure consistent field names for other properties
                  productName: item.productName || item.name || 'Product',
                  productSize: item.productSize || item.size || '',
                  price: item.price || 0,
                  quantity: item.quantity || 0,
                  subtotal: item.subtotal || (item.price || 0) * (item.quantity || 0),
                }));
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
              status: txnData.status,
              commission: commission,
              storeAmount: storeAmount,
              paymentMethod: txnData.paymentMethod || txnData.method || 'COD',
              items: orderItems,
            });
          }
        }
      }

      // Combine walk-in and app orders
      const walkInTransactions: SaleTransaction[] = walkInSales.map(sale => ({
        id: sale.id,
        type: 'walk-in' as const,
        totalAmount: sale.totalAmount,
        itemsCount: sale.items.length,
        createdAt: sale.createdAt,
        customerName: sale.customerName || 'Walk-in Customer',
        paymentMethod: 'Cash',
        items: sale.items,
      }));

      const allTransactions = [...walkInTransactions, ...appOrders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setTransactions(allTransactions);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching sales history:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      // Normalize comparison - database has lowercase 'gcash'/'paymaya'
      const normalizedFilter = paymentFilter.toLowerCase();
      filtered = filtered.filter(t => 
        t.paymentMethod?.toLowerCase() === normalizedFilter
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllSales();
  };
  
  // Header refresh button handler
  const handleHeaderRefresh = () => {
    setHeaderRefreshing(true);
    fetchAllSales().finally(() => setHeaderRefreshing(false));
  };

  const handleTransactionPress = (transaction: SaleTransaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setPaymentFilter('all');
    setShowFiltersModal(false);
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

  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalCommission = filteredTransactions.reduce((sum, t) => sum + (t.commission || 0), 0);
  const netEarnings = totalSales - totalCommission;

  const activeFiltersCount = 
    (typeFilter !== 'all' ? 1 : 0) + 
    (paymentFilter !== 'all' ? 1 : 0) + 
    (searchQuery.trim() ? 1 : 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <View>
        <ProfileScreenHeader title="Sales History" />
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Search and Filter Row */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={s(20)}
              color="rgba(30, 30, 30, 0.5)"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by customer name..."
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFiltersModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filterIcon}>
              <View style={[styles.filterLine, { width: s(20) }]} />
              <View style={[styles.filterLine, { width: s(14), marginTop: vs(3) }]} />
              <View style={[styles.filterLine, { width: s(8), marginTop: vs(3) }]} />
            </View>
            {activeFiltersCount > 0 && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading sales history...</Text>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {activeFiltersCount > 0 ? 'Filtered Results' : 'All Sales'}
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Transactions:</Text>
                <Text style={styles.summaryValue}>{filteredTransactions.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gross Sales:</Text>
                <Text style={styles.summaryValue}>₱{totalSales.toFixed(2)}</Text>
              </View>
              {totalCommission > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Commission:</Text>
                  <Text style={styles.commissionValue}>-₱{totalCommission.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.summaryRowLast]}>
                <Text style={styles.summaryLabelBold}>Net Earnings:</Text>
                <Text style={styles.netValue}>₱{netEarnings.toFixed(2)}</Text>
              </View>
            </View>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No transactions found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {activeFiltersCount > 0
                    ? 'Try adjusting your filters'
                    : 'Sales will appear here once recorded'}
                </Text>
              </View>
            ) : (
              filteredTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  onPress={() => handleTransactionPress(transaction)}
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
                          <Text style={styles.transactionNetAmount}>
                            Net: ₱{(transaction.storeAmount || 0).toFixed(2)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.transactionFooter}>
                    <Text style={styles.tapToViewText}>Tap to view details</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={[styles.modalOverlay, {justifyContent: 'center', alignItems: 'center'}]}>
          <View style={styles.filtersModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFiltersModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Transaction Type Filter */}
              <Text style={styles.filterSectionTitle}>Transaction Type</Text>
              <View style={styles.filterOptionsRow}>
                {(['all', 'walk-in', 'app-order'] as FilterType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      typeFilter === type && styles.filterOptionActive
                    ]}
                    onPress={() => setTypeFilter(type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      typeFilter === type && styles.filterOptionTextActive
                    ]}>
                      {type === 'all' ? 'All' : type === 'walk-in' ? 'Walk-in' : 'App Orders'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Payment Method Filter */}
              <Text style={styles.filterSectionTitle}>Payment Method</Text>
              <View style={styles.filterOptionsRow}>
                {(['all', 'Cash', 'COD', 'GCash', 'PayMaya'] as PaymentFilter[]).map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.filterOption,
                      paymentFilter === method && styles.filterOptionActive
                    ]}
                    onPress={() => setPaymentFilter(method)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      paymentFilter === method && styles.filterOptionTextActive
                    ]}>
                      {method === 'all' ? 'All' : method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                  {/* Transaction Type Badge */}
                  <View style={styles.detailBadgeRow}>
                    <View style={[
                      styles.detailTypeBadge,
                      selectedTransaction.type === 'walk-in' ? styles.walkInBadge : styles.appOrderBadge
                    ]}>
                      <Text style={styles.transactionTypeText}>
                        {selectedTransaction.type === 'walk-in' ? 'Walk-in Sale' : 'App Order'}
                      </Text>
                    </View>
                  </View>

                  {/* Transaction Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Transaction Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date & Time:</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedTransaction.createdAt)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Customer:</Text>
                      <Text style={styles.detailValue}>{selectedTransaction.customerName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Method:</Text>
                      <PaymentMethodBadge method={selectedTransaction.paymentMethod || 'cash'} size="medium" />
                    </View>
                  </View>
                  
                  {/* Items */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Items ({selectedTransaction.itemsCount})</Text>
                    {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                      selectedTransaction.items.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.productName || item.name || 'Product'}</Text>
                            <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                          </View>
                          <Text style={styles.itemPrice}>₱{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</Text>
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

  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(12),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    marginRight: s(10),
  },

  searchIcon: {
    width: s(20),
    height: s(20),
    marginRight: s(10),
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  filterButton: {
    width: s(50),
    height: s(50),
    backgroundColor: Colors.white,
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterIcon: {
    width: s(20),
    alignItems: 'flex-start',
  },

  filterLine: {
    height: vs(2.5),
    backgroundColor: Colors.primary,
    borderRadius: s(2),
  },

  filterBadge: {
    position: 'absolute',
    top: s(8),
    right: s(8),
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: '#EF5350',
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

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },

  summaryTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(15),
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },

  summaryRowLast: {
    marginTop: vs(10),
    paddingTop: vs(12),
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 0,
  },

  summaryLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  summaryLabelBold: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
  },

  summaryValue: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
  },

  commissionValue: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: '#EF5350',
  },

  netValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.primary,
  },

  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingVertical: vs(60),
    alignItems: 'center',
  },

  emptyStateText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(8),
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
    marginBottom: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },

  transactionTypeBadge: {
    paddingVertical: vs(6),
    paddingHorizontal: s(12),
    borderRadius: s(8),
  },

  walkInBadge: {
    backgroundColor: '#E8F5E9',
  },

  appOrderBadge: {
    backgroundColor: '#E3F2FD',
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
    marginBottom: vs(12),
  },

  transactionInfo: {
    flex: 1,
  },

  transactionCustomer: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(4),
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

  transactionAmountContainer: {
    alignItems: 'flex-end',
  },

  transactionAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(2),
  },

  transactionCommission: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#EF5350',
    marginBottom: vs(2),
  },

  transactionNetAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.primary,
  },

  transactionFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    paddingTop: vs(10),
  },

  tapToViewText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.primary,
    textAlign: 'center',
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

  filtersModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: '90%',
    maxHeight: '70%',
    padding: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    alignSelf: 'center',
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

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
  },

  filterSectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(12),
    marginTop: vs(10),
  },

  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
    marginBottom: vs(20),
  },

  filterOption: {
    paddingVertical: vs(10),
    paddingHorizontal: s(15),
    borderRadius: s(10),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterOptionText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.darkGray,
  },

  filterOptionTextActive: {
    color: Colors.white,
  },

  clearFiltersButton: {
    backgroundColor: '#EF5350',
    borderRadius: s(12),
    paddingVertical: vs(14),
    alignItems: 'center',
    marginTop: vs(20),
  },

  clearFiltersText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.white,
  },

  detailBadgeRow: {
    marginBottom: vs(15),
    paddingHorizontal: s(20),
  },

  detailTypeBadge: {
    paddingVertical: vs(8),
    paddingHorizontal: s(15),
    borderRadius: s(10),
    alignSelf: 'flex-start',
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

export default SalesHistoryScreen;
