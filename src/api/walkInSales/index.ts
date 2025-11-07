/**
 * WALK-IN SALES API
 * 
 * Firebase API functions for walk-in sales management
 */

import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { WalkInSale, WalkInSaleInput, WalkInSaleItem } from '../../models/WalkInSale';

/**
 * Create a new walk-in sale transaction
 * Automatically reduces product inventory
 */
export const createWalkInSale = async (
  storeOwnerId: string,
  storeName: string,
  saleData: WalkInSaleInput
): Promise<{ success: boolean; saleId?: string; error?: string }> => {
  try {
    // Validate items
    if (!saleData.items || saleData.items.length === 0) {
      return { success: false, error: 'No items in sale' };
    }

    // Check inventory for all items before proceeding
    for (const item of saleData.items) {
      const productRef = ref(database, `products/${item.productId}`);
      const productSnapshot = await get(productRef);
      
      if (!productSnapshot.exists()) {
        return { success: false, error: `Product ${item.productName} not found` };
      }

      const product = productSnapshot.val();
      if (product.quantity < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for ${item.productName}. Available: ${product.quantity}, Requested: ${item.quantity}` 
        };
      }
    }

    // Calculate total
    const totalAmount = saleData.items.reduce((sum, item) => sum + item.subtotal, 0);

    // Create sale record
    const salesRef = ref(database, 'walkInSales');
    const newSaleRef = push(salesRef);
    const saleId = newSaleRef.key!;

    const walkInSale: Omit<WalkInSale, 'id'> = {
      saleType: 'walk-in',
      storeId: storeOwnerId,
      storeOwnerId: storeOwnerId,
      storeName: storeName,
      items: saleData.items,
      totalAmount: totalAmount,
      paymentMethod: 'cash',
      customerName: saleData.customerName || '',
      createdAt: new Date().toISOString(),
      recordedBy: storeOwnerId,
    };

    await set(newSaleRef, { ...walkInSale, id: saleId });

    // Update inventory for each item
    for (const item of saleData.items) {
      const productRef = ref(database, `products/${item.productId}`);
      const productSnapshot = await get(productRef);
      const product = productSnapshot.val();
      
      const newQuantity = product.quantity - item.quantity;
      const newStatus = newQuantity === 0 ? 'out_of_stock' : 'available';
      
      await update(productRef, {
        quantity: newQuantity,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true, saleId };
  } catch (error) {
    console.error('Error creating walk-in sale:', error);
    return { success: false, error: 'Failed to create sale' };
  }
};

/**
 * Get all walk-in sales for a store owner
 */
export const getWalkInSales = async (storeOwnerId: string): Promise<WalkInSale[]> => {
  try {
    const salesRef = ref(database, 'walkInSales');
    const salesQuery = query(
      salesRef,
      orderByChild('storeOwnerId'),
      equalTo(storeOwnerId)
    );

    const snapshot = await get(salesQuery);
    
    if (!snapshot.exists()) {
      return [];
    }

    const sales: WalkInSale[] = [];
    snapshot.forEach((childSnapshot) => {
      sales.push({
        id: childSnapshot.key!,
        ...childSnapshot.val()
      });
    });

    // Sort by date (newest first)
    return sales.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching walk-in sales:', error);
    return [];
  }
};

/**
 * Get a single walk-in sale by ID
 */
export const getWalkInSaleById = async (saleId: string): Promise<WalkInSale | null> => {
  try {
    const saleRef = ref(database, `walkInSales/${saleId}`);
    const snapshot = await get(saleRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.key!,
      ...snapshot.val()
    };
  } catch (error) {
    console.error('Error fetching walk-in sale:', error);
    return null;
  }
};
