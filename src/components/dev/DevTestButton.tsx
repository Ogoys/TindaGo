import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

/**
 * DEV TEST BUTTON
 * 
 * Floating button for development/testing purposes
 * Remove this component in production builds
 */

export const DevTestButton: React.FC = () => {
  // Only show in development mode
  if (__DEV__ === false) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => router.push('/(main)/(customer)/track-store?test=true' as any)}
    >
      <Text style={styles.emoji}>🧪</Text>
      <Text style={styles.label}>Test Track Store</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
