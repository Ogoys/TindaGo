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
import { database, auth } from '@/lib/firebase';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';

interface PaymentAccountInfo {
  accountName: string;
  accountNumber: string;
  verified?: boolean;
}

interface PaymentInfo {
  gcash: PaymentAccountInfo;
  paymaya: PaymentAccountInfo;
}

export default function EWalletDetailsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<PaymentInfo | null>(null);
  
  // GCash state
  const [gcashAccountName, setGcashAccountName] = useState('');
  const [gcashAccountNumber, setGcashAccountNumber] = useState('');
  
  // PayMaya state
  const [paymayaAccountName, setPaymayaAccountName] = useState('');
  const [paymayaAccountNumber, setPaymayaAccountNumber] = useState('');
  
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  useEffect(() => {
    // Check if there are changes
    if (originalData) {
      const changed = 
        gcashAccountName !== originalData.gcash.accountName ||
        gcashAccountNumber !== originalData.gcash.accountNumber ||
        paymayaAccountName !== originalData.paymaya.accountName ||
        paymayaAccountNumber !== originalData.paymaya.accountNumber;
      setHasChanges(changed);
    }
  }, [gcashAccountName, gcashAccountNumber, paymayaAccountName, paymayaAccountNumber, originalData]);

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
        
        // Load GCash data
        const gcashData = data.gcash || { accountName: '', accountNumber: '' };
        setGcashAccountName(gcashData.accountName || '');
        setGcashAccountNumber(gcashData.accountNumber || '');
        
        // Load PayMaya data
        const paymayaData = data.paymaya || { accountName: '', accountNumber: '' };
        setPaymayaAccountName(paymayaData.accountName || '');
        setPaymayaAccountNumber(paymayaData.accountNumber || '');
        
        // Store original data for change detection
        setOriginalData({
          gcash: {
            accountName: gcashData.accountName || '',
            accountNumber: gcashData.accountNumber || '',
          },
          paymaya: {
            accountName: paymayaData.accountName || '',
            accountNumber: paymayaData.accountNumber || '',
          },
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
    // Validate GCash account name
    if (!gcashAccountName.trim()) {
      Alert.alert('Validation Error', 'Please enter GCash account name');
      return false;
    }
    if (gcashAccountName.trim().length < 2) {
      Alert.alert('Validation Error', 'GCash account name must be at least 2 characters');
      return false;
    }

    // Validate GCash number
    if (!gcashAccountNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter GCash number');
      return false;
    }
    const cleanGcashNumber = gcashAccountNumber.trim().replace(/\s+/g, '');
    if (!/^09\d{9}$/.test(cleanGcashNumber)) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid 11-digit GCash number (09XXXXXXXXX)'
      );
      return false;
    }

    // Validate PayMaya account name
    if (!paymayaAccountName.trim()) {
      Alert.alert('Validation Error', 'Please enter PayMaya account name');
      return false;
    }
    if (paymayaAccountName.trim().length < 2) {
      Alert.alert('Validation Error', 'PayMaya account name must be at least 2 characters');
      return false;
    }

    // Validate PayMaya number
    if (!paymayaAccountNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter PayMaya number');
      return false;
    }
    const cleanPaymayaNumber = paymayaAccountNumber.trim().replace(/\s+/g, '');
    if (!/^09\d{9}$/.test(cleanPaymayaNumber)) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid 11-digit PayMaya number (09XXXXXXXXX)'
      );
      return false;
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
        gcash: {
          accountName: gcashAccountName.trim(),
          accountNumber: gcashAccountNumber.trim(),
          verified: originalData?.gcash?.verified || false,
        },
        paymaya: {
          accountName: paymayaAccountName.trim(),
          accountNumber: paymayaAccountNumber.trim(),
          verified: originalData?.paymaya?.verified || false,
        },
        updatedAt: new Date().toISOString(),
      };

      // Update in stores collection
      const storeRef = ref(database, `stores/${userId}/paymentInfo`);
      await update(storeRef, paymentInfo);

      // Also update in store_registrations for consistency
      const registrationRef = ref(database, `store_registrations/${userId}/paymentInfo`);
      await update(registrationRef, paymentInfo);

      setOriginalData({
        gcash: {
          accountName: gcashAccountName.trim(),
          accountNumber: gcashAccountNumber.trim(),
        },
        paymaya: {
          accountName: paymayaAccountName.trim(),
          accountNumber: paymayaAccountNumber.trim(),
        },
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
              Both GCash and PayMaya accounts are required for customer payments. These details will be used for payout requests.
            </Text>
          </View>
        </View>

        {/* GCash Section */}
        <View style={styles.paymentMethodSection}>
          <View style={styles.paymentMethodHeader}>
            <Image
              source={require('../../../../src/assets/images/payment/gcash-icon.png')}
              style={styles.paymentMethodIcon}
              resizeMode="contain"
            />
            <Text style={styles.paymentMethodTitle}>GCash Account</Text>
          </View>

          {/* GCash Account Name */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>GCash Account Name</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Enter GCash account name"
                placeholderTextColor={Colors.textSecondary}
                value={gcashAccountName}
                onChangeText={setGcashAccountName}
                editable={!saving}
              />
            </View>
            <Text style={styles.helperText}>
              Enter your name exactly as it appears on your GCash account
            </Text>
          </View>

          {/* GCash Number */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>GCash Number</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="09XXXXXXXXX"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="phone-pad"
                value={gcashAccountNumber}
                onChangeText={setGcashAccountNumber}
                editable={!saving}
                maxLength={11}
              />
            </View>
            <Text style={styles.helperText}>
              11-digit mobile number linked to your GCash account
            </Text>
          </View>
        </View>

        {/* PayMaya Section */}
        <View style={styles.paymentMethodSection}>
          <View style={styles.paymentMethodHeader}>
            <Image
              source={require('../../../../src/assets/images/payment/paymaya-icon.png')}
              style={styles.paymentMethodIcon}
              resizeMode="contain"
            />
            <Text style={styles.paymentMethodTitle}>PayMaya Account</Text>
          </View>

          {/* PayMaya Account Name */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>PayMaya Account Name</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Enter PayMaya account name"
                placeholderTextColor={Colors.textSecondary}
                value={paymayaAccountName}
                onChangeText={setPaymayaAccountName}
                editable={!saving}
              />
            </View>
            <Text style={styles.helperText}>
              Enter your name exactly as it appears on your PayMaya account
            </Text>
          </View>

          {/* PayMaya Number */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>PayMaya Number</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="09XXXXXXXXX"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="phone-pad"
                value={paymayaAccountNumber}
                onChangeText={setPaymayaAccountNumber}
                editable={!saving}
                maxLength={11}
              />
            </View>
            <Text style={styles.helperText}>
              11-digit mobile number linked to your PayMaya account
            </Text>
          </View>
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

  // Payment Method Section
  paymentMethodSection: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(24),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: s(8),
    elevation: 3,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(20),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paymentMethodIcon: {
    width: s(40),
    height: s(40),
    marginRight: s(12),
  },
  paymentMethodTitle: {
    fontFamily: Fonts.primary,
    fontSize: ms(18),
    fontWeight: '700',
    color: Colors.darkGray,
  },

  // Form Section
  formSection: {
    marginBottom: vs(20),
  },
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(8),
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
