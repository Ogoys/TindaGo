/**
 * Commission Service
 *
 * Handles platform commission rate fetching and calculation
 * Synchronized with admin dashboard commission settings
 */

import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';

const COMMISSION_RATE_PATH = 'settings/platform/commissionRate';
const DEFAULT_COMMISSION_RATE = 0.01; // 1% default

// Cache commission rate to avoid excessive Firebase calls
let cachedRate: number | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class CommissionService {
  /**
   * Fetch the platform commission rate from Firebase
   * Returns cached value if available and fresh
   */
  static async getCommissionRate(): Promise<number> {
    try {
      // Return cached rate if it's still valid
      const now = Date.now();
      if (cachedRate !== null && cacheTimestamp !== null && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedRate;
      }

      // Fetch fresh rate from Firebase
      const rateRef = ref(database, COMMISSION_RATE_PATH);
      const snapshot = await get(rateRef);

      if (snapshot.exists()) {
        const rate = snapshot.val();
        if (typeof rate === 'number' && rate >= 0 && rate <= 1) {
          cachedRate = rate;
          cacheTimestamp = now;
          return rate;
        }
      }

      // Fallback to default rate
      cachedRate = DEFAULT_COMMISSION_RATE;
      cacheTimestamp = now;
      return DEFAULT_COMMISSION_RATE;
    } catch (error) {
      console.error('Error fetching commission rate:', error);
      return DEFAULT_COMMISSION_RATE;
    }
  }

  /**
   * Calculate platform commission from total amount
   */
  static async calculateCommission(totalAmount: number): Promise<{
    platformCommission: number;
    storeAmount: number;
  }> {
    const rate = await this.getCommissionRate();
    const platformCommission = totalAmount * rate;
    const storeAmount = totalAmount - platformCommission;

    return {
      platformCommission: Math.round(platformCommission * 100) / 100, // Round to 2 decimal places
      storeAmount: Math.round(storeAmount * 100) / 100
    };
  }

  /**
   * Clear the cache (useful when commission rate is updated)
   */
  static clearCache(): void {
    cachedRate = null;
    cacheTimestamp = null;
  }

  /**
   * Get current commission rate as a percentage (e.g., "1%")
   */
  static async getCommissionRatePercent(): Promise<string> {
    const rate = await this.getCommissionRate();
    return `${(rate * 100).toFixed(0)}%`;
  }
}
