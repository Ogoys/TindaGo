/**
 * ORDER CANCELLATION API
 * Handles order cancellation with automatic stock restoration
 */

import { ref, get, update, runTransaction, set } from 'firebase/database';
import { database } from '../../FirebaseConfig';

export interface CancelOrderResult {
  success: boolean;
  message: string;
}

/**
 * Cancel an order and restore stock to inventory
 * @param orderId - Firebase order ID
 * @param userId - Customer user ID (for authorization)
 * @param reason - Cancellation reason
 * @returns Result with success status and message
 */
export async function cancelOrder(
  orderId: string,
  userId: string,
  reason: string
): Promise<CancelOrderResult> {
  try {
    console.log(`[CancelOrder] Starting cancellation for order: ${orderId}`);

    // 1. Get order details
    const orderRef = ref(database, `orders/${orderId}`);
    const orderSnap = await get(orderRef);

    if (!orderSnap.exists()) {
      console.error(`[CancelOrder] Order not found: ${orderId}`);
      return { success: false, message: 'Order not found' };
    }

    const order = orderSnap.val();

    // 2. Validate order can be cancelled
    if (order.customerId !== userId) {
      console.error(`[CancelOrder] Unauthorized cancellation attempt`);
      return { success: false, message: 'Unauthorized' };
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      console.error(`[CancelOrder] Cannot cancel order with status: ${order.status}`);
      return {
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`,
      };
    }

    // 3. Restore stock for each item using Firebase transactions (atomic operation)
    console.log(`[CancelOrder] Restoring stock for ${order.items.length} items`);
    
    const stockRestorePromises = order.items.map((item: any) =>
      runTransaction(ref(database, `products/${item.productId}`), (product) => {
        if (product) {
          const oldQuantity = product.quantity || 0;
          product.quantity = oldQuantity + item.quantity;
          console.log(
            `[CancelOrder] Restored ${item.productName}: ${oldQuantity} → ${product.quantity}`
          );
        }
        return product;
      })
    );

    await Promise.all(stockRestorePromises);

    // 4. Update order status
    const cancelledAt = new Date().toISOString();
    await update(orderRef, {
      status: 'cancelled',
      cancelledAt,
      cancellationReason: reason,
      cancelledBy: 'customer',
      stockRestored: true,
    });

    console.log(`[CancelOrder] Order status updated to cancelled`);

    // 5. Log cancellation for audit trail
    const logRef = ref(database, `orderCancellations/${orderId}`);
    await set(logRef, {
      orderId,
      orderNumber: order.orderNumber,
      customerId: userId,
      customerName: order.customerName,
      storeId: order.storeId,
      storeName: order.storeName,
      cancelledAt,
      reason,
      total: order.total,
      itemsRestored: order.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        quantityRestored: item.quantity,
        pricePerUnit: item.price,
      })),
    });

    console.log(`[CancelOrder] Cancellation logged to audit trail`);

    // 6. Send notification to store owner
    try {
      const notificationRef = ref(
        database,
        `notifications/${order.storeOwnerId || 'unknown'}/${Date.now()}`
      );
      await set(notificationRef, {
        type: 'order_cancelled',
        orderId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        reason,
        total: order.total,
        createdAt: cancelledAt,
        read: false,
      });

      console.log(`[CancelOrder] Notification sent to store owner`);
    } catch (notifError) {
      // Don't fail cancellation if notification fails
      console.error('[CancelOrder] Failed to send notification:', notifError);
    }

    return {
      success: true,
      message: 'Order cancelled successfully. Stock has been restored to inventory.',
    };
  } catch (error) {
    console.error('[CancelOrder] Error:', error);
    return {
      success: false,
      message: 'Failed to cancel order. Please try again or contact support.',
    };
  }
}

/**
 * Check if an order can be cancelled
 * @param orderId - Firebase order ID
 * @param userId - Customer user ID
 * @returns Boolean indicating if order can be cancelled
 */
export async function canCancelOrder(orderId: string, userId: string): Promise<boolean> {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    const orderSnap = await get(orderRef);

    if (!orderSnap.exists()) return false;

    const order = orderSnap.val();

    // Can cancel if:
    // 1. User owns the order
    // 2. Order is pending or confirmed
    return (
      order.customerId === userId &&
      (order.status === 'pending' || order.status === 'confirmed')
    );
  } catch (error) {
    console.error('[CanCancelOrder] Error:', error);
    return false;
  }
}
