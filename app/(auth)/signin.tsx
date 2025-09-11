import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import { Button } from "../../src/components/ui/Button";
import { FormInput } from "../../src/components/ui/FormInput";
import { SignInGlassCard } from "../../src/components/ui/SignInGlassCard";
import { Colors } from "../../src/constants/Colors";
import { s, vs } from "../../src/constants/responsive";

export default function SignInScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        Alert.alert("Error", "Please enter a valid email address or phone number");
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

      // Check if email is verified
      if (!user.emailVerified) {
        Alert.alert(
          "Email Not Verified", 
          "Please verify your email address before signing in. We'll redirect you to the verification screen.",
          [
            {
              text: "OK",
              onPress: () => {
                router.push({
                  pathname: "/(auth)/verify-email",
                  params: { email: input }
                });
              }
            }
          ]
        );
        return;
      }

      // Get user data from Realtime Database to determine user type
      // If we already have userData from phone lookup, use it, otherwise fetch from database
      if (!userData) {
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          userData = userSnapshot.val();
        }
      }
      
      if (userData) {
        // Navigate based on user type
        if (userData.userType === 'store_owner') {
          router.replace("/(main)/store-home");
        } else {
          router.replace("/(main)/home");
        }
        
        // Show welcome message with phone or email
        const welcomeIdentifier = userData.phoneNumber || userData.email || user.email;
        Alert.alert("Success", `Welcome back, ${userData.name}! (${welcomeIdentifier})`);
      } else {
        // User document doesn't exist, navigate to home by default
        router.replace("/(main)/home");
        Alert.alert("Success", "Signed in successfully!");
      }
      
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email or phone number.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
      }
      
      Alert.alert("Login Error", errorMessage);
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
            onChangeText={setEmailOrPhone}
            keyboardType="email-address"
            style={styles.emailInput}
          />

          <FormInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
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
    marginTop: vs(180), // Figma positioning relative to glass card
    marginBottom: vs(30),
  },
  title: {
    // Figma: fontSize:28, fontWeight:500, Clash Grotesk Variable
    fontFamily: "Clash Grotesk Variable",
    fontSize: 28,
    fontWeight: "500",
    color: Colors.white,
  },
  subtitle: {
    // Figma: fontSize:16, fontWeight:500, Clash Grotesk Variable
    fontFamily: "Clash Grotesk Variable",
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.5)",
    lineHeight: 16 * 1.375, // Figma line height
  },
  // Form Section - Figma: inputs at x:60, y:396 and y:466
  formSection: {
    alignItems: "center",
    gap: vs(20), // Figma spacing between inputs (466-396-50 = 20)
    marginBottom: vs(5),
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
    marginTop: vs(10),
    marginBottom: vs(25),
    paddingHorizontal: s(40), // Match form input padding
  },
  forgotPasswordText: {
    // Figma: fontSize:16, fontWeight:400, Clash Grotesk Variable
    fontFamily: "Clash Grotesk Variable",
    fontSize: 16,
    fontWeight: "400",
    color: "#E92B45",
    lineHeight: 16 * 1.375, // Figma line height
  },

  // Button Section - Figma: x:60, y:578, width:380
  buttonSection: {
    marginTop: vs(20),
    marginBottom: vs(20),
    paddingHorizontal: s(30), // (400 - 380) / 2 = 10px + 20px glass card padding
  },

  // Footer Section - Figma: y:658 (register link)
  footerSection: {
    alignItems: "center",
    marginTop: vs(10),
    marginBottom: vs(30),
  },
  footerText: {
    // Figma: fontSize:14, fontWeight:500, Clash Grotesk Variable
    fontFamily: "Clash Grotesk Variable",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.white,
    textAlign: "center",
    lineHeight: 14 * 1.57, // Figma line height
  },
  signInText: {
    color: "#E92B45", // Figma red color
    fontWeight: "500",
  },
});