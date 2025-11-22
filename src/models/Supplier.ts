/**
 * SUPPLIER MODEL
 *
 * Data model for managing suppliers that provide inventory to sari-sari stores
 * Suppliers can be wholesalers, markets, or other retail stores
 */

export interface Supplier {
  id: string;
  storeOwnerId: string;
  name: string;
  contact?: string; // Phone number or contact info
  address?: string;
  city?: string;
  postalCode?: string;
  email?: string;
  notes?: string;

  // Statistics (calculated from purchase orders)
  totalPurchases?: number; // Total number of purchase orders
  totalSpent?: number; // Total amount spent
  lastPurchaseDate?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInput {
  name: string;
  contact?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  email?: string;
  notes?: string;
}

export interface SupplierStats {
  supplierId: string;
  supplierName: string;
  totalPurchaseOrders: number;
  totalAmountSpent: number;
  lastPurchaseDate: string | null;
  productCount: number; // Number of unique products from this supplier
}
