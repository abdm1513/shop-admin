import { databases, ID, Query, handleAppwriteError } from '../lib/appwrite';
import { DATABASE_ID, BANNERS_COLLECTION_ID } from '../lib/appwrite';
import { Banner, BannerFormValues, mapDocumentToBanner } from '../types';
import { uploadImage, deleteImage } from './imageService';

// Cache for banners
let bannersCache: Banner[] | null = null;
let bannersLastFetch: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all banners
 */
export const getBanners = async (options: {
  activeOnly?: boolean;
  sortBy?: 'sortOrder';
} = {}): Promise<Banner[]> => {
  try {
    const { activeOnly = false,  } = options;
    
    const queries: string[] = [];
    
    // Filter active banners
    if (activeOnly) {
      queries.push(Query.equal('isActive', true));
    }
    
    // Add sorting
    queries.push(Query.orderAsc('sortOrder'));

    const response = await databases.listDocuments(
      DATABASE_ID,
      BANNERS_COLLECTION_ID,
      queries
    );

    const banners = response.documents.map(mapDocumentToBanner);
    
    // Update cache
    bannersCache = banners;
    bannersLastFetch = Date.now();
    
    return banners;
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Get a single banner by ID
 */
export const getBannerById = async (id: string): Promise<Banner> => {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      BANNERS_COLLECTION_ID,
      id
    );
    return mapDocumentToBanner(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Create a new banner
 */
export const createBanner = async (bannerData: BannerFormValues): Promise<Banner> => {
  try {
    let imageFileId: string;
    
    // Handle image upload
    if (bannerData.image instanceof File) {
      imageFileId = await uploadImage(bannerData.image);
    } else {
      imageFileId = bannerData.image;
    }

    const data = {
      image: imageFileId,
      link: bannerData.link || '',
      isActive: Boolean(bannerData.isActive),
      sortOrder: bannerData.sortOrder || 0,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      BANNERS_COLLECTION_ID,
      ID.unique(),
      data
    );

    // Invalidate cache
    bannersCache = null;
    
    return mapDocumentToBanner(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Update an existing banner
 */
export const updateBanner = async (id: string, bannerData: Partial<BannerFormValues>): Promise<Banner> => {
  try {
    const existingBanner = await getBannerById(id);
    
    let imageFileId = existingBanner.image;
    
    // Handle image update if provided
    if (bannerData.image !== undefined) {
      // Delete old image
      if (existingBanner.image) {
        await deleteImage(existingBanner.image);
      }
      
      // Upload new image
      if (bannerData.image instanceof File) {
        imageFileId = await uploadImage(bannerData.image);
      } else {
        imageFileId = bannerData.image as string;
      }
    }

    const data: any = {
      image: imageFileId,
      link: bannerData.link !== undefined ? bannerData.link : existingBanner.link,
      isActive: bannerData.isActive !== undefined ? Boolean(bannerData.isActive) : existingBanner.isActive,
      sortOrder: bannerData.sortOrder !== undefined ? bannerData.sortOrder : existingBanner.sortOrder,
    };

    const doc = await databases.updateDocument(
      DATABASE_ID,
      BANNERS_COLLECTION_ID,
      id,
      data
    );

    // Invalidate cache
    bannersCache = null;
    
    return mapDocumentToBanner(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Delete a banner
 */
export const deleteBanner = async (id: string): Promise<void> => {
  try {
    // Get banner first to delete associated image
    const banner = await getBannerById(id);
    
    // Delete associated image
    if (banner.image) {
      await deleteImage(banner.image);
    }
    
    // Delete the banner document
    await databases.deleteDocument(
      DATABASE_ID,
      BANNERS_COLLECTION_ID,
      id
    );

    // Invalidate cache
    bannersCache = null;
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Toggle banner active status
 */
export const toggleBannerActive = async (id: string, isActive: boolean): Promise<Banner> => {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      BANNERS_COLLECTION_ID,
      id,
      { isActive }
    );

    // Invalidate cache
    bannersCache = null;
    
    return mapDocumentToBanner(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Get cached banners if available
 */
export const getCachedBanners = (): Banner[] | null => {
  const now = Date.now();
  if (bannersCache && now - bannersLastFetch < CACHE_TTL) {
    return bannersCache;
  }
  return null;
};

/**
 * Clear banners cache
 */
export const clearBannersCache = (): void => {
  bannersCache = null;
  bannersLastFetch = 0;
};