/**
 * ORDER ERROR MODAL
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1057-1494 (Order Error)
 * Modal Baseline: 400x500
 * App Baseline: 440x956
 *
 * This modal appears when order placement fails, allowing users to retry
 * the order or return to the home screen. Features smooth animations and
 * customizable error messaging.
 */

import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { s, vs } from "../../constants/responsive";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OrderErrorModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorMessage?: string;
}

export function OrderErrorModal({
  visible,
  onClose,
  onRetry,
  errorMessage,
}: OrderErrorModalProps) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in - 300ms fade + spring scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out - 200ms fade
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleTryAgain = () => {
    onClose();
    // Call the retry callback
    onRetry();
  };

  const handleBackToHome = () => {
    onClose();
    // Navigate to customer home
    router.push("/(main)/(customer)/home");
  };

  const handleBackdropPress = () => {
    onClose();
  };

  // Default error message if none provided
  const displayErrorMessage = errorMessage ||
    "Sorry, somethings went wrong.\nPlease try again to continue your order.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              {/* Error Icon (NotApproved) - Figma: x=110, y=50, width=180, height=180 */}
              <View style={styles.iconContainer}>
                <Image
                  source={require("../../assets/images/order-error/error-icon.png")}
                  style={styles.errorIcon}
                  resizeMode="contain"
                />
              </View>

              {/* Error Label - Figma: x=79, y=270, width=243, height=57 */}
              <View style={styles.labelContainer}>
                <Text style={styles.errorTitle}>
                  Sorry, Your order has failed
                </Text>
                <Text style={styles.errorDescription}>
                  {displayErrorMessage}
                </Text>
              </View>

              {/* Try Again Button - Figma: x=83, y=357, width=234, height=40 */}
              <Pressable
                style={({ pressed }) => [
                  styles.tryAgainButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleTryAgain}
              >
                <Text style={styles.tryAgainButtonText}>Try Again</Text>
              </Pressable>

              {/* Back to Home Button - Figma: x=83, y=407, width=234, height=40 */}
              <Pressable
                style={({ pressed }) => [
                  styles.homeButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleBackToHome}
              >
                <Text style={styles.homeButtonText}>Back to Home</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: s(400),
    height: vs(500),
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: s(400),
    height: vs(500),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 8,
    position: "relative",
  },
  // Error Icon Container - Figma: x=110, y=50, width=180, height=180
  iconContainer: {
    position: "absolute",
    left: s(110),
    top: vs(50),
    width: s(180),
    height: s(180), // Use scale for square aspect ratio
  },
  errorIcon: {
    width: "100%",
    height: "100%",
  },
  // Label Container - Figma: x=79, y=270, width=243, height=57
  labelContainer: {
    position: "absolute",
    left: s(79),
    top: vs(270),
    width: s(243),
    height: vs(57),
    alignItems: "center",
  },
  // Error Title - Figma: fontSize=20, fontWeight=500, lineHeight=1.1
  errorTitle: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: s(20),
    lineHeight: s(20) * 1.1,
    color: Colors.darkGray,
    textAlign: "center",
    marginBottom: vs(5),
  },
  // Error Description - Figma: fontSize=12, fontWeight=400, lineHeight=1.23
  errorDescription: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    fontSize: s(12),
    lineHeight: s(12) * 1.23,
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
  },
  // Try Again Button - Figma: x=83, y=357, width=234, height=40
  tryAgainButton: {
    position: "absolute",
    left: s(83),
    top: vs(357),
    width: s(234),
    height: vs(40),
    backgroundColor: Colors.primary,
    borderRadius: s(10),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 3,
  },
  tryAgainButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: s(14),
    lineHeight: s(14) * 1.57,
    color: Colors.white,
    textAlign: "center",
  },
  // Back to Home Button - Figma: x=83, y=407, width=234, height=40
  homeButton: {
    position: "absolute",
    left: s(83),
    top: vs(407),
    width: s(234),
    height: vs(40),
    backgroundColor: "rgba(217, 217, 217, 0.5)",
    borderRadius: s(10),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 3,
  },
  homeButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: s(14),
    lineHeight: s(14) * 1.57,
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
