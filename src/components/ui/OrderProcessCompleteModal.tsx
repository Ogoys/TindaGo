/**
 * ORDER PROCESS COMPLETE MODAL
 *
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1563&m=dev
 * 
 * Shows when order status becomes "picked_up" or "completed"
 * Allows customer to give feedback or return home
 */

import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";
import { s, vs } from "../../constants/responsive";

interface OrderProcessCompleteModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
}

export function OrderProcessCompleteModal({
  visible,
  onClose,
  orderId,
}: OrderProcessCompleteModalProps) {
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

  const handleGiveFeedback = () => {
    onClose();
    // Navigate to review screen (will be implemented)
    router.push(`/(main)/(customer)/review?orderId=${orderId}` as any);
  };

  const handleBackToHome = () => {
    onClose();
    router.push("/(main)/(customer)/home");
  };

  const handleLater = () => {
    onClose();
    // Just close the modal, user can give feedback later
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleLater}>
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
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <Image
                  source={require("../../assets/images/order-complete/approved-icon.png")}
                  style={styles.approvedIcon}
                  resizeMode="contain"
                />
              </View>

              {/* Message */}
              <View style={styles.messageContainer}>
                <Text style={styles.titleText}>
                  Order Process{"\n"}Complete!
                </Text>
                <Text style={styles.descriptionText}>
                  Thank you for your order! We hope{"\n"}you enjoyed our service.
                </Text>
              </View>

              {/* Give Feedback Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.feedbackButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleGiveFeedback}
              >
                <Text style={styles.feedbackButtonText}>Give Feedback Now</Text>
              </Pressable>

              {/* Back to Home Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.homeButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleBackToHome}
              >
                <Text style={styles.homeButtonText}>Back to Home</Text>
              </Pressable>

              {/* Later Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.laterButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleLater}
              >
                <Text style={styles.laterButtonText}>Later</Text>
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
    height: vs(600),
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: s(400),
    height: vs(600),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 8,
    position: "relative",
    alignItems: "center",
    paddingBottom: vs(20),
  },
  // Success Icon Container
  iconContainer: {
    marginTop: vs(50),
    width: s(180),
    height: s(180),
    justifyContent: "center",
    alignItems: "center",
  },
  approvedIcon: {
    width: "100%",
    height: "100%",
  },
  // Message Container
  messageContainer: {
    marginTop: vs(30),
    alignItems: "center",
    paddingHorizontal: s(40),
  },
  titleText: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: s(20),
    lineHeight: s(20) * 1.3,
    color: Colors.darkGray,
    textAlign: "center",
    marginBottom: vs(10),
  },
  descriptionText: {
    fontFamily: Fonts.primary,
    fontWeight: "400",
    fontSize: s(12),
    lineHeight: s(12) * 1.4,
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
  },
  // Give Feedback Button
  feedbackButton: {
    position: "absolute",
    bottom: vs(170),
    width: s(320),
    height: vs(50),
    backgroundColor: Colors.primary,
    borderRadius: s(15),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 3,
  },
  feedbackButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: s(16),
    color: Colors.white,
    textAlign: "center",
  },
  // Back to Home Button
  homeButton: {
    position: "absolute",
    bottom: vs(100),
    width: s(320),
    height: vs(50),
    backgroundColor: "rgba(217, 217, 217, 0.5)",
    borderRadius: s(15),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 3,
  },
  homeButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: s(16),
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
  },
  // Later Button
  laterButton: {
    position: "absolute",
    bottom: vs(30),
    width: s(320),
    height: vs(50),
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: s(15),
    justifyContent: "center",
    alignItems: "center",
  },
  laterButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: "600",
    fontSize: s(16),
    color: Colors.primary,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
