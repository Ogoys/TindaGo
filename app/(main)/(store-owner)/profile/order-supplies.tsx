/**
 * ORDER SUPPLIES SCREEN - Same structure as Add Product
 *
 * Create orders from suppliers with horizontal scroll product cards
 * Each card has ALL fields split into horizontal sections:
 * - Section 1 (Product Info): Image, Product name, Size, Unit
 * - Section 2 (Order Details): Quantity, Cost per unit, Subtotal
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1571-711, 1571-780
 * Baseline: 440x956
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ref, get, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { PurchaseOrderItem } from '../../../../src/models/PurchaseOrder';
import { CalendarDatePickerModal } from '../../../../src/components/ui/CalendarDatePickerModal';
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
  productImage?: string;
  productImageUrl?: string;
  status: 'available' | 'out_of_stock';
}

interface OrderItemCard {
  id: string;
  productName: string;
  productId?: string;
  productImage?: string;
  productImageUrl?: string;
  productSize: string;
  unit: string;
  quantity: string;
  costPerUnit: string;
  notes: string;
}

// Common units for products
const UNITS = [
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
  { id: '11', name: 'dozen' },
  { id: '12', name: 'case' },
];

const OrderSuppliesScreen = () => {
  const params = useLocalSearchParams();

  // Supplier info from navigation params
  const supplierNameParam = typeof params.supplierName === 'string' ? params.supplierName : '';
  const supplierContactParam = typeof params.supplierContact === 'string' ? params.supplierContact : '';
  const preSelectedProductId = typeof params.preSelectedProductId === 'string' ? params.preSelectedProductId : '';

  // Form state
  const [supplierName, setSupplierName] = useState(supplierNameParam);
  const [orderDate, setOrderDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  });

  // Order item cards - multiple products
  const [orderCards, setOrderCards] = useState<OrderItemCard[]>([createEmptyOrderItem()]);

  // Modal states
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [currentEditingCardId, setCurrentEditingCardId] = useState<string | null>(null);

  // Products from inventory
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [storeName, setStoreName] = useState('My Store');

  // Create empty order item
  function createEmptyOrderItem(): OrderItemCard {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      productName: '',
      productSize: '',
      unit: 'pcs',
      quantity: '1',
      costPerUnit: '',
      notes: '',
    };
  }

  // Fetch store info and products on mount
  useEffect(() => {
    fetchStoreInfo();
    fetchProducts();
  }, []);

  // Pre-select product if passed from supplier details
  useEffect(() => {
    if (preSelectedProductId && products.length > 0) {
      const product = products.find(p => p.id === preSelectedProductId);
      if (product && orderCards.length > 0) {
        updateOrderCard(orderCards[0].id, 'productName', product.productName);
        updateOrderCard(orderCards[0].id, 'productId', product.id);
        updateOrderCard(orderCards[0].id, 'productImage', product.productImage);
        updateOrderCard(orderCards[0].id, 'productImageUrl', product.productImageUrl);
        updateOrderCard(orderCards[0].id, 'productSize', product.productSize);
        updateOrderCard(orderCards[0].id, 'unit', product.unit);
        // Set suggested cost (80% of retail price)
        const suggestedCost = Math.round(product.price * 0.8);
        updateOrderCard(orderCards[0].id, 'costPerUnit', suggestedCost.toString());
      }
    }
  }, [preSelectedProductId, products]);

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
    if (!currentUser) return;

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
    });

    return unsubscribe;
  };

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totalItems = orderCards.filter(c => c.productName.trim()).length;
  const totalQuantity = orderCards.reduce((sum, card) => {
    const qty = parseInt(card.quantity) || 0;
    return sum + qty;
  }, 0);
  const totalCost = orderCards.reduce((sum, card) => {
    const qty = parseInt(card.quantity) || 0;
    const cost = parseFloat(card.costPerUnit) || 0;
    return sum + (qty * cost);
  }, 0);

  const handleBack = () => {
    if (orderCards.some(c => c.productName.trim())) {
      Alert.alert(
        'Discard Order?',
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

  // Update a specific order card field
  const updateOrderCard = (cardId: string, field: keyof OrderItemCard, value: string | undefined) => {
    setOrderCards(cards =>
      cards.map(card =>
        card.id === cardId ? { ...card, [field]: value } : card
      )
    );
  };

  // Add new order card
  const handleAddNewOrderCard = () => {
    setOrderCards([...orderCards, createEmptyOrderItem()]);
  };

  // Remove order card
  const handleRemoveOrderCard = (cardId: string) => {
    if (orderCards.length === 1) {
      Alert.alert('Cannot Remove', 'You need at least one product card.');
      return;
    }
    setOrderCards(cards => cards.filter(card => card.id !== cardId));
  };

  // Handle product selection from inventory
  const handleSelectProduct = (product: Product) => {
    if (currentEditingCardId) {
      updateOrderCard(currentEditingCardId, 'productName', product.productName);
      updateOrderCard(currentEditingCardId, 'productId', product.id);
      updateOrderCard(currentEditingCardId, 'productImage', product.productImage);
      updateOrderCard(currentEditingCardId, 'productImageUrl', product.productImageUrl);
      updateOrderCard(currentEditingCardId, 'productSize', product.productSize);
      updateOrderCard(currentEditingCardId, 'unit', product.unit);
      // Set suggested cost (80% of retail price)
      const suggestedCost = Math.round(product.price * 0.8);
      updateOrderCard(currentEditingCardId, 'costPerUnit', suggestedCost.toString());
    }
    setShowProductSelector(false);
    setCurrentEditingCardId(null);
    setSearchQuery('');
  };

  // Handle unit selection
  const handleUnitSelect = (unit: { id: string; name: string }) => {
    if (currentEditingCardId) {
      updateOrderCard(currentEditingCardId, 'unit', unit.name);
    }
    setShowUnitDropdown(false);
    setCurrentEditingCardId(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Validate order
  const validateOrder = (): { valid: boolean; error?: string } => {
    if (!supplierName.trim()) {
      return { valid: false, error: 'Supplier name is required' };
    }

    const validCards = orderCards.filter(c => c.productName.trim());
    if (validCards.length === 0) {
      return { valid: false, error: 'Please add at least one product' };
    }

    for (let i = 0; i < validCards.length; i++) {
      const card = validCards[i];
      const qty = parseInt(card.quantity);
      const cost = parseFloat(card.costPerUnit);

      if (!card.productName.trim()) {
        return { valid: false, error: `Product #${i + 1}: Name is required` };
      }
      if (isNaN(qty) || qty <= 0) {
        return { valid: false, error: `${card.productName}: Invalid quantity` };
      }
      if (isNaN(cost) || cost <= 0) {
        return { valid: false, error: `${card.productName}: Invalid cost per unit` };
      }
    }

    return { valid: true };
  };

  // Place order
  const handlePlaceOrder = async () => {
    const validation = validateOrder();
    if (!validation.valid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    // Prepare items for purchase order
    const validCards = orderCards.filter(c => c.productName.trim());
    const items: PurchaseOrderItem[] = validCards.map(card => ({
      productId: card.productId || card.id,
      productName: card.productName,
      productImage: card.productImage,
      productImageUrl: card.productImageUrl,
      quantity: parseInt(card.quantity) || 0,
      costPerUnit: parseFloat(card.costPerUnit) || 0,
      subtotal: (parseInt(card.quantity) || 0) * (parseFloat(card.costPerUnit) || 0),
      productSize: card.productSize || '',
      unit: card.unit || 'pcs',
    }));

    // Navigate to payment screen with order data
    router.push({
      pathname: '/(main)/(store-owner)/profile/purchase-payment' as any,
      params: {
        supplierName: supplierName.trim(),
        supplierContact: supplierContactParam || '',
        purchaseDate: orderDate.toISOString().split('T')[0],
        notes: `Expected delivery: ${formatDate(deliveryDate)}`,
        items: JSON.stringify(items),
      },
    });
  };

  // Calculate subtotal for a card
  const getCardSubtotal = (card: OrderItemCard): number => {
    const qty = parseInt(card.quantity) || 0;
    const cost = parseFloat(card.costPerUnit) || 0;
    return qty * cost;
  };

  // Render a single order card with horizontal scroll sections
  const renderOrderCard = (card: OrderItemCard, index: number) => {
    const imageSource = card.productImageUrl || card.productImage
      ? getProductImageSource(card)
      : null;
    const subtotal = getCardSubtotal(card);

    return (
      <View key={card.id} style={styles.productCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIndexBadge}>
            <Text style={styles.cardIndexText}>#{index + 1}</Text>
          </View>
          <Text style={styles.cardTitle}>Product Details</Text>
          {orderCards.length > 1 && (
            <TouchableOpacity
              style={styles.removeCardButton}
              onPress={() => handleRemoveOrderCard(card.id)}
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
          {/* SECTION 1: Product Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Info</Text>

            {/* Product Image - Tap to select from inventory */}
            <TouchableOpacity
              style={styles.uploadContainer}
              onPress={() => {
                setCurrentEditingCardId(card.id);
                setShowProductSelector(true);
              }}
              activeOpacity={0.7}
            >
              {imageSource ? (
                <Image source={imageSource} style={styles.selectedImagePreview} />
              ) : (
                <>
                  <Text style={styles.uploadIcon}>📦</Text>
                  <Text style={styles.uploadText}>Tap to select product</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Product Name with Select Button */}
            <Text style={styles.fieldLabel}>Product Name</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={styles.textInputFlex}
                placeholder="Enter or select product"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={card.productName}
                onChangeText={(text) => updateOrderCard(card.id, 'productName', text)}
              />
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  setCurrentEditingCardId(card.id);
                  setShowProductSelector(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.selectButtonText}>▼</Text>
              </TouchableOpacity>
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
                    value={card.productSize}
                    onChangeText={(text) => updateOrderCard(card.id, 'productSize', text)}
                  />
                </View>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Unit</Text>
                <TouchableOpacity
                  style={styles.dropdownContainerSmall}
                  onPress={() => {
                    setCurrentEditingCardId(card.id);
                    setShowUnitDropdown(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownTextSmall, card.unit && styles.dropdownTextSelected]}>
                    {card.unit || 'Unit'}
                  </Text>
                  <Text style={styles.dropdownArrowSmall}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes (Optional) */}
            <Text style={styles.fieldLabel}>Notes (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Any special instructions..."
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={card.notes}
                onChangeText={(text) => updateOrderCard(card.id, 'notes', text)}
              />
            </View>
          </View>

          {/* SECTION 2: Order Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Details</Text>

            {/* Quantity */}
            <Text style={styles.fieldLabel}>Quantity to Order</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => {
                  const current = parseInt(card.quantity) || 1;
                  if (current > 1) {
                    updateOrderCard(card.id, 'quantity', String(current - 1));
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.qtyButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                value={card.quantity}
                onChangeText={(text) => updateOrderCard(card.id, 'quantity', text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                textAlign="center"
              />
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => {
                  const current = parseInt(card.quantity) || 0;
                  updateOrderCard(card.id, 'quantity', String(current + 1));
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Cost Per Unit */}
            <Text style={styles.fieldLabel}>Cost Per Unit (Supplier Price)</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={card.costPerUnit}
                onChangeText={(text) => updateOrderCard(card.id, 'costPerUnit', text)}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Subtotal Display */}
            <View style={styles.subtotalContainer}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>₱{subtotal.toFixed(2)}</Text>
            </View>

            {/* Quick Info */}
            {card.productName && (
              <View style={styles.quickInfoBox}>
                <Text style={styles.quickInfoTitle}>Order Summary</Text>
                <Text style={styles.quickInfoText}>
                  {card.quantity || 0} × {card.productSize || '?'}{card.unit} {card.productName}
                </Text>
                <Text style={styles.quickInfoText}>
                  @ ₱{parseFloat(card.costPerUnit || '0').toFixed(2)} each
                </Text>
              </View>
            )}
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
            source={require('../../../../src/assets/images/store-owner-order-supplies/chevron-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Order Supplies</Text>
        <View style={styles.productCountBadge}>
          <Text style={styles.productCountText}>{totalItems}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Order Info Card */}
          <View style={styles.orderInfoCard}>
            <Text style={styles.orderInfoTitle}>Order Information</Text>

            {/* Supplier Name */}
            <Text style={styles.fieldLabel}>Supplier Name</Text>
            <View style={styles.supplierBox}>
              <Text style={styles.supplierName}>{supplierName || 'Unknown Supplier'}</Text>
            </View>

            {/* Date Fields Row */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Order Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowOrderDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateText}>{formatDate(orderDate)}</Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Delivery Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDeliveryDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateText}>{formatDate(deliveryDate)}</Text>
                  <Text style={styles.dateIcon}>📅</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Products Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Products to Order</Text>
            <Text style={styles.sectionHeaderCount}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} • {totalQuantity} units
            </Text>
          </View>

          {/* Product Cards */}
          {orderCards.map((card, index) => renderOrderCard(card, index))}

          {/* Add Another Product Button */}
          <TouchableOpacity
            style={styles.addAnotherButton}
            onPress={handleAddNewOrderCard}
            activeOpacity={0.7}
          >
            <View style={styles.addAnotherIcon}>
              <Text style={styles.addAnotherIconText}>+</Text>
            </View>
            <Text style={styles.addAnotherText}>Add Another Product</Text>
          </TouchableOpacity>

          {/* Order Summary */}
          {totalItems > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Products</Text>
                <Text style={styles.summaryValue}>{totalItems}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Units</Text>
                <Text style={styles.summaryValue}>{totalQuantity}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                <Text style={styles.summaryLabelTotal}>Total Cost</Text>
                <Text style={styles.summaryValueTotal}>₱{totalCost.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Place Order Button */}
      <View style={styles.placeOrderContainer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, (totalItems === 0 || placing) && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          activeOpacity={0.7}
          disabled={totalItems === 0 || placing}
        >
          {placing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Place Order • ₱{totalCost.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Selector Modal */}
      <Modal
        visible={showProductSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProductSelector(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProductSelector(false)}
        >
          <View style={styles.productSelectorModal}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowProductSelector(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Select Product</Text>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Products List */}
            <ScrollView style={styles.productsList} showsVerticalScrollIndicator={true}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const imgSource = getProductImageSource(product);
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.productOption}
                      onPress={() => handleSelectProduct(product)}
                      activeOpacity={0.7}
                    >
                      <Image source={imgSource} style={styles.productOptionImage} />
                      <View style={styles.productOptionInfo}>
                        <Text style={styles.productOptionName}>{product.productName}</Text>
                        <Text style={styles.productOptionDetails}>
                          {product.productSize}{product.unit} • ₱{product.price.toFixed(2)}
                        </Text>
                        <Text style={styles.productOptionStock}>
                          Stock: {product.quantity} {product.unit}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyProducts}>
                  <Text style={styles.emptyProductsText}>No products found</Text>
                  <Text style={styles.emptyProductsHint}>
                    You can still type a custom product name
                  </Text>
                </View>
              )}
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

            <Text style={styles.modalTitle}>Select Unit</Text>
            <ScrollView style={styles.unitsList} showsVerticalScrollIndicator={true}>
              {UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={styles.unitOption}
                  onPress={() => handleUnitSelect(unit)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.unitOptionText}>{unit.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Order Date Picker */}
      <CalendarDatePickerModal
        visible={showOrderDatePicker}
        onClose={() => setShowOrderDatePicker(false)}
        onConfirm={(date) => {
          setOrderDate(date);
          setShowOrderDatePicker(false);
        }}
        initialDate={orderDate}
        title="Select Order Date"
        description="When are you placing this order?"
      />

      {/* Delivery Date Picker */}
      <CalendarDatePickerModal
        visible={showDeliveryDatePicker}
        onClose={() => setShowDeliveryDatePicker(false)}
        onConfirm={(date) => {
          setDeliveryDate(date);
          setShowDeliveryDatePicker(false);
        }}
        initialDate={deliveryDate}
        minDate={orderDate}
        title="Select Delivery Date"
        description="When do you expect the delivery?"
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

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(100),
  },

  // Order Info Card
  orderInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  orderInfoTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(15),
  },

  supplierBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: s(12),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    marginBottom: vs(15),
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  supplierName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: s(12),
    paddingHorizontal: s(12),
    paddingVertical: vs(12),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },

  dateText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  dateIcon: {
    fontSize: ms(16),
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  sectionHeaderTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
  },

  sectionHeaderCount: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: 'rgba(30, 30, 30, 0.6)',
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
    fontSize: ms(40),
    marginBottom: vs(8),
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

  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    marginBottom: vs(12),
    overflow: 'hidden',
  },

  textInputFlex: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
  },

  selectButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectButtonText: {
    color: Colors.white,
    fontSize: ms(12),
    fontWeight: '700',
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

  dropdownTextSelected: {
    color: '#1E1E1E',
  },

  dropdownArrowSmall: {
    fontSize: ms(10),
    color: Colors.darkGray,
  },

  // Quantity Controls
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(15),
  },

  qtyButton: {
    width: s(45),
    height: s(45),
    borderRadius: s(12),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qtyButtonText: {
    fontSize: ms(24),
    color: Colors.white,
    fontWeight: '700',
  },

  qtyInput: {
    flex: 1,
    marginHorizontal: s(15),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingVertical: vs(10),
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    fontWeight: '600',
    color: '#1E1E1E',
  },

  // Price Input
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: Colors.white,
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    marginBottom: vs(15),
  },

  pesoSign: {
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    fontWeight: '700',
    color: Colors.primary,
    marginRight: s(8),
  },

  priceInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: '#1E1E1E',
  },

  // Subtotal
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderRadius: s(12),
    padding: s(15),
    marginBottom: vs(15),
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  subtotalLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  subtotalValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: Colors.primary,
  },

  // Quick Info Box
  quickInfoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: s(12),
    padding: s(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  quickInfoTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(12),
    color: Colors.darkGray,
    marginBottom: vs(5),
  },

  quickInfoText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.7)',
    lineHeight: ms(18),
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
    marginBottom: vs(20),
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

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  summaryTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(15),
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },

  summaryRowTotal: {
    marginTop: vs(10),
    paddingTop: vs(15),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 0,
  },

  summaryLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.7)',
  },

  summaryValue: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
  },

  summaryLabelTotal: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
  },

  summaryValueTotal: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(22),
    color: Colors.primary,
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(20),
  },

  // Place Order Button
  placeOrderContainer: {
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

  placeOrderButton: {
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

  placeOrderButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.6)',
  },

  placeOrderButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
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

  productSelectorModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: s(360),
    maxHeight: '80%',
    padding: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },

  dropdownModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    width: s(300),
    maxHeight: '60%',
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

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: vs(15),
  },

  // Search
  searchContainer: {
    marginBottom: vs(15),
  },

  searchInput: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: s(12),
    backgroundColor: '#F9FAFB',
    paddingHorizontal: s(15),
    paddingVertical: vs(10),
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: '#1E1E1E',
  },

  // Products List
  productsList: {
    maxHeight: vs(400),
  },

  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  productOptionImage: {
    width: s(50),
    height: s(50),
    borderRadius: s(10),
    marginRight: s(12),
    backgroundColor: '#F3F4F6',
  },

  productOptionInfo: {
    flex: 1,
  },

  productOptionName: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(2),
  },

  productOptionDetails: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.6)',
  },

  productOptionStock: {
    fontFamily: Fonts.primary,
    fontSize: ms(11),
    color: Colors.primary,
    marginTop: vs(2),
  },

  emptyProducts: {
    paddingVertical: vs(30),
    alignItems: 'center',
  },

  emptyProductsText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.5)',
    marginBottom: vs(5),
  },

  emptyProductsHint: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.4)',
  },

  // Units List
  unitsList: {
    maxHeight: vs(300),
  },

  unitOption: {
    paddingVertical: vs(15),
    paddingHorizontal: s(15),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  unitOptionText: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    color: Colors.darkGray,
  },
});

export default OrderSuppliesScreen;
