/**
 * Image Helper - Cloudinary URL Fallback Support
 * 
 * Provides fallback support for product/store images during the transition
 * from base64 (old) to Cloudinary URLs (new - Phase 2).
 * 
 * Phase 3: Automatic Performance Optimization
 * - Automatically applies Cloudinary transformations for optimal performance
 * - Format optimization (WebP/AVIF)
 * - Quality optimization
 * - Responsive sizing
 * 
 * This ensures both old and new data display correctly with best performance.
 */

import { getOptimizedImageUrl } from '../upload/cloudinary';

export interface ImageSource {
  uri: string;
}

/**
 * Get product image source with fallback support
 * 
 * Priority:
 * 1. productImageUrl (NEW - Cloudinary URL from Phase 2) - AUTO-OPTIMIZED
 * 2. productImage (OLD - base64 data from before Phase 2)
 * 3. undefined (no image available)
 * 
 * Phase 3: Automatically applies Cloudinary optimizations for performance
 * 
 * @param product - Product object from Firebase
 * @param size - Optional size for responsive images ('small' | 'medium' | 'large')
 * @returns Image source object or undefined
 */
export function getProductImageSource(
  product: {
    productImageUrl?: string;
    productImage?: string;
  },
  size: 'small' | 'medium' | 'large' = 'medium'
): ImageSource | undefined {
  // Priority 1: Check for new Cloudinary URL (with automatic optimization)
  if (product.productImageUrl) {
    const sizes = { small: 400, medium: 800, large: 1200 };
    const optimizedUrl = getOptimizedImageUrl(product.productImageUrl, {
      width: sizes[size],
      quality: 'auto',
      format: 'auto',
    });
    return { uri: optimizedUrl };
  }
  
  // Priority 2: Fall back to old base64 data (no optimization possible)
  if (product.productImage) {
    return { uri: product.productImage };
  }
  
  // Priority 3: No image available
  return undefined;
}

/**
 * Get store logo source with fallback support
 * 
 * Priority:
 * 1. logoUrl (NEW - Cloudinary URL from Phase 2) - AUTO-OPTIMIZED
 * 2. logo (OLD - base64 data from before Phase 2)
 * 3. undefined (no logo available)
 * 
 * Phase 3: Automatically applies Cloudinary optimizations for logos
 * 
 * @param store - Store object from Firebase
 * @returns Image source object or undefined
 */
export function getStoreLogoSource(store: {
  logoUrl?: string;
  logo?: string;
}): ImageSource | undefined {
  if (store.logoUrl) {
    // Optimize logo (typically smaller, so use smaller dimensions)
    const optimizedUrl = getOptimizedImageUrl(store.logoUrl, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });
    return { uri: optimizedUrl };
  }
  
  if (store.logo) {
    return { uri: store.logo };
  }
  
  return undefined;
}

/**
 * Get store cover image source with fallback support
 * 
 * Priority:
 * 1. coverImageUrl (NEW - Cloudinary URL from Phase 2) - AUTO-OPTIMIZED
 * 2. coverImage (OLD - base64 data from before Phase 2)
 * 3. undefined (no cover image available)
 * 
 * Phase 3: Automatically applies Cloudinary optimizations for cover images
 * 
 * @param store - Store object from Firebase
 * @returns Image source object or undefined
 */
export function getStoreCoverSource(store: {
  coverImageUrl?: string;
  coverImage?: string;
}): ImageSource | undefined {
  if (store.coverImageUrl) {
    // Optimize cover image (wider format)
    const optimizedUrl = getOptimizedImageUrl(store.coverImageUrl, {
      width: 1000,
      quality: 'auto',
      format: 'auto',
    });
    return { uri: optimizedUrl };
  }
  
  if (store.coverImage) {
    return { uri: store.coverImage };
  }
  
  return undefined;
}

/**
 * Get document URL with fallback support
 * 
 * For store registration documents (permits, IDs, etc.)
 * 
 * @param document - Document object from Firebase
 * @returns Document URL string or undefined
 */
export function getDocumentUrl(document: {
  url?: string;
  uri?: string;
}): string | undefined {
  // New: Cloudinary URL
  if (document.url) {
    return document.url;
  }
  
  // Old: base64 data URI
  if (document.uri) {
    return document.uri;
  }
  
  return undefined;
}

/**
 * Get user avatar source with fallback support
 * 
 * For user profile pictures
 * 
 * Priority:
 * 1. avatarUrl (NEW - Cloudinary URL from Phase 2) - AUTO-OPTIMIZED
 * 2. avatar (OLD - base64 data from before Phase 2)
 * 3. undefined (no avatar available, show initials)
 * 
 * Phase 3: Automatically applies Cloudinary optimizations for avatars
 * 
 * @param user - User object from Firebase
 * @returns Image source object or undefined
 */
export function getUserAvatarSource(user: {
  avatarUrl?: string;
  avatar?: string;
}): ImageSource | undefined {
  if (user.avatarUrl) {
    // Optimize avatar (circular, small)
    const optimizedUrl = getOptimizedImageUrl(user.avatarUrl, {
      width: 200,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });
    return { uri: optimizedUrl };
  }
  
  if (user.avatar) {
    return { uri: user.avatar };
  }
  
  return undefined;
}
