import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { auth } from '../../../FirebaseConfig';
import { s, vs } from "../../../src/constants/responsive";
import { StoreRegistrationService } from '../../../src/services/StoreRegistrationService';

interface BankDetailsFormData {
  paymentMethod: 'gcash' | 'paymaya' | 'bank_transfer';
  accountName: string;
  accountNumber: string;
}

interface BankDetailsErrors {
  paymentMethod: string;
  accountName: string;
  accountNumber: string;
}

// FormInput component - defined outside to prevent re-creation on every render
const FormInputField = React.memo(({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  secureTextEntry = false,
  keyboardType = "default"
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: any;
  secureTextEntry?: boolean;
  keyboardType?: any;
}) => (
  <View style={[styles.inputContainer, style]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputBox}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="rgba(30, 30, 30, 0.5)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  </View>
));

export default function BankDetailsScreen() {
  // Get store info from previous screen
  const { storeName, ownerName, ownerEmail } = useLocalSearchParams<{
    storeName?: string;
    ownerName?: string;
    ownerEmail?: string;
  }>();

  const [formData, setFormData] = useState<BankDetailsFormData>({
    paymentMethod: 'gcash',
    accountName: "",
    accountNumber: "",
  });

  const [errors, setErrors] = useState<BankDetailsErrors>({
    paymentMethod: "",
    accountName: "",
    accountNumber: "",
  });

  const [loading, setLoading] = useState(false);

  // Memoized handlers to prevent keyboard issues
  const handleAccountNameChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, accountName: text }));
  }, []);

  const handleAccountNumberChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, accountNumber: text }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: BankDetailsErrors = {
      paymentMethod: "",
      accountName: "",
      accountNumber: "",
    };

    // Payment method validation
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    // Account Name validation
    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    } else if (formData.accountName.trim().length < 2) {
      newErrors.accountName = "Account name must be at least 2 characters";
    }

    // Account Number validation based on payment method
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else {
      if (formData.paymentMethod === 'gcash' || formData.paymentMethod === 'paymaya') {
        // Philippine mobile number format: 11 digits starting with 09
        if (!/^09\d{9}$/.test(formData.accountNumber.trim().replace(/\s+/g, ''))) {
          newErrors.accountNumber = `Please enter a valid 11-digit ${formData.paymentMethod.toUpperCase()} number (09XXXXXXXXX)`;
        }
      } else if (formData.paymentMethod === 'bank_transfer') {
        // Bank account number: at least 10 digits
        if (!/^\d{10,}$/.test(formData.accountNumber.trim().replace(/\s+/g, ''))) {
          newErrors.accountNumber = "Please enter a valid bank account number (at least 10 digits)";
        }
      }
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
      // Use centralized service to update payment details with standardized status
      await StoreRegistrationService.updatePaymentDetails({
        paymentMethod: formData.paymentMethod,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
      });

      Alert.alert(
        "Payment Details Saved!",
        "Your payment details have been saved successfully. Next: Upload your business documents.",
        [
          {
            text: "Continue",
            onPress: () => {
              console.log("Payment details saved for:", storeName);
              router.push({
                pathname: "/(auth)/(store-owner)/DocumentUpload",
                params: {
                  storeName: storeName || "",
                  ownerName: ownerName || "",
                  ownerEmail: ownerEmail || ""
                }
              });
            }
          }
        ]
      );

    } catch (error: any) {
      console.error("Error saving payment details:", error);
      let errorMessage = "Failed to complete registration. Please try again.";

      if (error.code === 'database/permission-denied') {
        errorMessage = "Permission denied. Please check your authentication.";
      } else if (error.code === 'database/network-error') {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Figma: Status Bar at y:0 */}
      <View style={styles.statusBar}>
        {/* Status bar content would be here */}
      </View>

      {/* Background with purple gradient */}
      <View style={styles.backgroundContainer}>

        {/* Top Section with illustration and header text */}
        <View style={styles.topSection}>
          {/* Figma: Get Started text at x:22, y:84 */}
          <Text style={styles.getStartedText}>Get Started</Text>

          {/* Figma: Subtitle at x:20, y:106 */}
          <Text style={styles.subtitleText}>Register to create an account</Text>

          {/* Figma: Number 4 illustration at x:329, y:45, width:100, height:100 */}
          <Image
            source={require("../../../src/assets/images/store-registration/step-4-icon.png")}
            style={styles.illustration}
          />
        </View>

        {/* White Card Container - Figma: Rectangle 36 at y:150, borderRadius: 20px 20px 0px 0px */}
        <View style={styles.cardContainer}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* Figma: Register title at x:183, y:204 */}
            <Text style={styles.registerTitle}>Register</Text>

            {/* Progress Line - Figma: y:252, 4 segments of 88px each, step 3 active */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentCurrent]} />
              <View style={[styles.progressSegment, styles.progressSegmentInactive]} />
            </View>

            {/* Figma: Section label "Add Payment Details" at x:20, y:272 */}
            <Text style={styles.sectionLabel}>Add Payment Details</Text>

            {/* Payment Method Selector */}
            <View style={styles.paymentMethodSection}>
              <Text style={styles.paymentMethodLabel}>Payment Method</Text>
              <View style={styles.paymentMethodContainer}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    formData.paymentMethod === 'gcash' && styles.paymentMethodButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, paymentMethod: 'gcash' })}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    formData.paymentMethod === 'gcash' && styles.paymentMethodTextActive
                  ]}>GCash</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    formData.paymentMethod === 'paymaya' && styles.paymentMethodButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, paymentMethod: 'paymaya' })}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    formData.paymentMethod === 'paymaya' && styles.paymentMethodTextActive
                  ]}>PayMaya</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    formData.paymentMethod === 'bank_transfer' && styles.paymentMethodButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    formData.paymentMethod === 'bank_transfer' && styles.paymentMethodTextActive
                  ]}>Bank Transfer</Text>
                </TouchableOpacity>
              </View>
              {errors.paymentMethod ? (
                <Text style={styles.errorText}>{errors.paymentMethod}</Text>
              ) : null}
            </View>

            {/* Form Fields */}
            {/* Figma: Account Name field at x:20, y:314 */}
            <View>
              <FormInputField
                label="Account Name"
                placeholder="Enter account name"
                value={formData.accountName}
                onChangeText={handleAccountNameChange}
                style={styles.accountNameField}
              />
              {errors.accountName ? (
                <Text style={styles.errorText}>{errors.accountName}</Text>
              ) : null}
            </View>

            {/* Figma: Account Number field at x:22, y:411 */}
            <View>
              <FormInputField
                label={`${formData.paymentMethod === 'bank_transfer' ? 'Bank Account' : formData.paymentMethod.toUpperCase()} Number`}
                placeholder={`Enter your ${formData.paymentMethod === 'bank_transfer' ? 'bank account' : formData.paymentMethod} number`}
                value={formData.accountNumber}
                onChangeText={handleAccountNumberChange}
                style={styles.accountNumberField}
                keyboardType="numeric"
              />
              {errors.accountNumber ? (
                <Text style={styles.errorText}>{errors.accountNumber}</Text>
              ) : null}
            </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#652A70', // Figma background color fill_L49TZ4
  },

  // Figma: Status Bar at y:0, width:439.5, height:54
  statusBar: {
    height: vs(54),
    backgroundColor: 'transparent',
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
    fontSize: s(24), // style_BMOD5F
    lineHeight: vs(22),
    color: '#FFFFFF', // fill_700E0V
    textAlign: 'center',
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
    fontSize: s(14), // style_3JB0XJ
    lineHeight: vs(22),
    color: 'rgba(255, 255, 255, 0.5)', // fill_L78KCX
  },

  // Figma: Number 4 illustration at x:329, y:45, width:100, height:100
  illustration: {
    position: 'absolute',
    left: s(329),
    top: vs(45),
    width: s(100),
    height: vs(100),
  },

  // White Card Container - Figma: Rectangle 36 at y:150, borderRadius: 20px 20px 0px 0px
  cardContainer: {
    flex: 1,
    backgroundColor: '#F4F6F6', // fill_44WV89
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
    fontSize: s(20), // style_PWB2WY
    lineHeight: vs(22),
    color: '#000000', // fill_X94FLZ
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
    backgroundColor: '#02545F', // Completed steps
  },

  progressSegmentCurrent: {
    backgroundColor: '#3BB77E', // Current step
  },

  progressSegmentInactive: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)', // Future steps
  },

  // Figma: Section label "Add Gcash/Paypal" at x:20, y:272 (relative to screen, so y:122 relative to card)
  sectionLabel: {
    marginTop: vs(20), // 122 - 102 = 20
    marginLeft: s(20),
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20), // style_YZ33BQ
    lineHeight: vs(22),
    color: '#1E1E1E', // fill_30QXGI
  },

  // Form Input Styles
  inputContainer: {
    marginHorizontal: s(20),
  },

  inputLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16), // style_LGOOMR
    lineHeight: vs(22),
    color: '#1E1E1E', // fill_30QXGI
    marginBottom: vs(5),
  },

  inputBox: {
    borderWidth: 2,
    borderColor: '#02545F', // stroke_NN8NY1
    borderRadius: s(20),
    paddingHorizontal: s(20),
    paddingVertical: vs(14),
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.25)', // effect_PEQ1SW
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 5,
  },

  textInput: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14), // style_V6GQBG
    lineHeight: vs(22),
    color: '#1E1E1E',
    flex: 1,
  },

  // Specific field positioning based on Figma coordinates
  // Figma: Account Name at x:20, y:314 (relative to screen, so y:164 relative to card)
  accountNameField: {
    marginTop: vs(42), // 164 - 122 = 42
  },

  // Figma: Account Number at x:22, y:411 (relative to screen, so y:261 relative to card)
  accountNumberField: {
    marginTop: vs(35), // Reduced from 97 to prevent cutoff
  },

  // Figma: Email at x:22, y:508 (relative to screen, so y:358 relative to card)
  emailField: {
    marginTop: vs(35), // Reduced from 97 to prevent cutoff
  },

  // Figma: Password at x:20, y:605 (relative to screen, so y:455 relative to card)
  passwordField: {
    marginTop: vs(35), // Reduced from 97 to prevent cutoff
  },

  // Figma: Continue button at x:20, y:839, width:400, height:50 (relative to screen, so y:689 relative to card)
  continueButton: {
    marginHorizontal: s(20),
    marginTop: vs(40), // Reduced from 234 to prevent cutoff
    backgroundColor: '#3BB77E', // fill_3NDY2B
    borderRadius: s(20),
    height: vs(50),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)', // effect_QAB3E4
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },

  continueButtonText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(20), // style_PWB2WY
    lineHeight: vs(22),
    color: '#FFFFFF', // fill_700E0V
  },

  continueButtonDisabled: {
    backgroundColor: 'rgba(59, 183, 126, 0.5)',
  },

  // Payment Method Selector Styles
  paymentMethodSection: {
    marginHorizontal: s(20),
    marginTop: vs(25),
  },

  paymentMethodLabel: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(16),
    lineHeight: vs(22),
    color: '#1E1E1E',
    marginBottom: vs(15),
  },

  paymentMethodContainer: {
    flexDirection: 'row',
    gap: s(10),
    flexWrap: 'wrap',
  },

  paymentMethodButton: {
    flex: 1,
    minWidth: s(100),
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
    borderWidth: 2,
    borderColor: '#02545F',
    borderRadius: s(12),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paymentMethodButtonActive: {
    backgroundColor: '#3BB77E',
    borderColor: '#3BB77E',
  },

  paymentMethodText: {
    fontFamily: 'Clash Grotesk Variable',
    fontWeight: '500',
    fontSize: s(14),
    color: '#02545F',
  },

  paymentMethodTextActive: {
    color: '#FFFFFF',
  },

  // Error text styles
  errorText: {
    fontFamily: 'Clash Grotesk Variable',
    fontSize: s(12),
    fontWeight: '400',
    color: '#E92B45',
    marginTop: vs(5),
    marginLeft: s(20),
  },
});