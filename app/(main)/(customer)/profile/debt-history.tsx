/**
 * CUSTOMER DEBT HISTORY SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1571-1066 (Debt History)
 * Baseline: 440x956
 *
 * PIXEL-PERFECT IMPLEMENTATION:
 * Shows all debt/loan orders for the current customer.
 * Features:
 * - Debt order cards with status badges (Pending, Paid, Overdue)
 * - Click to view debt details
 * - Search by store name or order number
 * - Filter by debt status
 * - Summary overview
 *
 * Design Pattern: Similar to return-history with customer-specific features
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
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import type { Order } from '../../../../src/models/Order';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

type DebtStatus = 'all' | 'pending' | 'paid' | 'overdue';

// Extended colors for this screen
const ScreenColors = {
  ...Colors,
  pendingOrange: '#FFA500',
  paidGreen: '#3BB77E',
  overdueRed: '#E92B45',
  cardBg: '#FFFFFF',
  debtIconBg: '#FF8D2F', // Orange background for debt icon
};

const CustomerDebtHistoryScreen = () => {
  const { user } = useUser();
  const [debtOrders, setDebtOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<DebtStatus>('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDebtOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [debtOrders, searchQuery, filterStatus]);

  const fetchDebtOrders = () => {
    if (!user) return;

    // Query Firebase for orders WHERE customerId = user.id
    const ordersRef = ref(database, 'orders');
    const userOrdersQuery = query(
      ordersRef,
      orderByChild('customerId'),
      equalTo(user.id)
    );

    const unsubscribe = onValue(userOrdersQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Filter for debt payment orders only
        const debtOrdersList = Object.keys(data)
          .map((orderId) => ({ ...data[orderId], id: orderId }))
          .filter(
            (order: Order) =>
              order.paymentMethod === 'debt' || order.isDebtPayment === true
          )
          .map((order: Order) => {
            // Calculate if overdue
            if (order.debtStatus === 'pending' && order.debtDueDate) {
              const dueDate = new Date(order.debtDueDate);
              const today = new Date();
              if (today > dueDate) {
                return { ...order, debtStatus: 'overdue' as const };
              }
            }
            return order;
          })
          .sort(
            (a: Order, b: Order) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setDebtOrders(debtOrdersList as Order[]);
      } else {
        setDebtOrders([]);
      }
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  };

  const applyFilters = () => {
    let filtered = [...debtOrders];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (order) => order.debtStatus === filterStatus
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(query) ||
          order.storeName?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDebtOrders();
  };

  const handleDebtPress = (order: Order) => {
    router.push(
      `/(main)/(customer)/profile/debt-details?orderId=${order.id}` as any
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
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

  const getFilterLabel = (status: DebtStatus) => {
    switch (status) {
      case 'all':
        return 'All';
      case 'pending':
        return 'Pending';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const renderSummary = () => {
    const totalDebt = filteredOrders.reduce(
      (sum, o) => sum + (o.debtStatus !== 'paid' ? o.total || 0 : 0),
      0
    );
    const pendingCount = filteredOrders.filter(
      (o) => o.debtStatus === 'pending'
    ).length;
    const overdueCount = filteredOrders.filter(
      (o) => o.debtStatus === 'overdue'
    ).length;
    const paidCount = filteredOrders.filter(
      (o) => o.debtStatus === 'paid'
    ).length;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Debt Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              P{formatCurrency(totalDebt)}
            </Text>
            <Text style={styles.summaryLabel}>Outstanding</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryValue, { color: ScreenColors.pendingOrange }]}
            >
              {pendingCount}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryValue, { color: ScreenColors.overdueRed }]}
            >
              {overdueCount}
            </Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryValue, { color: ScreenColors.paidGreen }]}
            >
              {paidCount}
            </Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDebtCard = (order: Order, index: number) => {
    const statusConfig = getStatusConfig(order.debtStatus);
    const isFirst = index === 0;
    const itemCount = order.items?.length || 0;

    return (
      <TouchableOpacity
        key={order.id}
        style={[styles.debtCard, isFirst && styles.debtCardFirst]}
        onPress={() => handleDebtPress(order)}
        activeOpacity={0.8}
      >
        {/* Logo Container - Orange background with debt icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Text style={styles.debtIconText}>💳</Text>
          </View>
        </View>

        {/* Debt Info */}
        <View style={styles.debtInfo}>
          {/* Order Number */}
          <Text style={styles.orderNumber}>{order.orderNumber || 'N/A'}</Text>

          {/* Store Name */}
          <Text style={styles.storeName}>{order.storeName || 'N/A'}</Text>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.backgroundColor },
            ]}
          >
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* Due Date */}
          <Text style={styles.dueDate}>
            Due: {formatDate(order.debtDueDate)}
          </Text>

          {/* Items Count */}
          <Text style={styles.itemsCount}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>

          {/* Total Amount */}
          <Text style={styles.total}>P{formatCurrency(order.total)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

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
        <Text style={styles.title}>Debt History</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Search and Filter */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>O</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search debts..."
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilter(!showFilter)}
            activeOpacity={0.7}
          >
            <View style={styles.filterIcon}>
              <View style={[styles.filterLine, { width: s(20) }]} />
              <View style={[styles.filterLine, { width: s(14), marginTop: vs(3) }]} />
              <View style={[styles.filterLine, { width: s(8), marginTop: vs(3) }]} />
            </View>
            {filterStatus !== 'all' && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        {showFilter && (
          <View style={styles.filterOptions}>
            {(['all', 'pending', 'paid', 'overdue'] as DebtStatus[]).map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    filterStatus === status && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterStatus(status);
                    setShowFilter(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterStatus === status && styles.filterOptionTextActive,
                    ]}
                  >
                    {getFilterLabel(status)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* Summary */}
        {filteredOrders.length > 0 && renderSummary()}

        {/* Debt List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading debt history...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyText}>
              {searchQuery || filterStatus !== 'all'
                ? 'No debts found'
                : 'No debt orders yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your debt orders will appear here when you select "Debt" as payment method'}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order, index) => renderDebtCard(order, index))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  // Header
  headerContainer: {
    backgroundColor: Colors.backgroundGray,
    paddingTop: vs(20),
    paddingBottom: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Back Button
  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(20),
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
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
    lineHeight: vs(22),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(100),
  },

  // Search and Filter Row
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
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  searchIcon: {
    fontSize: ms(16),
    marginRight: s(10),
    color: 'rgba(30, 30, 30, 0.5)',
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
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
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
    backgroundColor: '#E92B45',
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
    marginBottom: vs(15),
  },

  filterOption: {
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterOptionText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    fontWeight: '500',
  },

  filterOptionTextActive: {
    color: Colors.white,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  summaryTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(15),
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  summaryItem: {
    alignItems: 'center',
  },

  summaryValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.primary,
    marginBottom: vs(4),
  },

  summaryLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
  },

  // Debt Card
  debtCard: {
    width: s(400),
    minHeight: vs(100),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    marginBottom: vs(15),
  },

  debtCardFirst: {
    marginTop: vs(0),
  },

  // Logo Container
  logoContainer: {
    marginRight: s(15),
  },

  logoBackground: {
    width: s(40),
    height: s(40),
    borderRadius: s(8),
    backgroundColor: '#FF8D2F', // Orange color for debt icon
    justifyContent: 'center',
    alignItems: 'center',
  },

  debtIconText: {
    fontSize: ms(24),
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Debt Info
  debtInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  // Order Number
  orderNumber: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: ms(17.22),
    marginBottom: vs(4),
  },

  // Store Name
  storeName: {
    fontSize: ms(12),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(14.76),
    marginBottom: vs(6),
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(8),
  },

  statusText: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Right Section
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // Due Date
  dueDate: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: '#FF8D2F', // Orange for due date
    lineHeight: ms(13.53),
    marginBottom: vs(3),
    textAlign: 'right',
  },

  // Items Count
  itemsCount: {
    fontSize: ms(11),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.4)',
    lineHeight: ms(13.53),
    marginBottom: vs(4),
    textAlign: 'right',
  },

  // Total
  total: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: ms(19.68),
    textAlign: 'right',
  },

  // Loading State
  loadingContainer: {
    paddingVertical: vs(80),
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },

  // Empty State
  emptyContainer: {
    paddingVertical: vs(80),
    paddingHorizontal: s(40),
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: ms(80),
    marginBottom: vs(20),
    opacity: 0.3,
    color: '#FF8D2F',
  },

  emptyText: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(10),
    textAlign: 'center',
  },

  emptySubtext: {
    fontSize: ms(14),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.4)',
    textAlign: 'center',
    lineHeight: ms(14) * 1.5,
  },
});

export default CustomerDebtHistoryScreen;
