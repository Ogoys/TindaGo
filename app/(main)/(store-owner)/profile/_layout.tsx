import { Stack } from "expo-router";

/**
 * STORE OWNER PROFILE LAYOUT
 *
 * Nested Stack navigation for Store Owner profile section
 * Routes:
 * - index: Main profile screen with settings menu
 * - store-product: Product listing and management (legacy - moved to inventory)
 */

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="store-product" />
    </Stack>
  );
}
