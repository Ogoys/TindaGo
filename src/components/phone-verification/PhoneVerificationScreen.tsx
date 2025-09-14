import { View, Text, StyleSheet, Image, Pressable, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { s, vs } from "../../constants/responsive";
import { CustomStatusBar } from "../ui/StatusBar";

interface PhoneVerificationScreenProps {
  phoneNumber?: string;
  onBack?: () => void;
  onConfirm?: () => void;
  loading?: boolean;
}

export function PhoneVerificationScreen({
  phoneNumber = "123456789",
  onBack,
  onConfirm,
  loading = false,
}: PhoneVerificationScreenProps) {

  return (
    <SafeAreaView style={styles.container}>
      {/* Background blur image - Figma position: x: -136, y: 478, width: 598, height: 598 */}
      <ImageBackground
        source={require("../../assets/images/phone-verification/background-blur.png")}
        style={styles.backgroundImage}
        blurRadius={50}
      />
      
      {/* Status Bar */}
      <CustomStatusBar />
      
      {/* Back Button - Figma position: x: 20, y: 94, width: 30, height: 30 */}
      <Pressable style={styles.backButton} onPress={onBack || (() => {})}>
        <Image
          source={require("../../assets/images/phone-verification/chevron-left.png")}
          style={styles.backIcon}
        />
      </Pressable>
      
      {/* Title - Figma position: x: 124, y: 98, width: 192, height: 22 */}
      <Text style={styles.title}>Verify Phone Number</Text>
      
      {/* Subtitle - Figma position: x: 20, y: 150, width: 318, height: 44 */}
      <Text style={styles.subtitle}>We have sent you on SMS with a code to{'\n'}your number</Text>
      
      {/* Phone Number Display Container - Figma position: x: 20, y: 274, width: 400, height: 50 */}
      <View style={styles.phoneContainer}>
        {/* Philippines Flag - Figma position: x: 32, y: 291, width: 30, height: 15 */}
        <Image
          source={require("../../assets/images/phone-verification/flag-philippines.png")}
          style={styles.flagIcon}
        />
        
        {/* Country Code - Figma position: x: 72, y: 288, width: 28, height: 22 */}
        <Text style={styles.countryCode}>+63</Text>
        
        {/* Phone Number - Figma position: x: 112, y: 288, width: 83, height: 22 */}
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
      </View>
      
      {/* Confirm Button - Figma position: x: 20, y: 343, width: 400, height: 50 */}
      <Pressable 
        style={[styles.confirmButton, loading && styles.confirmButtonDisabled]} 
        onPress={loading ? undefined : (onConfirm || (() => {}))}
        disabled={loading}
      >
        <Text style={styles.confirmButtonText}>
          {loading ? "Sending Code..." : "Confirm"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma background: fill_KRVAU3
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
    // Figma position: x: 124, y: 98, width: 192, height: 22
    position: "absolute",
    top: vs(98),
    left: s(124),
    width: s(192),
    height: vs(22),
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(20) * Fonts.lineHeights.tight,
    color: Colors.black,
    textAlign: "center",
  },
  subtitle: {
    // Figma position: x: 20, y: 150, width: 318, height: 44
    position: "absolute",
    top: vs(150),
    left: s(20),
    width: s(318),
    height: vs(44),
    fontFamily: Fonts.primary,
    fontSize: s(18),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(18) * Fonts.lineHeights.normal,
    color: 'rgba(0, 0, 0, 0.5)', // Figma fill_DK8K4P
    textAlign: "left",
  },
  phoneContainer: {
    // Figma position: x: 20, y: 274, width: 400, height: 50
    position: "absolute",
    top: vs(274),
    left: s(20),
    width: s(400),
    height: vs(50),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 5,
  },
  flagIcon: {
    // Figma position: x: 32, y: 291 (relative to container: x: 12, y: 17)
    marginLeft: s(12),
    width: s(30),
    height: vs(15),
  },
  countryCode: {
    // Figma position: x: 72, y: 288 (relative to container: x: 52, y: 14)
    marginLeft: s(10),
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(16) * 1.375, // Figma style_733UH1
    color: Colors.black,
  },
  phoneNumber: {
    // Figma position: x: 112, y: 288 (relative to container: x: 92, y: 14)
    marginLeft: s(12),
    fontFamily: Fonts.primary,
    fontSize: s(16),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(16) * 1.375, // Figma style_733UH1
    color: Colors.black,
  },
  confirmButton: {
    // Figma position: x: 20, y: 343, width: 400, height: 50
    position: "absolute",
    top: vs(343),
    left: s(20),
    width: s(400),
    height: vs(50),
    backgroundColor: Colors.primary, // Figma fill_8CGZ2A
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(4),
    elevation: 5,
  },
  confirmButtonText: {
    fontFamily: Fonts.primary,
    fontSize: s(20),
    fontWeight: Fonts.weights.medium,
    lineHeight: s(20) * Fonts.lineHeights.tight, // Figma style_G12ON8
    color: Colors.white, // Figma fill_IZNMMX
    textAlign: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
});