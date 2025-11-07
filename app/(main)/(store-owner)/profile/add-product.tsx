import { router } from 'expo-router';
import React, { useState, useCallback } from 'react';
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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { ref, push, set, query, orderByChild, equalTo, get, update } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';
import * as Haptics from 'expo-haptics';

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
  const [expiryDate, setExpiryDate] = useState(''); // New: Expiry date field
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // Date picker modal state
  const [tempDate, setTempDate] = useState(new Date()); // Temporary date for picker
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false); // Show month/year overlay
  const [isSaving, setIsSaving] = useState(false);
  const yearScrollRef = React.useRef<ScrollView>(null);

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

  const handleExpiryDateChange = useCallback((text: string) => {
    setExpiryDate(text);
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
        const base64 = await readAsStringAsync(imageUri, {
          encoding: 'base64',
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

  const handleDatePickerOpen = () => {
    // If there's already a date, use it; otherwise use current date
    const now = new Date();
    if (expiryDate.trim()) {
      try {
        const parsedDate = new Date(expiryDate);
        if (!isNaN(parsedDate.getTime())) {
          setTempDate(parsedDate);
          setCalendarMonth(parsedDate.getMonth());
          setCalendarYear(parsedDate.getFullYear());
        } else {
          setTempDate(now);
          setCalendarMonth(now.getMonth());
          setCalendarYear(now.getFullYear());
        }
      } catch {
        setTempDate(now);
        setCalendarMonth(now.getMonth());
        setCalendarYear(now.getFullYear());
      }
    } else {
      setTempDate(now);
      setCalendarMonth(now.getMonth());
      setCalendarYear(now.getFullYear());
    }
    setShowDatePicker(true);
  };

  const handleDateSelect = () => {
    // Always format as MM/DD/YYYY
    const month = String(tempDate.getMonth() + 1).padStart(2, '0');
    const day = String(tempDate.getDate()).padStart(2, '0');
    const year = tempDate.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    setExpiryDate(formattedDate);
    setShowDatePicker(false);
  };

  const handleMonthYearHeaderPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMonthYearPicker(true);
    
    // Auto-scroll to the selected year after modal opens
    setTimeout(() => {
      const years = getYears();
      const selectedYearIndex = years.indexOf(calendarYear);
      if (selectedYearIndex !== -1 && yearScrollRef.current) {
        // Each year button is ~70px wide (60 + 10 margin)
        const scrollPosition = selectedYearIndex * s(70);
        yearScrollRef.current.scrollTo({ x: scrollPosition, animated: true });
      }
    }, 100);
  };

  const handleMonthYearApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowMonthYearPicker(false);
    // tempDate is already updated from handleMonthSelect/handleYearSelect
  };

  const handleDaySelect = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDate = new Date(calendarYear, calendarMonth, day);
    setTempDate(newDate);
    // calendarMonth and calendarYear are already in sync from navigation
  };

  const handleMonthChange = (increment: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let newMonth = calendarMonth + increment;
    let newYear = calendarYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
    
    // Update tempDate to stay synchronized
    const currentDay = tempDate.getDate();
    const daysInNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    const safeDay = Math.min(currentDay, daysInNewMonth);
    setTempDate(new Date(newYear, newMonth, safeDay));
  };

  const handleMonthSelect = (monthId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCalendarMonth(monthId);
    
    // Update tempDate to stay synchronized
    const currentDay = tempDate.getDate();
    const daysInNewMonth = new Date(calendarYear, monthId + 1, 0).getDate();
    const safeDay = Math.min(currentDay, daysInNewMonth);
    setTempDate(new Date(calendarYear, monthId, safeDay));
  };

  const handleYearSelect = (year: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCalendarYear(year);
    
    // Update tempDate to stay synchronized
    const currentDay = tempDate.getDate();
    const daysInNewMonth = new Date(year, calendarMonth + 1, 0).getDate();
    const safeDay = Math.min(currentDay, daysInNewMonth);
    setTempDate(new Date(year, calendarMonth, safeDay));
  };

  const handleClearDate = () => {
    setExpiryDate('');
    setShowDatePicker(false);
  };

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Generate list of months for month-year mode
  const getMonths = () => {
    return [
      { id: 0, name: 'January', short: 'Jan' },
      { id: 1, name: 'February', short: 'Feb' },
      { id: 2, name: 'March', short: 'Mar' },
      { id: 3, name: 'April', short: 'Apr' },
      { id: 4, name: 'May', short: 'May' },
      { id: 5, name: 'June', short: 'Jun' },
      { id: 6, name: 'July', short: 'Jul' },
      { id: 7, name: 'August', short: 'Aug' },
      { id: 8, name: 'September', short: 'Sep' },
      { id: 9, name: 'October', short: 'Oct' },
      { id: 10, name: 'November', short: 'Nov' },
      { id: 11, name: 'December', short: 'Dec' },
    ];
  };

  // Generate range of years for month-year mode
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 10; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  const handleAddProduct = async () => {
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
      // Check decimal places
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
      // 7. EXPIRY DATE VALIDATION (OPTIONAL)
      // ========================================
      // Expiry date is optional, but if provided, validate format
      if (expiryDate.trim()) {
        // Validate MM/DD/YYYY or MM/YYYY format
        const fullDatePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
        const monthYearPattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
        
        if (!fullDatePattern.test(expiryDate.trim()) && !monthYearPattern.test(expiryDate.trim())) {
          Alert.alert('Error', 'Please enter a valid expiry date (MM/DD/YYYY or MM/YYYY format)');
          return;
        }
      }

      // ========================================
      // 8. IMAGE VALIDATION
      // ========================================
      if (!selectedImage) {
        Alert.alert('Error', 'Please select a product image');
        return;
      }

      // ========================================
      // 9. USER AUTHENTICATION CHECK
      // ========================================
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // ========================================
      // 10. FETCH STORE INFO
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
      // 11. DUPLICATE PRODUCT CHECK
      // ========================================
      console.log('🔍 Checking for duplicate products...');
      const productsRef = ref(database, 'products');
      const storeProductsQuery = query(
        productsRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );

      const snapshot = await get(storeProductsQuery);
      if (snapshot.exists()) {
        const existingProducts = snapshot.val();
        const isDuplicate = Object.values(existingProducts).some((product: any) => {
          const sameName = product.productName.toLowerCase().trim() === productName.toLowerCase().trim();
          const sameSize = product.productSize.toLowerCase().trim() === productSize.toLowerCase().trim();
          const sameUnit = product.unit.toLowerCase() === selectedUnit.toLowerCase();

          return sameName && sameSize && sameUnit;
        });

        if (isDuplicate) {
          const formattedName = formatProductName(productName);
          Alert.alert(
            'Duplicate Product',
            `${formattedName} (${productSize}${selectedUnit}) already exists in your inventory.\n\nTo add more stock, go to Store Product and update the existing product.`,
            [{ text: 'OK' }]
          );
          return;
        }
      }
      console.log('✅ No duplicate found - proceeding with save');

      // ========================================
      // 12. FORMAT DATA
      // ========================================
      const formattedProductName = formatProductName(productName);
      const formattedPrice = formatPrice(priceNum);
      const formattedQuantity = Math.floor(quantityNum);

      console.log('📝 Formatted data:');
      console.log('  - Name:', formattedProductName);
      console.log('  - Price: ₱', formattedPrice);
      console.log('  - Quantity:', formattedQuantity);

      // ========================================
      // 13. PREPARE PRODUCT DATA
      // ========================================
      const productData = {
        productName: formattedProductName,
        description: description.trim(),
        category: selectedCategory,
        price: formattedPrice,
        quantity: formattedQuantity,
        productSize: productSize.trim(),
        unit: selectedUnit,
        expiryDate: expiryDate.trim() || null, // Include expiry date if provided
        productImage: selectedImage, // Base64 string
        storeOwnerId: currentUser.uid,
        storeId: currentUser.uid,
        storeName: storeName,
        storeOwnerName: storeOwnerName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'available'
      };

      console.log('🏪 Store Info:', storeName, 'by', storeOwnerName);

      // ========================================
      // 14. SAVE TO FIREBASE
      // ========================================
      console.log('💾 Saving to Firebase...');
      const newProductRef = push(productsRef);
      await set(newProductRef, productData);

      console.log('✅ Product saved successfully:', productData.productName);

      // ========================================
      // 15. SUCCESS FEEDBACK
      // ========================================
      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error('❌ Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

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
              onChangeText={handleProductNameChange}
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
              onChangeText={handleDescriptionChange}
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
                onChangeText={handlePriceChange}
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
                onChangeText={handleQuantityChange}
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
                onChangeText={handleProductSizeChange}
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

        {/* Expiry Date Section - Full width like Product Category */}
        <View style={[styles.inputSection, { top: vs(941) }]}>
          <Text style={styles.inputLabel}>Expiry Date (Optional)</Text>
          <TouchableOpacity style={styles.datePickerContainer} onPress={handleDatePickerOpen} activeOpacity={0.7}>
            <Text style={[styles.dateText, expiryDate && { color: Colors.darkGray }]}>
              {expiryDate || 'Select expiry MM/DD/YYYY'}
            </Text>
            {/* Calendar Icon */}
            <Image
              source={require('../../../../src/assets/images/add-product/forward-arrow.png')}
              style={styles.forwardArrow}
            />
          </TouchableOpacity>
        </View>

        {/* Add Product Button - Adjusted position for expiry date field */}
        <TouchableOpacity
          style={[styles.addButton, isSaving && styles.addButtonDisabled]}
          onPress={handleAddProduct}
          activeOpacity={0.7}
          disabled={isSaving}
        >
          <Text style={styles.addButtonText}>
            {isSaving ? 'Adding Product...' : 'Add Product'}
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
            {/* Close Button */}
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
            {/* Close Button */}
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerModal}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowDatePicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.dropdownTitle}>Select Expiry Date</Text>

            {/* Month/Year Header - Clickable */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => handleMonthChange(-1)}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarNavButtonText}>‹</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleMonthYearHeaderPress}
                activeOpacity={0.7}
                style={styles.monthYearHeaderButton}
              >
                <Text style={styles.calendarMonthYear}>
                  {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Text>
                <Text style={styles.monthYearHeaderIcon}>▼</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => handleMonthChange(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarNavButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Date Display */}
            <View style={styles.dateDisplay}>
              <Text style={styles.dateDisplayText}>
                Selected: {tempDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </View>

            {/* Day Labels */}
            <View style={styles.calendarDayLabels}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.calendarDayLabel}>{day}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {getCalendarDays().map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    !day && styles.calendarDayEmpty,
                    day === tempDate.getDate() && 
                    calendarMonth === tempDate.getMonth() && 
                    calendarYear === tempDate.getFullYear() && 
                    styles.calendarDaySelected
                  ]}
                  onPress={() => day && handleDaySelect(day)}
                  activeOpacity={day ? 0.7 : 1}
                  disabled={!day}
                >
                  {day && (
                    <Text style={[
                      styles.calendarDayText,
                      day === tempDate.getDate() && 
                      calendarMonth === tempDate.getMonth() && 
                      calendarYear === tempDate.getFullYear() && 
                      styles.calendarDayTextSelected
                    ]}>
                      {day}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Month/Year Picker Overlay */}
            {showMonthYearPicker && (
              <View style={styles.monthYearOverlay}>
                <TouchableOpacity 
                  style={styles.overlayBackground}
                  activeOpacity={1}
                  onPress={() => setShowMonthYearPicker(false)}
                />
                <View style={styles.monthYearOverlayContent}>
                  <View style={styles.overlayHeader}>
                    <Text style={styles.overlayTitle}>Select Expiry Month/Year</Text>
                    <TouchableOpacity 
                      onPress={() => setShowMonthYearPicker(false)}
                      style={styles.overlayCloseButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.overlayCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Year Selection */}
                  <View style={styles.pickerSection}>
                    <Text style={styles.pickerLabel}>Year</Text>
                    <ScrollView 
                      ref={yearScrollRef}
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.yearScroll}
                      contentContainerStyle={styles.yearScrollContent}
                    >
                      {getYears().map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.yearButton,
                            calendarYear === year && styles.yearButtonSelected
                          ]}
                          onPress={() => handleYearSelect(year)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.yearButtonText,
                            calendarYear === year && styles.yearButtonTextSelected
                          ]}>
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Month Grid */}
                  <View style={styles.pickerSection}>
                    <Text style={styles.pickerLabel}>Month</Text>
                    <View style={styles.monthGrid}>
                      {getMonths().map((month) => (
                        <TouchableOpacity
                          key={month.id}
                          style={[
                            styles.monthButton,
                            calendarMonth === month.id && styles.monthButtonSelected
                          ]}
                          onPress={() => handleMonthSelect(month.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.monthButtonText,
                            calendarMonth === month.id && styles.monthButtonTextSelected
                          ]}>
                            {month.short}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Apply Button */}
                  <TouchableOpacity
                    style={styles.overlayApplyButton}
                    onPress={handleMonthYearApply}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.overlayApplyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={[styles.datePickerActionButton, styles.clearButton]}
                onPress={handleClearDate}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerActionButton, styles.confirmButton]}
                onPress={handleDateSelect}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
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

  scrollContent: {
    height: vs(1190), // Increased height for expiry date field + padding
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
    left: 0,
    right: 0,
    top: vs(83),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '700', // Bold weight for Add Product title
    fontSize: ms(20), // Back to original Figma size
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
    fontSize: ms(16),
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
    fontSize: ms(12),
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
    fontSize: ms(16),
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
    fontSize: ms(14),
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
    fontSize: ms(14),
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
    fontSize: ms(16), // Slightly larger font for better visibility
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
    fontSize: ms(14),
    lineHeight: vs(22),
    color: 'rgba(30, 30, 30, 0.5)',
    flex: 1,
  },

  unitArrow: {
    width: s(20),
    height: vs(20),
  },

  // Add Button - Adjusted position for expiry date field with extra padding
  addButton: {
    position: 'absolute',
    left: s(20),
    top: vs(1088), // Added 30px padding between expiry date and button
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
    fontSize: ms(20),
    lineHeight: vs(22), // 1.1em line height
    color: Colors.white,
    textAlign: 'center',
  },

  // Disabled button style
  addButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)', // Faded green
    opacity: 0.7,
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
    width: s(380),
    maxHeight: '70%', // Use percentage-based height for better responsiveness
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
    maxHeight: vs(500), // Set max height to enable scrolling
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

  // Close Modal Button - Top right corner X button
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

  // Date Picker Container - Similar to category dropdown
  datePickerContainer: {
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

  dateText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(14),
    lineHeight: vs(22),
    color: 'rgba(30, 30, 30, 0.5)',
    flex: 1,
  },

  // Date Picker Modal
  datePickerModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: s(380),
    padding: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    marginHorizontal: s(20),
  },

  // Month/Year Header Button
  monthYearHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
  },

  monthYearHeaderIcon: {
    fontSize: ms(12),
    color: Colors.primary,
  },

  // Calendar Header (Month/Year with navigation)
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(15),
    paddingHorizontal: s(10),
    marginBottom: vs(10),
  },

  calendarNavButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  calendarNavButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(28),
    lineHeight: vs(32),
    color: Colors.white,
  },

  calendarMonthYear: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(18),
    lineHeight: vs(22),
    color: Colors.darkGray,
  },

  // Calendar Day Labels (Sun, Mon, etc.)
  calendarDayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: vs(10),
    paddingHorizontal: s(5),
  },

  calendarDayLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(12),
    lineHeight: vs(16),
    color: Colors.textSecondary,
    width: s(42),
    textAlign: 'center',
  },

  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: vs(15),
  },

  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(8),
  },

  calendarDayEmpty: {
    backgroundColor: 'transparent',
  },

  calendarDaySelected: {
    backgroundColor: Colors.primary,
    borderRadius: s(8),
  },

  calendarDayText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(14),
    lineHeight: vs(18),
    color: Colors.darkGray,
  },

  calendarDayTextSelected: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
  },

  // Month/Year Overlay
  monthYearOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  monthYearOverlayContent: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingTop: s(20),
    paddingHorizontal: s(20),
    paddingBottom: s(20),
    width: '90%',
    minHeight: vs(480),
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(20),
    paddingBottom: vs(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },

  overlayTitle: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(20),
    lineHeight: vs(24),
    color: Colors.darkGray,
    flex: 1,
  },

  overlayCloseButton: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlayCloseText: {
    fontSize: ms(18),
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  overlayApplyButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(14),
    alignItems: 'center',
    marginTop: vs(10),
    marginBottom: 0,
  },

  overlayApplyButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(16),
    lineHeight: vs(20),
    color: Colors.white,
  },

  // Picker Section (for month/year overlay)
  pickerSection: {
    marginBottom: vs(15),
  },

  pickerLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(15),
    lineHeight: vs(20),
    color: Colors.darkGray,
    marginBottom: vs(12),
    letterSpacing: 0.5,
  },

  // Year Selection
  yearScroll: {
    maxHeight: vs(60),
  },

  yearScrollContent: {
    gap: s(10),
    paddingHorizontal: s(5),
  },

  yearButton: {
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
    borderRadius: s(12),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: s(80),
    alignItems: 'center',
  },

  yearButtonSelected: {
    backgroundColor: Colors.primary,
  },

  yearButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(16),
    lineHeight: vs(20),
    color: Colors.darkGray,
  },

  yearButtonTextSelected: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
  },

  // Month Grid
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
  },

  monthButton: {
    width: `${(100 - 4 * 2.5) / 4}%`,
    paddingVertical: vs(15),
    borderRadius: s(12),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },

  monthButtonSelected: {
    backgroundColor: Colors.primary,
  },

  monthButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(14),
    lineHeight: vs(18),
    color: Colors.darkGray,
  },

  monthButtonTextSelected: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
  },

  dateDisplay: {
    backgroundColor: Colors.lightGreen,
    borderRadius: s(12),
    paddingVertical: vs(15),
    paddingHorizontal: s(15),
    marginBottom: vs(20),
    alignItems: 'center',
  },

  dateDisplayText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(16),
    lineHeight: vs(20),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  datePickerActions: {
    flexDirection: 'row',
    gap: s(10),
  },

  datePickerActionButton: {
    flex: 1,
    paddingVertical: vs(12),
    borderRadius: s(15),
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },

  clearButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(16),
    lineHeight: vs(20),
    color: Colors.darkGray,
  },

  confirmButton: {
    backgroundColor: Colors.primary,
  },

  confirmButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(16),
    lineHeight: vs(20),
    color: Colors.white,
  },
});


export default AddProductScreen;