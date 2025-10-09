import { Stack } from "expo-router";

/**
 * CUSTOMER LAYOUT
 *
 * Using Stack instead of Tabs because navigation is handled by
 * the BottomNavigation component in home.tsx
 *
 * Routes:
 * - home: Main customer home screen with BottomNavigation
 * - orders: Order history and tracking
 * - cart: Shopping cart
 * - category: Product categories browsing
 * - see-more: Expanded product listings
 * - profile/: Nested profile section with own layout (Figma designed)
 *   - profile/index: Main profile screen
 *   - profile/account-settings: Account settings (future)
 *   - profile/e-wallet: E-wallet details (future)
 *   - profile/help: Help center (future)
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
      <Stack.Screen name="profile" />
    </Stack>
  );
}
