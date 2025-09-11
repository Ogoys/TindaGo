import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import { PhoneVerificationCodeScreen } from "../../src/components/phone-verification";
import PhoneVerificationService from "../../src/services/PhoneVerificationService";

export default function PhoneVerificationCodeRoute() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  
  const phoneService = PhoneVerificationService.getInstance();

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = async (otpCode: string) => {
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number provided.");
      return;
    }

    console.log("Verifying OTP for phone:", phoneNumber, "with code:", otpCode);
    
    try {
      const result = await phoneService.verifyCode(phoneNumber, otpCode);
      
      if (result.success && result.isValid) {
        Alert.alert("Success", "Phone number verified successfully! Complete your account setup.", [
          {
            text: "OK",
            onPress: () => {
              // Navigate to complete registration for phone users
              router.push({
                pathname: "/(auth)/complete-phone-registration",
                params: { phoneNumber: phoneNumber }
              });
            }
          }
        ]);
      } else {
        Alert.alert("Verification Failed", result.message);
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      Alert.alert("Error", "Failed to verify code. Please try again.");
    }
  };

  const handleResendCode = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number provided.");
      return;
    }

    console.log("Resending OTP code to:", phoneNumber);
    
    try {
      const result = await phoneService.sendVerificationCode(phoneNumber);
      
      if (result.success) {
        Alert.alert(
          "Code Resent", 
          `${result.message}\n\n🔍 Check your console/terminal for the new verification code (development mode)`
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Resend code error:", error);
      Alert.alert("Error", "Failed to resend code. Please try again.");
    }
  };

  return (
    <PhoneVerificationCodeScreen
      phoneNumber={phoneNumber || "123456789"}
      onBack={handleBack}
      onConfirm={handleConfirm}
      onResendCode={handleResendCode}
    />
  );
}