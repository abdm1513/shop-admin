import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { getFileUrl } from '../../lib/appwrite';
import { useToast } from '../../hooks/useToast';
import SkeletonLoader from '../../components/shared/skeletonLoader';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    categories,
    loading,
    error,
    deleteCategory,
    refreshCategories,
  } = useCategories();

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDeleteClick = (categoryId: string) => {
    setDeleteDialog({ isOpen: true, categoryId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.categoryId) return;

    setActionLoading(deleteDialog.categoryId);
    const success = await deleteCategory(deleteDialog.categoryId);
    
    if (success) {
      showToast('Category deleted successfully', 'success');
    }
    
    setDeleteDialog({ isOpen: false, categoryId: null });
    setActionLoading(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          Error Loading Categories
        </h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={refreshCategories}
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
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage product categories
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/categories/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Get started by creating your first category
            </p>
            <button
              onClick={() => navigate('/categories/new')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {categories.map((category) => (
              <div
                key={category.$id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {/* Category Image */}
                  <div className="flex-shrink-0">
                    {category.image ? (
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={getFileUrl(category.image)}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Order: {category.sortOrder}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => navigate(`/categories/${category.$id}`)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category.$id)}
                          disabled={actionLoading === category.$id}
                          className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          {actionLoading === category.$id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Created: {formatDate(category.$createdAt)}
                    </div>
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
        title="Delete Category"
        message="Are you sure you want to delete this category? Products in this category will NOT be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, categoryId: null })}
        isLoading={actionLoading === deleteDialog.categoryId}
      />
    </div>
  );
};

export default Categories;