import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ref, onValue } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { removeFromCart, updateCartQuantity, cleanupMixedStoreCart } from '../../../src/api/cart';
import { useUser } from '../../../src/contexts/UserContext';
import { Colors } from '../../../src/constants/Colors';
import { Fonts } from '../../../src/constants/Fonts';
import { s, vs } from '../../../src/constants/responsive';
import type { CartItem as CartItemType } from '../../../src/models/Cart';
import { ProductRemovedModal, Toast } from '../../../src/components/ui';
import { getProductImageSource } from '../../../src/lib/helpers/imageHelper';

const CartScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const [notes, setNotes] = useState('');
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  // Product removed modal state
  const [removedProduct, setRemovedProduct] = useState<{
    name: string;
    image?: string;
    reason: 'out_of_stock' | 'deleted';
  } | null>(null);
  const [showRemovedModal, setShowRemovedModal] = useState(false);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Fetch cart items from Firebase with real-time updates
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const cartItemsRef = ref(database, `carts/${user.id}/items`);
    const unsubscribe = onValue(cartItemsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.keys(data).map(productId => ({
          ...data[productId],
          productId,
        })) as CartItemType[];
        setCartItems(items);
      } else {
        setCartItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Automatic mixed-store cart cleanup on mount
  useEffect(() => {
    if (!user || cartItems.length === 0) return;

    const performCleanup = async () => {
      // Check if cart has mixed stores
      const storeIds = [...new Set(cartItems.map(item => item.storeId))];

      if (storeIds.length > 1) {
        console.log('Mixed-store cart detected, performing automatic cleanup...');

        const result = await cleanupMixedStoreCart(user.id);

        if (result.success && result.hadMixedStores && result.keptStore) {
          setToastMessage(
            `Cart cleaned up: Kept ${result.itemsRemoved} item(s) from ${result.keptStore.storeName}. Items from other stores were removed.`
          );
          setToastType('info');
          setShowToast(true);
        }
      }
    };

    performCleanup();
  }, [user, cartItems.length]); // Run when cart items count changes

  // REMOVED: Real-time product monitoring to prevent memory leak
  // Product availability will be checked when user proceeds to checkout

  const removeItem = async (productId: string) => {
    if (!user) return;

    try {
      const success = await removeFromCart(user.id, productId);
      if (!success) {
        setToastMessage('Failed to remove item from cart');
        setToastType('error');
        setShowToast(true);
      } else {
        setToastMessage('Item removed from cart');
        setToastType('success');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setToastMessage('An error occurred while removing the item');
      setToastType('error');
      setShowToast(true);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number, maxStock: number) => {
    if (!user || newQuantity < 1) return;

    if (newQuantity > maxStock) {
      setToastMessage(`Only ${maxStock} items available`);
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setUpdatingItem(productId);
      const success = await updateCartQuantity(user.id, productId, newQuantity);
      if (!success) {
        setToastMessage('Failed to update quantity');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setToastMessage('An error occurred while updating quantity');
      setToastType('error');
      setShowToast(true);
    } finally {
      setUpdatingItem(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = 0; // Will be calculated based on discount type (senior/PWD)
  const grandTotal = subtotal - discount; // No tax added (sari-sari stores include tax in prices)

  const handleProceedToPayment = () => {
    if (!user) {
      setToastMessage('Please sign in to place an order');
      setToastType('info');
      setShowToast(true);
      setTimeout(() => {
        router.push('/(auth)/signin');
      }, 1500);
      return;
    }

    if (cartItems.length === 0) {
      setToastMessage('Please add items to your cart first');
      setToastType('info');
      setShowToast(true);
      return;
    }

    // IMPORTANT: Validate all items are from the same store
    const storeIds = [...new Set(cartItems.map(item => item.storeId))];
    if (storeIds.length > 1) {
      Alert.alert(
        'Mixed Store Items',
        'Your cart contains items from multiple stores. Please remove items to order from only one store at a time.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to payment screen
    router.push('/(main)/(customer)/payment');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Image
              source={require('../../../src/assets/images/product-chart/chevron-left.png')}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Shopping Cart</Text>

          <TouchableOpacity style={styles.notificationButton}>
            <Image
              source={require('../../../src/assets/images/product-chart/notification-icon.png')}
              style={styles.notificationIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Store Info - Display which store items are from */}
        {!loading && cartItems.length > 0 && (
          <View style={styles.storeInfoSection}>
            <View style={styles.storeIconCircle}>
              <Text style={styles.storeIconText}>🏪</Text>
            </View>
            <View style={styles.storeInfoContent}>
              <Text style={styles.storeInfoLabel}>Items from</Text>
              <Text style={styles.storeInfoName}>{cartItems[0].storeName}</Text>
            </View>
          </View>
        )}

        {/* Product Items */}
        <View style={styles.ordersContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading cart...</Text>
            </View>
          ) : cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <TouchableOpacity
                style={styles.shopNowButton}
                onPress={() => router.push('/(main)/(customer)/home')}
              >
                <Text style={styles.shopNowText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cartItems.map((item) => (
              <View key={item.productId} style={styles.orderItem}>
                {/* Clickable Product Section - Image and Info */}
                <TouchableOpacity
                  style={styles.productClickableSection}
                  onPress={() => router.push(`/(main)/shared/product-details?id=${item.productId}` as any)}
                  activeOpacity={0.7}
                >
                  {/* Product Image */}
                  {getProductImageSource(item) ? (
                    <Image
                      source={getProductImageSource(item)!}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.productImagePlaceholder} />
                  )}

                  {/* Product Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={styles.productWeight}>{item.weight} {item.unit}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.productPriceLabel}>₱{item.price.toFixed(2)} each</Text>
                      <Text style={styles.productSubtotal}>₱{item.subtotal.toFixed(2)} total</Text>
                    </View>
                    {/* Stock Availability Display */}
                    <View style={styles.stockInfoRow}>
                      <Text style={[
                        styles.stockInfoText,
                        item.stock === 0 ? styles.outOfStockText :
                        item.stock < 10 ? styles.lowStockText : styles.inStockText
                      ]}>
                        {item.stock === 0 ? '❌ Out of Stock' :
                         item.stock < 10 ? `⚠️ ${item.stock} left in stock` :
                         `✓ ${item.stock} available`}
                      </Text>
                    </View>
                    {/* Max Stock Reached */}
                    {item.quantity >= item.stock && (
                      <Text style={styles.maxStockIndicator}>Max quantity reached</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Quantity Controls */}
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.productId, item.quantity - 1, item.stock)}
                    disabled={updatingItem === item.productId || item.quantity <= 1}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.productId, item.quantity + 1, item.stock)}
                    disabled={updatingItem === item.productId || item.quantity >= item.stock}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(item.productId)}
                >
                  <Image
                    source={require('../../../src/assets/images/product-chart/trash-icon.png')}
                    style={styles.trashIcon}
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesTitle}>Notes</Text>
          </View>
          <View style={styles.notesInputContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Type something you want here..."
              placeholderTextColor={Colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        {/* Discount Section */}
        <View style={styles.discountSection}>
          <Text style={styles.discountText}>Apply Discount</Text>
          <TouchableOpacity>
            <Image
              source={require('../../../src/assets/images/product-chart/chevron-right.png')}
              style={styles.chevronRightIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Bill Section */}
        <View style={styles.billSection}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Sub Total</Text>
            <Text style={styles.billValue}>₱ {subtotal.toFixed(2)}</Text>
          </View>

          {discount > 0 && (
            <>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Discount (20%)</Text>
                <Text style={styles.billValue}>- ₱ {discount.toFixed(2)}</Text>
              </View>

              <Text style={styles.discountNote}>
                Discount depend on what you are{'\n'}senior of pwd.
              </Text>
            </>
          )}

          <View style={styles.dottedLine} />

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₱ {grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Proceed to Payment Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.proceedButton, cartItems.length === 0 && styles.proceedButtonDisabled]}
          onPress={handleProceedToPayment}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.proceedButtonText}>
            {cartItems.length === 0 ? 'Cart is Empty' : 'Proceed to Payment'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product Removed Modal */}
      {removedProduct && (
        <ProductRemovedModal
          visible={showRemovedModal}
          productName={removedProduct.name}
          productImage={removedProduct.image}
          reason={removedProduct.reason}
          onClose={() => {
            setShowRemovedModal(false);
            setRemovedProduct(null);
          }}
        />
      )}

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(20),
  },
  // Header - Figma position: y: 74, height: 40
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    paddingBottom: vs(20),
  },
  // Back button - Figma: x: 20, y: 79, width: 30, height: 30
  backButton: {
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  chevronIcon: {
    width: s(15),
    height: vs(15),
  },
  // Header title - Figma: x: 156, y: 83, width: 129, height: 22
  headerTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: s(22),
  },
  // Notification - Figma: x: 375, y: 74, width: 40, height: 40
  notificationButton: {
    width: s(40),
    height: vs(40),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  notificationIcon: {
    width: s(25),
    height: vs(25),
  },
  // Store Info Section
  storeInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(15),
    paddingVertical: vs(12),
    paddingHorizontal: s(15),
    marginHorizontal: s(20),
    marginBottom: vs(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeIconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  storeIconText: {
    fontSize: s(20),
  },
  storeInfoContent: {
    flex: 1,
  },
  storeInfoLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    lineHeight: s(14),
  },
  storeInfoName: {
    fontFamily: Fonts.primary,
    fontSize: s(15),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
    lineHeight: s(20),
  },
  // Orders container - Figma: x: 20, y: 166, width: 400, height: 480
  ordersContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },
  // Order item - Figma: each item height: 80
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(15),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  // Clickable section containing image and info
  productClickableSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: s(10),
  },
  // Product image - Figma: x: 35, y: 176, width: 60, height: 60
  productImage: {
    width: s(60),
    height: vs(60),
    borderRadius: s(14),
    marginRight: s(15),
  },
  productImagePlaceholder: {
    width: s(60),
    height: vs(60),
    borderRadius: s(14),
    backgroundColor: '#D9D9D9',
    marginRight: s(15),
  },
  // Product info - Figma: x: 105, y: 184, width: 124, height: 44
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingRight: s(5),
  },
  productName: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: s(22),
  },
  productWeight: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    lineHeight: s(18),
    marginBottom: vs(2),
  },
  // Price Container
  priceContainer: {
    marginTop: vs(2),
  },
  // Product price label - Unit price
  productPriceLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    lineHeight: s(16),
  },
  // Product subtotal - Total for quantity
  productSubtotal: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primary, // Green color like ProductCard
    lineHeight: s(20),
  },
  // Low stock warning
  lowStockWarning: {
    fontFamily: Fonts.primary,
    fontSize: s(10),
    fontWeight: Fonts.weights.semiBold,
    color: '#FF9800', // Orange warning color
    marginTop: vs(2),
  },
  // Max stock indicator
  maxStockIndicator: {
    fontFamily: Fonts.primary,
    fontSize: s(10),
    fontWeight: Fonts.weights.medium,
    color: '#E92B45', // Red color
    marginTop: vs(2),
  },
  // Stock Info Row
  stockInfoRow: {
    marginTop: vs(4),
  },
  // Stock Info Text
  stockInfoText: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    fontWeight: Fonts.weights.semiBold,
    lineHeight: s(16),
  },
  // Out of Stock Text (Red)
  outOfStockText: {
    color: '#E92B45',
  },
  // Low Stock Text (Orange)
  lowStockText: {
    color: '#FF9800',
  },
  // In Stock Text (Green)
  inStockText: {
    color: '#2E7D32',
  },
  // Max Order Limit Text
  maxOrderLimitText: {
    fontFamily: Fonts.primary,
    fontSize: s(10),
    fontWeight: Fonts.weights.medium,
    color: '#FF9800', // Orange warning
    marginTop: vs(2),
    fontStyle: 'italic',
  },
  // Delete button - Figma: x: 373, y: 191, width: 30, height: 30
  deleteButton: {
    width: s(30),
    height: vs(30),
    borderRadius: s(5),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  trashIcon: {
    width: s(20),
    height: vs(20),
  },
  // Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: '#02545F',
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    marginRight: s(10),
  },
  quantityButton: {
    width: s(24),
    height: vs(24),
    borderRadius: s(12),
    backgroundColor: Colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.primary,
  },
  quantityText: {
    fontSize: s(14),
    fontWeight: '600',
    color: Colors.darkGray,
    marginHorizontal: s(12),
    minWidth: s(20),
    textAlign: 'center',
  },
  // Loading state
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: vs(60),
  },
  loadingText: {
    marginTop: vs(15),
    fontSize: s(16),
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  // Empty cart
  emptyCartContainer: {
    alignItems: 'center',
    paddingVertical: vs(80),
    paddingHorizontal: s(40),
  },
  emptyCartText: {
    fontSize: s(18),
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: vs(20),
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingHorizontal: s(30),
    paddingVertical: vs(12),
  },
  shopNowText: {
    fontSize: s(16),
    fontWeight: '600',
    color: Colors.white,
  },
  // Notes section - Figma: x: 20, y: 666, width: 400, height: 150
  notesSection: {
    marginHorizontal: s(20),
    marginBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
    borderRadius: s(20),
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  notesHeader: {
    backgroundColor: Colors.white,
    paddingVertical: vs(9),
    paddingHorizontal: s(22),
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
  },
  notesTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.medium,
    color: '#FF8D2F',
    lineHeight: s(22),
  },
  notesInputContainer: {
    paddingHorizontal: s(10),
    paddingVertical: vs(16),
    backgroundColor: Colors.backgroundGray,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#02545F',
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(12),
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    backgroundColor: Colors.backgroundGray,
    minHeight: vs(80),
    textAlignVertical: 'top',
  },
  // Discount section - Figma: x: 20, y: 836, width: 400, height: 80
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(29),
    marginHorizontal: s(20),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  discountText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: '#FF8D2F',
    lineHeight: s(22),
  },
  chevronRightIcon: {
    width: s(15),
    height: vs(15),
  },
  // Bill section - Figma: x: 20, y: 936, width: 400, height: 250
  billSection: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
    marginHorizontal: s(20),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(17),
  },
  billLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: s(17),
  },
  billValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.darkGray,
    lineHeight: s(17),
  },
  discountNote: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    lineHeight: s(15),
    marginBottom: vs(20),
  },
  dottedLine: {
    height: vs(2),
    backgroundColor: Colors.textSecondary,
    marginBottom: vs(20),
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: '#FF8D2F',
    lineHeight: s(17),
  },
  grandTotalValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: '#FF8D2F',
    lineHeight: s(17),
  },
  bottomSpacer: {
    height: vs(100),
  },
  // Proceed button - Figma: x: 20, y: 1226, width: 400, height: 50
  buttonContainer: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
    backgroundColor: Colors.backgroundGray,
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  proceedButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    color: Colors.white,
    lineHeight: s(22),
  },
  proceedButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
    opacity: 0.6,
  },
});

export default CartScreen;