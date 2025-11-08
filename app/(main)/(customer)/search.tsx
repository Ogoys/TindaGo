import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { s, vs, ms } from '../../../src/constants/responsive';
import { Colors } from '../../../src/constants/Colors';
import { Fonts } from '../../../src/constants/Fonts';
import { ProductCard } from '../../../src/components/ui';
import { useUser } from '../../../src/contexts/UserContext';
import { addToCart } from '../../../src/api/cart';

/**
 * CUSTOMER SEARCH SCREEN
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1196-1001
 * 
 * Features:
 * - Search bar with back button
 * - Real-time product search
 * - Filter button
 * - Product grid display
 * - Recent searches
 */

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
  productImage: string;
  storeOwnerId: string;
  storeId: string;
  storeName: string;
  storeOwnerName: string;
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'out_of_stock';
}

export default function SearchScreen() {
  const { user } = useUser();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Fetch products from Firebase
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
          .filter(product => {
            // Only show available products from open stores
            if (product.status !== 'available') return false;
            if (product.storeIsOpen === false) return false;
            if (!product.productName || !product.price || !product.storeName) return false;
            return true;
          });

        setAllProducts(productsList);
      } else {
        setAllProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load recent searches from storage (simplified for now)
  useEffect(() => {
    // TODO: Load from AsyncStorage
    setRecentSearches([]);
  }, []);

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const query = searchQuery.toLowerCase().trim();

    const results = allProducts.filter(product => {
      const nameMatch = product.productName.toLowerCase().includes(query);
      const categoryMatch = product.category.toLowerCase().includes(query);
      const storeMatch = product.storeName.toLowerCase().includes(query);
      const descriptionMatch = product.description?.toLowerCase().includes(query);

      return nameMatch || categoryMatch || storeMatch || descriptionMatch;
    });

    setFilteredProducts(results);
    setSearching(false);
  }, [searchQuery, allProducts]);

  // Add to cart function
  const handleQuickAdd = async (product: Product) => {
    if (!user) {
      router.push('/(auth)/signin' as any);
      return;
    }

    if (product.quantity <= 0) {
      return;
    }

    setAddingProductId(product.id);

    try {
      await addToCart(user.id, {
        productId: product.id,
        productName: product.productName,
        productImage: product.productImage,
        storeId: product.storeId,
        storeName: product.storeName,
        quantity: 1,
        price: product.price,
        weight: product.productSize,
        unit: product.unit,
        subtotal: product.price,
        stock: product.quantity,
        isAvailable: product.quantity > 0,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingProductId(null);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      // Save to recent searches
      const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(newRecent);
      // TODO: Save to AsyncStorage
    }
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with Search Bar */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={ms(24)} color="#1E1E1E" />
        </TouchableOpacity>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Image
            source={require('../../../src/assets/images/customer-home/search-icon.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder='Search for "Items"'
            placeholderTextColor="#7A7B7B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={ms(24)} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3BB77E" />
          </View>
        ) : searchQuery.trim() === '' ? (
          // Recent Searches / Empty State
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={ms(120)} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Search for products</Text>
            <Text style={styles.emptySubtitle}>
              Find your favorite items from nearby stores
            </Text>

            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentItem}
                    onPress={() => setSearchQuery(search)}
                  >
                    <Ionicons name="time-outline" size={ms(20)} color="#7A7B7B" />
                    <Text style={styles.recentText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : searching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3BB77E" />
            <Text style={styles.searchingText}>Searching...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          // No Results
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={ms(120)} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for a different product
            </Text>
          </View>
        ) : (
          // Search Results
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
            </Text>

            <View style={styles.productGrid}>
              {filteredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  title={item.productName}
                  subtitle={`(${item.storeName})`}
                  weight={`${item.productSize} ${item.unit}`}
                  price={`₱${item.price.toFixed(2)}`}
                  image={{ uri: item.productImage }}
                  variant="grid"
                  onAddPress={() => handleQuickAdd(item)}
                  onPress={() => router.push(`/(main)/shared/product-details?id=${item.id}` as any)}
                  isAdding={addingProductId === item.id}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(8),
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: ms(12),
    paddingHorizontal: s(12),
    height: vs(48),
  },

  searchIcon: {
    width: s(20),
    height: s(20),
    tintColor: '#7A7B7B',
    marginRight: s(8),
  },

  searchInput: {
    flex: 1,
    fontSize: ms(14),
    fontFamily: Fonts.REGULAR,
    color: '#1E1E1E',
    paddingVertical: 0,
  },

  clearButton: {
    width: s(24),
    height: s(24),
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearText: {
    fontSize: ms(18),
    color: '#7A7B7B',
  },

  filterButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: s(8),
  },

  // Content
  content: {
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchingText: {
    marginTop: vs(12),
    fontSize: ms(14),
    fontFamily: Fonts.REGULAR,
    color: '#7A7B7B',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(40),
  },

  emptyTitle: {
    fontSize: ms(18),
    fontFamily: Fonts.SEMIBOLD,
    color: '#1E1E1E',
    marginBottom: vs(8),
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: ms(14),
    fontFamily: Fonts.REGULAR,
    color: '#7A7B7B',
    textAlign: 'center',
    lineHeight: ms(20),
  },

  // Recent Searches
  recentSection: {
    width: '100%',
    marginTop: vs(32),
  },

  recentTitle: {
    fontSize: ms(16),
    fontFamily: Fonts.SEMIBOLD,
    color: '#1E1E1E',
    marginBottom: vs(16),
  },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: s(12),
  },

  recentText: {
    flex: 1,
    fontSize: ms(14),
    fontFamily: Fonts.REGULAR,
    color: '#1E1E1E',
  },

  // Results
  resultsContainer: {
    flex: 1,
    paddingTop: vs(16),
  },

  resultsCount: {
    fontSize: ms(14),
    fontFamily: Fonts.MEDIUM,
    color: '#7A7B7B',
    marginBottom: vs(16),
    marginLeft: s(22),
  },

  // Products Grid - 3 columns like see-more and category-detail
  // Matches see-more.tsx structure
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: s(22), // Exact Figma left/right margins
    columnGap: s(18), // Horizontal gap between products
    rowGap: vs(20), // Vertical gap between rows
    justifyContent: 'flex-start',
    paddingBottom: vs(20),
  },
});
