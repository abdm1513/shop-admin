import { databases, ID, Query, handleAppwriteError, CATEGORIES_COLLECTION_ID } from '../lib/appwrite';
import { DATABASE_ID} from '../lib/appwrite';
import { Category, CategoryFormValues, mapDocumentToCategory } from '../types';
import { uploadImage, deleteImage } from './imageService';

// Cache for categories
let categoriesCache: Category[] | null = null;
let categoriesLastFetch: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all categories
 */
export const getCategories = async (options: {
  sortBy?: 'name' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<Category[]> => {
  try {
    const { sortBy = 'sortOrder', sortOrder = 'asc' } = options;
    
    const queries: string[] = [];
    
    // Add sorting
    if (sortBy === 'name') {
      queries.push(Query.orderAsc('name'));
    } else {
      queries.push(sortOrder === 'asc' ? Query.orderAsc('sortOrder') : Query.orderDesc('sortOrder'));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      queries
    );

    const categories = response.documents.map(mapDocumentToCategory);
    
    // Update cache
    categoriesCache = categories;
    categoriesLastFetch = Date.now();
    
    return categories;
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      id
    );
    return mapDocumentToCategory(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData: CategoryFormValues): Promise<Category> => {
  try {
    let imageFileId: string | undefined;
    
    // Handle image upload if provided
    if (categoryData.image && categoryData.image instanceof File) {
      imageFileId = await uploadImage(categoryData.image);
    } else if (typeof categoryData.image === 'string') {
      imageFileId = categoryData.image;
    }

    const data = {
      name: categoryData.name,
      sortOrder: categoryData.sortOrder || 0,
      image: imageFileId || '',
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      ID.unique(),
      data
    );

    // Invalidate cache
    categoriesCache = null;
    
    return mapDocumentToCategory(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (id: string, categoryData: Partial<CategoryFormValues>): Promise<Category> => {
  try {
    const existingCategory = await getCategoryById(id);
    
    let imageFileId = existingCategory.image;
    
    // Handle image update if provided
    if (categoryData.image !== undefined) {
      // Delete old image if exists
      if (existingCategory.image && typeof categoryData.image === 'string' && categoryData.image !== existingCategory.image) {
        await deleteImage(existingCategory.image);
      }
      
      // Upload new image if it's a File
      if (categoryData.image instanceof File) {
        imageFileId = await uploadImage(categoryData.image);
      } else if (typeof categoryData.image === 'string') {
        imageFileId = categoryData.image;
      } else if (categoryData.image === null || categoryData.image === '') {
        // Delete image if set to empty
        if (existingCategory.image) {
          await deleteImage(existingCategory.image);
        }
        imageFileId = undefined;
      }
    }

    const data: any = {
      name: categoryData.name !== undefined ? categoryData.name : existingCategory.name,
      sortOrder: categoryData.sortOrder !== undefined ? categoryData.sortOrder : existingCategory.sortOrder,
      image: imageFileId || '',
    };

    const doc = await databases.updateDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      id,
      data
    );

    // Invalidate cache
    categoriesCache = null;
    
    return mapDocumentToCategory(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    // Get category first to delete associated image
    const category = await getCategoryById(id);
    
    // Delete associated image if exists
    if (category.image) {
      await deleteImage(category.image);
    }
    
    // Delete the category document
    await databases.deleteDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      id
    );

    // Invalidate cache
    categoriesCache = null;
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Get cached categories if available
 */
export const getCachedCategories = (): Category[] | null => {
  const now = Date.now();
  if (categoriesCache && now - categoriesLastFetch < CACHE_TTL) {
    return categoriesCache;
  }
  return null;
};

/**
 * Clear categories cache
 */
export const clearCategoriesCache = (): void => {
  categoriesCache = null;
  categoriesLastFetch = 0;
};