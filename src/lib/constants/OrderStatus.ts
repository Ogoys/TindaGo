/**
 * Order Status Constants
 *
 * Defines all possible statuses for customer orders in the TindaGo system.
 */

export const ORDER_STATUS = {
  PENDING: 'pending',           // Order placed, waiting for store confirmation
  CONFIRMED: 'confirmed',       // Store confirmed the order
  PREPARING: 'preparing',       // Store is preparing the order
  READY: 'ready',              // Order ready for pickup
  PICKED_UP: 'picked_up',      // Customer picked up the order
  COMPLETED: 'completed',      // Order completed successfully
  CANCELLED: 'cancelled',      // Order cancelled by customer or store
} as const;

// Status display labels for UI
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.READY]: 'Ready for Pickup',
  [ORDER_STATUS.PICKED_UP]: 'Picked Up',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
} as const;

// Status colors for UI components
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#FF9500',      // Orange
  [ORDER_STATUS.CONFIRMED]: '#007AFF',    // Blue
  [ORDER_STATUS.PREPARING]: '#5856D6',    // Purple
  [ORDER_STATUS.READY]: '#3BB77E',        // TindaGo green
  [ORDER_STATUS.PICKED_UP]: '#34C759',    // Green
  [ORDER_STATUS.COMPLETED]: '#34C759',    // Green
  [ORDER_STATUS.CANCELLED]: '#FF3B30',    // Red
} as const;

// Type definition for TypeScript
export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Helper functions for order status checking
export const isOrderActive = (status: string): boolean => {
  return status === ORDER_STATUS.PENDING ||
         status === ORDER_STATUS.CONFIRMED ||
         status === ORDER_STATUS.PREPARING ||
         status === ORDER_STATUS.READY;
};

export const isOrderCompleted = (status: string): boolean => {
  return status === ORDER_STATUS.COMPLETED ||
         status === ORDER_STATUS.PICKED_UP;
};

export const canCancelOrder = (status: string): boolean => {
  return status === ORDER_STATUS.PENDING ||
         status === ORDER_STATUS.CONFIRMED;
};

export const canModifyOrder = (status: string): boolean => {
  return status === ORDER_STATUS.PENDING;
};
