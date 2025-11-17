/**
 * useStoreRegistration Hook
 *
 * React hook for real-time monitoring of store registration status
 * and handling registration flow state management.
 */

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { StoreRegistrationService, StoreRegistrationData, NotificationService } from '@/services';
import { STORE_STATUS, isRegistrationComplete, needsAdminReview } from '@/lib/constants';

export interface UseStoreRegistrationReturn {
  // Status data
  registrationData: StoreRegistrationData | null;
  status: string | null;
  loading: boolean;
  error: string | null;

  // Status checks
  isComplete: boolean;
  needsReview: boolean;
  canEdit: boolean;

  // Actions
  refreshStatus: () => Promise<void>;
  updateStatus: (newStatus: string) => Promise<void>;
}

export const useStoreRegistration = (userId?: string): UseStoreRegistrationReturn => {
  const [registrationData, setRegistrationData] = useState<StoreRegistrationData | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  const targetUserId = userId || auth.currentUser?.uid;

  // Refresh status from Firebase
  const refreshStatus = useCallback(async () => {
    if (!targetUserId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await StoreRegistrationService.getRegistrationData(targetUserId);
      setRegistrationData(data);
      setStatus(data?.status || null);
    } catch (err: any) {
      console.error('❌ Error fetching registration status:', err);
      setError(err.message || 'Failed to fetch registration status');
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  // Update status (admin function)
  const updateStatus = useCallback(async (newStatus: string) => {
    if (!targetUserId) {
      throw new Error('User not authenticated');
    }

    try {
      await StoreRegistrationService.updateStoreStatus(targetUserId, newStatus);
      setStatus(newStatus);
    } catch (err: any) {
      console.error('❌ Error updating status:', err);
      throw err;
    }
  }, [targetUserId]);

  // Setup real-time listener
  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up real-time listener for user:', targetUserId);

    // Subscribe to real-time updates
    const unsubscribe = StoreRegistrationService.subscribeToRegistrationUpdates(
      targetUserId,
      (data) => {
        console.log('📱 Registration data updated:', data?.status);
        setRegistrationData(data);

        const newStatus = data?.status || null;
        setStatus(newStatus);
        setLoading(false);

        // Send notification if status changed
        if (previousStatus && newStatus && previousStatus !== newStatus) {
          console.log('🔔 Status changed from', previousStatus, 'to', newStatus);

          // Send local notification for status changes
          NotificationService.sendStatusNotification(newStatus, data?.businessInfo?.storeName);
        }

        setPreviousStatus(newStatus);
      }
    );

    // Initial load
    refreshStatus();

    // Cleanup subscription
    return () => {
      console.log('🔄 Cleaning up real-time listener');
      unsubscribe();
    };
  }, [targetUserId, refreshStatus, previousStatus]);

  // Setup push notifications on mount
  useEffect(() => {
    if (auth.currentUser) {
      NotificationService.setupPushNotifications().catch(() => {
        // Silently handle push notification setup errors
        // This is optional functionality and shouldn't block the app
      });
    }
  }, []);

  // Computed values
  const isComplete = status ? isRegistrationComplete(status) : false;
  const needsReview = status ? needsAdminReview(status) : false;
  const canEdit = status ?
    status === STORE_STATUS.PENDING_DOCUMENTS ||
    status === STORE_STATUS.PENDING_BANK_DETAILS ||
    status === STORE_STATUS.DOCUMENTS_REJECTED : false;

  return {
    // Status data
    registrationData,
    status,
    loading,
    error,

    // Status checks
    isComplete,
    needsReview,
    canEdit,

    // Actions
    refreshStatus,
    updateStatus,
  };
};