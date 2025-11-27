/**
 * STORE RETURNS API
 *
 * Firebase API functions for store owner return request management
 * Handles processing and rejecting customer return requests
 */

import { ref, get, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { Return } from '../../models/Return';

/**
 * Get all return requests for a store
 * Fetches both from 'return_goods' (customer returns) and 'returns' (store returns)
 */
export const getStoreReturns = async (storeId: string): Promise<Return[]> => {
  try {
    const allReturns: Return[] = [];

    // Fetch from customer returns (return_goods)
    const customerReturnsRef = ref(database, 'return_goods');
    const customerSnapshot = await get(customerReturnsRef);

    if (customerSnapshot.exists()) {
      customerSnapshot.forEach((childSnapshot) => {
        const returnData = childSnapshot.val();
        if (returnData.storeId === storeId || returnData.storeOwnerId === storeId) {
          allReturns.push({
            id: childSnapshot.key!,
            ...returnData
          });
        }
      });
    }

    // Sort by date (newest first)
    return allReturns.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching store returns:', error);
    return [];
  }
};

/**
 * Process (approve) a customer return request
 * Updates status to 'resolved' and automatically updates inventory based on refund method
 * 
 * Inventory Logic:
 * - Cash Refund + Sellable: Restore to inventory (Stock +1)
 * - Cash Refund + Unsellable: Track as damaged (quantityDamaged +1)
 * - Replace Product + Sellable: Give new item, track old (Stock -1, quantityUnavailable +1)
 * - Replace Product + Unsellable: Give new item, track as damaged (Stock -1, quantityDamaged +1)
 * - No Refund + Sellable: Restore to inventory (Stock +1, free item for store)
 * - No Refund + Unsellable: Track as damaged (quantityDamaged +1)
 */
export const processReturnRequest = async (
  returnId: string,
  storeOwnerId: string,
  updatedItems?: any[] // Items with evaluated conditions
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Fetch return request
    const returnRef = ref(database, `return_goods/${returnId}`);
    const snapshot = await get(returnRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Return request not found' };
    }

    const returnData = snapshot.val() as Return;

    // Verify ownership
    if (returnData.storeId !== storeOwnerId && returnData.storeOwnerId !== storeOwnerId) {
      return { success: false, error: 'You can only process return requests for your store' };
    }

    // Can only process pending returns
    if (returnData.status !== 'pending') {
      return { success: false, error: 'Can only process pending return requests' };
    }

    // Use updated items with conditions if provided, otherwise use original items
    const itemsToUpdate = updatedItems || returnData.items;

    // For Replace Product refunds, validate stock availability BEFORE processing
    if (returnData.refundMethod === 'replace_product') {
      for (const item of itemsToUpdate) {
        const productRef = ref(database, `products/${item.productId}`);
        const productSnapshot = await get(productRef);

        if (!productSnapshot.exists()) {
          return { success: false, error: `Product ${item.productName} not found in inventory` };
        }

        const product = productSnapshot.val();
        const currentStock = product.quantity || 0;
        const quantityNeeded = item.quantityReturned || item.quantity;

        if (currentStock < quantityNeeded) {
          return {
            success: false,
            error: `Insufficient stock for ${item.productName}. Available: ${currentStock}, Needed: ${quantityNeeded}`
          };
        }
      }
    }

    // Process inventory updates based on refund method and item conditions
    for (const item of itemsToUpdate) {
      const productRef = ref(database, `products/${item.productId}`);
      const productSnapshot = await get(productRef);

      if (productSnapshot.exists()) {
        const product = productSnapshot.val();
        let newQuantity = product.quantity || 0;
        const quantityReturned = item.quantityReturned || item.quantity;

        // REPLACE PRODUCT: Decrease stock (give new) + track returned items based on condition
        if (returnData.refundMethod === 'replace_product') {
          const oldStock = newQuantity;
          newQuantity = newQuantity - quantityReturned;
          
          // Track based on item condition
          if (item.condition === 'unsellable') {
            // Damaged items → add to quantityDamaged
            const currentDamaged = product.quantityDamaged || 0;
            const newDamaged = currentDamaged + quantityReturned;
            
            await update(productRef, {
              quantity: newQuantity,
              quantityDamaged: newDamaged,
              status: newQuantity > 0 ? 'available' : 'out_of_stock',
              updatedAt: new Date().toISOString(),
            });
            
            console.log(`[Return] Replace Product (Damaged): ${item.productName}`);
            console.log(`  - Available stock: ${oldStock} → ${newQuantity} (gave ${quantityReturned} new items)`);
            console.log(`  - Damaged: ${currentDamaged} → ${newDamaged} (received ${quantityReturned} damaged items)`);
          } else {
            // Sellable items → add to quantityUnavailable
            const currentUnavailable = product.quantityUnavailable || 0;
            const newUnavailable = currentUnavailable + quantityReturned;
            
            await update(productRef, {
              quantity: newQuantity,
              quantityUnavailable: newUnavailable,
              status: newQuantity > 0 ? 'available' : 'out_of_stock',
              updatedAt: new Date().toISOString(),
            });
            
            console.log(`[Return] Replace Product (Sellable): ${item.productName}`);
            console.log(`  - Available stock: ${oldStock} → ${newQuantity} (gave ${quantityReturned} new items)`);
            console.log(`  - Unavailable: ${currentUnavailable} → ${newUnavailable} (received ${quantityReturned} returned items)`);
          }
        }
        // CASH REFUND: Restore if sellable, track as unavailable if unsellable
        else if (returnData.refundMethod === 'cash') {
          if (item.condition === 'sellable') {
            newQuantity = newQuantity + quantityReturned;

            await update(productRef, {
              quantity: newQuantity,
              status: 'available',
              updatedAt: new Date().toISOString(),
            });

            console.log(`[Return] Cash Refund (Sellable): ${item.productName} - Stock restored to ${newQuantity}`);
          } else {
            // Track damaged items
            const currentDamaged = product.quantityDamaged || 0;
            const newDamaged = currentDamaged + quantityReturned;

            await update(productRef, {
              quantityDamaged: newDamaged,
              updatedAt: new Date().toISOString(),
            });

            console.log(`[Return] Cash Refund (Damaged): ${item.productName}`);
            console.log(`  - Stock unchanged: ${newQuantity}`);
            console.log(`  - Damaged: ${currentDamaged} → ${newDamaged}`);
          }
        }
        // NO REFUND: Restore if sellable, track as unavailable if unsellable
        else if (returnData.refundMethod === 'no_refund') {
          if (item.condition === 'sellable') {
            newQuantity = newQuantity + quantityReturned;

            await update(productRef, {
              quantity: newQuantity,
              status: 'available',
              updatedAt: new Date().toISOString(),
            });

            console.log(`[Return] No Refund (Sellable): ${item.productName} - Stock restored to ${newQuantity} (free for store)`);
          } else {
            // Track damaged items
            const currentDamaged = product.quantityDamaged || 0;
            const newDamaged = currentDamaged + quantityReturned;

            await update(productRef, {
              quantityDamaged: newDamaged,
              updatedAt: new Date().toISOString(),
            });

            console.log(`[Return] No Refund (Damaged): ${item.productName}`);
            console.log(`  - Stock unchanged: ${newQuantity}`);
            console.log(`  - Damaged: ${currentDamaged} → ${newDamaged}`);
          }
        }
      }
    }

    // Update return status and items with evaluated conditions
    await update(returnRef, {
      status: 'resolved',
      processedAt: new Date().toISOString(),
      processedBy: storeOwnerId,
      items: itemsToUpdate, // Save items with their evaluated conditions
      notes: `${returnData.notes || ''}\nApproved and resolved by store owner`,
    });

    // Update the original order with return tracking information
    if (returnData.orderNumber) {
      try {
        // Find the order by order number
        const ordersRef = ref(database, 'orders');
        const ordersSnapshot = await get(ordersRef);
        
        if (ordersSnapshot.exists()) {
          let orderToUpdate: { id: string; data: any } | null = null;
          
          ordersSnapshot.forEach((childSnapshot) => {
            const orderData = childSnapshot.val();
            if (orderData.orderNumber === returnData.orderNumber) {
              orderToUpdate = { id: childSnapshot.key!, data: orderData };
            }
          });

          if (orderToUpdate) {
            const orderRef = ref(database, `orders/${orderToUpdate.id}`);
            const orderData = orderToUpdate.data;
            
            // Update each returned item in the order
            const updatedItems = orderData.items.map((orderItem: any) => {
              const returnItem = itemsToUpdate.find((ri: any) => ri.productId === orderItem.productId);
              
              if (returnItem) {
                const currentReturned = orderItem.quantityReturned || 0;
                const newReturned = currentReturned + (returnItem.quantityReturned || returnItem.quantity);
                
                return {
                  ...orderItem,
                  quantityReturned: newReturned,
                  returnStatus: 'approved',
                  returnRequestId: returnId,
                  returnProcessedAt: new Date().toISOString(),
                };
              }
              
              return orderItem;
            });

            // Check if all items are fully returned
            const allItemsReturned = updatedItems.every((item: any) => {
              const returned = item.quantityReturned || 0;
              return returned >= item.quantity;
            });

            // Update the order
            await update(orderRef, {
              items: updatedItems,
              hasReturns: true,
              allItemsReturned: allItemsReturned,
              returnRequestIds: [...(orderData.returnRequestIds || []), returnId],
            });

            console.log(`Order ${returnData.orderNumber} updated with return tracking`);
          }
        }
      } catch (orderUpdateError) {
        console.error('Error updating order with return tracking:', orderUpdateError);
        // Don't fail the return processing if order update fails
      }
    }

    // Log summary for reporting
    const sellableItems = itemsToUpdate.filter((item: any) => item.condition === 'sellable');
    const unsellableItems = itemsToUpdate.filter((item: any) => item.condition === 'unsellable');

    console.log(`Return ${returnId} processed:`, {
      refundMethod: returnData.refundMethod,
      sellable: sellableItems.length,
      unsellable: unsellableItems.length
    });

    return { success: true };
  } catch (error) {
    console.error('Error processing return request:', error);
    return { success: false, error: 'Failed to process return request' };
  }
};

