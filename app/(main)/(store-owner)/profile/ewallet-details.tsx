/**
 * E-WALLET DETAILS SCREEN
 * 
 * Allows store owners to view and edit their e-wallet payment information
 * Changes are reflected in the wallet dashboard and payout requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { ref, get, update } from 'firebase/database';
import { database, auth } from '../../../../FirebaseConfig';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';

type PaymentMethod = 'gcash' | 'paymaya' | 'bank_transfer';

interface PaymentInfo {
  method: PaymentMethod;
  accountName: string;
  accountNumber: string;
}

export default function EWalletDetailsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<PaymentInfo | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('gcash');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  useEffect(() => {
    // Check if there are changes
    if (originalData) {
      const changed = 
        method !== originalData.method ||
        accountName !== originalData.accountName ||
        accountNumber !== originalData.accountNumber;
      setHasChanges(changed);
    }
  }, [method, accountName, accountNumber, originalData]);

  const fetchPaymentInfo = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setLoading(false);
        return;
      }

      const storeRef = ref(database, `stores/${userId}/paymentInfo`);
      const snapshot = await get(storeRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setMethod(data.method || 'gcash');
        setAccountName(data.accountName || '');
        setAccountNumber(data.accountNumber || '');
        setOriginalData({
          method: data.method || 'gcash',
          accountName: data.accountName || '',
          accountNumber: data.accountNumber || '',
        });
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
      Alert.alert('Error', 'Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!accountName.trim()) {
      Alert.alert('Validation Error', 'Please enter account name');
      return false;
    }

    if (!accountNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter account number');
      return false;
    }

    // Validate phone number format for GCash/PayMaya
    if (method === 'gcash' || method === 'paymaya') {
      const cleanNumber = accountNumber.trim().replace(/\s+/g, '');
      if (!/^09\d{9}$/.test(cleanNumber)) {
        Alert.alert(
          'Validation Error',
          'Please enter a valid 11-digit mobile number (09XXXXXXXXX)'
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setSaving(true);

    try {
      const paymentInfo = {
        method,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        updatedAt: new Date().toISOString(),
      };

      // Update in stores collection
      const storeRef = ref(database, `stores/${userId}/paymentInfo`);
      await update(storeRef, paymentInfo);

      // Also update in store_registrations for consistency
      const registrationRef = ref(database, `store_registrations/${userId}/paymentInfo`);
      await update(registrationRef, paymentInfo);

      setOriginalData({
        method,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
      });
      setHasChanges(false);

      Alert.alert(
        'Success',
        'Your e-wallet details have been updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving payment info:', error);
      Alert.alert('Error', 'Failed to update payment information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
        <ProfileScreenHeader title="E-Wallet Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />
      <ProfileScreenHeader title="E-Wallet Details" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>ℹ️</Text>
          <View style={styles.infoBannerTextContainer}>
            <Text style={styles.infoBannerTitle}>Payment Information</Text>
            <Text style={styles.infoBannerText}>
              These details will be used for payout requests. Make sure they are accurate.
            </Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodContainer}>
            {[
              {
                value: 'gcash' as PaymentMethod,
                label: 'GCash',
                image: require('../../../../src/assets/images/payment/gcash-icon.png'),
              },
              {
                value: 'paymaya' as PaymentMethod,
                label: 'PayMaya',
                image: require('../../../../src/assets/images/payment/paymaya-icon.png'),
              },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.methodOption,
                  method === option.value && styles.methodOptionSelected,
                ]}
                onPress={() => setMethod(option.value)}
                activeOpacity={0.7}
                disabled={saving}
              >
                <Image
                  source={option.image}
                  style={styles.methodImage}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.methodText,
                    method === option.value && styles.methodTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {method === option.value && (
                  <View style={styles.methodCheckmark}>
                    <Text style={styles.methodCheckmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Name */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Account Name</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Full name as registered"
              placeholderTextColor={Colors.textSecondary}
              value={accountName}
              onChangeText={setAccountName}
              editable={!saving}
            />
          </View>
          <Text style={styles.helperText}>
            Enter your name exactly as it appears on your {method === 'gcash' ? 'GCash' : method === 'paymaya' ? 'PayMaya' : 'bank'} account
          </Text>
        </View>

        {/* Account Number / Mobile Number */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Mobile Number</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="09XX XXX XXXX"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
              editable={!saving}
              maxLength={11}
            />
          </View>
          <Text style={styles.helperText}>
            11-digit mobile number linked to your {method === 'gcash' ? 'GCash' : 'PayMaya'} account
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            activeOpacity={0.7}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              (!hasChanges || saving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.7}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
    marginTop: vs(12),
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(24),
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoBannerIcon: {
    fontSize: ms(20),
    marginRight: s(12),
  },
  infoBannerTextContainer: {
    flex: 1,
  },
  infoBannerTitle: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: vs(4),
  },
  infoBannerText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#1565C0',
    lineHeight: vs(18),
  },

  // Form Section
  formSection: {
    marginBottom: vs(28),
  },
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: vs(12),
  },

  // Payment Method
  methodContainer: {
    gap: vs(12),
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(14),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: s(4),
    elevation: 2,
  },
  methodOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 183, 126, 0.08)',
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
  },
  methodImage: {
    width: s(40),
    height: s(40),
    marginRight: s(14),
  },
  methodText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  methodTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  methodCheckmark: {
    width: s(24),
    height: s(24),
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodCheckmarkText: {
    color: Colors.white,
    fontSize: ms(14),
    fontWeight: '700',
  },

  // Input Card
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: s(2),
    elevation: 1,
  },
  input: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    color: Colors.darkGray,
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
  },
  helperText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginTop: vs(8),
    lineHeight: vs(16),
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: s(12),
    marginTop: vs(12),
  },
  button: {
    flex: 1,
    height: vs(50),
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(4),
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
  },
  cancelButtonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    fontWeight: '700',
    color: Colors.white,
  },
});
