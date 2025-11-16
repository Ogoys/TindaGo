/**
 * RECORD DAMAGE SCREEN
 * 
 * Allows store owners to record damaged, expired, or spoiled products
 * Automatically updates product inventory
 * 
 * Features:
 * - Product selection from inventory
 * - Quantity input with +/- buttons
 * - Reason selection (expired, damaged, spoiled, broken)
 * - Optional notes
 * - Real-time loss calculation
 * - Inventory validation
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
import { recordDamage } from '../../../../src/api/damages';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';
import { DamageItem, DamageReason, DAMAGE_REASONS } from '../../../../src/models/Damage';
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
  damageQuantity: number;
  reason: DamageReason;
  notes: string;
  totalLoss: number;
}

const RecordDamageScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showReasonSelector, setShowReasonSelector] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState('My Store');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    p.status === 'available'
  );

  const totalLoss = selectedProducts.reduce((sum, p) => sum + p.totalLoss, 0);

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
        setProducts(productsList.filter(p => p.status === 'available' && p.quantity > 0));
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
        'Discard Changes?',
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
      Alert.alert('Already Added', 'This product is already in the list. You can adjust the quantity or reason.');
      return;
    }

    const newProduct: SelectedProduct = {
      ...product,
      damageQuantity: 1,
      reason: 'expired',
      notes: '',
      totalLoss: product.price,
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setShowProductSelector(false);
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 0;
    
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        const product = products.find(prod => prod.id === productId);
        if (product && quantity > product.quantity) {
          Alert.alert('Insufficient Stock', `Only ${product.quantity} units available`);
          return p;
        }
        return {
          ...p,
          damageQuantity: quantity,
          totalLoss: quantity * p.price,
        };
      }
      return p;
    }));
  };

  const handleIncrementQuantity = (productId: string) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        const product = products.find(prod => prod.id === productId);
        if (product && p.damageQuantity >= product.quantity) {
          Alert.alert('Max Stock', `Only ${product.quantity} units available`);
          return p;
        }
        const newQuantity = p.damageQuantity + 1;
        return {
          ...p,
          damageQuantity: newQuantity,
          totalLoss: newQuantity * p.price,
        };
      }
      return p;
    }));
  };

  const handleDecrementQuantity = (productId: string) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        if (p.damageQuantity <= 1) {
          return p;
        }
        const newQuantity = p.damageQuantity - 1;
        return {
          ...p,
          damageQuantity: newQuantity,
          totalLoss: newQuantity * p.price,
        };
      }
      return p;
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleReasonSelect = (productId: string) => {
    setCurrentProductId(productId);
    setShowReasonSelector(true);
  };

  const handleReasonChange = (reason: DamageReason) => {
    if (currentProductId) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === currentProductId ? { ...p, reason } : p
      ));
    }
    setShowReasonSelector(false);
    setCurrentProductId(null);
  };

  const handleNotesChange = (productId: string, notes: string) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, notes } : p
    ));
  };

  const handleRecordDamage = async () => {
    try {
      if (selectedProducts.length === 0) {
        Alert.alert('Error', 'Please add at least one product');
        return;
      }

      const invalidProducts = selectedProducts.filter(p => p.damageQuantity <= 0);
      if (invalidProducts.length > 0) {
        Alert.alert('Error', 'All products must have a quantity greater than 0');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      setSaving(true);

      const damageItems: DamageItem[] = selectedProducts.map(p => ({
        productId: p.id,
        productName: p.productName,
        productImage: p.productImage,
        productImageUrl: p.productImageUrl,
        quantity: p.damageQuantity,
        price: p.price,
        totalLoss: p.totalLoss,
        productSize: p.productSize,
        unit: p.unit,
        reason: p.reason,
        notes: p.notes,
      }));

      const result = await recordDamage(
        currentUser.uid,
        storeName,
        { items: damageItems }
      );

      if (result.success) {
        Alert.alert(
          'Damage Recorded!',
          `Total Loss: ₱${totalLoss.toFixed(2)}\\n\\nInventory has been updated automatically.`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to record damage');
      }
    } catch (error) {
      console.error('Error recording damage:', error);
      Alert.alert('Error', 'Failed to record damage. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getReasonData = (reason: DamageReason) => {
    return DAMAGE_REASONS.find(r => r.value === reason) || DAMAGE_REASONS[0];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <ProfileScreenHeader title="Record Damage & Spoilage" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Add Product Card */}
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
            <Text style={styles.addProductText}>Add Damaged Product</Text>
          </View>
          <Image
            source={require('../../../../src/assets/images/store-product/forward-arrow.png')}
            style={styles.forwardArrow}
          />
        </TouchableOpacity>

        {/* Selected Products Section */}
        <Text style={styles.sectionLabel}>Damaged Items</Text>
        
        {selectedProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items added</Text>
            <Text style={styles.emptyStateSubtext}>Tap "Add Damaged Product" to get started</Text>
          </View>
        ) : (
          selectedProducts.map((product) => {
            const reasonData = getReasonData(product.reason);
            return (
              <View key={product.id} style={styles.selectedProductCard}>
                {/* Delete X Button */}
                <TouchableOpacity
                  onPress={() => handleRemoveProduct(product.id)}
                  style={styles.removeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>

                {/* Product Image and Info */}
                <View style={styles.productMainRow}>
                  {getProductImageSource(product) ? (
                    <Image source={getProductImageSource(product)!} style={styles.selectedProductImage} />
                  ) : (
                    <View style={[styles.selectedProductImage, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 10, color: '#999' }}>No Image</Text>
                    </View>
                  )}
                  
                  <View style={styles.selectedProductInfo}>
                    <Text style={styles.selectedProductName} numberOfLines={2}>
                      {product.productName}
                    </Text>
                    <Text style={styles.selectedProductSize}>
                      {product.productSize} {product.unit}
                    </Text>
                    <Text style={styles.selectedProductPrice}>₱{product.price.toFixed(2)} each</Text>
                    <Text style={styles.stockAvailable}>Stock: {product.quantity}</Text>
                  </View>
                </View>

                {/* Reason Selector */}
                <TouchableOpacity
                  style={styles.reasonSelector}
                  onPress={() => handleReasonSelect(product.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reasonLabel}>Reason:</Text>
                  <View style={styles.reasonDisplay}>
                    <Text style={styles.reasonText}>{reasonData.label}</Text>
                    <Text style={styles.reasonArrow}>▼</Text>
                  </View>
                </TouchableOpacity>

                {/* Optional Notes */}
                <TextInput
                  style={styles.notesInput}
                  placeholder="Notes (optional)"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={product.notes}
                  onChangeText={(text) => handleNotesChange(product.id, text)}
                  multiline
                />

                {/* Quantity Controls and Loss */}
                <View style={styles.bottomControlsRow}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleDecrementQuantity(product.id)}
                      disabled={product.damageQuantity <= 1}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>

                    <View style={styles.quantityDisplayBox}>
                      <TextInput
                        style={styles.quantityInput}
                        value={product.damageQuantity.toString()}
                        onChangeText={(text) => handleQuantityChange(product.id, text)}
                        keyboardType="number-pad"
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleIncrementQuantity(product.id)}
                      disabled={product.damageQuantity >= product.quantity}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.subtotalBox}>
                    <Text style={styles.subtotalLabel}>Loss:</Text>
                    <Text style={styles.subtotalText}>₱{product.totalLoss.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Total Loss Section */}
        {selectedProducts.length > 0 && (
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Loss</Text>
            <Text style={styles.totalAmount}>₱{totalLoss.toFixed(2)}</Text>
          </View>
        )}

        {/* Record Damage Button */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            (selectedProducts.length === 0 || saving) && styles.recordButtonDisabled
          ]}
          onPress={handleRecordDamage}
          activeOpacity={0.7}
          disabled={selectedProducts.length === 0 || saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.recordButtonText}>Record Damage</Text>
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
                <Text style={styles.noProductsText}>No available products</Text>
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

      {/* Reason Selector Modal */}
      <Modal
        visible={showReasonSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReasonSelector(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReasonSelector(false)}
        >
          <View style={styles.reasonSelectorModal}>
            <Text style={styles.modalTitle}>Select Reason</Text>
            {DAMAGE_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={styles.reasonOption}
                onPress={() => handleReasonChange(reason.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.reasonOptionText}>{reason.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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

  sectionLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginBottom: vs(12),
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

  stockAvailable: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
  },

  reasonSelector: {
    marginBottom: vs(10),
  },

  reasonLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.darkGray,
    marginBottom: vs(6),
  },

  reasonDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    borderRadius: s(10),
    borderWidth: 1.5,
    borderColor: '#02545F',
  },

  reasonText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
  },

  reasonArrow: {
    fontSize: ms(12),
    color: Colors.primary,
  },

  notesInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    marginBottom: vs(10),
    minHeight: vs(50),
    textAlignVertical: 'top',
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
    color: '#E92B45', // Red color for loss
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

  totalSection: {
    backgroundColor: '#E92B45',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  productSelectorModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: s(25),
    borderTopRightRadius: s(25),
    height: '85%',
    paddingTop: vs(20),
  },

  reasonSelectorModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    marginHorizontal: s(40),
    padding: s(20),
    marginTop: 'auto',
    marginBottom: 'auto',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    marginBottom: vs(20),
  },

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(22),
    color: Colors.darkGray,
    marginBottom: vs(15),
  },

  closeButton: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  searchInput: {
    marginHorizontal: s(20),
    marginBottom: vs(15),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: s(12),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: Colors.darkGray,
  },

  productsListScroll: {
    flex: 1,
    paddingHorizontal: s(20),
  },

  noProductsText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: vs(40),
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

  reasonOption: {
    paddingVertical: vs(16),
    paddingHorizontal: s(20),
    borderRadius: s(12),
    backgroundColor: Colors.white,
    marginBottom: vs(10),
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  reasonOptionText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    textAlign: 'center',
  },
});

export default RecordDamageScreen;
