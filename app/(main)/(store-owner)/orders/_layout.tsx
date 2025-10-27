import { Stack } from "expo-router";

/**
 * STORE OWNER ORDERS LAYOUT
 *
 * Nested Stack navigation for Store Owner orders section
 * Routes:
 * - index: Main orders screen with filter tabs (Pending, Preparing, Ready, Pickup, Cancel)
 * - pending: Pending order details with Accept/Reject actions
 * - preparing: Preparing order details with Ready to Pickup button
 * - ready: Ready for pickup order details (TODO)
 * - pickup: Completed pickup order details (TODO)
 * - cancelled: Cancelled order details (TODO)
 */

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="pending" />
      <Stack.Screen name="preparing" />
    </Stack>
  );
}
