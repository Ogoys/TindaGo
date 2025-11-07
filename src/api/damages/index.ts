/**
 * DAMAGES API
 * 
 * Firebase API functions for damages and spoilages management
 */

import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { Damage, DamageInput, DamageItem } from '../../models/Damage';

/**
 * Record damage/spoilage
 * Automatically reduces product inventory
 */
export const recordDamage = async (
  storeOwnerId: string,
  storeName: string,
  damageData: DamageInput
): Promise<{ success: boolean; damageId?: string; error?: string }> => {
  try {
    // Validate items
    if (!damageData.items || damageData.items.length === 0) {
      return { success: false, error: 'No items in damage record' };
    }

    // Check inventory for all items before proceeding
    for (const item of damageData.items) {
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

    // Calculate total loss
    const totalLoss = damageData.items.reduce((sum, item) => sum + item.totalLoss, 0);

    // Create damage record
    const damagesRef = ref(database, 'damages');
    const newDamageRef = push(damagesRef);
    const damageId = newDamageRef.key!;

    const damage: Omit<Damage, 'id'> = {
      storeId: storeOwnerId,
      storeOwnerId: storeOwnerId,
      storeName: storeName,
      items: damageData.items,
      totalLoss: totalLoss,
      createdAt: new Date().toISOString(),
      recordedBy: storeOwnerId,
    };

    await set(newDamageRef, { ...damage, id: damageId });

    // Update inventory for each item
    for (const item of damageData.items) {
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

    return { success: true, damageId };
  } catch (error) {
    console.error('Error recording damage:', error);
    return { success: false, error: 'Failed to record damage' };
  }
};

/**
 * Get all damages for a store owner
 */
export const getDamages = async (storeOwnerId: string): Promise<Damage[]> => {
  try {
    const damagesRef = ref(database, 'damages');
    const damagesQuery = query(
      damagesRef,
      orderByChild('storeOwnerId'),
      equalTo(storeOwnerId)
    );

    const snapshot = await get(damagesQuery);
    
    if (!snapshot.exists()) {
      return [];
    }

    const damages: Damage[] = [];
    snapshot.forEach((childSnapshot) => {
      damages.push({
        id: childSnapshot.key!,
        ...childSnapshot.val()
      });
    });

    // Sort by date (newest first)
    return damages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching damages:', error);
    return [];
  }
};

/**
 * Get a single damage record by ID
 */
export const getDamageById = async (damageId: string): Promise<Damage | null> => {
  try {
    const damageRef = ref(database, `damages/${damageId}`);
    const snapshot = await get(damageRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.key!,
      ...snapshot.val()
    };
  } catch (error) {
    console.error('Error fetching damage:', error);
    return null;
  }
};

/**
 * Calculate total losses for a store owner
 */
export const getTotalLosses = async (storeOwnerId: string): Promise<number> => {
  try {
    const damages = await getDamages(storeOwnerId);
    return damages.reduce((total, damage) => total + damage.totalLoss, 0);
  } catch (error) {
    console.error('Error calculating total losses:', error);
    return 0;
  }
};
