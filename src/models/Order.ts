/**
 * Order Model
 *
 * Defines the order data structure for pickup-only orders
 */

export interface Order {
  id: string;
  orderNumber: string;        // "ORD-2024-001"
  customerId: string;
  customerName: string;
  customerPhone: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;            // Same as subtotal (no tax added to customer)
  // Platform commission (1%) is deducted from store owner's earnings, not added to customer's bill
  xenditInvoiceId?: string;      // Xendit invoice ID (for online payments)
  platformCommission?: number;   // 1% commission amount
  storeAmount?: number;          // Amount store owner receives (total - commission)
  status: OrderStatus;
  pickupTime?: string;        // ISO string or Date string
  notes?: string;
  paymentMethod: 'cash' | 'online' | 'gcash' | 'paymaya' | 'debt';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'unpaid';
  // Debt/Loan payment fields
  isDebtPayment?: boolean;       // Flag for debt-based payment
  debtDueDate?: string;          // ISO string - when payment is due
  debtPaidDate?: string;         // ISO string - when debt was paid
  debtStatus?: 'pending' | 'paid' | 'overdue'; // Current debt status
  createdAt: string;          // ISO string
  updatedAt: string;          // ISO string
  completedAt?: string;       // ISO string
  cancelledAt?: string;       // ISO string
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'store'; // Who cancelled the order
  hasReview?: boolean;        // Whether customer has submitted a review
  feedbackGiven?: boolean;    // Flag to prevent OrderProcessCompleteModal from showing again
  reviewId?: string;          // Firebase review document ID
  reviewedAt?: string;        // ISO string - when review was submitted

  // Return tracking (optional)
  hasReturns?: boolean;
  allItemsReturned?: boolean;
  returnRequestIds?: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  weight?: string;
  unit?: string;
  subtotal: number;
  notes?: string;

  // Return tracking (optional)
  returnStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  quantityReturned?: number; // cumulative approved returned qty for this item
  returnRequestId?: string;  // latest return request id involving this item
  returnRequestedAt?: string;
  returnProcessedAt?: string;
}

export type OrderStatus =
  | 'pending'           // Order placed, waiting for store confirmation
  | 'confirmed'         // Store confirmed the order
  | 'preparing'         // Store is preparing the order
  | 'ready'            // Order ready for pickup
  | 'picked_up'        // Customer picked up the order
  | 'completed'        // Order completed successfully
  | 'cancelled';       // Order cancelled

export interface OrderHistory {
  orderId: string;
  status: OrderStatus;
  message: string;
  timestamp: string;          // ISO string
  updatedBy?: string;
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}
