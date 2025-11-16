/**
 * STORE OWNER - REQUEST PAYOUT SCREEN
 *
 * Allows store owners to request withdrawal of their earnings
 * Matches the design structure of other wallet screens
 *
 * Features:
 * - Available balance display
 * - Amount input with validation
 * - Payment method selection (Bank, GCash, PayMaya)
 * - Account details input
 * - Submit request to Firebase
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ref, get, set, onValue, update } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import { Typography } from '../../../../src/components/ui/Typography';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { s, vs, ms } from '../../../../src/constants/responsive';

type PaymentMethod = 'gcash' | 'paymaya';

const MIN_PAYOUT = 100;

interface ValidationErrors {
  amount?: string;
  method?: string;
  accountName?: string;
  accountNumber?: string;
}

export default function PayoutRequest() {
  const { user } = useUser();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const sid = user?.storeId || user?.id;
    if (!sid) {
      setLoading(false);
      return;
    }
    const walletRef = ref(database, `wallets/${sid}`);
    const unsub = onValue(walletRef, (snap) => {
      if (snap.exists()) {
        setAvailableBalance(Number(snap.val().available || 0));
      } else {
        setAvailableBalance(0);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => {
      try { (unsub as any)?.(); } catch {}
    };
  }, [user?.storeId, user?.id]);

  const handleBack = () => {
    router.back();
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amountNum > availableBalance) {
      newErrors.amount = `Amount exceeds available balance (₱${availableBalance.toFixed(2)})`;
    } else if (amountNum < 100) {
      newErrors.amount = 'Minimum payout amount is ₱100.00';
    }

    if (!method) {
      newErrors.method = 'Please select a payment method';
    }

    if (!accountName.trim()) {
      newErrors.accountName = 'Please enter account name';
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Please enter account number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const sid = user?.storeId || user?.id;
    if (!validate() || !sid) return;

    setSubmitting(true);
    try {
      const payoutId = `PAYOUT-${Date.now()}`;
      const data = {
        payoutId,
        storeId: sid,
        amount: parseFloat(amount),
        method,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        status: 'pending',
        createdAt: Date.now(),
      };
      const updates: Record<string, any> = {};
      updates[`payouts/${payoutId}`] = data;
      updates[`payouts_by_store/${sid}/${payoutId}`] = true;
      updates[`logs/${payoutId}/events/${Date.now()}`] = { action: 'requested', amount: data.amount, storeId: sid, method };
      await update(ref(database), updates);

      Alert.alert(
        'Request Submitted',
        'Your payout request has been submitted successfully. You will be notified once it is processed.',
        [
          {
            text: 'View History',
            onPress: () => router.replace('/(main)/(store-owner)/wallet/payout-history')
          },
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting payout:', error);
      Alert.alert('Error', 'Failed to submit payout request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Image
              source={require("../../../../src/assets/images/store-orders/back-icon.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Request Payout</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Available Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceIconContainer}>
              <Image
                source={require('../../../../src/assets/images/store-owner-dashboard/wallet-icon.png')}
                style={styles.balanceIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.balanceTextContainer}>
              <Typography style={styles.balanceLabel}>Available Balance</Typography>
              <Typography style={styles.balanceValue}>₱{availableBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Amount Input */}
            <View style={styles.formGroup}>
              <Typography style={styles.formLabel}>Payout Amount</Typography>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={[styles.input, errors.amount && styles.inputError]}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    if (errors.amount) setErrors({ ...errors, amount: undefined });
                  }}
                  editable={!submitting}
                />
              </View>
              <View style={styles.inlineButtons}>
                <TouchableOpacity style={styles.pill} onPress={() => setAmount(String(MIN_PAYOUT))} disabled={submitting}>
                  <Text style={styles.pillText}>Min ₱{MIN_PAYOUT}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pill} onPress={() => setAmount(availableBalance.toFixed(2))} disabled={submitting}>
                  <Text style={styles.pillText}>Withdraw All</Text>
                </TouchableOpacity>
              </View>
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
              <Text style={styles.helperText}>Minimum payout: ₱{MIN_PAYOUT.toFixed(2)}</Text>
            </View>

            {/* Payment Method Selection */}
            <View style={styles.formGroup}>
              <Typography style={styles.formLabel}>Payment Method</Typography>
              <View style={styles.methodContainer}>
                {[
                  { 
                    value: 'gcash' as PaymentMethod, 
                    label: 'GCash', 
                    image: require('../../../../src/assets/images/payment/gcash-icon.png')
                  },
                  { 
                    value: 'paymaya' as PaymentMethod, 
                    label: 'PayMaya', 
                    image: require('../../../../src/assets/images/payment/paymaya-icon.png')
                  },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.methodOption,
                      method === option.value && styles.methodOptionSelected
                    ]}
                    onPress={() => {
                      setMethod(option.value);
                      if (errors.method) setErrors({ ...errors, method: undefined });
                    }}
                    disabled={submitting}
                  >
                    <Image
                      source={option.image}
                      style={styles.methodImage}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        styles.methodText,
                        method === option.value && styles.methodTextSelected
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
              {errors.method && <Text style={styles.errorText}>{errors.method}</Text>}
            </View>

            {/* Account Name */}
            <View style={styles.formGroup}>
              <Typography style={styles.formLabel}>Account Name</Typography>
              <TextInput
                style={[styles.input, errors.accountName && styles.inputError]}
                placeholder="Full name as registered"
                placeholderTextColor={Colors.textSecondary}
                value={accountName}
                onChangeText={(text) => {
                  setAccountName(text);
                  if (errors.accountName) setErrors({ ...errors, accountName: undefined });
                }}
                editable={!submitting}
              />
              {errors.accountName && <Text style={styles.errorText}>{errors.accountName}</Text>}
            </View>

            {/* Account Number */}
            <View style={styles.formGroup}>
              <Typography style={styles.formLabel}>Mobile Number</Typography>
              <TextInput
                style={[styles.input, errors.accountNumber && styles.inputError]}
                placeholder="09XX XXX XXXX"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="phone-pad"
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text);
                  if (errors.accountNumber) setErrors({ ...errors, accountNumber: undefined });
                }}
                editable={!submitting}
              />
              {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Payout Processing Time</Text>
                <Text style={styles.infoText}>
                  Your request will be reviewed within 1-3 business days. Funds will be transferred to your account after approval.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button (Fixed at Bottom) */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting || isNaN(parseFloat(amount || '')) || parseFloat(amount || '0') < MIN_PAYOUT || parseFloat(amount || '0') > availableBalance || !method || !accountName.trim() || !accountNumber.trim()) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={submitting || isNaN(parseFloat(amount || '')) || parseFloat(amount || '0') < MIN_PAYOUT || parseFloat(amount || '0') > availableBalance || !method || !accountName.trim() || !accountNumber.trim()}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray || '#F8F9FA',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(16),
    backgroundColor: Colors.white,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    position: 'absolute',
    left: s(20),
    width: s(30),
    height: s(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backIcon: {
    width: s(24),
    height: s(24),
    tintColor: Colors.darkGray,
  },
  title: {
    fontFamily: Fonts.primary,
    fontSize: ms(20),
    lineHeight: vs(24),
    color: Colors.darkGray,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: vs(12),
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.textSecondary,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: s(20),
    paddingBottom: vs(100), // Space for fixed button
  },

  // Balance Card
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: s(16),
    padding: s(24),
    marginBottom: vs(28),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: s(10),
    elevation: 6,
  },
  balanceIconContainer: {
    width: s(56),
    height: s(56),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: s(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(18),
  },
  balanceIcon: {
    width: s(30),
    height: s(30),
    tintColor: Colors.white,
  },
  balanceTextContainer: {
    flex: 1,
  },
  balanceLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: vs(6),
    letterSpacing: 0.3,
  },
  balanceValue: {
    fontFamily: Fonts.primary,
    fontSize: ms(22),
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },

  // Form Container
  formContainer: {
    gap: vs(24),
  },
  formGroup: {
    gap: vs(10),
  },
  formLabel: {
    fontFamily: Fonts.primary,
    fontSize: ms(15),
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: vs(2),
  },

  // Input Styles
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: s(16),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: s(2),
    elevation: 1,
  },
  currencySymbol: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.darkGray,
    marginRight: s(8),
  },
  input: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    color: Colors.darkGray,
    paddingVertical: vs(14),
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inlineButtons: {
    flexDirection: 'row',
    gap: s(8),
    marginTop: vs(8),
  },
  pill: {
    backgroundColor: Colors.white,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: s(16),
    paddingHorizontal: s(10),
    paddingVertical: vs(6),
  },
  pillText: {
    fontSize: ms(12),
    color: Colors.darkGray,
    fontWeight: '600',
  },
  errorText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#FF3B30',
  },
  helperText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: Colors.textSecondary,
  },

  // Payment Method
  methodContainer: {
    gap: vs(14),
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: s(14),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: s(18),
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
    width: s(48),
    height: s(48),
    marginRight: s(16),
  },
  methodText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  methodTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  methodCheckmark: {
    width: s(26),
    height: s(26),
    backgroundColor: Colors.primary,
    borderRadius: s(13),
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodCheckmarkText: {
    color: Colors.white,
    fontSize: ms(15),
    fontWeight: '700',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: s(12),
    padding: s(16),
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoIcon: {
    fontSize: ms(20),
    marginRight: s(12),
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: vs(4),
  },
  infoText: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#1565C0',
    lineHeight: vs(18),
  },

  // Submit Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: s(20),
    paddingVertical: vs(16),
    backgroundColor: Colors.backgroundGray,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: s(8),
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '700',
    color: Colors.white,
  },
});
