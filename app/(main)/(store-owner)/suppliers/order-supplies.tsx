/**
 * ORDER SUPPLIES SCREEN - Purchase Order Module
 *
 * Allows store owners to record and manage items procured for sale.
 * Acts as a digital log for tracking inventory replenishments, supplier details,
 * and purchasing dates, helping store owners efficiently plan stock levels.
 *
 * EXACT same structure as add-product.tsx with ALL fields:
 * - Section 1: Upload image, product name, description
 * - Section 2: Category, supplier price, quantity, size, unit, expiry
 *
 * Figma File: 8I1Nr3vQZllDDmnSevstvH
 * Node: 1571-711, 1571-780
 * Baseline: 440x956
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface PurchaseOrderCard {
  id: string;
  productName: string;
  description: string;
  selectedCategory: string;
  supplierPrice: string;
  sellingPrice: string;
  quantity: string;
  productSize: string;
  selectedUnit: string;
  expiryDate: string;
  selectedImage: string | null;
}

interface ExistingProduct {
  productId: string;
  productName: string;
  productImageUrl?: string;
  productImage?: string;
  sellingPrice: number;
  currentQuantity: number;
  productSize: string;
  unit: string;
  category: string;
  description: string;
  expiryDate?: string;
  selected: boolean;
  quantity: number;
  supplierPrice: number;
  subtotal: number;
}

type OrderMode = 'new' | 'existing';

const OrderSuppliesScreen = () => {
  const params = useLocalSearchParams();

  // Supplier info from navigation params
  const supplierNameParam = typeof params.supplierName === 'string' ? params.supplierName : '';
  const supplierContactParam = typeof params.supplierContact === 'string' ? params.supplierContact : '';

  // Mode state
  const [mode, setMode] = useState<OrderMode>('new');
  
  // Supplier state
  const [supplierName, setSupplierName] = useState(supplierNameParam);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  });

  // Purchase order cards state - multiple items
  const [purchaseCards, setPurchaseCards] = useState<PurchaseOrderCard[]>([
    createEmptyPurchaseItem(),
  ]);
  
  // Existing products state
  const [existingProducts, setExistingProducts] = useState<ExistingProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [currentEditingCardId, setCurrentEditingCardId] = useState<string | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState({ current: 0, total: 0 });
  const [isPickingImage, setIsPickingImage] = useState(false); // Prevent concurrent image picker calls
  
  // Fetch existing products when mode changes to 'existing'
  useEffect(() => {
    if (mode === 'existing') {
      fetchExistingProducts();
    }
  }, [mode]);

  // Create empty purchase item
  function createEmptyPurchaseItem(): PurchaseOrderCard {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      productName: '',
      description: '',
      selectedCategory: '',
      supplierPrice: '',
      sellingPrice: '',
      quantity: '',
      productSize: '',
      selectedUnit: '',
      expiryDate: '',
      selectedImage: null,
    };
  }

  // Product categories - Matching add-product.tsx (10 categories)
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

  // Common units for sari-sari store products - Matching add-product.tsx
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
  
  // Fetch existing products from inventory
  const fetchExistingProducts = async () => {
    setLoadingProducts(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const productsRef = ref(database, 'products');
      const storeProductsQuery = query(
        productsRef,
        orderByChild('storeOwnerId'),
        equalTo(currentUser.uid)
      );
      
      const snapshot = await get(storeProductsQuery);
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const productsList: ExistingProduct[] = Object.keys(productsData).map(key => ({
          productId: key,
          productName: productsData[key].productName || 'Unknown Product',
          productImageUrl: productsData[key].productImageUrl,
          productImage: productsData[key].productImage,
          sellingPrice: productsData[key].price || 0,
          currentQuantity: productsData[key].quantity || 0,
          productSize: productsData[key].productSize || '',
          unit: productsData[key].unit || '',
          category: productsData[key].category || '',
          description: productsData[key].description || '',
          expiryDate: productsData[key].expiryDate,
          selected: false,
          quantity: 0,
          supplierPrice: 0,
          subtotal: 0,
        }));
        setExistingProducts(productsList.sort((a, b) => a.productName.localeCompare(b.productName)));
      } else {
        setExistingProducts([]);
      }
    } catch (error) {
      console.error('[Order Supplies] Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };
  
  // Toggle product selection for existing products mode
  const toggleProductSelection = (productId: string) => {
    setExistingProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const newSelected = !p.selected;
        return {
          ...p,
          selected: newSelected,
          quantity: newSelected ? 1 : 0,
          supplierPrice: newSelected ? p.sellingPrice * 0.7 : 0, // Default to 70% of selling price
          subtotal: newSelected ? (p.sellingPrice * 0.7) * 1 : 0,
        };
      }
      return p;
    }));
  };
  
  // Update quantity for existing product
  const updateExistingProductQuantity = (productId: string, quantity: number) => {
    setExistingProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const qty = Math.max(0, quantity);
        return {
          ...p,
          quantity: qty,
          subtotal: qty * p.supplierPrice,
        };
      }
      return p;
    }));
  };
  
  // Update supplier price for existing product
  const updateExistingProductPrice = (productId: string, price: number) => {
    setExistingProducts(prev => prev.map(p => {
      if (p.productId === productId) {
        const priceValue = Math.max(0, price);
        return {
          ...p,
          supplierPrice: priceValue,
          subtotal: p.quantity * priceValue,
        };
      }
      return p;
    }));
  };

  const handleBack = () => {
    const hasUnsavedData = mode === 'new'
      ? purchaseCards.some(p => p.productName || p.selectedImage)
      : existingProducts.some(p => p.selected && p.quantity > 0);
      
    if (hasUnsavedData) {
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

  // Update a specific purchase card field
  const updatePurchaseCard = (cardId: string, field: keyof PurchaseOrderCard, value: string | null) => {
    setPurchaseCards(cards =>
      cards.map(card =>
        card.id === cardId ? { ...card, [field]: value } : card
      )
    );
  };

  // Add new purchase card
  const handleAddNewPurchaseCard = () => {
    setPurchaseCards([...purchaseCards, createEmptyPurchaseItem()]);
  };

  // Remove purchase card
  const handleRemovePurchaseCard = (cardId: string) => {
    if (purchaseCards.length === 1) {
      Alert.alert('Cannot Remove', 'You need at least one product card.');
      return;
    }
    setPurchaseCards(cards => cards.filter(card => card.id !== cardId));
  };

  // Handle image upload for a specific card
  const handleUploadImage = async (cardId: string) => {
    // Prevent concurrent picker calls to avoid "Already resumed" crash
    if (isPickingImage) {
      console.log('⚠️ Image picker already open, ignoring request');
      return;
    }

    try {
      setIsPickingImage(true);
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
        updatePurchaseCard(cardId, 'selectedImage', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      // Always reset picking state
      setIsPickingImage(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: CategoryItem) => {
    if (currentEditingCardId) {
      updatePurchaseCard(currentEditingCardId, 'selectedCategory', category.name);
    }
    setShowCategoryDropdown(false);
    setCurrentEditingCardId(null);
  };

  // Handle unit selection
  const handleUnitSelect = (unit: CategoryItem) => {
    if (currentEditingCardId) {
      updatePurchaseCard(currentEditingCardId, 'selectedUnit', unit.name);
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
      updatePurchaseCard(currentEditingCardId, 'expiryDate', formattedDate);
    }
    setShowDatePicker(false);
    setCurrentEditingCardId(null);
  };

  const handleExpiryClear = () => {
    if (currentEditingCardId) {
      updatePurchaseCard(currentEditingCardId, 'expiryDate', '');
    }
    setShowDatePicker(false);
    setCurrentEditingCardId(null);
  };

  const expiryMinDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Validate a single purchase item - Matching add-product.tsx
  const validatePurchaseItem = (item: PurchaseOrderCard): { valid: boolean; error?: string } => {
    if (!item.productName.trim()) {
      return { valid: false, error: 'Product name is required' };
    }
    if (item.productName.trim().length < 2) {
      return { valid: false, error: 'Product name must be at least 2 characters' };
    }
    if (!item.description.trim()) {
      return { valid: false, error: 'Description is required' };
    }
    if (!item.selectedCategory) {
      return { valid: false, error: 'Category is required' };
    }

    const priceNum = Number(item.supplierPrice);
    if (!item.supplierPrice.trim() || isNaN(priceNum) || priceNum <= 0) {
      return { valid: false, error: 'Valid supplier price is required' };
    }

    const sellingPriceNum = Number(item.sellingPrice);
    if (!item.sellingPrice.trim() || isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      return { valid: false, error: 'Valid selling price is required' };
    }
    if (sellingPriceNum < priceNum) {
      return { valid: false, error: 'Selling price must be at least equal to supplier price' };
    }

    const quantityNum = Number(item.quantity);
    if (!item.quantity.trim() || isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
      return { valid: false, error: 'Valid quantity (whole number) is required' };
    }

    if (!item.productSize.trim()) {
      return { valid: false, error: 'Size is required' };
    }
    if (!item.selectedUnit) {
      return { valid: false, error: 'Unit is required' };
    }

    return { valid: true };
  };

  // Save existing products order
  const handleSaveExistingProducts = async () => {
    if (isSaving) return;

    // Validate supplier name
    if (!supplierName.trim()) {
      Alert.alert('Validation Error', 'Supplier name is required');
      return;
    }

    const selectedItems = existingProducts.filter(p => p.selected && p.quantity > 0);
    
    if (selectedItems.length === 0) {
      Alert.alert('No Products Selected', 'Please select at least one product to order');
      return;
    }

    // Validate all selected items have quantity and supplier price
    const invalidItems = selectedItems.filter(p => p.quantity <= 0 || p.supplierPrice <= 0);
    if (invalidItems.length > 0) {
      Alert.alert(
        'Invalid Items',
        'Please enter valid quantity and supplier price for all selected products'
      );
      return;
    }
    
    // Validate selling price >= supplier price
    const invalidPricing = selectedItems.filter(p => p.sellingPrice < p.supplierPrice);
    if (invalidPricing.length > 0) {
      Alert.alert(
        'Invalid Pricing',
        'Selling price must be at least equal to supplier price for all products'
      );
      return;
    }

    setIsSaving(true);
    setSavingProgress({ current: 0, total: selectedItems.length });

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        setIsSaving(false);
        return;
      }

      const purchaseOrderItems = selectedItems.map((item, index) => {
        setSavingProgress({ current: index + 1, total: selectedItems.length });
        
        return {
          productId: item.productId,
          productName: item.productName,
          category: item.category,
          productSize: item.productSize,
          unit: item.unit,
          productImage: item.productImage,
          productImageUrl: item.productImageUrl,
          quantity: Math.floor(item.quantity),
          costPerUnit: formatPrice(item.supplierPrice),
          subtotal: formatPrice(item.subtotal),
        };
      });

      // Save to AsyncStorage for payment screen
      const orderDataForPayment = {
        supplierName: supplierName.trim(),
        supplierContact: supplierContactParam || '',
        purchaseDate: new Date().toISOString().split('T')[0],
        items: purchaseOrderItems,
        notes: `Order from ${supplierName.trim()}`,
        totalCost: existingProducts.filter(p => p.selected).reduce((sum, p) => sum + p.subtotal, 0),
      };

      console.log('[Order Supplies] Saving existing products to AsyncStorage...');
      const storageKey = `purchase_order_payment_${currentUser.uid}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(orderDataForPayment));
      console.log('[Order Supplies] Data saved to AsyncStorage');

      // Navigate to payment screen
      router.push('/(main)/(store-owner)/suppliers/purchase-payment' as any);
    } catch (error) {
      console.error('[Order Supplies] Error creating purchase order:', error);
      Alert.alert('Error', 'Failed to create purchase order. Please try again.');
    } finally {
      setIsSaving(false);
      setSavingProgress({ current: 0, total: 0 });
    }
  };
  
  // Save all purchase order items
  const handleSaveAllItems = async () => {
    if (isSaving) return;

    // Validate supplier name
    if (!supplierName.trim()) {
      Alert.alert('Validation Error', 'Supplier name is required');
      return;
    }

    // Filter out empty cards
    const itemsToSave = purchaseCards.filter(p =>
      p.productName.trim() || p.selectedImage || p.description.trim()
    );

    if (itemsToSave.length === 0) {
      Alert.alert('No Items', 'Please add at least one product with details.');
      return;
    }

    // Validate all items
    for (let i = 0; i < itemsToSave.length; i++) {
      const validation = validatePurchaseItem(itemsToSave[i]);
      if (!validation.valid) {
        Alert.alert(
          `Product #${i + 1} Error`,
          `${itemsToSave[i].productName || 'Unnamed product'}: ${validation.error}`
        );
        return;
      }
    }

    setIsSaving(true);
    setSavingProgress({ current: 0, total: itemsToSave.length });

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

      let savedCount = 0;
      const errors: string[] = [];
      const purchaseOrderItems: any[] = [];

      for (let i = 0; i < itemsToSave.length; i++) {
        const item = itemsToSave[i];
        setSavingProgress({ current: i + 1, total: itemsToSave.length });

        try {
          // Upload image if provided
          let productImageUrl = null;
          if (item.selectedImage) {
            productImageUrl = await uploadImageToCloudinary(item.selectedImage, 'purchase-orders');
          }

          // Prepare expiry date
          let expiryDateISO = null;
          if (item.expiryDate.trim()) {
            const parts = item.expiryDate.trim().split('/');
            if (parts.length === 3) {
              const month = parseInt(parts[0], 10) - 1;
              const day = parseInt(parts[1], 10);
              const year = parseInt(parts[2], 10);
              const dateObj = new Date(year, month, day);
              expiryDateISO = dateObj.toISOString();
            }
          }

          // ✅ FIX: Don't create products immediately
          // Products will only be created when purchase order is marked as delivered
          // This prevents "Out of Stock" products from appearing in inventory
          
          const productName = formatProductName(item.productName);
          const productsRef = ref(database, 'products');
          const productsQuery = query(
            productsRef,
            orderByChild('storeOwnerId'),
            equalTo(currentUser.uid)
          );
          const productsSnapshot = await get(productsQuery);
          
          let productId: string | null = null;
          
          // Only check if product EXISTS - don't create it yet
          if (productsSnapshot.exists()) {
            const products = productsSnapshot.val();
            for (const [id, product] of Object.entries<any>(products)) {
              if (product.productName?.toLowerCase() === productName.toLowerCase()) {
                productId = id;
                console.log(`[Order Supplies] Found existing product: ${productName} (ID: ${productId})`);
                break;
              }
            }
          }
          
          // If product doesn't exist, generate a temporary ID
          // The actual product will be created when order is delivered
          if (!productId) {
            const newProductRef = push(productsRef);
            productId = newProductRef.key!;
            console.log(`[Order Supplies] New product will be created on delivery: ${productName} (Temp ID: ${productId})`);
          }

          // Prepare purchase order item data for payment screen
          const purchaseItem = {
            productId: productId, // ✅ ADD productId
            productName: productName,
            description: item.description.trim(),
            category: item.selectedCategory,
            costPerUnit: formatPrice(Number(item.supplierPrice)),
            sellingPrice: formatPrice(Number(item.sellingPrice)),
            quantity: Math.floor(Number(item.quantity)),
            productSize: item.productSize.trim(),
            unit: item.selectedUnit,
            expiryDate: expiryDateISO,
            productImageUrl,
            subtotal: formatPrice(Number(item.supplierPrice)) * Math.floor(Number(item.quantity)),
          };

          purchaseOrderItems.push(purchaseItem);
          savedCount++;

        } catch (error) {
          console.error(`Error processing item ${item.productName}:`, error);
          errors.push(`Failed to process ${item.productName}`);
        }
      }

      // Navigate to payment screen (don't save to DB yet - save after payment confirmation)
      if (savedCount > 0 && errors.length === 0) {
        // ✅ FIX: Save to AsyncStorage instead of URL params
        const orderDataForPayment = {
          supplierName: supplierName.trim(),
          supplierContact: supplierContactParam || '',
          purchaseDate: new Date().toISOString().split('T')[0],
          items: purchaseOrderItems,
          notes: '',
        };

        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert('Error', 'User not authenticated');
          setIsSaving(false);
          setSavingProgress({ current: 0, total: 0 });
          return;
        }

        console.log('[Order Supplies] Saving to AsyncStorage...');
        const storageKey = `purchase_order_payment_${currentUser.uid}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(orderDataForPayment));
        console.log('[Order Supplies] Data saved to AsyncStorage');

        router.push('/(main)/(store-owner)/suppliers/purchase-payment' as any);
      } else if (savedCount > 0 && errors.length > 0) {
        Alert.alert(
          'Partial Success',
          `${savedCount} item${savedCount > 1 ? 's' : ''} processed.\n\nErrors:\n${errors.join('\n')}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', `Failed to process items:\n${errors.join('\n')}`);
      }

    } catch (error) {
      console.error('Error creating purchase order:', error);
      Alert.alert('Error', 'Failed to create purchase order. Please try again.');
    } finally {
      setIsSaving(false);
      setSavingProgress({ current: 0, total: 0 });
    }
  };

  // Render a single purchase card with horizontal scroll sections - MATCHING add-product.tsx EXACTLY
  const renderPurchaseCard = (item: PurchaseOrderCard, index: number) => {
    return (
      <View key={item.id} style={styles.productCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIndexBadge}>
            <Text style={styles.cardIndexText}>#{index + 1}</Text>
          </View>
          <Text style={styles.cardTitle}>Product Details</Text>
          {purchaseCards.length > 1 && (
            <TouchableOpacity
              style={styles.removeCardButton}
              onPress={() => handleRemovePurchaseCard(item.id)}
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
          {/* SECTION 1: Image, Name, Description - EXACT match with add-product.tsx */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>

            {/* Upload Image */}
            <TouchableOpacity
              style={styles.uploadContainer}
              onPress={() => handleUploadImage(item.id)}
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
            <Text style={styles.fieldLabel}>Product Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter product name"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={item.productName}
                onChangeText={(text) => updatePurchaseCard(item.id, 'productName', text)}
              />
            </View>

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            <View style={[styles.inputContainer, styles.descriptionContainer]}>
              <TextInput
                style={[styles.textInput, styles.descriptionInput]}
                placeholder="Enter description"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={item.description}
                onChangeText={(text) => updatePurchaseCard(item.id, 'description', text)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* SECTION 2: Category, Price, Quantity, Size, Unit, Expiry - EXACT match with add-product.tsx */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing & Stock</Text>

            {/* Category - Dynamic with Dropdown Helper */}
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryInputRow}>
              <View style={styles.categoryTextInputContainer}>
                <TextInput
                  style={styles.categoryTextInput}
                  placeholder="Type or select category"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={item.selectedCategory}
                  onChangeText={(text) => updatePurchaseCard(item.id, 'selectedCategory', text)}
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

            {/* Supplier Price & Selling Price Row */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Supplier Price</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.pesoSign}>₱</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={item.supplierPrice}
                    onChangeText={(text) => updatePurchaseCard(item.id, 'supplierPrice', text)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Selling Price</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.pesoSign}>₱</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={item.sellingPrice}
                    onChangeText={(text) => updatePurchaseCard(item.id, 'sellingPrice', text)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Quantity Row */}
            <Text style={styles.fieldLabel}>Quantity</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={item.quantity}
                onChangeText={(text) => updatePurchaseCard(item.id, 'quantity', text)}
                keyboardType="number-pad"
              />
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
                    value={item.productSize}
                    onChangeText={(text) => updatePurchaseCard(item.id, 'productSize', text)}
                  />
                </View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Unit</Text>
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

            {/* Expiry Date */}
            <Text style={styles.fieldLabel}>Expiry Date (Optional)</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                setCurrentEditingCardId(item.id);
                setShowDatePicker(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, item.expiryDate && styles.dropdownTextSelected]}>
                {item.expiryDate || 'MM/DD/YYYY'}
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
        <Text style={styles.title}>Order Supplies</Text>
        <View style={styles.productCountBadge}>
          <Text style={styles.productCountText}>{purchaseCards.length}</Text>
        </View>
      </View>

      {/* Supplier Info Card - Compact */}
      <View style={styles.supplierInfoCard}>
        <Text style={styles.supplierLabel}>Supplier</Text>
        <Text style={styles.supplierName}>{supplierName || 'Unknown Supplier'}</Text>
        <View style={styles.deliveryRow}>
          <Text style={styles.deliveryLabel}>Expected Delivery:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDeliveryDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateText}>{formatDate(deliveryDate)}</Text>
            <Text style={styles.dateIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Selection Radio Buttons */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.radioButton, mode === 'new' && styles.radioButtonActive]}
          onPress={() => setMode('new')}
          activeOpacity={0.7}
        >
          <View style={styles.radioCircle}>
            {mode === 'new' && <View style={styles.radioCircleInner} />}
          </View>
          <Text style={[styles.radioText, mode === 'new' && styles.radioTextActive]}>
            Add New Product
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.radioButton, mode === 'existing' && styles.radioButtonActive]}
          onPress={() => setMode('existing')}
          activeOpacity={0.7}
        >
          <View style={styles.radioCircle}>
            {mode === 'existing' && <View style={styles.radioCircleInner} />}
          </View>
          <Text style={[styles.radioText, mode === 'existing' && styles.radioTextActive]}>
            From Existing Products
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on mode */}
      {mode === 'new' ? (
        /* Purchase Order Cards */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {purchaseCards.map((item, index) => renderPurchaseCard(item, index))}

          {/* Add Another Product Button */}
          <TouchableOpacity
            style={styles.addAnotherButton}
            onPress={handleAddNewPurchaseCard}
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
      ) : (
        /* Existing Products List */
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Image
              source={require('../../../../src/assets/images/home/search-icon.png')}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="rgba(30, 30, 30, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {loadingProducts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading products...</Text>
              </View>
            ) : existingProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Add products to inventory first</Text>
              </View>
            ) : (
              <>
                {existingProducts
                  .filter(p => p.productName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((product) => (
                  <View key={product.productId} style={styles.restockProductCard}>
                    {/* Product Header with Checkbox */}
                    <TouchableOpacity
                      style={styles.restockProductHeader}
                      onPress={() => toggleProductSelection(product.productId)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        product.selected && styles.checkboxSelected
                      ]}>
                        {product.selected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      
                      {product.productImageUrl || product.productImage ? (
                        <Image
                          source={{
                            uri: product.productImageUrl?.startsWith('http') || product.productImageUrl?.startsWith('data:')
                              ? product.productImageUrl
                              : product.productImage?.startsWith('http') || product.productImage?.startsWith('data:')
                              ? product.productImage
                              : `data:image/jpeg;base64,${product.productImageUrl || product.productImage}`
                          }}
                          style={styles.restockProductImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.restockProductImage, styles.restockProductImagePlaceholder]}>
                          <Text style={styles.restockProductImagePlaceholderText}>📦</Text>
                        </View>
                      )}
                      
                      <View style={styles.restockProductHeaderInfo}>
                        <Text style={styles.restockProductName}>{product.productName}</Text>
                        <Text style={styles.restockProductSize}>
                          {product.productSize} • {product.unit}
                        </Text>
                        <Text style={styles.restockProductPrice}>
                          Selling Price: ₱{product.sellingPrice.toFixed(2)}/{product.unit}
                        </Text>
                        <Text style={styles.restockProductStock}>
                          Current Stock: {product.currentQuantity} units
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Quantity and Price Inputs - Only show when selected */}
                    {product.selected && (
                      <View style={styles.restockProductInputs}>
                        <View style={styles.restockInputGroup}>
                          <Text style={styles.restockInputLabel}>Quantity</Text>
                          <TextInput
                            style={styles.restockInput}
                            placeholder="0"
                            placeholderTextColor="rgba(30, 30, 30, 0.3)"
                            keyboardType="numeric"
                            value={product.quantity > 0 ? product.quantity.toString() : ''}
                            onChangeText={(text) => {
                              const qty = parseInt(text) || 0;
                              updateExistingProductQuantity(product.productId, qty);
                            }}
                          />
                        </View>
                        
                        <View style={styles.restockInputGroup}>
                          <Text style={styles.restockInputLabel}>Supplier Price</Text>
                          <TextInput
                            style={styles.restockInput}
                            placeholder="0.00"
                            placeholderTextColor="rgba(30, 30, 30, 0.3)"
                            keyboardType="decimal-pad"
                            value={product.supplierPrice > 0 ? product.supplierPrice.toString() : ''}
                            onChangeText={(text) => {
                              const price = parseFloat(text) || 0;
                              updateExistingProductPrice(product.productId, price);
                            }}
                          />
                        </View>
                        
                        <View style={styles.subtotalContainer}>
                          <View style={styles.subtotalRow}>
                            <Text style={styles.subtotalLabel}>Subtotal:</Text>
                            <Text style={styles.subtotalValue}>₱{product.subtotal.toFixed(2)}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
                
                <View style={styles.bottomPadding} />
              </>
            )}
          </ScrollView>
        </>
      )}

      {/* Save Button */}
      {mode === 'existing' && existingProducts.some(p => p.selected) ? (
        <View style={styles.bottomSummaryContainer}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryHeaderText}>
              {existingProducts.filter(p => p.selected).length} product{existingProducts.filter(p => p.selected).length !== 1 ? 's' : ''} selected
            </Text>
            <Text style={styles.summaryTotalText}>
              Total: ₱{existingProducts.filter(p => p.selected).reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveExistingProducts}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.saveButtonText}>
                  Processing {savingProgress.current}/{savingProgress.total}...
                </Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Proceed to Payment</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={mode === 'new' ? handleSaveAllItems : handleSaveExistingProducts}
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
                {mode === 'new'
                  ? `Save Purchase Order (${purchaseCards.filter(p => p.productName.trim()).length} ${purchaseCards.filter(p => p.productName.trim()).length !== 1 ? 'items' : 'item'})`
                  : 'Proceed to Payment'
                }
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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

      {/* Expiry Date Picker Modal */}
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

      {/* Delivery Date Picker Modal */}
      <CalendarDatePickerModal
        visible={showDeliveryDatePicker}
        onClose={() => setShowDeliveryDatePicker(false)}
        onConfirm={(date) => {
          setDeliveryDate(date);
          setShowDeliveryDatePicker(false);
        }}
        initialDate={deliveryDate}
        minDate={new Date()}
        title="Select Delivery Date"
        description="When do you expect the delivery?"
      />
    </View>
  );
};

