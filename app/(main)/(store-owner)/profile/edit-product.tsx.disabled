import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
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
import * as FileSystem from 'expo-file-system';
import { ref, get, update } from 'firebase/database';
import { uploadImageToCloudinary } from '../../../../src/lib/upload/cloudinary';
import { database, auth } from '../../../../FirebaseConfig';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';

interface CategoryItem {
  id: string;
  name: string;
}

const EditProductScreen = () => {
  const params = useLocalSearchParams();
  const productId = params.productId as string;

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productSize, setProductSize] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function: Format product name (Capitalize first letter of each word)
  const formatProductName = (name: string): string => {
    return name
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function: Format price to 2 decimal places
  const formatPrice = (price: number): number => {
    return Math.round(price * 100) / 100;
  };

  // Memoized handlers to prevent keyboard issues
  const handleProductNameChange = useCallback((text: string) => {
    setProductName(text);
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);
  }, []);

  const handlePriceChange = useCallback((text: string) => {
    setPrice(text);
  }, []);

  const handleQuantityChange = useCallback((text: string) => {
    setQuantity(text);
  }, []);

  const handleProductSizeChange = useCallback((text: string) => {
    setProductSize(text);
  }, []);

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

  // Fetch existing product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productRef = ref(database, `products/${productId}`);
        const snapshot = await get(productRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setProductName(data.productName || '');
          setDescription(data.description || '');
          setSelectedCategory(data.category || '');
          setPrice(data.price?.toString() || '');
          setQuantity(data.quantity?.toString() || '');
          setProductSize(data.productSize || '');
          setSelectedUnit(data.unit || '');
          setSelectedImage(data.productImage || null);
        } else {
          Alert.alert('Error', 'Product not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to load product data');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    } else {
      Alert.alert('Error', 'No product ID provided');
      router.back();
    }
  }, [productId]);

  const handleBack = () => {
    router.back();
  };

  const handleUploadImage = async () => {
    try {
      // Request camera roll permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Show uploading indicator
        Alert.alert('Uploading...', 'Please wait while we upload your image to the cloud.');

        try {
          // Upload to Cloudinary
          const cloudinaryUrl = await uploadImageToCloudinary(
            imageUri,
            `products/${auth.currentUser?.uid}`
          );

          setSelectedImage(cloudinaryUrl);
          console.log('✅ Image uploaded to Cloudinary:', cloudinaryUrl);
          
          Alert.alert('Success', 'Product image uploaded successfully!');
        } catch (uploadError) {
          console.error('❌ Error uploading to Cloudinary:', uploadError);
          Alert.alert(
            'Upload Failed',
            'Failed to upload image to cloud. Please check your internet connection and try again.'
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleCategorySelect = (category: CategoryItem) => {
    setSelectedCategory(category.name);
    setShowCategoryDropdown(false);
  };

  const handleCategoryDropdownOpen = () => {
    setShowCategoryDropdown(true);
  };

  const handleUnitSelect = (unit: CategoryItem) => {
    setSelectedUnit(unit.name);
    setShowUnitDropdown(false);
  };

  const handleUnitDropdownOpen = () => {
    setShowUnitDropdown(true);
  };

  const handleUpdateProduct = async () => {
    // Prevent double-click
    if (isSaving) return;

    try {
      setIsSaving(true);

      // ========================================
      // 1. PRODUCT NAME VALIDATION
      // ========================================
      if (!productName.trim()) {
        Alert.alert('Error', 'Please enter a product name');
        return;
      }
      if (productName.trim().length < 2) {
        Alert.alert('Error', 'Product name must be at least 2 characters');
        return;
      }
      if (productName.trim().length > 100) {
        Alert.alert('Error', 'Product name cannot exceed 100 characters');
        return;
      }

      // ========================================
      // 2. DESCRIPTION VALIDATION
      // ========================================
      if (!description.trim()) {
        Alert.alert('Error', 'Please enter a product description');
        return;
      }

      // ========================================
      // 3. CATEGORY VALIDATION
      // ========================================
      if (!selectedCategory) {
        Alert.alert('Error', 'Please select a product category');
        return;
      }

      // ========================================
      // 4. PRICE VALIDATION
      // ========================================
      const priceNum = Number(price);
      if (!price.trim() || isNaN(priceNum)) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }
      if (priceNum <= 0) {
        Alert.alert('Error', 'Price must be greater than ₱0');
        return;
      }
      if (priceNum > 999999) {
        Alert.alert('Error', 'Price cannot exceed ₱999,999');
        return;
      }
      if (price.includes('.') && price.split('.')[1].length > 2) {
        Alert.alert('Error', 'Price can only have up to 2 decimal places (e.g., ₱12.50)');
        return;
      }

      // ========================================
      // 5. QUANTITY VALIDATION
      // ========================================
      const quantityNum = Number(quantity);
      if (!quantity.trim() || isNaN(quantityNum)) {
        Alert.alert('Error', 'Please enter a valid quantity');
        return;
      }
      if (quantityNum <= 0) {
        Alert.alert('Error', 'Quantity must be greater than 0');
        return;
      }
      if (!Number.isInteger(quantityNum)) {
        Alert.alert('Error', 'Quantity must be a whole number (no decimals like 10.5)');
        return;
      }
      if (quantityNum > 99999) {
        Alert.alert('Error', 'Quantity cannot exceed 99,999');
        return;
      }

      // ========================================
      // 6. SIZE & UNIT VALIDATION
      // ========================================
      if (!productSize.trim()) {
        Alert.alert('Error', 'Please enter a product size');
        return;
      }
      if (!selectedUnit) {
        Alert.alert('Error', 'Please select a unit');
        return;
      }

      // ========================================
      // 7. IMAGE VALIDATION
      // ========================================
      if (!selectedImage) {
        Alert.alert('Error', 'Please select a product image');
        return;
      }

      // ========================================
      // 8. USER AUTHENTICATION CHECK
      // ========================================
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // ========================================
      // 9. FETCH STORE INFO
      // ========================================
      console.log('📍 Fetching store information...');
      const storeRef = ref(database, `stores/${currentUser.uid}`);
      const storeSnapshot = await get(storeRef);

      let storeName = 'My Store';
      let storeOwnerName = 'Store Owner';

      if (storeSnapshot.exists()) {
        const storeData = storeSnapshot.val();
        storeName = storeData.storeName || storeData.businessInfo?.storeName || 'My Store';
        storeOwnerName = storeData.ownerName || storeData.personalInfo?.fullName || 'Store Owner';
        console.log('✅ Store info fetched:', storeName, '-', storeOwnerName);
      } else {
        console.log('⚠️ Store not found, using defaults');
      }

      // ========================================
      // 10. FORMAT DATA
      // ========================================
      const formattedProductName = formatProductName(productName);
      const formattedPrice = formatPrice(priceNum);
      const formattedQuantity = Math.floor(quantityNum);

      console.log('📝 Formatted data:');
      console.log('  - Name:', formattedProductName);
      console.log('  - Price: ₱', formattedPrice);
      console.log('  - Quantity:', formattedQuantity);

      // ========================================
      // 11. PREPARE UPDATE DATA
      // ========================================
      const updateData = {
        productName: formattedProductName,
        description: description.trim(),
        category: selectedCategory,
        price: formattedPrice,
        quantity: formattedQuantity,
        productSize: productSize.trim(),
        unit: selectedUnit,
        productImage: selectedImage,  // Legacy field for backward compatibility
        productImageUrl: selectedImage?.startsWith('https://res.cloudinary.com/') ? selectedImage : undefined, // NEW: Cloudinary URL
        storeId: currentUser.uid,
        storeName: storeName,
        storeOwnerName: storeOwnerName,
        updatedAt: new Date().toISOString(),
      };

      console.log('🏪 Store Info:', storeName, 'by', storeOwnerName);

      // ========================================
      // 12. UPDATE IN FIREBASE
      // ========================================
      console.log('💾 Updating product in Firebase...');
      const productRef = ref(database, `products/${productId}`);
      await update(productRef, updateData);

      console.log('✅ Product updated successfully:', updateData.productName);

      // ========================================
      // 13. SUCCESS FEEDBACK
      // ========================================
      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error('❌ Error updating product:', error);
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/add-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Edit Product</Text>

        {/* Upload Image Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>Product Image</Text>

          <TouchableOpacity style={styles.uploadContainer} onPress={handleUploadImage} activeOpacity={0.7}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
            ) : (
              <>
                <Image
                  source={require('../../../../src/assets/images/add-product/upload-icon.png')}
                  style={styles.uploadIcon}
                />
                <Text style={styles.uploadText}>Upload your photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Product Name Section */}
        <View style={[styles.inputSection, { top: vs(342) }]}>
          <Text style={styles.inputLabel}>Product Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter product name"
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={productName}
              onChangeText={handleProductNameChange}
            />
          </View>
        </View>

        {/* Description Section */}
        <View style={[styles.inputSection, { top: vs(460) }]}>
          <Text style={styles.inputLabel}>Description</Text>
          <View style={[styles.inputContainer, styles.descriptionContainer]}>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Enter product description"
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Product Category Section */}
        <View style={[styles.inputSection, { top: vs(650) }]}>
          <Text style={styles.inputLabel}>Product Category</Text>
          <TouchableOpacity style={styles.categoryContainer} onPress={handleCategoryDropdownOpen} activeOpacity={0.7}>
            <Text style={[styles.categoryText, selectedCategory && { color: Colors.darkGray }]}>
              {selectedCategory || 'Select product category'}
            </Text>
            <Image
              source={require('../../../../src/assets/images/add-product/forward-arrow.png')}
              style={styles.forwardArrow}
            />
          </TouchableOpacity>
        </View>

        {/* Price and Quantity Row */}
        <View style={styles.rowContainer}>
          <View style={styles.halfInputSection}>
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.halfInputContainer}>
              <TextInput
                style={[styles.textInput, styles.halfTextInput]}
                placeholder="₱0.00"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={price}
                onChangeText={handlePriceChange}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.halfInputSection}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.halfInputContainer}>
              <TextInput
                style={[styles.textInput, styles.halfTextInput]}
                placeholder="0"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Size and Unit Row */}
        <View style={styles.sizeRowContainer}>
          <View style={styles.halfInputSection}>
            <Text style={styles.inputLabel}>Size</Text>
            <View style={styles.halfInputContainer}>
              <TextInput
                style={[styles.textInput, styles.halfTextInput]}
                placeholder="Enter size"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={productSize}
                onChangeText={handleProductSizeChange}
                keyboardType="default"
              />
            </View>
          </View>

          <View style={styles.halfInputSection}>
            <Text style={styles.inputLabel}>Unit</Text>
            <TouchableOpacity style={styles.unitContainer} onPress={handleUnitDropdownOpen} activeOpacity={0.7}>
              <Text style={[styles.unitText, selectedUnit && { color: Colors.darkGray }]}>
                {selectedUnit || 'Select unit'}
              </Text>
              <Image
                source={require('../../../../src/assets/images/add-product/forward-arrow.png')}
                style={styles.unitArrow}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Update Product Button */}
        <TouchableOpacity
          style={[styles.addButton, isSaving && styles.addButtonDisabled]}
          onPress={handleUpdateProduct}
          activeOpacity={0.7}
          disabled={isSaving}
        >
          <Text style={styles.addButtonText}>
            {isSaving ? 'Updating Product...' : 'Update Product'}
          </Text>
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
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowCategoryDropdown(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.dropdownTitle}>Select Category</Text>
            <ScrollView
              style={styles.categoryScrollView}
              showsVerticalScrollIndicator={true}
            >
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
            <ScrollView
              style={styles.categoryScrollView}
              showsVerticalScrollIndicator={true}
            >
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: vs(20),
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: Colors.darkGray,
  },

  scrollContent: {
    height: vs(1060),
    paddingBottom: vs(50),
  },

  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(79),
    width: s(30),
    height: vs(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  backIcon: {
    width: s(15),
    height: vs(15),
  },

  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: vs(83),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '700',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  uploadSection: {
    position: 'absolute',
    left: s(22),
    top: vs(145),
    width: s(398),
    height: vs(177),
  },

  uploadLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(16),
    lineHeight: vs(22),
    color: Colors.black,
    marginBottom: vs(5),
  },

  uploadContainer: {
    width: s(398),
    height: vs(150),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  uploadIcon: {
    width: s(25),
    height: vs(25),
    marginBottom: vs(8),
  },

  uploadText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    fontSize: ms(12),
    lineHeight: vs(22),
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },

  selectedImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: s(20),
    resizeMode: 'cover',
  },

  inputSection: {
    position: 'absolute',
    left: s(20),
    width: s(400),
  },

  inputLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(16),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  inputContainer: {
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(20),
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingVertical: vs(14),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  textInput: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(14),
    lineHeight: vs(22),
    color: '#1E1E1E',
    textAlignVertical: 'top',
  },

  descriptionContainer: {
    height: vs(146),
  },

  descriptionInput: {
    minHeight: vs(130),
    textAlignVertical: 'top',
    paddingTop: vs(5),
  },

  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(20),
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingVertical: vs(14),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  categoryText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(14),
    lineHeight: vs(22),
    color: 'rgba(30, 30, 30, 0.5)',
    flex: 1,
  },

  forwardArrow: {
    width: s(30),
    height: vs(30),
  },

  rowContainer: {
    position: 'absolute',
    left: s(20),
    top: vs(747),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: s(400),
  },

  halfInputSection: {
    width: s(192),
  },

  halfInputContainer: {
    width: s(180),
    height: vs(50),
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(20),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: s(0),
    paddingVertical: vs(0),
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  halfTextInput: {
    textAlign: 'left',
    textAlignVertical: 'center',
    color: '#000000',
    fontWeight: '600',
    backgroundColor: 'transparent',
    fontSize: ms(16),
    height: vs(50),
    width: '100%',
    paddingHorizontal: s(15),
    paddingVertical: 0,
    margin: 0,
  },

  sizeRowContainer: {
    position: 'absolute',
    left: s(20),
    top: vs(844),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: s(400),
  },

  unitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: s(180),
    height: vs(50),
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(20),
    backgroundColor: Colors.white,
    paddingHorizontal: s(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  unitText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(14),
    lineHeight: vs(22),
    color: 'rgba(30, 30, 30, 0.5)',
    flex: 1,
  },

  unitArrow: {
    width: s(20),
    height: vs(20),
  },

  addButton: {
    position: 'absolute',
    left: s(20),
    top: vs(961),
    width: s(400),
    height: vs(50),
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  addButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.white,
    textAlign: 'center',
  },

  addButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
    opacity: 0.7,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dropdownModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: s(380),
    maxHeight: '70%',
    padding: s(20),
    paddingBottom: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    marginHorizontal: s(20),
  },

  categoryScrollView: {
    maxHeight: vs(500),
  },

  dropdownTitle: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(20),
    lineHeight: vs(24),
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: vs(25),
  },

  categoryOption: {
    paddingVertical: vs(18),
    paddingHorizontal: s(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 30, 30, 0.08)',
    borderRadius: s(8),
    marginBottom: vs(2),
  },

  categoryOptionText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(16),
    lineHeight: vs(22),
    color: Colors.darkGray,
    textAlign: 'left',
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
});

export default EditProductScreen;
