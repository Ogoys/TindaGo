import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { s, vs } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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

  const handleBack = () => {
    router.back();
  };

  const handleUploadImage = () => {
    console.log('Upload image pressed');
    Alert.alert('Upload Image', 'Image upload functionality will be implemented here');
  };

  const handleCategorySelect = (category: CategoryItem) => {
    setSelectedCategory(category.name);
    setShowCategoryDropdown(false);
  };

  const handleCategoryDropdownOpen = () => {
    setShowCategoryDropdown(true);
  };

  const handleAddProduct = () => {
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

    console.log('Add Product:', {
      productName,
      description,
      selectedCategory,
      price: Number(price),
      quantity: Number(quantity),
    });

    Alert.alert('Success', 'Product added successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Status Bar - Figma: 9:41 AM status */}
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      {/* Time Display - Figma: x: 51.92, y: 18.34, font: ABeeZee 400, size: 17 */}
      <Text style={styles.timeText}>9:41</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            {/* Upload Icon - Figma: x: 207, y: 223, width: 25, height: 25 */}
            <Image
              source={require('../../../../src/assets/images/add-product/upload-icon.png')}
              style={styles.uploadIcon}
            />
            {/* Upload Text - Figma: x: 172, y: 248, font: Clash Grotesk 400, size: 12 */}
            <Text style={styles.uploadText}>Upload your photo</Text>
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
        <View style={[styles.inputSection, { top: vs(439) }]}>
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
        <View style={[styles.inputSection, { top: vs(636) }]}>
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
                style={styles.textInput}
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
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </View>
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
    flexGrow: 1,
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
    fontWeight: 'bold', // Bold weight for Add Product title
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
    marginBottom: vs(8), // Increased spacing between label and input
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
    color: Colors.darkGray,
    textAlignVertical: 'top',
  },

  // Description specific container
  descriptionContainer: {
    height: vs(80), // Taller container for multiline description
  },

  // Description specific input
  descriptionInput: {
    minHeight: vs(60),
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
    top: vs(733), // Exact Figma position
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
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingVertical: vs(14),
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  // Add Button - Figma: x: 20, y: 850, width: 400, height: 50
  addButton: {
    position: 'absolute',
    left: s(20),
    top: vs(850),
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
    maxHeight: vs(450),
    padding: s(25),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    marginHorizontal: s(20),
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