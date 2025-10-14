/**
 * Stores API
 *
 * Firebase operations for store data
 */

import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { Store } from '@/models';

/**
 * Fetch a single store by ID
 */
export async function fetchStoreById(storeId: string): Promise<Store | null> {
  try {
    const storeRef = ref(database, `stores/${storeId}`);
    const snapshot = await get(storeRef);

    if (snapshot.exists()) {
      return snapshot.val() as Store;
    }
    return null;
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

/**
 * Fetch featured stores
 */
export async function fetchFeaturedStores(): Promise<Store[]> {
  try {
    const storesRef = ref(database, 'stores');
    const featuredQuery = query(storesRef, orderByChild('status'), equalTo('active'));
    const snapshot = await get(featuredQuery);

    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Store[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured stores:', error);
    return [];
  }
}

/**
 * Fetch all active stores
 */
export async function fetchAllStores(): Promise<Store[]> {
  try {
    const storesRef = ref(database, 'stores');
    const snapshot = await get(storesRef);

    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Store[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
}
