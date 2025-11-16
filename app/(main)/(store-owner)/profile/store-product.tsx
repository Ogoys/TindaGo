/**
 * STORE PRODUCT SCREEN - Store owner product management with toggle status
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 903:4611 (Store Product)
 * Baseline: 440x956
 *
 * Features:
 * - Product listing with category filtering
 * - Available/Out of Stock toggle per product
 * - Real-time Firebase integration
 * - Product details modal
 * - Add product navigation
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
  Modal,
  Switch,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ref, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

interface CategoryItem {
  id: string;
  name: string;
  image: any;
  width: number;
}

interface Product {
  id: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  productSize: string;
  unit: string;
  productImage?: string;       // Legacy base64 field
  productImageUrl?: string;    // New Cloudinary URL field
  storeOwnerId: string;
  createdAt: string;
  status: 'available' | 'out_of_stock';
  expiryDate?: string;          // Expiry date field
}

const StoreProductScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [stockAdjustmentValue, setStockAdjustmentValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Categories - Figma: x: 0, y: 281, horizontal scroll
  const categories: CategoryItem[] = [
    {
      id: '1',
      name: 'Fruits & Vegetables',
      image: require('../../../../src/assets/images/store-product/fruits-vegetables.png'),
      width: 80,
    },
    {
      id: '2',
      name: 'Dairy & Bakery',
      image: require('../../../../src/assets/images/store-product/dairy-bakery.png'),
      width: 80,
    },
    {
      id: '3',
      name: 'Snacks & Sweets',
      image: require('../../../../src/assets/images/store-product/snacks.png'),
      width: 80,
    },
    {
      id: '4',
      name: 'Beverages',
      image: require('../../../../src/assets/images/store-product/beverages.png'),
      width: 80,
    },
    {
      id: '5',
      name: 'Personal & Baby Care',
      image: require('../../../../src/assets/images/store-product/personal-care.png'),
      width: 80,
    },
    {
      id: '6',
      name: 'Home & Kitchen',
      image: require('../../../../src/assets/images/store-product/home-kitchen.png'),
      width: 80,
    },
    {
      id: '7',
      name: 'Staple Foods',
      image: require('../../../../src/assets/images/store-product/staple-foods.png'),
      width: 80,
    },
    {
      id: '8',
      name: 'Condiments & Cooking',
      image: require('../../../../src/assets/images/store-product/condiments-cooking.png'),
      width: 100,
    },
    {
      id: '9',
      name: 'Frozen Goods',
      image: require('../../../../src/assets/images/store-product/frozen-goods.png'),
      width: 80,
    },
    {
      id: '10',
      name: 'Miscellaneous & Others',
      image: require('../../../../src/assets/images/store-product/miscellaneous.png'),
      width: 110,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleAddProduct = () => {
    router.push('/(main)/(store-owner)/profile/add-product');
  };

  const handleEditProduct = (product: Product) => {
    router.push({
      pathname: '/(main)/(store-owner)/profile/edit-product',
      params: { productId: product.id }
    });
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    if (selectedCategoryFilter === categoryName) {
      setSelectedCategoryFilter(null);
      setFilteredProducts(products);
    } else {
      setSelectedCategoryFilter(categoryName);
      const filtered = products.filter(product => product.category === categoryName);
      setFilteredProducts(filtered);
    }
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleCloseProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
  };

  // Toggle product availability status
  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    try {
      setUpdatingStatus(productId);
      const newStatus = currentStatus === 'available' ? 'out_of_stock' : 'available';

      const productRef = ref(database, `products/${productId}`);
      await update(productRef, { status: newStatus });

      console.log(`Product ${productId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating product status:', error);
      Alert.alert('Error', 'Failed to update product status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Adjust stock quantity
  const handleStockAdjustment = async (adjustment: number) => {
    if (!selectedProduct) return;

    const newQuantity = Math.max(0, selectedProduct.quantity + adjustment);

    try {
      const productRef = ref(database, `products/${selectedProduct.id}`);
      await update(productRef, { quantity: newQuantity });
      console.log(`Product ${selectedProduct.id} stock updated to ${newQuantity}`);
    } catch (error) {
      console.error('Error updating stock:', error);
      Alert.alert('Error', 'Failed to update stock. Please try again.');
    }
  };

  // Set stock quantity directly
  const handleSetStock = async () => {
    if (!selectedProduct || !stockAdjustmentValue) return;

    const newQuantity = parseInt(stockAdjustmentValue, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number.');
      return;
    }

    try {
      const productRef = ref(database, `products/${selectedProduct.id}`);
      await update(productRef, { quantity: newQuantity });
      setStockAdjustmentValue('');
      console.log(`Product ${selectedProduct.id} stock set to ${newQuantity}`);
    } catch (error) {
      console.error('Error setting stock:', error);
      Alert.alert('Error', 'Failed to set stock. Please try again.');
    }
  };

  // Fetch products from Firebase (optimized - no real-time listener)
  const fetchProducts = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const productsRef = ref(database, 'products');
      const userProductsQuery = query(
        productsRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );

      const snapshot = await get(userProductsQuery);
      const data = snapshot.val();
      
      if (data) {
        const productsList: Product[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          status: data[key].status || 'available',
        }));
        setProducts(productsList);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.productName.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategoryFilter) {
      filtered = filtered.filter(product => product.category === selectedCategoryFilter);
    }

    // Apply stock filter
    if (selectedStockFilter !== 'all') {
      filtered = filtered.filter(product => {
        switch (selectedStockFilter) {
          case 'in-stock':
            return product.quantity >= 10;
          case 'low-stock':
            return product.quantity > 0 && product.quantity < 10;
          case 'out-of-stock':
            return product.quantity === 0;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategoryFilter, selectedStockFilter, searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <ProfileScreenHeader title="Store Product" />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Add Product Card - Figma: x: 20, y: 149, width: 400, height: 80 */}
        <TouchableOpacity style={styles.addProductCard} onPress={handleAddProduct} activeOpacity={0.7}>
          <View style={styles.addProductLeft}>
            {/* Logo Container - Figma: x: 35, y: 164, width: 50, height: 50 */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../src/assets/images/store-product/add-new-icon.png')}
                style={styles.addIcon}
              />
            </View>
            {/* Add Product Text - Figma: x: 100, y: 178, font: Clash Grotesk 500, size: 18 */}
            <Text style={styles.addProductText}>Add Product</Text>
          </View>
          {/* Forward Arrow - Figma: x: 375, y: 174, width: 30, height: 30 */}
          <Image
            source={require('../../../../src/assets/images/store-product/forward-arrow.png')}
            style={styles.forwardArrow}
          />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIconText}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product name or category..."
            placeholderTextColor="rgba(30, 30, 30, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Label - Figma: x: 23, y: 249, font: Clash Grotesk 600, size: 20 */}
        <Text style={styles.categoriesLabel}>Product Categories</Text>

        {/* Categories ScrollView - Figma: x: 0, y: 281, height: 139 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category, index) => (
            <View key={category.id} style={styles.categoryItem}>
              {/* Category Card - Figma: width: 80, height: 80 */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategoryFilter === category.name && styles.selectedCategoryCard
                ]}
                onPress={() => handleCategoryPress(category.id, category.name)}
                activeOpacity={0.7}
              >
                {/* Category Icon - Figma: width: 50, height: 50 */}
                <Image source={category.image} style={styles.categoryIcon} />
              </TouchableOpacity>

              {/* Category Text - Figma: font: Clash Grotesk 500, size: 14 */}
              <Text style={styles.categoryText} numberOfLines={2}>
                {category.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Stock Filter Tabs */}
        <View style={styles.stockFilterContainer}>
          <TouchableOpacity
            style={[
              styles.stockFilterTab,
              selectedStockFilter === 'all' && styles.stockFilterTabActive
            ]}
            onPress={() => setSelectedStockFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.stockFilterText,
              selectedStockFilter === 'all' && styles.stockFilterTextActive
            ]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stockFilterTab,
              selectedStockFilter === 'in-stock' && styles.stockFilterTabActive
            ]}
            onPress={() => setSelectedStockFilter('in-stock')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.stockFilterText,
              selectedStockFilter === 'in-stock' && styles.stockFilterTextActive
            ]}>In Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stockFilterTab,
              selectedStockFilter === 'low-stock' && styles.stockFilterTabActive
            ]}
            onPress={() => setSelectedStockFilter('low-stock')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.stockFilterText,
              selectedStockFilter === 'low-stock' && styles.stockFilterTextActive
            ]}>Low Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stockFilterTab,
              selectedStockFilter === 'out-of-stock' && styles.stockFilterTabActive
            ]}
            onPress={() => setSelectedStockFilter('out-of-stock')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.stockFilterText,
              selectedStockFilter === 'out-of-stock' && styles.stockFilterTextActive
            ]}>Out of Stock</Text>
          </TouchableOpacity>
        </View>

        {/* Products Section - Figma: x: 20, y: 440, width: 400 */}
        <View style={styles.productsSection}>
          {loading ? (
            <Text style={styles.loadingText}>Loading products...</Text>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.noProductsContainer}>
              <Text style={styles.noProductsText}>
                {selectedCategoryFilter ? `No products in "${selectedCategoryFilter}"` : 'No products added yet'}
              </Text>
              <Text style={styles.noProductsSubtext}>
                {selectedCategoryFilter ? 'Try selecting a different category' : 'Tap "Add Product" to get started'}
              </Text>
            </View>
          ) : (
            filteredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                {/* Product Card Inner Container */}
                <View style={styles.productCardContent}>
                  {/* Product Card - Figma: width: 400, height: 150 */}
                  <TouchableOpacity
                    style={styles.productCardInner}
                    onPress={() => handleProductPress(product)}
                    activeOpacity={0.7}
                  >
                    {/* Product Image - Figma: width: 120, height: 120 */}
                    {getProductImageSource(product) ? (
                      <Image
                        source={getProductImageSource(product)!}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={[styles.productImage, styles.productImagePlaceholder]}>
                        <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    )}

                    {/* Product Info Container */}
                    <View style={styles.productInfo}>
                      {/* Product Name - Figma: font: Clash Grotesk 500, size: 18 */}
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.productName}
                      </Text>

                      {/* Price - Figma: font: Clash Grotesk 500, size: 16, color: #02545F */}
                      <Text style={styles.productPrice}>₱{product.price.toFixed(0)}</Text>

                      {/* Description - Figma: font: Clash Grotesk 500, size: 14 */}
                      <Text style={styles.productDescription} numberOfLines={2}>
                        {product.description || `${product.productSize} ${product.unit}`}
                      </Text>

                      {/* Stock Info with Visual Indicators */}
                      <View style={styles.stockInfoContainer}>
                        <Text style={styles.stockLabel}>Stock: </Text>
                        <Text style={[
                          styles.stockValue,
                          product.quantity === 0 ? styles.outOfStockValue :
                          product.quantity < 10 ? styles.lowStockValue : styles.inStockValue
                        ]}>
                          {product.quantity === 0 ? '❌ Out of Stock' :
                           product.quantity < 10 ? `⚠️ ${product.quantity} left` :
                           `✓ ${product.quantity} available`}
                        </Text>
                      </View>

                      {/* Expired Badge - Only for Store Owners */}
                      {product.expiryDate && new Date(product.expiryDate) < new Date() && (
                        <View style={styles.expiredBadge}>
                          <Text style={styles.expiredBadgeText}>⚠️ EXPIRED</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Edit Button - Top right corner of card */}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditProduct(product)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editButtonText}>✎</Text>
                  </TouchableOpacity>

                  {/* Divider Line - Figma: stroke: #02545F, width: 2 */}
                  <View style={styles.dividerLine} />

                  {/* Bottom Row: Status Label and Toggle (inside card) */}
                  <View style={styles.bottomRow}>
                    {/* Status Label */}
                    <Text style={[
                      styles.statusLabel,
                      product.status === 'out_of_stock' && styles.statusLabelOutOfStock
                    ]}>
                      {product.status === 'available' ? 'Available' : 'Out of Stock'}
                    </Text>

                    {/* Toggle Switch */}
                    <Switch
                      value={product.status === 'available'}
                      onValueChange={() => handleToggleStatus(product.id, product.status)}
                      trackColor={{ false: 'rgba(59, 183, 126, 0.3)', true: Colors.primary }}
                      thumbColor={Colors.white}
                      ios_backgroundColor="rgba(59, 183, 126, 0.3)"
                      disabled={updatingStatus === product.id}
                      style={styles.switch}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Product Details Modal */}
      <Modal
        visible={showProductDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseProductDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productDetailsModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseProductDetails}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {selectedProduct && (
                <>
                  {getProductImageSource(selectedProduct) ? (
                    <Image
                      source={getProductImageSource(selectedProduct)!}
                      style={styles.detailsProductImage}
                    />
                  ) : (
                    <View style={[styles.detailsProductImage, styles.detailsImagePlaceholder]}>
                      <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                  )}

                  <View style={styles.detailsContent}>
                    <Text style={styles.detailsProductName}>
                      {selectedProduct.productName}
                    </Text>

                    <Text style={styles.detailsCategory}>
                      {selectedProduct.category}
                    </Text>

                    <Text style={styles.detailsPrice}>
                      ₱{selectedProduct.price.toFixed(2)}
                    </Text>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Status:</Text>
                      <Text style={[
                        styles.detailsValue,
                        { color: selectedProduct.status === 'available' ? Colors.primary : Colors.textSecondary }
                      ]}>
                        {selectedProduct.status === 'available' ? 'Available' : 'Out of Stock'}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Size:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedProduct.productSize} {selectedProduct.unit}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Quantity:</Text>
                      <Text style={[
                        styles.detailsValue,
                        selectedProduct.quantity === 0 ? { color: '#E92B45', fontWeight: '700' } :
                        selectedProduct.quantity < 10 ? { color: '#FF9800', fontWeight: '600' } :
                        { color: Colors.primary }
                      ]}>
                        {selectedProduct.quantity} {selectedProduct.unit || 'pieces'}
                        {selectedProduct.quantity === 0 && ' - OUT OF STOCK'}
                        {selectedProduct.quantity > 0 && selectedProduct.quantity < 10 && ' - LOW STOCK!'}
                      </Text>
                    </View>

                    {/* Stock Adjustment Controls */}
                    <View style={styles.stockAdjustmentSection}>
                      <Text style={styles.stockAdjustmentTitle}>Adjust Stock:</Text>
                      
                      {/* Quick adjustment buttons */}
                      <View style={styles.stockButtonRow}>
                        <TouchableOpacity 
                          style={styles.stockButton}
                          onPress={() => handleStockAdjustment(-10)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.stockButtonText}>-10</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.stockButton}
                          onPress={() => handleStockAdjustment(-1)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.stockButtonText}>-1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.stockButton}
                          onPress={() => handleStockAdjustment(1)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.stockButtonText}>+1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.stockButton}
                          onPress={() => handleStockAdjustment(10)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.stockButtonText}>+10</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Set exact quantity */}
                      <View style={styles.setStockRow}>
                        <TextInput
                          style={styles.stockInput}
                          placeholder="Set exact quantity"
                          keyboardType="numeric"
                          value={stockAdjustmentValue}
                          onChangeText={setStockAdjustmentValue}
                        />
                        <TouchableOpacity 
                          style={styles.setStockButton}
                          onPress={handleSetStock}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.setStockButtonText}>Set</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Expiry Date Display */}
                    {selectedProduct.expiryDate && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsLabel}>Expiry Date:</Text>
                        <Text style={[
                          styles.detailsValue,
                          new Date(selectedProduct.expiryDate) < new Date() ? { color: '#E92B45', fontWeight: '700' } :
                          new Date(selectedProduct.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? { color: '#FF9800', fontWeight: '600' } :
                          { color: Colors.darkGray }
                        ]}>
                          {new Date(selectedProduct.expiryDate).toLocaleDateString()}
                          {new Date(selectedProduct.expiryDate) < new Date() && ' - EXPIRED!'}
                          {new Date(selectedProduct.expiryDate) >= new Date() && 
                           new Date(selectedProduct.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && 
                           ' - Expiring Soon'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.descriptionSection}>
                      <Text style={styles.detailsLabel}>Description:</Text>
                      <Text style={styles.detailsDescription}>
                        {selectedProduct.description}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Added:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedProduct.createdAt
                          ? new Date(selectedProduct.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </Text>
                    </View>
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

  scrollContent: {
    paddingHorizontal: s(20),
    paddingTop: vs(30),
    paddingBottom: vs(100),
  },

  // Add Product Card - Figma: x: 20, y: 149, width: 400, height: 80
  addProductCard: {
    width: '100%',
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(15),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  addProductLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Logo Container - Figma: x: 35, y: 164 (relative: x: 15, y: 15), width: 50, height: 50
  logoContainer: {
    width: s(50),
    height: vs(50),
    justifyContent: 'center',
    alignItems: 'center',
  },

  addIcon: {
    width: s(30),
    height: vs(30),
  },

  // Add Product Text - Figma: x: 100, y: 178 (relative: x: 80, y: 29), font: Clash Grotesk 500, size: 18
  addProductText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginLeft: s(15),
  },

  // Forward Arrow - Figma: x: 375, y: 174 (relative), width: 30, height: 30
  forwardArrow: {
    width: s(30),
    height: vs(30),
  },

  // Search Bar
  searchContainer: {
    width: '100%',
    height: vs(55),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(15),
    marginTop: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  searchIconText: {
    fontSize: ms(18),
    marginRight: s(10),
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: Colors.darkGray,
    padding: 0,
  },

  clearButton: {
    width: s(24),
    height: vs(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(12),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },

  clearButtonText: {
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.6)',
    fontWeight: '700',
  },

  // Categories Label - Figma: x: 23, y: 249, font: Clash Grotesk 600, size: 20
  categoriesLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginTop: vs(30),
    marginBottom: vs(12),
  },

  // Categories ScrollView - Figma: x: 0, y: 281, height: 139
  categoriesScrollView: {
    height: vs(150),
    marginLeft: s(-20), // Offset the parent padding
    marginRight: s(-20),
  },

  categoriesContent: {
    paddingLeft: s(20),
    paddingRight: s(20),
    gap: s(20),
  },

  categoryItem: {
    alignItems: 'center',
    marginBottom: vs(10),
  },

  // Category Card - Figma: width: 80, height: 80
  categoryCard: {
    width: s(80),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: vs(8),
  },

  selectedCategoryCard: {
    backgroundColor: Colors.lightGreen,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  // Category Icon - Figma: width: 50, height: 50
  categoryIcon: {
    width: s(50),
    height: vs(50),
  },

  // Category Text - Figma: font: Clash Grotesk 500, size: 14
  categoryText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(11),
    lineHeight: vs(14),
    color: Colors.darkGray,
    textAlign: 'center',
    width: s(85),
    paddingHorizontal: s(2),
    minHeight: vs(28),
  },

  // Products Section - Figma: x: 20, y: 440
  productsSection: {
    marginTop: vs(20),
    width: '100%',
  },

  loadingText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: vs(40),
  },

  noProductsContainer: {
    alignItems: 'center',
    paddingVertical: vs(40),
    paddingHorizontal: s(40),
  },

  noProductsText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: vs(8),
  },

  noProductsSubtext: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Product Card - Figma: width: 400, height: 150
  productCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: s(16),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },

  productCardContent: {
    width: '100%',
  },

  productCardInner: {
    flexDirection: 'row',
    padding: s(15),
    gap: s(22),
  },

  // Product Image - Figma: width: 120, height: 120
  productImage: {
    width: s(120),
    height: vs(120),
    borderRadius: s(16),
  },

  productImagePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Product Name - Figma: font: Clash Grotesk 500, size: 18
  productName: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },

  // Price - Figma: font: Clash Grotesk 500, size: 16, color: #02545F
  productPrice: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(17),
    lineHeight: vs(20),
    color: '#02545F',
    marginBottom: vs(4),
  },

  // Description - Figma: font: Clash Grotesk 500, size: 14
  productDescription: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(17),
    color: 'rgba(30, 30, 30, 0.5)',
    marginTop: vs(4),
  },

  // Divider Line - Figma: stroke: #02545F, width: 2
  dividerLine: {
    height: 2,
    backgroundColor: '#02545F',
    marginHorizontal: s(15),
    marginTop: vs(8),
  },

  // Bottom Row - Contains status label and toggle (inside card, below divider)
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
  },

  // Status Label - Left side text
  statusLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(15),
    lineHeight: vs(20),
    color: Colors.primary,
  },

  statusLabelOutOfStock: {
    color: Colors.textSecondary,
  },

  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },

  // Edit Button - Top right corner of card
  editButton: {
    position: 'absolute',
    top: s(10),
    right: s(10),
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 5,
  },

  editButtonText: {
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.primary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  productDetailsModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: s(380),
    maxHeight: '80%',
    margin: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },

  closeButton: {
    position: 'absolute',
    top: s(15),
    right: s(15),
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  closeButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.darkGray,
  },

  detailsProductImage: {
    width: '100%',
    height: vs(250),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    resizeMode: 'cover',
  },

  detailsContent: {
    padding: s(20),
  },

  detailsProductName: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(24),
    lineHeight: vs(28),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  detailsCategory: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    lineHeight: vs(16),
    color: Colors.textSecondary,
    marginBottom: vs(12),
  },

  detailsPrice: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(28),
    lineHeight: vs(32),
    color: Colors.primary,
    marginBottom: vs(20),
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
    paddingVertical: vs(8),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },

  detailsLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    lineHeight: vs(18),
    color: Colors.darkGray,
  },

  detailsValue: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(16),
    lineHeight: vs(18),
    color: Colors.textSecondary,
  },

  descriptionSection: {
    marginTop: vs(8),
    marginBottom: vs(16),
  },

  detailsDescription: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(16),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginTop: vs(8),
    textAlign: 'justify',
  },

  // Stock Info Styles
  stockInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(8),
  },

  stockLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(13),
    color: Colors.darkGray,
  },

  stockValue: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    lineHeight: vs(16),
  },

  inStockValue: {
    color: '#2E7D32',
  },

  lowStockValue: {
    color: '#FF9800',
  },

  outOfStockValue: {
    color: '#E92B45',
  },

  detailsImagePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stock Adjustment Styles
  stockAdjustmentSection: {
    marginTop: vs(16),
    marginBottom: vs(16),
    paddingTop: vs(16),
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },

  stockAdjustmentTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(12),
  },

  stockButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },

  stockButton: {
    flex: 1,
    marginHorizontal: s(4),
    paddingVertical: vs(12),
    backgroundColor: Colors.primary,
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  stockButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.white,
  },

  setStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stockInput: {
    flex: 1,
    height: vs(45),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: s(8),
    paddingHorizontal: s(12),
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    marginRight: s(8),
  },

  setStockButton: {
    paddingVertical: vs(12),
    paddingHorizontal: s(20),
    backgroundColor: Colors.primary,
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  setStockButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.white,
  },

  // Stock Filter Tabs Styles
  stockFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: vs(16),
    marginBottom: vs(16),
    paddingHorizontal: s(10),
  },

  stockFilterTab: {
    flex: 1,
    paddingVertical: vs(10),
    paddingHorizontal: s(8),
    marginHorizontal: s(4),
    backgroundColor: Colors.white,
    borderRadius: s(10),
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },

  stockFilterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  stockFilterText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  stockFilterTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },

  // Expired Badge Styles
  expiredBadge: {
    marginTop: vs(6),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    backgroundColor: '#E92B45',
    borderRadius: s(6),
    alignSelf: 'flex-start',
  },

  expiredBadgeText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(11),
    color: Colors.white,
  },
});

export default StoreProductScreen;
