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
import { router } from 'expo-router';
import { ref, onValue, query, orderByChild, equalTo, get } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { createPurchaseOrder } from '../../../../src/api/purchaseOrders';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';
import { PurchaseOrderItem } from '../../../../src/models/PurchaseOrder';

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
  status: 'available' | 'out_of_stock';
}

interface SelectedProduct extends Product {
  purchaseQuantity: number;
  costPerUnit: number;
  subtotal: number;
}

const RecordPurchaseOrderScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState('My Store');
  
  // Purchase order details
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
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
  }, []);

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
    if (selectedProducts.length > 0) {
      Alert.alert(
        'Discard Purchase Order?',
        'You have unsaved items. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
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

  const handleRecordPurchase = async () => {
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

    setSaving(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Prepare items
      const items: PurchaseOrderItem[] = selectedProducts.map(p => ({
        productId: p.id,
        productName: p.productName,
        productImage: p.productImage,
        quantity: p.purchaseQuantity,
        costPerUnit: p.costPerUnit,
        subtotal: p.subtotal,
        productSize: p.productSize,
        unit: p.unit,
      }));

      // Create purchase order
      const result = await createPurchaseOrder(
        currentUser.uid,
        storeName,
        {
          supplierName: supplierName.trim() || undefined,
          supplierContact: supplierContact.trim() || undefined,
          items,
          purchaseDate,
          notes: notes.trim() || undefined,
        }
      );

      if (result.success) {
        Alert.alert(
          'Success',
          'Purchase order recorded successfully! Stock will be updated when you mark it as received.',
          [
            {
              text: 'View History',
              onPress: () => {
                router.replace('/(main)/(store-owner)/profile/purchase-order-history');
              }
            },
            {
              text: 'Record Another',
              onPress: () => {
                // Reset form
                setSelectedProducts([]);
                setSupplierName('');
                setSupplierContact('');
                setNotes('');
                setPurchaseDate(new Date().toISOString().split('T')[0]);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to record purchase order');
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
      Alert.alert('Error', 'Failed to record purchase order. Please try again.');
    } finally {
      setSaving(false);
    }
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

        {/* Selected Products Section */}
        <Text style={styles.sectionLabel}>Products to Purchase</Text>
        
        {selectedProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items added</Text>
            <Text style={styles.emptyStateSubtext}>Tap "Add Product to Purchase Order" to get started</Text>
          </View>
        ) : (
          selectedProducts.map((product) => (
          <View key={product.id} style={styles.selectedProductCard}>
            {/* Remove Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveProduct(product.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Product Info */}
            <View style={styles.productMainRow}>
              <Image source={{ uri: product.productImage }} style={styles.selectedProductImage} />
              
              <View style={styles.selectedProductInfo}>
                <Text style={styles.selectedProductName} numberOfLines={2}>
                  {product.productName}
                </Text>
                <Text style={styles.selectedProductSize}>
                  {product.productSize} {product.unit}
                </Text>
                <Text style={styles.sellingPrice}>Sells at: ₱{product.price.toFixed(2)}</Text>
              </View>
            </View>

            {/* Cost Per Unit Input */}
            <View style={styles.costInputRow}>
              <Text style={styles.costLabel}>Cost per unit:</Text>
              <TextInput
                style={styles.costInput}
                value={product.costPerUnit.toString()}
                onChangeText={(text) => handleCostChange(product.id, text)}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>

            {/* Quantity Controls and Subtotal */}
            <View style={styles.bottomControlsRow}>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecrementQuantity(product.id)}
                  disabled={product.purchaseQuantity <= 1}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>

                <View style={styles.quantityDisplayBox}>
                  <TextInput
                    style={styles.quantityInput}
                    value={product.purchaseQuantity.toString()}
                    onChangeText={(text) => handleQuantityChange(product.id, text)}
                    keyboardType="number-pad"
                  />
                </View>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrementQuantity(product.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.subtotalBox}>
                <Text style={styles.subtotalLabel}>Total:</Text>
                <Text style={styles.subtotalText}>₱{product.subtotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          ))
        )}

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

        {/* Record Button */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            (selectedProducts.length === 0 || saving) && styles.recordButtonDisabled
          ]}
          onPress={handleRecordPurchase}
          activeOpacity={0.7}
          disabled={selectedProducts.length === 0 || saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.recordButtonText}>Record Purchase Order</Text>
          )}
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
                    <Image source={{ uri: product.productImage }} style={styles.selectorProductImage} />
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

  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingVertical: vs(40),
    alignItems: 'center',
    marginBottom: vs(20),
  },

  emptyStateText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(5),
  },

  emptyStateSubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  selectedProductCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },

  removeButton: {
    position: 'absolute',
    top: s(10),
    right: s(10),
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  removeButtonText: {
    fontSize: ms(18),
    fontWeight: '600',
    color: '#FF3B30',
  },

  productMainRow: {
    flexDirection: 'row',
    marginBottom: vs(12),
  },

  selectedProductImage: {
    width: s(80),
    height: s(80),
    borderRadius: s(12),
  },

  selectedProductInfo: {
    flex: 1,
    marginLeft: s(12),
    justifyContent: 'space-between',
    paddingVertical: vs(2),
  },

  selectedProductName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
    marginBottom: vs(3),
    lineHeight: vs(18),
  },

  selectedProductSize: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(3),
  },

  selectedProductPrice: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.primary,
    marginBottom: vs(3),
  },

  sellingPrice: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  stockAvailable: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
  },

  costInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(12),
    paddingHorizontal: s(5),
  },

  costLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    fontWeight: '500',
  },

  costInput: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.primary,
    borderWidth: 1.5,
    borderColor: '#02545F',
    borderRadius: s(8),
    paddingVertical: vs(6),
    paddingHorizontal: s(12),
    minWidth: s(100),
    textAlign: 'center',
  },

  bottomControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(10),
    borderWidth: 1.5,
    borderColor: '#02545F',
    paddingHorizontal: s(4),
    paddingVertical: vs(4),
  },

  quantityButton: {
    width: s(32),
    height: s(32),
    borderRadius: s(8),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonText: {
    fontSize: ms(20),
    fontWeight: '700',
    color: Colors.white,
  },

  quantityDisplayBox: {
    backgroundColor: 'rgba(59, 183, 126, 0.08)',
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    marginHorizontal: s(6),
    borderRadius: s(6),
    minWidth: s(50),
  },

  quantityInput: {
    textAlign: 'center',
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    padding: 0,
  },

  subtotalBox: {
    alignItems: 'flex-end',
  },

  subtotalLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(2),
  },

  subtotalText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
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
