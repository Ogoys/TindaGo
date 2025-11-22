/**
 * SUPPLIER DASHBOARD SCREEN
 *
 * Comprehensive supplier management dashboard showing:
 * - List of all suppliers with statistics
 * - Total spent per supplier
 * - Number of purchase orders per supplier
 * - Last purchase date
 * - Quick actions (Add Supplier, View Purchase History)
 *
 * Note: Since Figma access returned 403 Forbidden, this implementation
 * follows existing TindaGo dashboard patterns (Sales Dashboard, Inventory Dashboard)
 * and uses the established design system.
 *
 * Baseline: 440x956 (standard TindaGo baseline)
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
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';

interface SupplierStats {
  supplierName: string;
  totalPurchaseOrders: number;
  totalAmountSpent: number;
  lastPurchaseDate: string | null;
  uniqueProducts: Set<string>;
  purchaseOrderIds: string[];
}

interface DashboardStats {
  totalSuppliers: number;
  totalSpent: number;
  totalPurchaseOrders: number;
  mostFrequentSupplier: string | null;
}

const SupplierDashboardScreen = () => {
  const [suppliersMap, setSuppliersMap] = useState<Map<string, SupplierStats>>(new Map());
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSuppliers: 0,
    totalSpent: 0,
    totalPurchaseOrders: 0,
    mostFrequentSupplier: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [headerRefreshing, setHeaderRefreshing] = useState(false);

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const suppliersData = new Map<string, SupplierStats>();

      // 1. First, fetch dedicated suppliers from suppliers collection
      const suppliersRef = ref(database, 'suppliers');
      const suppliersSnapshot = await get(suppliersRef);

      if (suppliersSnapshot.exists()) {
        const suppliers = suppliersSnapshot.val();
        Object.keys(suppliers).forEach((supplierId) => {
          const supplier = suppliers[supplierId];
          // Only include suppliers belonging to current user
          if (supplier.storeOwnerId === currentUser.uid) {
            // Add supplier with empty stats (will be updated from purchase orders)
            suppliersData.set(supplier.name, {
              supplierName: supplier.name,
              totalPurchaseOrders: 0,
              totalAmountSpent: 0,
              lastPurchaseDate: null,
              uniqueProducts: new Set(),
              purchaseOrderIds: [],
            });
          }
        });
      }

      // 2. Fetch all purchase orders and merge supplier data
      const purchaseOrdersRef = ref(database, 'purchase_orders');
      const userPurchaseOrdersQuery = query(
        purchaseOrdersRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );

      const poSnapshot = await get(userPurchaseOrdersQuery);

      if (poSnapshot.exists()) {
        const purchaseOrders = poSnapshot.val();

        // Process each purchase order
        Object.keys(purchaseOrders).forEach((poId) => {
          const po: any = purchaseOrders[poId];
          const supplierName = po.supplierName || 'Unknown Supplier';

          if (!suppliersData.has(supplierName)) {
            suppliersData.set(supplierName, {
              supplierName,
              totalPurchaseOrders: 0,
              totalAmountSpent: 0,
              lastPurchaseDate: null,
              uniqueProducts: new Set(),
              purchaseOrderIds: [],
            });
          }

          const supplierStats = suppliersData.get(supplierName)!;

          // Update statistics
          supplierStats.totalPurchaseOrders += 1;
          supplierStats.totalAmountSpent += po.totalCost || 0;
          supplierStats.purchaseOrderIds.push(poId);

          // Track unique products
          if (po.items && Array.isArray(po.items)) {
            po.items.forEach((item: any) => {
              if (item.productId) {
                supplierStats.uniqueProducts.add(item.productId);
              }
            });
          }

          // Update last purchase date
          const purchaseDate = po.purchaseDate || po.createdAt;
          if (
            purchaseDate &&
            (!supplierStats.lastPurchaseDate ||
              new Date(purchaseDate) > new Date(supplierStats.lastPurchaseDate))
          ) {
            supplierStats.lastPurchaseDate = purchaseDate;
          }
        });
      }

      // Handle empty state
      if (suppliersData.size === 0) {
        setSuppliersMap(new Map());
        setDashboardStats({
          totalSuppliers: 0,
          totalSpent: 0,
          totalPurchaseOrders: 0,
          mostFrequentSupplier: null,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Calculate dashboard stats
      let totalSpent = 0;
      let totalPOs = 0;
      let mostFrequent: string | null = null;
      let maxPOs = 0;

      suppliersData.forEach((stats, supplierName) => {
        totalSpent += stats.totalAmountSpent;
        totalPOs += stats.totalPurchaseOrders;

        if (stats.totalPurchaseOrders > maxPOs) {
          maxPOs = stats.totalPurchaseOrders;
          mostFrequent = supplierName;
        }
      });

      setSuppliersMap(suppliersData);
      setDashboardStats({
        totalSuppliers: suppliersData.size,
        totalSpent,
        totalPurchaseOrders: totalPOs,
        mostFrequentSupplier: mostFrequent,
      });
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      Alert.alert('Error', 'Failed to load supplier data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSupplierData();
  };

  const handleHeaderRefresh = () => {
    setHeaderRefreshing(true);
    fetchSupplierData().finally(() => setHeaderRefreshing(false));
  };

  const handleAddSupplier = () => {
    // Navigate to add supplier screen
    router.push('/(main)/(store-owner)/profile/add-supplier');
  };

  const handleViewPurchaseHistory = (supplierName: string) => {
    router.push({
      pathname: '/(main)/(store-owner)/profile/purchase-order-history',
      params: { supplier: supplierName },
    });
  };

  const handleViewSupplierDetails = (supplierName: string) => {
    router.push({
      pathname: '/(main)/(store-owner)/profile/supplier-details',
      params: { supplier: supplierName },
    });
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Convert Map to Array and sort by total spent (descending)
  const suppliersArray = Array.from(suppliersMap.values()).sort(
    (a, b) => b.totalAmountSpent - a.totalAmountSpent
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <View>
        <ProfileScreenHeader title="Supplier Dashboard" />
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
            <Text style={styles.loadingText}>Loading supplier data...</Text>
          </View>
        ) : (
          <>
            {/* Dashboard Overview */}
            <Text style={styles.sectionTitle}>Overview</Text>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.primaryCard]}>
                <Text style={styles.summaryIcon}>👥</Text>
                <Text style={styles.summaryAmount}>{dashboardStats.totalSuppliers}</Text>
                <Text style={styles.summaryLabel}>Total Suppliers</Text>
              </View>

              <View style={[styles.summaryCard, styles.valueCard]}>
                <Text style={styles.summaryIcon}>💰</Text>
                <Text style={styles.summaryAmount}>₱{dashboardStats.totalSpent.toFixed(0)}</Text>
                <Text style={styles.summaryLabel}>Total Spent</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.infoCard]}>
                <Text style={styles.summaryIcon}>📦</Text>
                <Text style={styles.summaryAmount}>{dashboardStats.totalPurchaseOrders}</Text>
                <Text style={styles.summaryLabel}>Purchase Orders</Text>
              </View>

              <View style={[styles.summaryCard, styles.successCard]}>
                <Text style={styles.summaryIcon}>⭐</Text>
                <Text style={[styles.summaryAmount, styles.smallerAmount]}>
                  {dashboardStats.mostFrequentSupplier ? dashboardStats.mostFrequentSupplier : 'N/A'}
                </Text>
                <Text style={styles.summaryLabel}>Top Supplier</Text>
              </View>
            </View>

            {/* Add Supplier Button */}
            <TouchableOpacity
              style={styles.addSupplierButton}
              onPress={handleAddSupplier}
              activeOpacity={0.7}
            >
              <Text style={styles.addSupplierIcon}>➕</Text>
              <Text style={styles.addSupplierText}>Add New Supplier</Text>
            </TouchableOpacity>

            {/* Supplier List */}
            <Text style={styles.sectionTitle}>All Suppliers</Text>

            {suppliersArray.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={styles.emptyStateText}>No suppliers found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create a purchase order to start tracking suppliers
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => router.push('/(main)/(store-owner)/profile/record-purchase-order')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emptyStateButtonText}>Create Purchase Order</Text>
                </TouchableOpacity>
              </View>
            ) : (
              suppliersArray.map((supplier, index) => (
                <TouchableOpacity
                  key={`${supplier.supplierName}-${index}`}
                  style={styles.supplierCard}
                  onPress={() => handleViewSupplierDetails(supplier.supplierName)}
                  activeOpacity={0.7}
                >
                  <View style={styles.supplierHeader}>
                    <View style={styles.supplierIconContainer}>
                      <Text style={styles.supplierIcon}>🏪</Text>
                    </View>
                    <View style={styles.supplierInfo}>
                      <Text style={styles.supplierName} numberOfLines={1}>
                        {supplier.supplierName}
                      </Text>
                      <Text style={styles.supplierLastPurchase}>
                        Last purchase: {formatDate(supplier.lastPurchaseDate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.supplierStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Purchase Orders</Text>
                      <Text style={styles.statItemValue}>{supplier.totalPurchaseOrders}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Total Spent</Text>
                      <Text style={styles.statItemValue}>₱{supplier.totalAmountSpent.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statItemLabel}>Products</Text>
                      <Text style={styles.statItemValue}>{supplier.uniqueProducts.size}</Text>
                    </View>
                  </View>

                  <View style={styles.supplierFooter}>
                    <Text style={styles.viewDetailsText}>Tap to view supplier details ›</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* Quick Actions */}
            {suppliersArray.length > 0 && (
              <View style={styles.quickActionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push('/(main)/(store-owner)/profile/record-purchase-order')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>📝</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>New Purchase Order</Text>
                    <Text style={styles.actionDescription}>Record a new inventory purchase</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push('/(main)/(store-owner)/profile/purchase-order-history')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>📋</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>View All Purchase Orders</Text>
                    <Text style={styles.actionDescription}>See complete purchase history</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
              </View>
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
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: vs(120),
    justifyContent: 'center',
  },

  primaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  valueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#02545F',
  },

  infoCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },

  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },

  summaryIcon: {
    fontSize: ms(32),
    marginBottom: vs(8),
  },

  summaryAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
    marginBottom: vs(4),
    textAlign: 'center',
  },

  smallerAmount: {
    fontSize: ms(14),
    lineHeight: ms(18),
  },

  summaryLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  addSupplierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: s(16),
    paddingVertical: vs(16),
    paddingHorizontal: s(20),
    marginBottom: vs(25),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  addSupplierIcon: {
    fontSize: ms(20),
    marginRight: s(10),
  },

  addSupplierText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.white,
  },

  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingVertical: vs(50),
    paddingHorizontal: s(20),
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },

  emptyStateIcon: {
    fontSize: ms(64),
    marginBottom: vs(15),
  },

  emptyStateText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(8),
    textAlign: 'center',
  },

  emptyStateSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
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
    fontSize: ms(14),
    color: Colors.white,
  },

  supplierCard: {
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

  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },

  supplierIconContainer: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },

  supplierIcon: {
    fontSize: ms(28),
  },

  supplierInfo: {
    flex: 1,
  },

  supplierName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },

  supplierLastPurchase: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  supplierStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: vs(12),
    backgroundColor: 'rgba(59, 183, 126, 0.05)',
    borderRadius: s(12),
    marginBottom: vs(10),
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  statItemLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    marginBottom: vs(4),
    textAlign: 'center',
  },

  statItemValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(14),
    color: Colors.primary,
  },

  supplierFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: vs(10),
    alignItems: 'center',
  },

  viewDetailsText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.primary,
    fontWeight: '500',
  },

  quickActionsSection: {
    marginTop: vs(10),
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(12),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },

  actionIcon: {
    fontSize: ms(32),
    marginRight: s(12),
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },

  actionDescription: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  actionArrow: {
    fontSize: ms(24),
    color: Colors.textSecondary,
  },
});

export default SupplierDashboardScreen;
