/**
 * RECORD DAMAGE & SPOILAGE SCREEN - Product Selection Pattern
 *
 * Allows store owners to record damaged, expired, or spoiled products
 * Uses product selection from existing inventory (improved from manual entry)
 *
 * Features:
 * - Multi-product selection from inventory
 * - Product search and filtering
 * - Damage reason input with dropdown suggestions
 * - Quantity input with validation (max = stock)
 * - Optional notes per item
 * - Automatic loss calculation
 * - Real-time inventory validation
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
import { DamageItem, DamageReason } from '../../../../src/models/Damage';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';

// Damage reason options (no icons, plain text)
const DAMAGE_REASON_OPTIONS = [
  'Expired',
  'Damaged',
  'Spoiled',
  'Broken',
  'Water Damage',
  'Crushed/Dented',
  'Mold/Contaminated',
  'Customer Return - Defective',
  'Other',
];

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
  damageReason: string;
  notes: string;
  totalLoss: number;
}

const RecordDamageScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState('My Store');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedProductIds, setCheckedProductIds] = useState<string[]>([]);

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    p.status === 'available' &&
    p.quantity > 0
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
        'Discard Changes?',
        'You have unsaved damage records. Are you sure you want to go back?',
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
      Alert.alert('Already Added', 'This product is already in the damage list.');
      return;
    }

    const newProduct: SelectedProduct = {
      ...product,
      damageQuantity: 1,
      damageReason: '',
      notes: '',
      totalLoss: product.price,
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setShowProductSelector(false);
  };

  const handleToggleProductCheck = (productId: string) => {
    setCheckedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleAddSelectedProducts = () => {
    if (checkedProductIds.length === 0) {
      Alert.alert('No Products Selected', 'Please select at least one product to add.');
      return;
    }

    const productsToAdd = products.filter(p => checkedProductIds.includes(p.id));
    const alreadyAdded: string[] = [];
    const newProducts: SelectedProduct[] = [];

    productsToAdd.forEach(product => {
      const existingProduct = selectedProducts.find(p => p.id === product.id);
      if (existingProduct) {
        alreadyAdded.push(product.productName);
      } else {
        newProducts.push({
          ...product,
          damageQuantity: 1,
          damageReason: '',
          notes: '',
          totalLoss: product.price,
        });
      }
    });

    if (newProducts.length > 0) {
      setSelectedProducts([...selectedProducts, ...newProducts]);
    }

    if (alreadyAdded.length > 0) {
      Alert.alert(
        'Some Products Already Added',
        `The following products are already in the list:\n${alreadyAdded.join(', ')}`
      );
    }

    setCheckedProductIds([]);
    setShowProductSelector(false);
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 0;

    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        // Don't allow quantity greater than available stock
        const validQuantity = Math.min(quantity, p.quantity);
        return {
          ...p,
          damageQuantity: validQuantity,
          totalLoss: validQuantity * p.price,
        };
      }
      return p;
    }));
  };

  const handleIncrementQuantity = (productId: string) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        // Don't exceed available stock
        const newQuantity = Math.min(p.damageQuantity + 1, p.quantity);
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
      if (p.id === productId && p.damageQuantity > 1) {
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

  const handleReasonChange = (productId: string, reason: string) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, damageReason: reason } : p
    ));
  };

  const handleReasonSelect = (reason: string) => {
    if (currentProductId) {
      setSelectedProducts(selectedProducts.map(p =>
        p.id === currentProductId ? { ...p, damageReason: reason } : p
      ));
    }
    setShowReasonDropdown(false);
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
        Alert.alert('Error', 'Please add at least one damaged product');
        return;
      }

      const invalidProducts = selectedProducts.filter(p => p.damageQuantity <= 0);
      if (invalidProducts.length > 0) {
        Alert.alert('Error', 'All products must have a quantity greater than 0');
        return;
      }

      // Validate damage reasons
      const missingReasons = selectedProducts.filter(p => !p.damageReason.trim());
      if (missingReasons.length > 0) {
        Alert.alert('Error', 'Please specify a damage reason for all products');
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
        description: p.description,
        category: p.category,
        quantity: p.damageQuantity,
        price: p.price,
        totalLoss: p.totalLoss,
        productSize: p.productSize,
        unit: p.unit,
        reason: p.damageReason.toLowerCase() as DamageReason,
        notes: p.notes,
        productImage: p.productImage,
        productImageUrl: p.productImageUrl,
      }));

      const result = await recordDamage(
        currentUser.uid,
        storeName,
        { items: damageItems }
      );

      if (result.success) {
        Alert.alert(
          'Damage Recorded!',
          `Total Items: ${damageItems.length}\nTotal Loss: ₱${totalLoss.toFixed(2)}\n\nDamage records have been saved.`,
          [
            {
              text: 'View History',
              onPress: () => router.replace('/(main)/(store-owner)/inventory/damage-history'),
            },
            {
              text: 'Record Another',
              onPress: () => {
                setSelectedProducts([]);
              }
            }
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <ProfileScreenHeader title="Record Damage & Spoilage" onBack={handleBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

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
                    <Text style={styles.selectedProductStock}>Stock: {product.quantity}</Text>
                  </View>
                </View>

                {/* Damage Reason Input with Dropdown */}
                <Text style={styles.reasonLabel}>Damage Reason:</Text>
                <View style={styles.reasonInputRow}>
                  <View style={styles.reasonTextInputContainer}>
                    <TextInput
                      style={styles.reasonTextInput}
                      placeholder="Type or select reason"
                      placeholderTextColor="rgba(30, 30, 30, 0.5)"
                      value={product.damageReason}
                      onChangeText={(text) => handleReasonChange(product.id, text)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.reasonDropdownButton}
                    onPress={() => {
                      setCurrentProductId(product.id);
                      setShowReasonDropdown(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reasonDropdownIcon}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Notes Input */}
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
            styles.processButton,
            (selectedProducts.length === 0 || saving) && styles.processButtonDisabled
          ]}
          onPress={handleRecordDamage}
          activeOpacity={0.7}
          disabled={selectedProducts.length === 0 || saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.processButtonText}>Record Damage</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Product Selector Modal */}
      <Modal
        visible={showProductSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowProductSelector(false);
          setCheckedProductIds([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Products</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProductSelector(false);
                  setCheckedProductIds([]);
                }}
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
                <Text style={styles.noProductsText}>
                  {searchQuery ? 'No products found' : 'No products available in inventory'}
                </Text>
              ) : (
                filteredProducts.map((product) => {
                  const isChecked = checkedProductIds.includes(product.id);
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={[styles.productSelectorItem, isChecked && styles.productSelectorItemChecked]}
                      onPress={() => handleToggleProductCheck(product.id)}
                      activeOpacity={0.7}
                    >
                      {/* Checkbox */}
                      <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                          {isChecked && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </View>

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
                  );
                })
              )}
            </ScrollView>

            {/* Add Selected Products Button */}
            <View style={styles.modalFooter}>
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionText}>
                  {checkedProductIds.length} product{checkedProductIds.length !== 1 ? 's' : ''} selected
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.addSelectedButton,
                  checkedProductIds.length === 0 && styles.addSelectedButtonDisabled
                ]}
                onPress={handleAddSelectedProducts}
                disabled={checkedProductIds.length === 0}
                activeOpacity={0.7}
              >
                <Text style={styles.addSelectedButtonText}>Add Selected Products</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reason Dropdown Modal */}
      <Modal
        visible={showReasonDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReasonDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReasonDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Select Damage Reason</Text>
            <ScrollView style={styles.dropdownList}>
              {DAMAGE_REASON_OPTIONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.dropdownOption}
                  onPress={() => handleReasonSelect(reason)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownOptionText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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

  sectionLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginBottom: vs(12),
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
    marginTop: vs(10),
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
    color: '#E92B45',
    marginBottom: vs(3),
  },

  selectedProductStock: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: '#FF9800',
    fontWeight: '500',
  },

  reasonLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(13),
    color: Colors.darkGray,
    marginBottom: vs(6),
  },

  reasonInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(12),
  },

  reasonTextInputContainer: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
  },

  reasonTextInput: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
    padding: 0,
  },

  reasonDropdownButton: {
    width: s(44),
    height: vs(42),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  reasonDropdownIcon: {
    fontSize: ms(16),
    color: Colors.darkGray,
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
    borderColor: '#E92B45',
    paddingHorizontal: s(4),
    paddingVertical: vs(4),
  },

  quantityButton: {
    width: s(32),
    height: s(32),
    borderRadius: s(8),
    backgroundColor: '#E92B45',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonText: {
    fontSize: ms(20),
    fontWeight: '700',
    color: Colors.white,
  },

  quantityDisplayBox: {
    backgroundColor: 'rgba(233, 43, 69, 0.08)',
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
    color: '#E92B45',
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

  processButton: {
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

  processButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
  },

  processButtonText: {
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
    paddingBottom: vs(10),
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
    borderWidth: 2,
    borderColor: 'transparent',
  },

  productSelectorItemChecked: {
    backgroundColor: 'rgba(233, 43, 69, 0.05)',
    borderColor: '#E92B45',
  },

  checkboxContainer: {
    marginRight: s(12),
  },

  checkbox: {
    width: s(24),
    height: s(24),
    borderRadius: s(6),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: '#E92B45',
    borderColor: '#E92B45',
  },

  checkmark: {
    color: Colors.white,
    fontSize: ms(16),
    fontWeight: '700',
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
    backgroundColor: '#E92B45',
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

  // Modal Footer
  modalFooter: {
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingTop: vs(15),
    paddingBottom: vs(20),
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },

  selectionInfo: {
    marginBottom: vs(12),
  },

  selectionText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    textAlign: 'center',
    fontWeight: '500',
  },

  addSelectedButton: {
    backgroundColor: '#E92B45',
    borderRadius: s(16),
    paddingVertical: vs(16),
    alignItems: 'center',
    shadowColor: '#E92B45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  addSelectedButtonDisabled: {
    backgroundColor: 'rgba(233, 43, 69, 0.3)',
  },

  addSelectedButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.white,
  },

  // Dropdown Modal (same as category dropdown in add-product)
  dropdownModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(20),
    marginHorizontal: s(40),
    marginTop: 'auto',
    marginBottom: 'auto',
    maxHeight: '70%',
  },

  dropdownModalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
    marginBottom: vs(15),
    textAlign: 'center',
  },

  dropdownList: {
    maxHeight: vs(400),
  },

  dropdownOption: {
    paddingVertical: vs(14),
    paddingHorizontal: s(16),
    borderRadius: s(10),
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginBottom: vs(8),
  },

  dropdownOptionText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(15),
    color: Colors.darkGray,
  },
});

export default RecordDamageScreen;
