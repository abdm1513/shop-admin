// import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BannerForm from '../../components/forms/BannerForm';
import { useBanners } from '../../hooks/useBanners';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { BannerFormValues } from '../../types';
import { useEffect, useState } from 'react';

const BannerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const isEdit = !!id && id !== 'new';
  
  const [loading, setLoading] = useState(isEdit);
  const [bannerData, setBannerData] = useState<Partial<BannerFormValues> | null>(null);
  
  const { getBannerById, createBanner, updateBanner } = useBanners();

  useEffect(() => {
    if (isEdit && id) {
      loadBanner();
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const loadBanner = async () => {
    try {
      setLoading(true);
      const banner = await getBannerById(id!); // Add ! to assert id is not undefined
      
      const formData: Partial<BannerFormValues> = {
        image: banner.image,
        link: banner.link,
        isActive: banner.isActive,
        sortOrder: banner.sortOrder,
      };
      
      setBannerData(formData);
    } catch (error) {
      showToast('Failed to load banner', 'error');
      console.error('Error loading banner:', error);
      navigate('/banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: BannerFormValues) => {
    try {
      setLoading(true);
      
      if (isEdit && id) {
        await updateBanner(id, data);
        showToast('Banner updated successfully', 'success');
        navigate('/banners');
      } else {
        await createBanner(data);
        showToast('Banner created successfully', 'success');
        navigate('/banners');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save banner';
      showToast(message, 'error');
      console.error('Error saving banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/banners');
  };

  if (loading && !bannerData && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading banner..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/banners')}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Banners
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Banner' : 'Create New Banner'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update banner details' : 'Add a new banner'}
          </p>
        </div>
      </div>

      {/* Banner Form */}
      <BannerForm
        initialData={bannerData || {}}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
        isEdit={isEdit}
      />
    </div>
  );
};

export default BannerEdit;