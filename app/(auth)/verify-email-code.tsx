import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, ImageBackground, Pressable, StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { sendEmailVerification } from 'firebase/auth';
import { ref, update, get } from 'firebase/database';
import { auth, database } from '../../FirebaseConfig';
import { useUser } from "../../src/contexts/UserContext";
import { Typography } from "../../src/components/ui/Typography";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { s, vs } from "../../src/constants/responsive";

export default function VerifyEmailCodeScreen() {
  const { setUser: setUserContext } = useUser();
  // Get email from navigation params
  const { email } = useLocalSearchParams<{ email?: string }>();
  const displayEmail = email || "your email";
  
  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        Alert.alert("Error", "Please sign in first.");
        router.push("/(auth)/signin");
        return;
      }

      // Reload user to get latest email verification status
      await auth.currentUser.reload();
      
      if (auth.currentUser.emailVerified) {
        // Update database to mark email as verified
        try {
          const userRef = ref(database, `users/${auth.currentUser.uid}`);
          await update(userRef, {
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString()
          });
          console.log('✅ Database updated: emailVerified = true');
          
          // Sync with UserContext - fetch user data
          const userSnapshot = await get(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            await setUserContext({
              id: auth.currentUser.uid,
              name: userData.name || auth.currentUser.displayName || '',
              email: userData.email || auth.currentUser.email || '',
              role: userData.userType === 'store_owner' ? 'store-owner' : 'customer',
              isEmailVerified: true,
              isPhoneVerified: userData.phoneVerified || false,
              profileComplete: true,
              storeId: userData.userType === 'store_owner' ? auth.currentUser.uid : undefined,
            });
            console.log('✅ UserContext synced after email verification');
          }
        } catch (dbError) {
          console.error('❌ Failed to update database or sync UserContext:', dbError);
        }

        // Navigate to location permission screen for customers
        Alert.alert(
          "Email Verified!",
          "Great! Let's help you find nearby stores.",
          [
            {
              text: "Continue",
              onPress: () => {
                console.log('🧭 [VerifyEmail] Navigating to enable-location...');
                router.replace("/(auth)/enable-location");
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Email Not Verified Yet", 
          "Please check your email (including spam folder) and click the verification link. After clicking the link, come back and tap 'Check Again'.",
          [
            { text: "Resend Email", onPress: () => handleResendEmail() }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("Verification Error", "Failed to check verification status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      if (!auth.currentUser) {
        Alert.alert("Error", "Please sign in first.");
        router.push("/(auth)/signin");
        return;
      }

      const actionCodeSettings = {
        url: 'https://tindagoproject.web.app', // Redirect to TindaGo success page
        handleCodeInApp: false,
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      Alert.alert("Verification Email Sent", "A new verification email has been sent to your address.");
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

      {/* Verify Email Title */}
      <View style={styles.titleContainer}>
        <Typography variant="h2" color="black" style={styles.title}>
          Verify Email
        </Typography>
      </View>

      {/* Description Text */}
      <View style={styles.descriptionContainer}>
        <Typography variant="body" color="textSecondary" style={styles.description}>
          We've sent a verification link to {displayEmail}. Click the link in your email to verify your account.
        </Typography>
      </View>

      {/* Check Verification Button */}
      <TouchableOpacity 
        style={[styles.checkButton, loading && styles.checkButtonDisabled]} 
        onPress={handleVerifyEmail}
        disabled={loading}
      >
        <Text style={styles.checkButtonText}>
          {loading ? "Checking..." : "I've Verified My Email"}
        </Text>
      </TouchableOpacity>

      {/* Didn't receive email text - Figma: x:20, y:382, width:238, height:22 */}
      <View style={styles.noCodeContainer}>
        <Typography variant="body" color="textSecondary" style={styles.noCodeText}>
          Didn&apos;t receive the verification email?
        </Typography>
      </View>

      {/* Resend email text */}
      <Pressable style={styles.resendContainer} onPress={handleResendEmail}>
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

  // Title Container
  titleContainer: {
    position: "absolute",
    left: s(20),
    right: s(20),
    top: vs(98),
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

  // Description Container
  descriptionContainer: {
    position: "absolute",
    left: s(20),
    right: s(20),
    top: vs(150),
    paddingHorizontal: s(10),
  },
  description: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.normal,
    lineHeight: vs(22),
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Check Button
  checkButton: {
    position: "absolute",
    left: s(40),
    top: vs(250),
    right: s(40),
    height: vs(60),
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
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.medium,
    color: Colors.white,
    textAlign: "center",
  },

  // No Code Container
  noCodeContainer: {
    position: "absolute",
    left: s(20),
    right: s(20),
    top: vs(350),
    alignItems: "center",
  },
  noCodeText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.normal,
    lineHeight: vs(22),
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Resend Container
  resendContainer: {
    position: "absolute",
    left: s(20),
    right: s(20),
    top: vs(385),
    alignItems: "center",
    paddingVertical: vs(10),
  },
  resendText: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: Fonts.weights.medium,
    lineHeight: vs(22),
    color: '#E92B45',
    textDecorationLine: "underline",
  },
});