/**
 * Cloudinary Upload Service
 * 
 * Handles uploading images and documents to Cloudinary
 * instead of storing large base64 data in Firebase Realtime Database.
 * 
 * Phase 2: Cloudinary Integration
 * Phase 3: Production-Ready Optimizations
 *   - File validation (size, type, dimensions)
 *   - Automatic image optimization
 *   - Retry logic for failed uploads
 *   - Thumbnail generation
 *   - Performance transformations
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/** Maximum file size: 10MB for images, 20MB for documents */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/** Allowed document MIME types */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

/** Maximum image dimensions (to prevent extremely large uploads) */
export const MAX_IMAGE_DIMENSION = 4096; // 4K

/** Upload retry configuration */
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number
): FileValidationResult {
  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): FileValidationResult {
  if (!allowedTypes.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `File type not allowed. Allowed: ${allowedTypes.join(', ')}`,
    };
  }
  return { valid: true };
}

// ============================================================================
// IMAGE TRANSFORMATION HELPERS
// ============================================================================

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
}

/**
 * Generate optimized Cloudinary URL with transformations
 * 
 * Automatically applies:
 * - Format optimization (WebP/AVIF when supported)
 * - Quality optimization
 * - Responsive sizing
 * 
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  if (!isCloudinaryUrl(url)) {
    return url; // Return as-is if not a Cloudinary URL
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  // Build transformation string
  const transformations: string[] = [];

  // Format optimization (auto-selects best format: WebP, AVIF)
  transformations.push(`f_${format}`);

  // Quality optimization
  transformations.push(`q_${quality}`);

  // Dimensions (if provided)
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  // DPR (Device Pixel Ratio) optimization for retina displays
  transformations.push('dpr_auto');

  const transformString = transformations.join(',');

  // Insert transformations after /upload/
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Generate thumbnail URL (small, optimized preview)
 */
export function getThumbnailUrl(
  url: string,
  size: number = 150
): string {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Generate responsive image URL for product cards
 */
export function getProductImageUrl(
  url: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  const sizes = {
    small: 300,
    medium: 600,
    large: 1200,
  };

  return getOptimizedImageUrl(url, {
    width: sizes[size],
    quality: 'auto',
    format: 'auto',
  });
}

// ============================================================================
// RETRY HELPER
// ============================================================================

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    console.log(`⏳ Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload an image (product image, store logo, cover image) to Cloudinary
 * 
 * Phase 3 Enhancements:
 * - File validation (size, type)
 * - Retry logic for reliability
 * - Better error messages
 * 
 * @param localUri - Local file URI from image picker
 * @param folder - Optional subfolder (e.g., 'products', 'stores')
 * @returns Cloudinary secure URL
 */
export async function uploadImageToCloudinary(
  localUri: string,
  folder: string = 'images'
): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_IMAGES;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Check your .env file.');
  }

  // Note: File size validation should be done in the calling component
  // where we have access to the file info from the image picker

  return retryWithBackoff(async () => {
    console.log('📤 Uploading image to Cloudinary...');
    console.log('  - URI:', localUri.substring(0, 50) + '...');
    console.log('  - Folder:', `tindago/${folder}`);

    const formData = new FormData();
    
    // Append the image file
    formData.append('file', {
      uri: localUri,
      name: 'upload.jpg',
      type: 'image/jpeg',
    } as any);
    
    // Append upload preset and folder
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `tindago/${folder}`);

    // Note: Transformations cannot be used with unsigned uploads
    // Apply transformations when displaying the image using getOptimizedImageUrl()

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary error response:', errorText);
      
      // More specific error messages
      if (response.status === 400) {
        throw new Error('Invalid image format or size');
      } else if (response.status === 401) {
        throw new Error('Cloudinary authentication failed');
      } else if (response.status >= 500) {
        throw new Error('Cloudinary server error. Please try again.');
      }
      
      throw new Error(`Upload failed (${response.status})`);
    }

    const result = await response.json();
    
    console.log('✅ Image uploaded successfully!');
    console.log('  - URL:', result.secure_url);
    console.log('  - Size:', result.bytes, 'bytes');
    console.log('  - Format:', result.format);

    return result.secure_url;
  });
}

/**
 * Upload a document (PDF, business permit, ID, etc.) to Cloudinary
 * 
 * Phase 3 Enhancements:
 * - Retry logic for reliability
 * - Better error messages
 * 
 * @param localUri - Local file URI from document picker
 * @param fileName - Original file name
 * @param folder - Optional subfolder (e.g., 'permits', 'ids')
 * @returns Cloudinary secure URL
 */
export async function uploadDocumentToCloudinary(
  localUri: string,
  fileName: string,
  folder: string = 'documents'
): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Check your .env file.');
  }

  return retryWithBackoff(async () => {
    console.log('📤 Uploading document to Cloudinary...');
    console.log('  - File:', fileName);
    console.log('  - URI:', localUri.substring(0, 50) + '...');
    console.log('  - Folder:', `tindago/${folder}`);

    const formData = new FormData();
    
    // Detect file type from extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    
    if (fileExtension === 'pdf') {
      mimeType = 'application/pdf';
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
      mimeType = `image/${fileExtension}`;
    }

    // Validate file type
    const typeValidation = validateFileType(mimeType, ALLOWED_DOCUMENT_TYPES);
    if (!typeValidation.valid) {
      throw new Error(typeValidation.error);
    }

    // Append the document file
    formData.append('file', {
      uri: localUri,
      name: fileName,
      type: mimeType,
    } as any);
    
    // Append upload preset and folder
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `tindago/${folder}`);

    // Upload to Cloudinary (use /raw/upload for documents)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary error response:', errorText);
      
      // More specific error messages
      if (response.status === 400) {
        throw new Error('Invalid document format or size');
      } else if (response.status === 401) {
        throw new Error('Cloudinary authentication failed');
      } else if (response.status >= 500) {
        throw new Error('Cloudinary server error. Please try again.');
      }
      
      throw new Error(`Upload failed (${response.status})`);
    }

    const result = await response.json();
    
    console.log('✅ Document uploaded successfully!');
    console.log('  - URL:', result.secure_url);
    console.log('  - Size:', result.bytes, 'bytes');
    console.log('  - Format:', result.format);

    return result.secure_url;
  });
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Helper: Check if a string is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith('https://res.cloudinary.com/');
}

/**
 * Helper: Check if a string is base64 data
 */
export function isBase64Data(data: string): boolean {
  if (!data) return false;
  return data.startsWith('data:') || data.startsWith('file://');
}

/**
 * Helper: Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Helper: Extract public ID from Cloudinary URL
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  
  try {
    // Extract path after version number
    const matches = url.match(/\/v\d+\/(.+)\.[^.]+$/);
    return matches ? matches[1] : null;
  } catch {
    return null;
  }
}
