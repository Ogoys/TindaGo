# Order Details Screen - Navigation Guide

## How to Navigate to Order Details

### From Orders Screen (To Be Created)
```typescript
import { router } from "expo-router";

// Navigate to order details with order ID
router.push({
  pathname: "/(main)/(customer)/order-details",
  params: {
    orderId: "123456789"
  }
});
```

### From Product Details or Cart
```typescript
// After order is placed
router.push("/(main)/(customer)/order-details");
```

### Testing the Screen Directly
For development/testing, you can navigate directly:

```typescript
// From anywhere in the app
router.push("/(main)/(customer)/order-details");
```

## Expected Route Parameters

### Current Implementation (Static)
The screen currently shows hardcoded data:
- Order ID: "123456789"
- Item Count: 12
- Sub Total: ₱ 500.25
- Service Fee: ₱ 50.25
- Discount: ₱ 50.25
- Grand Total: ₱ 50.25

### Future Dynamic Implementation
Update the component to accept route params:

```typescript
// order-details.tsx
import { useLocalSearchParams } from "expo-router";

interface OrderDetailsParams {
  orderId: string;
  itemCount?: string;
  subTotal?: string;
  serviceFee?: string;
  discount?: string;
  grandTotal?: string;
}

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams<OrderDetailsParams>();

  const orderId = params.orderId || "123456789";
  const itemCount = params.itemCount || "12";
  const subTotal = params.subTotal || "₱ 500.25";
  // ... etc

  return (
    // ... render with dynamic data
  );
}
```

## Navigation Flow

### Complete Customer Journey
```
Home Screen
  ↓ (Browse products)
Product Details
  ↓ (Add to cart)
Cart Screen
  ↓ (Checkout)
Payment Screen
  ↓ (Confirm order)
Order Confirmation
  ↓ (View order)
Order Details ← YOU ARE HERE
  ↓ (Back navigation)
Orders List
```

### Alternative Entry Points
1. **From Orders List**: Tap any order to view details
2. **From Notifications**: Push notification opens specific order
3. **From Profile**: "My Orders" → Order Details
4. **From Order Confirmation**: Immediately after placing order

## Back Navigation

The screen uses `router.back()` which will:
- Return to the previous screen in the navigation stack
- Typically goes back to Orders List
- If accessed directly, may go to Home screen

### Custom Back Navigation
If you need to navigate to a specific screen:

```typescript
// Replace router.back() with:
router.push("/(main)/(customer)/orders"); // Go to orders list
// or
router.replace("/(main)/(customer)/home"); // Replace with home
```

## Deep Linking Support

### URL Pattern
```
tindago://order-details?orderId=123456789
```

### Configuration (app.json)
```json
{
  "expo": {
    "scheme": "tindago",
    "web": {
      "bundler": "metro"
    }
  }
}
```

### Handling Deep Links
```typescript
// In _layout.tsx or app entry
import * as Linking from 'expo-linking';

const url = Linking.useURL();

useEffect(() => {
  if (url) {
    const { hostname, queryParams } = Linking.parse(url);

    if (hostname === 'order-details') {
      router.push({
        pathname: "/(main)/(customer)/order-details",
        params: queryParams
      });
    }
  }
}, [url]);
```

## State Management with Order Data

### Option 1: Route Params (Current)
```typescript
router.push({
  pathname: "/(main)/(customer)/order-details",
  params: {
    orderId: order.id,
    itemCount: order.items.length.toString(),
    subTotal: order.subTotal.toString(),
    // ... other params
  }
});
```

**Pros**: Simple, no state management needed
**Cons**: Limited data, URL length restrictions

### Option 2: Context/Global State
```typescript
// In OrderContext
const { setCurrentOrder } = useOrderContext();
setCurrentOrder(orderData);
router.push("/(main)/(customer)/order-details");

// In order-details.tsx
const { currentOrder } = useOrderContext();
```

**Pros**: Can pass complex objects, unlimited data
**Cons**: Requires context setup, state management overhead

### Option 3: Firebase Real-time (Recommended)
```typescript
// Just pass the order ID
router.push({
  pathname: "/(main)/(customer)/order-details",
  params: { orderId: order.id }
});

// In order-details.tsx
const { orderId } = useLocalSearchParams();
const orderData = useFirebaseOrder(orderId); // Custom hook
```

**Pros**: Always up-to-date, handles real-time updates
**Cons**: Requires network, Firebase setup

## Example: Complete Orders List Integration

```typescript
// app/(main)/(customer)/orders.tsx

import React from "react";
import { FlatList, TouchableOpacity, Text, View } from "react-native";
import { router } from "expo-router";

interface Order {
  id: string;
  date: string;
  total: string;
  status: string;
}

export default function OrdersScreen() {
  const orders: Order[] = [
    { id: "123456789", date: "Oct 10, 2025", total: "₱ 50.25", status: "Delivered" },
    { id: "987654321", date: "Oct 9, 2025", total: "₱ 120.50", status: "Processing" },
  ];

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: "/(main)/(customer)/order-details",
      params: { orderId: order.id }
    });
  };

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleOrderPress(item)}>
          <View>
            <Text>Order #{item.id}</Text>
            <Text>{item.date}</Text>
            <Text>{item.total}</Text>
            <Text>{item.status}</Text>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
```

## Notification Integration

### Push Notification Handler
```typescript
// In NotificationService
import * as Notifications from 'expo-notifications';
import { router } from "expo-router";

Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;

  if (data.type === 'order_update') {
    router.push({
      pathname: "/(main)/(customer)/order-details",
      params: { orderId: data.orderId }
    });
  }
});
```

### Sending Order Update Notification
```typescript
// When order status changes
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Order Update",
    body: "Your order is ready for pickup!",
    data: {
      type: 'order_update',
      orderId: '123456789'
    }
  },
  trigger: null, // Send immediately
});
```

## Testing Navigation

### Manual Testing
1. Run the app: `npm start`
2. Navigate to the screen from anywhere:
   ```typescript
   // In any screen, add a test button:
   <TouchableOpacity
     onPress={() => router.push("/(main)/(customer)/order-details")}
   >
     <Text>Test Order Details</Text>
   </TouchableOpacity>
   ```

### Automated Testing
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import OrdersScreen from '../orders';

test('navigates to order details on press', () => {
  const { getByText } = render(<OrdersScreen />);
  const orderItem = getByText('Order #123456789');

  fireEvent.press(orderItem);

  // Assert navigation occurred
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/(main)/(customer)/order-details",
    params: { orderId: "123456789" }
  });
});
```

## Common Issues & Solutions

### Issue: Screen Not Found
**Error**: "Unable to resolve screen..."
**Solution**: Ensure file exists at `app/(main)/(customer)/order-details.tsx`

### Issue: Params Not Received
**Error**: `params` is undefined
**Solution**: Use `useLocalSearchParams()` hook from expo-router

### Issue: Back Button Doesn't Work
**Error**: Nothing happens on back press
**Solution**: Ensure `router` is imported from `expo-router`, not `next/router`

### Issue: Screen Flashes White
**Error**: White screen before content loads
**Solution**: Add background color to SafeAreaView and container

## Related Documentation
- [Expo Router Navigation](https://docs.expo.dev/router/navigating-pages/)
- [React Navigation Params](https://reactnavigation.org/docs/params/)
- [Deep Linking Guide](https://docs.expo.dev/guides/linking/)
