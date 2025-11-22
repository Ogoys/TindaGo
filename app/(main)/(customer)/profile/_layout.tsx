import { Stack } from "expo-router";

/**
 * CUSTOMER PROFILE LAYOUT
 *
 * Nested Stack navigation for Customer profile section
 * Routes:
 * - index: Main profile screen with settings menu (Figma design)
 * - account-settings: Account information and preferences
 * - order-history: Order history list
 * - order-details-history: Individual order details
 * - return-history: Return requests history
 * - return-details: Individual return details
 * - return-request: Create new return request
 * - debt-history: Debt payment history
 * - debt-details: Individual debt details
 * - debt-invoice: Invoice for paid debts
 * - help-center: Help and support center
 * - help-support: Help support details
 * - terms-privacy: Terms of service and privacy policy
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
      <Stack.Screen name="account-settings" />
      <Stack.Screen name="order-history" />
      <Stack.Screen name="order-details-history" />
      <Stack.Screen name="return-history" />
      <Stack.Screen name="return-details" />
      <Stack.Screen name="return-request" />
      <Stack.Screen name="debt-history" />
      <Stack.Screen name="debt-details" />
      <Stack.Screen name="debt-invoice" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="terms-privacy" />
    </Stack>
  );
}
