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
}

interface CategoryStat {
  name: string;
  count: number;
  value: number;
  percentage: number;
}

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
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
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
      };

      const categoryValues: Record<string, { count: number; value: number }> = {};

      Object.keys(products).forEach(productId => {
        const product: any = products[productId];
        inventoryStats.totalProducts++;

        // Calculate stock levels
        const quantity = product.quantity || 0;
        const price = product.price || 0;
        const category = product.category || 'Uncategorized';

        if (quantity >= 10) {
          inventoryStats.inStock++;
        } else if (quantity > 0) {
          inventoryStats.lowStock++;
        } else {
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

        // Check expiry
        if (product.expiryDate) {
          const expiryDate = new Date(product.expiryDate);
          if (expiryDate < today) {
            inventoryStats.expired++;
          } else if (expiryDate <= thirtyDaysFromNow) {
            inventoryStats.expiringSoon++;
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

      // Convert category data to sorted array
      const categoryArray: CategoryStat[] = Object.keys(categoryValues).map(name => ({
        name,
        count: categoryValues[name].count,
        value: categoryValues[name].value,
        percentage: (categoryValues[name].count / inventoryStats.totalProducts) * 100,
      }));

      categoryArray.sort((a, b) => b.count - a.count);

      setStats(inventoryStats);
      setCategoryStats(categoryArray.slice(0, 5)); // Top 5 categories
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
        router.push('/(main)/(store-owner)/inventory/expired-products');
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
        {(stats.lowStock > 0 || stats.expired > 0 || stats.expiringSoon > 0) && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>🔔 Alerts</Text>
            
            {stats.expired > 0 && (
              <TouchableOpacity 
                style={styles.alertCard}
                onPress={() => handleNavigate('expired')}
              >
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIconText}>🚫</Text>
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Expired Products</Text>
                  <Text style={styles.alertMessage}>
                    {stats.expired} product{stats.expired > 1 ? 's have' : ' has'} expired
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

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>📂 Top Categories</Text>
            
            {categoryStats.map((cat, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>{cat.count} items</Text>
                </View>
                <View style={styles.categoryBar}>
                  <View style={[styles.categoryBarFill, { width: `${cat.percentage}%` }]} />
                </View>
                <View style={styles.categoryFooter}>
                  <Text style={styles.categoryPercentage}>{cat.percentage.toFixed(1)}%</Text>
                  <Text style={styles.categoryValue}>₱{cat.value.toFixed(2)}</Text>
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
    fontSize: ms(20),
    color: Colors.darkGray,
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
  categoryCard: {
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(8),
  },
  categoryName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
  },
  categoryCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },
  categoryBar: {
    height: vs(8),
    backgroundColor: '#F0F0F0',
    borderRadius: s(4),
    overflow: 'hidden',
    marginBottom: vs(8),
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryPercentage: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: Colors.primary,
  },
  categoryValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.darkGray,
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
