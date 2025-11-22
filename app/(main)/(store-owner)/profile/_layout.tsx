import { Stack } from "expo-router";

/**
 * STORE OWNER PROFILE LAYOUT
 *
 * Nested Stack navigation for Store Owner profile section
 * Routes:
 * - index: Main profile screen with settings menu
 * - store-product: Product listing and management (legacy - moved to inventory)
 * - supplier-dashboard: Supplier management dashboard
 * - supplier-details: Individual supplier details and purchase history
 * - order-supplies: Order supplies from a supplier
 * - add-supplier: Add new supplier
 * - purchase-payment: Payment method selection for purchase orders
 * - purchase-invoice: Invoice/receipt for completed purchase orders
 * - debt-records: Customer debt records management
 * - new-debt: Create new debt for customer
 * - store-debt-details: View individual debt details
 * - debt-settings: Configure debt limits and conditions
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
      <Stack.Screen name="supplier-dashboard" />
      <Stack.Screen name="supplier-details" />
      <Stack.Screen name="order-supplies" />
      <Stack.Screen name="add-supplier" />
      <Stack.Screen name="purchase-order-history" />
      <Stack.Screen name="record-purchase-order" />
      <Stack.Screen name="purchase-payment" />
      <Stack.Screen name="purchase-invoice" />
      <Stack.Screen name="debt-records" />
      <Stack.Screen name="new-debt" />
      <Stack.Screen name="store-debt-details" />
      <Stack.Screen name="debt-settings" />
    </Stack>
  );
}
