/**
 * RECORD PURCHASE ORDER SCREEN
 * 
 * Allows store owners to record inventory restocking from suppliers
 * Tracks costs and automatically updates inventory when marked as received
 * 
 * Features:
 * - Supplier information (optional - sari-sari stores buy from various places)
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
}

interface SelectedProduct extends Product {
  purchaseQuantity: number;
  costPerUnit: number;
  subtotal: number;
}

const RecordPurchaseOrderScreen = () => {
  const params = useLocalSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('My Store');

  // Purchase order details - Pre-populate from params if coming from supplier details
  const [supplierName, setSupplierName] = useState(
    typeof params.supplierName === 'string' ? params.supplierName : ''
  );
  const [supplierContact, setSupplierContact] = useState(
    typeof params.supplierContact === 'string' ? params.supplierContact : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCost = selectedProducts.reduce((sum, p) => sum + p.subtotal, 0);

  useEffect(() => {
    fetchProducts();
    fetchStoreInfo();
    loadCartFromStorage();
  }, []);

  // Save cart to AsyncStorage whenever selectedProducts, supplier info, or notes changes
  useEffect(() => {
    if (selectedProducts.length > 0) {
      saveCartToStorage();
    }
  }, [selectedProducts, supplierName, supplierContact, notes]);

  const saveCartToStorage = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const cartData = {
        selectedProducts,
        supplierName,
        supplierContact,
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
          setSupplierName(cartData.supplierName || '');
          setSupplierContact(cartData.supplierContact || '');
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

  const handleAddProduct = (product: Product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    
    if (existingProduct) {
      Alert.alert('Already Added', 'This product is already in the purchase order. You can adjust the quantity or cost.');
      return;
    }

    // Default cost = 80% of selling price (common wholesale margin)
    const defaultCost = Math.round(product.price * 0.8);

    const newProduct: SelectedProduct = {
      ...product,
      purchaseQuantity: 1,
      costPerUnit: defaultCost,
      subtotal: defaultCost,
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setShowProductSelector(false);
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
            setSupplierName('');
            setSupplierContact('');
            setPurchaseDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            clearCartFromStorage();
            Alert.alert('Cart Cleared', 'All items have been removed.');
          },
        },
      ]
    );
  };

  const handleRecordPurchase = () => {
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

    // Clear cart from storage since user is proceeding to payment
    clearCartFromStorage();

    // Navigate to payment screen with order data
    router.push({
      pathname: '/(main)/(store-owner)/profile/purchase-payment' as any,
      params: {
        supplierName: supplierName.trim(),
        supplierContact: supplierContact.trim(),
        purchaseDate,
        items: JSON.stringify(items),
        notes: notes.trim(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <ProfileScreenHeader title="Record Purchase Order" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Purchase Information Section */}
        <Text style={styles.sectionTitle}>Purchase Information</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.inputLabel}>Where did you buy? (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Puregold, SM, Divisoria, Local Market..."
            placeholderTextColor="rgba(30, 30, 30, 0.5)"
            value={supplierName}
            onChangeText={setSupplierName}
          />

          <Text style={[styles.inputLabel, { marginTop: vs(15) }]}>Contact Number (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., +63 912 345 6789"
            placeholderTextColor="rgba(30, 30, 30, 0.5)"
            value={supplierContact}
            onChangeText={setSupplierContact}
            keyboardType="phone-pad"
          />

          <Text style={[styles.inputLabel, { marginTop: vs(15) }]}>Purchase Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="rgba(30, 30, 30, 0.5)"
            value={purchaseDate}
            onChangeText={setPurchaseDate}
          />
        </View>

        {/* Add Products Button */}
        <TouchableOpacity
          style={styles.addProductCard}
          onPress={() => setShowProductSelector(true)}
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

        {/* Selected Products Section - Horizontal Scroll */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.sectionLabel}>Products to Purchase</Text>
            <Text style={styles.productCount}>
              {selectedProducts.length} {selectedProducts.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {selectedProducts.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => setShowProductSelector(true)}
              activeOpacity={0.7}
            >
              <View style={styles.emptyAddIconCircle}>
                <Text style={styles.emptyAddIcon}>+</Text>
              </View>
              <Text style={styles.emptyAddTitle}>Add Your First Product</Text>
              <Text style={styles.emptyAddSubtitle}>
                Tap here to select products from your catalog
              </Text>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              style={styles.horizontalScrollView}
            >
              {selectedProducts.map((product, index) => (
                <View key={product.id} style={styles.horizontalProductCard}>
                  {/* Card Header */}
                  <View style={styles.hCardHeader}>
                    <View style={styles.hIndexBadge}>
                      <Text style={styles.hIndexText}>#{index + 1}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.hRemoveButton}
                      onPress={() => handleRemoveProduct(product.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.hRemoveIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Product Image */}
                  <View style={styles.hImageContainer}>
                    {getProductImageSource(product) ? (
                      <Image source={getProductImageSource(product)!} style={styles.hProductImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.hImagePlaceholder}>
                        <Text style={styles.hImagePlaceholderIcon}>📦</Text>
                      </View>
                    )}
                  </View>

                  {/* Product Name */}
                  <Text style={styles.hProductName} numberOfLines={2}>{product.productName}</Text>
                  <Text style={styles.hProductSize}>{product.productSize} {product.unit}</Text>
                  <Text style={styles.hSellingPrice}>Sells at: ₱{product.price.toFixed(2)}</Text>

                  {/* Cost Input */}
                  <View style={styles.hCostSection}>
                    <Text style={styles.hSectionLabel}>Cost per unit</Text>
                    <View style={styles.hPriceInputContainer}>
                      <Text style={styles.hPesoCurrency}>₱</Text>
                      <TextInput
                        style={styles.hPriceInput}
                        value={product.costPerUnit.toString()}
                        onChangeText={(text) => handleCostChange(product.id, text)}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                      />
                    </View>
                  </View>

                  {/* Quantity Controls */}
                  <View style={styles.hQuantitySection}>
                    <Text style={styles.hSectionLabel}>Quantity</Text>
                    <View style={styles.hQuantityControls}>
                      <TouchableOpacity
                        style={styles.hQtyButton}
                        onPress={() => handleDecrementQuantity(product.id)}
                        disabled={product.purchaseQuantity <= 1}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.hQtyButtonText}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.hQtyInput}
                        value={product.purchaseQuantity.toString()}
                        onChangeText={(text) => handleQuantityChange(product.id, text)}
                        keyboardType="number-pad"
                        textAlign="center"
                      />
                      <TouchableOpacity
                        style={styles.hQtyButton}
                        onPress={() => handleIncrementQuantity(product.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.hQtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Subtotal Footer */}
                  <View style={styles.hSubtotalFooter}>
                    <Text style={styles.hSubtotalLabel}>Subtotal</Text>
                    <Text style={styles.hSubtotalValue}>₱{product.subtotal.toFixed(2)}</Text>
                  </View>
                </View>
              ))}

              {/* Add More Products Card */}
              <TouchableOpacity
                style={styles.hAddProductCard}
                onPress={() => setShowProductSelector(true)}
                activeOpacity={0.7}
              >
                <View style={styles.hAddIconCircle}>
                  <Text style={styles.hAddIcon}>+</Text>
                </View>
                <Text style={styles.hAddText}>Add{'\n'}More</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Notes Section */}
        {selectedProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g., Bought from Puregold Caloocan branch..."
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
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity
                onPress={() => setShowProductSelector(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

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
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productSelectorItem}
                    onPress={() => handleAddProduct(product)}
                    activeOpacity={0.7}
                  >
                    {getProductImageSource(product) ? (
                      <Image source={getProductImageSource(product)!} style={styles.selectorProductImage} />
                    ) : (
                      <View style={[styles.selectorProductImage, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 10, color: '#999' }}>No Image</Text>
                      </View>
                    )}
                    <View style={styles.selectorProductInfo}>
                      <Text style={styles.selectorProductName} numberOfLines={1}>
                        {product.productName}
                      </Text>
                      <Text style={styles.selectorProductSize}>
                        {product.productSize} {product.unit}
                      </Text>
                      <Text style={styles.selectorProductPrice}>₱{product.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.selectorProductStock}>
                      <Text style={styles.stockText}>Stock: {product.quantity}</Text>
                    </View>
                  </TouchableOpacity>
                ))
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

  // Horizontal Scroll View
  horizontalScrollView: {
    marginHorizontal: s(-20),
    marginBottom: vs(10),
  },
  horizontalScrollContent: {
    paddingHorizontal: s(20),
    paddingVertical: vs(5),
    gap: s(15),
  },

  // Horizontal Product Card
  horizontalProductCard: {
    width: s(240),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(14),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(2, 84, 95, 0.08)',
  },

  // Card Header
  hCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  hIndexBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: s(12),
    paddingVertical: vs(4),
    borderRadius: s(10),
  },
  hIndexText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(12),
    color: Colors.white,
  },
  hRemoveButton: {
    width: s(26),
    height: s(26),
    borderRadius: s(13),
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hRemoveIcon: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#FF5252',
  },

  // Product Image
  hImageContainer: {
    width: '100%',
    height: vs(100),
    borderRadius: s(14),
    overflow: 'hidden',
    marginBottom: vs(10),
    backgroundColor: '#F8F9FA',
  },
  hProductImage: {
    width: '100%',
    height: '100%',
  },
  hImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  hImagePlaceholderIcon: {
    fontSize: ms(32),
  },

  // Product Info
  hProductName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(4),
    lineHeight: vs(18),
  },
  hProductSize: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    marginBottom: vs(3),
  },
  hSellingPrice: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: vs(12),
  },

  // Section Label
  hSectionLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(11),
    color: Colors.textSecondary,
    marginBottom: vs(6),
  },

  // Cost Section
  hCostSection: {
    marginBottom: vs(12),
  },
  hPriceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#02545F',
    borderRadius: s(10),
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  hPesoCurrency: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: '#02545F',
    paddingLeft: s(12),
    paddingRight: s(4),
  },
  hPriceInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    paddingVertical: vs(10),
    paddingRight: s(12),
    textAlign: 'center',
  },

  // Quantity Section
  hQuantitySection: {
    marginBottom: vs(12),
  },
  hQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#02545F',
    borderRadius: s(10),
    overflow: 'hidden',
  },
  hQtyButton: {
    width: s(40),
    height: vs(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 84, 95, 0.1)',
  },
  hQtyButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: '#02545F',
  },
  hQtyInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    textAlign: 'center',
    paddingVertical: vs(8),
  },

  // Subtotal Footer
  hSubtotalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: vs(12),
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  hSubtotalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(13),
    color: Colors.textSecondary,
  },
  hSubtotalValue: {
    fontFamily: Fonts.primary,
    fontWeight: '800',
    fontSize: ms(18),
    color: Colors.primary,
  },

  // Add Product Card (in horizontal scroll)
  hAddProductCard: {
    width: s(120),
    height: vs(360),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  hAddIconCircle: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(10),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  hAddIcon: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(28),
    color: Colors.white,
  },
  hAddText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: vs(18),
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
});

export default RecordPurchaseOrderScreen;

