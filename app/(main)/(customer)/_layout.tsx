import { Stack } from "expo-router";

/**
 * CUSTOMER LAYOUT
 *
 * Using Stack instead of Tabs because navigation is handled by
 * the BottomNavigation component in home.tsx
 */

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="category" />
      <Stack.Screen name="see-more" />
    </Stack>
  );
}
