/**
 * STORES LIST SCREEN
 * 
 * Shows all registered stores in the system with:
 * - Store logo and banner
 * - Store name and rating
 * - Product count
 * - Address and coordinates
 * - Open/Closed status
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { s, vs, ms } from '../../../src/constants/responsive';
import { Colors } from '../../../src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Store {
  id: string;
  storeName: string;
  ownerName: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  city?: string;
  description?: string;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'suspended';
  isOpen?: boolean;
  rating?: number;
  totalReviews?: number;
  location?: {
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

interface Product {
  id: string;
  storeId: string;
  status: string;
}

export default function StoresListScreen() {
  const { excludeStoreId } = useLocalSearchParams<{ excludeStoreId?: string }>();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch stores and products (one-time)
  const loadData = React.useCallback(async (cancelled: { current: boolean }) => {
    try {
      // STORES (single read)
      const storesSnap = await get(ref(database, 'stores'));
      if (!cancelled.current && storesSnap.exists()) {
        const data = storesSnap.val();
        const storesList: Store[] = Object.keys(data)
          .map(key => {
            const storeData = data[key];
            return {
              id: key,
              storeName: storeData.storeName || storeData.businessInfo?.storeName || 'Unnamed Store',
              ownerName: storeData.ownerName || storeData.personalInfo?.name || 'Unknown Owner',
              logo: storeData.logo || storeData.businessInfo?.logo || null,
              coverImage: storeData.coverImage || storeData.businessInfo?.coverImage || null,
              address: storeData.address || storeData.businessInfo?.address || '',
              city: storeData.city || storeData.businessInfo?.city || '',
              description: storeData.description || storeData.businessInfo?.description || '',
              status: storeData.status || 'active',
              isOpen: storeData.isOpen ?? true,
              rating: storeData.rating || 0,
              totalReviews: storeData.totalReviews || 0,
              location: storeData.location || null,
            };
          })
          .filter(store => {
            if (store.status !== 'approved' && store.status !== 'active') return false;
            if (excludeStoreId && store.id === excludeStoreId) return false;
            return true;
          });

        setStores(storesList);
      } else if (!cancelled.current) {
        setStores([]);
      }

      // PRODUCTS (single read)
      const productsSnap = await get(ref(database, 'products'));
      if (!cancelled.current && productsSnap.exists()) {
        const data = productsSnap.val();
        const productsList: Product[] = Object.keys(data)
          .map(key => ({
            id: key,
            storeId: data[key].storeId,
            status: data[key].status,
          }))
          .filter(p => p.status === 'available');

        setProducts(productsList);
      } else if (!cancelled.current) {
        setProducts([]);
      }
    } catch (e) {
      console.error('Error loading stores list:', e);
      if (!cancelled.current) {
        setStores([]);
        setProducts([]);
      }
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, [excludeStoreId]);

  useEffect(() => {
    const cancelled = { current: false };
    loadData(cancelled);
    return () => { cancelled.current = true; };
  }, [loadData]);

  // Pull to refresh - now actually reloads data
  const onRefresh = async () => {
    setRefreshing(true);
    const cancelled = { current: false };
    await loadData(cancelled);
    setRefreshing(false);
  };

  const getProductCount = (storeId: string) => {
    return products.filter(p => p.storeId === storeId).length;
  };

  const handleStorePress = (storeId: string) => {
    router.push(`/(main)/shared/store-details?storeId=${storeId}` as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading stores...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Stores</Text>
        <View style={styles.backButton} />
      </View>

      {/* Store Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{stores.length} stores available</Text>
      </View>

      {/* Stores List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {stores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={80} color="#CCC" />
            <Text style={styles.emptyTitle}>No stores available</Text>
            <Text style={styles.emptyText}>Check back later for new stores</Text>
          </View>
        ) : (
          <View style={styles.storesList}>
            {stores.map((store) => {
              const productCount = getProductCount(store.id);
              
              return (
                <TouchableOpacity
                  key={store.id}
                  style={styles.storeCard}
                  onPress={() => handleStorePress(store.id)}
                  activeOpacity={0.8}
                >
                  {/* Store Banner/Cover */}
                  <View style={styles.storeBanner}>
                    {store.coverImage ? (
                      <Image
                        source={{ uri: store.coverImage }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.bannerPlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#CCC" />
                      </View>
                    )}
                    
                    {/* Store Status Badge */}
                    <View style={[styles.statusBadge, store.isOpen ? styles.openBadge : styles.closedBadge]}>
                      <Text style={styles.statusText}>{store.isOpen ? 'Open' : 'Closed'}</Text>
                    </View>
                  </View>

                  {/* Store Info */}
                  <View style={styles.storeInfo}>
                    {/* Logo and Name */}
                    <View style={styles.storeHeader}>
                      <View style={styles.logoContainer}>
                        {store.logo ? (
                          <Image
                            source={{ uri: store.logo }}
                            style={styles.logoImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.logoPlaceholder}>
                            <Ionicons name="storefront" size={24} color={Colors.primary} />
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.nameContainer}>
                        <Text style={styles.storeName} numberOfLines={1}>{store.storeName}</Text>
                        
                        {/* Rating */}
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={14} color="#FFB800" />
                          <Text style={styles.ratingText}>
                            {store.rating && store.rating > 0 ? store.rating.toFixed(1) : '0.0'}
                          </Text>
                          <Text style={styles.reviewCount}>
                            ({store.totalReviews || 0} {store.totalReviews === 1 ? 'review' : 'reviews'})
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Address */}
                    {(store.location?.address || store.address) && (
                      <View style={styles.addressRow}>
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.addressText} numberOfLines={2}>
                          {store.location?.address || `${store.address}${store.city ? `, ${store.city}` : ''}`}
                        </Text>
                      </View>
                    )}

                    {/* Coordinates */}
                    {store.location?.coordinates && (
                      <View style={styles.coordsRow}>
                        <Ionicons name="navigate-outline" size={14} color="#999" />
                        <Text style={styles.coordsText}>
                          {store.location.coordinates.latitude.toFixed(6)}, {store.location.coordinates.longitude.toFixed(6)}
                        </Text>
                      </View>
                    )}

                    {/* Product Count */}
                    <View style={styles.productCountRow}>
                      <Ionicons name="cube-outline" size={16} color={Colors.primary} />
                      <Text style={styles.productCountText}>
                        {productCount} {productCount === 1 ? 'product' : 'products'} available
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F6',
  },
  loadingText: {
    marginTop: vs(10),
    fontSize: ms(16),
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: s(40),
    height: s(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '600',
    color: '#1E1E1E',
  },
  countContainer: {
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    backgroundColor: '#FFFFFF',
  },
  countText: {
    fontSize: ms(14),
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  storesList: {
    padding: s(15),
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: s(16),
    marginBottom: vs(15),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  storeBanner: {
    width: '100%',
    height: vs(120),
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E9E9E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: vs(10),
    right: s(10),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },
  openBadge: {
    backgroundColor: '#3BB77E',
  },
  closedBadge: {
    backgroundColor: '#E92B45',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: ms(12),
    fontWeight: '600',
  },
  storeInfo: {
    padding: s(15),
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  logoContainer: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    overflow: 'hidden',
    marginRight: s(12),
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: ms(18),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(4),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
  },
  ratingText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#1E1E1E',
  },
  reviewCount: {
    fontSize: ms(12),
    color: '#999',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vs(6),
    paddingLeft: s(2),
  },
  addressText: {
    flex: 1,
    fontSize: ms(14),
    color: '#666',
    marginLeft: s(6),
    lineHeight: ms(18),
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(8),
    paddingLeft: s(2),
  },
  coordsText: {
    fontSize: ms(11),
    color: '#999',
    marginLeft: s(6),
    fontFamily: 'monospace',
  },
  productCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: vs(8),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  productCountText: {
    fontSize: ms(14),
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: s(6),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(100),
    paddingHorizontal: s(40),
  },
  emptyTitle: {
    fontSize: ms(22),
    fontWeight: '600',
    color: '#1E1E1E',
    marginTop: vs(20),
    marginBottom: vs(10),
  },
  emptyText: {
    fontSize: ms(16),
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: vs(20),
  },
});
