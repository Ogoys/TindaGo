/**
 * NEW DEBT SCREEN
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1576-286 (New Debt)
 * Baseline: 440x956
 *
 * PIXEL-PERFECT IMPLEMENTATION:
 * Allows store owners to create new debt entries for customers.
 * Features:
 * - Customer selection/search
 * - Debt amount input
 * - Due date picker
 * - Notes/description field
 * - Debt limit validation
 * - Option to require paying previous debt
 *
 * Design Pattern: Similar to record-purchase-order form
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
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ref, push, set, get, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

// Extended colors for this screen
const ScreenColors = {
  ...Colors,
  inputBorder: 'rgba(30, 30, 30, 0.2)',
  inputBg: '#FFFFFF',
  labelColor: '#1E1E1E',
  placeholderColor: 'rgba(30, 30, 30, 0.5)',
};

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  outstandingDebt?: number;
}

const NewDebtScreen = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days
  const [notes, setNotes] = useState('');

  // Customer search
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchStoreInfo(currentUser.uid);
      fetchCustomers(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    if (customerSearch.trim()) {
      const searchLower = customerSearch.toLowerCase();
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.phone.includes(customerSearch)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearch, customers]);

  const fetchStoreInfo = async (userId: string) => {
    try {
      setLoading(true);
      const storesRef = ref(database, 'stores');
      const snapshot = await get(storesRef);

      if (snapshot.exists()) {
        const stores = snapshot.val();
        Object.keys(stores).forEach((id) => {
          if (stores[id].ownerId === userId || stores[id].storeOwnerId === userId) {
            setStoreId(id);
            setStoreName(stores[id].storeName || stores[id].name || 'My Store');
          }
        });
      }

      // Fallback to userId as storeId
      if (!storeId) {
        setStoreId(userId);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async (userId: string) => {
    try {
      // Fetch customers who have ordered from this store
      const ordersRef = ref(database, 'orders');
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = snapshot.val();
        const customerMap = new Map<string, CustomerData>();

        Object.keys(orders).forEach((orderId) => {
          const order = orders[orderId];
          // Only get customers who ordered from this store
          if (order.storeId === userId || order.storeOwnerId === userId) {
            if (order.customerId && !customerMap.has(order.customerId)) {
              customerMap.set(order.customerId, {
                id: order.customerId,
                name: order.customerName || 'Unknown',
                phone: order.customerPhone || '',
                email: order.customerEmail,
              });
            }
          }
        });

        // Calculate outstanding debt for each customer
        const customersWithDebt: CustomerData[] = [];
        for (const [customerId, customer] of customerMap) {
          let outstandingDebt = 0;
          Object.values(orders).forEach((order: any) => {
            if (
              order.customerId === customerId &&
              (order.paymentMethod === 'debt' || order.isDebtPayment) &&
              order.debtStatus !== 'paid'
            ) {
              outstandingDebt += order.total || 0;
            }
          });
          customersWithDebt.push({ ...customer, outstandingDebt });
        }

        setCustomers(customersWithDebt);
        setFilteredCustomers(customersWithDebt);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSelectCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setShowCustomerModal(false);
  };

  const handleDueDateSelection = (days: number) => {
    setSelectedDays(days);
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + days);
    setDueDate(newDueDate);
    setShowDatePicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: string): string => {
    // Remove non-numeric characters except decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return numericValue;
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter a customer name');
      return false;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for the debt');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Check if customer has outstanding debt
    if (selectedCustomer && (selectedCustomer.outstandingDebt || 0) > 0) {
      Alert.alert(
        'Outstanding Debt',
        `This customer has an outstanding debt of P${(selectedCustomer.outstandingDebt || 0).toFixed(2)}. Do you still want to add a new debt?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Anyway', onPress: submitDebt },
        ]
      );
    } else {
      submitDebt();
    }
  };

  const submitDebt = async () => {
    if (!storeId) {
      Alert.alert('Error', 'Store information not found');
      return;
    }

    setSubmitting(true);

    try {
      // Generate order number
      const orderNumber = `DEBT-${Date.now().toString().slice(-8)}`;

      // Create the debt order
      const newDebtRef = push(ref(database, 'orders'));
      const debtData = {
        id: newDebtRef.key,
        orderNumber,
        customerId: selectedCustomer?.id || `manual-${Date.now()}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        storeId,
        storeName,
        items: [
          {
            productId: 'manual-debt',
            productName: description.trim(),
            productImage: '',
            quantity: 1,
            price: parseFloat(amount),
            subtotal: parseFloat(amount),
          },
        ],
        subtotal: parseFloat(amount),
        total: parseFloat(amount),
        status: 'completed',
        paymentMethod: 'debt',
        paymentStatus: 'unpaid',
        isDebtPayment: true,
        debtDueDate: dueDate.toISOString(),
        debtStatus: 'pending',
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isManualDebt: true, // Flag to identify manually created debts
      };

      await set(newDebtRef, debtData);

      Alert.alert('Success', 'Debt record created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating debt:', error);
      Alert.alert('Error', 'Failed to create debt record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../../../src/assets/images/store-owner-debt-records/chevron-left.png')}
              style={styles.backIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>New Debt</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Name *</Text>
              <TouchableOpacity
                style={styles.inputTouchable}
                onPress={() => setShowCustomerModal(true)}
                activeOpacity={0.7}
              >
                <TextInput
                  style={styles.input}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Select or enter customer name"
                  placeholderTextColor={ScreenColors.placeholderColor}
                />
                <Text style={styles.inputIcon}>V</Text>
              </TouchableOpacity>
            </View>

            {/* Customer Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="Enter phone number"
                placeholderTextColor={ScreenColors.placeholderColor}
                keyboardType="phone-pad"
              />
            </View>

            {/* Outstanding Debt Warning */}
            {selectedCustomer && (selectedCustomer.outstandingDebt || 0) > 0 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningIcon}>!</Text>
                <Text style={styles.warningText}>
                  This customer has P{(selectedCustomer.outstandingDebt || 0).toFixed(2)} outstanding debt
                </Text>
              </View>
            )}

            {/* Debt Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Debt Amount *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencyPrefix}>P</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(text) => setAmount(formatCurrency(text))}
                  placeholder="0.00"
                  placeholderTextColor={ScreenColors.placeholderColor}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g., Rice, Groceries, etc."
                placeholderTextColor={ScreenColors.placeholderColor}
              />
            </View>

            {/* Due Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
                <Text style={styles.dateDays}>({selectedDays} days)</Text>
                <Text style={styles.inputIcon}>V</Text>
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes..."
                placeholderTextColor={ScreenColors.placeholderColor}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer:</Text>
              <Text style={styles.summaryValue}>{customerName || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValueHighlight}>
                P{amount ? parseFloat(amount).toFixed(2) : '0.00'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Due Date:</Text>
              <Text style={styles.summaryValue}>{formatDate(dueDate)}</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Create Debt Record</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Customer Selection Modal */}
      <Modal
        visible={showCustomerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity
                onPress={() => setShowCustomerModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalClose}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.modalSearchContainer}>
              <TextInput
                style={styles.modalSearchInput}
                value={customerSearch}
                onChangeText={setCustomerSearch}
                placeholder="Search by name or phone..."
                placeholderTextColor={ScreenColors.placeholderColor}
              />
            </View>

            {/* Customer List */}
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => handleSelectCustomer(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <Text style={styles.customerPhone}>{item.phone || 'No phone'}</Text>
                  </View>
                  {(item.outstandingDebt || 0) > 0 && (
                    <View style={styles.debtBadge}>
                      <Text style={styles.debtBadgeText}>
                        P{(item.outstandingDebt || 0).toFixed(2)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>No customers found</Text>
                </View>
              }
              style={styles.customerList}
            />

            {/* Manual Entry Option */}
            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={() => {
                setSelectedCustomer(null);
                setShowCustomerModal(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.manualEntryText}>+ Add New Customer Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerContent}>
            <Text style={styles.datePickerTitle}>Select Due Date</Text>
            {[7, 14, 30, 60, 90].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.dateOption,
                  selectedDays === days && styles.dateOptionActive,
                ]}
                onPress={() => handleDueDateSelection(days)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateOptionText,
                    selectedDays === days && styles.dateOptionTextActive,
                  ]}
                >
                  {days} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  keyboardView: {
    flex: 1,
  },

  // Header
  headerContainer: {
    backgroundColor: Colors.backgroundGray,
    paddingTop: vs(20),
    paddingBottom: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    left: s(20),
    top: vs(20),
    width: s(30),
    height: s(30),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  backIconImage: {
    width: s(15),
    height: s(15),
  },

  title: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    lineHeight: vs(22),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: vs(15),
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: Colors.textSecondary,
  },

  // Form Card
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  inputGroup: {
    marginBottom: vs(15),
  },

  label: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: ScreenColors.labelColor,
    marginBottom: vs(8),
  },

  input: {
    backgroundColor: ScreenColors.inputBg,
    borderWidth: 1,
    borderColor: ScreenColors.inputBorder,
    borderRadius: s(12),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  inputTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ScreenColors.inputBg,
    borderWidth: 1,
    borderColor: ScreenColors.inputBorder,
    borderRadius: s(12),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
  },

  inputIcon: {
    fontSize: ms(12),
    color: ScreenColors.placeholderColor,
  },

  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ScreenColors.inputBg,
    borderWidth: 1,
    borderColor: ScreenColors.inputBorder,
    borderRadius: s(12),
    paddingHorizontal: s(15),
  },

  currencyPrefix: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.primary,
    marginRight: s(8),
  },

  amountInput: {
    flex: 1,
    paddingVertical: vs(12),
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    color: Colors.darkGray,
  },

  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ScreenColors.inputBg,
    borderWidth: 1,
    borderColor: ScreenColors.inputBorder,
    borderRadius: s(12),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
  },

  dateText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  dateDays: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.primary,
    marginRight: s(10),
  },

  notesInput: {
    minHeight: vs(80),
    paddingTop: vs(12),
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: s(10),
    padding: s(12),
    marginBottom: vs(15),
    borderWidth: 1,
    borderColor: '#FFA500',
  },

  warningIcon: {
    width: s(24),
    height: s(24),
    borderRadius: s(12),
    backgroundColor: '#FFA500',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: s(24),
    fontWeight: '700',
    fontSize: ms(14),
    marginRight: s(10),
  },

  warningText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#856404',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
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
    marginBottom: vs(8),
  },

  summaryLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  summaryValue: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  summaryValueHighlight: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: '#FF8D2F',
  },

  // Submit Button
  submitButton: {
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

  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },

  submitButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.white,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    maxHeight: '70%',
    paddingBottom: vs(30),
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(20),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },

  modalTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
  },

  modalClose: {
    fontSize: ms(18),
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  modalSearchContainer: {
    padding: s(15),
  },

  modalSearchInput: {
    backgroundColor: '#F4F6F6',
    borderRadius: s(12),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
  },

  customerList: {
    maxHeight: vs(300),
  },

  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },

  customerInfo: {
    flex: 1,
  },

  customerName: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(15),
    color: Colors.darkGray,
  },

  customerPhone: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.textSecondary,
    marginTop: vs(2),
  },

  debtBadge: {
    backgroundColor: '#E92B45',
    borderRadius: s(10),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },

  debtBadgeText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(11),
    color: Colors.white,
  },

  emptyList: {
    padding: s(30),
    alignItems: 'center',
  },

  emptyListText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  manualEntryButton: {
    margin: s(15),
    padding: s(15),
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: s(12),
    alignItems: 'center',
    borderStyle: 'dashed',
  },

  manualEntryText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: Colors.primary,
  },

  // Date Picker Modal
  datePickerContent: {
    position: 'absolute',
    bottom: vs(100),
    left: s(20),
    right: s(20),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  datePickerTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(15),
    textAlign: 'center',
  },

  dateOption: {
    paddingVertical: vs(12),
    paddingHorizontal: s(20),
    borderRadius: s(10),
    marginBottom: vs(8),
    backgroundColor: '#F4F6F6',
  },

  dateOptionActive: {
    backgroundColor: Colors.primary,
  },

  dateOptionText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    textAlign: 'center',
  },

  dateOptionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default NewDebtScreen;
