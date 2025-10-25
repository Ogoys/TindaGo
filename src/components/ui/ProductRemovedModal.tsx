/**
 * Product Removed Modal
 *
 * Professional modal to notify users when products are auto-removed from cart
 * due to availability changes
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { s, vs, ms } from '../../constants/responsive';

interface ProductRemovedModalProps {
  visible: boolean;
  productName: string;
  productImage?: string;
  onClose: () => void;
  reason: 'out_of_stock' | 'deleted';
}

export const ProductRemovedModal: React.FC<ProductRemovedModalProps> = ({
  visible,
  productName,
  productImage,
  onClose,
  reason,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
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
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getMessage = () => {
    if (reason === 'deleted') {
      return 'This product is no longer available and has been removed from your cart.';
    }
    return 'This product is currently out of stock and has been removed from your cart.';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon Header */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>
          </View>

          {/* Product Image (if available) */}
          {productImage && (
            <View style={styles.productImageContainer}>
              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.imageBadge}>
                <Text style={styles.badgeText}>Removed</Text>
              </View>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>Product Unavailable</Text>

          {/* Product Name */}
          <View style={styles.productNameContainer}>
            <Text style={styles.productName} numberOfLines={2}>
              "{productName}"
            </Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>{getMessage()}</Text>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>

          {/* Alternative: Continue Shopping */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },

  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: s(24),
    padding: s(24),
    width: '100%',
    maxWidth: s(380),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  iconContainer: {
    marginBottom: vs(16),
  },

  iconCircle: {
    width: s(80),
    height: s(80),
    borderRadius: s(40),
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconText: {
    fontSize: ms(40),
  },

  productImageContainer: {
    position: 'relative',
    marginBottom: vs(16),
  },

  productImage: {
    width: s(120),
    height: s(120),
    borderRadius: s(12),
    opacity: 0.6,
  },

  imageBadge: {
    position: 'absolute',
    top: s(8),
    right: s(8),
    backgroundColor: '#FF4444', // Red for removed/unavailable
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: s(12),
  },

  badgeText: {
    fontFamily: Fonts.primary,
    fontSize: ms(10),
    fontWeight: '600',
    color: Colors.white,
  },

  title: {
    fontFamily: Fonts.primary,
    fontSize: ms(24),
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: vs(12),
    textAlign: 'center',
  },

  productNameContainer: {
    backgroundColor: 'rgba(59, 183, 126, 0.05)',
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: s(8),
    marginBottom: vs(16),
    maxWidth: '100%',
  },

  productName: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },

  message: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: vs(20),
    marginBottom: vs(24),
    paddingHorizontal: s(8),
  },

  button: {
    backgroundColor: Colors.primary,
    paddingVertical: vs(14),
    paddingHorizontal: s(40),
    borderRadius: s(12),
    width: '100%',
    marginBottom: vs(12),
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },

  secondaryButton: {
    paddingVertical: vs(12),
    paddingHorizontal: s(20),
  },

  secondaryButtonText: {
    fontFamily: Fonts.primary,
    fontSize: ms(14),
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'center',
  },
});
