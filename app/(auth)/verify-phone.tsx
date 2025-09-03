import { useLocalSearchParams, useRouter } from "expo-router";
import { PhoneVerificationScreen } from "../../src/components/phone-verification";

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = () => {
    // Handle phone number confirmation
    console.log("Phone number confirmed:", phoneNumber);
    // Navigate to OTP verification screen
    router.push({
      pathname: "/phone-verification-code",
      params: { phoneNumber: phoneNumber || "123456789" }
    });
  };

  return (
    <PhoneVerificationScreen
      phoneNumber={phoneNumber || "123456789"}
      onBack={handleBack}
      onConfirm={handleConfirm}
    />
  );
}