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
  tax: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  pickupTime?: string;        // ISO string or Date string
  notes?: string;
  paymentMethod: 'cash' | 'gcash' | 'paymaya';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;          // ISO string
  updatedAt: string;          // ISO string
  completedAt?: string;       // ISO string
  cancelledAt?: string;       // ISO string
  cancellationReason?: string;
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
