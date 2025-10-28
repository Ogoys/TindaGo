import { Stack } from "expo-router";

/**
 * STORE OWNER ORDERS LAYOUT
 *
 * Nested Stack navigation for Store Owner orders section
 * Routes:
 * - index: Main orders screen with filter tabs (Pending, Preparing, Ready, Pickup, Cancel)
 * - details: Dynamic order details screen that shows different actions based on order status
 *   - pending: Accept/Reject buttons
 *   - preparing: Ready to Pickup button
 *   - ready: Order Pickup button
 *   - picked_up/completed: Read-only, no buttons
 *   - cancelled: Shows cancellation reason
 */

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
    </Stack>
  );
}
