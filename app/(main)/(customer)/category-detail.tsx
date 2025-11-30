/**
 * CATEGORY DETAIL SCREEN - Dynamic Category Products View
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1057-2352 (Fruits & Vegetables example)
 * Baseline: 440x1242
 *
 * This ONE screen dynamically changes for ALL 10 categories:
 * - Header color changes based on category
 * - Category name updates
 * - Products filtered by category
 * - Same structure as see-more.tsx with improved ProductCard
 */

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
import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { addToCartWithValidation } from '../../../src/api/cart';
import { useUser } from '../../../src/contexts/UserContext';
import { Colors } from "../../../src/constants/Colors";
import { Fonts } from "../../../src/constants/Fonts";
import { s, vs, ms } from "../../../src/constants/responsive";
import { ProductCard, Toast } from "../../../src/components/ui";
import { getProductImageSource } from "../../../src/lib/helpers/imageHelper";

// Product interface
interface Product {
  id: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  productSize: string;
  unit: string;
  productImage: string; // Legacy base64 field
  productImageUrl?: string; // New Cloudinary URL field
  storeOwnerId: string;
  storeId: string;
  storeName: string;
  storeOwnerName: string;
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'out_of_stock';
}

// Category configuration - IDs must match home.tsx categoryData
const CATEGORY_CONFIG: Record<string, { name: string; color: string }> = {
  "fruits-vegetables": {
    name: "Fruits & Vegetables",
    color: "#3BB77E", // Primary green
  },
  "dairy-bakery": {
    name: "Dairy & Bakery",
    color: "#D39447", // Orange
  },
  "snacks-sweets": {
    name: "Snacks & Sweets",
    color: "#B34F2D", // Brown-red
  },
  "beverages": {
    name: "Beverages",
    color: "#646A8A", // Blue-gray
  },
  "personal-baby-care": {
    name: "Personal & Baby Care",
    color: "#945DA1", // Purple
  },
  "home-kitchen": {
    name: "Home & Kitchen",
    color: "#2788BB", // Blue
  },
  "staple-foods": {
    name: "Staple Foods",
    color: "#F15A8D", // Pink
  },
  "condiments-cooking": {
    name: "Condiments & Cooking",
    color: "#787161", // Gray-brown
  },
  "frozen-goods": {
    name: "Frozen Goods",
    color: "#A4E0E3", // Cyan
  },
  "miscellaneous": {
    name: "Miscellaneous & Others",
    color: "#765640", // Dark brown
  },
};

export default function CategoryDetailScreen() {
  const params = useLocalSearchParams();
  const categoryId = (params.category as string) || 'fruits-vegetables';
  const { user } = useUser();

  // Get category configuration
  const categoryConfig = CATEGORY_CONFIG[categoryId] || CATEGORY_CONFIG["fruits-vegetables"];
  const categoryName = categoryConfig.name;
  const headerColor = categoryConfig.color;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Fetch products from Firebase and filter by category (one-time per category)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const snap = await get(ref(database, 'products'));
        if (!cancelled && snap.exists()) {
          const data = snap.val();
          const productsList: Product[] = Object.keys(data)
            .map(key => ({
              id: key,
              ...data[key],
            }))
            .filter(product =>
              product.status === 'available' &&
              product.storeIsOpen !== false &&
              product.category &&
              product.category.toLowerCase() === categoryName.toLowerCase()
            );

          setAllProducts(productsList);
          setFilteredProducts(productsList);
        } else if (!cancelled) {
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } catch (e) {
        console.error('Error loading category products:', e);
        if (!cancelled) {
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [categoryName]);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(allProducts);
    } else {
      const query = searchQuery.toLowerCase();
      const results = allProducts.filter(product =>
        product.productName.toLowerCase().includes(query) ||
        product.storeName.toLowerCase().includes(query)
      );
      setFilteredProducts(results);
    }
  }, [searchQuery, allProducts]);

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

      // Normalize storeId: use storeId if present, otherwise use storeOwnerId
      const normalizedStoreId = product.storeId || (product as any).storeOwnerId;
      
      const cartItem = {
        productId: product.id,
        productName: product.productName,
        productImage: product.productImage,
        productImageUrl: product.productImageUrl,
        storeId: normalizedStoreId,
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
      <StatusBar barStyle="light-content" backgroundColor={headerColor} />

      {/* Header Background - Dynamic color - Figma: x:0, y:0, width:440, height:180 */}
      <View style={[styles.headerBackground, { backgroundColor: headerColor }]}>
        {/* Back Button - Figma: x:20, y:79, width:30, height:30 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Image
            source={require("../../../src/assets/images/category-detail/chevron-left.png")}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Title - Dynamic category name - Figma: x:133, y:83, width:174, height:22 */}
        <Text style={styles.headerTitle} numberOfLines={1} allowFontScaling={false}>
          {categoryName}
        </Text>

        {/* Notification Button - Figma: x:375, y:74, width:40, height:40 */}
        <TouchableOpacity style={styles.notificationButton}>
          <Image
            source={require("../../../src/assets/images/category-detail/notification-icon.png")}
            style={styles.notificationIcon}
          />
        </TouchableOpacity>

        {/* Search Bar - Figma: x:20, y:155, width:400, height:50 */}
        <View style={styles.searchContainer}>
          <Image
            source={require("../../../src/assets/images/category-detail/search-icon.png")}
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
        {/* Section Label - Figma: x:23, y:225, width:181, height:22 */}
        <View style={styles.sectionLabelContainer}>
          <Text style={styles.sectionLabel}>
            {searchQuery ? `Search Results (${filteredProducts.length})` : categoryName}
          </Text>
        </View>

        {/* Products Grid - Starting from Figma: y:267 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={headerColor} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No products found for your search' : `No products available in ${categoryName}`}
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
                image={getProductImageSource(product)}
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

  // Header Background - Dynamic color based on category
  headerBackground: {
    height: vs(165),
    paddingTop: vs(20),
    paddingBottom: vs(20),
  },

  // Back Button - Figma: x:20, y:79, width:30, height:30
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

  // Header Title - Dynamic category name
  headerTitle: {
    position: "absolute",
    left: s(80),
    right: s(80),
    top: vs(32),
    color: Colors.white,
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    textAlign: "center",
    lineHeight: vs(24),
    includeFontPadding: false,
    overflow: "visible",
  },

  // Notification Button - Figma: x:375, y:74, width:40, height:40
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

  // Search Container - Figma: x:20, y:155, width:400, height:50
  searchContainer: {
    position: "absolute",
    left: s(20),
    top: vs(95),
    width: s(390),
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

  // Section Label Container
  sectionLabelContainer: {
    marginLeft: s(23),
    marginTop: vs(25),
    marginBottom: vs(25),
  },
  sectionLabel: {
    fontSize: ms(20),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    lineHeight: ms(20) * 1.1,
  },

  // Products Grid - Exact Figma spacing
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: s(22),
    columnGap: s(18),
    rowGap: vs(20),
    justifyContent: "flex-start",
  },

  bottomPadding: {
    height: vs(120),
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
