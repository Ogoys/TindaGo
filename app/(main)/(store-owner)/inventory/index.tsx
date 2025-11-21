/**
 * INVENTORY DASHBOARD - Comprehensive inventory management with tables
 *
 * Features:
 * - Real-time inventory statistics and insights
 * - Inventory List Table: Product Name, Total, Available, Unavailable, Return, Loan
 * - Return List Table: Product Name, Total Available, Damage, Action Button
 * - Restore returns to inventory functionality
 * - Stock level monitoring and expiry tracking
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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ref, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';

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

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalAvailable: number;
  totalUnavailable: number;
  totalInReturns: number;
  totalInLoans: number;
  expired: number;
  expiringSoon: number;
  recentlyUpdated: number;
  expiredNotRecorded: number;
}

interface ProductStat {
  productId: string;
  name: string;
  orderCount: number;
  imageUrl?: string;
}

interface ProductInventory {
  productId: string;
  productName: string;
  productImage?: string;
  productImageUrl?: string;
  total: number; // Total quantity across all states
  available: number; // In stock and sellable
  unavailable: number; // Out of stock
  returns: number; // In customer returns (pending resolution)
  loans: number; // In loan transactions
  damage: number; // Damaged/spoiled quantity
  price: number;
}

interface ReturnItem {
  productId: string;
  productName: string;
  productImage?: string;
  productImageUrl?: string;
  totalAvailable: number; // Sellable items from resolved returns
  damage: number; // Damaged items from returns
  returnIds: string[]; // Associated return IDs
}

export default function InventoryDashboardScreen() {
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalAvailable: 0,
    totalUnavailable: 0,
    totalInReturns: 0,
    totalInLoans: 0,
    expired: 0,
    expiringSoon: 0,
    recentlyUpdated: 0,
    expiredNotRecorded: 0,
  });
  const [inventoryList, setInventoryList] = useState<ProductInventory[]>([]);
  const [returnList, setReturnList] = useState<ReturnItem[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch all products
      const productsRef = ref(database, 'products');
      const userProductsQuery = query(
        productsRef,
        orderByChild('storeOwnerId'),
        equalTo(user.uid)
      );

      const productsSnapshot = await get(userProductsQuery);
      if (!productsSnapshot.exists()) {
        resetData();
        return;
      }

      const products = productsSnapshot.val();

      // Fetch return goods (pending and resolved)
      const returnGoodsRef = ref(database, 'return_goods');
      const returnsQuery = query(
        returnGoodsRef,
        orderByChild('storeOwnerId'),
        equalTo(user.uid)
      );

      const returnsSnapshot = await get(returnsQuery);
      const returns = returnsSnapshot.exists() ? returnsSnapshot.val() : {};

      // Fetch damages
      const damagesRef = ref(database, 'damages_spoilage');
      const damagesQuery = query(
        damagesRef,
        orderByChild('storeOwnerId'),
        equalTo(user.uid)
      );

      const damagesSnapshot = await get(damagesQuery);
      const damages = damagesSnapshot.exists() ? damagesSnapshot.val() : {};

      // Calculate inventory data per product
      const productInventoryMap: Record<string, ProductInventory> = {};
      const returnItemsMap: Record<string, ReturnItem> = {};

      // Initialize from products
      Object.keys(products).forEach(productId => {
        const product = products[productId];
        productInventoryMap[productId] = {
          productId,
          productName: product.productName || 'Unknown Product',
          productImage: product.productImage,
          productImageUrl: product.productImageUrl,
          total: product.quantity || 0,
          available: product.quantity || 0,
          unavailable: 0,
          returns: 0,
          loans: 0,
          damage: 0,
          price: product.price || 0,
        };
      });

      // Process returns - count pending returns and resolved returns
      Object.keys(returns).forEach(returnId => {
        const returnData = returns[returnId];

        if (!returnData.items) return;

        returnData.items.forEach((item: any) => {
          const productId = item.productId;
          if (!productId) return;

          // Ensure product exists in map
          if (!productInventoryMap[productId]) {
            productInventoryMap[productId] = {
              productId,
              productName: item.productName || 'Unknown Product',
              productImage: item.productImage,
              productImageUrl: item.productImageUrl,
              total: 0,
              available: 0,
              unavailable: 0,
              returns: 0,
              loans: 0,
              damage: 0,
              price: item.price || 0,
            };
          }

          const quantity = item.quantityReturned || item.quantity || 0;

          if (returnData.status === 'pending') {
            // Pending returns - count as in returns
            productInventoryMap[productId].returns += quantity;
          } else if (returnData.status === 'resolved') {
            // Resolved returns - add to return list for restoration
            if (item.condition === 'sellable') {
              if (!returnItemsMap[productId]) {
                returnItemsMap[productId] = {
                  productId,
                  productName: item.productName || 'Unknown Product',
                  productImage: item.productImage,
                  productImageUrl: item.productImageUrl,
                  totalAvailable: 0,
                  damage: 0,
                  returnIds: [],
                };
              }
              returnItemsMap[productId].totalAvailable += quantity;
              if (!returnItemsMap[productId].returnIds.includes(returnId)) {
                returnItemsMap[productId].returnIds.push(returnId);
              }
            } else {
              // Damaged/unsellable resolved returns
              if (!returnItemsMap[productId]) {
                returnItemsMap[productId] = {
                  productId,
                  productName: item.productName || 'Unknown Product',
                  productImage: item.productImage,
                  productImageUrl: item.productImageUrl,
                  totalAvailable: 0,
                  damage: 0,
                  returnIds: [],
                };
              }
              returnItemsMap[productId].damage += quantity;
              if (!returnItemsMap[productId].returnIds.includes(returnId)) {
                returnItemsMap[productId].returnIds.push(returnId);
              }
            }
          }
        });
      });

      // Process damages
      Object.values(damages).forEach((damage: any) => {
        if (!damage.items) return;

        damage.items.forEach((item: any) => {
          const productId = item.productId;
          if (!productId || !productInventoryMap[productId]) return;

          const quantity = item.quantity || 0;
          productInventoryMap[productId].damage += quantity;
        });
      });

      // Calculate stats with expiry tracking
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
        totalAvailable: 0,
        totalUnavailable: 0,
        totalInReturns: 0,
        totalInLoans: 0,
        expired: 0,
        expiringSoon: 0,
        recentlyUpdated: 0,
        expiredNotRecorded: 0,
      };

      const productOrderCounts: Record<string, { name: string; count: number; imageUrl?: string }> = {};

      Object.keys(products).forEach(productId => {
        const product = products[productId];
        const item = productInventoryMap[productId];

        if (item) {
          inventoryStats.totalProducts++;
          inventoryStats.totalValue += item.available * item.price;
          inventoryStats.totalAvailable += item.available;
          inventoryStats.totalUnavailable += item.unavailable;
          inventoryStats.totalInReturns += item.returns;
          inventoryStats.totalInLoans += item.loans;

          if (item.available >= 10) {
            inventoryStats.inStock++;
          } else if (item.available > 0) {
            inventoryStats.lowStock++;
          } else {
            inventoryStats.outOfStock++;
          }

          // Check expiry
          if (product.expiryDate) {
            const expiryDate = parseExpiryDate(product.expiryDate);
            if (expiryDate) {
              expiryDate.setHours(0, 0, 0, 0);
              if (expiryDate <= today) {
                inventoryStats.expiredNotRecorded++;
              } else if (expiryDate <= thirtyDaysFromNow) {
                inventoryStats.expiringSoon++;
              }
            }
          }

          // Check recently updated
          if (product.updatedAt) {
            const updatedDate = new Date(product.updatedAt);
            if (updatedDate >= sevenDaysAgo) {
              inventoryStats.recentlyUpdated++;
            }
          }

          // Initialize product order count tracking
          productOrderCounts[productId] = {
            name: product.productName || 'Unknown Product',
            count: 0,
            imageUrl: product.productImageUrl || product.productImage
          };
        }
      });

      inventoryStats.expired = inventoryStats.expiredNotRecorded;

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

      setStats(inventoryStats);
      setInventoryList(Object.values(productInventoryMap).sort((a, b) =>
        b.total - a.total
      ));
      setReturnList(Object.values(returnItemsMap).filter(item =>
        item.totalAvailable > 0 || item.damage > 0
      ));
      setTopProducts(topProductsArray);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const resetData = () => {
    setStats({
      totalProducts: 0,
      totalValue: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalAvailable: 0,
      totalUnavailable: 0,
      totalInReturns: 0,
      totalInLoans: 0,
      expired: 0,
      expiringSoon: 0,
      recentlyUpdated: 0,
      expiredNotRecorded: 0,
    });
    setInventoryList([]);
    setReturnList([]);
    setTopProducts([]);
    setLoading(false);
    setRefreshing(false);
  };

  const handleRestoreToInventory = async (item: ReturnItem) => {
    Alert.alert(
      'Restore to Inventory',
      `Restore ${item.totalAvailable} units of "${item.productName}" to inventory?\n\nThis will add these items back to your available stock.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            setRestoring(item.productId);
            try {
              const user = auth.currentUser;
              if (!user) return;

              // Get current product quantity
              const productRef = ref(database, `products/${item.productId}`);
              const productSnapshot = await get(productRef);

              if (productSnapshot.exists()) {
                const product = productSnapshot.val();
                const currentQuantity = product.quantity || 0;
                const newQuantity = currentQuantity + item.totalAvailable;

                // Update product quantity
                await update(productRef, {
                  quantity: newQuantity,
                  status: 'available',
                  updatedAt: new Date().toISOString(),
                });

                Alert.alert(
                  'Success',
                  `${item.totalAvailable} units restored to inventory.\n\nNew total: ${newQuantity} units`,
                  [{ text: 'OK', onPress: () => fetchInventoryData() }]
                );
              } else {
                Alert.alert('Error', 'Product not found in inventory');
              }
            } catch (error) {
              console.error('Error restoring to inventory:', error);
              Alert.alert('Error', 'Failed to restore items to inventory');
            } finally {
              setRestoring(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventoryData();
  };

  const handleNavigate = (screen: string) => {
    switch (screen) {
      case 'add-product':
        router.push('/(main)/(store-owner)/inventory/add-product');
        break;
      case 'expired-products':
        router.push('/(main)/(store-owner)/inventory/expired-products');
        break;
      case 'damage-history':
        router.push('/(main)/(store-owner)/inventory/damage-history');
        break;
      case 'products':
        router.push('/(main)/(store-owner)/inventory/store-product');
        break;
      default:
        break;
    }
  };

  const getProductImage = (item: ProductInventory | ReturnItem) => {
    // Check productImageUrl first
    if (item.productImageUrl) {
      // If it's already a data URL or http URL, use it directly
      if (item.productImageUrl.startsWith('data:') || item.productImageUrl.startsWith('http')) {
        return { uri: item.productImageUrl };
      }
      // Otherwise treat it as base64
      return { uri: `data:image/jpeg;base64,${item.productImageUrl}` };
    }
    // Check productImage field
    if (item.productImage) {
      if (item.productImage.startsWith('data:') || item.productImage.startsWith('http')) {
        return { uri: item.productImage };
      }
      return { uri: `data:image/jpeg;base64,${item.productImage}` };
    }
    // Return null for items without images - will show placeholder
    return null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Inventory Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>

          <View style={styles.insightsGrid}>
            <View style={styles.insightCard}>
              <Text style={styles.insightValue}>{stats.totalProducts}</Text>
              <Text style={styles.insightLabel}>Total Products</Text>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightValue}>₱{stats.totalValue.toFixed(0)}</Text>
              <Text style={styles.insightLabel}>Total Value</Text>
            </View>
          </View>

          <View style={styles.insightsGrid}>
            <View style={[styles.insightCard, styles.successCard]}>
              <Text style={styles.insightValue}>{stats.inStock}</Text>
              <Text style={styles.insightLabel}>In Stock</Text>
            </View>

            <View style={[styles.insightCard, styles.warningCard]}>
              <Text style={styles.insightValue}>{stats.lowStock}</Text>
              <Text style={styles.insightLabel}>Low Stock</Text>
            </View>
          </View>

          <View style={styles.insightsGrid}>
            <View style={[styles.insightCard, styles.dangerCard]}>
              <Text style={styles.insightValue}>{stats.outOfStock}</Text>
              <Text style={styles.insightLabel}>Out of Stock</Text>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightValue}>{stats.totalInReturns}</Text>
              <Text style={styles.insightLabel}>In Returns</Text>
            </View>
          </View>
        </View>

        {/* Alerts Section */}
        {(stats.lowStock > 0 || stats.expiredNotRecorded > 0 || stats.expiringSoon > 0) && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>🔔 Alerts</Text>

            {stats.expiredNotRecorded > 0 && (
              <TouchableOpacity
                style={styles.alertCard}
                onPress={() => handleNavigate('expired-products')}
              >
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIconText}>🚫</Text>
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Expired Products</Text>
                  <Text style={styles.alertMessage}>
                    {stats.expiredNotRecorded} expired product{stats.expiredNotRecorded !== 1 ? 's' : ''} need{stats.expiredNotRecorded === 1 ? 's' : ''} attention
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {stats.lowStock > 0 && (
              <TouchableOpacity
                style={styles.alertCard}
                onPress={() => handleNavigate('products')}
              >
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIconText}>⚠️</Text>
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Low Stock Warning</Text>
                  <Text style={styles.alertMessage}>
                    {stats.lowStock} product{stats.lowStock !== 1 ? 's' : ''} running low on stock
                  </Text>
                </View>
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
                    {stats.expiringSoon} product{stats.expiringSoon !== 1 ? 's' : ''} expiring within 30 days
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Top Products */}
        {topProducts.length > 0 && (
          <View style={styles.topProductsSection}>
            <Text style={styles.sectionTitle}>🏆 Top Products</Text>

            {topProducts.map((product, index) => (
              <View key={product.productId} style={styles.topProductCard}>
                <View style={styles.topProductRank}>
                  <Text style={styles.topProductRankText}>#{index + 1}</Text>
                </View>
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl.startsWith('data:') ? product.imageUrl : `data:image/jpeg;base64,${product.imageUrl}` }}
                    style={styles.topProductImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.topProductImage, styles.productImagePlaceholder]}>
                    <Text style={styles.productImagePlaceholderText}>📦</Text>
                  </View>
                )}
                <View style={styles.topProductInfo}>
                  <Text style={styles.topProductName} numberOfLines={2}>{product.name}</Text>
                  <View style={styles.topProductOrderBadge}>
                    <Text style={styles.topProductOrderCount}>🛒 {product.orderCount}</Text>
                    <Text style={styles.topProductOrderLabel}> order{product.orderCount !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleNavigate('add-product')}
            >
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleNavigate('products')}
            >
              <Text style={styles.quickActionIcon}>📦</Text>
              <Text style={styles.quickActionText}>View Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleNavigate('expired-products')}
            >
              <Text style={styles.quickActionIcon}>🚫</Text>
              <Text style={styles.quickActionText}>Expired</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleNavigate('damage-history')}
            >
              <Text style={styles.quickActionIcon}>📋</Text>
              <Text style={styles.quickActionText}>Damage History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inventory List Table */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>📦 Inventory List</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Product</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Total</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Avail</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Unavail</Text>
            <Text style={[styles.tableHeaderText, styles.col5]}>Return</Text>
            <Text style={[styles.tableHeaderText, styles.col6]}>Loan</Text>
          </View>

          {/* Table Rows */}
          {inventoryList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No products in inventory</Text>
            </View>
          ) : (
            inventoryList.map((item, index) => (
              <View
                key={item.productId}
                style={[
                  styles.tableRow,
                  index % 2 === 0 && styles.tableRowEven
                ]}
              >
                <View style={styles.col1}>
                  {getProductImage(item) ? (
                    <Image
                      source={getProductImage(item)!}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.productImage, styles.productImagePlaceholder]}>
                      <Text style={styles.productImagePlaceholderText}>📦</Text>
                    </View>
                  )}
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.productName}
                  </Text>
                </View>
                <Text style={[styles.tableCellText, styles.col2]}>{item.total}</Text>
                <Text style={[styles.tableCellText, styles.col3, styles.successText]}>
                  {item.available}
                </Text>
                <Text style={[styles.tableCellText, styles.col4, styles.dangerText]}>
                  {item.unavailable}
                </Text>
                <Text style={[styles.tableCellText, styles.col5, styles.warningText]}>
                  {item.returns}
                </Text>
                <Text style={[styles.tableCellText, styles.col6]}>
                  {item.loans}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Return List Table */}
        {returnList.length > 0 && (
          <View style={styles.tableSection}>
            <Text style={styles.sectionTitle}>🔄 Return List</Text>
            <Text style={styles.sectionSubtitle}>
              Resolved returns that can be restored to inventory
            </Text>

            {/* Table Header */}
            <View style={styles.returnTableHeader}>
              <Text style={[styles.tableHeaderText, styles.returnCol1]}>Product</Text>
              <Text style={[styles.tableHeaderText, styles.returnCol2]}>Available</Text>
              <Text style={[styles.tableHeaderText, styles.returnCol3]}>Damage</Text>
              <Text style={[styles.tableHeaderText, styles.returnCol4]}>Action</Text>
            </View>

            {/* Table Rows */}
            {returnList.map((item, index) => (
              <View
                key={item.productId}
                style={[
                  styles.returnTableRow,
                  index % 2 === 0 && styles.tableRowEven
                ]}
              >
                <View style={styles.returnCol1}>
                  {getProductImage(item) ? (
                    <Image
                      source={getProductImage(item)!}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.productImage, styles.productImagePlaceholder]}>
                      <Text style={styles.productImagePlaceholderText}>📦</Text>
                    </View>
                  )}
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.productName}
                  </Text>
                </View>
                <Text style={[styles.tableCellText, styles.returnCol2, styles.successText]}>
                  {item.totalAvailable}
                </Text>
                <Text style={[styles.tableCellText, styles.returnCol3, styles.dangerText]}>
                  {item.damage}
                </Text>
                <View style={styles.returnCol4}>
                  <TouchableOpacity
                    style={[
                      styles.restoreButton,
                      item.totalAvailable === 0 && styles.restoreButtonDisabled
                    ]}
                    onPress={() => handleRestoreToInventory(item)}
                    disabled={item.totalAvailable === 0 || restoring === item.productId}
                    activeOpacity={0.7}
                  >
                    {restoring === item.productId ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.restoreButtonText}>
                        {item.totalAvailable === 0 ? 'No Stock' : 'Restore'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },

  // Header
  header: {
    height: vs(100),
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(40),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 2,
  },

  headerSpacer: {
    width: s(40),
  },

  headerTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: '#1E1E1E',
  },

  refreshButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshButtonText: {
    fontSize: ms(18),
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  // Insights Section
  insightsSection: {
    padding: s(20),
    backgroundColor: '#FFFFFF',
    marginBottom: vs(10),
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: '#1E1E1E',
    marginBottom: vs(15),
  },

  sectionSubtitle: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(13),
    color: 'rgba(30, 30, 30, 0.6)',
    marginBottom: vs(15),
  },

  insightsGrid: {
    flexDirection: 'row',
    gap: s(10),
    marginBottom: vs(10),
  },

  insightCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: s(15),
    padding: s(15),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  successCard: {
    backgroundColor: '#ECFDF5',
    borderColor: Colors.primary,
  },

  warningCard: {
    backgroundColor: '#FEF3E2',
    borderColor: '#FFA500',
  },

  dangerCard: {
    backgroundColor: '#FEE2E2',
    borderColor: '#E92B45',
  },

  insightValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(24),
    color: '#1E1E1E',
    marginBottom: vs(5),
  },

  insightLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.6)',
    textAlign: 'center',
  },

  // Table Section
  tableSection: {
    padding: s(20),
    backgroundColor: '#FFFFFF',
    marginBottom: vs(10),
  },

  // Inventory Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: vs(12),
    paddingHorizontal: s(10),
    borderRadius: s(10),
    marginBottom: vs(5),
  },

  tableHeaderText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(11),
    color: '#FFFFFF',
    textAlign: 'center',
  },

  col1: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: s(5),
  },

  col2: {
    width: '10%',
    textAlign: 'center',
  },

  col3: {
    width: '12%',
    textAlign: 'center',
  },

  col4: {
    width: '13%',
    textAlign: 'center',
  },

  col5: {
    width: '13%',
    textAlign: 'center',
  },

  col6: {
    width: '12%',
    textAlign: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: vs(12),
    paddingHorizontal: s(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },

  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },

  tableCellText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: '#1E1E1E',
  },

  successText: {
    color: Colors.primary,
  },

  warningText: {
    color: '#FFA500',
  },

  dangerText: {
    color: '#E92B45',
  },

  productImage: {
    width: s(40),
    height: s(40),
    borderRadius: s(8),
    marginRight: s(10),
    backgroundColor: '#F3F4F6',
  },

  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },

  productImagePlaceholderText: {
    fontSize: ms(20),
  },

  productName: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: '#1E1E1E',
  },

  // Return Table
  returnTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFA500',
    paddingVertical: vs(12),
    paddingHorizontal: s(10),
    borderRadius: s(10),
    marginBottom: vs(5),
  },

  returnCol1: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: s(5),
  },

  returnCol2: {
    width: '15%',
    textAlign: 'center',
  },

  returnCol3: {
    width: '15%',
    textAlign: 'center',
  },

  returnCol4: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  returnTableRow: {
    flexDirection: 'row',
    paddingVertical: vs(12),
    paddingHorizontal: s(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },

  restoreButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(8),
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
    minWidth: s(70),
    alignItems: 'center',
    justifyContent: 'center',
  },

  restoreButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },

  restoreButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    paddingVertical: vs(40),
    alignItems: 'center',
  },

  emptyText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(15),
    color: 'rgba(30, 30, 30, 0.5)',
  },

  // Alerts Section
  alertsSection: {
    padding: s(20),
    backgroundColor: '#FFFFFF',
    marginBottom: vs(10),
  },

  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3E2',
    borderRadius: s(15),
    padding: s(15),
    marginBottom: vs(10),
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },

  alertIconContainer: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(15),
  },

  alertIconText: {
    fontSize: ms(24),
  },

  alertContent: {
    flex: 1,
    justifyContent: 'center',
  },

  alertTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(15),
    color: '#1E1E1E',
    marginBottom: vs(5),
  },

  alertMessage: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(13),
    color: 'rgba(30, 30, 30, 0.7)',
  },

  // Top Products Section
  topProductsSection: {
    padding: s(20),
    backgroundColor: '#FFFFFF',
    marginBottom: vs(10),
  },

  topProductCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: s(15),
    padding: s(15),
    marginBottom: vs(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  topProductRank: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },

  topProductRankText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(14),
    color: '#FFFFFF',
  },

  topProductImage: {
    width: s(50),
    height: s(50),
    borderRadius: s(10),
    marginRight: s(12),
    backgroundColor: '#E5E7EB',
  },

  topProductInfo: {
    flex: 1,
  },

  topProductName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: '#1E1E1E',
    marginBottom: vs(5),
  },

  topProductOrderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topProductOrderCount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(13),
    color: Colors.primary,
  },

  topProductOrderLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.6)',
  },

  // Quick Actions Section
  quickActionsSection: {
    padding: s(20),
    backgroundColor: '#FFFFFF',
    marginBottom: vs(10),
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
  },

  quickActionButton: {
    width: (s(400) - s(50)) / 2, // 2 buttons per row with gaps
    backgroundColor: Colors.lightGreen,
    borderRadius: s(15),
    paddingVertical: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  quickActionIcon: {
    fontSize: ms(32),
    marginBottom: vs(8),
  },

  quickActionText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: '#1E1E1E',
  },

  // Bottom Spacer
  bottomSpacer: {
    height: vs(40),
  },
});
