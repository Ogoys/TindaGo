/**
 * SUPPLIER API
 *
 * Firebase operations for managing suppliers
 * Note: Currently suppliers are tracked through purchase orders
 * Future enhancement: Add dedicated suppliers collection for better management
 */

import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../../../FirebaseConfig';
import { Supplier, SupplierInput, SupplierStats } from '../../models/Supplier';

/**
 * Create a new supplier
 * @param supplierData - Supplier information
 * @returns Created supplier with ID
 */
export const createSupplier = async (supplierData: SupplierInput): Promise<Supplier> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const suppliersRef = ref(database, 'suppliers');
    const newSupplierRef = push(suppliersRef);
    const supplierId = newSupplierRef.key;

    if (!supplierId) {
      throw new Error('Failed to generate supplier ID');
    }

    const now = new Date().toISOString();

    // Build supplier object, excluding undefined values (Firebase doesn't allow undefined)
    const supplier: Supplier = {
      id: supplierId,
      storeOwnerId: currentUser.uid,
      name: supplierData.name,
      createdAt: now,
      updatedAt: now,
    };

    // Only add optional fields if they have values
    if (supplierData.contact) supplier.contact = supplierData.contact;
    if (supplierData.address) supplier.address = supplierData.address;
    if (supplierData.city) supplier.city = supplierData.city;
    if (supplierData.postalCode) supplier.postalCode = supplierData.postalCode;
    if (supplierData.email) supplier.email = supplierData.email;
    if (supplierData.notes) supplier.notes = supplierData.notes;

    await set(newSupplierRef, supplier);

    return supplier;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

/**
 * Get all suppliers for the current store owner
 * @returns Array of suppliers
 */
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const suppliersRef = ref(database, 'suppliers');
    const userSuppliersQuery = query(
      suppliersRef,
      orderByChild('storeOwnerId'),
      equalTo(currentUser.uid)
    );

    const snapshot = await get(userSuppliersQuery);

    if (!snapshot.exists()) {
      return [];
    }

    const suppliersData = snapshot.val();
    const suppliers: Supplier[] = Object.keys(suppliersData).map((key) => ({
      id: key,
      ...suppliersData[key],
    }));

    return suppliers;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};

/**
 * Get a single supplier by ID
 * @param supplierId - Supplier ID
 * @returns Supplier data or null if not found
 */
export const getSupplierById = async (supplierId: string): Promise<Supplier | null> => {
  try {
    const supplierRef = ref(database, `suppliers/${supplierId}`);
    const snapshot = await get(supplierRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: supplierId,
      ...snapshot.val(),
    };
  } catch (error) {
    console.error('Error fetching supplier:', error);
    throw error;
  }
};

/**
 * Update a supplier
 * @param supplierId - Supplier ID
 * @param updates - Fields to update
 */
export const updateSupplier = async (
  supplierId: string,
  updates: Partial<SupplierInput>
): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const supplierRef = ref(database, `suppliers/${supplierId}`);

    // Verify supplier belongs to current user
    const snapshot = await get(supplierRef);
    if (!snapshot.exists()) {
      throw new Error('Supplier not found');
    }

    const supplierData = snapshot.val();
    if (supplierData.storeOwnerId !== currentUser.uid) {
      throw new Error('Unauthorized to update this supplier');
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await update(supplierRef, updateData);
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
};

/**
 * Delete a supplier
 * @param supplierId - Supplier ID
 */
export const deleteSupplier = async (supplierId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const supplierRef = ref(database, `suppliers/${supplierId}`);

    // Verify supplier belongs to current user
    const snapshot = await get(supplierRef);
    if (!snapshot.exists()) {
      throw new Error('Supplier not found');
    }

    const supplierData = snapshot.val();
    if (supplierData.storeOwnerId !== currentUser.uid) {
      throw new Error('Unauthorized to delete this supplier');
    }

    await remove(supplierRef);
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};

/**
 * Get supplier statistics from purchase orders
 * @returns Map of supplier names to their statistics
 */
export const getSupplierStatistics = async (): Promise<Map<string, SupplierStats>> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const purchaseOrdersRef = ref(database, 'purchase_orders');
    const userPurchaseOrdersQuery = query(
      purchaseOrdersRef,
      orderByChild('storeOwnerId'),
      equalTo(currentUser.uid)
    );

    const snapshot = await get(userPurchaseOrdersQuery);

    if (!snapshot.exists()) {
      return new Map();
    }

    const purchaseOrders = snapshot.val();
    const suppliersStatsMap = new Map<string, SupplierStats>();

    Object.keys(purchaseOrders).forEach((poId) => {
      const po: any = purchaseOrders[poId];
      const supplierName = po.supplierName || 'Unknown Supplier';

      if (!suppliersStatsMap.has(supplierName)) {
        suppliersStatsMap.set(supplierName, {
          supplierId: supplierName, // Using name as ID for now
          supplierName,
          totalPurchaseOrders: 0,
          totalAmountSpent: 0,
          lastPurchaseDate: null,
          productCount: 0,
        });
      }

      const stats = suppliersStatsMap.get(supplierName)!;

      stats.totalPurchaseOrders += 1;
      stats.totalAmountSpent += po.totalCost || 0;

      // Update last purchase date
      const purchaseDate = po.purchaseDate || po.createdAt;
      if (
        purchaseDate &&
        (!stats.lastPurchaseDate || new Date(purchaseDate) > new Date(stats.lastPurchaseDate))
      ) {
        stats.lastPurchaseDate = purchaseDate;
      }

      // Count unique products
      if (po.items && Array.isArray(po.items)) {
        const productSet = new Set<string>();
        po.items.forEach((item: any) => {
          if (item.productId) {
            productSet.add(item.productId);
          }
        });
        stats.productCount = Math.max(stats.productCount, productSet.size);
      }
    });

    return suppliersStatsMap;
  } catch (error) {
    console.error('Error fetching supplier statistics:', error);
    throw error;
  }
};

/**
 * Get purchase orders for a specific supplier
 * @param supplierName - Name of the supplier
 * @returns Array of purchase order IDs
 */
export const getPurchaseOrdersBySupplier = async (supplierName: string): Promise<string[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const purchaseOrdersRef = ref(database, 'purchase_orders');
    const userPurchaseOrdersQuery = query(
      purchaseOrdersRef,
      orderByChild('storeOwnerId'),
      equalTo(currentUser.uid)
    );

    const snapshot = await get(userPurchaseOrdersQuery);

    if (!snapshot.exists()) {
      return [];
    }

    const purchaseOrders = snapshot.val();
    const matchingPOIds: string[] = [];

    Object.keys(purchaseOrders).forEach((poId) => {
      const po: any = purchaseOrders[poId];
      if (po.supplierName === supplierName) {
        matchingPOIds.push(poId);
      }
    });

    return matchingPOIds;
  } catch (error) {
    console.error('Error fetching purchase orders by supplier:', error);
    throw error;
  }
};
