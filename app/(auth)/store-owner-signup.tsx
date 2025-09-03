import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { Typography } from "../../src/components/ui/Typography";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { s, vs } from "../../src/constants/responsive";

export default function StoreOwnerSignupScreen() {
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState(() => {
    const emailOrPhone = (params.emailOrPhone as string) || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(emailOrPhone);
    
    return {
      name: (params.name as string) || "",
      mobile: isEmail ? "" : emailOrPhone,
      email: isEmail ? emailOrPhone : "",
      password: (params.password as string) || "",
      confirmPassword: "",
    };
  });

  const [errors, setErrors] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      mobile: "",
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

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else {
      const phoneRegex = /^[0-9]{10,}$/;
      const isValidPhone = phoneRegex.test(formData.mobile.replace(/\D/g, ''));
      if (!isValidPhone) {
        newErrors.mobile = "Please enter a valid mobile number";
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

  const handleContinue = () => {
    if (validateForm()) {
      // Navigate to upload documents screen next
      router.push({
        pathname: "/(auth)/upload-documents",
        params: {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
        }
      });
    } else {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#652A70" />
      
      {/* Custom Status Bar */}
      <View style={styles.statusBarContainer}>
        <View style={styles.statusBarContent}>
          <View style={styles.timeContainer}>
            <Typography variant="body" style={styles.timeText}>9:41</Typography>
          </View>
          <View style={styles.levelsContainer}>
            {/* Icons placeholder - battery, wifi, cellular */}
            <View style={styles.iconPlaceholder} />
          </View>
        </View>
      </View>
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Typography variant="h2" style={styles.getStartedText}>
          Get Started
        </Typography>
        <Typography variant="body" style={styles.subtitleText}>
          Register to create an account
        </Typography>
        
        {/* Store Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../src/assets/images/store-owner-signup/store-logo.png")}
            style={styles.storeLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Progress Line */}
          <View style={styles.progressSection}>
            <View style={styles.progressLine}>
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.inactiveSegment]} />
              <View style={[styles.progressSegment, styles.inactiveSegment]} />
              <View style={[styles.progressSegment, styles.inactiveSegment]} />
            </View>
          </View>

          {/* Register Title */}
          <Typography variant="h2" style={styles.registerTitle}>
            Register
          </Typography>

          {/* Section Label */}
          <Typography variant="h2" style={styles.sectionLabel}>
            Add Personal Detail
          </Typography>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Name
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>
            </View>

            {/* Mobile Number Field */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Mobile Number
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your mobile number"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={formData.mobile}
                  onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Email
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Password
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Confirmed Password
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your confirmed password"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Continue Button */}
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
    backgroundColor: '#652A70', // Figma: fill_8MWQR7
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
    // Figma: fontSize:17, fontWeight:400, color:#000000 (but we need white for dark bg)
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
    // This would contain battery, wifi, cellular icons
  },
  
  // Header Section - Figma coordinates: x:22, y:84, x:20, y:106, x:329, y:45
  headerSection: {
    paddingTop: vs(20), // Reduced since we already have status bar spacing
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
    top: vs(10), // Adjusted for the reduced header padding
    width: s(100),
    height: vs(100),
  },
  storeLogo: {
    width: s(100),
    height: vs(100),
  },

  // Content Card - Figma: x:0, y:150, width:440, height:806, borderRadius:20px
  contentCard: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma: fill_E0F42Q
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    marginTop: vs(25), // Adjust to fit with header
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(40),
  },

  // Progress Section - Figma: x:20, y:252, width:400, height:0
  progressSection: {
    marginTop: vs(32), // 252 - 150 - some adjustment = 102, reduced to 32
    marginHorizontal: s(20),
    marginBottom: vs(20),
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
    backgroundColor: '#02545F', // Figma: stroke_3OFNB2
  },
  inactiveSegment: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)', // Figma: stroke_6UDY3H
  },

  // Register Title - Figma: x:183, y:204, fontSize:20, fontWeight:500, textAlign:center
  registerTitle: {
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: vs(20),
  },

  // Section Label - Figma: x:20, y:272, fontSize:20, fontWeight:500
  sectionLabel: {
    fontSize: s(20),
    fontWeight: '500',
    color: '#1E1E1E', // Figma: fill_1X7ZJI
    marginHorizontal: s(20),
    marginBottom: vs(20),
  },

  // Form Section
  formSection: {
    paddingHorizontal: s(20),
    gap: vs(20), // Space between form fields
  },
  fieldContainer: {
    // Figma: column layout with 5px gap
    gap: vs(5),
  },
  fieldLabel: {
    // Figma: fontSize:16, fontWeight:500, color:#1E1E1E
    fontSize: s(16),
    fontWeight: '500',
    color: '#1E1E1E',
  },
  inputContainer: {
    // Figma: borderRadius:20px, border:#02545F 2px, padding:14px 20px, shadow
    borderRadius: s(20),
    borderWidth: 2,
    borderColor: '#02545F',
    paddingVertical: vs(14),
    paddingHorizontal: s(20),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 5,
  },
  placeholder: {
    // Figma: fontSize:14, fontWeight:500, color:rgba(30, 30, 30, 0.5)
    fontSize: s(14),
    fontWeight: '500',
    color: 'rgba(30, 30, 30, 0.5)',
  },
  textInput: {
    // Figma: fontSize:14, fontWeight:500, color:#1E1E1E
    fontSize: s(14),
    fontWeight: '500',
    color: '#1E1E1E',
    fontFamily: Fonts.primary,
    flex: 1,
  },

  // Button Section - Figma: x:20, y:839, width:400, height:50
  buttonSection: {
    marginTop: vs(40),
    paddingHorizontal: s(20),
    marginBottom: vs(20),
  },
  continueButton: {
    // Figma: backgroundColor:#3BB77E, borderRadius:20px, padding:10px, shadow
    backgroundColor: Colors.primary,
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