import { databases, ID, Query, handleAppwriteError } from '../lib/appwrite';
import { DATABASE_ID, PRODUCTS_COLLECTION_ID } from '../lib/appwrite';
import { Product, ProductFormValues, mapDocumentToProduct } from '../types';
import { uploadImages, deleteImages } from './imageService';
import { APPWRITE_CONFIG } from '../utils/constants';

// Cache for products list
let productsCache: Product[] | null = null;
let productsLastFetch: number = 0;

/**
 * Get all products with optional filtering and pagination
 */
export const getProducts = async (
  options: {
    page?: number;
    limit?: number;
    search?: string;
    isFeatured?: boolean;
    isAvailable?: boolean;
  } = {}
): Promise<{ products: Product[]; total: number }> => {
  try {
    const {
      page = 1,
      limit = APPWRITE_CONFIG.PRODUCTS_PER_PAGE,
      search = '',
      isFeatured,
      isAvailable
    } = options;

    const queries: string[] = [];
    
    // Add search filter
    if (search.trim()) {
      queries.push(Query.search('name', search));
      queries.push(Query.search('sku', search));
      queries.push(Query.search('description', search));
    }

    // Add boolean filters
    if (isFeatured !== undefined) {
      queries.push(Query.equal('isFeatured', isFeatured));
    }
    
    if (isAvailable !== undefined) {
      queries.push(Query.equal('isAvailable', isAvailable));
    }

    // Add pagination
    const offset = (page - 1) * limit;
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    
    // Sort by creation date (newest first)
    queries.push(Query.orderDesc('$createdAt'));

    const response = await databases.listDocuments(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      queries
    );

    const products = response.documents.map(mapDocumentToProduct);
    
    // Update cache if first page with default filters
    if (page === 1 && !search && isFeatured === undefined && isAvailable === undefined) {
      productsCache = products;
      productsLastFetch = Date.now();
    }

    return {
      products,
      total: response.total
    };
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      id
    );
    return mapDocumentToProduct(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Create a new product
 */
export const createProduct = async (productData: ProductFormValues): Promise<Product> => {
  try {
    // Separate existing URLs and new files
    const existingImages: string[] = [];
    const newFiles: File[] = [];

    productData.images.forEach(img => {
      if (typeof img === 'string') {
        // Extract file ID from URL if it's a full URL
        if (img.includes('/storage/buckets/')) {
          const parts = img.split('/');
          const fileId = parts[parts.length - 2];
          existingImages.push(fileId);
        } else {
          existingImages.push(img);
        }
      } else if (img instanceof File) {
        newFiles.push(img);
      }
    });

    // Upload new files
    const newImageUrls = await uploadImages(newFiles);
    
    // Combine existing URLs with new ones
    const allImages = [...existingImages, ...newImageUrls];

    const data = {
      name: productData.name,
      brand: productData.brand || '',
      sku: productData.sku,
      description: productData.description || '',
      price: productData.price,
      unit: productData.unit || 'pcs',
      discount: productData.discount || 0,
      categoryId: productData.categoryId || '',
      images: JSON.stringify(allImages),
      isFeatured: Boolean(productData.isFeatured),
      isAvailable: Boolean(productData.isAvailable),
      stockQuantity: productData.stockQuantity || 0,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      ID.unique(),
      data
    );

    // Invalidate cache
    productsCache = null;
    
    return mapDocumentToProduct(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: string, productData: Partial<ProductFormValues>): Promise<Product> => {
  try {
    const existingProduct = await getProductById(id);
    
    // Separate existing URLs and new files
    const existingImages: string[] = [];
    const newFiles: File[] = [];

    if (productData.images && Array.isArray(productData.images)) {
      productData.images.forEach(img => {
        if (typeof img === 'string') {
          // Extract file ID from URL if it's a full URL
          if (img.includes('/storage/buckets/')) {
            const parts = img.split('/');
            const fileId = parts[parts.length - 2];
            existingImages.push(fileId);
          } else {
            existingImages.push(img);
          }
        } else if (img instanceof File) {
          newFiles.push(img);
        }
      });
    } else {
      // If no images provided, keep existing ones
      existingImages.push(...existingProduct.images);
    }

    // Upload new files
    const newImageUrls = await uploadImages(newFiles);
    
    // Combine existing URLs with new ones
    const allImages = [...existingImages, ...newImageUrls];

    const data: any = {
      name: productData.name !== undefined ? productData.name : existingProduct.name,
      brand: productData.brand !== undefined ? productData.brand : existingProduct.brand,
      sku: productData.sku !== undefined ? productData.sku : existingProduct.sku,
      description: productData.description !== undefined ? productData.description : existingProduct.description,
      price: productData.price !== undefined ? productData.price : existingProduct.price,
      unit: productData.unit !== undefined ? productData.unit : existingProduct.unit,
      discount: productData.discount !== undefined ? productData.discount : existingProduct.discount,
      categoryId: productData.categoryId !== undefined ? productData.categoryId : existingProduct.categoryId,
      images: JSON.stringify(allImages),
      isFeatured: productData.isFeatured !== undefined ? Boolean(productData.isFeatured) : existingProduct.isFeatured,
      isAvailable: productData.isAvailable !== undefined ? Boolean(productData.isAvailable) : existingProduct.isAvailable,
      stockQuantity: productData.stockQuantity !== undefined ? productData.stockQuantity : existingProduct.stockQuantity,
    };

    const doc = await databases.updateDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      id,
      data
    );

    // Invalidate cache
    productsCache = null;
    
    return mapDocumentToProduct(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    // Get product first to delete associated images
    const product = await getProductById(id);
    
    // Delete all associated images from storage
    await deleteImages(product.images);
    
    // Delete the product document
    await databases.deleteDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      id
    );

    // Invalidate cache
    productsCache = null;
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Toggle product featured status
 */
export const toggleFeatured = async (id: string, isFeatured: boolean): Promise<Product> => {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      id,
      { isFeatured }
    );

    // Invalidate cache
    productsCache = null;
    
    return mapDocumentToProduct(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Toggle product availability status
 */
export const toggleAvailable = async (id: string, isAvailable: boolean): Promise<Product> => {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION_ID,
      id,
      { isAvailable }
    );

    // Invalidate cache
    productsCache = null;
    
    return mapDocumentToProduct(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Get cached products if available
 */
export const getCachedProducts = (): Product[] | null => {
  const now = Date.now();
  if (productsCache && now - productsLastFetch < APPWRITE_CONFIG.CACHE_TTL) {
    return productsCache;
  }
  return null;
};

/**
 * Clear products cache
 */
export const clearProductsCache = (): void => {
  productsCache = null;
  productsLastFetch = 0;
};