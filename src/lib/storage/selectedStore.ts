import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, get, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';

const KEY = 'selectedStoreId';

/**
 * Get selected store ID with Firebase sync
 * Tries Firebase first (if userId provided), then falls back to local storage
 */
export async function getSelectedStoreId(userId?: string): Promise<string | null> {
  try {
    // If userId provided, try Firebase first (cross-device sync)
    if (userId) {
      try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const cloudStoreId = userData.selectedStoreId;
          
          if (cloudStoreId) {
            // Found in cloud, cache locally for offline access
            await AsyncStorage.setItem(KEY, cloudStoreId);
            return cloudStoreId;
          }
        }
      } catch (firebaseError) {
        console.warn('Firebase fetch failed, using local storage:', firebaseError);
        // Continue to local storage fallback
      }
    }
    
    // Fallback to local storage (offline or no userId)
    const localValue = await AsyncStorage.getItem(KEY);
    return localValue || null;
  } catch {
    return null;
  }
}

/**
 * Set selected store ID with Firebase sync
 * Saves to both local storage (fast) and Firebase (cross-device)
 */
export async function setSelectedStoreId(storeId: string, userId?: string): Promise<void> {
  try {
    // Always save locally first (instant feedback)
    await AsyncStorage.setItem(KEY, storeId);
    
    // If userId provided, also save to Firebase (cross-device sync)
    if (userId) {
      try {
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, {
          selectedStoreId: storeId,
          selectedStoreUpdatedAt: new Date().toISOString(),
        });
        console.log('✅ Selected store synced to Firebase');
      } catch (firebaseError) {
        console.warn('⚠️ Firebase sync failed (saved locally only):', firebaseError);
        // Not a critical error - local save succeeded
      }
    }
  } catch (error) {
    console.error('Error setting selected store:', error);
  }
}

/**
 * Clear selected store ID from both local and Firebase
 */
export async function clearSelectedStoreId(userId?: string): Promise<void> {
  try {
    // Clear local storage
    await AsyncStorage.removeItem(KEY);
    
    // If userId provided, also clear from Firebase
    if (userId) {
      try {
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, {
          selectedStoreId: null,
          selectedStoreUpdatedAt: new Date().toISOString(),
        });
      } catch (firebaseError) {
        console.warn('Firebase clear failed:', firebaseError);
      }
    }
  } catch {}
}
