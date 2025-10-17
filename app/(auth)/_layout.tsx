import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="verify-email-code" />
      <Stack.Screen name="verify-phone" />
      <Stack.Screen name="phone-verification-code" />
      <Stack.Screen name="verify-email-store-owner" />
      <Stack.Screen name="complete-phone-registration" />
      <Stack.Screen name="(store-owner)" />
      <Stack.Screen name="signin" />
    </Stack>
  );
}