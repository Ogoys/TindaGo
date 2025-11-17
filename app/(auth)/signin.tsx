import { router } from "expo-router";
import { useState, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import { handleAuthError, parseAuthError, showAuthError, createAuthError, AuthErrorType } from '../../src/utils/authErrorHandler';
import { Button } from "../../src/components/ui/Button";
import { FormInput } from "../../src/components/ui/FormInput";
import { SignInGlassCard } from "../../src/components/ui/SignInGlassCard";
import { Colors } from "../../src/constants/Colors";
import { s, vs, ms } from "../../src/constants/responsive";
import { useUser, User, UserRole } from "../../src/contexts/UserContext";
import { StoreRegistrationService } from "../../src/services/store/StoreRegistrationService";
import { STORE_STATUS } from "../../src/constants/StoreStatus";

export default function SignInScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useUser();

  // Memoized handlers to prevent keyboard issues
  const handleEmailOrPhoneChange = useCallback((text: string) => {
    setEmailOrPhone(text);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const handleLogin = async () => {
    if (!emailOrPhone.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email/phone and password");
      return;
    }

    setLoading(true);
    
    try {
      const input = emailOrPhone.trim();
      
      // Detect if input is email or phone number
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      
      const isEmail = emailRegex.test(input);
      const isPhone = phoneRegex.test(input);
      
      if (!isEmail && !isPhone) {
        const validationError = createAuthError(
          AuthErrorType.VALIDATION,
          'Invalid Input',
          'Please enter a valid email address or phone number'
        );
        showAuthError(validationError);
        setLoading(false);
        return;
      }

      let userCredential;
      let userData = null;
      
      if (isEmail) {
        // Direct email sign-in
        userCredential = await signInWithEmailAndPassword(auth, input, password);
      } else {
        // Phone number sign-in - find user by phone number in database
        console.log("Looking up user by phone number:", input);
        
        // Clean phone number for consistent searching
        const cleanedPhone = input.replace(/\D/g, '');
        
        // Query database for user with this phone number
        const usersRef = ref(database, 'users');
        const phoneQuery = query(usersRef, orderByChild('phoneNumber'), equalTo(input));
        const phoneSnapshot = await get(phoneQuery);
        
        // Also try with different phone formats
        let foundUser = null;
        if (phoneSnapshot.exists()) {
          const users = phoneSnapshot.val();
          const userId = Object.keys(users)[0];
          foundUser = { uid: userId, ...users[userId] };
        } else {
          // Try with +63 format if user entered 09 format
          const altPhone = input.startsWith('09') ? '+63' + input.substring(1) : input;
          if (altPhone !== input) {
            const altQuery = query(usersRef, orderByChild('phoneNumber'), equalTo(altPhone));
            const altSnapshot = await get(altQuery);
            if (altSnapshot.exists()) {
              const users = altSnapshot.val();
              const userId = Object.keys(users)[0];
              foundUser = { uid: userId, ...users[userId] };
            }
          }
        }
        
        if (!foundUser) {
          Alert.alert(
            "Phone Number Not Found", 
            "No account found with this phone number. Please check the number or register first.",
            [{ text: "OK" }]
          );
          setLoading(false);
          return;
        }
        
        // Sign in using the email associated with this phone number
        userData = foundUser;
        userCredential = await signInWithEmailAndPassword(auth, foundUser.email, password);
      }

      const user = userCredential.user;

      // Reload user from Firebase to get latest email verification status
      try {
        await user.reload();
        console.log('✅ User reloaded from Firebase. Email verified:', user.emailVerified);
      } catch (reloadError) {
        console.error('Error reloading user:', reloadError);
      }

      // Get user data from Realtime Database first
      try {
        if (!userData) {
          const userRef = ref(database, `users/${user.uid}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            userData = userSnapshot.val();
          }
        }
      } catch (dbError) {
        console.error("Error fetching user data:", dbError);
      }

      // Check email verification - Firebase Auth is the source of truth
      // Database value is secondary (might not be updated yet)
      const isEmailVerified = user.emailVerified || userData?.emailVerified;
      
      if (!isEmailVerified) {
        // Determine which verification screen to show based on user type
        const isStoreOwner = userData?.userType === 'store_owner';
        
        Alert.alert(
          "Email Not Verified", 
          "Please verify your email address before signing in. We'll redirect you to the verification screen.",
          [
            {
              text: "Verify Now",
              onPress: () => {
                router.push({
                  pathname: isStoreOwner ? "/(auth)/verify-email-store-owner" : "/(auth)/verify-email-code",
                  params: { 
                    email: input,
                    name: userData?.name,
                    uid: user.uid
                  }
                });
              }
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
        return;
      }

      // userData was already fetched during email verification check
      
      if (userData) {
        // Create user object for context
        const loggedInUser: User = {
          id: user.uid,
          name: userData.name || user.displayName || undefined,
          email: userData.email || user.email || '',
          role: userData.userType === 'store_owner' ? 'store-owner' : 'customer',
          phoneNumber: userData.phoneNumber,
          isEmailVerified: user.emailVerified,
          isPhoneVerified: userData.phoneVerified || false,
          profileComplete: true,
        };

        // Set user in context (this will automatically handle navigation)
        await setUser(loggedInUser);

        // Show welcome message with phone or email
        const welcomeIdentifier = userData.phoneNumber || userData.email || user.email;
        Alert.alert("Success", `Welcome back, ${userData.name}! (${welcomeIdentifier})`, [
          {
            text: "OK",
            onPress: async () => {
              if (userData.userType === 'store_owner') {
                // Check store_registrations collection for registration status
                try {
                  const registrationData = await StoreRegistrationService.getRegistrationData(user.uid);

                  if (registrationData && registrationData.status) {
                    // Store owner has started/completed registration
                    console.log("Store registration found with status:", registrationData.status);

                    // Check store status and navigate accordingly
                    if (registrationData.status === STORE_STATUS.SUSPENDED) {
                      // Store is suspended - block access
                      console.log("⚠️ Store is suspended - showing suspension notice");
                      Alert.alert(
                        "Store Suspended",
                        "Your store has been suspended. Please contact TindaGo support for more information.",
                        [{ text: "OK", onPress: () => router.replace("/(auth)/signin") }]
                      );
                      await auth.signOut(); // Sign out the user
                      return;
                    } else if (registrationData.status === STORE_STATUS.APPROVED ||
                               registrationData.status === STORE_STATUS.ACTIVE) {
                      // Store is approved/active - navigate to dashboard
                      console.log("✅ Store is approved/active - navigating to dashboard");
                      router.replace("/(main)/(store-owner)/home");
                    } else {
                      // Pending, rejected, etc. - show RegistrationComplete status screen
                      console.log("📋 Store status:", registrationData.status, "- showing RegistrationComplete");
                      router.replace("/(auth)/(store-owner)/RegistrationComplete");
                    }
                  } else {
                    // No registration found - start registration flow
                    console.log("No store registration found - starting registration");
                    router.replace("/(auth)/(store-owner)/StoreRegistration");
                  }
                } catch (error) {
                  console.error("Error checking store registration:", error);
                  
                  // Try checking stores collection as fallback
                  try {
                    const storeRef = ref(database, `stores/${user.uid}`);
                    const storeSnapshot = await get(storeRef);
                    
                    if (storeSnapshot.exists()) {
                      const storeData = storeSnapshot.val();
                      if (storeData.status === STORE_STATUS.SUSPENDED) {
                        console.log("⚠️ Store is suspended (from stores collection)");
                        Alert.alert(
                          "Store Suspended",
                          "Your store has been suspended. Please contact TindaGo support for more information.",
                          [{ text: "OK", onPress: () => router.replace("/(auth)/signin") }]
                        );
                        await auth.signOut();
                        return;
                      }
                    }
                  } catch (storeError) {
                    console.error("Error checking stores collection:", storeError);
                  }
                  
                  // On error, redirect to StoreRegistration as fallback
                  router.replace("/(auth)/(store-owner)/StoreRegistration");
                }
              } else {
                // Customer login - go straight to home (skip onboarding)
                console.log('✅ Customer login - navigating to home');
                router.replace("/(main)/(customer)/home");
              }
            }
          }
        ]);
      } else {
        // User document doesn't exist, redirect to role selection
        const basicUser: User = {
          id: user.uid,
          email: user.email || '',
          role: 'customer', // Default role
          isEmailVerified: user.emailVerified,
          isPhoneVerified: false,
          profileComplete: false,
        };

        await setUser(basicUser);
        Alert.alert("Success", "Signed in successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/role-selection")
          }
        ]);
      }
      
    } catch (error: unknown) {
      // Parse the error first
      const errorInfo = parseAuthError(error);
      
      // Add "Reset Password" action for password-related errors
      if (errorInfo.code === 'auth/wrong-password' || 
          errorInfo.code === 'auth/invalid-login-credentials' ||
          errorInfo.code === 'auth/too-many-requests') {
        showAuthError(errorInfo, [
          {
            text: 'Reset Password',
            onPress: handleForgotPassword,
          },
          {
            text: 'Try Again',
            style: 'cancel',
          },
        ]);
      } else {
        // Use standard error handling for other errors
        handleAuthError(error, 'Sign In');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/(auth)/register");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password pressed");
  };

  return (
    <View style={styles.container}>
      <SignInGlassCard>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>
            Login
          </Text>
          <Text style={styles.subtitle}>
            Sign in to your account
          </Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <FormInput
            placeholder="Email or Phone"
            value={emailOrPhone}
            onChangeText={handleEmailOrPhoneChange}
            keyboardType="email-address"
            style={styles.emailInput}
          />

          <FormInput
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            style={styles.passwordInput}
          />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity 
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Forget Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <View style={styles.buttonSection}>
          <Button
            title={loading ? "Signing In..." : "Login"}
            variant="primary"
            onPress={handleLogin}
            disabled={loading}
          />
        </View>

        {/* Footer Link */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Don&apos;t have an account yet?{" "}
            <Text style={styles.signInText} onPress={handleRegister}>
              Register
            </Text>
          </Text>
        </View>
      </SignInGlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white, // Match Figma background
  },
  // Header Section - Figma: x:169, y:322 (Login group center)
  headerSection: {
    alignItems: "center",
    marginTop: vs(160), // Reduced from 180 to 160
    marginBottom: vs(25), // Reduced from 30 to 25
  },
  title: {
    // Figma: fontSize:28, fontWeight:500, Clash Grotesk Variable
    fontFamily: "Clash Grotesk Variable",
    fontSize: ms(28),
    fontWeight: "500",
    color: Colors.white,
  },
  subtitle: {
    // Figma: fontSize:16, fontWeight:500, Clash Grotesk Variable
    fontFamily: "Clash Grotesk Variable",
    fontSize: ms(16),
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.5)",
    lineHeight: ms(16) * 1.375, // Figma line height
  },
  // Form Section - Figma: inputs at x:60, y:396 and y:466
  formSection: {
    alignItems: "center",
    gap: vs(15), // Reduced from 20 to 15
    marginBottom: vs(3), // Reduced from 5 to 3
  },
  emailInput: {
    marginTop: 0,
  },
  passwordInput: {
    marginTop: 0,
  },
  // Forgot Password Section - Figma: x:301, y:526
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: vs(8), // Reduced from 10 to 8
    marginBottom: vs(20), // Reduced from 25 to 20
    paddingHorizontal: s(40), // Match form input padding
  },
  forgotPasswordText: {
    // Figma: fontSize:16, fontWeight:400, Clash Grotesk Variable
    fontFamily: "Clash Grotesk Variable",
    fontSize: ms(16),
    fontWeight: "400",
    color: "#E92B45",
    lineHeight: ms(16) * 1.375, // Figma line height
  },

  // Button Section - Figma: x:60, y:578, width:380
  buttonSection: {
    marginTop: vs(15), // Reduced from 20 to 15
    marginBottom: vs(8), // Reduced from 10 to 8
    paddingHorizontal: s(30), // (400 - 380) / 2 = 10px + 20px glass card padding
  },

  // Footer Section - Figma: y:658 (register link)
  footerSection: {
    alignItems: "center",
    marginTop: vs(3), // Reduced from 5 to 3
    marginBottom: 0, // Remove bottom margin
    paddingBottom: 0, // Remove bottom padding
  },
  footerText: {
    // Figma: fontSize:14, fontWeight:500, Clash Grotesk Variable
    fontFamily: "Clash Grotesk Variable",
    fontSize: ms(14),
    fontWeight: "500",
    color: Colors.white,
    textAlign: "center",
    lineHeight: ms(14) * 1.57, // Figma line height
  },
  signInText: {
    color: "#E92B45", // Figma red color
    fontWeight: "500",
  },
});