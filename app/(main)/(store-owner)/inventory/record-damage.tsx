/**
 * RECORD DAMAGE SCREEN - Multi-Product Card Pattern
 *
 * Allows store owners to record damaged, expired, or spoiled products
 * Uses the same horizontal scroll card pattern as add-product.tsx and order-supplies.tsx
 *
 * Features:
 * - Multiple product cards with horizontal scroll
 * - Manual entry for all product details
 * - Image upload (optional)
 * - Damage reason selection
 * - Automatic loss calculation
 * - Real-time validation
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
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { recordDamage } from '../../../../src/api/damages';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';
import { DamageItem, DamageReason, DAMAGE_REASONS } from '../../../../src/models/Damage';
import * as ImagePicker from 'expo-image-picker';

// CATEGORIES - Same as add-product.tsx
const CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Bakery',
  'Snacks & Sweets',
  'Beverages',
  'Personal & Baby Care',
  'Home & Kitchen',
  'Staple Foods',
  'Condiments & Cooking',
  'Frozen Goods',
  'Miscellaneous & Others',
];

// UNITS - Same as add-product.tsx
const UNITS = [
  'g', 'kg', 'mg', 'lb', 'oz',
  'ml', 'L', 'gal',
  'pc', 'pcs', 'pack', 'box', 'can', 'bottle', 'sachet', 'bar',
];

interface DamageCard {
  id: string;
  productName: string;
  description: string;
  selectedCategory: string;
  unitPrice: string;
  quantity: string;
  productSize: string;
  selectedUnit: string;
  selectedReason: DamageReason;
  notes: string;
  selectedImage: string | null;
}

const RecordDamageScreen = () => {
  const [damageCards, setDamageCards] = useState<DamageCard[]>([
    {
      id: '1',
      productName: '',
      description: '',
      selectedCategory: '',
      unitPrice: '',
      quantity: '',
      productSize: '',
      selectedUnit: '',
      selectedReason: 'expired',
      notes: '',
      selectedImage: null,
    },
  ]);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [currentEditingCardId, setCurrentEditingCardId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [storeName, setStoreName] = useState('My Store');

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const { ref, get } = await import('firebase/database');
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

  const handleBack = () => {
    const hasData = damageCards.some(card =>
      card.productName || card.description || card.quantity || card.unitPrice
    );

    if (hasData) {
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

  // Update damage card field
  const updateDamageCard = (cardId: string, field: keyof DamageCard, value: string) => {
    setDamageCards(damageCards.map(card =>
      card.id === cardId ? { ...card, [field]: value } : card
    ));
  };

  // Add new damage card
  const handleAddAnotherProduct = () => {
    const newCard: DamageCard = {
      id: Date.now().toString(),
      productName: '',
      description: '',
      selectedCategory: '',
      unitPrice: '',
      quantity: '',
      productSize: '',
      selectedUnit: '',
      selectedReason: 'expired',
      notes: '',
      selectedImage: null,
    };
    setDamageCards([...damageCards, newCard]);
  };

  // Remove damage card
  const handleRemoveCard = (cardId: string) => {
    if (damageCards.length === 1) {
      Alert.alert('Cannot Remove', 'You must have at least one product card.');
      return;
    }
    setDamageCards(damageCards.filter(card => card.id !== cardId));
  };

  // Image picker
  const handleImageSelect = async (cardId: string) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateDamageCard(cardId, 'selectedImage', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Category selection
  const handleCategorySelect = (category: string) => {
    if (currentEditingCardId) {
      updateDamageCard(currentEditingCardId, 'selectedCategory', category);
    }
    setShowCategoryDropdown(false);
    setCurrentEditingCardId(null);
  };

  // Unit selection
  const handleUnitSelect = (unit: string) => {
    if (currentEditingCardId) {
      updateDamageCard(currentEditingCardId, 'selectedUnit', unit);
    }
    setShowUnitDropdown(false);
    setCurrentEditingCardId(null);
  };

  // Reason selection
  const handleReasonSelect = (reason: DamageReason) => {
    if (currentEditingCardId) {
      updateDamageCard(currentEditingCardId, 'selectedReason', reason);
    }
    setShowReasonDropdown(false);
    setCurrentEditingCardId(null);
  };

  // Validation
  const validateDamageItem = (item: DamageCard): { valid: boolean; error?: string } => {
    if (!item.productName.trim()) return { valid: false, error: 'Product name is required' };
    if (!item.description.trim()) return { valid: false, error: 'Description is required' };
    if (!item.selectedCategory) return { valid: false, error: 'Category is required' };
    if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) return { valid: false, error: 'Valid unit price is required' };
    if (!item.quantity || parseInt(item.quantity) <= 0) return { valid: false, error: 'Valid quantity is required' };
    if (!item.productSize.trim()) return { valid: false, error: 'Product size is required' };
    if (!item.selectedUnit) return { valid: false, error: 'Unit is required' };
    if (!item.selectedReason) return { valid: false, error: 'Damage reason is required' };
    return { valid: true };
  };

  // Record damage
  const handleRecordDamage = async () => {
    try {
      // Validate all cards
      for (let i = 0; i < damageCards.length; i++) {
        const validation = validateDamageItem(damageCards[i]);
        if (!validation.valid) {
          Alert.alert('Validation Error', `Product #${i + 1}: ${validation.error}`);
          return;
        }
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      setSaving(true);

      const damageItems: DamageItem[] = damageCards.map(card => ({
        productName: card.productName,
        description: card.description,
        category: card.selectedCategory,
        quantity: parseInt(card.quantity),
        price: parseFloat(card.unitPrice),
        totalLoss: parseInt(card.quantity) * parseFloat(card.unitPrice),
        productSize: card.productSize,
        unit: card.selectedUnit,
        reason: card.selectedReason,
        notes: card.notes,
        productImage: card.selectedImage || undefined,
        productId: `damage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }));

      const totalLoss = damageItems.reduce((sum, item) => sum + item.totalLoss, 0);

      const result = await recordDamage(
        currentUser.uid,
        storeName,
        { items: damageItems }
      );

      if (result.success) {
        Alert.alert(
          'Damage Recorded!',
          `Total Items: ${damageItems.length}\\nTotal Loss: ₱${totalLoss.toFixed(2)}\\n\\nDamage records have been saved.`,
          [
            {
              text: 'View History',
              onPress: () => router.replace('/(main)/(store-owner)/inventory/damage-history'),
            },
            {
              text: 'Record Another',
              onPress: () => {
                setDamageCards([{
                  id: '1',
                  productName: '',
                  description: '',
                  selectedCategory: '',
                  unitPrice: '',
                  quantity: '',
                  productSize: '',
                  selectedUnit: '',
                  selectedReason: 'expired',
                  notes: '',
                  selectedImage: null,
                }]);
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

  // Calculate total loss
  const calculateTotalLoss = () => {
    return damageCards.reduce((total, card) => {
      const price = parseFloat(card.unitPrice) || 0;
      const qty = parseInt(card.quantity) || 0;
      return total + (price * qty);
    }, 0);
  };

  const getReasonLabel = (reason: DamageReason) => {
    const reasonData = DAMAGE_REASONS.find(r => r.value === reason);
    return reasonData ? reasonData.label : reason;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <ProfileScreenHeader title="Record Damage & Spoilage" onBack={handleBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Damaged Products</Text>
          <Text style={styles.itemCount}>
            {damageCards.length} {damageCards.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Damage Product Cards */}
        {damageCards.map((item, index) => (
          <View key={item.id} style={styles.productCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardIndexBadge}>
                <Text style={styles.cardIndexText}>Product #{index + 1}</Text>
              </View>
              {damageCards.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveCard(item.id)}
                  style={styles.removeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeButtonText}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 2-COLUMN HORIZONTAL SCROLL - Same as add-product.tsx */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.twoColumnScroll}
            >
              {/* SECTION 1: Product Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Product Info</Text>

                {/* Upload Image */}
                <TouchableOpacity
                  style={styles.uploadContainer}
                  onPress={() => handleImageSelect(item.id)}
                  activeOpacity={0.7}
                >
                  {item.selectedImage ? (
                    <Image source={{ uri: item.selectedImage }} style={styles.selectedImagePreview} />
                  ) : (
                    <>
                      <Image
                        source={require('../../../../src/assets/images/add-product/upload-icon.png')}
                        style={styles.uploadIcon}
                      />
                      <Text style={styles.uploadText}>Upload Image (Optional)</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Product Name */}
                <Text style={styles.fieldLabel}>Product Name *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Expired Canned Sardines"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={item.productName}
                    onChangeText={(text) => updateDamageCard(item.id, 'productName', text)}
                  />
                </View>

                {/* Description */}
                <Text style={styles.fieldLabel}>Description *</Text>
                <View style={[styles.inputContainer, styles.descriptionContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.descriptionInput]}
                    placeholder="Describe the product"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={item.description}
                    onChangeText={(text) => updateDamageCard(item.id, 'description', text)}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* SECTION 2: Damage Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Damage Details</Text>

                {/* Category - Dynamic with Dropdown */}
                <Text style={styles.fieldLabel}>Category *</Text>
                <View style={styles.categoryInputRow}>
                  <View style={styles.categoryTextInputContainer}>
                    <TextInput
                      style={styles.categoryTextInput}
                      placeholder="Type or select"
                      placeholderTextColor="rgba(30, 30, 30, 0.5)"
                      value={item.selectedCategory}
                      onChangeText={(text) => updateDamageCard(item.id, 'selectedCategory', text)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.categoryDropdownButton}
                    onPress={() => {
                      setCurrentEditingCardId(item.id);
                      setShowCategoryDropdown(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryDropdownIcon}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Price & Quantity Row */}
                <View style={styles.rowFields}>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>Unit Price *</Text>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.pesoSign}>₱</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="0.00"
                        placeholderTextColor="rgba(30, 30, 30, 0.5)"
                        keyboardType="decimal-pad"
                        value={item.unitPrice}
                        onChangeText={(text) => updateDamageCard(item.id, 'unitPrice', text)}
                      />
                    </View>
                  </View>

                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>Qty Damaged *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. 10"
                        placeholderTextColor="rgba(30, 30, 30, 0.5)"
                        keyboardType="number-pad"
                        value={item.quantity}
                        onChangeText={(text) => updateDamageCard(item.id, 'quantity', text)}
                      />
                    </View>
                  </View>
                </View>

                {/* Size & Unit Row */}
                <View style={styles.rowFields}>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>Size *</Text>
                    <View style={styles.inputContainerSmall}>
                      <TextInput
                        style={styles.textInputSmall}
                        placeholder="e.g. 500"
                        placeholderTextColor="rgba(30, 30, 30, 0.5)"
                        value={item.productSize}
                        onChangeText={(text) => updateDamageCard(item.id, 'productSize', text)}
                      />
                    </View>
                  </View>

                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>Unit *</Text>
                    <TouchableOpacity
                      style={styles.dropdownContainerSmall}
                      onPress={() => {
                        setCurrentEditingCardId(item.id);
                        setShowUnitDropdown(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownTextSmall, item.selectedUnit && styles.dropdownTextSelected]}>
                        {item.selectedUnit || 'Unit'}
                      </Text>
                      <Text style={styles.dropdownArrowSmall}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Damage Reason */}
                <Text style={styles.fieldLabel}>Damage Reason *</Text>
                <TouchableOpacity
                  style={styles.dropdownContainer}
                  onPress={() => {
                    setCurrentEditingCardId(item.id);
                    setShowReasonDropdown(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownText, item.selectedReason && styles.dropdownTextSelected]}>
                    {getReasonLabel(item.selectedReason)}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Swipe Indicator */}
            <View style={styles.swipeIndicator}>
              <Text style={styles.swipeText}>← Swipe for more fields →</Text>
            </View>

            {/* Loss Calculation */}
            {item.unitPrice && item.quantity && (
              <View style={styles.lossPreview}>
                <Text style={styles.lossLabel}>Loss for this item:</Text>
                <Text style={styles.lossAmount}>
                  ₱{(parseFloat(item.unitPrice) * parseInt(item.quantity) || 0).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Add Another Product Button */}
        <TouchableOpacity
          style={styles.addAnotherButton}
          onPress={handleAddAnotherProduct}
          activeOpacity={0.7}
        >
          <View style={styles.addButtonCircle}>
            <Text style={styles.addButtonIcon}>+</Text>
          </View>
          <Text style={styles.addButtonText}>Add Another Damaged Product</Text>
        </TouchableOpacity>

        {/* Total Loss Section */}
        {damageCards.length > 0 && calculateTotalLoss() > 0 && (
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Loss</Text>
            <Text style={styles.totalAmount}>₱{calculateTotalLoss().toFixed(2)}</Text>
          </View>
        )}

        {/* Record Damage Button */}
        <TouchableOpacity
          style={[styles.recordButton, saving && styles.recordButtonDisabled]}
          onPress={handleRecordDamage}
          activeOpacity={0.7}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.recordButtonText}>Record Damage</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.dropdownList}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.dropdownOption}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownOptionText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Unit Dropdown Modal */}
      <Modal
        visible={showUnitDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUnitDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUnitDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.modalTitle}>Select Unit</Text>
            <ScrollView style={styles.dropdownList}>
              {UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={styles.dropdownOption}
                  onPress={() => handleUnitSelect(unit)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownOptionText}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Select Damage Reason</Text>
            <ScrollView style={styles.dropdownList}>
              {DAMAGE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={styles.dropdownOption}
                  onPress={() => handleReasonSelect(reason.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownOptionText}>{reason.label}</Text>
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

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
    marginTop: vs(10),
  },

  sectionLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(24),
    color: Colors.darkGray,
  },

  itemCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  // Product Card
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(15),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  cardIndexBadge: {
    backgroundColor: '#E92B45',
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: s(8),
  },

  cardIndexText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: Colors.white,
  },

  removeButton: {
    paddingVertical: vs(4),
    paddingHorizontal: s(8),
  },

  removeButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(13),
    color: '#FF5252',
  },

  // 2-Column Horizontal Scroll
  twoColumnScroll: {
    flexDirection: 'row',
    gap: s(15),
    paddingRight: s(20),
  },

  // Section
  section: {
    width: s(320),
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(12),
  },

  swipeIndicator: {
    alignItems: 'center',
    marginTop: vs(8),
  },

  swipeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // Row Fields
  rowFields: {
    flexDirection: 'row',
    gap: s(10),
    marginBottom: vs(12),
  },

  halfField: {
    flex: 1,
  },

  fieldLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(6),
  },

  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: vs(12),
  },

  textInput: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
  },

  inputContainerSmall: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    marginBottom: vs(12),
  },

  textInputSmall: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#1E1E1E',
    textAlign: 'center',
  },

  descriptionContainer: {
    height: vs(100),
  },

  descriptionInput: {
    height: '100%',
    textAlignVertical: 'top',
  },

  // Category Input Row
  categoryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(12),
  },

  categoryTextInputContainer: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
  },

  categoryTextInput: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
    padding: 0,
  },

  categoryDropdownButton: {
    width: s(44),
    height: vs(42),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryDropdownIcon: {
    fontSize: ms(16),
    color: Colors.darkGray,
  },

  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(10),
    paddingVertical: vs(10),
    marginBottom: vs(12),
  },

  pesoSign: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.primary,
    marginRight: s(5),
  },

  priceInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
  },

  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(12),
    paddingVertical: vs(12),
    marginBottom: vs(12),
  },

  dropdownText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.4)',
    flex: 1,
  },

  dropdownTextSelected: {
    color: '#1E1E1E',
  },

  dropdownArrow: {
    fontSize: ms(12),
    color: Colors.darkGray,
  },

  dropdownContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    marginBottom: vs(12),
  },

  dropdownTextSmall: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: 'rgba(30, 30, 30, 0.4)',
    flex: 1,
  },

  dropdownArrowSmall: {
    fontSize: ms(10),
    color: Colors.darkGray,
  },

  // Image Upload - Same as order-supplies.tsx
  uploadContainer: {
    width: '100%',
    height: vs(120),
    backgroundColor: '#F9FAFB',
    borderRadius: s(15),
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  selectedImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: s(13),
  },

  uploadIcon: {
    width: s(25),
    height: vs(25),
    marginBottom: vs(8),
    tintColor: Colors.primary,
  },

  uploadText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: 'rgba(30, 30, 30, 0.4)',
  },

  // Loss Preview
  lossPreview: {
    backgroundColor: '#FFF3E0',
    borderRadius: s(12),
    padding: s(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },

  lossLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#E65100',
  },

  lossAmount: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: '#E92B45',
  },

  // Add Another Button
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingVertical: vs(16),
    borderWidth: 2,
    borderColor: '#E92B45',
    borderStyle: 'dashed',
    marginBottom: vs(20),
  },

  addButtonCircle: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: '#E92B45',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(10),
  },

  addButtonIcon: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.white,
  },

  addButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#E92B45',
  },

  // Total Section
  totalSection: {
    backgroundColor: '#E92B45',
    borderRadius: s(16),
    paddingVertical: vs(20),
    paddingHorizontal: s(20),
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

  // Record Button
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
    justifyContent: 'center',
    alignItems: 'center',
  },

  dropdownModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(20),
    width: '85%',
    maxHeight: '70%',
  },

  modalTitle: {
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
