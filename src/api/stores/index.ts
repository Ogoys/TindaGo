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
      const data = snapshot.val();
      // Include the store ID and ensure logo/coverImage are properly mapped
      return {
        id: storeId,
        ...data,
        // Ensure logo and coverImage are included from businessInfo if they exist
        logo: data.logo || data.businessInfo?.logo || null,
        coverImage: data.coverImage || data.businessInfo?.coverImage || null,
      } as Store;
    }
    return null;
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

/**
 * Fetch featured stores (only OPEN stores visible to customers)
 */
export async function fetchFeaturedStores(): Promise<Store[]> {
  try {
    const storesRef = ref(database, 'stores');
    const snapshot = await get(storesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Map store data and filter by active + open status
      return Object.keys(data)
        .map(storeId => ({
          id: storeId,
          ...data[storeId],
          // Ensure logo and coverImage are included from businessInfo if they exist
          logo: data[storeId].logo || data[storeId].businessInfo?.logo || null,
          coverImage: data[storeId].coverImage || data[storeId].businessInfo?.coverImage || null,
        }))
        .filter(store =>
          store.status === 'active' &&
          store.isOpen !== false  // Only hide stores explicitly marked as closed
        ) as Store[];
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
      const data = snapshot.val();
      // Map store data and include the store ID, logo, and coverImage
      return Object.keys(data).map(storeId => ({
        id: storeId,
        ...data[storeId],
        // Ensure logo and coverImage are included from businessInfo if they exist
        logo: data[storeId].logo || data[storeId].businessInfo?.logo || null,
        coverImage: data[storeId].coverImage || data[storeId].businessInfo?.coverImage || null,
      })) as Store[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
}
