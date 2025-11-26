/**
 * PURCHASE ORDERS API
 * 
 * Firebase API functions for purchase order management
 * Handles inventory restocking tracking and cost management
 */

import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { PurchaseOrder, PurchaseOrderInput, PurchaseOrderItem, generatePurchaseOrderNumber } from '../../models/PurchaseOrder';

/**
 * Create a new purchase order
 * Records restocking from supplier with cost tracking
 */
export const createPurchaseOrder = async (
  storeOwnerId: string,
  storeName: string,
  orderData: PurchaseOrderInput
): Promise<{ success: boolean; purchaseOrderId?: string; purchaseOrderNumber?: string; error?: string }> => {
  try {
    // Validate items
    if (!orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'No items in purchase order' };
    }

    // Validate purchase date
    if (!orderData.purchaseDate) {
      return { success: false, error: 'Purchase date is required' };
    }

    // Calculate total cost
    const totalCost = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Get existing purchase orders count for PO number generation
    // ✅ FIXED: Using standardized 'purchase_orders' path (snake_case)
    const purchaseOrdersRef = ref(database, 'purchase_orders');
    const storeOrdersQuery = query(
      purchaseOrdersRef,
      orderByChild('storeOwnerId'),
      equalTo(storeOwnerId)
    );
    const snapshot = await get(storeOrdersQuery);
    const existingCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

    // Generate purchase order number
    const purchaseOrderNumber = generatePurchaseOrderNumber(existingCount);

    // Create purchase order
    const newPurchaseOrderRef = push(purchaseOrdersRef);
    const purchaseOrderId = newPurchaseOrderRef.key!;

    // Build purchase order object, only including defined optional fields
    const purchaseOrder: any = {
      purchaseOrderNumber,
      storeId: storeOwnerId,
      storeOwnerId: storeOwnerId,
      storeName: storeName,
      items: orderData.items,
      totalCost: totalCost,
      status: 'pending', // Default status when created
      purchaseDate: orderData.purchaseDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recordedBy: storeOwnerId,
      paymentStatus: orderData.paymentStatus || 'unpaid', // Default to unpaid
    };

    // Only add optional fields if they have values (Firebase doesn't allow undefined)
    if (orderData.supplierName) {
      purchaseOrder.supplierName = orderData.supplierName;
    }
    if (orderData.supplierContact) {
      purchaseOrder.supplierContact = orderData.supplierContact;
    }
    if (orderData.notes) {
      purchaseOrder.notes = orderData.notes;
    }
    if (orderData.paymentMethod) {
      purchaseOrder.paymentMethod = orderData.paymentMethod;
    }
    if (orderData.debtDueDate) {
      purchaseOrder.debtDueDate = orderData.debtDueDate;
    }

    await set(newPurchaseOrderRef, { ...purchaseOrder, id: purchaseOrderId });

    // ✅ FIXED: Return both purchaseOrderId AND purchaseOrderNumber
    return { success: true, purchaseOrderId, purchaseOrderNumber };
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return { success: false, error: 'Failed to create purchase order' };
  }
};

/**
 * Get all purchase orders for a store owner
 */
