/**
 * RETURN MODEL
 * 
 * Data model for tracking customer returns (defective, expired, wrong item, etc.)
 * Used for inventory restoration and refund processing
 */

export type ReturnReason = 
  | 'defective' 
  | 'expired' 
  | 'wrong_item' 
  | 'changed_mind' 
  | 'quality_issues' 
  | 'other';

export type ReturnCondition = 'sellable' | 'unsellable';

export type RefundMethod = 'cash' | 'gcash' | 'paymaya' | 'loan';

export type ReturnStatus = 'pending' | 'resolved' | 'rejected';

export interface ReturnItem {
  productId: string;
  productName: string;
  productImage?: string; // Legacy base64 (optional)
  productImageUrl?: string; // New Cloudinary URL (optional)
  quantity: number;
  quantityReturned?: number; // Actual quantity being returned (may differ from ordered quantity)
  price: number; // Original price per unit
  refundAmount: number; // quantity * price
  productSize: string;
  unit: string;

  // Return Details
  reason: ReturnReason | string; // Can be predefined reason or custom text
  condition: ReturnCondition;
  notes?: string;

  // Inventory Impact
  restoreToInventory: boolean; // true if sellable
}

export interface Return {
  id: string;
  returnNumber: string; // e.g., "RET-2025-001"
  storeId: string;
  storeOwnerId: string;
  storeName: string;

  // Customer Info
  customerName?: string;
  customerId?: string; // For app orders
  orderNumber?: string; // Original order reference

  // Items
  items: ReturnItem[];

  // Refund
  refundMethod: RefundMethod;
  totalRefund: number;

  // Status
  status: ReturnStatus;

  // Additional Details
  additionalDetails?: string; // Customer notes/explanation
  photoUrls?: string[]; // Photos of damaged/defective items

  // Loan Details (if refundMethod is 'loan')
  loanPaymentDate?: string; // ISO string - date customer will repurchase

  // Metadata
  createdAt: string;
  processedAt?: string;
  processedBy: string;
  notes?: string;
}

export interface ReturnInput {
  customerName?: string;
  customerId?: string;
  orderNumber?: string;
  items: ReturnItem[];
  refundMethod: RefundMethod;
  notes?: string;
}

/**
 * Return reasons with labels for UI (no icons)
 */
export const RETURN_REASONS: { value: ReturnReason; label: string }[] = [
  { value: 'defective', label: 'Defective/Damaged' },
  { value: 'expired', label: 'Expired' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'quality_issues', label: 'Quality Issues' },
  { value: 'other', label: 'Other (Specify Below)' },
];

/**
 * Refund methods with labels for UI
 */
export const REFUND_METHODS: { value: RefundMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'gcash', label: 'GCash' },
  { value: 'paymaya', label: 'PayMaya' },
  { value: 'loan', label: 'Loan (Pay Later)' },
];

/**
 * Generate return number
 * Format: RET-YYYY-XXX (e.g., RET-2025-001)
 */
export const generateReturnNumber = (count: number): string => {
  const year = new Date().getFullYear();
  const paddedCount = String(count + 1).padStart(3, '0');
  return `RET-${year}-${paddedCount}`;
};
