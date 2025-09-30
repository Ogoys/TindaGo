import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, ImageBackground, Pressable, StyleSheet, View, Alert, Text } from "react-native";
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import { Button } from "../../src/components/ui/Button";
import { Typography } from "../../src/components/ui/Typography";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { s, vs } from "../../src/constants/responsive";

export default function VerifyEmailStoreOwnerScreen() {
  // Get store owner details from navigation params
  const { email, name, uid, password } = useLocalSearchParams<{
    email?: string;
    name?: string;
    uid?: string;
    password?: string;
  }>();
  const displayEmail = email || "Test123@gmail.com";

  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleConfirmPress = async () => {
    setLoading(true);

    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        Alert.alert("Error", "Please sign in first to verify your email.");
        router.push("/(auth)/signin");
        return;
      }

      // Reload user to get latest verification status
      await reload(auth.currentUser);

      if (auth.currentUser.emailVerified) {
        // Email is verified, proceed to store registration
        Alert.alert(
          "Email Verified!",
          "Your email has been verified successfully. Complete your business registration to continue.",
          [
            {
              text: "Continue Setup",
              onPress: () => {
                router.push({
                  pathname: "/(auth)/(store-owner)/StoreRegistration",
                  params: {
                    name,
                    email: displayEmail,
                    uid,
                    prefilledName: name,
                    prefilledEmail: displayEmail,
                    prefilledPassword: password
                  }
                });
              }
            }
          ]
        );
      } else {
        // Email not verified yet
        Alert.alert(
          "Email Not Verified",
          "Please check your email and click the verification link, then try again."
        );
      }
    } catch (error: any) {
      let errorMessage = "Failed to check verification status.";

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "User not found. Please sign up first.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection.";
          break;
      }

      Alert.alert("Verification Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert("Error", "Please sign in first.");
        return;
      }

      await sendEmailVerification(auth.currentUser);
      Alert.alert(
        "Verification Email Sent",
        "We've sent a new verification email to your address. Please check your email and click the verification link."
      );
    } catch (error: any) {
      let errorMessage = "Failed to send verification email.";

      if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please wait a moment before trying again.";
      }

      Alert.alert("Email Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image with Blur */}
      <ImageBackground
        source={require("../../src/assets/images/verify-email/background-blur.png")}
        style={styles.backgroundImage}
        blurRadius={50}
      />

      {/* Status Bar Area */}
      <View style={styles.statusBar} />

      {/* Back Button - Figma: x:20, y:94, width:30, height:30 */}
      <Pressable style={styles.backButton} onPress={handleBackPress}>
        <Image
          source={require("../../src/assets/images/verify-email/chevron-left.png")}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </Pressable>

      {/* Verify Email Title - Figma: x:167, y:98, width:106, height:22 */}
      <View style={styles.titleContainer}>
        <Typography variant="h2" color="black" style={styles.title}>
          Verify Email
        </Typography>
      </View>

      {/* Description Text - Figma: x:20, y:150, width:216, height:44 */}
      <View style={styles.descriptionContainer}>
        <Typography variant="body" color="textSecondary" style={styles.description}>
          We have sent you a verification{'\n'}link to your email
        </Typography>
      </View>

      {/* Email Display Field - Figma: x:20, y:274, width:400, height:50 */}
      <View style={styles.emailContainer}>
        <View style={styles.emailField}>
          <Typography variant="body" color="textSecondary" style={styles.emailText}>
            {displayEmail}
          </Typography>
        </View>
      </View>

      {/* Confirm Button - Figma: x:20, y:343, width:400, height:50 - Made smaller */}
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Checking..." : "I've Verified My Email"}
          variant="primary"
          onPress={handleConfirmPress}
          disabled={loading}
        />
      </View>

      {/* Resend Email Link */}
      <View style={styles.resendContainer}>
        <Pressable onPress={handleResendEmail} style={styles.resendButton}>
          <Text style={styles.resendText}>Didn&apos;t receive the email? Resend</Text>
        </Pressable>
      </View>

      {/* Store Owner Note - Added below */}
      <View style={styles.noteContainer}>
        <Typography variant="caption" color="textSecondary" style={styles.noteText}>
          Note: Email verification is required for store owners before completing business registration.
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Light gray background from Figma
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

  // Title Container - Figma: x:167, y:98, width:106, height:22
  titleContainer: {
    position: "absolute",
    left: s(167),
    top: vs(98),
    width: s(106),
    height: vs(22),
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    lineHeight: vs(22),
    textAlign: "center",
    color: Colors.black,
  },

  // Description Container - Figma: x:20, y:150, width:216, height:44
  descriptionContainer: {
    position: "absolute",
    left: s(20),
    top: vs(150),
    width: s(400),
    height: vs(44),
  },
  description: {
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    lineHeight: vs(22),
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Email Container - Figma: x:20, y:274, width:400, height:50
  emailContainer: {
    position: "absolute",
    left: s(20),
    top: vs(274),
    width: s(400),
    height: vs(50),
  },
  emailField: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.white,
    borderRadius: s(20),
    paddingHorizontal: s(15),
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 4,
  },
  emailText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.medium,
    lineHeight: vs(22),
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Button Container - Made smaller width
  buttonContainer: {
    position: "absolute",
    left: s(60), // Centered with smaller width
    top: vs(343),
    width: s(320), // Reduced from 400 to 320
    height: vs(50),
  },

  // Resend Container
  resendContainer: {
    position: "absolute",
    left: s(20),
    top: vs(410),
    width: s(400),
    alignItems: "center",
  },
  resendButton: {
    paddingVertical: vs(10),
    paddingHorizontal: s(20),
  },
  resendText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    color: Colors.primary,
    textDecorationLine: "underline",
  },

  // Note Container - Store Owner Specific
  noteContainer: {
    position: "absolute",
    left: s(20),
    top: vs(470),
    width: s(400),
    paddingHorizontal: s(20),
  },
  noteText: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    fontWeight: Fonts.weights.normal,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: vs(16),
    fontStyle: "italic",
  },
});