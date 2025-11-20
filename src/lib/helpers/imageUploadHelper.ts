/**
 * IMAGE UPLOAD HELPER
 *
 * Utilities for uploading images to Firebase Storage
 * Handles return request photos, product images, etc.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../FirebaseConfig';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a single image to Firebase Storage
 * @param uri - Local file URI from image picker
 * @param path - Storage path (e.g., 'returns/customer123/image1.jpg')
 * @returns Promise with upload result
 */
export const uploadImage = async (
  uri: string,
  path: string
): Promise<ImageUploadResult> => {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload blob
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Failed to upload image' };
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param uris - Array of local file URIs
 * @param basePath - Base storage path (e.g., 'returns/customer123')
 * @returns Promise with array of upload results
 */
export const uploadMultipleImages = async (
  uris: string[],
  basePath: string
): Promise<ImageUploadResult[]> => {
  const uploadPromises = uris.map((uri, index) => {
    const fileName = `image_${Date.now()}_${index}.jpg`;
    const path = `${basePath}/${fileName}`;
    return uploadImage(uri, path);
  });

  return Promise.all(uploadPromises);
};

/**
 * Upload return request photos
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
  const basePath = `returns/${customerId}/${returnId}`;
  const results = await uploadMultipleImages(imageUris, basePath);

  // Return only successful uploads
  return results
    .filter(result => result.success && result.url)
    .map(result => result.url!);
};
