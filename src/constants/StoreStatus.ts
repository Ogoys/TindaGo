/**
 * Store Registration and Status Constants
 *
 * This file defines all possible statuses for store registrations and operations
 * to ensure consistency between the React Native app and web admin dashboard.
 */

export const STORE_STATUS = {
  // Registration flow statuses
  PENDING_DOCUMENTS: 'pending_documents',
  PENDING_BANK_DETAILS: 'pending_bank_details',
  PENDING: 'pending', // Standardized from 'pending_approval'

  // Admin review statuses
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',

  // Document verification statuses
  DOCUMENTS_UPLOADED: 'documents_uploaded',
  DOCUMENTS_VERIFIED: 'documents_verified',
  DOCUMENTS_REJECTED: 'documents_rejected',
} as const;

export const REGISTRATION_STATUS = {
  // Step-by-step registration progress
  STORE_DETAILS_COMPLETE: 'store_details_complete',
  DOCUMENTS_COMPLETE: 'documents_complete',
  BANK_DETAILS_COMPLETE: 'bank_details_complete',
  REGISTRATION_COMPLETE: 'registration_complete',

  // Legacy support - to be migrated
  COMPLETED_PENDING_APPROVAL: 'completed_pending_approval',
} as const;

// Status display labels for UI
export const STATUS_LABELS = {
  [STORE_STATUS.PENDING_DOCUMENTS]: 'Awaiting Documents',
  [STORE_STATUS.PENDING_BANK_DETAILS]: 'Awaiting Bank Details',
  [STORE_STATUS.PENDING]: 'Pending Review',
  [STORE_STATUS.APPROVED]: 'Approved',
  [STORE_STATUS.REJECTED]: 'Rejected',
  [STORE_STATUS.ACTIVE]: 'Active',
  [STORE_STATUS.DOCUMENTS_UPLOADED]: 'Documents Uploaded',
  [STORE_STATUS.DOCUMENTS_VERIFIED]: 'Documents Verified',
  [STORE_STATUS.DOCUMENTS_REJECTED]: 'Documents Rejected',
} as const;

// Status colors for UI components
export const STATUS_COLORS = {
  [STORE_STATUS.PENDING_DOCUMENTS]: '#FF9500', // Orange
  [STORE_STATUS.PENDING_BANK_DETAILS]: '#FF9500', // Orange
  [STORE_STATUS.PENDING]: '#007AFF', // Blue
  [STORE_STATUS.APPROVED]: '#34C759', // Green
  [STORE_STATUS.REJECTED]: '#FF3B30', // Red
  [STORE_STATUS.ACTIVE]: '#3BB77E', // TindaGo green
  [STORE_STATUS.DOCUMENTS_UPLOADED]: '#007AFF', // Blue
  [STORE_STATUS.DOCUMENTS_VERIFIED]: '#34C759', // Green
  [STORE_STATUS.DOCUMENTS_REJECTED]: '#FF3B30', // Red
} as const;

// Type definitions for TypeScript
export type StoreStatusType = typeof STORE_STATUS[keyof typeof STORE_STATUS];
export type RegistrationStatusType = typeof REGISTRATION_STATUS[keyof typeof REGISTRATION_STATUS];

// Helper functions for status checking
export const isRegistrationComplete = (status: string): boolean => {
  return status === STORE_STATUS.PENDING ||
         status === STORE_STATUS.APPROVED ||
         status === STORE_STATUS.ACTIVE ||
         status === REGISTRATION_STATUS.COMPLETED_PENDING_APPROVAL;
};

export const isStoreOperational = (status: string): boolean => {
  return status === STORE_STATUS.ACTIVE;
};

export const needsAdminReview = (status: string): boolean => {
  return status === STORE_STATUS.PENDING;
};

export const canEditStore = (status: string): boolean => {
  return status === STORE_STATUS.PENDING_DOCUMENTS ||
         status === STORE_STATUS.PENDING_BANK_DETAILS ||
         status === STORE_STATUS.DOCUMENTS_REJECTED;
};