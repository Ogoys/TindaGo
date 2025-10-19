/**
 * useCartCount Hook
 *
 * Real-time cart item count tracking from Firebase
 */

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../FirebaseConfig';

export function useCartCount(userId: string | undefined): number {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCartCount(0);
      return;
    }

    const cartRef = ref(database, `carts/${userId}/itemCount`);

    const unsubscribe = onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        setCartCount(snapshot.val() || 0);
      } else {
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return cartCount;
}
