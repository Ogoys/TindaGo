/**
 * Toast Notification Component
 *
 * Shows temporary notification messages (success, error, info)
 * Auto-dismisses after 3 seconds
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { s, vs } from '../../constants/responsive';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  onDismiss,
  duration = 3000,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        // Animate out
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, opacity, translateY, duration, onDismiss]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.primary;
      case 'error':
        return '#FF3B30';
      case 'info':
        return '#007AFF';
      default:
        return Colors.primary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: vs(60),
    left: s(20),
    right: s(20),
    borderRadius: s(12),
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: s(18),
    color: Colors.white,
    marginRight: s(10),
    fontWeight: '600',
  },
  message: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: s(14),
    fontWeight: '500',
    color: Colors.white,
    lineHeight: s(18),
  },
});
