import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, ImageBackground, Pressable, StyleSheet, TextInput, View } from "react-native";
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

  const handleVerifyCode = (verificationCode: string) => {
    // TODO: Implement actual OTP verification logic with API
    console.log("Verifying code:", verificationCode);
    
    // For demo purposes, accept any 4-digit code
    if (verificationCode.length === 4) {
      // Navigate to main app or success screen
      Alert.alert("Success", "Email verified successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(auth)/signin")
        }
      ]);
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend OTP logic
    Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    // Clear current code inputs
    setCode(["", "", "", ""]);
    inputRefs[0].current?.focus();
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
          Enter your OTP code here
        </Typography>
      </View>

      {/* Code Input Fields - Figma: x:29, y:272, width:382, height:70 */}
      {/* Individual inputs at exact Figma positions: x=29, 133, 237, 341 */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => {
          // Calculate exact position based on Figma coordinates
          const inputPositions = [29, 133, 237, 341];
          return (
            <View
              key={index}
              style={[
                styles.codeInput,
                { left: s(inputPositions[index] - 29) }, // Offset from container position
                // First input has red background with white text (as shown in Figma)
                digit ? styles.codeInputFilled : styles.codeInputEmpty
              ]}
            >
              <TextInput
                ref={inputRefs[index]}
                style={[
                  styles.codeText,
                  digit ? styles.codeTextFilled : styles.codeTextEmpty
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            </View>
          );
        })}
      </View>

      {/* Didn't receive code text - Figma: x:20, y:382, width:238, height:22 */}
      <View style={styles.noCodeContainer}>
        <Typography variant="body" color="textSecondary" style={styles.noCodeText}>
          Didn't you received any code?
        </Typography>
      </View>

      {/* Resend code text - Figma: x:20, y:409, width:153, height:22 */}
      <Pressable style={styles.resendContainer} onPress={handleResendCode}>
        <Typography variant="body" style={styles.resendText}>
          Resend a new code
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

  // Code Container - Figma: x:29, y:272, width:382, height:70
  // Individual inputs at exact Figma positions: x=29, 133, 237, 341
  codeContainer: {
    position: "absolute",
    left: s(29),
    top: vs(272),
    width: s(382),
    height: vs(70),
  },
  
  // Individual Code Input - Figma: width:70, height:70, borderRadius:20px
  // Positioned absolutely within container at exact Figma coordinates
  codeInput: {
    position: "absolute",
    width: s(70),
    height: vs(70),
    borderRadius: s(20),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(10),
    elevation: 8,
  },
  codeInputEmpty: {
    backgroundColor: Colors.white,
  },
  codeInputFilled: {
    backgroundColor: '#E92B45', // Red color from Figma (fill_W1J10I)
  },
  
  codeText: {
    fontFamily: Fonts.primary,
    fontSize: s(40), // Figma: fontSize 40 (style_3CCJIM)
    fontWeight: Fonts.weights.medium, // Figma: fontWeight 500
    lineHeight: vs(22), // Figma: lineHeight 0.55em = 22px
    textAlign: "center",
    width: "100%",
    height: "100%",
    textAlignVertical: "center",
  },
  codeTextEmpty: {
    color: Colors.black,
  },
  codeTextFilled: {
    color: Colors.white,
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