export const getPurchaseOrders = async (storeOwnerId: string): Promise<PurchaseOrder[]> => {
  try {
    // ✅ FIXED: Using standardized 'purchase_orders' path
    const purchaseOrdersRef = ref(database, 'purchase_orders');
    const storeOrdersQuery = query(
      purchaseOrdersRef,
      orderByChild('storeOwnerId'),
      equalTo(storeOwnerId)
    );

    const snapshot = await get(storeOrdersQuery);

    if (!snapshot.exists()) {
      return [];
    }

    const purchaseOrders: PurchaseOrder[] = [];
    snapshot.forEach((childSnapshot) => {
      purchaseOrders.push({
        id: childSnapshot.key!,
        ...childSnapshot.val()
      });
    });

    // Sort by date (newest first)
    return purchaseOrders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
};

/**
 * Get a single purchase order by ID
 */
export const getPurchaseOrderById = async (orderId: string): Promise<PurchaseOrder | null> => {
  try {
    // ✅ FIXED: Using standardized 'purchase_orders' path
    const orderRef = ref(database, `purchase_orders/${orderId}`);
    const snapshot = await get(orderRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.key!,
      ...snapshot.val()
    };
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return null;
  }
};

/**
 * Update purchase order status
 */
export const updatePurchaseOrderStatus = async (
  orderId: string,
  status: 'pending' | 'received' | 'cancelled'
): Promise<{ success: boolean; error?: string }> => {
  try {
    // ✅ FIXED: Using standardized 'purchase_orders' path
    const orderRef = ref(database, `purchase_orders/${orderId}`);
    const updates: any = {
      status: status,
      updatedAt: new Date().toISOString(),
    };

    // If marking as received, set received date
    if (status === 'received') {
      updates.receivedDate = new Date().toISOString();
    }

    await update(orderRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    return { success: false, error: 'Failed to update status' };
  }
};

/**
 * Mark purchase order as received and update inventory
 * This is the most important function - it adds stock to products
 */
export const markAsReceived = async (
  orderId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get purchase order details
    const purchaseOrder = await getPurchaseOrderById(orderId);
    
    if (!purchaseOrder) {
      return { success: false, error: 'Purchase order not found' };
    }

    if (purchaseOrder.status === 'received') {
      return { success: false, error: 'Purchase order already received' };
    }

    // Update inventory for each item
    for (const item of purchaseOrder.items) {
      const productRef = ref(database, `products/${item.productId}`);
      const productSnapshot = await get(productRef);
      
      if (!productSnapshot.exists()) {
        console.warn(`Product ${item.productName} not found, skipping...`);
        continue;
      }

      const product = productSnapshot.val();
      const newQuantity = (product.quantity || 0) + item.quantity;
      
      // Update product with new quantity and cost price
      await update(productRef, {
        quantity: newQuantity,
        status: 'available', // Mark as available since we have stock
        costPrice: item.costPerUnit, // Track cost for profit margin calculation
        lastRestocked: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log(`Updated ${item.productName}: +${item.quantity} units (total: ${newQuantity})`);
    }

    // Update purchase order status to received
    await updatePurchaseOrderStatus(orderId, 'received');

    return { success: true };
  } catch (error) {
    console.error('Error marking purchase order as received:', error);
    return { success: false, error: 'Failed to update inventory' };
  }
};

/**
 * Delete a purchase order (only if pending)
 */
export const deletePurchaseOrder = async (
  orderId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get purchase order to check status
    const purchaseOrder = await getPurchaseOrderById(orderId);

    if (!purchaseOrder) {
      return { success: false, error: 'Purchase order not found' };
    }

    if (purchaseOrder.status === 'received') {
      return { success: false, error: 'Cannot delete received purchase order' };
    }

    // ✅ FIXED: Using standardized 'purchase_orders' path
    const orderRef = ref(database, `purchase_orders/${orderId}`);
    await set(orderRef, null); // Delete from Firebase

    return { success: true };
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return { success: false, error: 'Failed to delete purchase order' };
  }
};

/**
 * Calculate total spending for a store owner
 */
export const getTotalSpending = async (
  storeOwnerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> => {
  try {
    const purchaseOrders = await getPurchaseOrders(storeOwnerId);
    
    let filtered = purchaseOrders;
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filtered = purchaseOrders.filter(order => {
        const orderDate = new Date(order.purchaseDate);
        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        return true;
      });
    }

    // Sum up total costs (only count received orders)
    return filtered
      .filter(order => order.status === 'received')
      .reduce((total, order) => total + order.totalCost, 0);
  } catch (error) {
    console.error('Error calculating total spending:', error);
    return 0;
  }
};

/**
 * Get purchase analytics
 */
export const getPurchaseAnalytics = async (storeOwnerId: string) => {
  try {
    const purchaseOrders = await getPurchaseOrders(storeOwnerId);
    
    const now = new Date();
    const thisMonth = purchaseOrders.filter(order => {
      const orderDate = new Date(order.purchaseDate);
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear();
    });

    const thisMonthReceived = thisMonth.filter(order => order.status === 'received');
    const thisMonthSpending = thisMonthReceived.reduce((sum, order) => sum + order.totalCost, 0);

    // Count by supplier
    const supplierCounts: Record<string, number> = {};
    purchaseOrders.forEach(order => {
      if (order.supplierName) {
        supplierCounts[order.supplierName] = (supplierCounts[order.supplierName] || 0) + 1;
      }
    });

    return {
      totalOrders: purchaseOrders.length,
      thisMonthOrders: thisMonth.length,
      thisMonthSpending: thisMonthSpending,
      pendingOrders: purchaseOrders.filter(o => o.status === 'pending').length,
      topSuppliers: Object.entries(supplierCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    };
  } catch (error) {
    console.error('Error getting purchase analytics:', error);
    return {
      totalOrders: 0,
      thisMonthOrders: 0,
      thisMonthSpending: 0,
      pendingOrders: 0,
      topSuppliers: [],
    };
  }
};
