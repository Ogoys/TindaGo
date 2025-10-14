/**
 * Cart API
 *
 * Firebase operations for shopping cart data
 */

import { ref, get, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
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
 * Add item to cart
 */
export async function addToCart(userId: string, item: CartItem): Promise<boolean> {
  try {
    const cartItemRef = ref(database, `carts/${userId}/items/${item.productId}`);
    await set(cartItemRef, item);

    // Update cart metadata
    await updateCartMetadata(userId);
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
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
 * Update cart metadata (subtotal, total, itemCount)
 */
async function updateCartMetadata(userId: string): Promise<void> {
  try {
    const cartItemsRef = ref(database, `carts/${userId}/items`);
    const snapshot = await get(cartItemsRef);

    if (snapshot.exists()) {
      const items = Object.values(snapshot.val()) as CartItem[];
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      const cartRef = ref(database, `carts/${userId}`);
      await update(cartRef, {
        subtotal,
        total: subtotal,
        itemCount,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error updating cart metadata:', error);
  }
}
