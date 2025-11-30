import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { useUser } from '../../src/contexts/UserContext';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { Fonts } from '../../src/constants/Fonts';
import { s, vs } from '../../src/constants/responsive';
import { getSelectedStoreId } from '../../src/lib/storage/selectedStore';
import { auth } from '../../FirebaseConfig';

export default function MainLayout() {
  const { user, isLoading } = useUser();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log('🔍 [MainLayout] useEffect triggered - isLoading:', isLoading, 'user:', user ? user.email : 'null');
    
    // Wait for context to finish loading
    if (isLoading) return;

    // Check both UserContext and Firebase Auth
    const firebaseUser = auth.currentUser;
    console.log('🔥 [MainLayout] Firebase auth user:', firebaseUser ? firebaseUser.email : 'null');

    // Only redirect if BOTH context and Firebase auth have no user
    if (!user && !firebaseUser) {
      console.log('⚠️ [MainLayout] No user in context OR Firebase auth, redirecting to onboarding');
      router.replace('/(auth)/onboarding');
    } else {
      console.log('✅ [MainLayout] User authenticated (Context:', !!user, 'Firebase:', !!firebaseUser, ')');
    }
    
    setAuthChecked(true);
  }, [user, isLoading]);

  // Show loading screen while determining user state
  if (isLoading || !authChecked) {
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