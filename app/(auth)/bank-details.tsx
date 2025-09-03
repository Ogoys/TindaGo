import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Typography } from "../../src/components/ui/Typography";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { s, vs } from "../../src/constants/responsive";

interface BankDetailsData {
  accountName: string;
  accountNumber: string;
  email: string;
  password: string;
}

export default function BankDetailsScreen() {
  const params = useLocalSearchParams();
  
  const [bankData, setBankData] = useState<BankDetailsData>({
    accountName: "",
    accountNumber: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    accountName: "",
    accountNumber: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {
      accountName: "",
      accountNumber: "",
      email: "",
      password: "",
    };

    // Account Name validation
    if (!bankData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    // Account Number validation
    if (!bankData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (bankData.accountNumber.length < 10) {
      newErrors.accountNumber = "Account number must be at least 10 digits";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bankData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(bankData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!bankData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (bankData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Navigate to business details screen
      router.push("/(auth)/business-details");
    } else {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#652A70" />
      
      {/* Custom Status Bar - Figma: x:0, y:0, width:439.5, height:54 */}
      <View style={styles.statusBarContainer}>
        <View style={styles.statusBarContent}>
          <View style={styles.timeContainer}>
            <Typography variant="body" style={styles.timeText}>9:41</Typography>
          </View>
          <View style={styles.levelsContainer}>
            {/* Battery, WiFi, Cellular icons placeholder */}
            <View style={styles.iconPlaceholder} />
          </View>
        </View>
      </View>
      
      {/* Header Section - Figma: "Get Started" at x:22, y:84; subtitle at x:20, y:106 */}
      <View style={styles.headerSection}>
        <Typography variant="h2" style={styles.getStartedText}>
          Get Started
        </Typography>
        <Typography variant="body" style={styles.subtitleText}>
          Register to create an account
        </Typography>
        
        {/* TindaGo Logo - Figma: x:329, y:45, width:100, height:100 */}
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../src/assets/images/bank-details/tindago-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content Card - Figma: x:0, y:150, width:440, height:806, borderRadius:20px */}
      <View style={styles.contentCard}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Register Title - Figma: x:183, y:204, textAlign:center */}
          <Typography variant="h2" style={styles.registerTitle}>
            Register
          </Typography>

          {/* Progress Line - Figma: x:20, y:252, width:400 */}
          <View style={styles.progressSection}>
            <View style={styles.progressLine}>
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.activeSegment]} />
            </View>
          </View>

          {/* Section Label - Figma: "Add Gcash/Paypal" at x:20, y:272 */}
          <Typography variant="h2" style={styles.sectionLabel}>
            Add Gcash/Paypal
          </Typography>

          {/* Form Fields Section - Starting around y:314 */}
          <View style={styles.formSection}>
            {/* Account Name Field - Figma: x:20, y:314 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Account Name
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter account name"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={bankData.accountName}
                  onChangeText={(text) => setBankData({ ...bankData, accountName: text })}
                />
              </View>
              {errors.accountName ? (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.accountName}
                </Typography>
              ) : null}
            </View>

            {/* Account Number Field - Figma: x:22, y:411 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Account Number
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter account number"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={bankData.accountNumber}
                  onChangeText={(text) => setBankData({ ...bankData, accountNumber: text })}
                  keyboardType="numeric"
                />
              </View>
              {errors.accountNumber ? (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.accountNumber}
                </Typography>
              ) : null}
            </View>

            {/* Email Field - Figma: x:22, y:508 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Email
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={bankData.email}
                  onChangeText={(text) => setBankData({ ...bankData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.email}
                </Typography>
              ) : null}
            </View>

            {/* Password Field - Figma: x:20, y:605 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Password
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={bankData.password}
                  onChangeText={(text) => setBankData({ ...bankData, password: text })}
                  secureTextEntry={!showPassword}
                />
              </View>
              {errors.password ? (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.password}
                </Typography>
              ) : null}
            </View>
          </View>

          {/* Continue Button - Figma: x:20, y:839, width:400, height:50 */}
          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Typography variant="h2" style={styles.continueButtonText}>
                Continue
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#652A70', // Figma: fill_ZNMXZ9
  },
  
  // Status Bar Container - Figma: x:0, y:0, width:439.5, height:54
  statusBarContainer: {
    backgroundColor: 'transparent',
    paddingTop: vs(10),
    paddingHorizontal: s(20),
  },
  statusBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: vs(54),
  },
  timeContainer: {
    // Figma: x:51.92, y:18.34, width:36, height:22
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    // Figma: fontSize:17, fontWeight:400, fontFamily:ABeeZee
    fontSize: s(17),
    fontWeight: '400',
    color: Colors.white,
    fontFamily: Fonts.secondary, // ABeeZee
  },
  levelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: s(60),
    height: vs(20),
    // Battery, wifi, cellular icons would go here
  },
  
  // Header Section - Figma: "Get Started" at x:22, y:84
  headerSection: {
    paddingTop: vs(20),
    paddingHorizontal: s(20),
    paddingBottom: vs(15),
    position: 'relative',
  },
  getStartedText: {
    // Figma: x:22, y:84, fontSize:24, fontWeight:600, color:#FFFFFF
    fontSize: s(24),
    fontWeight: '600',
    color: Colors.white,
    marginLeft: s(2),
    marginBottom: vs(6),
  },
  subtitleText: {
    // Figma: x:20, y:106, fontSize:14, fontWeight:400, color:rgba(255, 255, 255, 0.5)
    fontSize: s(14),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: vs(20),
  },
  logoContainer: {
    // Figma: x:329, y:45, width:100, height:100
    position: 'absolute',
    right: s(11), // 440 - 329 - 100 = 11
    top: vs(10),
    width: s(100),
    height: vs(100),
  },
  logo: {
    width: s(100),
    height: vs(100),
  },

  // Content Card - Figma: x:0, y:150, width:440, height:806, borderRadius:20px
  contentCard: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma: fill_77NYGV
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    marginTop: vs(25),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(40),
  },

  // Register Title - Figma: x:183, y:204, fontSize:20, fontWeight:500, textAlign:center
  registerTitle: {
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'center',
    marginTop: vs(40), // Position from top of card
    marginBottom: vs(5),
  },

  // Progress Section - Figma: x:20, y:252, width:400
  progressSection: {
    marginTop: vs(20),
    marginHorizontal: s(20),
    marginBottom: vs(15),
  },
  progressLine: {
    flexDirection: 'row',
    gap: s(16), // Space between segments
  },
  progressSegment: {
    width: s(88), // Figma width for each vector
    height: vs(4), // Stroke weight
  },
  activeSegment: {
    backgroundColor: '#02545F', // Figma: stroke_526VTA (all segments active for bank details)
  },
  inactiveSegment: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)', // Figma: stroke_76JQZT
  },

  // Section Label - Figma: "Add Gcash/Paypal" at x:20, y:272
  sectionLabel: {
    fontSize: s(20),
    fontWeight: '500',
    color: '#1E1E1E', // Figma: fill_QTGWO4
    marginHorizontal: s(20),
    marginTop: vs(8),
    marginBottom: vs(25),
  },

  // Form Section - Fields start around y:314
  formSection: {
    paddingHorizontal: s(20),
    gap: vs(25), // Spacing between form fields
  },
  fieldContainer: {
    // Figma: column layout with 5px gap
    gap: vs(5),
  },
  fieldLabel: {
    // Figma: fontSize:16, fontWeight:500, color:#1E1E1E
    fontSize: s(16),
    fontWeight: '500',
    color: '#1E1E1E', // Figma: fill_QTGWO4
  },
  inputContainer: {
    // Figma: borderRadius:20px, border:#02545F 2px, padding:14px 20px, shadow
    borderRadius: s(20),
    borderWidth: 2,
    borderColor: '#02545F', // Figma: stroke_UG93ZJ
    paddingVertical: vs(14),
    paddingHorizontal: s(20),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 5,
    minHeight: vs(50),
  },
  textInput: {
    // Figma: fontSize:14, fontWeight:500, color:rgba(30, 30, 30, 0.5)
    fontSize: s(14),
    fontWeight: '500',
    color: '#1E1E1E',
    fontFamily: Fonts.primary, // Clash Grotesk Variable
    flex: 1,
  },
  errorText: {
    fontSize: s(12),
    color: Colors.red,
    marginTop: vs(5),
  },

  // Button Section - Figma: x:20, y:839, width:400, height:50
  buttonSection: {
    marginTop: vs(35),
    paddingHorizontal: s(20),
    marginBottom: vs(30),
  },
  continueButton: {
    // Figma: backgroundColor:#3BB77E, borderRadius:20px, padding:10px, shadow
    backgroundColor: Colors.primary, // Figma: fill_X76GBQ
    borderRadius: s(20),
    paddingVertical: vs(10),
    alignItems: 'center',
    justifyContent: 'center',
    height: vs(50),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },
  continueButtonText: {
    // Figma: fontSize:20, fontWeight:500, color:#FFFFFF, textAlign:center
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.white,
  },
});