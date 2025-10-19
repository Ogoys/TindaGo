/**
 * Review Model
 *
 * Represents a product or store review
 */

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string;
  storeId?: string;
  rating: number; // 1-5
  comment: string;
  images?: string[]; // Array of image URLs
  createdAt: string;
  updatedAt?: string;
  helpful: number; // Count of helpful votes
  reported: boolean;
}

export interface ProductRating {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface StoreRating {
  storeId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
