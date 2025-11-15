/**
 * REVIEW SUCCESS MODAL - Pixel-Perfect Figma Implementation
 * 
 * Figma: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1439-184&m=dev
 * Baseline: 440x956
 * 
 * EXACT SPECIFICATIONS:
 * - Modal: 400x500 white card, radius 20, shadow
 * - Success icon: Checkmark/star animation at top
 * - Title: "Thank you for your feedback!"
 * - Message: "Your review helps us improve our service"
 * - Button: "Back to Home" (320x50, green, radius 15)
 * - Auto-dismiss after 3 seconds OR manual tap
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { s, vs } from '../../constants/responsive';

interface ReviewSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  autoDismiss?: boolean; // Auto-dismiss after 3 seconds
}

export function ReviewSuccessModal({
  visible,
  onClose,
  autoDismiss = true,
}: ReviewSuccessModalProps) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const starScale = useRef(new Animated.Value(0)).current;

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
        Animated.spring(starScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds
      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleBackToHome();
        }, 3000);
        return () => clearTimeout(timer);
      }
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
        Animated.timing(starScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, starScale, autoDismiss]);

  const handleBackToHome = () => {
    onClose();
    // Small delay for smooth transition
    setTimeout(() => {
      router.push('/(main)/(customer)/home');
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleBackToHome}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleBackToHome}>
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
              {/* Success Icon - Figma: Top center, animated */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: starScale }] },
                ]}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="checkmark-circle" size={s(120)} color="#3BB77E" />
                </View>
                {/* Star decoration */}
                <View style={styles.starDecoration}>
                  <Ionicons name="star" size={s(32)} color="#FFB800" />
                </View>
              </Animated.View>

              {/* Message Container - Figma: Center, below icon */}
              <View style={styles.messageContainer}>
                <Text style={styles.titleText}>
                  Thank you for{'\n'}your feedback!
                </Text>
                <Text style={styles.descriptionText}>
                  Your review helps us improve{'\n'}our service
                </Text>
              </View>

              {/* Back to Home Button - Figma: Bottom, 320x50, green */}
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
  // Backdrop
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Container - Figma: 400x500
  modalContainer: {
    width: s(400),
    height: vs(500),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Content - Figma: White card with shadow
  modalContent: {
    width: s(400),
    height: vs(500),
    backgroundColor: '#FFFFFF',
    borderRadius: s(20),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 8,
    position: 'relative',
    alignItems: 'center',
    paddingTop: vs(50),
  },

  // Success Icon Container - Figma: Top center with animation
  iconContainer: {
    position: 'relative',
    width: s(180),
    height: s(180),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(30),
  },

  iconCircle: {
    width: s(120),
    height: s(120),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Star decoration - Animated sparkle
  starDecoration: {
    position: 'absolute',
    top: s(10),
    right: s(10),
  },

  // Message Container - Figma: Center text alignment
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: s(40),
    marginBottom: vs(50),
  },

  // Title Text - Figma: 22px, weight 600, dark gray
  titleText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: s(22),
    lineHeight: s(22) * 1.3,
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: vs(12),
  },

  // Description Text - Figma: 14px, weight 400, light gray
  descriptionText: {
    fontFamily: Fonts.primary,
    fontWeight: '400',
    fontSize: s(14),
    lineHeight: s(14) * 1.5,
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
  },

  // Back to Home Button - Figma: 320x50, green, radius 15
  homeButton: {
    position: 'absolute',
    bottom: vs(40),
    width: s(320),
    height: vs(50),
    backgroundColor: '#3BB77E',
    borderRadius: s(15),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },

  homeButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: '600',
    fontSize: s(16),
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
