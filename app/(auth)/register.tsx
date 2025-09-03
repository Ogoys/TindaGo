import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { CheckboxWithText } from "../../src/components/ui/CheckboxWithText";
import { FormInput } from "../../src/components/ui/FormInput";
import { GlassMorphismCard } from "../../src/components/ui/GlassMorphismCard";
import { Typography } from "../../src/components/ui/Typography";
import { UserTypePicker } from "../../src/components/ui/UserTypePicker";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { responsive, s, vs } from "../../src/constants/responsive";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    password: "",
    userType: "user" as "user" | "store_owner",
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    emailOrPhone: "",
    password: "",
    terms: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      emailOrPhone: "",
      password: "",
      terms: "",
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email or phone validation
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email or phone is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10,}$/;
      const isEmail = emailRegex.test(formData.emailOrPhone);
      const isPhone = phoneRegex.test(formData.emailOrPhone.replace(/\D/g, ''));
      
      if (!isEmail && !isPhone) {
        newErrors.emailOrPhone = "Please enter a valid email or phone number";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Terms validation
    if (!formData.acceptedTerms) {
      newErrors.terms = "Please accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleSignUp = () => {
    if (validateForm()) {
      // Check if user selected store owner type
      if (formData.userType === "store_owner") {
        // Navigate to store owner specific signup form
        router.push({
          pathname: "/(auth)/store-owner-signup",
          params: { 
            name: formData.name,
            emailOrPhone: formData.emailOrPhone,
            password: formData.password
          }
        });
        return;
      }
      
      // TODO: Implement actual sign up logic with API for regular users
      
      // Check if input is phone number or email
      const phoneRegex = /^[0-9]{10,}$/;
      const isPhone = phoneRegex.test(formData.emailOrPhone.replace(/\D/g, ''));
      
      if (isPhone) {
        // Navigate to verify phone screen with phone parameter
        router.push({
          pathname: "/(auth)/verify-phone",
          params: { phoneNumber: formData.emailOrPhone }
        });
      } else {
        // Navigate to verify email screen with email parameter
        router.push({
          pathname: "/(auth)/verify-email",
          params: { email: formData.emailOrPhone }
        });
      }
    } else {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
    }
  };

  const handleSignInPress = () => {
    router.push("/(auth)/signin");
  };

  return (
    <View style={styles.container}>
      <GlassMorphismCard>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Typography variant="h1" color="black" style={styles.title}>
              Sign up
            </Typography>
            <Typography variant="body" color="textSecondary" style={styles.subtitle}>
              Create your account to access.
            </Typography>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <FormInput
              placeholder="Your Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={styles.nameInput}
            />

            <FormInput
              placeholder="Email or Phone"
              value={formData.emailOrPhone}
              onChangeText={(text) => setFormData({ ...formData, emailOrPhone: text })}
              keyboardType="email-address"
              style={styles.emailInput}
            />

            <FormInput
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              style={styles.passwordInput}
            />
          </View>

          {/* User Type Picker */}
          <View style={styles.pickerSection}>
            <UserTypePicker
              selectedType={formData.userType}
              onSelect={(type) => setFormData({ ...formData, userType: type })}
            />
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsSection}>
            <CheckboxWithText
              checked={formData.acceptedTerms}
              onPress={() => setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })}
              text="I accept and agree to comply with TindaGo Terms and Conditions and Privacy policy"
            />
          </View>

          {/* Sign Up Button */}
          <View style={styles.buttonSection}>
            <Button
              title="Sign up"
              variant="primary"
              onPress={handleSignUp}
            />
          </View>

          {/* Footer Link */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.signInText} onPress={handleSignInPress}>
                Sign in
              </Text>
            </Text>
          </View>
        </ScrollView>
      </GlassMorphismCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: vs(10),
    paddingBottom: vs(40),
  },
  
  // Header Section (Figma: x:140, y:322)
  headerSection: {
    alignItems: "center",
    marginTop: vs(180), // Reduce top margin to fit content
    marginBottom: vs(50), // Reduce bottom margin
  },
  title: {
    // Figma: fontSize:28, centered
    color: Colors.white,
    marginBottom: vs(10),
  },
  subtitle: {
    // Figma: fontSize:16, centered  
    color: "rgba(255, 255, 255, 0.5)",
  },

  // Form Section
  formSection: {
    alignItems: "center",
    gap: vs(15), // Reduce gap between inputs
  },
  nameInput: {
    // Figma: x:60, y:396 (relative to card)
    marginTop: 0,
  },
  emailInput: {
    // Figma: x:60, y:466
  },
  passwordInput: {
    // Figma: x:60, y:536
  },

  // Picker Section (Figma: x:60, y:606)
  pickerSection: {
    alignItems: "center",
    marginTop: vs(15),
  },

  // Terms Section (Figma: x:67, y:676)
  termsSection: {
    alignItems: "center",
    marginTop: vs(15),
    paddingHorizontal: s(7),
  },

  // Button Section (Figma: x:60, y:740, width:380)
  buttonSection: {
    marginTop: vs(15),
    paddingHorizontal: s(30), // (400 - 380) / 2 = 10px + 20px glass card padding
  },

  // Footer Section (Figma: y:820)
  footerSection: {
    alignItems: "center",
    marginTop: vs(20),
    marginBottom: vs(30), // Add bottom margin for safe area
  },
  footerText: {
    fontFamily: Fonts.primary,
    fontSize: responsive.fontSize.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.white,
    textAlign: "center",
  },
  signInText: {
    color: "#E92B45", // Red color from Figma
  },
});