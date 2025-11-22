/**
 * STORE OWNER DEBT RECORDS SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1571-1337 (Store Debt Records)
 * Baseline: 440x956
 *
 * PIXEL-PERFECT IMPLEMENTATION:
 * Shows all customer debts owed to this store.
 * Features:
 * - Debt summary overview (total outstanding, pending, paid, overdue)
 * - Customer debt cards with status badges (Pending, Paid, Overdue)
 * - Search by customer name or order number
 * - Filter by debt status (All, Pending, Paid, Overdue)
 * - "Mark as Paid" functionality for store owners
 * - "New Debt" button to add manual debt entries
 *
 * Design Pattern: Similar to customer debt-history with store-owner controls
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ref, onValue, query, orderByChild, equalTo, update, get } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
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
  summaryCardBg: '#FFF3E0', // Light orange for summary
};

// Customer debt settings interface
interface CustomerDebtSettings {
  [customerId: string]: {
    debtEnabled: boolean;
    updatedAt: string;
  };
}

const StoreDebtRecordsScreen = () => {
  const [debtOrders, setDebtOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<DebtStatus>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [customerDebtSettings, setCustomerDebtSettings] = useState<CustomerDebtSettings>({});
  const [togglingCustomer, setTogglingCustomer] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // First get the store ID for this store owner
      fetchStoreId(currentUser.uid);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchDebtOrders();
      fetchCustomerDebtSettings();
    }
  }, [storeId]);

  const fetchCustomerDebtSettings = useCallback(() => {
    if (!storeId) return;

    const settingsRef = ref(database, `stores/${storeId}/customerDebtSettings`);
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setCustomerDebtSettings(snapshot.val());
      } else {
        setCustomerDebtSettings({});
      }
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleToggleCustomerDebt = async (customerId: string, customerName: string, currentEnabled: boolean) => {
    if (!storeId) return;

    const newEnabled = !currentEnabled;
    const actionText = newEnabled ? 'enable' : 'disable';

    Alert.alert(
      `${newEnabled ? 'Enable' : 'Disable'} Debt`,
      `Are you sure you want to ${actionText} debt payment for ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newEnabled ? 'Enable' : 'Disable',
          style: newEnabled ? 'default' : 'destructive',
          onPress: async () => {
            setTogglingCustomer(customerId);
            try {
              const settingRef = ref(database, `stores/${storeId}/customerDebtSettings/${customerId}`);
              await update(ref(database), {
                [`stores/${storeId}/customerDebtSettings/${customerId}`]: {
                  debtEnabled: newEnabled,
                  updatedAt: new Date().toISOString(),
                },
              });
              Alert.alert(
                'Success',
                `Debt payment ${newEnabled ? 'enabled' : 'disabled'} for ${customerName}`
              );
            } catch (error) {
              console.error('Error toggling customer debt:', error);
              Alert.alert('Error', 'Failed to update customer debt settings');
            } finally {
              setTogglingCustomer(null);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    applyFilters();
  }, [debtOrders, searchQuery, filterStatus]);

  const fetchStoreId = async (userId: string) => {
    try {
      // Check stores collection for this user's store
      const storesRef = ref(database, 'stores');
      const snapshot = await get(storesRef);

      if (snapshot.exists()) {
        const stores = snapshot.val();
        Object.keys(stores).forEach((id) => {
          if (stores[id].ownerId === userId || stores[id].storeOwnerId === userId) {
            setStoreId(id);
          }
        });
      }

      // If not found in stores, use userId as storeId (common pattern)
      if (!storeId) {
        setStoreId(userId);
      }
    } catch (error) {
      console.error('Error fetching store ID:', error);
      setStoreId(userId); // Fallback to userId
    }
  };

  const fetchDebtOrders = useCallback(() => {
    if (!storeId) return;

    // Query Firebase for orders WHERE storeId = current store
    const ordersRef = ref(database, 'orders');
    const storeOrdersQuery = query(
      ordersRef,
      orderByChild('storeId'),
      equalTo(storeId)
    );

    const unsubscribe = onValue(storeOrdersQuery, (snapshot) => {
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
              today.setHours(0, 0, 0, 0);
              dueDate.setHours(0, 0, 0, 0);
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
  }, [storeId]);

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
          order.customerName?.toLowerCase().includes(query)
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
      `/(main)/(store-owner)/profile/store-debt-details?orderId=${order.id}` as any
    );
  };

  const handleNewDebt = () => {
    router.push('/(main)/(store-owner)/profile/new-debt' as any);
  };

  const handleMarkAsPaid = async (order: Order) => {
    Alert.alert(
      'Mark as Paid',
      `Are you sure you want to mark this debt of P${formatCurrency(order.total)} from ${order.customerName} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          onPress: async () => {
            try {
              const orderRef = ref(database, `orders/${order.id}`);
              await update(orderRef, {
                debtStatus: 'paid',
                debtPaidDate: new Date().toISOString(),
                paymentStatus: 'paid',
                updatedAt: new Date().toISOString(),
              });
              Alert.alert('Success', 'Debt marked as paid successfully');
            } catch (error) {
              console.error('Error marking debt as paid:', error);
              Alert.alert('Error', 'Failed to update debt status');
            }
          },
        },
      ]
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
    const totalDebt = debtOrders.reduce(
      (sum, o) => sum + (o.debtStatus !== 'paid' ? o.total || 0 : 0),
      0
    );
    const pendingCount = debtOrders.filter(
      (o) => o.debtStatus === 'pending'
    ).length;
    const overdueCount = debtOrders.filter(
      (o) => o.debtStatus === 'overdue'
    ).length;
    const paidCount = debtOrders.filter(
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
    const isPaid = order.debtStatus === 'paid';
    const customerId = order.customerId || '';
    const customerDebtEnabled = customerDebtSettings[customerId]?.debtEnabled !== false; // Default to true
    const isTogglingThis = togglingCustomer === customerId;

    return (
      <TouchableOpacity
        key={order.id}
        style={[styles.debtCard, isFirst && styles.debtCardFirst]}
        onPress={() => handleDebtPress(order)}
        activeOpacity={0.8}
      >
        {/* Logo Container - Orange background with debt icon */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, !customerDebtEnabled && styles.logoBackgroundDisabled]}>
            <Text style={styles.debtIconText}>P</Text>
          </View>
        </View>

        {/* Debt Info */}
        <View style={styles.debtInfo}>
          {/* Customer Name */}
          <Text style={styles.customerName}>{order.customerName || 'N/A'}</Text>

          {/* Order Number */}
          <Text style={styles.orderNumber}>{order.orderNumber || 'N/A'}</Text>

          {/* Status Badge Row */}
          <View style={styles.statusRow}>
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

            {/* Customer Debt Toggle */}
            <TouchableOpacity
              style={[
                styles.debtToggleButton,
                customerDebtEnabled ? styles.debtToggleEnabled : styles.debtToggleDisabled,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleCustomerDebt(customerId, order.customerName || 'Customer', customerDebtEnabled);
              }}
              activeOpacity={0.7}
              disabled={isTogglingThis}
            >
              {isTogglingThis ? (
                <ActivityIndicator size="small" color={customerDebtEnabled ? Colors.primary : '#9CA3AF'} />
              ) : (
                <Text
                  style={[
                    styles.debtToggleText,
                    customerDebtEnabled ? styles.debtToggleTextEnabled : styles.debtToggleTextDisabled,
                  ]}
                >
                  {customerDebtEnabled ? 'Debt ON' : 'Debt OFF'}
                </Text>
              )}
            </TouchableOpacity>
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

          {/* Mark as Paid Button (only if not paid) */}
          {!isPaid && (
            <TouchableOpacity
              style={styles.markPaidButton}
              onPress={(e) => {
                e.stopPropagation();
                handleMarkAsPaid(order);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.markPaidButtonText}>Mark Paid</Text>
            </TouchableOpacity>
          )}
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
            source={require('../../../../src/assets/images/store-owner-debt-records/chevron-left.png')}
            style={styles.backIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Debt Records</Text>

        {/* Add New Debt Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleNewDebt}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
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
              placeholder="Search by customer or order..."
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
        {debtOrders.length > 0 && renderSummary()}

        {/* Debt List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading debt records...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>P</Text>
            <Text style={styles.emptyText}>
              {searchQuery || filterStatus !== 'all'
                ? 'No debts found'
                : 'No customer debts yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Customer debts will appear here when they select "Debt" as payment method'}
            </Text>
            {!searchQuery && filterStatus === 'all' && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleNewDebt}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyStateButtonText}>+ New Debt</Text>
              </TouchableOpacity>
            )}
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

  // Add Button
  addButton: {
    position: 'absolute',
    right: s(20),
    top: vs(20),
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  addButtonText: {
    color: Colors.white,
    fontSize: ms(20),
    fontWeight: '600',
    lineHeight: ms(22),
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
    backgroundColor: '#FFF3E0',
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
    color: '#FF8D2F',
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
    minHeight: vs(120),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(15),
    paddingVertical: vs(15),
    marginBottom: vs(15),
  },

  debtCardFirst: {
    marginTop: vs(0),
  },

  // Logo Container
  logoContainer: {
    marginRight: s(12),
  },

  logoBackground: {
    width: s(45),
    height: s(45),
    borderRadius: s(10),
    backgroundColor: '#FF8D2F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoBackgroundDisabled: {
    backgroundColor: '#9CA3AF',
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

  // Customer Name
  customerName: {
    fontSize: ms(15),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: ms(18),
    marginBottom: vs(2),
  },

  // Order Number
  orderNumber: {
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

  // Status Row with Toggle
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },

  // Customer Debt Toggle Button
  debtToggleButton: {
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderRadius: s(6),
    borderWidth: 1,
    minWidth: s(60),
    alignItems: 'center',
  },

  debtToggleEnabled: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },

  debtToggleDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF',
  },

  debtToggleText: {
    fontSize: ms(9),
    fontFamily: Fonts.primary,
    fontWeight: '600',
  },

  debtToggleTextEnabled: {
    color: Colors.primary,
  },

  debtToggleTextDisabled: {
    color: '#9CA3AF',
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
    color: '#FF8D2F',
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
    marginBottom: vs(6),
  },

  // Mark as Paid Button
  markPaidButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(8),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },

  markPaidButtonText: {
    fontSize: ms(10),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: Colors.white,
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
    fontWeight: '700',
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
    marginBottom: vs(20),
  },

  emptyStateButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(24),
  },

  emptyStateButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.white,
  },
});

export default StoreDebtRecordsScreen;
