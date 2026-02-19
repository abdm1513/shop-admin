import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Link as LinkIcon, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { useBanners } from '../../hooks/useBanners';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { getFileUrl } from '../../lib/appwrite';
import SkeletonLoader from '../../components/shared/skeletonLoader';

const Banners: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    banners,
    loading,
    error,
    deleteBanner,
    toggleBannerActive,
    refreshBanners,
  } = useBanners();

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; bannerId: string | null }>({
    isOpen: false,
    bannerId: null,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDeleteClick = (bannerId: string) => {
    setDeleteDialog({ isOpen: true, bannerId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.bannerId) return;

    setActionLoading(deleteDialog.bannerId);
    const success = await deleteBanner(deleteDialog.bannerId);
    
    if (success) {
      showToast('Banner deleted successfully', 'success');
    }
    
    setDeleteDialog({ isOpen: false, bannerId: null });
    setActionLoading(null);
  };

  const handleToggleActive = async (bannerId: string, currentActive: boolean) => {
    setActionLoading(`active-${bannerId}`);
    await toggleBannerActive(bannerId, !currentActive);
    setActionLoading(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          Error Loading Banners
        </h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={refreshBanners}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Banners
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage website banners
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/banners/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : banners.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No banners found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Get started by creating your first banner
            </p>
            <button
              onClick={() => navigate('/banners/new')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Banner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {banners.map((banner) => (
              <div
                key={banner.$id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Banner Image */}
                <div className="relative">
                  <div className="h-48 bg-gray-100 dark:bg-gray-700">
                    <img
                      src={getFileUrl(banner.image)}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      banner.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Banner Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        Order: {banner.sortOrder}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleActive(banner.$id, banner.isActive)}
                        disabled={actionLoading === `active-${banner.$id}`}
                        className={`p-1.5 rounded-lg transition-colors ${
                          banner.isActive
                            ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        title={banner.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {actionLoading === `active-${banner.$id}` ? (
                          <LoadingSpinner size="sm" />
                        ) : banner.isActive ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/banners/${banner.$id}`)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(banner.$id)}
                        disabled={actionLoading === banner.$id}
                        className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        {actionLoading === banner.$id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Link */}
                  {banner.link && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <LinkIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {banner.link}
                      </a>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {formatDate(banner.$createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, bannerId: null })}
        isLoading={actionLoading === deleteDialog.bannerId}
      />
    </div>
  );
};

export default Banners;