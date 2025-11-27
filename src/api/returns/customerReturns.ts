/**
 * CUSTOMER RETURNS API
 *
 * Firebase API functions for customer-initiated return requests
 * Handles return request submission and tracking
 */

import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { Return, ReturnItem, ReturnReason } from '../../models/Return';

export interface CustomerReturnRequest {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    productImageUrl?: string;
    quantity: number;
    quantityReturned: number; // Actual quantity being returned
    price: number;
    weight?: string;
    unit?: string;
    returnReason: ReturnReason;
  }>;
  refundMethod: 'cash' | 'replace_product' | 'no_refund';
  additionalDetails?: string;
  photoUrls?: string[];
}

/**
 * Submit a customer return request
 * Creates a return record with 'pending' status for store owner review
 */
export const submitCustomerReturnRequest = async (
  request: CustomerReturnRequest
): Promise<{ success: boolean; returnId?: string; returnNumber?: string; error?: string }> => {
  try {
    // Validate request
    if (!request.items || request.items.length === 0) {
      return { success: false, error: 'No items selected for return' };
    }

    // Create return items with proper structure
    const returnItems: ReturnItem[] = request.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      productImageUrl: item.productImageUrl,
      quantity: item.quantity, // Original ordered quantity
      quantityReturned: item.quantityReturned, // Actual quantity being returned
      price: item.price,
      // Refund amount calculation:
      // - Cash refund: Customer gets money back
      // - Replace product: Track product value as financial loss
      // - No refund: No financial impact (goodwill)
      refundAmount: request.refundMethod === 'no_refund' ? 0 : item.quantityReturned * item.price,
      productSize: item.weight || '',
      unit: item.unit || '',
      reason: item.returnReason,
      condition: 'sellable', // Customer assumes sellable; store owner will verify
      notes: '',
      restoreToInventory: false, // Store owner will decide after inspection
      isReplacement: request.refundMethod === 'replace_product',
    }));

    // Calculate total refund
    const totalRefund = returnItems.reduce((sum, item) => sum + item.refundAmount, 0);

    // Create return record in Firebase
    const returnsRef = ref(database, 'return_goods');
    const newReturnRef = push(returnsRef);
    const returnId = newReturnRef.key!;

    // Generate return number
    const year = new Date().getFullYear();
    const returnNumber = `RET-${year}-${returnId.substring(0, 6).toUpperCase()}`;

    const returnRecord: Omit<Return, 'id'> = {
      returnNumber,
      storeId: request.storeId,
      storeOwnerId: request.storeId,
      storeName: request.storeName,
      customerName: request.customerName,
      customerId: request.customerId,
      orderNumber: request.orderNumber,
      items: returnItems,
      refundMethod: request.refundMethod,
      totalRefund,
      status: 'pending', // Pending store owner review
      additionalDetails: request.additionalDetails || '',
      photoUrls: request.photoUrls || [],
      createdAt: new Date().toISOString(),
      processedBy: '',
      notes: `Customer return request for order ${request.orderNumber}`,
    };

    await set(newReturnRef, { ...returnRecord, id: returnId });

    return { success: true, returnId, returnNumber };
  } catch (error) {
    console.error('Error submitting customer return request:', error);
    return { success: false, error: 'Failed to submit return request' };
  }
};

/**
 * Get all return requests for a customer
 */
export const getCustomerReturns = async (customerId: string): Promise<Return[]> => {
  try {
    const returnsRef = ref(database, 'return_goods');
    const customerReturnsQuery = query(
      returnsRef,
      orderByChild('customerId'),
      equalTo(customerId)
    );

    const snapshot = await get(customerReturnsQuery);

    if (!snapshot.exists()) {
      return [];
    }

    const returns: Return[] = [];
    snapshot.forEach((childSnapshot) => {
      returns.push({
        id: childSnapshot.key!,
        ...childSnapshot.val()
      });
    });

    // Sort by date (newest first)
    return returns.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching customer returns:', error);
    return [];
  }
};

/**
 * Get a single return by ID
 */
export const getReturnById = async (returnId: string): Promise<Return | null> => {
  try {
    const returnRef = ref(database, `return_goods/${returnId}`);
    const snapshot = await get(returnRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.key!,
      ...snapshot.val()
    };
  } catch (error) {
    console.error('Error fetching return:', error);
    return null;
  }
};

/**
 * Check if a customer can request a return for an order
 * Returns can only be requested for completed/picked_up orders
 */
export const canRequestReturn = async (
  orderId: string,
  customerId: string
): Promise<{ canReturn: boolean; reason?: string }> => {
  try {
    // Fetch order
    const orderRef = ref(database, `orders/${orderId}`);
    const orderSnapshot = await get(orderRef);

    if (!orderSnapshot.exists()) {
      return { canReturn: false, reason: 'Order not found' };
    }

    const order = orderSnapshot.val();

    // Check if order belongs to customer
    if (order.customerId !== customerId) {
      return { canReturn: false, reason: 'Order does not belong to you' };
    }

    // Check if order is completed or picked up
    if (order.status !== 'completed' && order.status !== 'picked_up') {
      return { canReturn: false, reason: 'Returns can only be requested for completed orders' };
    }

    // Check if a return request already exists for this order
    const returnsRef = ref(database, 'return_goods');
    const orderReturnsQuery = query(
      returnsRef,
      orderByChild('orderNumber'),
      equalTo(order.orderNumber)
    );

    const returnsSnapshot = await get(orderReturnsQuery);

    if (returnsSnapshot.exists()) {
      return { canReturn: false, reason: 'A return request already exists for this order' };
    }

    return { canReturn: true };
  } catch (error) {
    console.error('Error checking return eligibility:', error);
    return { canReturn: false, reason: 'Unable to verify return eligibility' };
  }
};

/**
 * Cancel a pending return request (customer can cancel before store processes)
 */
export const cancelReturnRequest = async (
  returnId: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Fetch return
    const returnRef = ref(database, `return_goods/${returnId}`);
    const snapshot = await get(returnRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Return request not found' };
    }

    const returnData = snapshot.val();

    // Verify ownership
    if (returnData.customerId !== customerId) {
      return { success: false, error: 'You can only cancel your own return requests' };
    }

    // Can only cancel pending returns
    if (returnData.status !== 'pending') {
      return { success: false, error: 'Can only cancel pending return requests' };
    }

    // Update status to rejected (cancelled by customer)
    await update(returnRef, {
      status: 'rejected',
      notes: `${returnData.notes || ''}\nCancelled by customer`,
      processedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling return request:', error);
    return { success: false, error: 'Failed to cancel return request' };
  }
};
