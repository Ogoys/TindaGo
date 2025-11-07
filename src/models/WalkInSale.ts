/**
 * WALK-IN SALE MODEL
 * 
 * Data model for walk-in sales transactions
 * Used for manual sales recording at physical store
 */

export interface WalkInSaleItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
  productSize: string;
  unit: string;
}

export interface WalkInSale {
  id: string;
  saleType: 'walk-in';
  storeId: string;
  storeOwnerId: string;
  storeName: string;
  items: WalkInSaleItem[];
  totalAmount: number;
  paymentMethod: 'cash';
  customerName?: string;
  createdAt: string;
  recordedBy: string;
}

export interface WalkInSaleInput {
  items: WalkInSaleItem[];
  customerName?: string;
}
