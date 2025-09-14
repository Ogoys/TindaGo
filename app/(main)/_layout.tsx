import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useUser } from '../../src/contexts/UserContext';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs } from '../../src/constants/responsive';

export default function MainLayout() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // No user logged in, redirect to auth
        router.replace('/(auth)/onboarding');
        return;
      }

      if (!user.role) {
        // User logged in but no role selected
        router.replace('/role-selection');
        return;
      }

      // User has role, redirect to appropriate home
      if (user.role === 'customer') {
        router.replace('/(main)/(customer)/home');
      } else {
        router.replace('/(main)/(store-owner)/home');
      }
    }
  }, [user, isLoading]);

  // Show loading screen while determining user state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading TindaGo...</Text>
      </View>
    );
  }

  // This layout now routes to role-specific tab navigators
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(store-owner)" />
      <Stack.Screen name="shared" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: s(16),
    color: Colors.textSecondary,
    marginTop: vs(16),
  },
});