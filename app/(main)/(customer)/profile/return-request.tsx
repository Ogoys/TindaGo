/**
 * CUSTOMER RETURN REQUEST SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1428-6097 (Return Request)
 * Baseline: 440x956
 *
 * Allows customers to request returns for products from completed orders.
 * Features:
 * - View products from selected order
 * - Select products to return with checkboxes
 * - Choose quantity to return per product (1 to ordered quantity)
 * - Choose return reason for each selected product
 * - Add optional additional details
 * - Upload photos of damaged/defective items (optional)
 * - Select refund method (Wallet, Original Payment Method, Store Credit)
 * - Submit return request to Firebase
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { ref, get } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { s, vs, ms } from "../../../../src/constants/responsive";
import { Colors } from "../../../../src/constants/Colors";
import { Fonts } from "../../../../src/constants/Fonts";
import { useUser } from '../../../../src/contexts/UserContext';
import { Dropdown, DropdownOption } from '../../../../src/components/ui/Dropdown';
import { QuantitySelector } from '../../../../src/components/ui/QuantitySelector';
import type { Order, OrderItem } from '../../../../src/models/Order';
import type { ReturnReason, RefundMethod } from '../../../../src/models/Return';
import { RETURN_REASONS, REFUND_METHODS } from '../../../../src/models/Return';
import { getProductImageSource } from '../../../../src/lib/helpers/imageHelper';
import { submitCustomerReturnRequest } from '../../../../src/api/returns/customerReturns';
import { uploadReturnPhotos } from '../../../../src/lib/helpers/imageUploadHelper';

interface SelectedReturnItem extends OrderItem {
  returnReason: ReturnReason | string; // Can be predefined or custom text
  quantityToReturn: number;
}

export default function ReturnRequestScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const { user } = useUser();

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedReturnItem>>(new Map());
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('cash');
  const [showRefundSelector, setShowRefundSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Custom reason state per product
  const [customReasons, setCustomReasons] = useState<Map<string, string>>(new Map());

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        setLoading(false);
        Alert.alert("Error", "Order ID not provided");
        router.back();
        return;
      }

      try {
        const orderRef = ref(database, `orders/${orderId}`);
        const snapshot = await get(orderRef);

        if (snapshot.exists()) {
          const orderData = { ...snapshot.val(), id: orderId };
          setOrder(orderData);
        } else {
          Alert.alert("Error", "Order not found");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        Alert.alert("Error", "Failed to load order details");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Request media library permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload images.'
      );
      return false;
    }
    return true;
  };

  // Pick image from library
  const pickImage = async () => {
    if (photoUris.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 photos.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUris([...photoUris, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotoUris(photoUris.filter((_, i) => i !== index));
  };

  // Toggle product selection
  const toggleProductSelection = (item: OrderItem) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      if (newMap.has(item.productId)) {
        newMap.delete(item.productId);
      } else {
        newMap.set(item.productId, {
          ...item,
          returnReason: 'defective',
          quantityToReturn: 1,
        });
      }
      return newMap;
    });
  };

  // Update quantity to return
  const updateQuantityToReturn = (productId: string, quantity: number) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(productId);
      if (item) {
        newMap.set(productId, {
          ...item,
          quantityToReturn: quantity,
        });
      }
      return newMap;
    });
  };

  // Update return reason (dropdown selection) - also update textbox
  const updateReturnReason = (productId: string, reason: ReturnReason) => {
    // Find the label for the selected reason
    const selectedReasonObj = RETURN_REASONS.find(r => r.value === reason);
    const reasonLabel = selectedReasonObj?.label || '';

    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(productId);
      if (item) {
        newMap.set(productId, {
          ...item,
          returnReason: reason,
        });
      }
      return newMap;
    });

    // Auto-fill textbox with the selected reason label
    setCustomReasons(prev => {
      const newMap = new Map(prev);
      if (reasonLabel) {
        newMap.set(productId, reasonLabel);
      }
      return newMap;
    });
  };

  // Update custom reason text
  const updateCustomReason = (productId: string, text: string) => {
    setCustomReasons(prev => {
      const newMap = new Map(prev);
      if (text.trim()) {
        newMap.set(productId, text);
      } else {
        newMap.delete(productId);
      }
      return newMap;
    });
  };


  // Submit return request
  const handleSubmitReturn = async () => {
    // Validation
    if (selectedItems.size === 0) {
      Alert.alert("Error", "Please select at least one product to return");
      return;
    }

    // Check all selected items have valid quantity and reason
    for (const [productId, item] of selectedItems.entries()) {
      if (item.quantityToReturn < 1 || item.quantityToReturn > item.quantity) {
        Alert.alert(
          "Error",
          `Invalid quantity for ${item.productName}. Please select between 1 and ${item.quantity}.`
        );
        return;
      }

      // Check if reason is provided (either dropdown or custom text)
      const customReason = customReasons.get(productId);
      const hasDropdownReason = item.returnReason && item.returnReason !== 'other';
      const hasCustomReason = customReason && customReason.trim().length > 0;

      if (!hasDropdownReason && !hasCustomReason) {
        Alert.alert(
          "Error",
          `Please provide a return reason for ${item.productName} (either select from dropdown or type your own reason)`
        );
        return;
      }

      // If "Other" is selected, custom text is required
      if (item.returnReason === 'other' && !hasCustomReason) {
        Alert.alert(
          "Error",
          `Please specify the return reason for ${item.productName} in the text box`
        );
        return;
      }
    }

    if (!user || !order) {
      Alert.alert("Error", "Unable to submit return request");
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos if any
      let uploadedPhotoUrls: string[] = [];
      if (photoUris.length > 0) {
        uploadedPhotoUrls = await uploadReturnPhotos(
          user.id,
          orderId,
          photoUris
        );
      }

      // Prepare return request data with final reasons (custom text takes priority)
      const returnItems = Array.from(selectedItems.values()).map(item => {
        const customReason = customReasons.get(item.productId);
        const finalReason = customReason && customReason.trim()
          ? customReason.trim()
          : item.returnReason;

        return {
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          productImageUrl: (item as any).productImageUrl,
          quantity: item.quantity, // Original ordered quantity
          quantityReturned: item.quantityToReturn, // Actual quantity being returned
          price: item.price,
          weight: item.weight || '',
          unit: item.unit || '',
          returnReason: finalReason,
        };
      });

      // Submit return request
      const submitData = {
        orderId,
        orderNumber: order.orderNumber,
        customerId: user.id,
        customerName: order.customerName,
        storeId: order.storeId,
        storeName: order.storeName,
        items: returnItems,
        refundMethod: refundMethod,
        additionalDetails: additionalDetails.trim(),
        photoUrls: uploadedPhotoUrls,
      };

      const result = await submitCustomerReturnRequest(submitData);

      if (result.success) {
        Alert.alert(
          "Success",
          "Your return request has been submitted successfully. The store owner will review it shortly.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(main)/(customer)/profile/return-history"),
            }
          ]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to submit return request");
      }
    } catch (error) {
      console.error("Error submitting return request:", error);
      Alert.alert("Error", "Failed to submit return request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  // Get return reason options for dropdown (no icons)
  const getReasonOptions = (): DropdownOption[] => {
    return RETURN_REASONS.map(reason => ({
      label: reason.label,
      value: reason.value,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate estimated refund
  const estimatedRefund = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.quantityToReturn * item.price,
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      {/* HEADER */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Image
            source={require("../../../../src/assets/images/customer-order-history/chevron-left.png")}
            style={styles.backButtonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Return Request</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Info Card */}
        <View style={styles.orderInfoCard}>
          <Text style={styles.orderInfoLabel}>Order Number</Text>
          <Text style={styles.orderInfoValue}>{order.orderNumber}</Text>
          <Text style={[styles.orderInfoLabel, { marginTop: vs(10) }]}>Store</Text>
          <Text style={styles.orderInfoValue}>{order.storeName}</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.instructionText}>
          Select the products you want to return, choose quantity and reason for each item.
        </Text>

        {/* Products List */}
        <View style={styles.productsContainer}>
          {order.items.map((item, index) => {
            const isSelected = selectedItems.has(item.productId);
            const selectedItem = selectedItems.get(item.productId);
            const imageSource = getProductImageSource({
              productImageUrl: (item as any).productImageUrl,
              productImage: item.productImage
            }, 'small');

            return (
              <View key={`${item.productId}-${index}`} style={styles.productCard}>
                {/* Product Info Row */}
                <View style={styles.productRow}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleProductSelection(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkboxBox,
                      isSelected && styles.checkboxBoxChecked
                    ]}>
                      {isSelected && (
                        <Text style={styles.checkboxCheck}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Product Image */}
                  <Image
                    source={imageSource}
                    style={styles.productImage}
                    resizeMode="cover"
                  />

                  {/* Product Details */}
                  <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.productName}
                    </Text>
                    <Text style={styles.productInfo}>
                      {item.weight} {item.unit} • Ordered: {item.quantity}
                    </Text>
                    <Text style={styles.productPrice}>
                      ₱{formatCurrency(item.price)} each
                    </Text>
                  </View>
                </View>

                {/* Return Details - Show only if selected */}
                {isSelected && selectedItem && (
                  <View style={styles.returnDetailsContainer}>
                    {/* Quantity Selector with +/- Buttons */}
                    <QuantitySelector
                      label="Quantity to Return"
                      value={selectedItem.quantityToReturn}
                      min={1}
                      max={item.quantity}
                      onChange={(value) => updateQuantityToReturn(item.productId, value)}
                    />

                    {/* Return Reason - Textbox with Dropdown Button on Side */}
                    <View style={styles.mergedReasonContainer}>
                      <Text style={styles.mergedReasonLabel}>Return Reason</Text>
                      <View style={styles.reasonInputRow}>
                        {/* Textbox - Main Input */}
                        <TextInput
                          style={styles.reasonTextInput}
                          placeholder="Type your reason or select from suggestions..."
                          placeholderTextColor="rgba(30, 30, 30, 0.4)"
                          value={customReasons.get(item.productId) || ''}
                          onChangeText={(text) => updateCustomReason(item.productId, text)}
                          multiline
                          numberOfLines={2}
                          textAlignVertical="top"
                        />

                        {/* Icon-Only Dropdown Button on the Right */}
                        <View style={styles.dropdownButtonContainer}>
                          <Dropdown
                            options={getReasonOptions()}
                            value={selectedItem.returnReason}
                            onSelect={(value) => updateReturnReason(item.productId, value as ReturnReason)}
                            placeholder="Select"
                            iconOnly={true}
                            iconImage={require("../../../../src/assets/images/customer-orders/dropdown-arrow.png")}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Refund Amount for this item */}
                    <View style={styles.itemRefundRow}>
                      <Text style={styles.itemRefundLabel}>Item Refund:</Text>
                      <Text style={styles.itemRefundValue}>
                        ₱{formatCurrency(selectedItem.quantityToReturn * selectedItem.price)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Additional Details (Optional) */}
        {selectedItems.size > 0 && (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Additional Details (Optional)</Text>
              <Text style={styles.sectionHint}>
                Add any additional notes about your return
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., The product was damaged during delivery..."
                placeholderTextColor="rgba(30, 30, 30, 0.4)"
                value={additionalDetails}
                onChangeText={setAdditionalDetails}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Upload Photos */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Upload Photos (Optional)</Text>
              <Text style={styles.sectionHint}>
                Upload photos of damaged or defective items (max 5)
              </Text>

              {/* Photo Grid */}
              {photoUris.length > 0 && (
                <View style={styles.photoGrid}>
                  {photoUris.map((uri, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.photoRemove}
                        onPress={() => removePhoto(index)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.photoRemoveText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Add Photo Button */}
              {photoUris.length < 5 && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.uploadButtonText}>
                    📷 {photoUris.length > 0 ? 'Add Another Photo' : 'Upload Photos'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Refund Method Selector */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Refund Method</Text>
              <Text style={styles.sectionHint}>
                Choose how you want to handle this return
              </Text>
              <TouchableOpacity
                style={styles.refundMethodCard}
                onPress={() => setShowRefundSelector(true)}
                activeOpacity={0.7}
              >
                <View style={styles.refundMethodDisplay}>
                  <Text style={styles.refundMethodText}>
                    {REFUND_METHODS.find(m => m.value === refundMethod)?.label || 'Cash Refund'}
                  </Text>
                  <Text style={styles.refundMethodArrow}>▼</Text>
                </View>
                <Text style={styles.refundMethodDesc}>
                  {REFUND_METHODS.find(m => m.value === refundMethod)?.description || ''}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Selected Items:</Text>
                <Text style={styles.summaryValue}>{selectedItems.size}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items to Return:</Text>
                <Text style={styles.summaryValue}>
                  {Array.from(selectedItems.values()).reduce(
                    (sum, item) => sum + item.quantityToReturn,
                    0
                  )}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                <Text style={styles.summaryLabelTotal}>Estimated Refund:</Text>
                <Text style={styles.summaryValueTotal}>
                  ₱{formatCurrency(estimatedRefund)}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (selectedItems.size === 0 || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitReturn}
            disabled={selectedItems.size === 0 || submitting}
            activeOpacity={0.7}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Refund Method Selector Modal */}
      <Modal
        visible={showRefundSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRefundSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.refundMethodSelectorModal}>
            <Text style={styles.modalTitle}>Select Refund Method</Text>
            {REFUND_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.refundMethodOption,
                  refundMethod === method.value && styles.refundMethodOptionSelected
                ]}
                onPress={() => {
                  setRefundMethod(method.value);
                  setShowRefundSelector(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.refundMethodOptionContent}>
                  <Text style={styles.refundMethodOptionTitle}>{method.label}</Text>
                  <Text style={styles.refundMethodOptionDesc}>{method.description}</Text>
                </View>
                {refundMethod === method.value && (
                  <View style={styles.selectedCheckmark}>
                    <Text style={styles.selectedCheckmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#F4F6F6",
  },

  // Header
  header: {
    height: vs(130),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F4F6F6",
  },

  // Back Button
  backButton: {
    position: "absolute",
    left: s(20),
    top: vs(79),
    width: s(30),
    height: s(30),
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonIcon: {
    width: s(15),
    height: s(15),
  },

  // Title
  title: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(20),
    lineHeight: ms(20) * 1.1,
    textAlign: "center",
    color: "#1E1E1E",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  // Order Info Card
  orderInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },

  orderInfoLabel: {
    fontFamily: Fonts.primary,
    fontWeight: "500",
    fontSize: ms(14),
    color: "rgba(30, 30, 30, 0.6)",
    marginBottom: vs(5),
  },

  orderInfoValue: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(16),
    color: "#1E1E1E",
  },

  // Instructions
  instructionText: {
    fontFamily: Fonts.primary,
    fontWeight: "400",
    fontSize: ms(14),
    lineHeight: ms(14) * 1.4,
    color: "rgba(30, 30, 30, 0.7)",
    marginBottom: vs(20),
  },

  // Products Container
  productsContainer: {
    marginBottom: vs(20),
  },

  // Product Card
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: s(15),
    padding: s(15),
    marginBottom: vs(15),
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(3),
    elevation: 2,
  },

  // Product Row
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Checkbox
  checkbox: {
    marginRight: s(12),
  },

  checkboxBox: {
    width: s(24),
    height: s(24),
    borderRadius: s(6),
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  checkboxCheck: {
    color: "#FFFFFF",
    fontSize: ms(16),
    fontWeight: "700",
  },

  // Product Image
  productImage: {
    width: s(60),
    height: s(60),
    borderRadius: s(10),
    marginRight: s(12),
  },

  // Product Details
  productDetails: {
    flex: 1,
  },

  productName: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(15),
    color: "#1E1E1E",
    marginBottom: vs(4),
  },

  productInfo: {
    fontFamily: Fonts.primary,
    fontWeight: "400",
    fontSize: ms(13),
    color: "rgba(30, 30, 30, 0.6)",
    marginBottom: vs(4),
  },

  productPrice: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(14),
    color: Colors.primary,
  },

  // Return Details Container
  returnDetailsContainer: {
    marginTop: vs(15),
    paddingTop: vs(15),
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  itemRefundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vs(10),
    paddingTop: vs(10),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  itemRefundLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.7)',
  },

  itemRefundValue: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(16),
    color: Colors.primary,
  },

  // Merged Reason Container (Textbox with Dropdown Button on Side)
  mergedReasonContainer: {
    marginTop: vs(10),
  },

  mergedReasonLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(14),
    color: '#1E1E1E',
    marginBottom: vs(8),
  },

  reasonInputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: s(8),
  },

  reasonTextInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: s(10),
    paddingHorizontal: s(15),
    paddingVertical: vs(10),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(14),
    color: '#1E1E1E',
    minHeight: vs(70),
  },

  dropdownButtonContainer: {
    width: s(50), // Reduced width for icon-only button
    height: vs(70), // Exact height to match textbox
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section Card
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },

  sectionLabel: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(15),
    color: "#1E1E1E",
    marginBottom: vs(5),
  },

  sectionHint: {
    fontFamily: Fonts.primary,
    fontWeight: "400",
    fontSize: ms(12),
    color: "rgba(30, 30, 30, 0.6)",
    marginBottom: vs(15),
  },

  // Text Area
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: s(10),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: ms(14),
    color: '#1E1E1E',
    minHeight: vs(100),
  },

  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: vs(15),
    gap: s(10),
  },

  photoContainer: {
    position: 'relative',
    width: s(80),
    height: s(80),
  },

  photo: {
    width: '100%',
    height: '100%',
    borderRadius: s(10),
  },

  photoRemove: {
    position: 'absolute',
    top: -s(8),
    right: -s(8),
    width: s(24),
    height: s(24),
    borderRadius: s(12),
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(2),
    elevation: 2,
  },

  photoRemoveText: {
    color: '#FFFFFF',
    fontSize: ms(14),
    fontWeight: '700',
  },

  // Upload Button
  uploadButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: s(10),
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: '#1E1E1E',
  },

  // Refund Method Card
  refundMethodCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: s(10),
    padding: s(15),
  },

  refundMethodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(8),
  },

  refundMethodText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: '#1E1E1E',
  },

  refundMethodArrow: {
    fontSize: ms(12),
    color: Colors.primary,
  },

  refundMethodDesc: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.6)',
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Refund Method Selector Modal
  refundMethodSelectorModal: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    marginHorizontal: s(30),
    padding: s(20),
    width: '85%',
  },

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(20),
    color: '#1E1E1E',
    marginBottom: vs(20),
    textAlign: 'center',
  },

  refundMethodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(16),
    paddingHorizontal: s(15),
    borderRadius: s(12),
    backgroundColor: Colors.white,
    marginBottom: vs(12),
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  refundMethodOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 183, 126, 0.08)',
  },

  refundMethodOptionContent: {
    flex: 1,
    marginRight: s(10),
  },

  refundMethodOptionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: '#1E1E1E',
    marginBottom: vs(4),
  },

  refundMethodOptionDesc: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: 'rgba(30, 30, 30, 0.6)',
    lineHeight: vs(18),
  },

  selectedCheckmark: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedCheckmarkText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '700',
    color: Colors.white,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: s(20),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
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
    fontWeight: "500",
    fontSize: ms(14),
    color: "rgba(30, 30, 30, 0.7)",
  },

  summaryValue: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(16),
    color: "#1E1E1E",
  },

  summaryLabelTotal: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(16),
    color: "#1E1E1E",
  },

  summaryValueTotal: {
    fontFamily: Fonts.primary,
    fontWeight: "700",
    fontSize: ms(20),
    color: Colors.primary,
  },

  // Button Container
  buttonContainer: {
    flexDirection: 'row',
    gap: s(15),
    marginBottom: vs(20),
  },

  // Cancel Button
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 2,
  },

  cancelButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(16),
    color: "#1E1E1E",
  },

  // Submit Button
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 4,
  },

  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },

  submitButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: ms(16),
    color: "#FFFFFF",
  },

  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: vs(15),
    fontSize: ms(16),
    fontFamily: Fonts.primary,
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },

  errorText: {
    fontSize: ms(18),
    fontFamily: Fonts.primary,
    fontWeight: '600',
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },

  // Bottom Padding
  bottomPadding: {
    height: vs(40),
  },
});
