import { router } from "expo-router";
import { useState, useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import { handleAuthError, createValidationError, showAuthError } from '../../src/utils/authErrorHandler';
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
    userType: "customer" as "customer" | "store_owner",
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    emailOrPhone: "",
    password: "",
    terms: "",
  });

  const [loading, setLoading] = useState(false);

  // Memoized handlers to prevent keyboard issues
  const handleNameChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, name: text }));
  }, []);

  const handleEmailOrPhoneChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, emailOrPhone: text }));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, password: text }));
  }, []);

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
    
    const isValid = Object.values(newErrors).every(error => error === "");
    return { isValid, errors: newErrors };
  };

  const handleSignUp = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors)
        .filter(error => error)
        .join("\n");
      const validationError = createValidationError(errorMessages);
      showAuthError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Detect if input is email or phone number
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;

      const isEmail = emailRegex.test(formData.emailOrPhone.trim());
      const isPhone = phoneRegex.test(formData.emailOrPhone.trim());

      if (!isEmail && !isPhone) {
        const validationError = createValidationError(
          'Please enter a valid email address or phone number'
        );
        showAuthError(validationError);
        setLoading(false);
        return;
      }

      // DIFFERENT LOGIC BASED ON USER TYPE:

      if (formData.userType === "customer") {
        // CUSTOMER REGISTRATION - Simple flow with email/phone only

        if (isPhone) {
          // Phone registration for customers
          Alert.alert(
            "Phone Registration",
            "You'll verify your phone number with SMS, then complete registration.",
            [
              {
                text: "Continue",
                onPress: () => {
                  router.push({
                    pathname: "/(auth)/verify-phone",
                    params: {
                      phoneNumber: formData.emailOrPhone.trim(),
                      name: formData.name,
                      userType: 'customer'
                    }
                  });
                }
              },
              {
                text: "Use Email Instead",
                onPress: () => {
                  setFormData({ ...formData, emailOrPhone: "" });
                }
              }
            ]
          );
          setLoading(false);
          return;
        }

        // Email registration for customers - proceed directly
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.emailOrPhone.trim(),
          formData.password
        );

        const user = userCredential.user;

        await updateProfile(user, {
          displayName: formData.name.trim()
        });

        // Save customer data to database
        const userData = {
          uid: user.uid,
          name: formData.name.trim(),
          email: formData.emailOrPhone.trim(),
          userType: 'customer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          emailVerified: false, // Always false for new accounts
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

        const userRef = ref(database, `users/${user.uid}`);
        await set(userRef, userData);

        // Send email verification
        await sendEmailVerification(user);
        Alert.alert(
          "Account Created!",
          "Your customer account has been created! Please check your email for verification.",
          [
            {
              text: "OK",
              onPress: () => {
                router.push({
                  pathname: "/(auth)/verify-email",
                  params: { email: formData.emailOrPhone.trim() }
                });
              }
            }
          ]
        );

      } else {
        // STORE OWNER REGISTRATION - Different flow, redirect to store owner signup with documents

        // For store owners, require email for business communications
        if (!isEmail) {
          Alert.alert(
            "Store Owner Registration",
            "Store owners must provide a valid email address for business communications. Phone registration is not available for store owners.",
            [
              {
                text: "OK",
                onPress: () => {
                  setFormData({ ...formData, emailOrPhone: "" });
                }
              }
            ]
          );
          setLoading(false);
          return;
        }

        // Create Firebase account for Store Owner first, then redirect to business registration
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.emailOrPhone.trim(),
          formData.password
        );

        const user = userCredential.user;

        await updateProfile(user, {
          displayName: formData.name.trim()
        });

        // Save basic store owner data to database
        const userData = {
          uid: user.uid,
          name: formData.name.trim(),
          email: formData.emailOrPhone.trim(),
          userType: 'store_owner',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          emailVerified: false, // Will be set to true after email verification
          profile: {
            avatar: null,
            phone: null,
            businessComplete: false, // Will be set to true after completing StoreRegistration
          },
          preferences: {
            notifications: true,
            theme: 'light'
          }
        };

        const userRef = ref(database, `users/${user.uid}`);
        await set(userRef, userData);

        // Send email verification
        await sendEmailVerification(user);

        Alert.alert(
          "Account Created!",
          "Your store owner account has been created! Please verify your email before completing your business registration.",
          [
            {
              text: "Verify Email Now",
              onPress: () => {
                // Navigate to email verification screen first
                router.push({
                  pathname: "/(auth)/verify-email-store-owner",
                  params: {
                    email: formData.emailOrPhone.trim(),
                    name: formData.name.trim(),
                    uid: user.uid,
                    password: formData.password
                  }
                });
              }
            }
          ]
        );
      }

    } catch (error: unknown) {
      handleAuthError(error, 'Registration');
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
              onChangeText={handleNameChange}
              style={styles.nameInput}
            />

            <FormInput
              placeholder={formData.userType === "store_owner" ? "Business Email" : "Email or Phone"}
              value={formData.emailOrPhone}
              onChangeText={handleEmailOrPhoneChange}
              keyboardType="email-address"
              style={styles.emailInput}
            />

            <FormInput
              placeholder="Password"
              value={formData.password}
              onChangeText={handlePasswordChange}
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
    paddingBottom: 0, // Remove bottom padding completely
  },

  // Header Section (Figma: x:140, y:322)
  headerSection: {
    alignItems: "center",
    marginTop: vs(140), // Reduced from 180 to 140
    marginBottom: vs(35), // Reduced from 50 to 35
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
    gap: vs(12), // Reduced from 15 to 12
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
    marginTop: vs(12), // Reduced from 15 to 12
  },

  // Terms Section (Figma: x:67, y:676)
  termsSection: {
    alignItems: "center",
    marginTop: vs(12), // Reduced from 15 to 12
    paddingHorizontal: s(7),
  },

  // Button Section (Figma: x:60, y:740, width:380)
  buttonSection: {
    marginTop: vs(12), // Reduced from 15 to 12
    marginBottom: vs(3), // Reduced from 5 to 3
    paddingHorizontal: s(30), // (400 - 380) / 2 = 10px + 20px glass card padding
  },

  // Footer Section (Figma: y:820)
  footerSection: {
    alignItems: "center",
    marginTop: vs(5), // Reduced from 10 to 5
    marginBottom: 0, // Remove bottom margin
    paddingBottom: 0, // Remove bottom padding
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