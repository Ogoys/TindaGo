/**
 * Reviews API
 *
 * Firebase operations for review and rating data
 */

import { ref, get, query, orderByChild, equalTo, push, set, update } from 'firebase/database';
import { database } from '../../../FirebaseConfig';

// Type definitions (inline since @/models may not be accessible)
interface Review {
  id?: string;
  userId?: string;
  userName?: string;
  customerId?: string;
  customerName?: string;
  productId?: string;
  storeId?: string;
  orderId?: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  updatedAt?: string;
  helpful?: number;
  reported?: boolean;
}

interface ProductRating {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

interface StoreRating {
  storeId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

/**
 * Add a review for a product
 */
export async function addProductReview(
  userId: string,
  userName: string,
  productId: string,
  rating: number,
  comment: string,
  images?: string[]
): Promise<boolean> {
  try {
    const reviewsRef = ref(database, 'reviews');
    const newReviewRef = push(reviewsRef);

    const review: Omit<Review, 'id'> = {
      userId,
      userName,
      productId,
      rating,
      comment,
      images: images || [],
      createdAt: new Date().toISOString(),
      helpful: 0,
      reported: false,
    };

    await set(newReviewRef, review);

    // Update product rating
    await updateProductRating(productId);

    return true;
  } catch (error) {
    console.error('Error adding product review:', error);
    return false;
  }
}

/**
 * Add a review for a store
 */
export async function addStoreReview(
  userId: string,
  userName: string,
  storeId: string,
  rating: number,
  comment: string,
  images?: string[]
): Promise<boolean> {
  try {
    const reviewsRef = ref(database, 'reviews');
    const newReviewRef = push(reviewsRef);

    const review: Omit<Review, 'id'> = {
      userId,
      userName,
      storeId,
      rating,
      comment,
      images: images || [],
      createdAt: new Date().toISOString(),
      helpful: 0,
      reported: false,
    };

    await set(newReviewRef, review);

    // Update store rating
    await updateStoreRating(storeId);

    return true;
  } catch (error) {
    console.error('Error adding store review:', error);
    return false;
  }
}

/**
 * Fetch reviews for a product
 */
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  try {
    const reviewsRef = ref(database, 'reviews');
    const productReviewsQuery = query(reviewsRef, orderByChild('productId'), equalTo(productId));
    const snapshot = await get(productReviewsQuery);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(reviewId => ({
        id: reviewId,
        ...data[reviewId]
      })) as Review[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
}

/**
 * Fetch reviews for a store
 */
export async function fetchStoreReviews(storeId: string): Promise<Review[]> {
  try {
    const reviewsRef = ref(database, 'reviews');
    const storeReviewsQuery = query(reviewsRef, orderByChild('storeId'), equalTo(storeId));
    const snapshot = await get(storeReviewsQuery);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(reviewId => ({
        id: reviewId,
        ...data[reviewId]
      })) as Review[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching store reviews:', error);
    return [];
  }
}

/**
 * Get product rating statistics
 */
export async function getProductRating(productId: string): Promise<ProductRating | null> {
  try {
    const reviews = await fetchProductReviews(productId);

    if (reviews.length === 0) {
      return null;
    }

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;

    reviews.forEach(review => {
      totalRating += review.rating;
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      productId,
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Error getting product rating:', error);
    return null;
  }
}

/**
 * Get store rating statistics
 */
export async function getStoreRating(storeId: string): Promise<StoreRating | null> {
  try {
    const reviews = await fetchStoreReviews(storeId);

    if (reviews.length === 0) {
      return null;
    }

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;

    reviews.forEach(review => {
      totalRating += review.rating;
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      storeId,
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  } catch (error) {
    console.error('Error getting store rating:', error);
    return null;
  }
}

/**
 * Update product rating in products collection
 */
async function updateProductRating(productId: string): Promise<void> {
  try {
    const rating = await getProductRating(productId);

    if (rating) {
      const productRef = ref(database, `products/${productId}`);
      await update(productRef, {
        rating: rating.averageRating,
        totalReviews: rating.totalReviews,
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

/**
 * Update store rating in stores collection
 */
export async function updateStoreRating(storeId: string): Promise<void> {
  try {
    const rating = await getStoreRating(storeId);

    if (rating) {
      const storeRef = ref(database, `stores/${storeId}`);
      await update(storeRef, {
        rating: rating.averageRating,
        totalReviews: rating.totalReviews,
      });
    }
  } catch (error) {
    console.error('Error updating store rating:', error);
  }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    const reviewRef = ref(database, `reviews/${reviewId}`);
    const snapshot = await get(reviewRef);

    if (snapshot.exists()) {
      const currentHelpful = snapshot.val().helpful || 0;
      await update(reviewRef, {
        helpful: currentHelpful + 1,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return false;
  }
}

/**
 * Report a review
 */
export async function reportReview(reviewId: string): Promise<boolean> {
  try {
    const reviewRef = ref(database, `reviews/${reviewId}`);
    await update(reviewRef, {
      reported: true,
      reportedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error reporting review:', error);
    return false;
  }
}