// Styles - EXACT match with add-product.tsx
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

  // Supplier Info Card
  supplierInfoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: s(20),
    marginBottom: vs(15),
    borderRadius: s(15),
    padding: s(15),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  supplierLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(5),
  },

  supplierName: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.darkGray,
    marginBottom: vs(10),
  },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  deliveryLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },

  dateText: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    marginRight: s(5),
  },

  dateIcon: {
    fontSize: ms(14),
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

  // Category Input Row (Textbox + Dropdown Button)
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
    paddingVertical: vs(10),
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
  
  // Mode Selector
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
    backgroundColor: Colors.backgroundGray,
    gap: s(10),
  },
  
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: vs(12),
    paddingHorizontal: s(12),
    borderRadius: s(12),
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  
  radioButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: '#ECFDF5',
  },
  
  radioCircle: {
    width: s(20),
    height: s(20),
    borderRadius: s(10),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: s(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  radioCircleInner: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: Colors.primary,
  },
  
  radioText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
  },
  
  radioTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Search Container
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: s(20),
    marginBottom: vs(16),
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    borderRadius: s(12),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  searchIcon: {
    width: s(20),
    height: s(20),
    marginRight: s(10),
    tintColor: 'rgba(30, 30, 30, 0.5)',
  },
  
  searchInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
  },
  
  // Loading Container
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(60),
  },
  
  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
    fontFamily: Fonts.primary,
  },
  
  // Empty Container
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(60),
  },
  
  emptyIcon: {
    fontSize: s(60),
    marginBottom: vs(16),
    textAlign: 'center',
  },
  
  emptyText: {
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(8),
    textAlign: 'center',
  },
  
  emptySubtext: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },
  
  // Restock-style Product Cards
  restockProductCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    marginBottom: vs(12),
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  restockProductHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(16),
  },
  
  checkbox: {
    width: s(24),
    height: s(24),
    borderRadius: s(6),
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 30, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  checkmark: {
    color: Colors.white,
    fontSize: s(16),
    fontWeight: '700',
  },
  
  restockProductImage: {
    width: s(60),
    height: s(60),
    borderRadius: s(8),
    marginRight: s(12),
  },
  
  restockProductImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  
  restockProductImagePlaceholderText: {
    fontSize: s(30),
  },
  
  restockProductHeaderInfo: {
    flex: 1,
  },
  
  restockProductName: {
    fontFamily: Fonts.primary,
    fontSize: s(15),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: vs(4),
  },
  
  restockProductSize: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: 'rgba(30, 30, 30, 0.6)',
    marginBottom: vs(4),
  },
  
  restockProductPrice: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    color: Colors.primary,
    fontWeight: '500',
  },
  
  restockProductStock: {
    fontFamily: Fonts.primary,
    fontSize: s(11),
    color: 'rgba(30, 30, 30, 0.6)',
    marginTop: vs(2),
  },
  
  restockProductInputs: {
    padding: s(16),
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  
  restockInputGroup: {
    marginBottom: vs(12),
  },
  
  restockInputLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.7)',
    marginBottom: vs(6),
  },
  
  restockInput: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: '#1E1E1E',
    backgroundColor: '#F4F6F6',
    borderRadius: s(8),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 30, 0.1)',
  },
  
  subtotalContainer: {
    marginTop: vs(8),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  subtotalLabel: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.6)',
  },
  
  subtotalValue: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '600',
    color: '#1E1E1E',
  },
  
  // Bottom Summary Container
  bottomSummaryContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: s(20),
    paddingTop: vs(15),
    paddingBottom: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 8,
  },
  
  summaryHeader: {
    marginBottom: vs(12),
  },
  
  summaryHeaderText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '600',
    color: '#1E1E1E',
    textAlign: 'center',
  },
  
  summaryTotalText: {
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: vs(4),
  },
});

export default OrderSuppliesScreen;
