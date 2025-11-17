/**
 * INVENTORY DASHBOARD - Comprehensive inventory management and analytics
 * 
 * Features:
 * - Real-time inventory statistics
 * - Stock level monitoring
 * - Expiry tracking
 * - Inventory value calculations
 * - Quick actions
 * - Date range filters
 * - Category breakdown
 * - Low stock alerts
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  expired: number;
  expiringSoon: number;
  categories: Record<string, number>;
  recentlyUpdated: number;
  expiredInDamageHistory: number; // Expired products recorded in damage history
  expiredNotRecorded: number; // Expired products not yet recorded in damage history
}

interface ProductStat {
  productId: string;
  name: string;
  orderCount: number;
  imageUrl?: string;
}

// Helper function to parse expiry date (supports both MM/DD/YYYY and ISO formats)
const parseExpiryDate = (expiryDate: string | undefined): Date | null => {
  if (!expiryDate) return null;

  try {
    // Try parsing as ISO string first (new format)
    const isoDate = new Date(expiryDate);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Try parsing MM/DD/YYYY format (old format)
    const parts = expiryDate.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      if (!isNaN(dateObj.getTime())) {
        return dateObj;
      }
    }
  } catch (error) {
    console.error('Error parsing expiry date:', expiryDate, error);
  }

  return null;
};

export default function InventoryDashboardScreen() {
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    expired: 0,
    expiringSoon: 0,
    categories: {},
    recentlyUpdated: 0,
    expiredInDamageHistory: 0,
    expiredNotRecorded: 0,
  });
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch all damage records to exclude expired products that have been recorded
      const damagesRef = ref(database, 'damages');
      const damagesQuery = query(
        damagesRef,
        orderByChild('storeOwnerId'),
        equalTo(user.uid)
      );
      
      const damagesSnapshot = await get(damagesQuery);
      const damagedProductIds = new Set<string>();
      
      let expiredDamageCount = 0;
      
      if (damagesSnapshot.exists()) {
        const damages = damagesSnapshot.val();
        Object.values(damages).forEach((damage: any) => {
          if (damage.items && Array.isArray(damage.items)) {
            damage.items.forEach((item: any) => {
              if (item.productId) {
                damagedProductIds.add(item.productId);
                // Count expired items separately for the "Expired" card
                if (item.reason === 'expired') {
                  expiredDamageCount++;
                }
              }
            });
          }
        });
      }

      const productsRef = ref(database, 'products');
      const userProductsQuery = query(
        productsRef,
        orderByChild('storeOwnerId'),
        equalTo(user.uid)
      );

      const snapshot = await get(userProductsQuery);
      if (!snapshot.exists()) {
        setStats({
          totalProducts: 0,
          totalValue: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          expired: 0,
          expiringSoon: 0,
          categories: {},
          recentlyUpdated: 0,
          expiredInDamageHistory: 0,
          expiredNotRecorded: 0,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const products = snapshot.val();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      console.log('=== INVENTORY DASHBOARD DEBUG ===');
      console.log('Today:', today.toISOString(), '|', today.toLocaleDateString());

      const inventoryStats: InventoryStats = {
        totalProducts: 0,
        totalValue: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        expired: 0,
        expiringSoon: 0,
        categories: {},
        recentlyUpdated: 0,
        expiredInDamageHistory: 0,
        expiredNotRecorded: 0,
      };

      const categoryValues: Record<string, { count: number; value: number }> = {};
      const productOrderCounts: Record<string, { name: string; count: number; imageUrl?: string }> = {};
      let unrecordedExpiredCount = 0; // Count of expired products not yet in damage history

      Object.keys(products).forEach(productId => {
        const product: any = products[productId];
        
        // Skip products that have been recorded as damaged
        if (damagedProductIds.has(productId)) {
          return;
        }
        
        inventoryStats.totalProducts++;

        // Calculate stock levels
        const quantity = product.quantity || 0;
        const price = product.price || 0;
        const category = product.category || 'Uncategorized';

        // Check if product is expired
        const expiryDate = parseExpiryDate(product.expiryDate);
        const isExpired = expiryDate && expiryDate <= today;

        if (quantity >= 10) {
          inventoryStats.inStock++;
        } else if (quantity > 0) {
          inventoryStats.lowStock++;
        } else if (!isExpired) {
          // Only count as out of stock if not expired
          inventoryStats.outOfStock++;
        }

        // Calculate value
        if (quantity > 0) {
          inventoryStats.totalValue += quantity * price;
        }

        // Track categories
        if (!categoryValues[category]) {
          categoryValues[category] = { count: 0, value: 0 };
        }
        categoryValues[category].count++;
        categoryValues[category].value += quantity * price;

        // Initialize product order count tracking
        if (!productOrderCounts[productId]) {
          productOrderCounts[productId] = {
            name: product.productName || 'Unknown Product',
            count: 0,
            imageUrl: product.productImageUrl || product.productImage
          };
        }

        // Check expiry (exclude products already recorded as damaged)
        if (product.expiryDate && !damagedProductIds.has(productId)) {
          const expiryDate = parseExpiryDate(product.expiryDate);
          
          if (expiryDate) {
            expiryDate.setHours(0, 0, 0, 0); // Normalize to start of day
            
            console.log(`Product: ${product.productName}`);
            console.log('  Raw expiry:', product.expiryDate);
            console.log('  Parsed expiry:', expiryDate.toISOString(), '|', expiryDate.toLocaleDateString());
            console.log('  Is expired?', expiryDate < today);
            console.log('  Days difference:', Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24)));
            
            if (expiryDate <= today) {
              unrecordedExpiredCount++;
              console.log('  ✅ COUNTED AS UNRECORDED EXPIRED');
            } else if (expiryDate <= thirtyDaysFromNow) {
              inventoryStats.expiringSoon++;
              console.log('  ⚠️ COUNTED AS EXPIRING SOON');
            } else {
              console.log('  ✅ FRESH');
            }
            console.log('---');
          }
        }

        // Check recently updated
        if (product.updatedAt) {
          const updatedDate = new Date(product.updatedAt);
          if (updatedDate >= sevenDaysAgo) {
            inventoryStats.recentlyUpdated++;
          }
        }
      });

      // Fetch orders to count product order frequencies
      const ordersRef = ref(database, 'orders');
      const storeOrdersQuery = query(
        ordersRef,
        orderByChild('storeId'),
        equalTo(user.uid)
      );
      
      const ordersSnapshot = await get(storeOrdersQuery);
      if (ordersSnapshot.exists()) {
        const orders = ordersSnapshot.val();
        Object.values(orders).forEach((order: any) => {
          // Only count completed or picked_up orders
          if (order.status === 'completed' || order.status === 'picked_up') {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                if (item.productId && productOrderCounts[item.productId]) {
                  productOrderCounts[item.productId].count += item.quantity || 1;
                }
              });
            }
          }
        });
      }

      // Convert to array and sort by order count
      const topProductsArray: ProductStat[] = Object.keys(productOrderCounts)
        .map(productId => ({
          productId,
          name: productOrderCounts[productId].name,
          orderCount: productOrderCounts[productId].count,
          imageUrl: productOrderCounts[productId].imageUrl
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5); // Top 5 products

      // Set expired counts
      inventoryStats.expiredInDamageHistory = expiredDamageCount;
      inventoryStats.expiredNotRecorded = unrecordedExpiredCount;
      inventoryStats.expired = expiredDamageCount; // For display in overview card
      
      console.log('=== FINAL STATS ===');
      console.log('Total Products:', inventoryStats.totalProducts);
      console.log('In Stock:', inventoryStats.inStock);
      console.log('Low Stock:', inventoryStats.lowStock);
      console.log('Out of Stock:', inventoryStats.outOfStock);
      console.log('Expired (in damage history):', inventoryStats.expired);
      console.log('Expired (not recorded):', inventoryStats.expiredNotRecorded);
      console.log('Damaged Products Excluded:', damagedProductIds.size);
      
      setStats(inventoryStats);
      setTopProducts(topProductsArray);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventoryData();
  };

  const handleNavigate = (screen: string) => {
    switch (screen) {
      case 'products':
        router.push('/(main)/(store-owner)/inventory/store-product');
        break;
      case 'expired':
        router.push('/(main)/(store-owner)/inventory/damage-history');
        break;
      case 'low-stock':
        router.push({
          pathname: '/(main)/(store-owner)/inventory/store-product',
          params: { filter: 'low-stock' }
        });
        break;
      case 'out-of-stock':
        router.push({
          pathname: '/(main)/(store-owner)/inventory/store-product',
          params: { filter: 'out-of-stock' }
        });
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Inventory Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Last Updated */}
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>📊 Overview</Text>
          
          <View style={styles.statsGrid}>
            {/* Total Products */}
            <TouchableOpacity 
              style={[styles.statCard, styles.primaryCard]}
              onPress={() => handleNavigate('products')}
            >
              <Text style={styles.statIcon}>📦</Text>
              <Text style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Total Products</Text>
            </TouchableOpacity>

            {/* Total Value */}
            <View style={[styles.statCard, styles.valueCard]}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statNumber}>₱{stats.totalValue.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {/* In Stock */}
            <TouchableOpacity style={[styles.statCard, styles.successCard]}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={[styles.statNumber, { color: '#3BB77E' }]}>{stats.inStock}</Text>
              <Text style={styles.statLabel}>In Stock</Text>
            </TouchableOpacity>

            {/* Low Stock */}
            <TouchableOpacity 
              style={[styles.statCard, styles.warningCard]}
              onPress={() => handleNavigate('low-stock')}
            >
              <Text style={styles.statIcon}>⚠️</Text>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.lowStock}</Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            {/* Out of Stock */}
            <TouchableOpacity 
              style={[styles.statCard, styles.dangerCard]}
              onPress={() => handleNavigate('out-of-stock')}
            >
              <Text style={styles.statIcon}>❌</Text>
              <Text style={[styles.statNumber, { color: '#E92B45' }]}>{stats.outOfStock}</Text>
              <Text style={styles.statLabel}>Out of Stock</Text>
            </TouchableOpacity>

            {/* Expired */}
            <TouchableOpacity 
              style={[styles.statCard, styles.expiredCard]}
              onPress={() => handleNavigate('expired')}
            >
              <Text style={styles.statIcon}>🚫</Text>
              <Text style={[styles.statNumber, { color: '#E92B45' }]}>{stats.expired}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Alerts Section */}
        {(stats.lowStock > 0 || stats.expiredNotRecorded > 0 || stats.expiringSoon > 0) && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>🔔 Alerts</Text>
            
            {stats.expiredNotRecorded > 0 && (
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => router.push('/(main)/(store-owner)/inventory/expired-products')}
              >
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIconText}>🚫</Text>
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Expired Products</Text>
                  <Text style={styles.alertMessage}>
                    {stats.expiredNotRecorded} product{stats.expiredNotRecorded > 1 ? 's have' : ' has'} expired and need attention
                  </Text>
                </View>
                <Text style={styles.alertArrow}>›</Text>
              </TouchableOpacity>
            )}

            {stats.lowStock > 0 && (
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => handleNavigate('low-stock')}
              >
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIconText}>⚠️</Text>
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Low Stock Warning</Text>
                  <Text style={styles.alertMessage}>
                    {stats.lowStock} product{stats.lowStock > 1 ? 's are' : ' is'} running low
                  </Text>
                </View>
                <Text style={styles.alertArrow}>›</Text>
              </TouchableOpacity>
            )}

            {stats.expiringSoon > 0 && (
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => handleNavigate('products')}
              >
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIconText}>⏰</Text>
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Expiring Soon</Text>
                  <Text style={styles.alertMessage}>
                    {stats.expiringSoon} product{stats.expiringSoon > 1 ? 's' : ''} expiring within 30 days
                  </Text>
                </View>
                <Text style={styles.alertArrow}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Top Products */}
        {topProducts.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>🏆 Top Products</Text>
            
            {topProducts.map((product, index) => (
              <View key={product.productId} style={styles.productCard}>
                <View style={styles.productRank}>
                  <Text style={styles.productRankText}>#{index + 1}</Text>
                </View>
                {product.imageUrl && (
                  <Image 
                    source={{ uri: product.imageUrl }} 
                    style={styles.productImage}
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <View style={styles.productOrderBadge}>
                    <Text style={styles.productOrderCount}>🛒 {product.orderCount}</Text>
                    <Text style={styles.productOrderLabel}> order{product.orderCount !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(main)/(store-owner)/inventory/store-product')}
            >
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={styles.actionText}>Manage Products</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(main)/(store-owner)/inventory/expired-products')}
            >
              <Text style={styles.actionIcon}>⚠️</Text>
              <Text style={styles.actionText}>Expired Items</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(main)/(store-owner)/inventory/record-walk-in-sale')}
            >
              <Text style={styles.actionIcon}>🛍️</Text>
              <Text style={styles.actionText}>Walk-in Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(main)/(store-owner)/inventory/record-damage')}
            >
              <Text style={styles.actionIcon}>💥</Text>
              <Text style={styles.actionText}>Record Damage</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(main)/(store-owner)/inventory/damage-history')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Damage History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>
          
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              📈 {stats.recentlyUpdated} product{stats.recentlyUpdated !== 1 ? 's' : ''} updated in the last 7 days
            </Text>
          </View>

          {stats.totalProducts > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                💵 Average product value: ₱{(stats.totalValue / stats.totalProducts).toFixed(2)}
              </Text>
            </View>
          )}

          {stats.inStock > 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                ✅ {((stats.inStock / stats.totalProducts) * 100).toFixed(1)}% of products are well-stocked
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(60),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
  },
  headerSpacer: {
    width: s(30),
  },
  headerTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    lineHeight: ms(24),
    color: Colors.darkGray,
    includeFontPadding: false,
  },
  refreshButton: {
    width: s(30),
    height: s(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: ms(20),
  },
  scrollView: {
    flex: 1,
  },
  lastUpdatedContainer: {
    paddingHorizontal: s(20),
    paddingVertical: vs(10),
  },
  lastUpdatedText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(16),
  },
  overviewSection: {
    paddingHorizontal: s(20),
    marginBottom: vs(24),
  },
  statsGrid: {
    flexDirection: 'row',
    gap: s(12),
    marginBottom: vs(12),
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(16),
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: Colors.primary,
  },
  valueCard: {
    backgroundColor: '#02545F',
  },
  successCard: {
    backgroundColor: '#F0FDF4',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
  },
  dangerCard: {
    backgroundColor: '#FEE2E2',
  },
  expiredCard: {
    backgroundColor: '#FEE2E2',
  },
  statIcon: {
    fontSize: ms(32),
    marginBottom: vs(8),
  },
  statNumber: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(24),
    color: Colors.white,
    marginBottom: vs(4),
  },
  statLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(11),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  alertsSection: {
    paddingHorizontal: s(20),
    marginBottom: vs(24),
  },
  alertCard: {
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
  alertIconContainer: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  alertIconText: {
    fontSize: ms(24),
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },
  alertMessage: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },
  alertArrow: {
    fontSize: ms(24),
    color: Colors.textSecondary,
  },
  categorySection: {
    paddingHorizontal: s(20),
    marginBottom: vs(24),
  },
  productCard: {
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
  productRank: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  productRankText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(14),
    color: Colors.white,
  },
  productImage: {
    width: s(50),
    height: s(50),
    borderRadius: s(8),
    marginRight: s(12),
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },
  productOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productOrderCount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(13),
    color: Colors.primary,
  },
  productOrderLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },
  actionsSection: {
    paddingHorizontal: s(20),
    marginBottom: vs(24),
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(12),
  },
  actionButton: {
    width: (s(400) - s(40) - s(12)) / 2,
    backgroundColor: Colors.white,
    borderRadius: s(12),
    padding: s(16),
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: ms(32),
    marginBottom: vs(8),
  },
  actionText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: Colors.darkGray,
    textAlign: 'center',
  },
  insightsSection: {
    paddingHorizontal: s(20),
    marginBottom: vs(24),
  },
  insightCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(12),
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    lineHeight: vs(18),
  },
  bottomSpacer: {
    height: vs(40),
  },
});
