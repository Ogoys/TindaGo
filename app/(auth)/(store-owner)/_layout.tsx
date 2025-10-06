import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { Alert } from "react-native";
import { useUser } from "../../../src/contexts/UserContext";

export default function StoreOwnerLayout() {
  const { user, isLoading } = useUser();

  // Role-based protection for entire store-owner route group
  useEffect(() => {
    // Wait for user data to load
    if (isLoading) return;

    // Block customers from accessing any store owner screens
    if (user && user.role !== 'store-owner') {
      console.log('🚫 Access denied: Customer attempted to access store owner routes');
      Alert.alert(
        "Access Denied",
        "This section is only accessible to store owners. Please sign in with a store owner account.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(main)/(customer)/home" as any)
          }
        ]
      );
    }
  }, [user, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="register"
        options={{
          title: "Store Owner Registration",
        }}
      />
    </Stack>
  );
}