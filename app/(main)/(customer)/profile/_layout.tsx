import { Stack } from "expo-router";

/**
 * CUSTOMER PROFILE LAYOUT
 *
 * Nested Stack navigation for Customer profile section
 * Routes:
 * - index: Main profile screen with settings menu (Figma design)
 * - account-settings: Account information and preferences (future)
 * - e-wallet: E-wallet details and transactions (future)
 * - help: Help and support center (future)
 * - terms-privacy: Terms of service and privacy policy (future)
 */

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      {/* Future sub-screens */}
      {/* <Stack.Screen name="account-settings" /> */}
      {/* <Stack.Screen name="e-wallet" /> */}
      {/* <Stack.Screen name="help" /> */}
      {/* <Stack.Screen name="terms-privacy" /> */}
    </Stack>
  );
}
