import { View, Text, StyleSheet, Image, Pressable, ImageBackground, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { s, vs } from "../../constants/responsive";
import { CustomStatusBar } from "../ui/StatusBar";

interface PhoneVerificationCodeScreenProps {
  phoneNumber?: string;
  onBack?: () => void;
  onConfirm?: (code: string) => void;
  onResendCode?: () => void;
}

export function PhoneVerificationCodeScreen({
  phoneNumber = "123456789",
  onBack,
  onConfirm,
  onResendCode,
}: PhoneVerificationCodeScreenProps) {
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const inputRefs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const handleOtpChange = (value: string, index: number) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto move to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto submit when all fields are filled
    if (newOtpCode.every(digit => digit !== '') && onConfirm) {
      onConfirm(newOtpCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background blur image - Figma position: x: -136, y: 478, width: 598, height: 598 */}
      <ImageBackground
        source={require("../../assets/images/phone-verification-code/background-blur.png")}
        style={styles.backgroundImage}
        blurRadius={50}
      />
      
      {/* Status Bar */}
      <CustomStatusBar />
      
      {/* Back Button - Figma position: x: 20, y: 94, width: 30, height: 30 */}
      <Pressable style={styles.backButton} onPress={onBack || (() => {})}>
        <Image
          source={require("../../assets/images/phone-verification-code/chevron-left.png")}
          style={styles.backIcon}
        />
      </Pressable>
      
      {/* Title - Figma position: x: 151, y: 98, width: 139, height: 22 */}
      <Text style={styles.title}>Phone Number</Text>
      
      {/* Subtitle - Figma position: x: 20, y: 150, width: 207, height: 22 */}
      <Text style={styles.subtitle}>Enter your OTP code here</Text>
      
      {/* OTP Input Boxes - Figma position: x: 29, y: 272, width: 382, height: 70 */}
      <View style={styles.otpContainer}>
        {otpCode.map((digit, index) => (
          <View key={index} style={[
            styles.otpBox,
            digit ? styles.otpBoxFilled : styles.otpBoxEmpty
          ]}>
            <TextInput
              ref={inputRefs[index]}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : styles.otpInputEmpty
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
            {digit && <Text style={styles.otpDigit}>{digit}</Text>}
          </View>
        ))}
      </View>
      
      {/* Didn't receive code text - Figma position: x: 20, y: 382, width: 238, height: 22 */}
      <Text style={styles.didntReceiveText}>Didn't you received any code?</Text>
      
      {/* Resend code link - Figma position: x: 20, y: 409, width: 153, height: 22 */}
      <Pressable onPress={onResendCode || (() => {})}>
        <Text style={styles.resendText}>Resend a new code</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma background: fill_FR2RRU
  },
  backgroundImage: {
    position: "absolute",
    // Figma position: x: -136, y: 478, width: 598, height: 598
    left: s(-136),
    top: vs(478),
    width: s(598),
    height: vs(598),
  },
  backButton: {
    // Figma position: x: 20, y: 94, width: 30, height: 30
    position: "absolute",
    top: vs(94),
    left: s(20),
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
    elevation: 5,
  },
  backIcon: {
    width: s(15),
    height: vs(15),
  },
  title: {
    // Figma position: x: 151, y: 98, width: 139, height: 22
    position: "absolute",
    top: vs(98),
    left: s(151),
    width: s(139),
    height: vs(22),
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(20) * Fonts.lineHeights.tight,
    color: Colors.black,
    textAlign: "center",
  },
  subtitle: {
    // Figma position: x: 20, y: 150, width: 207, height: 22
    position: "absolute",
    top: vs(150),
    left: s(20),
    width: s(207),
    height: vs(22),
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(18) * Fonts.lineHeights.normal,
    color: 'rgba(0, 0, 0, 0.5)', // Figma fill_TTKBRR
    textAlign: "left",
  },
  otpContainer: {
    // Figma position: x: 29, y: 272, width: 382, height: 70
    // Boxes at x: 29, 133, 237, 341 (spacing: 104px between centers)
    position: "absolute",
    top: vs(272),
    left: s(29),
    width: s(382),
    height: vs(70),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpBox: {
    // Each box: width: 70, height: 70, borderRadius: 20
    width: s(70),
    height: vs(70),
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 5,
    position: "relative",
  },
  otpBoxEmpty: {
    backgroundColor: Colors.white, // Figma fill_KNEDMG
  },
  otpBoxFilled: {
    backgroundColor: Colors.red, // Figma fill_97J4XC (red)
  },
  otpInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: s(40),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    opacity: 0, // Hide the actual input
  },
  otpInputEmpty: {
    color: Colors.black,
  },
  otpInputFilled: {
    color: Colors.white,
  },
  otpDigit: {
    fontSize: s(40),
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    lineHeight: s(40) * 0.55, // Figma style_X6M3AR lineHeight
    color: Colors.white,
    textAlign: "center",
  },
  didntReceiveText: {
    // Figma position: x: 20, y: 382, width: 238, height: 22
    position: "absolute",
    top: vs(382),
    left: s(20),
    width: s(238),
    height: vs(22),
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(18) * Fonts.lineHeights.normal,
    color: 'rgba(0, 0, 0, 0.5)', // Figma fill_TTKBRR
    textAlign: "left",
  },
  resendText: {
    // Figma position: x: 20, y: 409, width: 153, height: 22
    position: "absolute",
    top: vs(409),
    left: s(20),
    width: s(153),
    height: vs(22),
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(18) * Fonts.lineHeights.normal,
    color: Colors.red, // Figma fill_97J4XC (red)
    textAlign: "left",
  },
});