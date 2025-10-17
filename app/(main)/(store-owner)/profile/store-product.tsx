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
} from 'react-native';
import { router } from 'expo-router';
import { ref, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

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
  productImage: string;
  storeOwnerId: string;
  createdAt: string;
  status: 'available' | 'out_of_stock';
}

const StoreProductScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

  // Fetch products from Firebase
  const fetchProducts = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const productsRef = ref(database, 'products');
    const userProductsQuery = query(
      productsRef,
      orderByChild('storeOwnerId'),
      equalTo(currentUser.uid)
    );

    const unsubscribe = onValue(userProductsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: Product[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          status: data[key].status || 'available', // Default to available if not set
        }));
        setProducts(productsList);

        if (selectedCategoryFilter) {
          const filtered = productsList.filter(product => product.category === selectedCategoryFilter);
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(productsList);
        }
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchProducts();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedCategoryFilter) {
      setFilteredProducts(products);
    }
  }, [products, selectedCategoryFilter]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Back Button - Figma: x: 20, y: 79, width: 30, height: 30 */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/store-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x: 154, y: 83, font: Clash Grotesk 600, size: 20 */}
        <Text style={styles.title}>Store Product</Text>

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
                    <Image
                      source={{ uri: product.productImage }}
                      style={styles.productImage}
                    />

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
                  <Image
                    source={{ uri: selectedProduct.productImage }}
                    style={styles.detailsProductImage}
                  />

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
                      <Text style={styles.detailsValue}>
                        {selectedProduct.quantity} pieces
                      </Text>
                    </View>

                    <View style={styles.descriptionSection}>
                      <Text style={styles.detailsLabel}>Description:</Text>
                      <Text style={styles.detailsDescription}>
                        {selectedProduct.description}
                      </Text>
                    </View>

                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Added:</Text>
                      <Text style={styles.detailsValue}>
                        {new Date(selectedProduct.createdAt).toLocaleDateString()}
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
    backgroundColor: '#F4F6F6', // Figma: #F4F6F6
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(100),
  },

  // Back Button - Figma: x: 20, y: 79, width: 30, height: 30
  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(79),
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  backIcon: {
    width: s(15),
    height: vs(15),
  },

  // Title - Figma: x: 154, y: 83, font: Clash Grotesk 600, size: 20
  title: {
    position: 'absolute',
    left: s(154),
    top: vs(83),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
    zIndex: 5,
  },

  // Add Product Card - Figma: x: 20, y: 149, width: 400, height: 80
  addProductCard: {
    position: 'absolute',
    left: s(20),
    top: vs(149),
    width: s(400),
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

  // Categories Label - Figma: x: 23, y: 249, font: Clash Grotesk 600, size: 20
  categoriesLabel: {
    position: 'absolute',
    left: s(23),
    top: vs(249),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
  },

  // Categories ScrollView - Figma: x: 0, y: 281, height: 139
  categoriesScrollView: {
    position: 'absolute',
    top: vs(281),
    left: 0,
    height: vs(150),
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
    position: 'absolute',
    top: vs(450),
    left: s(20),
    right: s(20),
    paddingBottom: vs(50),
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
    width: s(400),
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
});

export default StoreProductScreen;
