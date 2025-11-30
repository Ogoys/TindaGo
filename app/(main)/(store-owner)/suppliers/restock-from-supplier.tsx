/**
 * RESTOCK FROM SUPPLIER SCREEN
 *
 * Smart restock workflow for repeat suppliers
 * Shows only products previously purchased from this supplier
 * Pre-fills supplier info and shows last purchase prices
 *
 * Features:
 * - Supplier info pre-filled
 * - Products filtered by supplier purchase history
 * - Checkbox selection (like Damage/Spoilage)
 * - Last purchase date and price shown
 * - Quick quantity and cost entry
 * - Proceeds to same payment flow as regular purchase orders
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

interface SupplierProduct {
  productId: string;
  productName: string;
  category: string;
  productSize: string;
  unit: string;
  productImage?: string;
  productImageUrl?: string;
  lastPurchaseDate: string;
  lastCostPerUnit: number;
  lastQuantity: number;
  sellingPrice: number; // Current selling price from inventory
  // User input
  selected: boolean;
  quantity: number;
  costPerUnit: number;
  subtotal: number;
  profitPerUnit: number;
  totalProfit: number;
  totalSellingValue: number;
}

const RestockFromSupplierScreen = () => {
  const params = useLocalSearchParams();
  const supplierId = typeof params.supplierId === 'string' ? params.supplierId : '';
  const supplierName = typeof params.supplierName === 'string' ? params.supplierName : '';
  const supplierContact = typeof params.supplierContact === 'string' ? params.supplierContact : '';

  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSupplierProducts();
  }, []);

  const fetchSupplierProducts = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        setLoading(false);
        return;
      }

      // Fetch all purchase orders for this user
      const purchaseOrdersRef = ref(database, 'purchase_orders');
      const purchaseOrdersQuery = query(
        purchaseOrdersRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );

      const snapshot = await get(purchaseOrdersQuery);

      if (!snapshot.exists()) {
        console.log('[Restock] No purchase orders found');
        setLoading(false);
        return;
      }

      const allOrders = snapshot.val();

      // Filter orders by supplier name (case-insensitive)
      const supplierOrders = Object.values(allOrders).filter((order: any) => {
        const orderSupplierName = order.supplierName || '';
        return orderSupplierName.toLowerCase() === supplierName.toLowerCase();
      });

      console.log('[Restock] Found orders from supplier:', supplierOrders.length);

      // Extract unique products from supplier's orders
      const productMap = new Map<string, SupplierProduct>();

      supplierOrders.forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productId = item.productId;

            // Keep most recent purchase info
            if (!productMap.has(productId) ||
                new Date(order.purchaseDate) > new Date(productMap.get(productId)!.lastPurchaseDate)) {
              productMap.set(productId, {
                productId: item.productId,
                productName: item.productName,
                category: item.category || 'General',
                productSize: item.productSize || '',
                unit: item.unit || 'pc',
                productImage: item.productImage,
                productImageUrl: item.productImageUrl,
                lastPurchaseDate: order.purchaseDate,
                lastCostPerUnit: item.costPerUnit,
                lastQuantity: item.quantity,
                sellingPrice: 0, // Will be updated from products database
                selected: false,
                quantity: 0,
                costPerUnit: item.costPerUnit, // Pre-fill with last cost
                subtotal: 0,
                profitPerUnit: 0,
                totalProfit: 0,
                totalSellingValue: 0,
              });
            }
          });
        }
      });

      const supplierProducts = Array.from(productMap.values());
      console.log('[Restock] Unique products from supplier:', supplierProducts.length);

      // Fetch current selling prices from products database
      const productsRef = ref(database, 'products');
      const productsQuery = query(
        productsRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );

      const productsSnapshot = await get(productsQuery);

      if (productsSnapshot.exists()) {
        const allProducts = productsSnapshot.val();

        // Update supplier products with current selling prices
        supplierProducts.forEach(supplierProduct => {
          const productEntry = Object.entries(allProducts).find(
            ([_, product]: [string, any]) => product.id === supplierProduct.productId
          );

          if (productEntry) {
            const [_, productData] = productEntry as [string, any];
            supplierProduct.sellingPrice = productData.price || 0;
            supplierProduct.profitPerUnit = Math.max(0, supplierProduct.sellingPrice - supplierProduct.costPerUnit);
            supplierProduct.totalProfit = 0;
            supplierProduct.totalSellingValue = 0;
          } else {
            // Product not found in inventory, set defaults
            supplierProduct.sellingPrice = 0;
            supplierProduct.profitPerUnit = 0;
            supplierProduct.totalProfit = 0;
            supplierProduct.totalSellingValue = 0;
          }
        });
      }

      setProducts(supplierProducts);
    } catch (error) {
      console.error('[Restock] Error fetching supplier products:', error);
      Alert.alert('Error', 'Failed to load supplier products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProductSelection = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const newSelected = !p.selected;
        const qty = newSelected ? (p.lastQuantity || 1) : 0;
        const subtotal = qty * p.costPerUnit;
        const totalSellingValue = qty * p.sellingPrice;
        const totalProfit = totalSellingValue - subtotal;
        return {
          ...p,
          selected: newSelected,
          quantity: qty,
          subtotal: subtotal,
          profitPerUnit: p.sellingPrice - p.costPerUnit,
          totalProfit: totalProfit,
          totalSellingValue: totalSellingValue,
        };
      }
      return p;
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const qty = Math.max(0, quantity);
        const subtotal = qty * p.costPerUnit;
        const totalSellingValue = qty * p.sellingPrice;
        const totalProfit = totalSellingValue - subtotal;
        return {
          ...p,
          quantity: qty,
          subtotal: subtotal,
          totalProfit: totalProfit,
          totalSellingValue: totalSellingValue,
        };
      }
      return p;
    }));
  };

  const updateCostPerUnit = (productId: string, cost: number) => {
    setProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const costValue = Math.max(0, cost);
        const subtotal = p.quantity * costValue;
        const totalSellingValue = p.quantity * p.sellingPrice;
        const totalProfit = totalSellingValue - subtotal;
        return {
          ...p,
          costPerUnit: costValue,
          subtotal: subtotal,
          profitPerUnit: p.sellingPrice - costValue,
          totalProfit: totalProfit,
          totalSellingValue: totalSellingValue,
        };
      }
      return p;
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const selectedCount = products.filter(p => p.selected).length;
  const totalCost = products
    .filter(p => p.selected)
    .reduce((sum, p) => sum + p.subtotal, 0);
  const totalSellingValue = products
    .filter(p => p.selected)
    .reduce((sum, p) => sum + p.totalSellingValue, 0);
  const totalProfit = totalSellingValue - totalCost;

  const handleProceedToPayment = async () => {
    const selectedItems = products.filter(p => p.selected && p.quantity > 0);

    if (selectedItems.length === 0) {
      Alert.alert('No Products Selected', 'Please select at least one product to restock');
      return;
    }

    // Validate all selected items have quantity and cost
    const invalidItems = selectedItems.filter(p => p.quantity <= 0 || p.costPerUnit <= 0);
    if (invalidItems.length > 0) {
      Alert.alert(
        'Invalid Items',
        'Please enter valid quantity and cost for all selected products'
      );
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Prepare order data for payment screen
      const orderData = {
        supplierName: supplierName,
        supplierContact: supplierContact,
        purchaseDate: new Date().toISOString().split('T')[0],
        items: selectedItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          category: item.category,
          productSize: item.productSize,
          unit: item.unit,
          productImage: item.productImage,
          productImageUrl: item.productImageUrl,
          quantity: item.quantity,
          costPerUnit: item.costPerUnit,
          subtotal: item.subtotal,
        })),
        notes: `Restock from ${supplierName}`,
        totalCost: totalCost,
      };

      // Save to AsyncStorage for payment screen
      const storageKey = `purchase_order_payment_${currentUser.uid}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(orderData));

      console.log('[Restock] Order data saved, navigating to payment');

      // Navigate to payment screen
      router.push('/(main)/(store-owner)/suppliers/purchase-payment' as any);
    } catch (error) {
      console.error('[Restock] Error proceeding to payment:', error);
      Alert.alert('Error', 'Failed to proceed to payment');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading supplier products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/store-owner-purchase-payment/chevron-left.png')}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Restock from Supplier</Text>

        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>{selectedCount}</Text>
        </View>
      </View>

      {/* Supplier Info Card */}
      <View style={styles.supplierInfoCard}>
        <View style={styles.supplierIconCircle}>
          <Text style={styles.supplierIcon}>🏪</Text>
        </View>
        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{supplierName}</Text>
          {supplierContact && (
            <Text style={styles.supplierContact}>📞 {supplierContact}</Text>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image
          source={require('../../../../src/assets/images/home/search-icon.png')}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="rgba(30, 30, 30, 0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Products List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : `No purchase history from ${supplierName}`}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <View key={product.productId} style={styles.productCard}>
              {/* Product Header with Checkbox */}
              <TouchableOpacity
                style={styles.productHeader}
                onPress={() => toggleProductSelection(product.productId)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  product.selected && styles.checkboxSelected
                ]}>
                  {product.selected && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <Image
                  source={getProductImageSource({
                    productImageUrl: product.productImageUrl,
                    productImage: product.productImage
                  })}
                  style={styles.productImage}
                />

                <View style={styles.productHeaderInfo}>
                  <Text style={styles.productName}>{product.productName}</Text>
                  <Text style={styles.productSize}>
                    {product.productSize} • {product.unit}
                  </Text>
                  <Text style={styles.lastPurchaseInfo}>
                    Last: {formatDate(product.lastPurchaseDate)} • ₱{product.lastCostPerUnit.toFixed(2)}/{product.unit}
                  </Text>
                  <Text style={styles.sellingPriceInfo}>
                    Selling Price: ₱{product.sellingPrice.toFixed(2)}/{product.unit} • Profit: ₱{product.profitPerUnit.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Quantity and Cost Inputs - Only show when selected */}
              {product.selected && (
                <View style={styles.productInputs}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor="rgba(30, 30, 30, 0.3)"
                      keyboardType="numeric"
                      value={product.quantity > 0 ? product.quantity.toString() : ''}
                      onChangeText={(text) => {
                        const qty = parseInt(text) || 0;
                        updateQuantity(product.productId, qty);
                      }}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cost per {product.unit}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      placeholderTextColor="rgba(30, 30, 30, 0.3)"
                      keyboardType="decimal-pad"
                      value={product.costPerUnit > 0 ? product.costPerUnit.toString() : ''}
                      onChangeText={(text) => {
                        const cost = parseFloat(text) || 0;
                        updateCostPerUnit(product.productId, cost);
                      }}
                    />
                  </View>

                  <View style={styles.subtotalContainer}>
                    <View style={styles.subtotalRow}>
                      <Text style={styles.subtotalLabel}>Cost:</Text>
                      <Text style={styles.subtotalValue}>₱{product.subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.subtotalRow}>
                      <Text style={styles.subtotalLabel}>Selling Value:</Text>
                      <Text style={styles.sellingValueText}>₱{product.totalSellingValue.toFixed(2)}</Text>
                    </View>
                    <View style={styles.subtotalRow}>
                      <Text style={styles.profitLabel}>Profit:</Text>
                      <Text style={styles.profitValue}>₱{product.totalProfit.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Summary and Proceed Button */}
      {selectedCount > 0 && (
        <View style={styles.bottomContainer}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryHeaderText}>{selectedCount} product{selectedCount > 1 ? 's' : ''} selected</Text>
          </View>

          <View style={styles.summaryDetailsContainer}>
            <View style={styles.summaryDetailRow}>
              <Text style={styles.summaryDetailLabel}>Total Cost:</Text>
              <Text style={styles.summaryDetailValue}>₱{totalCost.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDetailRow}>
              <Text style={styles.summaryDetailLabel}>Selling Value:</Text>
              <Text style={styles.summarySellingValue}>₱{totalSellingValue.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryDetailRow}>
              <Text style={styles.summaryProfitLabel}>Profit:</Text>
              <Text style={styles.summaryProfitValue}>₱{totalProfit.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceedToPayment}
            activeOpacity={0.7}
          >
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(74),
    paddingBottom: vs(20),
    backgroundColor: '#F4F6F6',
  },

  backButton: {
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  chevronIcon: {
    width: s(15),
    height: s(15),
  },

  headerTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '600',
    color: '#1E1E1E',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: s(10),
  },

  selectedBadge: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '700',
    color: Colors.white,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: vs(15),
    fontSize: s(16),
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
    fontFamily: Fonts.primary,
  },

  // Supplier Info Card
  supplierInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: s(20),
    marginBottom: vs(16),
    padding: s(16),
    borderRadius: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  supplierIconCircle: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },

  supplierIcon: {
    fontSize: s(24),
  },

  supplierInfo: {
    flex: 1,
  },

  supplierName: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(4),
  },

  supplierContact: {
    fontFamily: Fonts.primary,
    fontSize: s(13),
    color: 'rgba(30, 30, 30, 0.6)',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: s(20),
    marginBottom: vs(16),
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderRadius: s(12),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },

  searchIcon: {
    width: s(20),
    height: s(20),
    marginRight: s(10),
    tintColor: 'rgba(30, 30, 30, 0.5)',
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: '#1E1E1E',
  },

  // Products List
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: s(20),
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(60),
  },

  emptyIcon: {
    fontSize: s(60),
    marginBottom: vs(16),
  },

  emptyText: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(8),
  },

  emptySubtext: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },

  // Product Card
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    marginBottom: vs(12),
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(16),
  },

  checkbox: {
    width: s(24),
    height: s(24),
    borderRadius: s(6),
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 30, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },

  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  checkmark: {
    color: Colors.white,
    fontSize: s(16),
    fontWeight: '700',
  },

  productImage: {
    width: s(60),
    height: s(60),
    borderRadius: s(8),
    marginRight: s(12),
  },

  productHeaderInfo: {
    flex: 1,
  },

  productName: {
    fontFamily: Fonts.primary,
    fontSize: s(15),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(4),
  },

  productSize: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: 'rgba(30, 30, 30, 0.6)',
    marginBottom: vs(4),
  },

  lastPurchaseInfo: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    color: Colors.primary,
    fontWeight: '500',
  },

  sellingPriceInfo: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    color: '#FF9800',
    fontWeight: '600',
    marginTop: vs(2),
  },

  // Product Inputs
  productInputs: {
    padding: s(16),
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  inputGroup: {
    marginBottom: vs(12),
  },

  inputLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.7)',
    marginBottom: vs(6),
  },

  input: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: '#1E1E1E',
    backgroundColor: '#F4F6F6',
    borderRadius: s(8),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 30, 0.1)',
  },

  subtotalContainer: {
    marginTop: vs(8),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(6),
  },

  subtotalLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
  },

  subtotalValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '600',
    color: '#1E1E1E',
  },

  sellingValueText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '600',
    color: Colors.primary,
  },

  profitLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(13),
    fontWeight: '700',
    color: '#FF9800',
  },

  profitValue: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '700',
    color: '#FF9800',
  },

  bottomSpacer: {
    height: vs(100),
  },

  // Bottom Container
  bottomContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingTop: vs(16),
    paddingBottom: vs(20),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 10,
  },

  summaryHeader: {
    marginBottom: vs(12),
  },

  summaryHeaderText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.7)',
  },

  summaryDetailsContainer: {
    backgroundColor: '#F4F6F6',
    borderRadius: s(12),
    padding: s(12),
    marginBottom: vs(16),
  },

  summaryDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(6),
  },

  summaryDetailLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(13),
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
  },

  summaryDetailValue: {
    fontFamily: Fonts.primary,
    fontSize: s(15),
    fontWeight: '600',
    color: '#1E1E1E',
  },

  summarySellingValue: {
    fontFamily: Fonts.primary,
    fontSize: s(15),
    fontWeight: '600',
    color: Colors.primary,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.1)',
    marginVertical: vs(8),
  },

  summaryProfitLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '700',
    color: '#FF9800',
  },

  summaryProfitValue: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: '700',
    color: '#FF9800',
  },

  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(16),
    paddingVertical: vs(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  proceedButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.white,
  },
});

export default RestockFromSupplierScreen;
