import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from '../../../FirebaseConfig';
import { s, vs } from "../../../src/constants/responsive";
import { StoreRegistrationService } from '../../../src/services/StoreRegistrationService';

interface StoreFormData {
  storeName: string;
  description: string;
  storeAddress: string;
  city: string;
  zipCode: string;
  logo: string | null;
  coverImage: string | null;
}

interface StoreErrors {
  storeName: string;
  description: string;
  storeAddress: string;
  city: string;
  zipCode: string;
}

export default function StoreDetailsScreen() {
  // Get owner details from previous screen
  const { ownerName, ownerMobile, ownerEmail } = useLocalSearchParams<{
    ownerName?: string;
    ownerMobile?: string;
    ownerEmail?: string;
  }>();

  const [formData, setFormData] = useState<StoreFormData>({
    storeName: "",
    description: "",
    storeAddress: "",
    city: "",
    zipCode: "",
    logo: null,
    coverImage: null,
  });

  const [errors, setErrors] = useState<StoreErrors>({
    storeName: "",
    description: "",
    storeAddress: "",
    city: "",
    zipCode: "",
  });

  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: StoreErrors = {
      storeName: "",
      description: "",
      storeAddress: "",
      city: "",
      zipCode: "",
    };

    // Store Name validation
    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    } else if (formData.storeName.trim().length < 2) {
      newErrors.storeName = "Store name must be at least 2 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Store Address validation
    if (!formData.storeAddress.trim()) {
      newErrors.storeAddress = "Store address is required";
    } else if (formData.storeAddress.trim().length < 5) {
      newErrors.storeAddress = "Please enter a complete address";
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (formData.city.trim().length < 2) {
      newErrors.city = "Please enter a valid city name";
    }

    // Zip Code validation
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (!/^\d{4}$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = "Please enter a valid 4-digit zip code";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleImagePicker = async (type: 'logo' | 'coverImage') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Convert image to Base64 (same as add-product)
        const base64 = await readAsStringAsync(imageUri, {
          encoding: 'base64',
        });

        // Create the data URL format
        const imageBase64 = `data:image/jpeg;base64,${base64}`;

        setFormData(prev => ({
          ...prev,
          [type]: imageBase64
        }));

        console.log(`✅ ${type} converted to Base64 and saved`);
      }
    } catch (error) {
      console.error(`❌ Error picking ${type}:`, error);
      Alert.alert('Error', `Failed to pick ${type}. Please try again.`);
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "Authentication required. Please sign in again.");
      router.push("/(auth)/signin");
      return;
    }

    setLoading(true);

    try {
      // Use centralized service to update store details with standardized status
      await StoreRegistrationService.updateStoreDetails({
        ownerName: ownerName || "",
        ownerMobile: ownerMobile || "",
        ownerEmail: ownerEmail || "",
        storeName: formData.storeName.trim(),
        description: formData.description.trim(),
        storeAddress: formData.storeAddress.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode.trim(),
        logo: formData.logo,
        coverImage: formData.coverImage,
      });

      Alert.alert(
        "Store Details Saved!",
        "Your store details have been saved successfully. Next, you'll add your payment details.",
        [
          {
            text: "Continue to Bank Details",
            onPress: () => {
              console.log("Store details saved for:", formData.storeName);
              // Pass all data to bank details screen (improved flow)
              router.push({
                pathname: "/(auth)/(store-owner)/BankDetails",
                params: {
                  storeName: formData.storeName,
                  ownerName: ownerName || "",
                  ownerEmail: ownerEmail || "",
                }
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error("Error saving store details:", error);
      let errorMessage = "Failed to save store details. Please try again.";

      if (error.code === 'database/permission-denied') {
        errorMessage = "Permission denied. Please check your authentication.";
      } else if (error.code === 'database/network-error') {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Save Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Custom FormInput component matching Figma design
  const FormInputField = ({
    label,
    placeholder,
    value,
    onChangeText,
    style,
    isTextArea = false
  }: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    style?: any;
    isTextArea?: boolean;
  }) => (
    <View style={[styles.inputContainer, style]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputBox, isTextArea && styles.textAreaBox]}>
        <TextInput
          style={[styles.textInput, isTextArea && styles.textAreaInput]}
          placeholder={placeholder}
          placeholderTextColor="rgba(30, 30, 30, 0.5)"
          value={value}
          onChangeText={onChangeText}
          multiline={isTextArea}
          numberOfLines={isTextArea ? 4 : 1}
        />
      </View>
    </View>
  );

  // Upload Component for Logo and Cover Image
  const UploadComponent = ({
    title,
    type,
    style
  }: {
    title: string;
    type: 'logo' | 'coverImage';
    style?: any;
  }) => (
    <View style={[styles.uploadContainer, style]}>
      <Text style={styles.uploadLabel}>{title}</Text>
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={() => handleImagePicker(type)}
        activeOpacity={0.8}
      >
        {formData[type] ? (
          <Image source={{ uri: formData[type]! }} style={styles.uploadedImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Image
              source={require("../../../src/assets/images/store-registration/upload-icon.png")}
              style={styles.uploadIcon}
            />
            <Text style={styles.uploadText}>Upload your photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background with purple gradient */}
      <View style={styles.backgroundContainer}>

        {/* Top Section with illustration and header text */}
        <View style={styles.topSection}>
          {/* Figma: Get Started text at x:22, y:84 */}
          <Text style={styles.getStartedText}>Get Started</Text>

          {/* Figma: Subtitle at x:20, y:106 */}
          <Text style={styles.subtitleText}>Register to create an account</Text>

          {/* Figma: Number 2 illustration at x:329, y:45, width:100, height:100 */}
          <Image
            source={require("../../../src/assets/images/store-registration/logo-number-4.png")}
            style={styles.illustration}
          />
        </View>

        {/* White Card Container - Figma: y:150, borderRadius: 20px 20px 0px 0px */}
        <View style={styles.cardContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* Figma: Register title at x:183, y:204 */}
            <Text style={styles.registerTitle}>Register</Text>

            {/* Progress Line - Figma: y:252, 4 segments of 88px each, step 2 active */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentCurrent]} />
              <View style={[styles.progressSegment, styles.progressSegmentInactive]} />
              <View style={[styles.progressSegment, styles.progressSegmentInactive]} />
            </View>

            {/* Figma: Section label at x:20, y:272 */}
            <Text style={styles.sectionLabel}>Add Store Details</Text>

            {/* Upload Components - Figma: Logo at x:30, y:314 and Cover at x:260, y:314 */}
            <View style={styles.uploadRow}>
              <UploadComponent
                title="Logo"
                type="logo"
                style={styles.logoUpload}
              />
              <UploadComponent
                title="Cover Image"
                type="coverImage"
                style={styles.coverUpload}
              />
            </View>

            {/* Form Fields */}
            {/* Figma: Store Name field at y:511 */}
            <FormInputField
              label="Store Name"
              placeholder="Enter store name"
              value={formData.storeName}
              onChangeText={(text) => setFormData({ ...formData, storeName: text })}
              style={styles.storeNameField}
            />

            {/* Figma: Description field at y:608 */}
            <FormInputField
              label="Description"
              placeholder="Enter description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              style={styles.descriptionField}
              isTextArea={true}
            />

            {/* Figma: Store Address field at y:735 */}
            <FormInputField
              label="Store Address"
              placeholder="Enter store address"
              value={formData.storeAddress}
              onChangeText={(text) => setFormData({ ...formData, storeAddress: text })}
              style={styles.addressField}
            />

            {/* Figma: City and Zip Code in a row at y:835 */}
            <View style={styles.rowContainer}>
              <FormInputField
                label="City"
                placeholder="Enter city"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                style={styles.cityField}
              />
              <FormInputField
                label="Zip Code"
                placeholder="Enter zip code"
                value={formData.zipCode}
                onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                style={styles.zipField}
              />
            </View>

            {/* Figma: Continue button at x:20, y:972, width:400, height:50 */}
            <TouchableOpacity
              style={[styles.continueButton, loading && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {loading ? "Processing..." : "Continue"}
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#652A70', // Figma background color
  },
  backgroundContainer: {
    flex: 1,
  },

  // Top Section (purple background area)
  topSection: {
    // Figma: height from 0 to 150
    height: vs(150),
    position: 'relative',
  },

  // Figma: Get Started at x:22, y:84, width:131, height:22
  getStartedText: {
    position: 'absolute',
    left: s(22),
    top: vs(84),
    width: s(131),
    height: vs(22),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '600',
    fontSize: s(24),
    lineHeight: vs(22),
    color: '#FFFFFF',
  },

  // Figma: Subtitle at x:20, y:106, width:176, height:22
  subtitleText: {
    position: 'absolute',
    left: s(20),
    top: vs(106),
    width: s(176),
    height: vs(22),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(14),
    lineHeight: vs(22),
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Figma: Number 2 illustration at x:329, y:45, width:100, height:100
  illustration: {
    position: 'absolute',
    left: s(329),
    top: vs(45),
    width: s(100),
    height: vs(100),
  },

  // White Card Container - Figma: y:150, borderRadius: 20px 20px 0px 0px
  cardContainer: {
    flex: 1,
    backgroundColor: '#F4F6F6',
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    marginTop: vs(150),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: vs(50),
  },

  // Figma: Register title at x:183, y:204 (relative to screen, so y:54 relative to card)
  registerTitle: {
    marginTop: vs(54),
    textAlign: 'center',
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: vs(22),
    color: '#000000',
  },

  // Progress Container - Figma: y:252 (relative to screen, so y:102 relative to card)
  progressContainer: {
    flexDirection: 'row',
    marginTop: vs(48), // 102 - 54 = 48
    marginLeft: s(20),
    marginRight: s(20),
    justifyContent: 'space-between',
  },

  // Progress Segments - Figma: width:88 each
  progressSegment: {
    width: s(88),
    height: s(4),
    borderRadius: s(2),
  },

  progressSegmentActive: {
    backgroundColor: '#02545F',
  },

  progressSegmentCurrent: {
    backgroundColor: '#3BB77E', // Green color to show current step
  },

  progressSegmentInactive: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },

  // Figma: Section label at x:20, y:272 (relative to screen, so y:122 relative to card)
  sectionLabel: {
    marginTop: vs(20), // 122 - 102 = 20
    marginLeft: s(20),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: vs(22),
    color: '#1E1E1E',
  },

  // Upload Row Container - Figma: Logo at x:30, Cover at x:260
  uploadRow: {
    flexDirection: 'row',
    marginTop: vs(42),
    paddingHorizontal: s(20),
    justifyContent: 'space-between',
  },

  // Upload Container - Figma: width:150, height:177
  uploadContainer: {
    width: s(150),
    height: vs(177),
  },

  logoUpload: {
    // Figma: x:30 (relative to screen, so x:10 relative to container with 20px padding)
    marginLeft: s(10),
  },

  coverUpload: {
    // Figma: x:260 (relative to screen, so positioned by justifyContent: space-between)
    marginRight: s(10),
  },

  // Upload Label - Figma: Logo/Cover Image text
  uploadLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: vs(22),
    color: '#000000',
    marginBottom: vs(5),
  },

  // Upload Box - Figma: 150x150 with border radius
  uploadBox: {
    width: s(150),
    height: vs(150),
    backgroundColor: '#FFFFFF',
    borderRadius: s(20),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 3,
    overflow: 'hidden',
  },

  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Figma: Upload icon at 25x25
  uploadIcon: {
    width: s(25),
    height: vs(25),
    marginBottom: vs(10),
  },

  // Figma: Upload text
  uploadText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(12),
    lineHeight: vs(22),
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },

  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Form Input Styles
  inputContainer: {
    marginHorizontal: s(20),
    marginTop: vs(35),
  },

  inputLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: vs(22),
    color: '#1E1E1E',
    marginBottom: vs(5),
  },

  inputBox: {
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(14),
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 5,
  },

  textAreaBox: {
    minHeight: vs(80),
  },

  textInput: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: vs(22),
    color: '#1E1E1E',
    flex: 1,
  },

  textAreaInput: {
    textAlignVertical: 'top',
  },

  // Specific field positioning adjustments
  storeNameField: {
    marginTop: vs(20), // First field after uploads
  },

  descriptionField: {
    // Uses default marginTop
  },

  addressField: {
    // Uses default marginTop
  },

  // Row container for City and Zip Code - Figma: City at x:21, Zip at x:240
  rowContainer: {
    flexDirection: 'row',
    marginHorizontal: s(20),
    marginTop: vs(35),
    justifyContent: 'space-between',
  },

  cityField: {
    // Figma: width:180
    width: s(180),
    marginHorizontal: 0,
    marginTop: 0,
  },

  zipField: {
    // Figma: width:180
    width: s(180),
    marginHorizontal: 0,
    marginTop: 0,
  },

  // Figma: Continue button at x:20, y:972, width:400, height:50
  continueButton: {
    marginHorizontal: s(20),
    marginTop: vs(40),
    backgroundColor: '#3BB77E',
    borderRadius: s(20),
    paddingVertical: vs(15),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },

  continueButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20),
    lineHeight: vs(22),
    color: '#FFFFFF',
  },

  continueButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
  },
});