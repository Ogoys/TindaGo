import { Stack } from "expo-router";

/**
 * STORE OWNER WALLET LAYOUT
 *
 * Nested Stack navigation for Store Owner wallet section
 * Routes:
 * - index: Main wallet screen (earnings summary, request payout)
 * - earnings: Transaction history and earnings breakdown
 * - transaction: Individual transaction details
 * - payout-requests: Create new payout/withdrawal requests
 * - payout-history: View past payout records
 */

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="transaction" />
      <Stack.Screen name="payout-requests" />
      <Stack.Screen name="payout-history" />
    </Stack>
  );
}
