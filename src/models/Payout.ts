/**
 * PAYOUT MODEL
 * 
 * Represents a payout/withdrawal request from store owner to admin
 * Tracks the complete lifecycle from request to completion/rejection
 */

export type PayoutStatus = 'pending' | 'approved' | 'completed' | 'rejected';
export type PaymentMethod = 'gcash' | 'paymaya' | 'bank';

export interface PayoutStatusHistory {
  status: PayoutStatus;
  timestamp: string;
  note?: string;
  actionBy?: string;
}

export interface Payout {
  // Identification
  payoutId: string;
  storeId: string;
  storeName: string;
  storeOwnerName: string;
  storeOwnerEmail?: string;

  // Payout details
  amount: number;
  method: PaymentMethod;
  accountName: string;
  accountNumber: string;

  // Status tracking
  status: PayoutStatus;
  createdAt: string;
  requestedAt: string;

  // Admin workflow fields
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  completedBy?: string | null;
  completedAt?: string | null;
  completionNote?: string | null;

  // Audit trail
  statusHistory: PayoutStatusHistory[];
}

/**
 * Firebase structure for payout indexing:
 * 
 * payouts/
 *   ${payoutId}/
 *     - All payout data
 * 
 * payouts_by_store/
 *   ${storeId}/
 *     ${payoutId}/
 *       - amount
 *       - status
 *       - createdAt
 * 
 * payouts_by_status/
 *   ${status}/
 *     ${payoutId}/
 *       - storeId
 *       - storeName
 *       - amount
 *       - createdAt
 * 
 * admin_notifications/
 *   ${timestamp}/
 *     - type: 'payout_request'
 *     - payoutId
 *     - storeId
 *     - storeName
 *     - amount
 *     - method
 *     - status: 'unread' | 'read'
 *     - createdAt
 */
