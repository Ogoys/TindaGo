import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ref, update, serverTimestamp } from 'firebase/database';
import { auth, database } from '../../../FirebaseConfig';
import { s, vs } from "../../../src/constants/responsive";

interface FormData {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function StoreOwnerRegisterScreen() {
  // Get pre-filled data from navigation params
  const { name, email, uid, prefilledName, prefilledEmail, prefilledPassword } = useLocalSearchParams<{
    name?: string;
    email?: string;
    uid?: string;
    prefilledName?: string;
    prefilledEmail?: string;
    prefilledPassword?: string;
  }>();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Pre-fill form with data from previous registration step
  useEffect(() => {
    if (prefilledName || name) {
      setFormData(prev => ({
        ...prev,
        name: prefilledName || name || "",
        email: prefilledEmail || email || "",
        password: prefilledPassword || "",
        confirmPassword: prefilledPassword || "",
      }));
    }
  }, [prefilledName, name, prefilledEmail, email, prefilledPassword]);

  const [errors, setErrors] = useState<Errors>({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Errors = {
      name: "",
      mobileNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Mobile number validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else {
      const phoneRegex = /^(\+63|0)[0-9]{10}$/;
      if (!phoneRegex.test(formData.mobileNumber.replace(/\s/g, ""))) {
        newErrors.mobileNumber = "Please enter a valid Philippine mobile number";
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
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
      const userId = auth.currentUser.uid;

      // Update user profile with additional personal details
      const userProfileData = {
        phone: formData.mobileNumber.trim(),
        personalDetailsComplete: true,
        storeDetailsComplete: false,
        documentsComplete: false,
        bankDetailsComplete: false,
        businessComplete: false,
        updatedAt: serverTimestamp()
      };

      // Save personal details to Firebase
      const userProfileRef = ref(database, `users/${userId}/profile`);
      await update(userProfileRef, userProfileData);

      // Also save to store owner personal info for easier access
      const storeOwnerData = {
        personalInfo: {
          name: formData.name.trim(),
          mobile: formData.mobileNumber.trim(),
          email: formData.email.trim(),
          completedAt: serverTimestamp()
        },
        status: 'personal_details_complete',
        updatedAt: serverTimestamp()
      };

      const storeOwnerRef = ref(database, `store_registrations/${userId}`);
      await update(storeOwnerRef, storeOwnerData);

      Alert.alert(
        "Personal Details Saved!",
        "Your personal information has been saved. Next, you'll add your store business details.",
        [
          {
            text: "Continue to Store Details",
            onPress: () => {
              console.log("Store owner personal data saved:", formData);
              // Pass the store owner personal data to the next step
              router.push({
                pathname: "/(auth)/(store-owner)/StoreDetails",
                params: {
                  ownerName: formData.name,
                  ownerMobile: formData.mobileNumber,
                  ownerEmail: formData.email,
                  ownerPassword: formData.password
                }
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error("Error saving personal details:", error);
      let errorMessage = "Failed to save personal details. Please try again.";

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

  // Custom FormInput component with fixed keyboard handling
  const FormInputField = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = "default",
    style,
    editable = true,
    isPrefilled = false
  }: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "phone-pad";
    style?: any;
    editable?: boolean;
    isPrefilled?: boolean;
  }) => (
    <View style={[styles.inputContainer, style]}>
      <Text style={styles.inputLabel}>
        {label}
        {isPrefilled && <Text style={styles.prefilledIndicator}> (from registration)</Text>}
      </Text>
      <View style={[styles.inputBox, !editable && styles.inputBoxDisabled]}>
        <TextInput
          style={[styles.textInput, !editable && styles.textInputDisabled]}
          placeholder={placeholder}
          placeholderTextColor="rgba(30, 30, 30, 0.5)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          blurOnSubmit={false}
          returnKeyType="next"
          enablesReturnKeyAutomatically={false}
          editable={editable}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />

      {/* Background with purple gradient */}
      <View style={styles.backgroundContainer}>

        {/* Top Section with illustration and header text */}
        <View style={styles.topSection}>
          {/* Figma: Get Started text at x:22, y:84 */}
          <Text style={styles.getStartedText}>Get Started</Text>

          {/* Figma: Subtitle at x:20, y:106 */}
          <Text style={styles.subtitleText}>Register to create an account</Text>

          {/* Figma: Store illustration at x:329, y:45, width:100, height:100 */}
          <Image
            source={require("../../../src/assets/images/store-owner-registration/store-owner-illustration.png")}
            style={styles.illustration}
          />
        </View>

        {/* White Card Container - Figma: y:150, borderRadius: 20px 20px 0px 0px */}
        <View style={styles.cardContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            scrollEnabled={true}
          >

            {/* Figma: Register title at x:183, y:204 */}
            <Text style={styles.registerTitle}>Register</Text>

            {/* Progress Line - Figma: y:252, 4 segments of 88px each */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentInactive]} />
              <View style={[styles.progressSegment, styles.progressSegmentInactive]} />
              <View style={[styles.progressSegment, styles.progressSegmentInactive]} />
            </View>

            {/* Figma: Section label at x:20, y:272 */}
            <Text style={styles.sectionLabel}>Add Personal Detail</Text>

            {/* Form Fields */}
            {/* Figma: Name field starts at y:314 */}
            <FormInputField
              label="Name"
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              keyboardType="default"
              style={styles.nameField}
              editable={!formData.name || formData.name === ""}
              isPrefilled={!!(prefilledName || name)}
            />

            {/* Figma: Mobile Number field at y:411 */}
            <FormInputField
              label="Mobile Number"
              placeholder="Enter your mobile number"
              value={formData.mobileNumber}
              onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
              keyboardType="phone-pad"
              style={styles.mobileField}
            />

            {/* Figma: Email field at y:508 */}
            <FormInputField
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              style={styles.emailField}
              editable={!formData.email || formData.email === ""}
              isPrefilled={!!(prefilledEmail || email)}
            />

            {/* Figma: Password field at y:605 */}
            <FormInputField
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              style={styles.passwordField}
              editable={!formData.password || formData.password === ""}
              isPrefilled={!!prefilledPassword}
            />

            {/* Figma: Confirm Password field at y:702 */}
            <FormInputField
              label="Confirmed Password"
              placeholder="Enter your confirmed password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
              style={styles.confirmPasswordField}
              editable={!formData.confirmPassword || formData.confirmPassword === ""}
              isPrefilled={!!prefilledPassword}
            />

            {/* Figma: Continue button at x:20, y:839, width:400, height:50 */}
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
    </KeyboardAvoidingView>
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

  // Figma: Illustration at x:329, y:45, width:100, height:100
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

  // Form Input Styles
  inputContainer: {
    marginHorizontal: s(20),
    marginTop: vs(42), // Gap between fields
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

  textInput: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    lineHeight: vs(22),
    color: '#1E1E1E',
    flex: 1,
    // NO minHeight or height constraints that could cause issues
  },

  // Specific field positioning adjustments
  nameField: {
    marginTop: vs(20), // First field has less margin
  },

  mobileField: {
    // Uses default marginTop
  },

  emailField: {
    // Uses default marginTop
  },

  passwordField: {
    // Uses default marginTop
  },

  confirmPasswordField: {
    // Uses default marginTop
  },

  // Figma: Continue button at x:20, y:839 (relative to screen, so bottom of form)
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

  // Prefilled field styles
  prefilledIndicator: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '400',
    fontSize: s(12),
    color: '#3BB77E',
    fontStyle: 'italic',
  },

  inputBoxDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#CCCCCC',
  },

  textInputDisabled: {
    color: '#666666',
  },
});