/**
 * DAMAGE MODEL
 * 
 * Data model for tracking damaged, expired, or spoiled products
 * Used for inventory loss tracking
 */

export type DamageReason = 'expired' | 'damaged' | 'spoiled' | 'broken' | 'other';

export interface DamageItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalLoss: number; // quantity * price
  productSize: string;
  unit: string;
  reason: DamageReason;
  notes?: string;
}

export interface Damage {
  id: string;
  storeId: string;
  storeOwnerId: string;
  storeName: string;
  items: DamageItem[];
  totalLoss: number; // Sum of all item losses
  createdAt: string;
  recordedBy: string;
}

export interface DamageInput {
  items: DamageItem[];
}

export const DAMAGE_REASONS: { value: DamageReason; label: string }[] = [
  { value: 'expired', label: 'Expired' },
  { value: 'damaged', label: 'Damaged Package' },
  { value: 'spoiled', label: 'Spoiled/Rotten' },
  { value: 'broken', label: 'Broken/Shattered' },
  { value: 'other', label: 'Other' },
];
