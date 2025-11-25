/**
 * PURCHASE ORDER MODEL
 *
 * Data model for tracking inventory restocking from suppliers/stores
 * Used for cost tracking and inventory management
 */

export type PurchaseOrderStatus = 'pending' | 'received' | 'cancelled';

export type PurchasePaymentMethod = 'cash' | 'gcash' | 'paymaya' | 'debt';

export type PurchasePaymentStatus = 'paid' | 'unpaid';

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  productImage?: string;       // Legacy base64 field
  productImageUrl?: string;    // New Cloudinary URL field
  quantity: number;
  costPerUnit: number; // How much you PAID per unit
  subtotal: number; // quantity * costPerUnit
  productSize: string;
  unit: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseOrderNumber: string; // e.g., "PO-2025-001"
  storeId: string;
  storeOwnerId: string;
  storeName: string;

  // Supplier Information (optional - sari-sari stores buy from various places)
  supplierName?: string; // "Puregold", "SM", "Divisoria", "Local Market", etc.
  supplierContact?: string;

  // Items purchased
  items: PurchaseOrderItem[];

  // Cost tracking
  totalCost: number; // Total amount paid to supplier

  // Payment tracking
  paymentMethod?: PurchasePaymentMethod; // 'cash' or 'debt'
  paymentStatus?: PurchasePaymentStatus; // 'paid' or 'unpaid'

  // Status
  status: PurchaseOrderStatus;

  // Dates
  purchaseDate: string; // When items were purchased
  receivedDate?: string; // When marked as received

  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
  recordedBy: string;
}

export interface PurchaseOrderInput {
  supplierName?: string;
  supplierContact?: string;
  items: PurchaseOrderItem[];
  purchaseDate: string;
  notes?: string;
  paymentMethod?: PurchasePaymentMethod;
  paymentStatus?: PurchasePaymentStatus;
}

/**
 * Generate purchase order number
 * Format: PO-YYYY-XXX (e.g., PO-2025-001)
 */
export const generatePurchaseOrderNumber = (count: number): string => {
  const year = new Date().getFullYear();
  const paddedCount = String(count + 1).padStart(3, '0');
  return `PO-${year}-${paddedCount}`;
};

/**
 * Payment method options for purchase orders
 */
export const PURCHASE_PAYMENT_METHODS = [
  { value: 'cash' as PurchasePaymentMethod, label: 'Cash', icon: 'cash' },
  { value: 'gcash' as PurchasePaymentMethod, label: 'GCash', icon: 'gcash' },
  { value: 'paymaya' as PurchasePaymentMethod, label: 'PayMaya', icon: 'paymaya' },
  { value: 'debt' as PurchasePaymentMethod, label: 'Debt/Loan', icon: 'debt' },
];
