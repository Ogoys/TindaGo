/**
 * Orders API
 *
 * Firebase operations for order data
 */

import { ref, get, set, update, push, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '@/lib/firebase';
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

    const order: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date(),
      updatedAt: new Date(),
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
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    await update(orderRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}
