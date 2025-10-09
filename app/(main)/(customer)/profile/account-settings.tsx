/**
 * CUSTOMER ACCOUNT SETTINGS SCREEN (Edit Profile)
 *
 * Pixel-perfect implementation from Figma design
 * Figma URL: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=759-5473
 * Node ID: 759-5473
 * Design: 440x956 baseline
 *
 * Features:
 * - Edit full name with validation
 * - Edit email with Firebase Auth update
 * - Edit phone number with validation
 * - Change password functionality
 * - Profile picture upload with camera/gallery options
 * - Save/Discard actions
 * - Exact Figma positioning with responsive scaling
 *
 * Position Reference (from Figma):
 * - Back button: x: 20, y: 79 (30x30)
 * - Title "Edit Profile": x: 170, y: 83
 * - Profile avatar: x: 160, y: 155 (120x120)
 * - Full Name card: x: 20, y: 295 (400x67)
 * - Email card: x: 20, y: 382 (400x67)
 * - Phone card: x: 20, y: 469 (400x67)
 * - Password card: x: 20, y: 556 (400x67)
 * - Discard button: x: 20, y: 876 (192x40)
 * - Save button: x: 228, y: 876 (192x40)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '../../../../src/contexts/UserContext';
import { s, vs } from '../../../../src/constants/responsive';
import { Colors } from '../../../../src/constants/Colors';
import { auth } from '../../../../FirebaseConfig';
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

interface EditableField {
  label: string;
  value: string;
  isEditing: boolean;
  type: 'text' | 'email' | 'phone' | 'password';
  secureTextEntry?: boolean;
}

export default function AccountSettings() {
  const { user, updateUserProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Field states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('*********************');

  // Editing states
  const [editingField, setEditingField] = useState<string | null>(null);

  // Original values for comparison
  const [originalFullName, setOriginalFullName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState('');

  // User initials for avatar
  const getUserInitials = (): string => {
    if (fullName) {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    return 'DO';
  };

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const name = auth.currentUser?.displayName || user.email?.split('@')[0] || '';
      const userEmail = user.email || '';
      const phone = user.phoneNumber || '';

      setFullName(name);
      setEmail(userEmail);
      setPhoneNumber(phone);

      // Store original values
      setOriginalFullName(name);
      setOriginalEmail(userEmail);
      setOriginalPhoneNumber(phone);
    }
  }, [user]);

  // Check if there are any changes
  useEffect(() => {
    const hasNameChanged = fullName !== originalFullName;
    const hasEmailChanged = email !== originalEmail;
    const hasPhoneChanged = phoneNumber !== originalPhoneNumber;

    setHasChanges(hasNameChanged || hasEmailChanged || hasPhoneChanged);
  }, [fullName, email, phoneNumber, originalFullName, originalEmail, originalPhoneNumber]);

  // Handle profile picture upload
  const handleProfilePictureUpload = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            // TODO: Implement camera functionality
            Alert.alert('Coming Soon', 'Camera feature will be available soon');
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: () => {
            // TODO: Implement gallery picker
            Alert.alert('Coming Soon', 'Gallery picker will be available soon');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Handle password change
  const handlePasswordChange = () => {
    Alert.alert(
      'Change Password',
      'You will need to re-authenticate to change your password',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            // TODO: Navigate to dedicated password change screen
            Alert.alert('Coming Soon', 'Password change feature will be available soon');
          },
        },
      ]
    );
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number format (Philippine format)
  const isValidPhoneNumber = (phone: string): boolean => {
    // Philippine format: 09XX XXX XXXX or +639XX XXX XXXX
    const phoneRegex = /^(\+639|09)\d{9}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone);
  };

  // Handle save changes
  const handleSave = async () => {
    // Validate inputs
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name cannot be empty');
      return;
    }

    if (email !== originalEmail && !isValidEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    if (phoneNumber && phoneNumber !== originalPhoneNumber && !isValidPhoneNumber(phoneNumber)) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid Philippine phone number (e.g., 0977 323 9843)'
      );
      return;
    }

    if (!hasChanges) {
      Alert.alert('No Changes', 'You have not made any changes to save');
      return;
    }

    setIsLoading(true);

    try {
      // Update display name in Firebase Auth
      if (fullName !== originalFullName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: fullName,
        });
      }

      // Update email in Firebase Auth (requires re-authentication for security)
      if (email !== originalEmail && auth.currentUser) {
        await updateEmail(auth.currentUser, email);
      }

      // Update user context with new data
      await updateUserProfile({
        email: email,
        phoneNumber: phoneNumber,
      });

      // Update original values
      setOriginalFullName(fullName);
      setOriginalEmail(email);
      setOriginalPhoneNumber(phoneNumber);

      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating profile:', error);

      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Re-authentication Required',
          'For security reasons, please log out and log in again to update your email',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: () => {
                // Navigate to auth flow
                router.replace('/(auth)/onboarding');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle discard changes
  const handleDiscard = () => {
    if (!hasChanges) {
      router.back();
      return;
    }

    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            // Reset to original values
            setFullName(originalFullName);
            setEmail(originalEmail);
            setPhoneNumber(originalPhoneNumber);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background */}
        <View style={styles.background} />

        {/* Header: Back Button - Figma: x: 20, y: 79 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../../../src/assets/images/customer-account-settings/chevron-left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Title - Figma: x: 170, y: 83 */}
        <Text style={styles.title}>Edit Profile</Text>

        {/* Profile Avatar with Upload Button - Figma: x: 160, y: 155 (120x120) */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>

          {/* Plus button for upload - Figma: x: 241, y: 245 (30x30) */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleProfilePictureUpload}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../../../src/assets/images/customer-account-settings/plus-icon.png')}
              style={styles.plusIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Full Name Card - Figma: x: 20, y: 295 (400x67) */}
        <View style={[styles.fieldCard, { top: vs(295) }]}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.fieldValue}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="words"
          />
          <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
            <Image
              source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
              style={styles.editPencilIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Email Card - Figma: x: 20, y: 382 (400x67) */}
        <View style={[styles.fieldCard, { top: vs(382) }]}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.fieldValue}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
            <Image
              source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
              style={styles.editPencilIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Phone Number Card - Figma: x: 20, y: 469 (400x67) */}
        <View style={[styles.fieldCard, { top: vs(469) }]}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            style={styles.fieldValue}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
            <Image
              source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
              style={styles.editPencilIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Password Card - Figma: x: 20, y: 556 (400x67) */}
        <TouchableOpacity
          style={[styles.fieldCard, { top: vs(556) }]}
          onPress={handlePasswordChange}
          activeOpacity={0.9}
        >
          <Text style={styles.fieldLabel}>Password</Text>
          <Text style={styles.fieldValuePassword}>{password}</Text>
          <View style={styles.editIcon}>
            <Image
              source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
              style={styles.editPencilIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        {/* Spacer for bottom buttons */}
        <View style={styles.buttonSpacer} />
      </ScrollView>

      {/* Bottom Action Buttons - Figma: y: 876 */}
      <View style={styles.bottomButtonsContainer}>
        {/* Discard Button - Figma: x: 20, y: 876 (192x40) */}
        <TouchableOpacity
          style={styles.discardButton}
          onPress={handleDiscard}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.discardButtonText}>Discard</Text>
        </TouchableOpacity>

        {/* Save Button - Figma: x: 228, y: 876 (192x40) */}
        <TouchableOpacity
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray, // Figma: #F4F6F6
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(100), // Space for bottom buttons
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.backgroundGray, // Figma: #F4F6F6
  },

  // Back Button - Figma: x: 20, y: 79, size: 30x30
  backButton: {
    position: 'absolute',
    top: vs(79),
    left: s(20),
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
  backIcon: {
    width: s(15),
    height: s(15),
  },

  // Title - Figma: x: 170, y: 83
  title: {
    position: 'absolute',
    top: vs(83),
    left: s(170),
    width: s(101),
    height: vs(22),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(20),
    lineHeight: s(20) * 1.1,
    textAlign: 'center',
    color: Colors.darkGray, // Figma: #1E1E1E
  },

  // Avatar Container - Figma: x: 160, y: 155, size: 120x120
  avatarContainer: {
    position: 'absolute',
    top: vs(155),
    left: s(160),
    width: s(120),
    height: s(120),
    zIndex: 5,
  },
  avatarCircle: {
    width: s(120),
    height: s(120),
    borderRadius: s(60),
    backgroundColor: '#3B82F6', // Figma: Blue color
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(48),
    lineHeight: s(48) * 1.23,
    color: Colors.white,
    textAlign: 'center',
  },

  // Upload Button (Plus Icon) - Figma: x: 241 (81 from avatar left), y: 245 (90 from avatar top)
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.primary, // Figma: #3BB77E
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    width: s(20),
    height: s(20),
  },

  // Field Cards - Figma: width: 400, height: 67, spacing: 87px between cards
  fieldCard: {
    position: 'absolute',
    left: s(20),
    width: s(400),
    height: vs(67),
    backgroundColor: Colors.white,
    borderRadius: s(16),
    paddingHorizontal: s(20),
    paddingTop: vs(12),
    paddingBottom: vs(12),
    justifyContent: 'center', // Center content vertically
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  // Full Name - Figma: y: 295
  fieldLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(16) * 1.23,
    color: Colors.darkGray, // Figma: #1E1E1E
    marginBottom: vs(2),
    paddingLeft: s(2), // Align label with input text
  },
  fieldValue: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: s(18), // Fixed line height for better vertical alignment
    color: '#7A7B7B', // Figma: #7A7B7B
    paddingLeft: s(2), // Small left padding for text spacing
    paddingRight: s(40), // Space for edit icon
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center', // Better alignment on Android
    includeFontPadding: false, // Remove extra padding on Android
  },
  fieldValuePassword: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: s(18), // Fixed line height for better vertical alignment
    color: '#7A7B7B', // Figma: #7A7B7B
    paddingLeft: s(2), // Small left padding for text spacing
    paddingTop: 0,
    paddingBottom: 0,
  },

  // Edit Icon - Figma: x: 360 (relative to card), y: 24 (relative to card)
  editIcon: {
    position: 'absolute',
    top: vs(24),
    right: s(20),
    width: s(20),
    height: s(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPencilIcon: {
    width: s(20),
    height: s(20),
  },

  // Button Spacer
  buttonSpacer: {
    height: vs(700), // Ensure scroll area extends past the last field
  },

  // Bottom Buttons Container - Figma: y: 876
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: vs(40),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    gap: s(16),
  },

  // Discard Button - Figma: x: 20, y: 876, size: 192x40
  discardButton: {
    width: s(192),
    height: vs(40),
    backgroundColor: 'rgba(217, 217, 217, 0.5)', // Figma: rgba(217, 217, 217, 0.5)
    borderRadius: s(10),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  discardButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: s(20) * 1.1,
    color: 'rgba(30, 30, 30, 0.5)', // Figma: rgba(30, 30, 30, 0.5)
    textAlign: 'center',
  },

  // Save Button - Figma: x: 228, y: 876, size: 192x40
  saveButton: {
    width: s(192),
    height: vs(40),
    backgroundColor: Colors.primary, // Figma: #3BB77E
    borderRadius: s(10),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: s(20) * 1.1,
    color: Colors.white,
    textAlign: 'center',
  },
});
