/**
 * Cart Model
 *
 * Defines the shopping cart data structure
 */

export interface Cart {
  userId: string;
  storeId?: string;           // Current store (can only order from one store at a time)
  storeName?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage?: string;      // Legacy base64 image (optional for backward compatibility)
  productImageUrl?: string;   // NEW - Cloudinary URL (Phase 2)
  storeId: string;
  storeName: string;
  quantity: number;
  price: number;
  weight?: string;
  unit?: string;
  stock: number;
  subtotal: number;
  isAvailable: boolean;       // Check if product is still in stock
}

export interface CartUpdate {
  productId: string;
  quantity: number;
}

export interface AddToCartRequest {
  userId: string;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    storeId: string;
    storeName: string;
    weight?: string;
    unit?: string;
    stock: number;
  };
  quantity: number;
}
