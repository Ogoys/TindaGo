# Single Store Cart Implementation Guide

## Overview

TindaGo now enforces a **single-store per cart** rule. Users can only add products from ONE store at a time. If they try to add products from a different store, they'll be prompted to replace their current cart.

## Why This Change?

- **Pickup-only orders**: Each order is picked up from a single store
- **Clear user experience**: Prevents confusion about multiple store orders
- **Industry standard**: Same pattern as Uber Eats, DoorDash, Grab Food

## How It Works

### User Flow:

1. User adds product from **Store A** → Added to cart ✅
2. User adds another product from **Store A** → Added to cart ✅
3. User tries to add product from **Store B** → Modal appears:
   - **"Replace Cart Items?"**
   - "Your cart contains items from Store A. Do you want to replace them with items from Store B?"
   - Buttons: **Cancel** | **Replace Cart**
4. If **Replace**: Cart is cleared and new item added
5. If **Cancel**: Current cart stays, new item not added

## Implementation

### 1. Import Required Functions

```typescript
import { addToCartWithValidation } from '@/api/cart';
import { CartReplaceModal } from '@/components/ui';
```

### 2. Add State Management

```typescript
const { user } = useUser();
const [showReplaceModal, setShowReplaceModal] = useState(false);
const [pendingCartItem, setPendingCartItem] = useState<CartItem | null>(null);
const [replaceModalData, setReplaceModalData] = useState<{
  currentStore: string;
  newStore: string;
}>({ currentStore: '', newStore: '' });
```

### 3. Create Add to Cart Handler

```typescript
const handleAddToCart = async (product: Product, quantity: number = 1) => {
  if (!user) {
    Alert.alert('Error', 'Please login to add items to cart');
    return;
  }

  // Create cart item
  const cartItem: CartItem = {
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    storeId: product.storeId,
    storeName: product.storeName,
    quantity: quantity,
    price: product.price,
    weight: product.weight,
    unit: product.unit,
    stock: product.stock,
    subtotal: product.price * quantity,
    isAvailable: true,
  };

  // Try to add with validation
  const result = await addToCartWithValidation(user.id, cartItem, false);

  if (result.needsConfirmation && result.currentStore && result.newStore) {
    // Show replace cart modal
    setPendingCartItem(cartItem);
    setReplaceModalData({
      currentStore: result.currentStore.storeName,
      newStore: result.newStore.storeName,
    });
    setShowReplaceModal(true);
  } else if (result.success) {
    // Successfully added
    Alert.alert('Success', 'Item added to cart!');
    // Or show toast notification
  } else {
    Alert.alert('Error', 'Failed to add item to cart');
  }
};
```

### 4. Handle Cart Replacement

```typescript
const handleReplaceCart = async () => {
  if (!user || !pendingCartItem) return;

  setShowReplaceModal(false);

  // Add item with forceReplace=true
  const result = await addToCartWithValidation(user.id, pendingCartItem, true);

  if (result.success) {
    Alert.alert('Success', 'Cart replaced! Item added.');
    // Or show toast
  } else {
    Alert.alert('Error', 'Failed to replace cart');
  }

  setPendingCartItem(null);
};

const handleCancelReplace = () => {
  setShowReplaceModal(false);
  setPendingCartItem(null);
};
```

### 5. Add Modal to JSX

```typescript
return (
  <View>
    {/* Your component UI */}

    {/* Cart Replace Modal */}
    <CartReplaceModal
      visible={showReplaceModal}
      currentStore={replaceModalData.currentStore}
      newStore={replaceModalData.newStore}
      onReplace={handleReplaceCart}
      onCancel={handleCancelReplace}
    />
  </View>
);
```

## Complete Example

Here's a complete example for a product details screen:

