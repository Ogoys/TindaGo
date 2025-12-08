/**
 * REFUND SERVICE
 *
 * Handles refund processing for customer returns
 * Supports multiple refund methods: Cash, GCash, PayMaya, Loan
 *
 * Flow:
 * 1. Customer submits return request with refund method
 * 2. Store owner approves return
 * 3. Refund is processed based on method:
 *    - Cash: Customer collects at store
 *    - GCash/PayMaya: Refund request created for store owner to process manually
 *    - Loan: Credit applied to customer account for future purchase
 */

import { ref, push, set, get, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import type { Return } from '../../models/Return';

export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface RefundTransaction {
  id: string;
  returnId: string;
  returnNumber: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: 'cash' | 'gcash' | 'paymaya' | 'loan' | 'replace_product' | 'no_refund';
  status: RefundStatus;
  // For GCash/PayMaya
  accountNumber?: string;
  accountName?: string;
  // For Loan
  loanPaymentDate?: string;
  // Processing details
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
}

/**
 * Create a refund transaction when store owner approves a return
 */
export const createRefundTransaction = async (
  returnData: Return,
  processedBy: string
): Promise<{ success: boolean; refundId?: string; error?: string }> => {
  try {
    const refundsRef = ref(database, 'refunds');
    const newRefundRef = push(refundsRef);
    const refundId = newRefundRef.key!;

    const refundTransaction: RefundTransaction = {
      id: refundId,
      returnId: returnData.id,
      returnNumber: returnData.returnNumber,
      storeId: returnData.storeId,
      storeName: returnData.storeName,
      customerId: returnData.customerId || '',
      customerName: returnData.customerName || '',
      amount: returnData.totalRefund,
      method: returnData.refundMethod,
      status: getInitialRefundStatus(returnData.refundMethod),
      loanPaymentDate: returnData.loanPaymentDate,
      processedBy,
      notes: getRefundNotes(returnData.refundMethod, returnData.totalRefund),
      createdAt: new Date().toISOString(),
    };

    await set(newRefundRef, refundTransaction);

    // Update return record with refund reference
    const returnRef = ref(database, `return_goods/${returnData.id}`);
    await update(returnRef, {
      refundId,
      refundStatus: refundTransaction.status,
    });

    return { success: true, refundId };
  } catch (error) {
    console.error('Error creating refund transaction:', error);
    return { success: false, error: 'Failed to create refund transaction' };
  }
};

/**
 * Get initial refund status based on method
 */
const getInitialRefundStatus = (method: string): RefundStatus => {
  switch (method) {
    case 'cash':
      // Cash refunds are immediately available for pickup
      return 'processing';
    case 'gcash':
    case 'paymaya':
      // E-wallet refunds need manual processing by store owner
      return 'pending';
    case 'loan':
      // Loan credits are immediately applied
      return 'completed';
    default:
      return 'pending';
  }
};

/**
 * Get refund notes based on method
 */
const getRefundNotes = (method: string, amount: number): string => {
  const formattedAmount = `P${amount.toFixed(2)}`;

  switch (method) {
    case 'cash':
      return `Cash refund of ${formattedAmount} ready for customer pickup at store.`;
    case 'gcash':
      return `GCash refund of ${formattedAmount} pending. Store owner needs to send via GCash app.`;
    case 'paymaya':
      return `PayMaya refund of ${formattedAmount} pending. Store owner needs to send via PayMaya app.`;
    case 'loan':
      return `Store credit of ${formattedAmount} applied. Customer can use on next purchase.`;
    default:
      return `Refund of ${formattedAmount} pending processing.`;
  }
};

/**
 * Mark a refund as completed (store owner confirms payment sent)
 */
export const completeRefund = async (
  refundId: string,
  processedBy: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const refundRef = ref(database, `refunds/${refundId}`);
    const snapshot = await get(refundRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Refund not found' };
    }

    const refundData = snapshot.val() as RefundTransaction;

    await update(refundRef, {
      status: 'completed',
      processedAt: new Date().toISOString(),
      processedBy,
      notes: notes || `Refund completed by store owner`,
    });

    // Update return record
    const returnRef = ref(database, `return_goods/${refundData.returnId}`);
    await update(returnRef, {
      refundStatus: 'completed',
    });

    return { success: true };
  } catch (error) {
    console.error('Error completing refund:', error);
    return { success: false, error: 'Failed to complete refund' };
  }
};

/**
 * Mark cash refund as collected by customer
 */
export const markCashRefundCollected = async (
  refundId: string,
  collectedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const refundRef = ref(database, `refunds/${refundId}`);
    const snapshot = await get(refundRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Refund not found' };
    }

    const refundData = snapshot.val() as RefundTransaction;

    if (refundData.method !== 'cash') {
      return { success: false, error: 'This is not a cash refund' };
    }

    await update(refundRef, {
      status: 'completed',
      processedAt: new Date().toISOString(),
      notes: `Cash refund collected by customer`,
    });

    // Update return record
    const returnRef = ref(database, `return_goods/${refundData.returnId}`);
    await update(returnRef, {
      refundStatus: 'completed',
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking cash refund collected:', error);
    return { success: false, error: 'Failed to mark refund as collected' };
  }
};

/**
 * Get refund transaction by ID
 */
export const getRefundById = async (refundId: string): Promise<RefundTransaction | null> => {
  try {
    const refundRef = ref(database, `refunds/${refundId}`);
    const snapshot = await get(refundRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val() as RefundTransaction;
  } catch (error) {
    console.error('Error fetching refund:', error);
    return null;
  }
};

/**
 * Get refund instructions for customer based on method
 */
export const getRefundInstructions = (
  method: string,
  amount: number,
  storeName: string
): string => {
  const formattedAmount = `P${amount.toFixed(2)}`;

  switch (method) {
    case 'cash':
      return `Your cash refund of ${formattedAmount} is ready!\n\nPlease visit ${storeName} to collect your refund. Bring a valid ID and your return confirmation.`;
    case 'gcash':
      return `Your GCash refund of ${formattedAmount} is being processed.\n\n${storeName} will send the refund to your registered GCash number. Please allow 1-3 business days.`;
    case 'paymaya':
      return `Your PayMaya refund of ${formattedAmount} is being processed.\n\n${storeName} will send the refund to your registered PayMaya number. Please allow 1-3 business days.`;
    case 'loan':
      return `A store credit of ${formattedAmount} has been applied to your account.\n\nYou can use this credit on your next purchase at ${storeName}.`;
    default:
      return `Your refund of ${formattedAmount} is being processed.`;
  }
};
