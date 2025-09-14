import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import { Button } from "../../src/components/ui/Button";
import { CheckboxWithText } from "../../src/components/ui/CheckboxWithText";
import { FormInput } from "../../src/components/ui/FormInput";
import { GlassMorphismCard } from "../../src/components/ui/GlassMorphismCard";
import { Typography } from "../../src/components/ui/Typography";
import { UserTypePicker } from "../../src/components/ui/UserTypePicker";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { responsive, s, vs } from "../../src/constants/responsive";

export default function CompletePhoneRegistrationScreen() {
  const { phoneNumber, name, userType } = useLocalSearchParams<{ 
    phoneNumber: string;
    name?: string;
    userType?: string;
  }>();

  const [formData, setFormData] = useState({
    name: name || "",
    email: "",
    password: "",
    userType: (userType as "user" | "store_owner") || "user",
    acceptedTerms: false,
  });

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    if (!formData.acceptedTerms) {
      Alert.alert("Error", "Please accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleCompleteRegistration = async () => {
    if (!validateForm()) return;
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number provided");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase account with email (required for Firebase Auth)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: formData.name.trim()
      });

      // Create user document in Realtime Database with phone number
      const userData = {
        uid: user.uid,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: phoneNumber, // Store the verified phone number
        userType: formData.userType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: user.emailVerified,
        phoneVerified: true, // Mark phone as verified
        profile: {
          avatar: null,
          phone: phoneNumber,
          address: null,
        },
        preferences: {
          notifications: true,
          theme: 'light'
        }
      };

      // Save user data to Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, userData);

      Alert.alert(
        "Account Created!",
        `Your TindaGo account has been created successfully!\n\n📱 Phone: ${phoneNumber}\n📧 Sign in with: ${formData.email.trim()}\n\nRemember: Use your email address to sign in next time.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate based on user type
              if (formData.userType === 'store_owner') {
                router.replace("/(main)/(store-owner)/home");
              } else {
                router.replace("/(main)/(customer)/home");
              }
            }
          }
        ]
      );

    } catch (error: any) {
      let errorMessage = "Account creation failed. Please try again.";

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "An account with this email already exists.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection.";
          break;
      }

      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
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
              Complete Registration
            </Typography>
            <Typography variant="body" color="textSecondary" style={styles.subtitle}>
              Phone verified! Complete your account setup. You'll use the email below to sign in.
            </Typography>
            <Typography variant="body" style={styles.phoneDisplay}>
              📱 {phoneNumber}
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
              placeholder="Email Address (for sign-in)"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              style={styles.emailInput}
            />

            <FormInput
              placeholder="Create Password"
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

          {/* Complete Registration Button */}
          <View style={styles.buttonSection}>
            <Button
              title={loading ? "Creating Account..." : "Complete Registration"}
              variant="primary"
              onPress={handleCompleteRegistration}
              disabled={loading}
            />
          </View>

          {/* Footer Link */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.signInText} onPress={() => router.push("/(auth)/signin")}>
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
    paddingTop: vs(20),
    paddingBottom: vs(40),
  },

  // Header Section
  headerSection: {
    alignItems: "center",
    marginTop: vs(40), // Reduced from 120 to avoid logo overlap
    marginBottom: vs(25),
  },
  title: {
    color: Colors.white,
    marginBottom: vs(10),
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: vs(10),
  },
  phoneDisplay: {
    fontFamily: Fonts.primary,
    fontSize: responsive.fontSize.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primary, // Use TindaGo primary color
    backgroundColor: "rgba(59, 183, 126, 0.1)", // Light green background
    paddingHorizontal: s(15),
    paddingVertical: vs(8),
    borderRadius: s(15),
    textAlign: "center",
    marginTop: vs(5),
  },

  // Form Section
  formSection: {
    alignItems: "center",
    gap: vs(12), // Slightly reduced gap
    marginBottom: vs(15),
  },
  nameInput: {
    marginTop: 0,
  },
  emailInput: {
    marginTop: 0,
  },
  passwordInput: {
    marginTop: 0,
  },

  // Picker Section
  pickerSection: {
    alignItems: "center",
    marginTop: vs(10),
    marginBottom: vs(12),
  },

  // Terms Section
  termsSection: {
    alignItems: "center",
    marginTop: vs(10),
    paddingHorizontal: s(7),
    marginBottom: vs(12),
  },

  // Button Section
  buttonSection: {
    marginTop: vs(12),
    paddingHorizontal: s(30),
    marginBottom: vs(15),
  },

  // Footer Section
  footerSection: {
    alignItems: "center",
    marginTop: vs(8),
    marginBottom: vs(20), // Reduced from 30
  },
  footerText: {
    fontFamily: Fonts.primary,
    fontSize: responsive.fontSize.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.white,
    textAlign: "center",
  },
  signInText: {
    color: "#E92B45",
  },
});