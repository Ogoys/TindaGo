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
} from 'react-native';
import { router } from 'expo-router';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

interface CategoryItem {
  id: string;
  name: string;
  image: any;
  width: number; // Category name width for text alignment
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
  productImage: string; // Base64 string
  storeOwnerId: string;
  createdAt: string;
  status: string;
}

const StoreProductScreen = () => {
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Product categories data with exact names from Figma
  const categories: CategoryItem[] = [
    {
      id: '1',
      name: 'Fruits &\nVegetables',
      image: require('../../../../src/assets/images/store-product/fruits-vegetables.png'),
      width: 70, // Figma: width: 70, height: 34
    },
    {
      id: '2',
      name: 'Dairy &\nBakery',
      image: require('../../../../src/assets/images/store-product/dairy-bakery.png'),
      width: 46, // Figma: width: 46, height: 34
    },
    {
      id: '3',
      name: 'Snacks',
      image: require('../../../../src/assets/images/store-product/snacks.png'),
      width: 46, // Figma: width: 46, height: 17
    },
    {
      id: '4',
      name: 'Beverages', // Note: Figma shows "Baverages" but using correct spelling
      image: require('../../../../src/assets/images/store-product/beverages.png'),
      width: 67, // Figma: width: 67, height: 17
    },
    {
      id: '5',
      name: 'Personal \nCare',
      image: require('../../../../src/assets/images/store-product/personal-care.png'),
      width: 58, // Figma: width: 58, height: 34
    },
    {
      id: '6',
      name: 'Home &\nKitchen',
      image: require('../../../../src/assets/images/store-product/home-kitchen.png'),
      width: 46, // Figma: width: 46, height: 34
    },
    {
      id: '7',
      name: 'Home Care',
      image: require('../../../../src/assets/images/store-product/home-care.png'),
      width: 70, // Figma: width: 70, height: 17
    },
    {
      id: '8',
      name: 'Baby Care',
      image: require('../../../../src/assets/images/store-product/baby-care.png'),
      width: 67, // Figma: width: 67, height: 17
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleAddProduct = () => {
    router.push('/(main)/(store-owner)/profile/add-product');
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    console.log(`Category pressed: ${categoryName}`);

    const mappedCategory = categoryMapping[categoryName] || categoryName;

    if (selectedCategoryFilter === mappedCategory) {
      // If same category clicked, clear filter (show all)
      setSelectedCategoryFilter(null);
      setFilteredProducts(products);
    } else {
      // Filter products by selected category
      setSelectedCategoryFilter(mappedCategory);
      const filtered = products.filter(product => product.category === mappedCategory);
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

  // Fetch products from Firebase
  const fetchProducts = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Query products for current store owner
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
          ...data[key]
        }));
        setProducts(productsList);
        // Update filtered products based on current filter
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

  // Fetch products on component mount
  useEffect(() => {
    const unsubscribe = fetchProducts();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Initialize filtered products when products change
  useEffect(() => {
    if (!selectedCategoryFilter) {
      setFilteredProducts(products);
    }
  }, [products, selectedCategoryFilter]);

  // Map category names to match product categories
  const categoryMapping: { [key: string]: string } = {
    'Fruits &\nVegetables': 'Fruit & Vegetable',
    'Dairy &\nBakery': 'Dairy & Bakery',
    'Snacks': 'Snacks',
    'Beverages': 'Beverages',
    'Personal \nCare': 'Personal Care',
    'Home &\nKitchen': 'Home & Kitchen',
    'Home Care': 'Home Care',
    'Baby Care': 'Baby Care',
  };

  return (
    <View style={styles.container}>
      {/* Status Bar - Figma: 9:41 AM status */}
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Time Display - Figma: x: 71, y: 10, font: ABeeZee 500, size: 15 */}
      <Text style={styles.timeText}>9:41</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Back Button - Figma: x: 20, y: 79, width: 30, height: 30 */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/store-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x: 20, y: 149, font: Clash Grotesk 600, size: 24 */}
        <Text style={styles.title}>Store Product</Text>

        {/* Add Product Card - Figma: x: 20, y: 199, width: 400, height: 80 */}
        <TouchableOpacity style={styles.addProductCard} onPress={handleAddProduct} activeOpacity={0.7}>
          <View style={styles.addProductLeft}>
            {/* Add Icon - Figma: x: 35, y: 219, width: 40, height: 40 */}
            <View style={styles.addIconContainer}>
              <Image
                source={require('../../../../src/assets/images/store-product/add-new-icon.png')}
                style={styles.addIcon}
              />
            </View>
            {/* Add Product Text - Figma: x: 95, y: 227, font: Clash Grotesk 500, size: 18 */}
            <Text style={styles.addProductText}>Add Product</Text>
          </View>
          {/* Forward Arrow - Figma: x: 375, y: 224, width: 30, height: 30 */}
          <Image
            source={require('../../../../src/assets/images/store-product/forward-arrow.png')}
            style={styles.forwardArrow}
          />
        </TouchableOpacity>

        {/* Categories Section Title - Figma: x: 20, y: 299, font: Clash Grotesk 600, size: 24 */}
        <Text style={styles.categoriesTitle}>Categories</Text>

        {/* Categories Horizontal ScrollView - Figma: x: 20, y: 349, height: 141 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesScrollView}
        >
          {categories.map((category, index) => (
            <View
              key={category.id}
              style={[
                styles.categoryItem,
                { marginRight: index === categories.length - 1 ? s(20) : s(20) } // Figma: 20px spacing
              ]}
            >
              {/* Category Card with Icon */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  selectedCategoryFilter === (categoryMapping[category.name] || category.name) && styles.selectedCategoryCard
                ]}
                onPress={() => handleCategoryPress(category.id, category.name)}
                activeOpacity={0.7}
              >
                {/* Category Icon - Figma: width: 50, height: 50, centered in 80x80 card */}
                <Image source={category.image} style={styles.categoryIcon} />
              </TouchableOpacity>

              {/* Category Name - Figma: various widths, font: Clash Grotesk 500, size: 12 */}
              <Text style={[styles.categoryText, { width: s(category.width) }]}>
                {category.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Your Products Section */}
        <Text style={styles.productsTitle}>Your Products</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading products...</Text>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.noProductsContainer}>
            <Text style={styles.noProductsText}>
              {selectedCategoryFilter ? `No products found in "${selectedCategoryFilter}"` : 'No products added yet'}
            </Text>
            <Text style={styles.noProductsSubtext}>
              {selectedCategoryFilter ? 'Try selecting a different category' : 'Tap "Add Product" to get started'}
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
            style={styles.productsScrollView}
          >
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => handleProductPress(product)}
                activeOpacity={0.7}
              >
                {/* Product Image */}
                <Image
                  source={{ uri: product.productImage }}
                  style={styles.productImage}
                />

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.productName}
                  </Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                  <Text style={styles.productDetails}>
                    {product.productSize} {product.unit} • Qty: {product.quantity}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseProductDetails}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {selectedProduct && (
                <>
                  {/* Product Image */}
                  <Image
                    source={{ uri: selectedProduct.productImage }}
                    style={styles.detailsProductImage}
                  />

                  {/* Product Information */}
                  <View style={styles.detailsContent}>
                    {/* Product Name */}
                    <Text style={styles.detailsProductName}>
                      {selectedProduct.productName}
                    </Text>

                    {/* Category */}
                    <Text style={styles.detailsCategory}>
                      {selectedProduct.category}
                    </Text>

                    {/* Price */}
                    <Text style={styles.detailsPrice}>
                      ₱{selectedProduct.price.toFixed(2)}
                    </Text>

                    {/* Size and Unit */}
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Size:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedProduct.productSize} {selectedProduct.unit}
                      </Text>
                    </View>

                    {/* Quantity */}
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsLabel}>Quantity:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedProduct.quantity} pieces
                      </Text>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionSection}>
                      <Text style={styles.detailsLabel}>Description:</Text>
                      <Text style={styles.detailsDescription}>
                        {selectedProduct.description}
                      </Text>
                    </View>

                    {/* Created Date */}
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
    backgroundColor: Colors.backgroundGray, // Figma: #F4F6F6
  },

  // Status Bar Time - Figma: x: 71, y: 10, font: ABeeZee 500, size: 15
  timeText: {
    position: 'absolute',
    left: s(71),
    top: vs(10),
    fontFamily: 'ABeeZee',
    fontWeight: '500',
    fontSize: s(15),
    lineHeight: vs(17),
    color: Colors.darkGray,
    zIndex: 10,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(50), // Ensure content doesn't get cut off
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
    shadowColor: Colors.shadow,
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

  // Title - Figma: x: 20, y: 149, font: Clash Grotesk 600, size: 24
  title: {
    position: 'absolute',
    left: s(20),
    top: vs(149),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(24),
    lineHeight: vs(29),
    color: Colors.darkGray,
  },

  // Add Product Card - Figma: x: 20, y: 199, width: 400, height: 80
  addProductCard: {
    position: 'absolute',
    left: s(20),
    top: vs(199),
    width: s(400),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  addProductLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Add Icon Container - Figma: x: 35, y: 219 (relative: x: 15, y: 20), width: 40, height: 40
  addIconContainer: {
    width: s(40),
    height: vs(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addIcon: {
    width: s(20),
    height: vs(20),
  },

  // Add Product Text - Figma: x: 95, y: 227 (relative: x: 75, y: 28), font: Clash Grotesk 500, size: 18
  addProductText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginLeft: s(20),
  },

  // Forward Arrow - Figma: x: 375, y: 224 (relative: x: 355, y: 25), width: 30, height: 30
  forwardArrow: {
    width: s(30),
    height: vs(30),
  },

  // Categories Title - Figma: x: 20, y: 299, font: Clash Grotesk 600, size: 24
  categoriesTitle: {
    position: 'absolute',
    left: s(20),
    top: vs(299),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(24),
    lineHeight: vs(29),
    color: Colors.darkGray,
  },

  // Categories ScrollView - Figma: x: 20, y: 349, height: 141 (increased for text space)
  categoriesScrollView: {
    position: 'absolute',
    top: vs(349),
    left: s(0),
    height: vs(180), // Increased height to accommodate text below cards
  },

  categoriesContainer: {
    paddingLeft: s(20),
    alignItems: 'flex-start',
  },

  // Category Item Container - holds card + text
  categoryItem: {
    alignItems: 'center',
    width: s(80),
  },

  // Category Card - Figma: width: 80, height: 80
  categoryCard: {
    width: s(80),
    height: vs(80),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: vs(8), // Small space between card and text
  },

  // Selected Category Card - Visual feedback for active filter
  selectedCategoryCard: {
    backgroundColor: Colors.primary, // Green background when selected
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  // Category Icon - Figma: width: 50, height: 50 (centered in 80x80 card)
  categoryIcon: {
    width: s(50),
    height: vs(50),
    marginBottom: vs(5),
  },

  // Category Text - Figma: various widths, font: Clash Grotesk 500, size: 12
  categoryText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(12),
    lineHeight: vs(15),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  // Products Section Styles
  productsTitle: {
    position: 'absolute',
    top: vs(500), // Moved up further from 520 to 500 (20px higher)
    left: s(20),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(24),
    lineHeight: vs(29),
    color: Colors.darkGray,
    marginBottom: vs(20),
  },

  loadingText: {
    position: 'absolute',
    top: vs(550), // Adjusted to match new title position (500 + 50)
    left: s(0),
    right: s(0),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  noProductsContainer: {
    position: 'absolute',
    top: vs(530), // Adjusted to match new positioning
    left: s(0),
    right: s(0),
    alignItems: 'center',
    paddingVertical: vs(40),
    paddingHorizontal: s(40),
  },

  noProductsText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(18),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: vs(8),
  },

  noProductsSubtext: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(14),
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  productsScrollView: {
    position: 'absolute',
    top: vs(550), // Adjusted to match new title position (500 + 50)
    left: s(0),
    right: s(0),
    bottom: vs(0),
    paddingHorizontal: s(20),
  },

  productsContainer: {
    paddingBottom: vs(100), // Space for bottom content
  },

  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  productImage: {
    width: s(80),
    height: vs(80),
    borderRadius: s(12),
    marginRight: s(15),
    resizeMode: 'cover',
  },

  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  productName: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(16),
    lineHeight: vs(20),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },

  productCategory: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(12),
    lineHeight: vs(14),
    color: Colors.textSecondary,
    marginBottom: vs(8),
  },

  productPrice: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '700',
    fontSize: s(18),
    lineHeight: vs(22),
    color: Colors.primary,
    marginBottom: vs(4),
  },

  productDetails: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(12),
    lineHeight: vs(14),
    color: Colors.textSecondary,
  },

  // Product Details Modal Styles
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
    fontSize: s(16),
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
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '700',
    fontSize: s(24),
    lineHeight: vs(28),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  detailsCategory: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: vs(16),
    color: Colors.textSecondary,
    marginBottom: vs(12),
  },

  detailsPrice: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '700',
    fontSize: s(28),
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
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(16),
    lineHeight: vs(18),
    color: Colors.darkGray,
  },

  detailsValue: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: vs(18),
    color: Colors.textSecondary,
  },

  descriptionSection: {
    marginTop: vs(8),
    marginBottom: vs(16),
  },

  detailsDescription: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(16),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginTop: vs(8),
    textAlign: 'justify',
  },
});

export default StoreProductScreen;