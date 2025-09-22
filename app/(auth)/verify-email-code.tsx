import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, ImageBackground, Pressable, StyleSheet, TextInput, TouchableOpacity, Text, View } from "react-native";
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import { Typography } from "../../src/components/ui/Typography";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { s, vs } from "../../src/constants/responsive";

export default function VerifyEmailCodeScreen() {
  // Get email from navigation params (passed from verify-email screen)
  const { email } = useLocalSearchParams<{ email?: string }>();
  
  // State for OTP code inputs
  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleBackPress = () => {
    router.back();
  };

  const handleCodeChange = (value: string, index: number) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-verify if all 4 digits are entered
    if (newCode.every(digit => digit !== "") && index === 3) {
      handleVerifyCode(newCode.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace to go to previous input
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyCode = async (verificationCode: string) => {
    console.log("Checking email verification status...");
    
    try {
      if (!auth.currentUser) {
        Alert.alert("Error", "Please sign in first.");
        router.push("/(auth)/signin");
        return;
      }

      // Reload user to get latest email verification status
      await auth.currentUser.reload();
      
      if (auth.currentUser.emailVerified) {
        Alert.alert("Success", "Email verified successfully! You can now sign in.", [
          {
            text: "OK",
            onPress: () => router.push("/(auth)/signin")
          }
        ]);
      } else {
        Alert.alert(
          "Email Not Verified Yet", 
          "Please check your email (including spam folder) and click the verification link. After clicking the link, come back and tap 'Check Verification Status'.",
          [
            { text: "Check Verification Status", onPress: () => handleVerifyCode("") },
            { text: "Resend Email", onPress: () => handleResendCode() }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("Verification Error", "Failed to check verification status. Please try again.");
    }
  };

  const handleResendCode = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert("Error", "Please sign in first.");
        router.push("/(auth)/signin");
        return;
      }

      await sendEmailVerification(auth.currentUser);
      Alert.alert("Verification Email Sent", "A new verification email has been sent to your address.");
      
      // Clear current code inputs
      setCode(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } catch (error: any) {
      let errorMessage = "Failed to send verification email.";
      
      switch (error.code) {
        case 'auth/too-many-requests':
          errorMessage = "Too many requests. Please wait a moment before trying again.";
          break;
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Image with Blur - Figma: x:-136, y:478, width:598, height:598 */}
      <ImageBackground
        source={require("../../src/assets/images/verify-email-code/background-blur.png")}
        style={styles.backgroundImage}
        blurRadius={50}
      />
      
      {/* Status Bar Area - Figma: y:0, height:54 */}
      <View style={styles.statusBar} />
      
      {/* Back Button - Figma: x:20, y:94, width:30, height:30 */}
      <Pressable style={styles.backButton} onPress={handleBackPress}>
        <Image
          source={require("../../src/assets/images/verify-email-code/chevron-left.png")}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </Pressable>

      {/* Email Title - Figma: x:196, y:98, width:49, height:22 */}
      <View style={styles.titleContainer}>
        <Typography variant="h2" color="black" style={styles.title}>
          Email
        </Typography>
      </View>

      {/* Description Text - Figma: x:20, y:150, width:207, height:22 */}
      <View style={styles.descriptionContainer}>
        <Typography variant="body" color="textSecondary" style={styles.description}>
          Check your email and click the verification link
        </Typography>
      </View>

      {/* Check Verification Button */}
      <TouchableOpacity 
        style={styles.checkButton} 
        onPress={() => handleVerifyCode("")}
      >
        <Text style={styles.checkButtonText}>Check Verification Status</Text>
      </TouchableOpacity>

      {/* Didn't receive email text - Figma: x:20, y:382, width:238, height:22 */}
      <View style={styles.noCodeContainer}>
        <Typography variant="body" color="textSecondary" style={styles.noCodeText}>
          Didn&apos;t receive the verification email?
        </Typography>
      </View>

      {/* Resend email text - Figma: x:20, y:409, width:153, height:22 */}
      <Pressable style={styles.resendContainer} onPress={handleResendCode}>
        <Typography variant="body" style={styles.resendText}>
          Resend verification email
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Light gray background from Figma (fill_K5WRM7)
  },
  
  // Background Image - Figma: x:-136, y:478, width:598, height:598
  backgroundImage: {
    position: "absolute",
    left: s(-136),
    top: vs(478),
    width: s(598),
    height: vs(598),
  },

  // Status Bar Area - Figma: y:0, height:54
  statusBar: {
    height: vs(54),
  },

  // Back Button - Figma: x:20, y:94, width:30, height:30
  backButton: {
    position: "absolute",
    left: s(20),
    top: vs(94),
    width: s(30),
    height: vs(30),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 4,
  },
  backIcon: {
    width: s(15),
    height: vs(15),
  },

  // Title Container - Figma: x:196, y:98, width:49, height:22
  titleContainer: {
    position: "absolute",
    left: s(196),
    top: vs(98),
    width: s(49),
    height: vs(22),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    lineHeight: vs(22),
    textAlign: "center",
    color: Colors.black,
  },

  // Description Container - Figma: x:20, y:150, width:207, height:22  
  descriptionContainer: {
    position: "absolute",
    left: s(20),
    top: vs(150),
    width: s(207),
    height: vs(22),
  },
  description: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    lineHeight: vs(22),
    color: Colors.textSecondary,
  },

  // Check Button - positioned where code inputs were
  checkButton: {
    position: "absolute",
    left: s(60),
    top: vs(272),
    right: s(60),
    height: vs(70),
    backgroundColor: '#E92B45',
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 8,
  },
  checkButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    color: Colors.white,
    textAlign: "center",
  },

  // No Code Container - Figma: x:20, y:382, width:238, height:22
  noCodeContainer: {
    position: "absolute",
    left: s(20),
    top: vs(382),
    width: s(238),
    height: vs(22),
  },
  noCodeText: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    lineHeight: vs(22),
    color: Colors.textSecondary,
  },

  // Resend Container - Figma: x:20, y:409, width:153, height:22
  resendContainer: {
    position: "absolute",
    left: s(20),
    top: vs(409),
    width: s(153),
    height: vs(22),
  },
  resendText: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    lineHeight: vs(22),
    color: '#E92B45', // Red color from Figma (fill_W1J10I)
  },
});