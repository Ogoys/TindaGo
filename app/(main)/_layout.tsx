import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useUser } from '../../src/contexts/UserContext';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs } from '../../src/constants/responsive';
import { getSelectedStoreId } from '../../src/lib/storage/selectedStore';

export default function MainLayout() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    console.log('🔍 [MainLayout] useEffect triggered - isLoading:', isLoading, 'user:', user ? user.email : 'null');
    // REMOVED AUTO-REDIRECT: Let navigation flow naturally
    // The main layout should NOT force redirects
    // Each screen handles its own navigation
    if (!isLoading && !user) {
      // Only redirect to auth if no user at all
      console.log('⚠️ [MainLayout] No user found, redirecting to onboarding');
      router.replace('/(auth)/onboarding');
    } else if (!isLoading && user) {
      console.log('✅ [MainLayout] User exists, staying in main layout');
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