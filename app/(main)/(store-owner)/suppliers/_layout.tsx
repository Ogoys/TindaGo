import { Stack } from "expo-router";

/**
 * STORE OWNER SUPPLIERS LAYOUT
 *
 * Nested Stack navigation for Store Owner suppliers section
 * Routes:
 * - supplier-dashboard: Supplier management dashboard (index)
 * - supplier-details: Individual supplier details and purchase history
 * - add-supplier: Add new supplier
 * - purchase-order-history: View purchase order history
 * - record-purchase-order: Create/record new purchase orders
 * - purchase-payment: Payment method selection for purchase orders
 * - purchase-invoice: Invoice/receipt for completed purchase orders
 */

export default function SuppliersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="supplier-dashboard" />
      <Stack.Screen name="supplier-details" />
      <Stack.Screen name="add-supplier" />
      <Stack.Screen name="purchase-order-history" />
      <Stack.Screen name="record-purchase-order" />
      <Stack.Screen name="purchase-payment" />
      <Stack.Screen name="purchase-invoice" />
      <Stack.Screen name="purchase-details" />
    </Stack>
  );
}
