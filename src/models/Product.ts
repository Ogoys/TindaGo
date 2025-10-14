/**
 * Product Model
 *
 * Defines the product data structure for the TindaGo marketplace
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  storeId: string;
  storeName: string;
  imageUrl: string;
  images?: string[];          // Multiple product images
  stock: number;
  weight?: string;            // "500g", "1kg", etc.
  unit?: string;              // "kg", "g", "pcs", "pack"
  rating?: number;            // 0-5 stars
  totalReviews?: number;
  isFeatured: boolean;
  isBestSelling: boolean;
  isPopular: boolean;
  tags?: string[];            // ["fresh", "organic", "sale"]
  discount?: {
    percentage: number;
    validUntil?: Date;
  };
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  productCount: number;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isBestSelling?: boolean;
  isPopular?: boolean;
  searchQuery?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
}
