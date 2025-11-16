/**
 * ORDER COMPLETE MODAL
 *
 * Figma File: 8I1Nr3vQZllDDknSevstvH
 * Node: 1057-1472 (Order Complete)
 * Modal Baseline: 400x500
 * App Baseline: 440x956
 *
 * This modal appears after successful order placement, showing order confirmation
 * with options to track the order or return home.
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

interface OrderCompleteModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
}

export function OrderCompleteModal({
  visible,
  onClose,
  orderId,
}: OrderCompleteModalProps) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
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
      // Animate out
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

  const handleTrackOrder = () => {
    onClose();
    // Navigate to track-store screen with orderId
    router.push(`/(main)/(customer)/track-store?orderId=${orderId}` as any);
  };

  const handleBackToHome = () => {
    onClose();
    // Navigate to customer home (use replace to prevent going back to payment)
    router.replace("/(main)/(customer)/home");
  };

  const handleBackdropPress = () => {
    onClose();
  };

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
              {/* Approved Icon - Figma: x=110, y=50, width=180, height=180 */}
              <View style={styles.iconContainer}>
                <Image
                  source={require("../../assets/images/order-complete/approved-icon.png")}
                  style={styles.approvedIcon}
                  resizeMode="contain"
                />
              </View>

              {/* Thank you label - Figma: x=83, y=270, width=234, height=57 */}
              <View style={styles.labelContainer}>
                <Text style={styles.thankYouText}>
                  Thank you for your order!
                </Text>
                <Text style={styles.descriptionText}>
                  Your order has been placed successfully. your{"\n"}order ID is #{orderId}
                </Text>
              </View>

              {/* Track Store Button - Figma: x=83, y=357, width=234, height=40 */}
              <Pressable
                style={({ pressed }) => [
                  styles.trackButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleTrackOrder}
              >
                <Text style={styles.trackButtonText}>Track Store</Text>
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
  // Approved Icon Container - Figma: x=110, y=50, width=180, height=180
  iconContainer: {
    position: "absolute",
    left: s(110),
    top: vs(50),
    width: s(180),
    height: s(180), // Use scale for square aspect ratio
  },
  approvedIcon: {
    width: "100%",
    height: "100%",
  },
  // Label Container - Figma: x=83, y=270, width=234, height=57
  labelContainer: {
    position: "absolute",
    left: s(83),
    top: vs(270),
    width: s(234),
    height: vs(57),
    alignItems: "center",
  },
  // Thank You Text - Figma: fontSize=20, fontWeight=500, lineHeight=1.1
  thankYouText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: s(20),
    lineHeight: s(20) * 1.1,
    color: Colors.darkGray,
    textAlign: "center",
    marginBottom: vs(5),
  },
  // Description Text - Figma: fontSize=12, fontWeight=400, lineHeight=1.23
  descriptionText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    fontSize: s(12),
    lineHeight: s(12) * 1.23,
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
  },
  // Track Order Button - Figma: x=83, y=357, width=234, height=40
  trackButton: {
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
  trackButtonText: {
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
