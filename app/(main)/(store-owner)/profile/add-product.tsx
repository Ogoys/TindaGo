import { router } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ref, push, set } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs } from '../../../../src/constants/responsive';

interface CategoryItem {
  id: string;
  name: string;
}

const AddProductScreen = () => {
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

  // Product categories as specified by user
  const categories: CategoryItem[] = [
    { id: '1', name: 'Fruit & Vegetable' },
    { id: '2', name: 'Dairy & Bakery' },
    { id: '3', name: 'Snacks' },
    { id: '4', name: 'Beverages' },
    { id: '5', name: 'Home & Kitchen' },
    { id: '6', name: 'Home Care' },
    { id: '7', name: 'Baby Care' },
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
        mediaTypes: ['images'], // Modern syntax: array of strings (lowercase)
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for product images
        quality: 0.8, // Reduce quality to keep Base64 size manageable
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Convert image to Base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64, // Legacy API format
        });

        // Create the data URL format
        const imageBase64 = `data:image/jpeg;base64,${base64}`;
        setSelectedImage(imageBase64);

        console.log('Image selected and converted to Base64');
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

  const handleAddProduct = async () => {
    try {
      // Validation
      if (!productName.trim()) {
        Alert.alert('Error', 'Please enter a product name');
        return;
      }
      if (!description.trim()) {
        Alert.alert('Error', 'Please enter a product description');
        return;
      }
      if (!selectedCategory) {
        Alert.alert('Error', 'Please select a product category');
        return;
      }
      if (!price.trim() || isNaN(Number(price))) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }
      if (!quantity.trim() || isNaN(Number(quantity))) {
        Alert.alert('Error', 'Please enter a valid quantity');
        return;
      }
      if (!productSize.trim()) {
        Alert.alert('Error', 'Please enter a product size');
        return;
      }
      if (!selectedUnit) {
        Alert.alert('Error', 'Please select a unit');
        return;
      }
      if (!selectedImage) {
        Alert.alert('Error', 'Please select a product image');
        return;
      }

      // Get current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Prepare product data
      const productData = {
        productName: productName.trim(),
        description: description.trim(),
        category: selectedCategory,
        price: Number(price),
        quantity: Number(quantity),
        productSize: productSize.trim(),
        unit: selectedUnit,
        productImage: selectedImage, // Base64 string
        storeOwnerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      // Save to Firebase Realtime Database
      const productsRef = ref(database, 'products');
      const newProductRef = push(productsRef);
      await set(newProductRef, productData);

      console.log('Product saved to Firebase:', productData);

      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Bar - Figma: 9:41 AM status */}
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Time Display - Figma: x: 51.92, y: 18.34, font: ABeeZee 400, size: 17 */}
      <Text style={styles.timeText}>9:41</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
      >
        {/* Back Button - Figma: x: 20, y: 79, width: 30, height: 30 */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Image
            source={require('../../../../src/assets/images/add-product/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        {/* Title - Figma: x: 161, y: 83, font: Clash Grotesk 600, size: 20 */}
        <Text style={styles.title}>Add Product</Text>

        {/* Upload Image Section - Figma: x: 22, y: 145, width: 398, height: 177 */}
        <View style={styles.uploadSection}>
          {/* Upload Image Label - Figma: x: 24, y: 145, font: Clash Grotesk 500, size: 16 */}
          <Text style={styles.uploadLabel}>Upload Image</Text>

          {/* Upload Container - Figma: x: 22, y: 172, width: 398, height: 150 */}
          <TouchableOpacity style={styles.uploadContainer} onPress={handleUploadImage} activeOpacity={0.7}>
            {selectedImage ? (
              /* Selected Image Preview */
              <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
            ) : (
              /* Upload Placeholder */
              <>
                {/* Upload Icon - Figma: x: 207, y: 223, width: 25, height: 25 */}
                <Image
                  source={require('../../../../src/assets/images/add-product/upload-icon.png')}
                  style={styles.uploadIcon}
                />
                {/* Upload Text - Figma: x: 172, y: 248, font: Clash Grotesk 400, size: 12 */}
                <Text style={styles.uploadText}>Upload your photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Product Name Section - Figma: x: 20, y: 342, width: 400 */}
        <View style={[styles.inputSection, { top: vs(342) }]}>
          <Text style={styles.inputLabel}>Product Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter product name"
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={productName}
              onChangeText={setProductName}
            />
          </View>
        </View>

        {/* Description Section - Figma: x: 20, y: 439, width: 400 */}
        <View style={[styles.inputSection, { top: vs(460) }]}>
          <Text style={styles.inputLabel}>Description</Text>
          <View style={[styles.inputContainer, styles.descriptionContainer]}>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Enter product description"
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Product Category Section - Figma: x: 20, y: 636, width: 400 */}
        <View style={[styles.inputSection, { top: vs(650) }]}>
          <Text style={styles.inputLabel}>Product Category</Text>
          <TouchableOpacity style={styles.categoryContainer} onPress={handleCategoryDropdownOpen} activeOpacity={0.7}>
            <Text style={[styles.categoryText, selectedCategory && { color: Colors.darkGray }]}>
              {selectedCategory || 'Select product category'}
            </Text>
            {/* Forward Arrow - Figma: width: 30, height: 30 */}
            <Image
              source={require('../../../../src/assets/images/add-product/forward-arrow.png')}
              style={styles.forwardArrow}
            />
          </TouchableOpacity>
        </View>

        {/* Price and Quantity Row - Figma: y: 733 */}
        <View style={styles.rowContainer}>
          {/* Price Section - Figma: x: 20, width: 192 */}
          <View style={styles.halfInputSection}>
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.halfInputContainer}>
              <TextInput
                style={[styles.textInput, styles.halfTextInput]}
                placeholder="₱0.00"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Quantity Section - Figma: x: 228, width: 192 */}
          <View style={styles.halfInputSection}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.halfInputContainer}>
              <TextInput
                style={[styles.textInput, styles.halfTextInput]}
                placeholder="0"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Size and Unit Row */}
        <View style={styles.sizeRowContainer}>
          {/* Size Section */}
          <View style={styles.halfInputSection}>
            <Text style={styles.inputLabel}>Size</Text>
            <View style={styles.halfInputContainer}>
              <TextInput
                style={[styles.textInput, styles.halfTextInput]}
                placeholder="Enter size"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={productSize}
                onChangeText={setProductSize}
                keyboardType="default"
              />
            </View>
          </View>

          {/* Unit Section */}
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

        {/* Add Product Button - Figma: x: 20, y: 850, width: 400, height: 50 */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct} activeOpacity={0.7}>
          <Text style={styles.addButtonText}>Add Product</Text>
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
            <Text style={styles.dropdownTitle}>Select Category</Text>
            <ScrollView
              style={styles.categoryScrollView}
              showsVerticalScrollIndicator={false}
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
            <Text style={styles.dropdownTitle}>Select Unit</Text>
            <ScrollView
              style={styles.categoryScrollView}
              showsVerticalScrollIndicator={false}
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
    backgroundColor: Colors.backgroundGray, // Figma: #F4F6F6
  },

  // Status Bar Time - Figma: x: 51.92, y: 18.34, font: ABeeZee 400, size: 17
  timeText: {
    position: 'absolute',
    left: s(51.92),
    top: vs(18.34),
    fontFamily: Fonts.secondary, // ABeeZee
    fontWeight: Fonts.weights.normal,
    fontSize: s(17),
    lineHeight: vs(22),
    color: Colors.black,
    zIndex: 10,
  },

  scrollContent: {
    height: vs(1060), // Increased height for size/unit row
    paddingBottom: vs(50),
  },

  // Back Button - Figma: x: 20, y: 79, width: 30, height: 30
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

  // Title - Figma: x: 161, y: 83, font: Clash Grotesk 600, size: 20
  title: {
    position: 'absolute',
    left: s(161),
    top: vs(83),
    width: s(118),
    height: vs(22),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '700', // Bold weight for Add Product title
    fontSize: s(20), // Back to original Figma size
    lineHeight: vs(22), // Back to original line height
    color: Colors.darkGray,
    textAlign: 'center',
  },

  // Upload Section - Figma: x: 22, y: 145, width: 398, height: 177
  uploadSection: {
    position: 'absolute',
    left: s(22),
    top: vs(145),
    width: s(398),
    height: vs(177),
  },

  // Upload Label - Figma: x: 24, y: 145, font: Clash Grotesk 500, size: 16
  uploadLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: s(16),
    lineHeight: vs(22), // 1.375em line height
    color: Colors.black,
    marginBottom: vs(5),
  },

  // Upload Container - Figma: x: 22, y: 172, width: 398, height: 150
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

  // Upload Icon - Figma: x: 207, y: 223, width: 25, height: 25
  uploadIcon: {
    width: s(25),
    height: vs(25),
    marginBottom: vs(8),
  },

  // Upload Text - Figma: x: 172, y: 248, font: Clash Grotesk 400, size: 12
  uploadText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    fontSize: s(12),
    lineHeight: vs(22), // 1.833em line height
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },

  // Selected Image Preview - Full container size with rounded corners
  selectedImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: s(20),
    resizeMode: 'cover',
  },

  // Input Section - Figma: x: 20, y: 342/439/636, width: 400
  inputSection: {
    position: 'absolute',
    left: s(20),
    width: s(400),
  },

  // Input Label - Font: Clash Grotesk 500, size: 16
  inputLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: s(16),
    lineHeight: vs(22),
    color: Colors.darkGray,
    marginBottom: vs(8), // Proper spacing between label and input for better alignment
  },

  // Input Container - Figma: borderRadius: 20, stroke: #02545F 2px
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

  // Text Input - Font: Clash Grotesk 500, size: 14
  textInput: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: s(14),
    lineHeight: vs(22), // 1.571em line height
    color: '#1E1E1E', // Ensure text is visible when typing
    textAlignVertical: 'top',
  },

  // Description specific container
  descriptionContainer: {
    height: vs(146), // Expanded to reach Product Category label (vs(636) - vs(460) - label height)
  },

  // Description specific input
  descriptionInput: {
    minHeight: vs(130), // Expanded to fill the larger container
    textAlignVertical: 'top',
    paddingTop: vs(5),
  },

  // Category Container - Different styling for dropdown
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
    fontSize: s(14),
    lineHeight: vs(22),
    color: 'rgba(30, 30, 30, 0.5)',
    flex: 1,
  },

  forwardArrow: {
    width: s(30),
    height: vs(30),
  },

  // Row Container for Price and Quantity
  rowContainer: {
    position: 'absolute',
    left: s(20),
    top: vs(747), // Adjusted for Product Category spacing
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: s(400),
  },

  // Half Input Section - Figma: width: 192
  halfInputSection: {
    width: s(192),
  },

  // Half Input Container - Figma: width: 180, height: 50
  halfInputContainer: {
    width: s(180),
    height: vs(50),
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(20),
    backgroundColor: '#FFFFFF', // Explicit white background
    paddingHorizontal: s(0), // Remove container padding since input has its own
    paddingVertical: vs(0), // Remove vertical padding to avoid text clipping
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  // Half Text Input - Specific styling for Price and Quantity inputs
  halfTextInput: {
    textAlign: 'left', // Left align for better UX when typing/editing
    textAlignVertical: 'center', // Center align vertically
    color: '#000000', // Strong black color for maximum visibility
    fontWeight: '600', // Slightly bolder for better visibility
    backgroundColor: 'transparent', // Ensure background doesn't interfere
    fontSize: s(16), // Slightly larger font for better visibility
    height: vs(50), // Match container height exactly
    width: '100%', // Take full width of container
    paddingHorizontal: s(15), // Add horizontal padding for better text positioning
    paddingVertical: 0, // Remove any vertical padding
    margin: 0, // Remove any margins
  },

  // Size Row Container for Size and Unit
  sizeRowContainer: {
    position: 'absolute',
    left: s(20),
    top: vs(844), // Positioned after price/quantity row
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: s(400),
  },

  // Unit Container - Similar to category dropdown
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
    fontSize: s(14),
    lineHeight: vs(22),
    color: 'rgba(30, 30, 30, 0.5)',
    flex: 1,
  },

  unitArrow: {
    width: s(20),
    height: vs(20),
  },

  // Add Button - Adjusted position for size/unit row
  addButton: {
    position: 'absolute',
    left: s(20),
    top: vs(961), // Adjusted for size/unit row spacing
    width: s(400),
    height: vs(50),
    backgroundColor: Colors.primary, // #3BB77E
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  // Add Button Text - Font: Clash Grotesk 500, size: 20
  addButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: s(20),
    lineHeight: vs(22), // 1.1em line height
    color: Colors.white,
    textAlign: 'center',
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
    width: s(380), // Wider to match screen width better
    height: vs(550), // Expanded height to show all 7 categories clearly
    padding: s(20), // Standard padding
    paddingBottom: s(25), // More bottom padding for better spacing
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    marginHorizontal: s(20),
  },

  categoryScrollView: {
    flex: 1, // Take available space - scrolling available if needed but not required
  },

  dropdownTitle: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: s(20),
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
    fontSize: s(16),
    lineHeight: vs(22),
    color: Colors.darkGray,
    textAlign: 'left',
  },
});


export default AddProductScreen;