/**
 * Reject a customer return request
 * Updates status to 'rejected' with reason
 */
export const rejectReturnRequest = async (
  returnId: string,
  storeOwnerId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Fetch return request
    const returnRef = ref(database, `return_goods/${returnId}`);
    const snapshot = await get(returnRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Return request not found' };
    }

    const returnData = snapshot.val() as Return;

    // Verify ownership
    if (returnData.storeId !== storeOwnerId && returnData.storeOwnerId !== storeOwnerId) {
      return { success: false, error: 'You can only reject return requests for your store' };
    }

  // Can only reject pending returns
    if (returnData.status !== 'pending') {
      return { success: false, error: 'Can only reject pending return requests' };
    }

    // Update return status
    await update(returnRef, {
      status: 'rejected',
      processedAt: new Date().toISOString(),
      processedBy: storeOwnerId,
      notes: `${returnData.notes || ''}\nRejected by store owner: ${rejectionReason}`,
    });

    // Update the original order to mark return request as rejected
    if (returnData.orderNumber) {
      try {
        const ordersRef = ref(database, 'orders');
        const ordersSnapshot = await get(ordersRef);
        
        if (ordersSnapshot.exists()) {
          let orderToUpdate: { id: string; data: any } | null = null;
          
          ordersSnapshot.forEach((childSnapshot) => {
            const orderData = childSnapshot.val();
            if (orderData.orderNumber === returnData.orderNumber) {
              orderToUpdate = { id: childSnapshot.key!, data: orderData };
            }
          });

          if (orderToUpdate) {
            const orderRef = ref(database, `orders/${orderToUpdate.id}`);
            const orderData = orderToUpdate.data;
            
            // Update item return status to rejected
            const updatedItems = orderData.items.map((orderItem: any) => {
              const wasInReturn = returnData.items.some((ri: any) => ri.productId === orderItem.productId);
              
              if (wasInReturn && orderItem.returnStatus === 'pending') {
                return {
                  ...orderItem,
                  returnStatus: 'rejected',
                  returnRequestId: returnId,
                  returnProcessedAt: new Date().toISOString(),
                };
              }
              
              return orderItem;
            });

            await update(orderRef, {
              items: updatedItems,
            });

            console.log(`Order ${returnData.orderNumber} updated - return rejected`);
          }
        }
      } catch (orderUpdateError) {
        console.error('Error updating order with rejection:', orderUpdateError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error rejecting return request:', error);
    return { success: false, error: 'Failed to reject return request' };
  }
};

/**
 * Get return request by ID (for store owner)
 */
export const getStoreReturnById = async (returnId: string): Promise<Return | null> => {
  try {
    // Try customer returns first
    const customerReturnRef = ref(database, `return_goods/${returnId}`);
    const customerSnapshot = await get(customerReturnRef);

    if (customerSnapshot.exists()) {
      return {
        id: customerSnapshot.key!,
        ...customerSnapshot.val()
      };
    }

    // Try store returns
    const storeReturnRef = ref(database, `returns/${returnId}`);
    const storeSnapshot = await get(storeReturnRef);

    if (storeSnapshot.exists()) {
      return {
        id: storeSnapshot.key!,
        ...storeSnapshot.val()
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching return by ID:', error);
    return null;
  }
};

/**
 * Get pending return requests count for a store
 */
export const getPendingReturnsCount = async (storeId: string): Promise<number> => {
  try {
    const returns = await getStoreReturns(storeId);
    return returns.filter(r => r.status === 'pending').length;
  } catch (error) {
    console.error('Error getting pending returns count:', error);
    return 0;
  }
};

/**
 * Get return analytics for store owner
 */
export const getStoreReturnAnalytics = async (storeId: string): Promise<{
  totalReturns: number;
  pendingReturns: number;
  resolvedReturns: number;
  rejectedReturns: number;
  totalRefunded: number;
}> => {
  try {
    const returns = await getStoreReturns(storeId);

    const totalReturns = returns.length;
    const pendingReturns = returns.filter(r => r.status === 'pending').length;
    const resolvedReturns = returns.filter(r => r.status === 'resolved').length;
    const rejectedReturns = returns.filter(r => r.status === 'rejected').length;
    const totalRefunded = returns
      .filter(r => r.status === 'resolved')
      .reduce((sum, r) => sum + r.totalRefund, 0);

    return {
      totalReturns,
      pendingReturns,
      resolvedReturns,
      rejectedReturns,
      totalRefunded,
    };
  } catch (error) {
    console.error('Error getting store return analytics:', error);
    return {
      totalReturns: 0,
      pendingReturns: 0,
      resolvedReturns: 0,
      rejectedReturns: 0,
      totalRefunded: 0,
    };
  }
};
