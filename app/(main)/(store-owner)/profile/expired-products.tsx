/**
 * EXPIRED PRODUCTS MANAGEMENT SCREEN
 * 
 * Dedicated panel for managing expired products
 * Features:
 * - List all expired products
 * - View expiry dates
 * - Take action (dispose, extend, etc.)
 * - Track losses
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
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ref, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

interface ExpiredProduct {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  expiryDate: string;
  productSize: string;
  unit: string;
  status: string;
  productImage?: string;
  productImageUrl?: string;
  daysExpired: number;
  totalValue: number;
}

export default function ExpiredProductsScreen() {
  const [expiredProducts, setExpiredProducts] = useState<ExpiredProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExpiredProducts();
  }, []);

  const fetchExpiredProducts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch all damage records to get product IDs that have been recorded
      const damagesRef = ref(database, 'damages');
      const damagesQuery = query(
        damagesRef,
        orderByChild('storeOwnerId'),
        equalTo(user.uid)
      );
      
      const damagesSnapshot = await get(damagesQuery);
      const damagedProductIds = new Set<string>();
      
      if (damagesSnapshot.exists()) {
        const damages = damagesSnapshot.val();
        Object.values(damages).forEach((damage: any) => {
          if (damage.items && Array.isArray(damage.items)) {
            damage.items.forEach((item: any) => {
              if (item.productId && item.reason === 'expired') {
                damagedProductIds.add(item.productId);
              }
            });
          }
        });
      }

      const productsRef = ref(database, 'products');
      const userProductsQuery = query(
        productsRef,
        orderByChild('storeOwnerId'),
        equalTo(user.uid)
      );

      const snapshot = await get(userProductsQuery);
      if (!snapshot.exists()) {
        setExpiredProducts([]);
        return;
      }

      const products = snapshot.val();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expired: ExpiredProduct[] = [];

      Object.keys(products).forEach(productId => {
        const product = products[productId];
        
        // Skip products that have already been recorded as damaged
        if (damagedProductIds.has(productId)) {
          return;
        }
        
        if (product.expiryDate) {
          const expiryDate = new Date(product.expiryDate);
          if (expiryDate < today) {
            const daysExpired = Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));
            expired.push({
              id: productId,
              ...product,
              daysExpired,
              totalValue: product.price * product.quantity,
            });
          }
        }
      });

      // Sort by days expired (most recently expired first)
      expired.sort((a, b) => a.daysExpired - b.daysExpired);

      setExpiredProducts(expired);
    } catch (error) {
      console.error('Error fetching expired products:', error);
      Alert.alert('Error', 'Failed to load expired products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpiredProducts();
  };

  const handleDisableProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Disable Product?',
      `Mark "${productName}" as out of stock?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(productId);
              await update(ref(database, `products/${productId}`), {
                status: 'out_of_stock',
              });
              Alert.alert('Success', 'Product marked as out of stock');
              fetchExpiredProducts();
            } catch (error) {
              console.error('Error disabling product:', error);
              Alert.alert('Error', 'Failed to disable product');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleRecordDamage = (product: ExpiredProduct) => {
    Alert.alert(
      'Record as Damage?',
      `This will remove ${product.quantity} units from inventory and record as expired loss.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Record Damage',
          style: 'destructive',
          onPress: () => {
            // Navigate to record damage screen with pre-filled data
            router.push({
              pathname: '/(main)/(store-owner)/profile/record-damage',
              params: {
                productId: product.id,
                productName: product.productName,
                quantity: product.quantity.toString(),
                reason: 'expired',
              },
            });
          },
        },
      ]
    );
  };

  const calculateTotalLoss = () => {
    return expiredProducts.reduce((sum, p) => sum + p.totalValue, 0);
  };

  const calculateTotalQuantity = () => {
    return expiredProducts.reduce((sum, p) => sum + p.quantity, 0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Image
            source={require('../../../../src/assets/images/store-owner-profile/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expired Products</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>⚠️ Expiry Summary</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#E92B45' }]}>
                {expiredProducts.length}
              </Text>
              <Text style={styles.statLabel}>Expired Products</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF6B00' }]}>
                {calculateTotalQuantity()}
              </Text>
              <Text style={styles.statLabel}>Total Units</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#E92B45' }]}>
                ₱{calculateTotalLoss().toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Potential Loss</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(main)/(store-owner)/profile/record-damage')}
            >
              <Text style={styles.actionButtonText}>Record Damages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Expired Products List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading expired products...</Text>
          </View>
        ) : expiredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No Expired Products</Text>
            <Text style={styles.emptyText}>
              Great! You don't have any expired products in your inventory.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {expiredProducts.length} Expired Product{expiredProducts.length !== 1 ? 's' : ''}
            </Text>

            {expiredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                {/* Product Info */}
                <View style={styles.productRow}>
                  {/* Image */}
                  <View style={styles.imageContainer}>
                    {getProductImageSource(product) ? (
                      <Image
                        source={getProductImageSource(product)!}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.productImage, styles.placeholderImage]}>
                        <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    )}
                    {/* Expired Badge */}
                    <View style={styles.expiredBadge}>
                      <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.productName}
                    </Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={styles.productSize}>
                      {product.productSize} {product.unit}
                    </Text>
                    
                    {/* Expiry Info */}
                    <View style={styles.expiryRow}>
                      <Text style={styles.expiryLabel}>Expired:</Text>
                      <Text style={styles.expiryDays}>
                        {product.daysExpired} day{product.daysExpired !== 1 ? 's' : ''} ago
                      </Text>
                    </View>
                    <Text style={styles.expiryDate}>
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </Text>

                    {/* Stock & Value */}
                    <View style={styles.stockValueRow}>
                      <View style={styles.stockInfo}>
                        <Text style={styles.stockLabel}>Stock:</Text>
                        <Text style={[styles.stockValue, { color: '#E92B45' }]}>
                          {product.quantity} units
                        </Text>
                      </View>
                      <View style={styles.valueInfo}>
                        <Text style={styles.valueLabel}>Value:</Text>
                        <Text style={[styles.valueAmount, { color: '#E92B45' }]}>
                          ₱{product.totalValue.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    {product.status === 'out_of_stock' && (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>✓ Disabled</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  {product.status === 'available' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.disableBtn]}
                      onPress={() => handleDisableProduct(product.id, product.productName)}
                      disabled={processingId === product.id}
                    >
                      {processingId === product.id ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.actionBtnText}>Disable</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.damageBtn]}
                    onPress={() => handleRecordDamage(product)}
                  >
                    <Text style={styles.actionBtnText}>Record Damage</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(60),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
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
  backIcon: {
    width: s(15),
    height: s(15),
  },
  headerTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
  },
  placeholder: {
    width: s(30),
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    marginHorizontal: s(20),
    marginTop: vs(20),
    padding: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  summaryTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
  },
  refreshText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.primary,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: vs(16),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(24),
    marginBottom: vs(4),
  },
  statLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(11),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: vs(40),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: s(10),
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: s(10),
    paddingVertical: vs(12),
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.white,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: vs(60),
  },
  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    marginTop: vs(16),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: vs(60),
    paddingHorizontal: s(40),
  },
  emptyIcon: {
    fontSize: ms(64),
    marginBottom: vs(16),
  },
  emptyTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },
  emptyText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: vs(20),
  },
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginHorizontal: s(20),
    marginTop: vs(24),
    marginBottom: vs(12),
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    marginHorizontal: s(20),
    marginBottom: vs(16),
    padding: s(16),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: vs(12),
  },
  imageContainer: {
    position: 'relative',
    marginRight: s(12),
  },
  productImage: {
    width: s(80),
    height: s(80),
    borderRadius: s(12),
  },
  placeholderImage: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: Fonts.primary,
    fontSize: ms(10),
    color: Colors.textSecondary,
  },
  expiredBadge: {
    position: 'absolute',
    top: s(4),
    right: s(4),
    backgroundColor: '#E92B45',
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: s(4),
  },
  expiredBadgeText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(8),
    color: Colors.white,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(4),
  },
  productCategory: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(2),
  },
  productSize: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(8),
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(2),
  },
  expiryLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '600',
    color: Colors.darkGray,
    marginRight: s(4),
  },
  expiryDays: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '600',
    color: '#E92B45',
  },
  expiryDate: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    marginBottom: vs(8),
  },
  stockValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.darkGray,
    marginRight: s(4),
  },
  stockValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '600',
  },
  valueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.darkGray,
    marginRight: s(4),
  },
  valueAmount: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: s(6),
    marginTop: vs(8),
  },
  statusText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(11),
    color: Colors.white,
  },
  cardActions: {
    flexDirection: 'row',
    gap: s(8),
  },
  actionBtn: {
    flex: 1,
    paddingVertical: vs(10),
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disableBtn: {
    backgroundColor: '#FF9800',
  },
  damageBtn: {
    backgroundColor: '#E92B45',
  },
  actionBtnText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.white,
  },
  bottomSpacer: {
    height: vs(40),
  },
});
