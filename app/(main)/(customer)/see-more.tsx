import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ref, onValue } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { addToCartWithValidation } from '../../../src/api/cart';
import { useUser } from '../../../src/contexts/UserContext';
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs, ms } from "../../../src/constants/responsive";
import { ProductCard, Toast } from "../../../src/components/ui";

// Product interface matching Firebase schema
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
  storeId: string;
  storeName: string;
  storeOwnerName: string;
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'out_of_stock';
}

/**
 * SEE MORE SCREEN - PRODUCT GRID VIEW
 *
 * Baseline: 440x956 (standard TindaGo viewport)
 * Uses responsive scaling for all devices
 *
 * Features:
 * - Header with search and navigation
 * - Product grid layout (2-3 columns based on device width)
 * - Scrollable product list
 */

export default function SeeMoreScreen() {
  const params = useLocalSearchParams();
  const section = (params.section as string) || 'all';
  const { user } = useUser();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Fetch all products from Firebase
  useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: Product[] = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key],
          }))
          .filter(product =>
            product.status === 'available' &&
            product.storeIsOpen !== false  // Only show products from open stores
          );

        setAllProducts(productsList);
        setFilteredProducts(getSectionProducts(productsList, section));
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [section]);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(getSectionProducts(allProducts, section));
    } else {
      const query = searchQuery.toLowerCase();
      const results = getSectionProducts(allProducts, section).filter(product =>
        product.productName.toLowerCase().includes(query) ||
        product.storeName.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
      setFilteredProducts(results);
    }
  }, [searchQuery, allProducts, section]);

  // Get products based on section type
  const getSectionProducts = (products: Product[], sectionType: string): Product[] => {
    if (products.length === 0) return [];

    switch (sectionType) {
      case 'bestSelling':
        // Best Selling - Recently added products (newest first)
        return [...products]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      case 'mostPopular':
        // Most Popular - Diverse products from different categories
        const categoriesMap = new Map<string, Product[]>();
        products.forEach(product => {
          const prods = categoriesMap.get(product.category) || [];
          prods.push(product);
          categoriesMap.set(product.category, prods);
        });

        const diverse: Product[] = [];
        categoriesMap.forEach(prods => {
          if (prods.length > 0) {
            diverse.push(...prods);
          }
        });

        return diverse.sort(() => Math.random() - 0.5);

      case 'freshFinds':
        // Fresh Finds - Most recently updated products
        return [...products]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

      default:
        // All products
        return products;
    }
  };

  // Get section title based on section type
  const getSectionTitle = (): string => {
    switch (section) {
      case 'bestSelling':
        return 'Best Selling';
      case 'mostPopular':
        return 'Most Popular Picks';
      case 'freshFinds':
        return 'Fresh Finds';
      default:
        return 'All Items';
    }
  };

  // Quick add product to cart with store validation
  const handleAddProduct = async (product: Product) => {
    if (!user) {
      router.push('/(auth)/signin' as any);
      return;
    }

    if (product.quantity === 0) {
      setToastMessage('Product is out of stock');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setAddingToCart(product.id);

      // Create cart item object matching CartItem interface
      const cartItem = {
        productId: product.id,
        productName: product.productName,
        productImage: product.productImage,
        storeId: product.storeId,
        storeName: product.storeName,
        quantity: 1,
        price: product.price,
        weight: product.productSize,
        unit: product.unit,
        stock: product.quantity,
        subtotal: product.price * 1,
        isAvailable: product.quantity > 0,
      };

      const result = await addToCartWithValidation(user.id, cartItem);

      if (result.needsConfirmation) {
        // Prompt to replace cart
        Alert.alert(
          'Switch store?',
          `Your cart has items from ${result.currentStore?.storeName}. Replace with ${result.newStore?.storeName}?`,
          [
            { text: 'Keep current', style: 'cancel' },
            {
              text: 'Replace cart',
              style: 'destructive',
              onPress: async () => {
                const forced = await addToCartWithValidation(user.id, cartItem, true);
                if (forced.success) {
                  setToastMessage(`${product.productName} added to cart!`);
                  setToastType('success');
                  setShowToast(true);
                }
              }
            }
          ]
        );
      } else if (result.success) {
        setToastMessage(`${product.productName} added to cart!`);
        setToastType('success');
        setShowToast(true);
      } else {
        setToastMessage('Failed to add product to cart');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastMessage('Failed to add to cart. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setAddingToCart(null);
    }
  };

  // Navigate to product details
  const handleProductPress = (productId: string) => {
    router.push(`/(main)/shared/product-details?id=${productId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#02545F" />
      
      {/* Header Background - Figma: x:0, y:0, width:440, height:180 */}
      <View style={styles.headerBackground}>
        {/* Back Button - Figma: x:20, y:79, width:30, height:30 */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Image 
            source={require("../../../src/assets/images/see-more/chevron-left.png")} 
            style={styles.chevronIcon} 
          />
        </TouchableOpacity>

        {/* Title - Dynamic based on section */}
        <Text style={styles.headerTitle} numberOfLines={1} allowFontScaling={false}>
          {getSectionTitle()}
        </Text>

        {/* Notification Button - Figma: x:375, y:74, width:40, height:40 */}
        <TouchableOpacity style={styles.notificationButton}>
          <Image 
            source={require("../../../src/assets/images/see-more/notification-icon.png")} 
            style={styles.notificationIcon} 
          />
        </TouchableOpacity>

        {/* Search Bar - Figma: x:20, y:155, width:400, height:50 */}
        <View style={styles.searchContainer}>
          <Image 
            source={require("../../../src/assets/images/see-more/search-icon.png")} 
            style={styles.searchIcon} 
          />
          <TextInput
            placeholder='Search for "Items"'
            placeholderTextColor="#7A7B7B"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Section Label - Figma: x:23, y:225, width:80, height:22 */}
        <View style={styles.sectionLabelContainer}>
          <Text style={styles.sectionLabel}>
            {searchQuery ? `Search Results (${filteredProducts.length})` : getSectionTitle()}
          </Text>
        </View>

        {/* Products Grid - Starting from Figma: y:267 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No products found for your search' : 'No products available'}
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={product.productName || 'Unnamed Product'}
                subtitle={product.storeName ? `(${product.storeName})` : ''}
                weight={product.productSize && product.unit ? `${product.productSize} ${product.unit}` : ''}
                price={product.price ? `₱${product.price.toFixed(2)}` : '₱0.00'}
                image={product.productImage ? { uri: product.productImage } : undefined}
                variant="grid"
                onAddPress={() => handleAddProduct(product)}
                onPress={() => handleProductPress(product.id)}
                isAdding={addingToCart === product.id}
              />
            ))}
          </View>
        )}

        {/* Bottom padding for navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6", // Figma background color
  },
  
  // Header Background - Adjusted height for better spacing
  headerBackground: {
    backgroundColor: "#02545F",
    height: vs(165), // Reduced height after removing status bar
    paddingTop: vs(20),
    paddingBottom: vs(20),
  },

  // Back Button - Adjusted position
  backButton: {
    position: "absolute",
    left: s(20),
    top: vs(30),
    width: s(30),
    height: vs(30),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 4,
  },
  chevronIcon: {
    width: s(15),
    height: s(15),
  },

  // Header Title - Fixed to prevent text cropping
  headerTitle: {
    position: "absolute",
    left: s(120), // Adjusted left position to center properly
    top: vs(32),
    width: s(200), // Increased width to prevent horizontal cropping of "Daily"
    height: vs(28), // Increased height to prevent vertical cropping
    color: Colors.white,
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    textAlign: "center",
    lineHeight: vs(24),
    includeFontPadding: false,
    overflow: "visible", // Ensure text doesn't get clipped
  },

  // Notification Button - Adjusted position
  notificationButton: {
    position: "absolute",
    left: s(375),
    top: vs(25),
    width: s(40),
    height: vs(40),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
  },
  notificationIcon: {
    width: s(25),
    height: s(25),
  },

  // Search Container - Adjusted position for better spacing
  // Optimized for small devices: reduced to 390px for compatibility
  searchContainer: {
    position: "absolute",
    left: s(20),
    top: vs(95),
    width: s(390), // Reduced from 400 to 390 for small device compatibility
    height: vs(50),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
  },
  searchIcon: {
    width: s(20),
    height: s(20),
    marginRight: s(20),
  },
  searchInput: {
    flex: 1,
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: "#7A7B7B",
    height: vs(50),
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  // Section Label Container - Better spacing
  sectionLabelContainer: {
    marginLeft: s(23),
    marginTop: vs(25),
    marginBottom: vs(25),
  },
  sectionLabel: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold, // 600 from Figma
    color: Colors.darkGray,
    lineHeight: ms(20) * 1.1, // Figma line height
  },
  
  // Products Grid - Exact Figma spacing from design
  // Group boundingBox: x: 22, width: 396 (total container: 440px)
  // Left margin: 22px, Right margin: 22px
  // Product dimensions: 120px width x 222px height (defined in ProductCard component)
  // Horizontal gaps: ~18-20px, Vertical gap: ~20px
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: s(22), // Exact Figma left/right margins
    columnGap: s(18), // Horizontal gap between products
    rowGap: vs(20), // Vertical gap between rows
    justifyContent: "flex-start",
  },

  bottomPadding: {
    height: vs(120), // Space for navigation
  },

  // Loading Container
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(60),
    paddingHorizontal: s(40),
  },

  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },

  // Empty Container
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(80),
    paddingHorizontal: s(40),
  },

  emptyText: {
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});