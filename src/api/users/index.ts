/**
 * Users API
 *
 * Firebase operations for user profile data in Realtime Database
 */

import { ref, get, update, onValue, off } from 'firebase/database';
import { database } from '../../../FirebaseConfig';

export interface UserProfile {
  uid: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  userType: 'customer' | 'store-owner';
  emailVerified: boolean;
  isPhoneVerified?: boolean;
  profileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
  address?: string;
  city?: string;
}

/**
 * Get user profile from Firebase Realtime Database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return {
        uid: userId,
        ...snapshot.val(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile in Firebase Realtime Database
 */
export async function updateUserProfileData(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const userRef = ref(database, `users/${userId}`);

    // Add updatedAt timestamp
    const dataToUpdate = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await update(userRef, dataToUpdate);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

/**
 * Listen to user profile changes in real-time
 */
export function subscribeToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
): () => void {
  const userRef = ref(database, `users/${userId}`);

  const listener = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        uid: userId,
        ...snapshot.val(),
      } as UserProfile);
    } else {
      callback(null);
    }
  });

  // Return unsubscribe function
  return () => off(userRef, 'value', listener);
}

/**
 * Create or update user profile
 */
export async function createOrUpdateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<boolean> {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);

    const timestamp = new Date().toISOString();

    if (snapshot.exists()) {
      // Update existing profile
      await update(userRef, {
        ...profileData,
        updatedAt: timestamp,
      });
    } else {
      // Create new profile
      await update(userRef, {
        uid: userId,
        ...profileData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    return true;
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return false;
  }
}
