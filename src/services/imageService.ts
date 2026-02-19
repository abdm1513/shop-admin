import { storage, ID, getFileUrl, invalidateFileCache, handleAppwriteError } from '../lib/appwrite';
import { IMAGES_BUCKET_ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../utils/constants';

/**
 * Upload a single image file
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const fileId = ID.unique();
    await storage.createFile(
      IMAGES_BUCKET_ID,
      fileId,
      file
    );
    return fileId;
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Upload multiple image files
 */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    const fileIds = await Promise.all(uploadPromises);
    return fileIds;
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Delete an image by file ID
 */
export const deleteImage = async (fileId: string): Promise<void> => {
  try {
    await storage.deleteFile(IMAGES_BUCKET_ID, fileId);
    invalidateFileCache(fileId);
  } catch (error) {
    console.warn(`Failed to delete image ${fileId}:`, error);
    // Don't throw error for delete failures
  }
};

/**
 * Delete multiple images
 */
export const deleteImages = async (fileIds: string[]): Promise<void> => {
  try {
    const deletePromises = fileIds.map(fileId => deleteImage(fileId));
    await Promise.all(deletePromises);
  } catch (error) {
    console.warn('Failed to delete some images:', error);
  }
};

/**
 * Get image URL with optional resizing
 */
export const getImageUrl = (fileId: string, width = 0, quality = 80): string => {
  return getFileUrl(fileId, width, quality);
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): string | null => {
  if (!file) return 'File is required';
  
  if (file.size > APPWRITE_CONFIG.MAX_FILE_SIZE) {
    return `File size cannot exceed ${APPWRITE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }
  
  const isAllowedType = APPWRITE_CONFIG.ALLOWED_IMAGE_TYPES.some(
    allowedType => file.type === allowedType
  );
  
  if (!isAllowedType) {
    const allowedTypes = APPWRITE_CONFIG.ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1]).join(', ');
    return `Only ${allowedTypes} files are allowed`;
  }
  
  return null;
};