/**
 * RETURNS API
 * 
 * Firebase API functions for customer returns management
 * Handles inventory restoration for sellable returns and refund tracking
 */

import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { Return, ReturnInput, ReturnItem, generateReturnNumber } from '../../models/Return';

/**
 * Create a new return record
 * Processes refund and restores inventory for sellable items
 */
export const createReturn = async (
  storeOwnerId: string,
  storeName: string,
  returnData: ReturnInput
): Promise<{ success: boolean; returnId?: string; returnNumber?: string; error?: string }> => {
  try {
    // Validate items
    if (!returnData.items || returnData.items.length === 0) {
      return { success: false, error: 'No items in return' };
    }

    // Validate all products exist
    for (const item of returnData.items) {
      const productRef = ref(database, `products/${item.productId}`);
      const productSnapshot = await get(productRef);
      
      if (!productSnapshot.exists()) {
        return { success: false, error: `Product ${item.productName} not found` };
      }
    }

    // Calculate total refund
    const totalRefund = returnData.items.reduce((sum, item) => sum + item.refundAmount, 0);

    // Get existing returns count for return number generation
    const returnsRef = ref(database, 'returns');
    const storeReturnsQuery = query(
      returnsRef,
      orderByChild('storeOwnerId'),
      equalTo(storeOwnerId)
    );
    const snapshot = await get(storeReturnsQuery);
    const existingCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

    // Generate return number
    const returnNumber = generateReturnNumber(existingCount);

    // Create return record
    const newReturnRef = push(returnsRef);
    const returnId = newReturnRef.key!;

    const returnRecord: Omit<Return, 'id'> = {
      returnNumber,
      storeId: storeOwnerId,
      storeOwnerId: storeOwnerId,
      storeName: storeName,
      customerName: returnData.customerName,
      customerId: returnData.customerId,
      orderNumber: returnData.orderNumber,
      items: returnData.items,
      refundMethod: returnData.refundMethod,
      totalRefund: totalRefund,
      status: 'processed', // Auto-process on creation
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      processedBy: storeOwnerId,
      notes: returnData.notes,
    };

    await set(newReturnRef, { ...returnRecord, id: returnId });

    // Restore inventory for sellable items
    for (const item of returnData.items) {
      if (item.restoreToInventory && item.condition === 'sellable') {
        const productRef = ref(database, `products/${item.productId}`);
        const productSnapshot = await get(productRef);
        
        if (productSnapshot.exists()) {
          const product = productSnapshot.val();
          const newQuantity = (product.quantity || 0) + item.quantity;
          
          await update(productRef, {
            quantity: newQuantity,
            status: 'available', // Mark as available since we have stock
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    // TODO: Process refunds for wallet/store_credit
    // For now, cash refunds are just recorded
    // Future implementation:
    // if (returnData.refundMethod === 'wallet') {
    //   await creditCustomerWallet(returnData.customerId, totalRefund);
    // } else if (returnData.refundMethod === 'store_credit') {
    //   await issueStoreCredit(returnData.customerId, totalRefund);
    // }

    return { success: true, returnId, returnNumber };
  } catch (error) {
    console.error('Error creating return:', error);
    return { success: false, error: 'Failed to create return' };
  }
};

/**
 * Get all returns for a store owner
 */
export const getReturns = async (storeOwnerId: string): Promise<Return[]> => {
  try {
    const returnsRef = ref(database, 'returns');
    const storeReturnsQuery = query(
      returnsRef,
      orderByChild('storeOwnerId'),
      equalTo(storeOwnerId)
    );

    const snapshot = await get(storeReturnsQuery);
    
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
    console.error('Error fetching returns:', error);
    return [];
  }
};

/**
 * Get a single return by ID
 */
export const getReturnById = async (returnId: string): Promise<Return | null> => {
  try {
    const returnRef = ref(database, `returns/${returnId}`);
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
 * Update return status
 */
export const updateReturnStatus = async (
  returnId: string,
  status: 'pending' | 'processed' | 'rejected'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const returnRef = ref(database, `returns/${returnId}`);
    const updates: any = {
      status: status,
    };

    // If marking as processed, set processed date
    if (status === 'processed') {
      updates.processedAt = new Date().toISOString();
    }

    await update(returnRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating return status:', error);
    return { success: false, error: 'Failed to update status' };
  }
};

/**
 * Delete a return record
 */
export const deleteReturn = async (
  returnId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const returnRef = ref(database, `returns/${returnId}`);
    
    // Set to null to delete in Firebase Realtime Database
    await set(returnRef, null);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting return:', error);
    return { success: false, error: 'Failed to delete return' };
  }
};

/**
 * Calculate total refunds for a store owner
 */
export const getTotalRefunds = async (
  storeOwnerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> => {
  try {
    const returns = await getReturns(storeOwnerId);
    
    let filtered = returns.filter(r => r.status === 'processed');
    
    // Apply date filters if provided
    if (startDate) {
      filtered = filtered.filter(r => new Date(r.createdAt) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => new Date(r.createdAt) <= endDate);
    }
    
    return filtered.reduce((total, returnRecord) => total + returnRecord.totalRefund, 0);
  } catch (error) {
    console.error('Error calculating total refunds:', error);
    return 0;
  }
};

/**
 * Get return analytics
 */
export const getReturnAnalytics = async (storeOwnerId: string): Promise<{
  totalReturns: number;
  totalRefunded: number;
  returnsByReason: Record<string, number>;
  mostReturnedProducts: Array<{ productName: string; count: number }>;
}> => {
  try {
    const returns = await getReturns(storeOwnerId);
    const processed = returns.filter(r => r.status === 'processed');
    
    // Total returns
    const totalReturns = processed.length;
    
    // Total refunded
    const totalRefunded = processed.reduce((sum, r) => sum + r.totalRefund, 0);
    
    // Returns by reason
    const returnsByReason: Record<string, number> = {};
    processed.forEach(returnRecord => {
      returnRecord.items.forEach(item => {
        returnsByReason[item.reason] = (returnsByReason[item.reason] || 0) + 1;
      });
    });
    
    // Most returned products
    const productCounts: Record<string, { name: string; count: number }> = {};
    processed.forEach(returnRecord => {
      returnRecord.items.forEach(item => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = { name: item.productName, count: 0 };
        }
        productCounts[item.productId].count += item.quantity;
      });
    });
    
    const mostReturnedProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(p => ({ productName: p.name, count: p.count }));
    
    return {
      totalReturns,
      totalRefunded,
      returnsByReason,
      mostReturnedProducts,
    };
  } catch (error) {
    console.error('Error getting return analytics:', error);
    return {
      totalReturns: 0,
      totalRefunded: 0,
      returnsByReason: {},
      mostReturnedProducts: [],
    };
  }
};
