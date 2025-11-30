/**
 * ADD SUPPLIER SCREEN
 *
 * Allows store owners to add new suppliers to their database
 * This creates a dedicated supplier record for better management
 *
 * Fields:
 * - Supplier Name (required)
 * - Contact Number (optional)
 * - Address (optional)
 * - Email (optional)
 * - Notes (optional)
 *
 * Baseline: 440x956 (standard TindaGo baseline)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { s, vs, ms } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { Fonts } from '../../../../src/constants/Fonts';
import { ProfileScreenHeader } from '../../../../src/components/store-owner/ProfileScreenHeader';
import { createSupplier } from '../../../../src/api/suppliers';

const AddSupplierScreen = () => {
  const [supplierName, setSupplierName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleBackToSupplierDashboard = () => {
    router.push('/(main)/(store-owner)/suppliers/supplier-dashboard');
  };

  const handleSave = async () => {
    // Validation
    if (!supplierName.trim()) {
      Alert.alert('Validation Error', 'Please enter supplier name');
      return;
    }

    // Email validation (if provided)
    if (email.trim() && !isValidEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);

      await createSupplier({
        name: supplierName.trim(),
        contact: contact.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Supplier added successfully', [
        {
          text: 'OK',
          onPress: handleBackToSupplierDashboard,
        },
      ]);
    } catch (error: any) {
      console.error('Error adding supplier:', error);
      Alert.alert('Error', error.message || 'Failed to add supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (supplierName || contact || address || city || postalCode || email || notes) {
      Alert.alert('Discard Changes?', 'You have unsaved changes. Are you sure you want to go back?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: handleBackToSupplierDashboard },
      ]);
    } else {
      handleBackToSupplierDashboard();
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundGray} />

      <ProfileScreenHeader title="Add Supplier" onBack={handleCancel} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Instructions */}
          <View style={styles.instructionCard}>
            <Text style={styles.instructionIcon}>💡</Text>
            <Text style={styles.instructionText}>
              Add supplier details to easily track your purchases. You can also add suppliers when creating
              purchase orders.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Supplier Information</Text>

            {/* Supplier Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Supplier Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Puregold, SM, Local Market"
                placeholderTextColor={Colors.textSecondary}
                value={supplierName}
                onChangeText={setSupplierName}
                maxLength={100}
              />
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 0912 345 6789"
                placeholderTextColor={Colors.textSecondary}
                value={contact}
                onChangeText={setContact}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., supplier@example.com"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Street address, building, floor"
                placeholderTextColor={Colors.textSecondary}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                maxLength={200}
              />
            </View>

            {/* City and Postal Code Row */}
            <View style={styles.rowInputGroup}>
              {/* City */}
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter City"
                  placeholderTextColor={Colors.textSecondary}
                  value={city}
                  onChangeText={setCity}
                  maxLength={50}
                />
              </View>

              {/* Postal Code */}
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Postal Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Postal Code"
                  placeholderTextColor={Colors.textSecondary}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional notes about this supplier..."
                placeholderTextColor={Colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={300}
              />
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
              style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Supplier'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: vs(20),
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  instructionIcon: {
    fontSize: ms(24),
    marginRight: s(12),
  },

  instructionText: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: ms(13),
    color: Colors.darkGray,
    lineHeight: vs(18),
  },

  formSection: {
    backgroundColor: Colors.white,
    borderRadius: s(16),
    padding: s(20),
    marginBottom: vs(20),
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(16),
    color: Colors.darkGray,
    marginBottom: vs(16),
  },

  inputGroup: {
    marginBottom: vs(16),
  },

  rowInputGroup: {
    flexDirection: 'row',
    gap: s(12),
    marginBottom: vs(16),
  },

  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },

  inputLabel: {
    fontFamily: Fonts.primary,
    fontWeight: '500',
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(8),
  },

  required: {
    color: '#E92B45',
  },

  input: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    color: Colors.darkGray,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
  },

  textArea: {
    minHeight: vs(80),
    paddingTop: vs(12),
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: s(12),
  },

  button: {
    flex: 1,
    borderRadius: s(12),
    paddingVertical: vs(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
  },

  cancelButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.darkGray,
  },

  saveButton: {
    backgroundColor: Colors.primary,
  },

  saveButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: ms(15),
    color: Colors.white,
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});

export default AddSupplierScreen;
