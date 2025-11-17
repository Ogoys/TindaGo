/**
 * STORE OWNER ACCOUNT SETTINGS SCREEN (My Account)
 *
 * Similar structure to customer account-settings.tsx but for store owners
 * 
 * Features:
 * - Edit store name, owner name, email, phone, address, description
 * - Store logo upload (similar to customer profile picture)
 * - Real-time Firebase sync
 * - Field validation
 * - Save/Discard actions
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
import { auth, database } from '../../../../FirebaseConfig';
import { ref, get, update as updateDB, onValue, off } from 'firebase/database';
import {
  updateProfile,
  updateEmail,
} from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../../../src/lib/upload/cloudinary';

interface EditableField {
  label: string;
  value: string;
  isEditing: boolean;
  type: 'text' | 'email' | 'phone' | 'address' | 'multiline';
}

export default function MyAccount() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Field states
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [password, setPassword] = useState('*********************');

  // Editing states
  const [savingField, setSavingField] = useState<string | null>(null);

  // Original values for comparison
  const [originalStoreName, setOriginalStoreName] = useState('');
  const [originalOwnerName, setOriginalOwnerName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState('');
  const [originalStoreDescription, setOriginalStoreDescription] = useState('');

  // Logo states
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Get store initials for logo placeholder
  const getStoreInitials = (): string => {
    if (storeName) {
      const words = storeName.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return storeName.substring(0, 2).toUpperCase();
    }
    return 'ST';
  };

  // Load store data on mount and subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Subscribe to real-time store registration updates
    const storeRegRef = ref(database, `store_registrations/${currentUser.uid}`);
    const userRef = ref(database, `users/${currentUser.uid}`);

    const loadStoreData = async () => {
      try {
        // Fetch store registration data
        const storeSnapshot = await get(storeRegRef);
        const userSnapshot = await get(userRef);

        if (storeSnapshot.exists()) {
          const storeData = storeSnapshot.val();
          const userData = userSnapshot.exists() ? userSnapshot.val() : {};

          // Map store data to fields
          const storeNameVal = storeData.businessInfo?.storeName || storeData.storeName || '';
          const ownerNameVal = userData.name || storeData.personalInfo?.firstName + ' ' + storeData.personalInfo?.lastName || '';
          const emailVal = userData.email || storeData.businessInfo?.email || currentUser.email || '';
          const phoneVal = storeData.businessInfo?.contactNumber || storeData.contactNumber || userData.phoneNumber || '';
          const descriptionVal = storeData.businessInfo?.description || storeData.description || '';
          const logoVal = storeData.businessInfo?.logo || storeData.logo || null;

          setStoreName(storeNameVal);
          setOwnerName(ownerNameVal);
          setEmail(emailVal);
          setPhoneNumber(phoneVal);
          setStoreDescription(descriptionVal);
          setStoreLogo(logoVal);

          // Store original values
          setOriginalStoreName(storeNameVal);
          setOriginalOwnerName(ownerNameVal);
          setOriginalEmail(emailVal);
          setOriginalPhoneNumber(phoneVal);
          setOriginalStoreDescription(descriptionVal);
        }
      } catch (error) {
        console.error('Error loading store data:', error);
      }
    };

    loadStoreData();

    // Set up real-time listener
    const unsubscribeStore = onValue(storeRegRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.businessInfo?.storeName) setStoreName(data.businessInfo.storeName);
        if (data.businessInfo?.logo) setStoreLogo(data.businessInfo.logo);
      }
    });

    return () => {
      unsubscribeStore();
    };
  }, [user]);

  // Check if there are any changes
  useEffect(() => {
    const hasStoreNameChanged = storeName !== originalStoreName;
    const hasOwnerNameChanged = ownerName !== originalOwnerName;
    const hasEmailChanged = email !== originalEmail;
    const hasPhoneChanged = phoneNumber !== originalPhoneNumber;
    const hasDescriptionChanged = storeDescription !== originalStoreDescription;

    setHasChanges(
      hasStoreNameChanged ||
      hasOwnerNameChanged ||
      hasEmailChanged ||
      hasPhoneChanged ||
      hasDescriptionChanged
    );
  }, [storeName, ownerName, email, phoneNumber, storeDescription, originalStoreName, originalOwnerName, originalEmail, originalPhoneNumber, originalStoreDescription]);

  // Handle logo upload
  const handleLogoUpload = () => {
    Alert.alert(
      'Change Store Logo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handleChooseFromGallery,
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadLogo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Gallery permission is required to choose photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadLogo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error choosing photo:', error);
      Alert.alert('Error', 'Failed to choose photo. Please try again.');
    }
  };

  const uploadLogo = async (imageUri: string) => {
    if (!user) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setUploadingLogo(true);
    
    try {
      console.log('📸 Uploading store logo to Cloudinary...');
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(
        imageUri,
        `stores/${currentUser.uid}/logo`
      );

      console.log('✅ Store logo uploaded:', cloudinaryUrl);

      // Update Firebase with Cloudinary URL
      const storeRegRef = ref(database, `store_registrations/${currentUser.uid}`);
      await updateDB(storeRegRef, {
        'businessInfo/logo': cloudinaryUrl,
        logo: cloudinaryUrl, // Legacy field
      });

      setStoreLogo(cloudinaryUrl);
      Alert.alert('Success', 'Store logo updated successfully!');
    } catch (error) {
      console.error('❌ Error uploading logo:', error);
      Alert.alert('Error', 'Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
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

  // Validate phone number format
  const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+639|09)\d{9}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone);
  };

  // Handle field blur (save on blur)
  const handleFieldBlur = async (fieldName: string, value: string) => {
    if (!user) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Check if value actually changed
    let originalValue = '';
    switch (fieldName) {
      case 'storeName':
        originalValue = originalStoreName;
        break;
      case 'ownerName':
        originalValue = originalOwnerName;
        break;
      case 'email':
        originalValue = originalEmail;
        break;
      case 'phoneNumber':
        originalValue = originalPhoneNumber;
        break;
      case 'storeDescription':
        originalValue = originalStoreDescription;
        break;
    }

    // No change, skip
    if (value === originalValue) return;

    // Validate before saving
    if (fieldName === 'storeName' && !value.trim()) {
      Alert.alert('Validation Error', 'Store name cannot be empty');
      setStoreName(originalStoreName);
      return;
    }

    if (fieldName === 'email' && !isValidEmail(value)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      setEmail(originalEmail);
      return;
    }

    if (fieldName === 'phoneNumber' && value && !isValidPhoneNumber(value)) {
      Alert.alert('Validation Error', 'Please enter a valid Philippine phone number');
      setPhoneNumber(originalPhoneNumber);
      return;
    }

    // Save to Firebase
    setSavingField(fieldName);

    try {
      const storeRegRef = ref(database, `store_registrations/${currentUser.uid}`);
      const userRef = ref(database, `users/${currentUser.uid}`);

      // Update store registration
      if (fieldName === 'storeName') {
        await updateDB(storeRegRef, { 'businessInfo/storeName': value });
      } else if (fieldName === 'storeDescription') {
        await updateDB(storeRegRef, { 'businessInfo/description': value });
      } else if (fieldName === 'phoneNumber') {
        await updateDB(storeRegRef, { 'businessInfo/contactNumber': value });
        await updateDB(userRef, { phoneNumber: value });
      } else if (fieldName === 'ownerName') {
        await updateDB(userRef, { name: value });
      } else if (fieldName === 'email') {
        await updateDB(userRef, { email: value });
        // Update Firebase Auth email
        try {
          await updateEmail(currentUser, value);
        } catch (error: any) {
          if (error.code === 'auth/requires-recent-login') {
            Alert.alert(
              'Re-authentication Required',
              'For security reasons, please log out and log in again to update your email'
            );
            setEmail(originalEmail);
            return;
          }
          throw error;
        }
      }

      // Update original value after successful save
      switch (fieldName) {
        case 'storeName':
          setOriginalStoreName(value);
          break;
        case 'ownerName':
          setOriginalOwnerName(value);
          break;
        case 'email':
          setOriginalEmail(value);
          break;
        case 'phoneNumber':
          setOriginalPhoneNumber(value);
          break;
        case 'storeDescription':
          setOriginalStoreDescription(value);
          break;
      }

      console.log(`✅ ${fieldName} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      Alert.alert('Error', `Failed to update ${fieldName}. Please try again.`);

      // Revert to original value on error
      switch (fieldName) {
        case 'storeName':
          setStoreName(originalStoreName);
          break;
        case 'ownerName':
          setOwnerName(originalOwnerName);
          break;
        case 'email':
          setEmail(originalEmail);
          break;
        case 'phoneNumber':
          setPhoneNumber(originalPhoneNumber);
          break;
        case 'storeDescription':
          setStoreDescription(originalStoreDescription);
          break;
      }
    } finally {
      setSavingField(null);
    }
  };

  // Handle save all changes
  const handleSave = async () => {
    if (!hasChanges) {
      Alert.alert('No Changes', 'You have not made any changes to save');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setIsLoading(true);

    try {
      const storeRegRef = ref(database, `store_registrations/${currentUser.uid}`);
      const userRef = ref(database, `users/${currentUser.uid}`);

      // Update all changed fields
      const storeUpdates: any = {};
      const userUpdates: any = {};

      if (storeName !== originalStoreName) {
        storeUpdates['businessInfo/storeName'] = storeName;
      }

      if (storeDescription !== originalStoreDescription) {
        storeUpdates['businessInfo/description'] = storeDescription;
      }

      if (phoneNumber !== originalPhoneNumber) {
        storeUpdates['businessInfo/contactNumber'] = phoneNumber;
        userUpdates.phoneNumber = phoneNumber;
      }

      if (ownerName !== originalOwnerName) {
        userUpdates.name = ownerName;
        await updateProfile(currentUser, { displayName: ownerName });
      }

      if (email !== originalEmail) {
        userUpdates.email = email;
        await updateEmail(currentUser, email);
      }

      // Apply updates
      if (Object.keys(storeUpdates).length > 0) {
        await updateDB(storeRegRef, storeUpdates);
      }

      if (Object.keys(userUpdates).length > 0) {
        await updateDB(userRef, userUpdates);
      }

      // Update original values
      setOriginalStoreName(storeName);
      setOriginalOwnerName(ownerName);
      setOriginalEmail(email);
      setOriginalPhoneNumber(phoneNumber);
      setOriginalStoreDescription(storeDescription);

      Alert.alert(
        'Success',
        'Your account has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating account:', error);

      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Re-authentication Required',
          'For security reasons, please log out and log in again to update your email'
        );
      } else {
        Alert.alert('Error', 'Failed to update account. Please try again.');
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
            setStoreName(originalStoreName);
            setOwnerName(originalOwnerName);
            setEmail(originalEmail);
            setPhoneNumber(originalPhoneNumber);
            setStoreDescription(originalStoreDescription);
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

        {/* Header: Back Button */}
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

        {/* Title */}
        <Text style={styles.title}>My Account</Text>
        
        {/* Subtitle Label */}
        <Text style={styles.subtitle}>Manage your store information</Text>

        {/* Store Logo with Upload Button */}
        <View style={styles.avatarContainer}>
          {storeLogo ? (
            <Image
              source={{ uri: storeLogo }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getStoreInitials()}</Text>
            </View>
          )}

          {/* Plus button for upload */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleLogoUpload}
            activeOpacity={0.8}
            disabled={uploadingLogo}
          >
            {uploadingLogo ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Image
                source={require('../../../../src/assets/images/customer-account-settings/plus-icon.png')}
                style={styles.plusIcon}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Store Name Card */}
        <View style={[styles.fieldCard, { top: vs(295) }]}>
          <Text style={styles.fieldLabel}>Store Name</Text>
          <TextInput
            style={styles.fieldValue}
            value={storeName}
            onChangeText={setStoreName}
            onBlur={() => handleFieldBlur('storeName', storeName)}
            placeholder="Enter your store name"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="words"
            editable={savingField !== 'storeName'}
          />
          {savingField === 'storeName' ? (
            <View style={styles.editIcon}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
              <Image
                source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
                style={styles.editPencilIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Owner Name Card */}
        <View style={[styles.fieldCard, { top: vs(382) }]}>
          <Text style={styles.fieldLabel}>Owner Name</Text>
          <TextInput
            style={styles.fieldValue}
            value={ownerName}
            onChangeText={setOwnerName}
            onBlur={() => handleFieldBlur('ownerName', ownerName)}
            placeholder="Enter owner name"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="words"
            editable={savingField !== 'ownerName'}
          />
          {savingField === 'ownerName' ? (
            <View style={styles.editIcon}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
              <Image
                source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
                style={styles.editPencilIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Email Card */}
        <View style={[styles.fieldCard, { top: vs(469) }]}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.fieldValue}
            value={email}
            onChangeText={setEmail}
            onBlur={() => handleFieldBlur('email', email)}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={savingField !== 'email'}
          />
          {savingField === 'email' ? (
            <View style={styles.editIcon}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
              <Image
                source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
                style={styles.editPencilIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Phone Number Card */}
        <View style={[styles.fieldCard, { top: vs(556) }]}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            style={styles.fieldValue}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onBlur={() => handleFieldBlur('phoneNumber', phoneNumber)}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={savingField !== 'phoneNumber'}
          />
          {savingField === 'phoneNumber' ? (
            <View style={styles.editIcon}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
              <Image
                source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
                style={styles.editPencilIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Store Description Card */}
        <View style={[styles.fieldCard, styles.fieldCardTall, { top: vs(643) }]}>
          <Text style={styles.fieldLabel}>Store Description</Text>
          <TextInput
            style={[styles.fieldValue, styles.fieldValueMultiline]}
            value={storeDescription}
            onChangeText={setStoreDescription}
            onBlur={() => handleFieldBlur('storeDescription', storeDescription)}
            placeholder="Enter store description"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
            editable={savingField !== 'storeDescription'}
          />
          {savingField === 'storeDescription' ? (
            <View style={styles.editIcon}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
              <Image
                source={require('../../../../src/assets/images/customer-account-settings/edit-pencil.png')}
                style={styles.editPencilIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Password Card */}
        <TouchableOpacity
          style={[styles.fieldCard, { top: vs(770) }]}
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

      {/* Bottom Action Buttons */}
      <View style={styles.bottomButtonsContainer}>
        {/* Discard Button */}
        <TouchableOpacity
          style={styles.discardButton}
          onPress={handleDiscard}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.discardButtonText}>Discard</Text>
        </TouchableOpacity>

        {/* Save Button */}
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
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(100),
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.backgroundGray,
  },

  // Back Button
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

  // Title
  title: {
    position: 'absolute',
    top: vs(80),
    left: s(155),
    width: s(130),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(18),
    lineHeight: s(24),
    textAlign: 'center',
    color: Colors.darkGray,
    includeFontPadding: false,
  },
  
  // Subtitle Label
  subtitle: {
    position: 'absolute',
    top: vs(110),
    left: 0,
    right: 0,
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(13),
    lineHeight: s(13) * 1.2,
    textAlign: 'center',
    color: '#7A7B7B',
  },

  // Avatar/Logo Container
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: s(120),
    height: s(120),
    borderRadius: s(60),
  },
  avatarText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(48),
    lineHeight: s(48) * 1.23,
    color: Colors.white,
    textAlign: 'center',
  },

  // Upload Button (Plus Icon)
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    width: s(20),
    height: s(20),
  },

  // Field Cards
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
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  fieldCardTall: {
    height: vs(87),
    paddingTop: vs(14),
    paddingBottom: vs(14),
  },

  fieldLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: s(16) * 1.23,
    color: Colors.darkGray,
    marginBottom: vs(2),
    paddingLeft: s(2),
  },
  fieldValue: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: s(18),
    color: '#7A7B7B',
    paddingLeft: s(2),
    paddingRight: s(40),
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  fieldValueMultiline: {
    minHeight: vs(40),
    textAlignVertical: 'top',
  },
  fieldValuePassword: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: s(18),
    color: '#7A7B7B',
    paddingLeft: s(2),
    paddingTop: 0,
    paddingBottom: 0,
  },

  // Edit Icon
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
    height: vs(890),
  },

  // Bottom Buttons Container
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

  // Discard Button
  discardButton: {
    width: s(192),
    height: vs(40),
    backgroundColor: 'rgba(217, 217, 217, 0.5)',
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
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },

  // Save Button
  saveButton: {
    width: s(192),
    height: vs(40),
    backgroundColor: Colors.primary,
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
