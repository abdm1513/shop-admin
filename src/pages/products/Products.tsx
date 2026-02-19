import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  XCircle,
  Download,
  Package,
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Input } from '../../components/shared/Input';
import SkeletonLoader from '../../components/shared/skeletonLoader';
import { getFileUrl } from '../../lib/appwrite';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    products,
    loading,
    error,
    page,
    total,
    search,
    isFeatured,
    isAvailable,
    setPage,
    setSearch,
    setIsFeatured,
    setIsAvailable,
    deleteProduct,
    toggleFeatured,
    toggleAvailable,
    refreshProducts,
    resetFilters,
    totalPages,
    showingCount,
  } = useProducts({ initialLimit: 20 });

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);

  // Update search when debounced value changes
  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleDeleteClick = (productId: string) => {
    setDeleteDialog({ isOpen: true, productId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.productId) return;

    setActionLoading(deleteDialog.productId);
    const success = await deleteProduct(deleteDialog.productId);
    
    if (success) {
      showToast('Product deleted successfully', 'success');
    }
    
    setDeleteDialog({ isOpen: false, productId: null });
    setActionLoading(null);
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    setActionLoading(`featured-${productId}`);
    await toggleFeatured(productId, !currentFeatured);
    setActionLoading(null);
  };

  const handleToggleAvailable = async (productId: string, currentAvailable: boolean) => {
    setActionLoading(`available-${productId}`);
    await toggleAvailable(productId, !currentAvailable);
    setActionLoading(null);
  };

  const handleExport = () => {
    showToast('Export feature coming soon!', 'info');
  };

  const getStatusBadge = (product: any) => {
    if (!product.isAvailable) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Unavailable
        </span>
      );
    }
    
    if (product.stockQuantity <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Out of Stock
        </span>
      );
    }
    
    if (product.stockQuantity <= 10) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          Low Stock
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Available
      </span>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          Error Loading Products
        </h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={refreshProducts}
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
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your product catalog
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => navigate('/products/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products by name, SKU, or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsFeatured(isFeatured === undefined ? true : undefined)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                isFeatured === true
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Star className={`h-4 w-4 mr-2 ${isFeatured === true ? 'fill-purple-500' : ''}`} />
              Featured
            </button>
            <button
              onClick={() => setIsAvailable(isAvailable === undefined ? false : undefined)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                isAvailable === false
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Unavailable
            </button>
            <button
              onClick={resetFilters}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <p>{showingCount}</p>
        {total > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {search || isFeatured !== undefined || isAvailable !== undefined
                ? 'Try adjusting your filters or search term'
                : 'Get started by adding your first product'}
            </p>
            {(search || isFeatured !== undefined || isAvailable !== undefined) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr
                    key={product.$id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={getFileUrl(product.images[0])}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                            {product.isFeatured && (
                              <Star className="h-3 w-3 text-purple-500 inline-block ml-1 fill-purple-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.sku} • {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </div>
                      {product.discount > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {product.discount}% off
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {product.stockQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(product.$createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/products/${product.$id}`)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(product.$id, product.isFeatured)}
                          disabled={actionLoading === `featured-${product.$id}`}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isFeatured
                              ? 'text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                              : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          title={product.isFeatured ? 'Remove featured' : 'Mark as featured'}
                        >
                          {actionLoading === `featured-${product.$id}` ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-current' : ''}`} />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleAvailable(product.$id, product.isAvailable)}
                          disabled={actionLoading === `available-${product.$id}`}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isAvailable
                              ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={product.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                        >
                          {actionLoading === `available-${product.$id}` ? (
                            <LoadingSpinner size="sm" />
                          ) : product.isAvailable ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.$id)}
                          disabled={actionLoading === product.$id}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          {actionLoading === product.$id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, productId: null })}
        isLoading={actionLoading === deleteDialog.productId}
      />
    </div>
  );
};

export default Products;