/**
 * STORE OWNER DEBT SETTINGS SCREEN
 *
 * Allows store owners to configure debt/loan payment rules:
 * - Enable/disable debt payments
 * - Set maximum debt limit per customer
 * - Require previous debt payment before new debt
 * - Set maximum days until due date
 * - Configure payment reminders
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ref, get, update } from 'firebase/database';
import { database } from '../../../../FirebaseConfig';
import { useUser } from '../../../../src/contexts/UserContext';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';

interface DebtSettings {
  allowDebt: boolean;
  debtLimit: number;
  requirePreviousDebtPayment: boolean;
  maxDaysUntilDue: number;
  reminderDaysBefore: number;
}

const DEFAULT_SETTINGS: DebtSettings = {
  allowDebt: true,
  debtLimit: 0, // 0 = no limit
  requirePreviousDebtPayment: false,
  maxDaysUntilDue: 30,
  reminderDaysBefore: 3,
};

export default function DebtSettingsScreen() {
  const { user } = useUser();
  const [settings, setSettings] = useState<DebtSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Fetch current settings from Firebase
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // First get store ID
        const storesRef = ref(database, 'stores');
        const storesSnapshot = await get(storesRef);

        if (storesSnapshot.exists()) {
          const stores = storesSnapshot.val();
          const userStore = Object.entries(stores).find(
            ([_, store]: [string, any]) => store.ownerId === user.id
          );

          if (userStore) {
            const [id, storeData] = userStore as [string, any];
            setStoreId(id);

            if (storeData.debtSettings) {
              setSettings({
                ...DEFAULT_SETTINGS,
                ...storeData.debtSettings,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching debt settings:', error);
        Alert.alert('Error', 'Failed to load debt settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // Save settings to Firebase
  const handleSave = async () => {
    if (!storeId) {
      Alert.alert('Error', 'Store not found');
      return;
    }

    setSaving(true);
    try {
      const storeRef = ref(database, `stores/${storeId}`);
      await update(storeRef, {
        debtSettings: settings,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Debt settings saved successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving debt settings:', error);
      Alert.alert('Error', 'Failed to save debt settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof DebtSettings>(
    key: K,
    value: DebtSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../../../src/assets/images/store-owner-supplier-details/chevron-left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Debt Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Configure how customers can use the "Pay Later" (debt) option when
            purchasing from your store.
          </Text>
        </View>

        {/* Enable Debt Section */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View style={styles.settingIconCircle}>
              <Text style={styles.settingIcon}>💳</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Allow Debt Payments</Text>
              <Text style={styles.settingDescription}>
                Enable customers to purchase now and pay later
              </Text>
            </View>
            <Switch
              value={settings.allowDebt}
              onValueChange={(value) => updateSetting('allowDebt', value)}
              trackColor={{ false: '#E5E7EB', true: Colors.primary }}
              thumbColor={settings.allowDebt ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Debt Limit Section */}
        {settings.allowDebt && (
          <>
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={[styles.settingIconCircle, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={styles.settingIcon}>💰</Text>
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Debt Limit per Customer</Text>
                  <Text style={styles.settingDescription}>
                    Maximum amount a customer can owe (0 = no limit)
                  </Text>
                </View>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.currencyPrefix}>₱</Text>
                <TextInput
                  style={styles.amountInput}
                  value={settings.debtLimit > 0 ? settings.debtLimit.toString() : ''}
                  onChangeText={(text) => {
                    const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                    updateSetting('debtLimit', isNaN(num) ? 0 : num);
                  }}
                  placeholder="0 (No limit)"
                  placeholderTextColor="rgba(30, 30, 30, 0.4)"
                  keyboardType="number-pad"
                />
              </View>
              {settings.debtLimit > 0 && (
                <Text style={styles.limitNote}>
                  Customers cannot have more than ₱{settings.debtLimit.toLocaleString()} in
                  outstanding debt
                </Text>
              )}
            </View>

            {/* Require Previous Payment Section */}
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={[styles.settingIconCircle, { backgroundColor: '#FFEBEE' }]}>
                  <Text style={styles.settingIcon}>⚠️</Text>
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Require Previous Payment</Text>
                  <Text style={styles.settingDescription}>
                    Customer must pay existing debt before new purchases
                  </Text>
                </View>
                <Switch
                  value={settings.requirePreviousDebtPayment}
                  onValueChange={(value) =>
                    updateSetting('requirePreviousDebtPayment', value)
                  }
                  trackColor={{ false: '#E5E7EB', true: '#FF8D2F' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {settings.requirePreviousDebtPayment && (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningIcon}>🔒</Text>
                  <Text style={styles.warningText}>
                    Customers with unpaid debts won't be able to place new debt
                    orders until they pay.
                  </Text>
                </View>
              )}
            </View>

            {/* Max Days Until Due */}
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={[styles.settingIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <Image
                    source={require('../../../../src/assets/images/store-owner-purchase-payment/calendar-icon.png')}
                    style={styles.settingIconImage}
                  />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Maximum Due Date</Text>
                  <Text style={styles.settingDescription}>
                    Maximum days customers can set for payment
                  </Text>
                </View>
              </View>
              <View style={styles.daysSelector}>
                {[7, 14, 30, 60, 90].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dayOption,
                      settings.maxDaysUntilDue === days && styles.dayOptionActive,
                    ]}
                    onPress={() => updateSetting('maxDaysUntilDue', days)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        settings.maxDaysUntilDue === days && styles.dayOptionTextActive,
                      ]}
                    >
                      {days} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reminder Days */}
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={[styles.settingIconCircle, { backgroundColor: '#F3E5F5' }]}>
                  <Text style={styles.settingIcon}>🔔</Text>
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Payment Reminder</Text>
                  <Text style={styles.settingDescription}>
                    Days before due date to remind customers
                  </Text>
                </View>
              </View>
              <View style={styles.daysSelector}>
                {[1, 2, 3, 5, 7].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dayOption,
                      settings.reminderDaysBefore === days && styles.dayOptionActive,
                    ]}
                    onPress={() => updateSetting('reminderDaysBefore', days)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        settings.reminderDaysBefore === days && styles.dayOptionTextActive,
                      ]}
                    >
                      {days} {days === 1 ? 'day' : 'days'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.7}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(20),
  },
  backButton: {
    position: 'absolute',
    left: s(20),
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: {
    width: s(15),
    height: s(15),
  },
  title: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(20),
    color: Colors.darkGray,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: s(12),
    padding: s(15),
    marginBottom: vs(20),
    gap: s(12),
  },
  infoIcon: {
    fontSize: ms(20),
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: '#2E7D32',
    lineHeight: ms(13) * 1.5,
  },

  // Setting Card
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(18),
    marginBottom: vs(15),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconCircle: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(14),
  },
  settingIcon: {
    fontSize: ms(22),
  },
  settingIconImage: {
    width: s(24),
    height: s(24),
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
    marginBottom: vs(3),
  },
  settingDescription: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.5)',
    lineHeight: ms(12) * 1.4,
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(15),
    backgroundColor: '#F9FAFB',
    borderRadius: s(12),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  currencyPrefix: {
    fontFamily: Fonts.primary,
    fontWeight: '700',
    fontSize: ms(18),
    color: Colors.primary,
    paddingLeft: s(15),
    paddingRight: s(5),
  },
  amountInput: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: Colors.darkGray,
    paddingVertical: vs(12),
    paddingRight: s(15),
  },
  limitNote: {
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#FF8D2F',
    marginTop: vs(10),
    fontStyle: 'italic',
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: s(10),
    padding: s(12),
    marginTop: vs(15),
    gap: s(10),
  },
  warningIcon: {
    fontSize: ms(16),
  },
  warningText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(12),
    color: '#E65100',
    lineHeight: ms(12) * 1.4,
  },

  // Days Selector
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
    marginTop: vs(15),
  },
  dayOption: {
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    borderRadius: s(20),
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayOptionText: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(13),
    color: 'rgba(30, 30, 30, 0.6)',
  },
  dayOptionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },

  // Save Button
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(20),
    paddingVertical: vs(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(18),
    color: '#FFFFFF',
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
    color: 'rgba(30, 30, 30, 0.5)',
  },

  bottomPadding: {
    height: vs(40),
  },
});
