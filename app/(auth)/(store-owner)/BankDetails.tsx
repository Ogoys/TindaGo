import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { s, vs } from "../../../src/constants/responsive";

interface BankDetailsFormData {
  accountName: string;
  accountNumber: string;
  email: string;
  password: string;
}

interface BankDetailsErrors {
  accountName: string;
  accountNumber: string;
  email: string;
  password: string;
}

export default function BankDetailsScreen() {
  const [formData, setFormData] = useState<BankDetailsFormData>({
    accountName: "",
    accountNumber: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<BankDetailsErrors>({
    accountName: "",
    accountNumber: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: BankDetailsErrors = {
      accountName: "",
      accountNumber: "",
      email: "",
      password: "",
    };

    // Account Name validation
    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    } else if (formData.accountName.trim().length < 2) {
      newErrors.accountName = "Account name must be at least 2 characters";
    }

    // Account Number validation (Philippine GCash format: 11 digits starting with 09)
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^09\d{9}$/.test(formData.accountNumber.trim().replace(/\s+/g, ''))) {
      newErrors.accountNumber = "Please enter a valid 11-digit GCash number (09XXXXXXXXX)";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

    setLoading(true);

    try {
      // For now, simulate successful bank details submission
      Alert.alert(
        "Bank Details Submitted!",
        "Your payment details have been saved. You'll now proceed to the final verification step.",
        [
          {
            text: "Continue",
            onPress: () => {
              console.log("Bank details data:", formData);
              // Navigate to next step (final verification/document upload)
              router.push("/(auth)/(store-owner)/DocumentUpload");
            }
          }
        ]
      );
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
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
  );

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

            {/* Progress Line - Figma: y:252, 4 segments of 88px each, step 4 active */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            </View>

            {/* Figma: Section label "Add Gcash/Paypal" at x:20, y:272 */}
            <Text style={styles.sectionLabel}>Add Gcash/Paypal</Text>

            {/* Form Fields */}
            {/* Figma: Account Name field at x:20, y:314 */}
            <FormInputField
              label="Account Name"
              placeholder="Enter account name"
              value={formData.accountName}
              onChangeText={(text) => setFormData({ ...formData, accountName: text })}
              style={styles.accountNameField}
            />

            {/* Figma: Account Number field at x:22, y:411 */}
            <FormInputField
              label="Account Number"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
              style={styles.accountNumberField}
              keyboardType="numeric"
            />

            {/* Figma: Email field at x:22, y:508 */}
            <FormInputField
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              style={styles.emailField}
              keyboardType="email-address"
            />

            {/* Figma: Password field at x:20, y:605 */}
            <FormInputField
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              style={styles.passwordField}
              secureTextEntry={true}
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
    backgroundColor: '#02545F', // stroke_1X6M6G
  },

  progressSegmentInactive: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)', // stroke_N0XJ37
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
});