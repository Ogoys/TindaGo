/**
 * Orders API
 *
 * Firebase operations for order data
 */

import { ref, get, set, update, push, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import type { Order, OrderStatus } from '@/models';

/**
 * Create a new order
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const ordersRef = ref(database, 'orders');
    const newOrderRef = push(ordersRef);
    const orderId = newOrderRef.key;

    if (!orderId) return null;

    const now = new Date().toISOString();
    const order = {
      ...orderData,
      id: orderId,
      createdAt: now,
      updatedAt: now,
    };

    await set(newOrderRef, order);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

/**
 * Fetch user orders
 */
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const ordersRef = ref(database, 'orders');
    const userOrdersQuery = query(ordersRef, orderByChild('customerId'), equalTo(userId));
    const snapshot = await get(userOrdersQuery);

    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Order[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

/**
 * Fetch store orders (for store owner)
 */
export async function fetchStoreOrders(storeId: string): Promise<Order[]> {
  try {
    const ordersRef = ref(database, 'orders');
    const storeOrdersQuery = query(ordersRef, orderByChild('storeId'), equalTo(storeId));
    const snapshot = await get(storeOrdersQuery);

    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Order[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching store orders:', error);
    return [];
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    const updates: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Add timestamp for specific status changes
    if (status === 'picked_up' || status === 'completed') {
      updates.completedAt = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelledAt = new Date().toISOString();
    }

    await update(orderRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

/**
 * Cancel order with reason
 */
export async function cancelOrder(orderId: string, reason: string, cancelledBy: 'customer' | 'store'): Promise<boolean> {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    await update(orderRef, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledBy,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return false;
  }
}
