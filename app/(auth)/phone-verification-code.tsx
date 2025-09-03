import { useLocalSearchParams, useRouter } from "expo-router";
import { PhoneVerificationCodeScreen } from "../../src/components/phone-verification";

export default function PhoneVerificationCodeRoute() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = (otpCode: string) => {
    // Handle OTP verification
    console.log("OTP verification for phone:", phoneNumber, "with code:", otpCode);
    // Navigate to next screen after successful verification
    router.push("/signin");
  };

  const handleResendCode = () => {
    // Handle resend OTP code logic
    console.log("Resending OTP code to:", phoneNumber);
    // Here you would typically call an API to resend the code
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