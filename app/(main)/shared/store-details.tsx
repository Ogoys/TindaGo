/**
 * STORE DETAILS SCREEN - View store information
 *
 * Features:
 * - Store logo and cover image
 * - Store name, address, and contact information
 * - Store rating and reviews
 * - Store products list
 * - Operating hours
 * - Store owner information
 */

import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { s, vs, ms } from '../../../src/constants/responsive';
import { Colors } from '../../../src/constants/Colors';
import { fetchStoreById } from '../../../src/api/stores';
import { fetchProductsByStore } from '../../../src/api/products';

// Firebase Store interface matching actual database structure
interface Store {
  id: string;
  storeName: string;
  ownerName: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  city?: string;
  description?: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'suspended';
}

// Firebase Product interface
interface Product {
  id: string;
  productName: string;
  productImage: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  storeId: string;
  storeName: string;
  stock: number;
  productSize: string;
  unit: string;
  rating?: number;
  totalReviews?: number;
  quantity: number;
  storeOwnerId: string;
  createdAt: string;
  updatedAt: string;
  status: 'available' | 'out_of_stock';
}

export default function StoreDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoreData = async () => {
      if (!id) {
        Alert.alert('Error', 'Store not found');
        router.back();
        return;
      }

      try {
        setLoading(true);

        // Fetch store details
        const storeData = await fetchStoreById(id) as any;
        if (!storeData) {
          Alert.alert('Error', 'Store not found');
          router.back();
          return;
        }
        setStore(storeData as Store);

        // Fetch store products
        const storeProducts = await fetchProductsByStore(id) as any[];
        const availableProducts = storeProducts.filter(p => p.status === 'available');
        setProducts(availableProducts as Product[]);

        console.log('🏪 Store loaded:', storeData.storeName);
        console.log('📦 Products loaded:', availableProducts.length);
      } catch (error) {
        console.error('Error loading store:', error);
        Alert.alert('Error', 'Failed to load store details');
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading store details...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <Text style={styles.errorText}>Store not found</Text>
        <TouchableOpacity style={styles.backToHomeButton} onPress={() => router.back()}>
          <Text style={styles.backToHomeText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image
            source={require('../../../src/assets/images/product-details/back-button.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Store Cover Image */}
        <View style={styles.coverImageContainer}>
          {store.coverImage ? (
            <Image
              source={{ uri: store.coverImage }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../../../src/assets/images/customer-home/stores/store-background.png')}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Store Logo */}
        <View style={styles.logoContainer}>
          {store.logo ? (
            <Image
              source={{ uri: store.logo }}
              style={styles.storeLogo}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../../../src/assets/images/stores/store-profile-placeholder.png')}
              style={styles.storeLogo}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Store Information */}
        <View style={styles.storeInfoContainer}>
          <Text style={styles.storeName}>{store.storeName}</Text>

          {store.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍</Text>
              <Text style={styles.infoText}>{store.address}{store.city ? `, ${store.city}` : ''}</Text>
            </View>
          )}

          {store.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱</Text>
              <Text style={styles.infoText}>{store.phone}</Text>
            </View>
          )}

          {store.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>✉️</Text>
              <Text style={styles.infoText}>{store.email}</Text>
            </View>
          )}

          {store.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>About</Text>
              <Text style={styles.descriptionText}>{store.description}</Text>
            </View>
          )}

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Image
              source={require('../../../src/assets/images/product-details/star-icon.png')}
              style={styles.starIcon}
            />
            <Text style={styles.ratingText}>5.0 / 5.0</Text>
            <Text style={styles.reviewCount}>(0 Reviews)</Text>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Available Products ({products.length})</Text>

          {products.length === 0 ? (
            <View style={styles.noProductsContainer}>
              <Text style={styles.noProductsText}>No products available</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => router.push(`/(main)/shared/product-details?id=${product.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.productImageContainer}>
                    <Image
                      source={{ uri: product.productImage }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{product.productName}</Text>
                    <Text style={styles.productSize}>{product.productSize} {product.unit}</Text>
                    <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#F4F6F6',
  },

  scrollContainer: {
    flex: 1,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F6F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: vs(20),
    fontSize: ms(16),
    color: Colors.darkGray,
  },

  // Error state
  errorContainer: {
    flex: 1,
    backgroundColor: '#F4F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(40),
  },

  errorText: {
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(20),
  },

  backToHomeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: s(30),
    paddingVertical: vs(12),
    borderRadius: s(20),
  },

  backToHomeText: {
    color: Colors.white,
    fontSize: ms(16),
    fontWeight: '500',
  },

  // Header
  header: {
    height: vs(100),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(50),
    backgroundColor: 'rgba(244, 246, 246, 0.95)',
    zIndex: 10,
  },

  backButton: {
    width: s(30),
    height: s(30),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 5,
  },

  backIcon: {
    width: s(15),
    height: s(15),
  },

  headerTitle: {
    fontSize: ms(20),
    fontWeight: '600',
    color: Colors.darkGray,
    textAlign: 'center',
  },

  headerSpacer: {
    width: s(30),
  },

  // Cover Image
  coverImageContainer: {
    width: '100%',
    height: vs(200),
    backgroundColor: Colors.lightGreen,
  },

  coverImage: {
    width: '100%',
    height: '100%',
  },

  // Store Logo
  logoContainer: {
    position: 'absolute',
    top: vs(150),
    left: s(20),
    width: s(100),
    height: s(100),
    borderRadius: s(50),
    backgroundColor: Colors.white,
    borderWidth: 4,
    borderColor: Colors.white,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
    elevation: 8,
    zIndex: 5,
  },

  storeLogo: {
    width: '100%',
    height: '100%',
  },

  // Store Information
  storeInfoContainer: {
    paddingHorizontal: s(20),
    paddingTop: vs(60),
    paddingBottom: vs(20),
  },

  storeName: {
    fontSize: ms(28),
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: vs(15),
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },

  infoLabel: {
    fontSize: ms(16),
    marginRight: s(10),
  },

  infoText: {
    fontSize: ms(16),
    color: Colors.darkGray,
    flex: 1,
  },

  descriptionSection: {
    marginTop: vs(15),
    marginBottom: vs(10),
  },

  descriptionTitle: {
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  descriptionText: {
    fontSize: ms(15),
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: vs(22),
  },

  // Rating Section
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(15),
  },

  starIcon: {
    width: s(20),
    height: s(20),
    marginRight: s(5),
  },

  ratingText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.darkGray,
    marginRight: s(5),
  },

  reviewCount: {
    fontSize: ms(14),
    color: 'rgba(0, 0, 0, 0.5)',
  },

  // Products Section
  productsSection: {
    paddingHorizontal: s(20),
    paddingTop: vs(20),
  },

  sectionTitle: {
    fontSize: ms(22),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(15),
  },

  noProductsContainer: {
    alignItems: 'center',
    paddingVertical: vs(40),
  },

  noProductsText: {
    fontSize: ms(16),
    color: 'rgba(0, 0, 0, 0.5)',
  },

  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(15),
  },

  productCard: {
    width: s(185),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(12),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(8),
    elevation: 8,
    marginBottom: vs(15),
  },

  productImageContainer: {
    width: '100%',
    height: vs(120),
    backgroundColor: '#E9E9E9',
    borderRadius: s(12),
    marginBottom: vs(10),
    justifyContent: 'center',
    alignItems: 'center',
  },

  productImage: {
    width: '90%',
    height: '90%',
  },

  productInfo: {
    marginBottom: vs(8),
  },

  productName: {
    fontSize: ms(14),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(4),
    lineHeight: ms(14) * 1.3,
  },

  productSize: {
    fontSize: ms(12),
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: vs(4),
  },

  productPrice: {
    fontSize: ms(16),
    fontWeight: '700',
    color: Colors.primary,
  },

  addButton: {
    backgroundColor: '#EBF3DA',
    borderRadius: s(8),
    height: vs(32),
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButtonText: {
    fontSize: ms(20),
    fontWeight: '600',
    color: Colors.primary,
  },

  bottomSpacer: {
    height: vs(40),
  },
});
