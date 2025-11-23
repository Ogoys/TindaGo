/**
 * ADD PRODUCT SCREEN - Batch Add Multiple Products
 *
 * Figma File: 8I1Nr3vQZllDDmnSevstvH
 * Node: 1571-711, 1571-780
 * Baseline: 440x956
 *
 * Features:
 * - Add multiple products at once with horizontal scroll cards
 * - Each card has ALL product fields split into horizontal sections:
 *   - Section 1 (scroll right): Upload image, product name, description
 *   - Section 2 (scroll left): Category, price, quantity, size, unit, expiry
 * - Batch save all products at once
 */

import { router } from 'expo-router';
import React, { useState, useCallback, useMemo } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, push, set, query, orderByChild, equalTo, get } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { CalendarDatePickerModal } from '../../../../src/components/ui/CalendarDatePickerModal';
import { uploadImageToCloudinary } from '../../../../src/lib/upload/cloudinary';

interface CategoryItem {
  id: string;
  name: string;
}

interface ProductCard {
  id: string;
  productName: string;
  description: string;
  selectedCategory: string;
  price: string;
  quantity: string;
  productSize: string;
  selectedUnit: string;
  expiryDate: string;
  selectedImage: string | null;
}

const AddProductScreen = () => {
  // Product cards state - multiple products
  const [productCards, setProductCards] = useState<ProductCard[]>([
    createEmptyProduct(),
  ]);

  // Modal states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentEditingCardId, setCurrentEditingCardId] = useState<string | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState({ current: 0, total: 0 });

  // Create empty product
  function createEmptyProduct(): ProductCard {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      productName: '',
      description: '',
      selectedCategory: '',
      price: '',
      quantity: '',
      productSize: '',
      selectedUnit: '',
      expiryDate: '',
      selectedImage: null,
    };
  }

  // Product categories - Matching customer side (10 categories)
  const categories: CategoryItem[] = [
    { id: '1', name: 'Fruits & Vegetables' },
    { id: '2', name: 'Dairy & Bakery' },
    { id: '3', name: 'Snacks & Sweets' },
    { id: '4', name: 'Beverages' },
    { id: '5', name: 'Personal & Baby Care' },
    { id: '6', name: 'Home & Kitchen' },
    { id: '7', name: 'Staple Foods' },
    { id: '8', name: 'Condiments & Cooking' },
    { id: '9', name: 'Frozen Goods' },
    { id: '10', name: 'Miscellaneous & Others' },
  ];

  // Common units for sari-sari store products
  const units: CategoryItem[] = [
    { id: '1', name: 'pcs' },
    { id: '2', name: 'pack' },
    { id: '3', name: 'box' },
    { id: '4', name: 'bottle' },
    { id: '5', name: 'can' },
    { id: '6', name: 'sachet' },
    { id: '7', name: 'g' },
    { id: '8', name: 'kg' },
    { id: '9', name: 'ml' },
    { id: '10', name: 'L' },
    { id: '11', name: 'meter' },
    { id: '12', name: 'cm' },
  ];

  // Helper function: Format product name
  const formatProductName = (name: string): string => {
    return name
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function: Format price
  const formatPrice = (price: number): number => {
    return Math.round(price * 100) / 100;
  };

  const handleBack = () => {
    if (productCards.some(p => p.productName || p.selectedImage)) {
      Alert.alert(
        'Discard Products?',
        'You have unsaved products. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  // Update a specific product card field
  const updateProductCard = (cardId: string, field: keyof ProductCard, value: string | null) => {
    setProductCards(cards =>
      cards.map(card =>
        card.id === cardId ? { ...card, [field]: value } : card
      )
    );
  };

  // Add new product card
  const handleAddNewProductCard = () => {
    setProductCards([...productCards, createEmptyProduct()]);
  };

  // Remove product card
  const handleRemoveProductCard = (cardId: string) => {
    if (productCards.length === 1) {
      Alert.alert('Cannot Remove', 'You need at least one product card.');
      return;
    }
    setProductCards(cards => cards.filter(card => card.id !== cardId));
  };

  // Handle image upload for a specific card
  const handleUploadImage = async (cardId: string) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateProductCard(cardId, 'selectedImage', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: CategoryItem) => {
    if (currentEditingCardId) {
      updateProductCard(currentEditingCardId, 'selectedCategory', category.name);
    }
    setShowCategoryDropdown(false);
    setCurrentEditingCardId(null);
  };

  // Handle unit selection
  const handleUnitSelect = (unit: CategoryItem) => {
    if (currentEditingCardId) {
      updateProductCard(currentEditingCardId, 'selectedUnit', unit.name);
    }
    setShowUnitDropdown(false);
    setCurrentEditingCardId(null);
  };

  // Handle date picker
  const handleExpiryConfirm = (date: Date) => {
    if (currentEditingCardId) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${month}/${day}/${year}`;
      updateProductCard(currentEditingCardId, 'expiryDate', formattedDate);
    }
    setShowDatePicker(false);
    setCurrentEditingCardId(null);
  };

  const handleExpiryClear = () => {
    if (currentEditingCardId) {
      updateProductCard(currentEditingCardId, 'expiryDate', '');
    }
    setShowDatePicker(false);
    setCurrentEditingCardId(null);
  };

  const expiryMinDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Validate a single product
  const validateProduct = (product: ProductCard): { valid: boolean; error?: string } => {
    if (!product.productName.trim()) {
      return { valid: false, error: 'Product name is required' };
    }
    if (product.productName.trim().length < 2) {
      return { valid: false, error: 'Product name must be at least 2 characters' };
    }
    if (!product.description.trim()) {
      return { valid: false, error: 'Description is required' };
    }
    if (!product.selectedCategory) {
      return { valid: false, error: 'Category is required' };
    }

    const priceNum = Number(product.price);
    if (!product.price.trim() || isNaN(priceNum) || priceNum <= 0) {
      return { valid: false, error: 'Valid price is required' };
    }

    const quantityNum = Number(product.quantity);
    if (!product.quantity.trim() || isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
      return { valid: false, error: 'Valid quantity (whole number) is required' };
    }

    if (!product.productSize.trim()) {
      return { valid: false, error: 'Size is required' };
    }
    if (!product.selectedUnit) {
      return { valid: false, error: 'Unit is required' };
    }
    if (!product.selectedImage) {
      return { valid: false, error: 'Product image is required' };
    }

    return { valid: true };
  };

  // Save all products
  const handleSaveAllProducts = async () => {
    if (isSaving) return;

    // Filter out empty cards
    const productsToSave = productCards.filter(p =>
      p.productName.trim() || p.selectedImage || p.description.trim()
    );

    if (productsToSave.length === 0) {
      Alert.alert('No Products', 'Please add at least one product with details.');
      return;
    }

    // Validate all products
    for (let i = 0; i < productsToSave.length; i++) {
      const validation = validateProduct(productsToSave[i]);
      if (!validation.valid) {
        Alert.alert(
          `Product #${i + 1} Error`,
          `${productsToSave[i].productName || 'Unnamed product'}: ${validation.error}`
        );
        return;
      }
    }

    setIsSaving(true);
    setSavingProgress({ current: 0, total: productsToSave.length });

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        setIsSaving(false);
        return;
      }

      // Fetch store info
      const storeRef = ref(database, `stores/${currentUser.uid}`);
      const storeSnapshot = await get(storeRef);
      let storeName = 'My Store';
      let storeOwnerName = 'Store Owner';

      if (storeSnapshot.exists()) {
        const storeData = storeSnapshot.val();
        storeName = storeData.storeName || storeData.businessInfo?.storeName || 'My Store';
        storeOwnerName = storeData.ownerName || storeData.personalInfo?.fullName || 'Store Owner';
      }

      // Get existing products for duplicate check
      const productsRef = ref(database, 'products');
      const storeProductsQuery = query(
        productsRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );
      const existingSnapshot = await get(storeProductsQuery);
      const existingProducts = existingSnapshot.exists() ? Object.values(existingSnapshot.val()) : [];

      let savedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < productsToSave.length; i++) {
        const product = productsToSave[i];
        setSavingProgress({ current: i + 1, total: productsToSave.length });

        try {
          // Check for duplicate
          const isDuplicate = (existingProducts as any[]).some((existing: any) => {
            const sameName = existing.productName?.toLowerCase().trim() === product.productName.toLowerCase().trim();
            const sameSize = existing.productSize?.toLowerCase().trim() === product.productSize.toLowerCase().trim();
            const sameUnit = existing.unit?.toLowerCase() === product.selectedUnit.toLowerCase();
            return sameName && sameSize && sameUnit;
          });

          if (isDuplicate) {
            errors.push(`${product.productName} (${product.productSize}${product.selectedUnit}) already exists`);
            continue;
          }

          // Upload image
          const productImageUrl = await uploadImageToCloudinary(product.selectedImage!, 'products');

          // Prepare expiry date
          let expiryDateISO = null;
          if (product.expiryDate.trim()) {
            const parts = product.expiryDate.trim().split('/');
            if (parts.length === 3) {
              const month = parseInt(parts[0], 10) - 1;
              const day = parseInt(parts[1], 10);
              const year = parseInt(parts[2], 10);
              const dateObj = new Date(year, month, day);
              expiryDateISO = dateObj.toISOString();
            }
          }

          // Prepare product data
          const productData = {
            productName: formatProductName(product.productName),
            description: product.description.trim(),
            category: product.selectedCategory,
            price: formatPrice(Number(product.price)),
            quantity: Math.floor(Number(product.quantity)),
            productSize: product.productSize.trim(),
            unit: product.selectedUnit,
            expiryDate: expiryDateISO,
            productImageUrl,
            storeOwnerId: currentUser.uid,
            storeId: currentUser.uid,
            storeName,
            storeOwnerName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'available',
          };

          // Save to Firebase
          const newProductRef = push(productsRef);
          await set(newProductRef, productData);
          savedCount++;

          // Add to existing products list to prevent duplicates in same batch
          existingProducts.push(productData);

        } catch (error) {
          console.error(`Error saving product ${product.productName}:`, error);
          errors.push(`Failed to save ${product.productName}`);
        }
      }

      // Show results
      if (savedCount > 0 && errors.length === 0) {
        Alert.alert(
          'Success',
          `${savedCount} product${savedCount > 1 ? 's' : ''} added successfully!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else if (savedCount > 0 && errors.length > 0) {
        Alert.alert(
          'Partial Success',
          `${savedCount} product${savedCount > 1 ? 's' : ''} added.\n\nErrors:\n${errors.join('\n')}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', `Failed to add products:\n${errors.join('\n')}`);
      }

    } catch (error) {
      console.error('Error saving products:', error);
      Alert.alert('Error', 'Failed to save products. Please try again.');
    } finally {
      setIsSaving(false);
      setSavingProgress({ current: 0, total: 0 });
    }
  };

  // Render a single product card with horizontal scroll sections
  const renderProductCard = (product: ProductCard, index: number) => {
    return (
      <View key={product.id} style={styles.productCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIndexBadge}>
            <Text style={styles.cardIndexText}>#{index + 1}</Text>
          </View>
          <Text style={styles.cardTitle}>Product Details</Text>
          {productCards.length > 1 && (
            <TouchableOpacity
              style={styles.removeCardButton}
              onPress={() => handleRemoveProductCard(product.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeCardIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Scroll Sections */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          pagingEnabled={false}
          contentContainerStyle={styles.horizontalSectionsContent}
          style={styles.horizontalSections}
        >
          {/* SECTION 1: Image, Name, Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>

            {/* Upload Image */}
            <TouchableOpacity
              style={styles.uploadContainer}
              onPress={() => handleUploadImage(product.id)}
              activeOpacity={0.7}
            >
              {product.selectedImage ? (
                <Image source={{ uri: product.selectedImage }} style={styles.selectedImagePreview} />
              ) : (
                <>
                  <Image
                    source={require('../../../../src/assets/images/add-product/upload-icon.png')}
                    style={styles.uploadIcon}
                  />
                  <Text style={styles.uploadText}>Upload Image</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Product Name */}
            <Text style={styles.fieldLabel}>Product Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter product name"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={product.productName}
                onChangeText={(text) => updateProductCard(product.id, 'productName', text)}
              />
            </View>

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            <View style={[styles.inputContainer, styles.descriptionContainer]}>
              <TextInput
                style={[styles.textInput, styles.descriptionInput]}
                placeholder="Enter description"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={product.description}
                onChangeText={(text) => updateProductCard(product.id, 'description', text)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* SECTION 2: Category, Price, Quantity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing & Stock</Text>

            {/* Category */}
            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                setCurrentEditingCardId(product.id);
                setShowCategoryDropdown(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, product.selectedCategory && styles.dropdownTextSelected]}>
                {product.selectedCategory || 'Select category'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {/* Price & Quantity Row */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Price</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.pesoSign}>₱</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={product.price}
                    onChangeText={(text) => updateProductCard(product.id, 'price', text)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Quantity</Text>
                <View style={styles.inputContainerSmall}>
                  <TextInput
                    style={styles.textInputSmall}
                    placeholder="0"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={product.quantity}
                    onChangeText={(text) => updateProductCard(product.id, 'quantity', text)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            {/* Size & Unit Row */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Size</Text>
                <View style={styles.inputContainerSmall}>
                  <TextInput
                    style={styles.textInputSmall}
                    placeholder="e.g. 500"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={product.productSize}
                    onChangeText={(text) => updateProductCard(product.id, 'productSize', text)}
                  />
                </View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Unit</Text>
                <TouchableOpacity
                  style={styles.dropdownContainerSmall}
                  onPress={() => {
                    setCurrentEditingCardId(product.id);
                    setShowUnitDropdown(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownTextSmall, product.selectedUnit && styles.dropdownTextSelected]}>
                    {product.selectedUnit || 'Unit'}
                  </Text>
                  <Text style={styles.dropdownArrowSmall}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expiry Date */}
            <Text style={styles.fieldLabel}>Expiry Date (Optional)</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                setCurrentEditingCardId(product.id);
                setShowDatePicker(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, product.expiryDate && styles.dropdownTextSelected]}>
                {product.expiryDate || 'MM/DD/YYYY'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Scroll Indicator */}
        <View style={styles.scrollIndicator}>
          <Text style={styles.scrollIndicatorText}>← Swipe for more fields →</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/add-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Add Products</Text>
        <View style={styles.productCountBadge}>
          <Text style={styles.productCountText}>{productCards.length}</Text>
        </View>
      </View>

      {/* Product Cards */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {productCards.map((product, index) => renderProductCard(product, index))}

        {/* Add Another Product Button */}
        <TouchableOpacity
          style={styles.addAnotherButton}
          onPress={handleAddNewProductCard}
          activeOpacity={0.7}
        >
          <View style={styles.addAnotherIcon}>
            <Text style={styles.addAnotherIconText}>+</Text>
          </View>
          <Text style={styles.addAnotherText}>Add Another Product</Text>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Save All Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveAllProducts}
          activeOpacity={0.7}
          disabled={isSaving}
        >
          {isSaving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.saveButtonText}>
                Saving {savingProgress.current}/{savingProgress.total}...
              </Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>
              Save {productCards.filter(p => p.productName.trim()).length} Product{productCards.filter(p => p.productName.trim()).length !== 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>

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
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowCategoryDropdown(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.dropdownTitle}>Select Category</Text>
            <ScrollView style={styles.categoryScrollView} showsVerticalScrollIndicator={true}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryOption}
                  onPress={() => handleCategorySelect(category)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryOptionText}>{category.name}</Text>
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
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowUnitDropdown(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.dropdownTitle}>Select Unit</Text>
            <ScrollView style={styles.categoryScrollView} showsVerticalScrollIndicator={true}>
              {units.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={styles.categoryOption}
                  onPress={() => handleUnitSelect(unit)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryOptionText}>{unit.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
      <CalendarDatePickerModal
        visible={showDatePicker}
        onClose={() => {
          setShowDatePicker(false);
          setCurrentEditingCardId(null);
        }}
        onConfirm={handleExpiryConfirm}
        onClear={handleExpiryClear}
        initialDate={null}
        minDate={expiryMinDate}
        title="Select Expiry Date"
        description="Choose the expiry date for this product"
        infoText="Select any future date for the product expiry"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingTop: vs(50),
    paddingBottom: vs(15),
    backgroundColor: Colors.backgroundGray,
  },

  backButton: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  backIcon: {
    width: s(15),
    height: vs(15),
  },

  title: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.darkGray,
    textAlign: 'center',
    marginHorizontal: s(10),
  },

  productCountBadge: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  productCountText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(14),
    color: Colors.white,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(100),
  },

  // Product Card
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    backgroundColor: Colors.primary,
  },

  cardIndexBadge: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(10),
  },

  cardIndexText: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(12),
    color: Colors.white,
  },

  cardTitle: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.white,
  },

  removeCardButton: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeCardIcon: {
    fontSize: ms(14),
    color: Colors.white,
    fontWeight: '700',
  },

  // Horizontal Sections
  horizontalSections: {
    flexGrow: 0,
  },

  horizontalSectionsContent: {
    paddingHorizontal: s(5),
  },

  section: {
    width: s(340),
    padding: s(15),
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.primary,
    marginBottom: vs(15),
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: vs(5),
  },

  // Scroll Indicator
  scrollIndicator: {
    paddingVertical: vs(8),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },

  scrollIndicatorText: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: 'rgba(30, 30, 30, 0.4)',
  },

  // Upload Container
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

  uploadIcon: {
    width: s(25),
    height: vs(25),
    marginBottom: vs(8),
    tintColor: Colors.primary,
  },

  uploadText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.5)',
  },

  selectedImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: s(13),
    resizeMode: 'cover',
  },

  // Field Labels
  fieldLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(13),
    color: Colors.darkGray,
    marginBottom: vs(6),
  },

  // Input Container
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

  descriptionContainer: {
    minHeight: vs(80),
  },

  descriptionInput: {
    minHeight: vs(60),
    textAlignVertical: 'top',
  },

  // Dropdown Container
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

  // Row Fields
  rowFields: {
    flexDirection: 'row',
    gap: s(10),
  },

  halfField: {
    flex: 1,
  },

  inputContainerSmall: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(10),
    paddingVertical: vs(10),
    marginBottom: vs(12),
  },

  textInputSmall: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
    textAlign: 'center',
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

  dropdownContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(10),
    paddingVertical: vs(12),
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

  // Add Another Button
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(15),
    paddingVertical: vs(20),
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },

  addAnotherIcon: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(10),
  },

  addAnotherIconText: {
    fontSize: ms(20),
    color: Colors.white,
    fontWeight: '700',
  },

  addAnotherText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.primary,
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(20),
  },

  // Save Button
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingVertical: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  saveButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.6)',
  },

  saveButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.white,
  },

  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
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
    width: s(340),
    maxHeight: '70%',
    padding: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },

  closeModalButton: {
    position: 'absolute',
    top: s(15),
    right: s(15),
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  closeModalButtonText: {
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.darkGray,
  },

  dropdownTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: vs(20),
  },

  categoryScrollView: {
    maxHeight: vs(400),
  },

  categoryOption: {
    paddingVertical: vs(15),
    paddingHorizontal: s(15),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  categoryOptionText: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    color: Colors.darkGray,
  },
});

export default AddProductScreen;
