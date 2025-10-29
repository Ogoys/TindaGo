/**
 * Cart API
 *
 * Firebase operations for shopping cart data
 */

import { ref, get, set, remove, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import type { Cart, CartItem } from '@/models';

/**
 * Fetch user's cart
 */
export async function fetchCart(userId: string): Promise<Cart | null> {
  try {
    const cartRef = ref(database, `carts/${userId}`);
    const snapshot = await get(cartRef);

    if (snapshot.exists()) {
      return snapshot.val() as Cart;
    }
    return null;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

/**
 * Check if cart has items from a different store
 * Returns null if cart is empty or same store, returns store info if different store
 */
export async function checkCartStore(userId: string, newStoreId: string): Promise<{ storeId: string; storeName: string } | null> {
  try {
    const cartRef = ref(database, `carts/${userId}`);
    const snapshot = await get(cartRef);

    if (!snapshot.exists()) {
      // Cart is empty
      return null;
    }

    const cart = snapshot.val();
    const currentStoreId = cart.storeId;

    // If cart has items from a different store
    if (currentStoreId && currentStoreId !== newStoreId) {
      return {
        storeId: currentStoreId,
        storeName: cart.storeName || 'Unknown Store'
      };
    }

    // Cart is empty or same store
    return null;
  } catch (error) {
    console.error('Error checking cart store:', error);
    return null;
  }
}

/**
 * Add item to cart (basic version without store validation)
 * Use addToCartWithStoreValidation for UI interactions
 */
export async function addToCart(userId: string, item: CartItem): Promise<boolean> {
  try {
    const cartItemRef = ref(database, `carts/${userId}/items/${item.productId}`);
    await set(cartItemRef, item);

    // Update cart metadata (including store info)
    await updateCartMetadata(userId, item.storeId, item.storeName);
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
}

/**
 * Add item to cart with store validation
 * Returns result indicating if cart was replaced or needs confirmation
 */
export async function addToCartWithValidation(
  userId: string,
  item: CartItem,
  forceReplace: boolean = false
): Promise<{
  success: boolean;
  needsConfirmation: boolean;
  currentStore?: { storeId: string; storeName: string };
  newStore?: { storeId: string; storeName: string };
}> {
  try {
    // Check if cart has items from a different store
    const differentStore = await checkCartStore(userId, item.storeId);

    if (differentStore && !forceReplace) {
      // Cart has items from different store, need confirmation
      return {
        success: false,
        needsConfirmation: true,
        currentStore: differentStore,
        newStore: { storeId: item.storeId, storeName: item.storeName }
      };
    }

    // If forceReplace is true and different store exists, clear the cart first
    if (differentStore && forceReplace) {
      await clearCart(userId);
    }

    // Add item to cart
    const success = await addToCart(userId, item);

    return {
      success,
      needsConfirmation: false
    };
  } catch (error) {
    console.error('Error in addToCartWithValidation:', error);
    return {
      success: false,
      needsConfirmation: false
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(userId: string, productId: string): Promise<boolean> {
  try {
    const cartItemRef = ref(database, `carts/${userId}/items/${productId}`);
    await remove(cartItemRef);

    // Update cart metadata
    await updateCartMetadata(userId);
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return false;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantity(userId: string, productId: string, quantity: number): Promise<boolean> {
  try {
    const cartItemRef = ref(database, `carts/${userId}/items/${productId}`);
    await update(cartItemRef, {
      quantity,
      subtotal: quantity * (await get(cartItemRef)).val().price,
    });

    // Update cart metadata
    await updateCartMetadata(userId);
    return true;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return false;
  }
}

/**
 * Clear cart
 */
export async function clearCart(userId: string): Promise<boolean> {
  try {
    const cartRef = ref(database, `carts/${userId}`);
    await remove(cartRef);
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
}

/**
 * Cleanup mixed-store cart items
 * Removes items from other stores, keeping only items from the primary store
 * Primary store is determined by: store with most items
 *
 * Returns the store that was kept and number of items removed
 */
export async function cleanupMixedStoreCart(userId: string): Promise<{
  success: boolean;
  hadMixedStores: boolean;
  keptStore?: { storeId: string; storeName: string };
  itemsRemoved?: number;
}> {
  try {
    const cartRef = ref(database, `carts/${userId}`);
    const snapshot = await get(cartRef);

    if (!snapshot.exists()) {
      return { success: true, hadMixedStores: false };
    }

    const cart = snapshot.val();
    const items = cart.items;

    if (!items) {
      return { success: true, hadMixedStores: false };
    }

    // Group items by store
    const storeGroups: { [storeId: string]: { items: CartItem[]; storeName: string } } = {};

    Object.values(items).forEach((item: any) => {
      const storeId = item.storeId;
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = {
          items: [],
          storeName: item.storeName
        };
      }
      storeGroups[storeId].items.push(item);
    });

    const storeIds = Object.keys(storeGroups);

    // If only one store, no cleanup needed
    if (storeIds.length <= 1) {
      return { success: true, hadMixedStores: false };
    }

    // Multiple stores detected - keep store with most items
    let primaryStoreId = storeIds[0];
    let maxItems = storeGroups[storeIds[0]].items.length;

    storeIds.forEach(storeId => {
      if (storeGroups[storeId].items.length > maxItems) {
        maxItems = storeGroups[storeId].items.length;
        primaryStoreId = storeId;
      }
    });

    const primaryStore = storeGroups[primaryStoreId];
    let itemsRemoved = 0;

    // Remove items from other stores
    for (const storeId of storeIds) {
      if (storeId !== primaryStoreId) {
        const itemsToRemove = storeGroups[storeId].items;
        for (const item of itemsToRemove) {
          await removeFromCart(userId, item.productId);
          itemsRemoved++;
        }
      }
    }

    console.log(`Mixed-store cart cleanup: Kept ${primaryStore.storeName}, removed ${itemsRemoved} items from other stores`);

    return {
      success: true,
      hadMixedStores: true,
      keptStore: {
        storeId: primaryStoreId,
        storeName: primaryStore.storeName
      },
      itemsRemoved
    };
  } catch (error) {
    console.error('Error cleaning up mixed-store cart:', error);
    return { success: false, hadMixedStores: false };
  }
}

/**
 * Update cart metadata (subtotal, total, itemCount, storeId, storeName)
 */
async function updateCartMetadata(userId: string, storeId?: string, storeName?: string): Promise<void> {
  try {
    const cartItemsRef = ref(database, `carts/${userId}/items`);
    const snapshot = await get(cartItemsRef);

    if (snapshot.exists()) {
      const items = Object.values(snapshot.val()) as CartItem[];
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      // Get store info from items if not provided
      const finalStoreId = storeId || (items.length > 0 ? items[0].storeId : undefined);
      const finalStoreName = storeName || (items.length > 0 ? items[0].storeName : undefined);

      const cartRef = ref(database, `carts/${userId}`);
      await update(cartRef, {
        storeId: finalStoreId,
        storeName: finalStoreName,
        subtotal,
        total: subtotal,
        itemCount,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Cart is empty, clear store info
      const cartRef = ref(database, `carts/${userId}`);
      await update(cartRef, {
        storeId: null,
        storeName: null,
        subtotal: 0,
        total: 0,
        itemCount: 0,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error updating cart metadata:', error);
  }
}
