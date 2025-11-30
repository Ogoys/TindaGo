/**
 * RECORD PURCHASE ORDER SCREEN
 * 
 * Allows store owners to record inventory purchases
 * Tracks costs and automatically updates inventory when marked as received
 * 
 * Features:
 * - Product selection from catalog
 * - Cost per unit tracking
 * - Quantity input
 * - Purchase date selection
 * - Automatic PO number generation
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
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, onValue, query, orderByChild, equalTo, get } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
// Navigation to payment screen will handle purchase order creation
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';
import { PurchaseOrderItem } from '../../../../src/models/PurchaseOrder';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

interface Product {
  id: string;
  productName: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  productSize: string;
  unit: string;
  productImage?: string;       // Legacy base64
  productImageUrl?: string;    // New Cloudinary URL
  status: 'available' | 'out_of_stock';
  // For modal selection
  selected?: boolean;
  purchaseQuantity?: number;
  costPerUnit?: number;
  subtotal?: number;
}

interface SelectedProduct extends Product {
  purchaseQuantity: number;
  costPerUnit: number;
  subtotal: number;
}

const RecordPurchaseOrderScreen = () => {
  console.log('[Record PO Component] ✅ Component loaded with fixed handleRecordPurchase function');

  const params = useLocalSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('My Store');

  // Purchase order details
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = modalProducts.filter(p => 
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalSelectedCount = modalProducts.filter(p => p.selected).length;

  const totalCost = selectedProducts.reduce((sum, p) => sum + p.subtotal, 0);

  useEffect(() => {
    fetchProducts();
    fetchStoreInfo();
    loadCartFromStorage();
  }, []);

  // Save cart to AsyncStorage whenever selectedProducts or notes changes
  useEffect(() => {
    if (selectedProducts.length > 0) {
      saveCartToStorage();
    }
  }, [selectedProducts, notes]);

  const saveCartToStorage = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const cartData = {
        selectedProducts,
        purchaseDate,
        notes,
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        `purchase_order_cart_${currentUser.uid}`,
        JSON.stringify(cartData)
      );
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const loadCartFromStorage = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const cartDataString = await AsyncStorage.getItem(
        `purchase_order_cart_${currentUser.uid}`
      );

      if (cartDataString) {
        const cartData = JSON.parse(cartDataString);

        // Check if cart is not too old (24 hours)
        const cartAge = new Date().getTime() - new Date(cartData.timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (cartAge < maxAge) {
          setSelectedProducts(cartData.selectedProducts || []);
          setPurchaseDate(cartData.purchaseDate || new Date().toISOString().split('T')[0]);
          setNotes(cartData.notes || '');

          // Show notification that cart was restored
          if (cartData.selectedProducts && cartData.selectedProducts.length > 0) {
            Alert.alert(
              'Cart Restored',
              `Your previous order with ${cartData.selectedProducts.length} item(s) has been restored.`,
              [{ text: 'OK' }]
            );
          }
        } else {
          // Cart is too old, clear it
          await clearCartFromStorage();
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const clearCartFromStorage = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await AsyncStorage.removeItem(`purchase_order_cart_${currentUser.uid}`);
    } catch (error) {
      console.error('Error clearing cart from storage:', error);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const storeRef = ref(database, `stores/${currentUser.uid}`);
      const storeSnapshot = await get(storeRef);

      if (storeSnapshot.exists()) {
        const storeData = storeSnapshot.val();
        setStoreName(storeData.storeName || storeData.businessInfo?.storeName || 'My Store');
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

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
          status: data[key].status || 'available',
          selected: false,
          purchaseQuantity: 0,
          costPerUnit: 0,
          subtotal: 0,
        }));
        setProducts(productsList);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  };

  const handleBack = () => {
    // Products are now persisted to storage, so we can navigate back freely
    router.back();
  };

  const handleOpenModal = () => {
    // Initialize modal products with current state
    const modalProductsList = products.map(p => {
      const alreadySelected = selectedProducts.find(sp => sp.id === p.id);
      if (alreadySelected) {
        return {
          ...p,
          selected: true,
          purchaseQuantity: alreadySelected.purchaseQuantity,
          costPerUnit: alreadySelected.costPerUnit,
          subtotal: alreadySelected.subtotal,
        };
      }
      return {
        ...p,
        selected: false,
        purchaseQuantity: 0,
        costPerUnit: Math.round(p.price * 0.8), // Default cost
        subtotal: 0,
      };
    });
    setModalProducts(modalProductsList);
    setShowProductSelector(true);
  };

  const toggleProductSelection = (productId: string) => {
    setModalProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newSelected = !p.selected;
        return {
          ...p,
          selected: newSelected,
        };
      }
      return p;
    }));
  };

  const handleAddSelectedProducts = () => {
    const selected = modalProducts.filter(p => p.selected);
    
    if (selected.length === 0) {
      Alert.alert('No Products Selected', 'Please select at least one product.');
      return;
    }

    // Add selected products with default values
    const newSelectedProducts: SelectedProduct[] = selected.map(p => {
      const defaultCost = Math.round(p.price * 0.8);
      return {
        ...p,
        purchaseQuantity: 1,
        costPerUnit: defaultCost,
        subtotal: defaultCost,
      };
    });

    setSelectedProducts(newSelectedProducts);
    setShowProductSelector(false);
    setSearchQuery('');
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 0;
    
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          purchaseQuantity: quantity,
          subtotal: quantity * p.costPerUnit,
        };
      }
      return p;
    }));
  };

  const handleCostChange = (productId: string, newCost: string) => {
    const cost = parseFloat(newCost) || 0;
    
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          costPerUnit: cost,
          subtotal: p.purchaseQuantity * cost,
        };
      }
      return p;
    }));
  };

  const handleIncrementQuantity = (productId: string) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        const newQuantity = p.purchaseQuantity + 1;
        return {
          ...p,
          purchaseQuantity: newQuantity,
          subtotal: newQuantity * p.costPerUnit,
        };
      }
      return p;
    }));
  };

  const handleDecrementQuantity = (productId: string) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId && p.purchaseQuantity > 1) {
        const newQuantity = p.purchaseQuantity - 1;
        return {
          ...p,
          purchaseQuantity: newQuantity,
          subtotal: newQuantity * p.costPerUnit,
        };
      }
      return p;
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items and start fresh?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cart',
          style: 'destructive',
          onPress: () => {
            setSelectedProducts([]);
            setPurchaseDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            clearCartFromStorage();
            Alert.alert('Cart Cleared', 'All items have been removed.');
          },
        },
      ]
    );
  };

  const handleRecordPurchase = async () => {
    try {
      console.log('[Record PO] ========== FUNCTION CALLED ==========');
      console.log('[Record PO] Selected products:', selectedProducts.length);

      if (selectedProducts.length === 0) {
        Alert.alert('No Products', 'Please add at least one product to the purchase order.');
        return;
      }

      // Validate costs
      const hasInvalidCost = selectedProducts.some(p => p.costPerUnit <= 0);
      if (hasInvalidCost) {
        Alert.alert('Invalid Cost', 'Please enter valid cost per unit for all products.');
        return;
      }

      console.log('[Record PO] Validation passed, preparing items...');

      // Prepare items for navigation to payment screen
      const items: PurchaseOrderItem[] = selectedProducts.map(p => ({
        productId: p.id,
        productName: p.productName,
        productImage: p.productImage,
        productImageUrl: p.productImageUrl,
        quantity: p.purchaseQuantity,
        costPerUnit: p.costPerUnit,
        subtotal: p.subtotal,
        productSize: p.productSize,
        unit: p.unit,
      }));

      // ✅ DEBUG: Log items before navigation
      console.log('[Record PO] === DEBUG: Proceed to Payment ===');
      console.log('[Record PO] Selected products count:', selectedProducts.length);
      console.log('[Record PO] Prepared items:', JSON.stringify(items, null, 2));
      console.log('[Record PO] Do all items have productId?', items.every(item => item.productId));

      // ✅ FIX: Save to AsyncStorage instead of URL params (URL params can strip fields)
      const orderDataForPayment = {
        purchaseDate,
        items,
        notes: notes.trim(),
      };

      // Save order data to AsyncStorage
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      console.log('[Record PO] Saving to AsyncStorage...');
      const storageKey = `purchase_order_payment_${currentUser.uid}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(orderDataForPayment));

      // ✅ VERIFY: Confirm data was saved
      const verifyData = await AsyncStorage.getItem(storageKey);
      console.log('[Record PO] Data saved to AsyncStorage:', !!verifyData);
      console.log('[Record PO] Storage key:', storageKey);

      // Clear cart from storage since user is proceeding to payment
      clearCartFromStorage();

      console.log('[Record PO] Navigating to payment screen...');
      // Navigate to payment screen (data loaded from AsyncStorage there)
      router.push('/(main)/(store-owner)/suppliers/purchase-payment' as any);
      console.log('[Record PO] Navigation called');
  } catch (error) {
    console.error('[Record PO] ❌ ERROR in handleRecordPurchase:', error);
    console.error('[Record PO] Error stack:', error instanceof Error ? error.stack : 'No stack');
    Alert.alert('Error', 'Failed to proceed to payment. Please try again.');
  }
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <ProfileScreenHeader title="Record Purchase Order" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Add Products Button */}
        <TouchableOpacity
          style={styles.addProductCard}
          onPress={handleOpenModal}
          activeOpacity={0.7}
        >
          <View style={styles.addProductLeft}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../src/assets/images/store-product/add-new-icon.png')}
                style={styles.addIcon}
              />
            </View>
            <Text style={styles.addProductText}>Add Product to Purchase Order</Text>
          </View>
          <Image
            source={require('../../../../src/assets/images/store-product/forward-arrow.png')}
            style={styles.forwardArrow}
          />
        </TouchableOpacity>

        {/* Selected Products Section - Vertical Stack */}
        <View style={styles.productsSectionHeader}>
          <Text style={styles.sectionLabel}>Products to Purchase</Text>
          <Text style={styles.productCount}>
            {selectedProducts.length} {selectedProducts.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {selectedProducts.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={handleOpenModal}
            activeOpacity={0.7}
          >
            <View style={styles.emptyAddIconCircle}>
              <Text style={styles.emptyAddIcon}>+</Text>
            </View>
            <Text style={styles.emptyAddTitle}>Add Purchase Product</Text>
            <Text style={styles.emptyAddSubtitle}>
              Tap here to select products from your catalog
            </Text>
          </TouchableOpacity>
        ) : (
          selectedProducts.map((product, index) => (
                <View key={product.id} style={styles.detailProductCard}>
                  {/* Card Header */}
                  <View style={styles.detailCardHeader}>
                    <View style={styles.detailIndexBadge}>
                      <Text style={styles.detailIndexText}>#{index + 1}</Text>
                    </View>
                    <Text style={styles.detailCardTitle}>Product Details</Text>
                    <TouchableOpacity
                      style={styles.detailRemoveButton}
                      onPress={() => handleRemoveProduct(product.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailRemoveIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Horizontal Scroll Sections - Same as order-supplies.tsx */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    pagingEnabled={false}
                    contentContainerStyle={styles.detailSectionsContent}
                    style={styles.detailSections}
                  >
                    {/* SECTION 1: Basic Info */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Basic Info</Text>
                      
                      {/* Product Image */}
                      <View style={styles.detailImageContainer}>
                        {getProductImageSource(product) ? (
                          <Image 
                            source={getProductImageSource(product)!} 
                            style={styles.detailProductImage} 
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.detailImagePlaceholder}>
                            <Text style={styles.detailImagePlaceholderIcon}>📦</Text>
                          </View>
                        )}
                      </View>

                      {/* Product Name */}
                      <Text style={styles.detailFieldLabel}>Product Name</Text>
                      <View style={styles.detailTextDisplay}>
                        <Text style={styles.detailTextValue} numberOfLines={2}>
                          {product.productName}
                        </Text>
                      </View>

                      {/* Description */}
                      <Text style={styles.detailFieldLabel}>Description</Text>
                      <View style={[styles.detailTextDisplay, styles.detailDescriptionDisplay]}>
                        <Text style={styles.detailTextValue} numberOfLines={3}>
                          {product.description || 'No description'}
                        </Text>
                      </View>
                    </View>

                    {/* SECTION 2: Pricing & Stock */}
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Pricing & Stock</Text>

                      {/* Category */}
                      <Text style={styles.detailFieldLabel}>Category</Text>
                      <View style={styles.detailCategoryDisplay}>
                        <Text style={styles.detailCategoryText}>
                          {product.category || 'Uncategorized'}
                        </Text>
                      </View>

                      {/* Selling Price */}
                      <Text style={styles.detailFieldLabel}>Selling Price</Text>
                      <View style={styles.detailPriceDisplay}>
                        <Text style={styles.detailPesoCurrency}>₱</Text>
                        <Text style={styles.detailPriceValue}>{product.price.toFixed(2)}</Text>
                      </View>

                      {/* Current Stock */}
                      <Text style={styles.detailFieldLabel}>Current Stock</Text>
                      <View style={styles.detailStockDisplayReadonly}>
                        <Text style={styles.detailStockValue}>{product.quantity}</Text>
                        <View style={[
                          styles.detailStockBadge,
                          product.quantity === 0 && styles.detailStockBadgeEmpty
                        ]}>
                          <Text style={[
                            styles.detailStockBadgeText,
                            product.quantity === 0 && styles.detailStockBadgeTextEmpty
                          ]}>
                            {product.quantity === 0 ? 'Out of Stock' : 'In Stock'}
                          </Text>
                        </View>
                      </View>

                      {/* Cost Input */}
                      <Text style={styles.detailFieldLabel}>Cost per unit</Text>
                      <View style={styles.detailCostInputContainer}>
                        <Text style={styles.detailPesoCurrency}>₱</Text>
                        <TextInput
                          style={styles.detailCostInput}
                          value={product.costPerUnit.toString()}
                          onChangeText={(text) => handleCostChange(product.id, text)}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                        />
                      </View>

                      {/* Quantity Controls */}
                      <Text style={styles.detailFieldLabel}>Quantity to Order</Text>
                      <View style={styles.detailQuantityControls}>
                        <TouchableOpacity
                          style={styles.detailQtyButton}
                          onPress={() => handleDecrementQuantity(product.id)}
                          disabled={product.purchaseQuantity <= 1}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.detailQtyButtonText}>−</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.detailQtyInput}
                          value={product.purchaseQuantity.toString()}
                          onChangeText={(text) => handleQuantityChange(product.id, text)}
                          keyboardType="number-pad"
                          textAlign="center"
                        />
                        <TouchableOpacity
                          style={styles.detailQtyButton}
                          onPress={() => handleIncrementQuantity(product.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.detailQtyButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Subtotal Footer */}
                      <View style={styles.detailSubtotalFooter}>
                        <Text style={styles.detailSubtotalLabel}>Subtotal</Text>
                        <Text style={styles.detailSubtotalValue}>₱{product.subtotal.toFixed(2)}</Text>
                      </View>
                    </View>
                  </ScrollView>
                </View>
              ))
        )}

        {/* Add More Products Button - Below cards */}
        {selectedProducts.length > 0 && (
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={handleOpenModal}
            activeOpacity={0.7}
          >
            <View style={styles.addMoreIconCircle}>
              <Text style={styles.addMoreIcon}>+</Text>
            </View>
            <Text style={styles.addMoreText}>Add More Products</Text>
          </TouchableOpacity>
        )}

        {/* Notes Section */}
        {selectedProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g., Special discount received, urgent restock..."
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </>
        )}

        {/* Total Section */}
        {selectedProducts.length > 0 && (
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Cost</Text>
            <Text style={styles.totalAmount}>₱{totalCost.toFixed(2)}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {selectedProducts.length > 0 && (
          <TouchableOpacity
            style={styles.clearCartButton}
            onPress={handleClearCart}
            activeOpacity={0.7}
          >
            <Text style={styles.clearCartButtonText}>Clear Cart</Text>
          </TouchableOpacity>
        )}

        {/* Place Order Button - Navigates to Payment Screen */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            selectedProducts.length === 0 && styles.recordButtonDisabled
          ]}
          onPress={handleRecordPurchase}
          activeOpacity={0.7}
          disabled={selectedProducts.length === 0}
        >
          <Text style={styles.recordButtonText}>Place Order</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Product Selector Modal */}
      <Modal
        visible={showProductSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Products</Text>
              <TouchableOpacity
                onPress={() => setShowProductSelector(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {modalSelectedCount > 0 && (
              <View style={styles.modalSelectedBadge}>
                <Text style={styles.modalSelectedText}>{modalSelectedCount} selected</Text>
              </View>
            )}

            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView style={styles.productsListScroll}>
              {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
              ) : filteredProducts.length === 0 ? (
                <Text style={styles.noProductsText}>No products found</Text>
              ) : (
                filteredProducts.map((product) => (
                  <View key={product.id} style={styles.modalProductCard}>
                    {/* Product Header with Checkbox */}
                    <TouchableOpacity
                      style={styles.modalProductHeader}
                      onPress={() => toggleProductSelection(product.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.modalCheckbox,
                        product.selected && styles.modalCheckboxSelected
                      ]}>
                        {product.selected && <Text style={styles.modalCheckmark}>✓</Text>}
                      </View>

                      {getProductImageSource(product) ? (
                        <Image source={getProductImageSource(product)!} style={styles.modalProductImage} />
                      ) : (
                        <View style={[styles.modalProductImage, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ fontSize: 10, color: '#999' }}>No Image</Text>
                        </View>
                      )}

                      <View style={styles.modalProductInfo}>
                        <Text style={styles.modalProductName} numberOfLines={1}>
                          {product.productName}
                        </Text>
                        <Text style={styles.modalProductSize}>
                          {product.productSize} {product.unit}
                        </Text>
                        <Text style={styles.modalProductPrice}>₱{product.price.toFixed(2)} • Stock: {product.quantity}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Add Selected Button */}
            {modalSelectedCount > 0 && (
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddSelectedProducts}
                activeOpacity={0.7}
              >
                <Text style={styles.modalAddButtonText}>Add Selected ({modalSelectedCount})</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(12),
    marginTop: vs(10),
  },

  sectionLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginBottom: vs(12),
  },

  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  inputLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    marginBottom: vs(6),
    fontWeight: '500',
  },

  textInput: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: s(10),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
  },

  addProductCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingVertical: vs(15),
    paddingHorizontal: s(15),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  addProductLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(15),
  },

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

  addProductText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
  },

  forwardArrow: {
    width: s(30),
    height: s(30),
  },

  // Products Section
  productsSection: {
    marginBottom: vs(15),
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
  },
  productCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  // Empty State
  emptyAddButton: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingVertical: vs(40),
    paddingHorizontal: s(30),
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyAddIconCircle: {
    width: s(70),
    height: s(70),
    borderRadius: s(35),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(16),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyAddIcon: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(36),
    color: Colors.white,
  },
  emptyAddTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },
  emptyAddSubtitle: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: vs(20),
  },

  // Detailed Product Card - Vertical stacking
  detailProductCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
    marginBottom: vs(15),
  },

  // Card Header
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    backgroundColor: 'rgba(2, 84, 95, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(2, 84, 95, 0.1)',
  },
  detailIndexBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(10),
  },
  detailIndexText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(12),
    color: Colors.white,
  },
  detailCardTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
  },
  detailRemoveButton: {
    width: s(26),
    height: s(26),
    borderRadius: s(13),
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRemoveIcon: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#FF5252',
  },

  // Sections Scroll
  detailSections: {
    width: '100%',
  },
  detailSectionsContent: {
    paddingHorizontal: s(5),
  },

  // Detail Section (Basic Info & Pricing/Stock)
  detailSection: {
    width: s(350),
    paddingHorizontal: s(15),
    paddingVertical: vs(15),
  },

  detailSectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.primary,
    marginBottom: vs(12),
    textAlign: 'center',
  },

  // Image Container
  detailImageContainer: {
    width: '100%',
    height: vs(140),
    borderRadius: s(12),
    overflow: 'hidden',
    marginBottom: vs(12),
    backgroundColor: '#F8F9FA',
  },

  detailProductImage: {
    width: '100%',
    height: '100%',
  },

  detailImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },

  detailImagePlaceholderIcon: {
    fontSize: ms(40),
  },

  // Field Label
  detailFieldLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(6),
    marginTop: vs(2),
  },

  // Text Display Fields
  detailTextDisplay: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: s(10),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },

  detailDescriptionDisplay: {
    minHeight: vs(60),
  },

  detailTextValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    lineHeight: vs(18),
  },

  // Category Display
  detailCategoryDisplay: {
    backgroundColor: 'rgba(2, 84, 95, 0.08)',
    borderRadius: s(10),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  detailCategoryText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.primary,
    textAlign: 'center',
  },

  // Price Display
  detailPriceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 183, 126, 0.08)',
    borderRadius: s(10),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    marginBottom: vs(10),
    borderWidth: 1.5,
    borderColor: '#3BB77E',
  },

  detailPesoCurrency: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: '#3BB77E',
    marginRight: s(4),
  },

  detailPriceValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: '#3BB77E',
  },

  // Stock Display (Read-only)
  detailStockDisplayReadonly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: s(10),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },

  detailStockValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(24),
    color: Colors.darkGray,
  },

  detailStockBadge: {
    backgroundColor: '#3BB77E',
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(8),
  },

  detailStockBadgeEmpty: {
    backgroundColor: '#E92B45',
  },

  detailStockBadgeText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(11),
    color: Colors.white,
  },

  detailStockBadgeTextEmpty: {
    color: Colors.white,
  },

  // Cost Input Container
  detailCostInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#02545F',
    borderRadius: s(10),
    backgroundColor: Colors.white,
    overflow: 'hidden',
    marginBottom: vs(10),
  },

  detailCostInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    paddingVertical: vs(10),
    paddingRight: s(12),
    textAlign: 'center',
  },

  // Quantity Controls
  detailQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#02545F',
    borderRadius: s(10),
    overflow: 'hidden',
    marginBottom: vs(10),
  },

  detailQtyButton: {
    width: s(50),
    height: vs(45),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 84, 95, 0.1)',
  },

  detailQtyButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: '#02545F',
  },

  detailQtyInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    textAlign: 'center',
    paddingVertical: vs(10),
  },

  // Subtotal Footer
  detailSubtotalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: vs(12),
    marginTop: vs(10),
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },

  detailSubtotalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(13),
    color: Colors.textSecondary,
  },

  detailSubtotalValue: {
    fontFamily: Fonts.primary,
    fontWeight: '800',
    fontSize: ms(18),
    color: Colors.primary,
  },

  // Add More Button (Below cards)
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingVertical: vs(15),
    paddingHorizontal: s(20),
    marginHorizontal: s(20),
    marginBottom: vs(15),
    borderWidth: 2.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },

  addMoreIconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  addMoreIcon: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(24),
    color: Colors.white,
  },

  addMoreText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.primary,
  },

  notesInput: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(15),
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    minHeight: vs(80),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },

  totalSection: {
    backgroundColor: Colors.primary,
    borderRadius: s(16),
    paddingVertical: vs(20),
    paddingHorizontal: s(20),
    marginTop: vs(10),
    marginBottom: vs(20),
    alignItems: 'center',
  },

  totalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(16),
    color: Colors.white,
    marginBottom: vs(8),
  },

  totalAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(32),
    color: Colors.white,
  },

  clearCartButton: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    borderWidth: 2,
    borderColor: '#FF5252',
    paddingVertical: vs(15),
    alignItems: 'center',
    marginBottom: vs(15),
  },

  clearCartButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#FF5252',
  },

  recordButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(16),
    paddingVertical: vs(18),
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  recordButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
  },

  recordButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.white,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  productSelectorModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: s(25),
    borderTopRightRadius: s(25),
    paddingTop: vs(20),
    paddingHorizontal: s(20),
    paddingBottom: vs(30),
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
  },

  closeButton: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: ms(20),
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  searchInput: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(15),
    marginBottom: vs(15),
  },

  productsListScroll: {
    maxHeight: vs(400),
  },

  noProductsText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: vs(40),
  },

  // Simple Product Selector Modal List
  productSelectorItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: s(12),
    padding: s(12),
    marginBottom: vs(10),
    alignItems: 'center',
  },

  selectorProductImage: {
    width: s(60),
    height: s(60),
    borderRadius: s(10),
  },

  selectorProductInfo: {
    flex: 1,
    marginLeft: s(12),
  },

  selectorProductName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
    marginBottom: vs(3),
  },

  selectorProductSize: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(3),
  },

  selectorProductPrice: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.primary,
  },

  selectorProductStock: {
    backgroundColor: Colors.primary,
    paddingHorizontal: s(10),
    paddingVertical: vs(6),
    borderRadius: s(8),
  },

  stockText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: Colors.white,
  },

  // Modal with checkbox selection
  modalSelectedBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: vs(8),
    paddingHorizontal: s(15),
    borderRadius: s(20),
    alignSelf: 'center',
    marginBottom: vs(10),
  },

  modalSelectedText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.white,
  },

  modalProductCard: {
    backgroundColor: Colors.white,
    borderRadius: s(12),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },

  modalProductHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(12),
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },

  modalCheckbox: {
    width: s(24),
    height: s(24),
    borderRadius: s(6),
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },

  modalCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  modalCheckmark: {
    fontSize: ms(16),
    fontWeight: '700',
    color: Colors.white,
  },

  modalProductImage: {
    width: s(50),
    height: s(50),
    borderRadius: s(8),
    marginRight: s(12),
  },

  modalProductInfo: {
    flex: 1,
  },

  modalProductName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(3),
  },

  modalProductSize: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    marginBottom: vs(2),
  },

  modalProductPrice: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  modalProductInputs: {
    padding: s(12),
    backgroundColor: 'rgba(2, 84, 95, 0.02)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },

  modalInputGroup: {
    marginBottom: vs(10),
  },

  modalInputLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: vs(5),
  },

  modalInput: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: s(8),
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
  },

  modalSubtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vs(5),
    paddingTop: vs(10),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },

  modalSubtotalLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  modalSubtotalValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    fontWeight: '700',
    color: Colors.primary,
  },

  modalAddButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(15),
    alignItems: 'center',
    marginTop: vs(15),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  modalAddButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.white,
  },
});

export default RecordPurchaseOrderScreen;

