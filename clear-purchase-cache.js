/**
 * Utility script to clear purchase order AsyncStorage cache
 * Run this in your app to clear old cached data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './FirebaseConfig';

export const clearPurchaseOrderCache = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No user logged in');
      return;
    }

    const storageKey = `purchase_order_payment_${currentUser.uid}`;
    await AsyncStorage.removeItem(storageKey);
    console.log('✅ Purchase order cache cleared!');
    console.log('Now create a new purchase order to test the fix.');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
