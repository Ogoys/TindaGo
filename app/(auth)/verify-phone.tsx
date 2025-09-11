import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { PhoneVerificationScreen } from "../../src/components/phone-verification";
import PhoneVerificationService from "../../src/services/PhoneVerificationService";

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [loading, setLoading] = useState(false);
  
  const phoneService = PhoneVerificationService.getInstance();

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number provided.");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Sending verification code to:", phoneNumber);
      
      const result = await phoneService.sendVerificationCode(phoneNumber);
      
      if (result.success) {
        Alert.alert(
          "Verification Code Sent", 
          `${result.message}\n\n🔍 Check your console/terminal for the verification code (development mode)`,
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to OTP verification screen
                router.push({
                  pathname: "/(auth)/phone-verification-code",
                  params: { phoneNumber: phoneNumber }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      Alert.alert("Error", "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneVerificationScreen
      phoneNumber={phoneNumber || "123456789"}
      onBack={handleBack}
      onConfirm={handleConfirm}
      loading={loading}
    />
  );
}