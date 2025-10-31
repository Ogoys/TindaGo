import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ref, get, set } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import { Typography } from '../../../../src/components/ui/Typography';
import { Colors } from '../../../../src/constants/Colors';
import { s, vs } from '../../../../src/constants/responsive';

const PayoutRequest = () => {
  const router = useRouter();
  const { user } = useUser();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (user?.storeId) loadWallet();
  }, [user?.storeId]);

  const loadWallet = async () => {
    if (!user?.storeId) return;
    try {
      const walletRef = ref(database, `wallets/${user.storeId}`);
      const walletSnap = await get(walletRef);
      if (walletSnap.exists()) {
        setAvailableBalance(walletSnap.val().available || 0);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0 || amountNum > availableBalance) {
      newErrors.amount = 'Invalid amount';
    }
    if (!method) newErrors.method = 'Select a method';
    if (!accountName.trim()) newErrors.accountName = 'Enter account name';
    if (!accountNumber.trim()) newErrors.accountNumber = 'Enter account number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user?.storeId) return;
    setSubmitting(true);
    try {
      const payoutId = `PAYOUT-${Date.now()}`;
      await set(ref(database, `payouts/${payoutId}`), {
        payoutId,
        storeId: user.storeId,
        amount: parseFloat(amount),
        method,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Payout request submitted', [{ text: 'OK', onPress: () => router.replace('/(main)/(store-owner)/wallet/payout-history') }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit payout request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Back</Text></TouchableOpacity>
          <Typography variant="h2" style={styles.title}>Request Payout</Typography>
        </View>

        <View style={styles.balanceCard}>
          <Typography variant="caption" style={styles.balanceLabel}>Available Balance</Typography>
          <Typography variant="h1" style={styles.balanceValue}>P {availableBalance.toFixed(2)}</Typography>
        </View>

        <View style={styles.form}>
          <View style={styles.group}>
            <Typography variant="body" style={styles.label}>Amount (P)</Typography>
            <TextInput style={[styles.input, errors.amount && styles.inputError]} placeholder="0.00" keyboardType="decimal-pad" value={amount} onChangeText={(text) => { setAmount(text); if (errors.amount) setErrors({ ...errors, amount: '' }); }} editable={!submitting} />
            {errors.amount && <Text style={styles.error}>{errors.amount}</Text>}
          </View>

          <View style={styles.group}>
            <Typography variant="body" style={styles.label}>Payment Method</Typography>
            {['bank', 'gcash', 'paymaya'].map(m => (
              <TouchableOpacity key={m} style={[styles.methodOption, method === m && styles.methodOptionSelected]} onPress={() => { setMethod(m); if (errors.method) setErrors({ ...errors, method: '' }); }}>
                <Text style={[styles.methodText, method === m && styles.methodTextSelected]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            {errors.method && <Text style={styles.error}>{errors.method}</Text>}
          </View>

          <View style={styles.group}>
            <Typography variant="body" style={styles.label}>Account Name</Typography>
            <TextInput style={[styles.input, errors.accountName && styles.inputError]} placeholder="Full name" value={accountName} onChangeText={(text) => { setAccountName(text); if (errors.accountName) setErrors({ ...errors, accountName: '' }); }} editable={!submitting} />
            {errors.accountName && <Text style={styles.error}>{errors.accountName}</Text>}
          </View>

          <View style={styles.group}>
            <Typography variant="body" style={styles.label}>Account Number</Typography>
            <TextInput style={[styles.input, errors.accountNumber && styles.inputError]} placeholder="Mobile or account number" value={accountNumber} onChangeText={(text) => { setAccountNumber(text); if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' }); }} editable={!submitting} />
            {errors.accountNumber && <Text style={styles.error}>{errors.accountNumber}</Text>}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Request'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundGray },
  scrollContent: { paddingBottom: vs(100), paddingHorizontal: s(20), paddingTop: vs(20) },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(20) },
  back: { fontSize: s(14), color: Colors.primary, fontWeight: '600', marginRight: s(10) },
  title: { fontSize: s(24), fontWeight: '700', color: Colors.darkGray },
  balanceCard: { backgroundColor: Colors.primary, borderRadius: s(12), padding: s(16), marginBottom: vs(24) },
  balanceLabel: { fontSize: s(12), color: 'rgba(255, 255, 255, 0.8)' },
  balanceValue: { fontSize: s(32), fontWeight: '700', color: 'white' },
  form: { marginBottom: vs(20) },
  group: { marginBottom: vs(20) },
  label: { fontSize: s(14), fontWeight: '600', color: Colors.darkGray, marginBottom: vs(8) },
  input: { backgroundColor: 'white', borderRadius: s(8), borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: s(12), paddingVertical: vs(12), fontSize: s(16), color: Colors.darkGray },
  inputError: { borderColor: '#FF3B30' },
  error: { fontSize: s(12), color: '#FF3B30', marginTop: vs(4) },
  methodOption: { backgroundColor: 'white', borderRadius: s(8), borderWidth: 2, borderColor: '#E0E0E0', padding: s(12), marginBottom: vs(8) },
  methodOptionSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(59, 183, 126, 0.05)' },
  methodText: { fontSize: s(14), fontWeight: '600', color: Colors.textSecondary },
  methodTextSelected: { color: Colors.primary },
  buttonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: s(20), paddingVertical: vs(16), backgroundColor: Colors.backgroundGray },
  submitButton: { backgroundColor: Colors.primary, borderRadius: s(12), paddingVertical: vs(14), justifyContent: 'center', alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: s(16), fontWeight: '600', color: 'white' },
});

export default PayoutRequest;