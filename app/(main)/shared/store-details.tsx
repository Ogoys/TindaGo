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
  Linking,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { s, vs, ms } from '../../../src/constants/responsive';
import { Colors } from '../../../src/constants/Colors';
import { fetchStoreById } from '../../../src/api/stores';
import { fetchProductsByStore } from '../../../src/api/products';
import { ProductCard } from '../../../src/components/ui';
import { useUser } from '../../../src/contexts/UserContext';
import { addToCartWithValidation } from '../../../src/api/cart';
import { getProductImageSource, getStoreLogoSource, getStoreCoverSource } from '../../../src/lib/helpers/imageHelper';

// Firebase Store interface matching actual database structure
interface Store {
  id: string;
  storeName: string;
  ownerName: string;
  logo?: string;               // Legacy base64 field
  logoUrl?: string;            // NEW: Cloudinary URL field
  coverImage?: string;         // Legacy base64 field
  coverImageUrl?: string;      // NEW: Cloudinary URL field
  address?: string;
  city?: string;
  description?: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'suspended';
  location?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

// Firebase Product interface
interface Product {
  id: string;
  productName: string;
  productImage: string; // Legacy base64 field
  productImageUrl?: string; // New Cloudinary URL field
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
  const { id, storeId } = useLocalSearchParams<{ id?: string; storeId?: string }>();
  const { user } = useUser();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Use either id or storeId parameter
  const actualStoreId = id || storeId;

  useEffect(() => {
    const loadStoreData = async () => {
      if (!actualStoreId) {
        Alert.alert('Error', 'Store not found');
        router.back();
        return;
      }

      try {
        setLoading(true);

        // Fetch store details
        const storeData = await fetchStoreById(actualStoreId) as any;
        if (!storeData) {
          Alert.alert('Error', 'Store not found');
          router.back();
          return;
        }
        setStore(storeData as Store);

        // Fetch store products
        const storeProducts = await fetchProductsByStore(actualStoreId) as any[];
        const availableProducts = storeProducts.filter(p => p.status === 'available');
        setProducts(availableProducts as Product[]);

        console.log('🏪 Store loaded:', storeData.storeName);
        console.log('📦 Products loaded:', availableProducts.length);
        console.log('📍 Store location:', storeData.location?.coordinates);
      } catch (error) {
        console.error('Error loading store:', error);
        Alert.alert('Error', 'Failed to load store details');
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, [actualStoreId]);

  // Add to cart handler with validation
  const handleAddToCart = async (product: Product) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to add items to cart');
      router.push('/(auth)/signin');
      return;
    }

    if (product.quantity <= 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock');
      return;
    }

    setAddingProductId(product.id);

    try {
      const result = await addToCartWithValidation(user.id, {
        productId: product.id,
        productName: product.productName,
        productImage: product.productImage,
        productImageUrl: product.productImageUrl,
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

      if (result.needsConfirmation) {
        Alert.alert(
          'Switch store?',
          `Your cart has items from ${result.currentStore?.storeName}. Replace with ${result.newStore?.storeName}?`,
          [
            { text: 'Keep current', style: 'cancel' },
            {
              text: 'Replace cart',
              style: 'destructive',
              onPress: async () => {
                const forced = await addToCartWithValidation(user.id, {
                  productId: product.id,
                  productName: product.productName,
                  productImage: product.productImage,
                  productImageUrl: product.productImageUrl,
                  storeId: product.storeId,
                  storeName: product.storeName,
                  quantity: 1,
                  price: product.price,
                  weight: product.productSize,
                  unit: product.unit,
                  subtotal: product.price,
                  stock: product.quantity,
                  isAvailable: product.quantity > 0,
                }, true);
                if (forced.success) {
                  Alert.alert('Success', `${product.productName} added to cart!`);
                }
              }
            }
          ]
        );
      } else if (result.success) {
        Alert.alert('Success', `${product.productName} added to cart!`);
      } else {
        Alert.alert('Error', 'Failed to add to cart. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setAddingProductId(null);
    }
  };

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
          {getStoreCoverSource(store) ? (
            <Image
              source={getStoreCoverSource(store)!}
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
          {getStoreLogoSource(store) ? (
            <Image
              source={getStoreLogoSource(store)!}
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

          {/* Show exact map pin location if available, otherwise fallback to generic address */}
          {(store.location?.address || store.address) && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍</Text>
              <View style={styles.locationTextContainer}>
                <Text style={styles.infoText}>
                  {store.location?.address || `${store.address}${store.city ? `, ${store.city}` : ''}`}
                </Text>
                {/* Show coordinates if available */}
                {store.location?.coordinates?.latitude && store.location?.coordinates?.longitude && (
                  <Text style={styles.coordinatesText}>
                    {store.location.coordinates.latitude.toFixed(6)}, {store.location.coordinates.longitude.toFixed(6)}
                  </Text>
                )}
              </View>
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
            <Text style={styles.ratingText}>0.0 / 5.0</Text>
            <Text style={styles.reviewCount}>(No reviews yet)</Text>
          </View>
        </View>

        {/* Store Location Map */}
        {store.location?.coordinates?.latitude && store.location?.coordinates?.longitude && (
          <View style={styles.mapSection}>
            <Text style={styles.sectionTitle}>Store Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: store.location.coordinates.latitude,
                  longitude: store.location.coordinates.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: store.location.coordinates.latitude,
                    longitude: store.location.coordinates.longitude,
                  }}
                  title={store.storeName}
                  description={store.location.address || store.address}
                />
              </MapView>
              <TouchableOpacity 
                style={styles.openMapButton}
                onPress={() => {
                  // Navigate to stores-map screen
                  router.push('/(main)/(customer)/stores-map' as any);
                }}
              >
                <Text style={styles.openMapButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
                <ProductCard
                  key={product.id}
                  title={product.productName}
                  subtitle={`${product.productSize} ${product.unit}`}
                  price={`₱${product.price.toFixed(2)}`}
                  image={getProductImageSource(product)}
                  variant="grid"
                  onAddPress={() => handleAddToCart(product)}
                  onPress={() => router.push(`/(main)/shared/product-details?id=${product.id}`)}
                  isAdding={addingProductId === product.id}
                />
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

  locationTextContainer: {
    flex: 1,
  },

  coordinatesText: {
    fontSize: ms(14),
    color: '#999',
    fontFamily: 'monospace',
    marginTop: vs(2),
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

  // Map Section
  mapSection: {
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(10),
  },

  mapContainer: {
    width: '100%',
    height: vs(200),
    borderRadius: s(16),
    overflow: 'hidden',
    backgroundColor: Colors.lightGray,
    position: 'relative',
  },

  map: {
    width: '100%',
    height: '100%',
  },

  openMapButton: {
    position: 'absolute',
    bottom: vs(10),
    right: s(10),
    backgroundColor: Colors.primary,
    paddingHorizontal: s(15),
    paddingVertical: vs(8),
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.3,
    shadowRadius: s(4),
    elevation: 5,
  },

  openMapButtonText: {
    color: Colors.white,
    fontSize: ms(12),
    fontWeight: '600',
  },

  // Products Grid - 3 columns
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: s(10),
  },

  bottomSpacer: {
    height: vs(40),
  },
});
