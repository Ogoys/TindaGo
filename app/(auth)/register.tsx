import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
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

  const [loading, setLoading] = useState(false);

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

  const handleSignUp = async () => {
    if (!validateForm()) {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
      return;
    }

    // Check if user selected store owner type - handle this flow later
    if (formData.userType === "store_owner") {
      // For now, show a message that store owner registration will be implemented
      Alert.alert(
        "Store Owner Registration", 
        "Store owner registration will be completed in the next flow. For now, creating as regular user.",
        [{ text: "OK", onPress: () => {} }]
      );
    }

    setLoading(true);

    try {
      // Detect if input is email or phone number
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      
      const isEmail = emailRegex.test(formData.emailOrPhone.trim());
      const isPhone = phoneRegex.test(formData.emailOrPhone.trim());
      
      if (!isEmail && !isPhone) {
        Alert.alert("Error", "Please enter a valid email address or phone number");
        setLoading(false);
        return;
      }

      // If phone number, redirect to phone verification without creating Firebase account yet
      if (isPhone) {
        Alert.alert(
          "Phone Registration", 
          "Phone number detected! You'll verify your phone number with SMS, then complete registration. After that, you can sign in with either your phone number OR email.",
          [
            {
              text: "Continue",
              onPress: () => {
                router.push({
                  pathname: "/(auth)/verify-phone",
                  params: { 
                    phoneNumber: formData.emailOrPhone.trim(),
                    // Pass other form data for later use
                    name: formData.name,
                    userType: formData.userType 
                  }
                });
              }
            },
            {
              text: "Use Email Instead",
              onPress: () => {
                // Clear the phone number and let user enter email
                setFormData({ ...formData, emailOrPhone: "" });
              }
            }
          ]
        );
        setLoading(false);
        return;
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.emailOrPhone.trim(), 
        formData.password
      );
      
      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: formData.name.trim()
      });

      // Create user document in Realtime Database
      const userData = {
        uid: user.uid,
        name: formData.name.trim(),
        email: formData.emailOrPhone.trim(),
        userType: formData.userType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: user.emailVerified,
        // Additional fields for TindaGo
        profile: {
          avatar: null,
          phone: null,
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

      // Send email verification
      await user.reload();
      if (!user.emailVerified) {
        try {
          await sendEmailVerification(user);
          Alert.alert(
            "Account Created!", 
            "Your TindaGo account has been created successfully. A verification email has been sent to your email address. Please verify your email to continue.",
            [
              {
                text: "OK", 
                onPress: () => {
                  // Navigate to email verification screen
                  router.push({
                    pathname: "/(auth)/verify-email",
                    params: { email: formData.emailOrPhone.trim() }
                  });
                }
              }
            ]
          );
        } catch (emailError: any) {
          console.log("Email verification error:", emailError);
          Alert.alert(
            "Account Created!", 
            "Your account has been created but we couldn't send a verification email. You can still sign in.",
            [
              {
                text: "OK", 
                onPress: () => {
                  router.push("/(auth)/signin");
                }
              }
            ]
          );
        }
      } else {
        // Email already verified, proceed to app
        if (formData.userType === 'store_owner') {
          router.replace("/(main)/store-home");
        } else {
          router.replace("/(main)/home");
        }
      }

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
              title={loading ? "Creating Account..." : "Sign up"}
              variant="primary"
              onPress={handleSignUp}
              disabled={loading}
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