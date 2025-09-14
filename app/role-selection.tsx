import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { s, vs } from '../src/constants/responsive';
import { useUser, UserRole } from '../src/contexts/UserContext';

export default function RoleSelectionScreen() {
  const { setUserRole } = useUser();

  const handleRoleSelection = async (role: UserRole) => {
    await setUserRole(role);

    if (role === 'customer') {
      router.replace('/(main)/(customer)/home');
    } else {
      router.replace('/(main)/(store-owner)/home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you want to use TindaGo
          </Text>
        </View>

        {/* Role Options */}
        <View style={styles.roleOptions}>
          {/* Customer Option */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelection('customer')}
          >
            <View style={styles.roleIconContainer}>
              <View style={[styles.roleIcon, { backgroundColor: Colors.primary }]} />
            </View>
            <Text style={styles.roleTitle}>Customer</Text>
            <Text style={styles.roleDescription}>
              Browse stores, order products, and enjoy convenient shopping
            </Text>
            <View style={styles.roleFeatures}>
              <Text style={styles.featureText}>• Order from local stores</Text>
              <Text style={styles.featureText}>• Track your orders</Text>
              <Text style={styles.featureText}>• Discover new products</Text>
            </View>
          </TouchableOpacity>

          {/* Store Owner Option */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelection('store-owner')}
          >
            <View style={styles.roleIconContainer}>
              <View style={[styles.roleIcon, { backgroundColor: Colors.darkGray }]} />
            </View>
            <Text style={styles.roleTitle}>Store Owner</Text>
            <Text style={styles.roleDescription}>
              Manage your sari-sari store, inventory, and customer orders
            </Text>
            <View style={styles.roleFeatures}>
              <Text style={styles.featureText}>• Manage inventory</Text>
              <Text style={styles.featureText}>• Process orders</Text>
              <Text style={styles.featureText}>• Track sales</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Note */}
        <Text style={styles.bottomNote}>
          You can change your role later in settings
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: s(20),
    paddingTop: vs(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: vs(40),
  },
  title: {
    fontFamily: Fonts.primary,
    fontSize: s(28),
    fontWeight: Fonts.weights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: vs(8),
  },
  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: s(22),
  },
  roleOptions: {
    flex: 1,
    gap: vs(20),
  },
  roleCard: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(24),
    borderWidth: 2,
    borderColor: Colors.lightGray,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.1,
    shadowRadius: s(10),
    elevation: 3,
  },
  roleIconContainer: {
    alignItems: 'center',
    marginBottom: vs(16),
  },
  roleIcon: {
    width: s(60),
    height: s(60),
    borderRadius: s(30),
  },
  roleTitle: {
    fontFamily: Fonts.primary,
    fontSize: s(22),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: vs(8),
  },
  roleDescription: {
    fontFamily: Fonts.primary,
    fontSize: s(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: s(20),
    marginBottom: vs(16),
  },
  roleFeatures: {
    gap: vs(4),
  },
  featureText: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.textSecondary,
    lineHeight: s(18),
  },
  bottomNote: {
    fontFamily: Fonts.primary,
    fontSize: s(12),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: vs(20),
    marginBottom: vs(20),
  },
});