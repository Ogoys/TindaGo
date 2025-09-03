import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../src/components/ui/Button";
import { FormInput } from "../../src/components/ui/FormInput";
import { SignInGlassCard } from "../../src/components/ui/SignInGlassCard";
import { Colors } from "../../src/constants/Colors";
import { s, vs } from "../../src/constants/responsive";

export default function SignInScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login pressed", { emailOrPhone, password });
    
    // For now, assume all users are regular users and redirect to home page
    // In a real app, this would check user type from authentication response
    router.replace("/(main)/home");
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
            title="Login"
            variant="primary"
            onPress={handleLogin}
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