```typescript
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { addToCartWithValidation } from '@/api/cart';
import { CartReplaceModal } from '@/components/ui';
import type { CartItem } from '@/models';

export default function ProductDetailsScreen({ product }) {
  const { user } = useUser();
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<CartItem | null>(null);
  const [replaceModalData, setReplaceModalData] = useState({
    currentStore: '',
    newStore: '',
  });

  const handleAddToCart = async (quantity: number = 1) => {
    if (!user) {
      Alert.alert('Error', 'Please login to add items to cart');
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      storeId: product.storeId,
      storeName: product.storeName,
      quantity,
      price: product.price,
      weight: product.weight,
      unit: product.unit,
      stock: product.stock,
      subtotal: product.price * quantity,
      isAvailable: true,
    };

    const result = await addToCartWithValidation(user.id, cartItem, false);

    if (result.needsConfirmation && result.currentStore && result.newStore) {
      setPendingCartItem(cartItem);
      setReplaceModalData({
        currentStore: result.currentStore.storeName,
        newStore: result.newStore.storeName,
      });
      setShowReplaceModal(true);
    } else if (result.success) {
      Alert.alert('Success', 'Item added to cart!');
    } else {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleReplaceCart = async () => {
    if (!user || !pendingCartItem) return;

    setShowReplaceModal(false);

    const result = await addToCartWithValidation(user.id, pendingCartItem, true);

    if (result.success) {
      Alert.alert('Success', 'Cart replaced! Item added.');
    } else {
      Alert.alert('Error', 'Failed to replace cart');
    }

    setPendingCartItem(null);
  };

  const handleCancelReplace = () => {
    setShowReplaceModal(false);
    setPendingCartItem(null);
  };

  return (
    <View>
      <Text>{product.name}</Text>
      <Button title="Add to Cart" onPress={() => handleAddToCart(1)} />

      <CartReplaceModal
        visible={showReplaceModal}
        currentStore={replaceModalData.currentStore}
        newStore={replaceModalData.newStore}
        onReplace={handleReplaceCart}
        onCancel={handleCancelReplace}
      />
    </View>
  );
}
```

## API Reference

### `addToCartWithValidation`

```typescript
function addToCartWithValidation(
  userId: string,
  item: CartItem,
  forceReplace: boolean = false
): Promise<{
  success: boolean;
  needsConfirmation: boolean;
  currentStore?: { storeId: string; storeName: string };
  newStore?: { storeId: string; storeName: string };
}>
```

**Parameters:**
- `userId`: User's ID
- `item`: Cart item to add
- `forceReplace`: If true, will clear cart and add item (used after user confirms)

**Returns:**
- `success`: Whether item was added successfully
- `needsConfirmation`: If true, show replace modal
- `currentStore`: Info about current store in cart (if different)
- `newStore`: Info about new store being added (if different)

### `CartReplaceModal`

```typescript
interface CartReplaceModalProps {
  visible: boolean;
  currentStore: string;
  newStore: string;
  onReplace: () => void;
  onCancel: () => void;
}
```

## Database Structure

The cart now stores store information:

```typescript
{
  "carts": {
    "{userId}": {
      "storeId": "store123",
      "storeName": "Golis Sari-Sari Store",
      "subtotal": 150.00,
      "total": 150.00,
      "itemCount": 3,
      "updatedAt": "2025-01-15T10:30:00Z",
      "items": {
        "product1": { /* CartItem */ },
        "product2": { /* CartItem */ }
      }
    }
  }
}
```

## Testing Checklist

- [ ] Add product from Store A → Added successfully
- [ ] Add another product from Store A → Added successfully
- [ ] Try to add product from Store B → Modal appears
- [ ] Click "Cancel" → Cart stays with Store A items
- [ ] Try again → Modal appears again
- [ ] Click "Replace Cart" → Cart cleared, Store B item added
- [ ] Cart badge updates correctly
- [ ] Cart screen shows only Store B items

## Migration Notes

**Existing carts will be automatically cleaned up**. The system includes:
- **Automatic cleanup on cart load**: When cart screen is opened, mixed-store items are automatically cleaned up
- **Smart cleanup logic**: Keeps items from the store with the most items, removes others
- **User notification**: Toast notification informs user about cleanup
- Set storeId/storeName from existing cart items
- New additions will follow single-store rule

### Automatic Cart Cleanup

The cart screen includes automatic cleanup for mixed-store scenarios:

```typescript
import { cleanupMixedStoreCart } from '@/api/cart';

// Automatic cleanup on cart load
useEffect(() => {
  if (!user || cartItems.length === 0) return;

  const performCleanup = async () => {
    const storeIds = [...new Set(cartItems.map(item => item.storeId))];

    if (storeIds.length > 1) {
      const result = await cleanupMixedStoreCart(user.id);

      if (result.success && result.hadMixedStores && result.keptStore) {
        // Show notification
        setToastMessage(
          `Cart cleaned up: Kept items from ${result.keptStore.storeName}.
           ${result.itemsRemoved} items from other stores were removed.`
        );
        setToastType('info');
        setShowToast(true);
      }
    }
  };

  performCleanup();
}, [user, cartItems.length]);
```

### Manual Cleanup API

You can also manually trigger cleanup:

```typescript
import { cleanupMixedStoreCart } from '@/api/cart';

const result = await cleanupMixedStoreCart(userId);

if (result.hadMixedStores) {
  console.log(`Kept store: ${result.keptStore.storeName}`);
  console.log(`Items removed: ${result.itemsRemoved}`);
}
```
