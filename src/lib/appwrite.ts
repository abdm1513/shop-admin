// lib/appwrite.ts
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const requiredEnvVars = {
  endpoint: 'VITE_APPWRITE_ENDPOINT',
  projectId: 'VITE_APPWRITE_PROJECT_ID',
  databaseId: 'VITE_APPWRITE_DATABASE_ID',
  productsCollectionId: 'VITE_APPWRITE_PRODUCTS_COLLECTION_ID',
  categoriesCollectionId: 'VITE_APPWRITE_CATEGORIES_COLLECTION_ID',
  bannersCollectionId: 'VITE_APPWRITE_BANNERS_COLLECTION_ID',
  ordersCollectionId: 'VITE_APPWRITE_ORDERS_COLLECTION_ID',
  adminUsersCollectionId: 'VITE_APPWRITE_ADMIN_USERS_COLLECTION_ID',
  imagesBucketId: 'VITE_APPWRITE_IMAGES_BUCKET_ID'
} as const;

const getEnv = (key: keyof typeof requiredEnvVars): string => {
  const varName = requiredEnvVars[key];
  const value = import.meta.env[varName];
  if (!value && import.meta.env.PROD) {
    throw new Error(`CRITICAL: Appwrite variable ${varName} is missing.`);
  }
  return value || '';
};

export const client = new Client();
client
  .setEndpoint(getEnv('endpoint'))
  .setProject(getEnv('projectId'));

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = getEnv('databaseId');
export const PRODUCTS_COLLECTION_ID = getEnv('productsCollectionId');
export const CATEGORIES_COLLECTION_ID = getEnv('categoriesCollectionId');
export const BANNERS_COLLECTION_ID = getEnv('bannersCollectionId');
export const ORDERS_COLLECTION_ID = getEnv('ordersCollectionId');
export const ADMIN_USERS_COLLECTION_ID = getEnv('adminUsersCollectionId');
export const IMAGES_BUCKET_ID = getEnv('imagesBucketId');

const fileUrlCache = new Map<string, string>();

export const getFileUrl = (fileId: string, width = 0, quality = 80): string => {
  if (!fileId) return '';
  
  // If it's already a full URL, return it
  if (fileId.startsWith('http')) return fileId;
  
  // If it's a base64 data URL, return it
  if (fileId.startsWith('data:')) return fileId;
  
  // If it's a blob URL, return it
  if (fileId.startsWith('blob:')) return fileId;

  const cacheKey = `${fileId}-${width}-${quality}`;
  if (fileUrlCache.has(cacheKey)) return fileUrlCache.get(cacheKey)!;

  const endpoint = getEnv('endpoint');
  const project = getEnv('projectId');
  const bucket = getEnv('imagesBucketId');

  const mode = width > 0 ? 'preview' : 'view';
  let url = `${endpoint}/storage/buckets/${bucket}/files/${fileId}/${mode}?project=${project}`;
  
  if (width > 0) url += `&width=${width}&quality=${quality}`;

  fileUrlCache.set(cacheKey, url);
  return url;
};

export const invalidateFileCache = (fileId: string) => {
  for (const key of fileUrlCache.keys()) {
    if (key.startsWith(fileId)) fileUrlCache.delete(key);
  }
};

export const handleAppwriteError = (error: any) => {
  console.error("Admin Operation Failed:", error);
  
  // Check for specific Appwrite errors
  if (error?.message?.includes('Invalid document structure')) {
    return "Invalid data format. Please check all fields and try again.";
  }
  
  if (error?.type === 'document_invalid_structure') {
    return "The data format is invalid. Make sure all required fields are filled correctly.";
  }
  
  if (error?.code === 400) {
    return "Bad request. Please check your input data.";
  }
  
  if (error?.code === 404) {
    return "Resource not found. It may have been deleted.";
  }
  
  if (error?.code === 401) {
    return "Authentication failed. Please log in again.";
  }
  
  return error?.message || "An unexpected error occurred in the database.";
};

// Helper to prepare data for Appwrite (ensures JSON serializable)
export const prepareAppwriteData = (data: Record<string, any>): Record<string, any> => {
  const prepared: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      // Ensure arrays are JSON serializable
      prepared[key] = JSON.stringify(value);
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      // Stringify nested objects
      prepared[key] = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      // Booleans need to be converted to strings for some Appwrite versions
      prepared[key] = value.toString();
    } else {
      prepared[key] = value;
    }
  }
  
  return prepared;
};

export { ID, Query };

