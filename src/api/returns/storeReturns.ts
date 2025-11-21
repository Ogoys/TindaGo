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
 * Updates status to 'resolved' and updates item conditions (sellable vs damaged)
 * Sellable items go to Return List for restocking, damaged items are marked as such
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

    // Update return status and items with evaluated conditions
    await update(returnRef, {
      status: 'resolved',
      processedAt: new Date().toISOString(),
      processedBy: storeOwnerId,
      items: itemsToUpdate, // Save items with their evaluated conditions
      notes: `${returnData.notes || ''}\nApproved and resolved by store owner`,
    });

    // Note: We do NOT automatically restore inventory here
    // Sellable items will appear in the Return List in the Inventory screen
    // Store owner can manually restore them from there
    // This prevents automatic restocking of items that may need inspection

    // Optional: Log which items are sellable vs damaged for reporting
    const sellableItems = itemsToUpdate.filter((item: any) => item.condition === 'sellable');
    const damagedItems = itemsToUpdate.filter((item: any) => item.condition === 'damaged');

    console.log(`Return ${returnId} processed:`, {
      sellable: sellableItems.length,
      damaged: damagedItems.length
    });

    // TODO: Process actual refunds based on refund method
    // For GCash/PayMaya: Initiate refund transaction
    // For Loan: Mark as paid back to store
    // if (returnData.refundMethod === 'gcash' || returnData.refundMethod === 'paymaya') {
    //   await initiateOnlineRefund(returnData);
    // }

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
