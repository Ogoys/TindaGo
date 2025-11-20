/**
 * IMAGE UPLOAD HELPER
 *
 * Utilities for uploading images to Cloudinary
 * Handles return request photos, product images, etc.
 */

import { uploadImageToCloudinary } from '../upload/cloudinary';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a single image to Cloudinary
 * @param uri - Local file URI from image picker
 * @param folder - Cloudinary folder (e.g., 'returns', 'products')
 * @returns Promise with upload result
 */
export const uploadImage = async (
  uri: string,
  folder: string = 'images'
): Promise<ImageUploadResult> => {
  try {
    // Upload to Cloudinary
    const url = await uploadImageToCloudinary(uri, folder);
    return { success: true, url };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    };
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param uris - Array of local file URIs
 * @param folder - Cloudinary folder (e.g., 'returns', 'products')
 * @returns Promise with array of upload results
 */
export const uploadMultipleImages = async (
  uris: string[],
  folder: string = 'images'
): Promise<ImageUploadResult[]> => {
  const uploadPromises = uris.map((uri) => {
    return uploadImage(uri, folder);
  });

  return Promise.all(uploadPromises);
};

/**
 * Upload return request photos to Cloudinary
 * @param customerId - Customer ID
 * @param returnId - Return request ID
 * @param imageUris - Array of local image URIs
 * @returns Promise with array of uploaded URLs (successful uploads only)
 */
export const uploadReturnPhotos = async (
  customerId: string,
  returnId: string,
  imageUris: string[]
): Promise<string[]> => {
  // Use 'returns' folder with customer/return subfolder naming
  const folder = `returns/${customerId}/${returnId}`;
  const results = await uploadMultipleImages(imageUris, folder);

  // Return only successful uploads
  return results
    .filter(result => result.success && result.url)
    .map(result => result.url!);
};
