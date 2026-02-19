import { useState, useEffect, useCallback } from 'react';
import { Banner, BannerFormValues } from '../types';
import * as bannerService from '../services/bannerService';
import { useToast } from './useToast';

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useToast();

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedBanners = await bannerService.getBanners();
      setBanners(fetchedBanners);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch banners';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const getBannerById = async (id: string): Promise<Banner> => {
    try {
      setLoading(true);
      const banner = await bannerService.getBannerById(id);
      return banner;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch banner';
      showToast(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (bannerData: BannerFormValues): Promise<Banner | null> => {
    try {
      setLoading(true);
      const newBanner = await bannerService.createBanner(bannerData);
      await fetchBanners(); // Refresh the list
      showToast('Banner created successfully', 'success');
      return newBanner;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create banner';
      showToast(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async (id: string, bannerData: Partial<BannerFormValues>): Promise<Banner | null> => {
    try {
      setLoading(true);
      const updatedBanner = await bannerService.updateBanner(id, bannerData);
      
      // Update local state
      setBanners(prev => prev.map(banner => 
        banner.$id === id ? updatedBanner : banner
      ));
      
      showToast('Banner updated successfully', 'success');
      return updatedBanner;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update banner';
      showToast(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await bannerService.deleteBanner(id);
      
      // Update local state
      setBanners(prev => prev.filter(banner => banner.$id !== id));
      
      showToast('Banner deleted successfully', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete banner';
      showToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerActive = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const updatedBanner = await bannerService.toggleBannerActive(id, isActive);
      
      // Update local state
      setBanners(prev => prev.map(banner => 
        banner.$id === id ? updatedBanner : banner
      ));
      
      showToast(`Banner ${isActive ? 'activated' : 'deactivated'}`, 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update banner';
      showToast(message, 'error');
      return false;
    }
  };

  const refreshBanners = () => {
    fetchBanners();
  };

  return {
    // State
    banners,
    loading,
    error,
    
    // Actions
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    refreshBanners,
    
    // Computed values
    hasBanners: banners.length > 0,
    activeBanners: banners.filter(banner => banner.isActive),
    sortedBanners: [...banners].sort((a, b) => a.sortOrder - b.sortOrder),
  };
};