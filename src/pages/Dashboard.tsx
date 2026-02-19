import React, { useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  ShoppingCart,
  Eye,
  Calendar,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBanners } from '../hooks/useBanners';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { getFileUrl } from '../lib/appwrite';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { products, loading: productsLoading } = useProducts({ initialLimit: 5 });
  const { categories, loading: categoriesLoading } = useCategories();
  const { banners, loading: bannersLoading } = useBanners();
  const { orders, loading: ordersLoading } = useOrders({ initialLimit: 100 });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBanners: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    lowStockProducts: 0,
    activeBanners: 0,
  });

  useEffect(() => {
    // Check if all data is loaded
    const allDataLoaded = !productsLoading && !categoriesLoading && !bannersLoading && !ordersLoading;
    
    if (allDataLoaded) {
      // Calculate stats from existing data
      const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length;
      const activeBanners = banners.filter(b => b.isActive).length;
      
      // Calculate revenue from delivered orders
      const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered');
      const revenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
      
      // Calculate pending orders
      const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalBanners: banners.length,
        totalOrders: orders.length,
        pendingOrders,
        revenue,
        lowStockProducts,
        activeBanners,
      });
      
      setLoading(false);
    }
  }, [productsLoading, categoriesLoading, bannersLoading, ordersLoading, products, categories, banners, orders]);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'blue',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'green',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: 'purple',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Eye,
      color: 'orange',
    },
  ];

  const secondaryStats = [
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: Tag,
      color: 'indigo',
    },
    {
      title: 'Active Banners',
      value: stats.activeBanners,
      icon: ImageIcon,
      color: 'pink',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: Package,
      color: 'red',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(new Date().toISOString())}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClass = `text-${stat.color}-600 dark:text-${stat.color}-400`;
          const bgClass = `bg-${stat.color}-100 dark:bg-${stat.color}-900/20`;
          
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${bgClass}`}>
                  <Icon className={`h-6 w-6 ${colorClass}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats & Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secondary Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Overview
            </h3>
            <div className="space-y-4">
              {secondaryStats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClass = `text-${stat.color}-600 dark:text-${stat.color}-400`;
                const bgClass = `bg-${stat.color}-100 dark:bg-${stat.color}-900/20`;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${bgClass} mr-3`}>
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stat.title}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Products
              </h3>
              <Link
                to="/products"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {products.slice(0, 4).map((product) => (
                <div key={product.$id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={getFileUrl(product.images[0])}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(product.price)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.isAvailable
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {product.isAvailable ? 'Available' : 'Out of stock'}
                      </span>
                      {product.isFeatured && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {product.stockQuantity} in stock
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No products yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Categories
          </h3>
          <div className="space-y-3">
            {categories.slice(0, 3).map((category) => (
              <div key={category.$id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Order: {category.sortOrder}
                </span>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No categories yet
              </p>
            )}
          </div>
          {categories.length > 3 && (
            <Link
              to="/categories"
              className="block mt-4 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View all {categories.length} categories →
            </Link>
          )}
        </div>

        {/* Banners Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Banners
          </h3>
          <div className="space-y-3">
            {banners.slice(0, 3).map((banner) => (
              <div key={banner.$id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    banner.isActive
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {banner.link || 'No link'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Order: {banner.sortOrder}
                </span>
              </div>
            ))}
            {banners.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No banners yet
              </p>
            )}
          </div>
          {banners.length > 3 && (
            <Link
              to="/banners"
              className="block mt-4 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View all {banners.length} banners →
            </Link>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">App Version</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(new Date().toISOString())}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">✓ Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;