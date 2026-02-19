import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useDebounce } from '../../hooks/useDebounce';
// import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Input } from '../../components/shared/Input';
import { OrderStatus } from '../../types';
import SkeletonLoader from '../../components/shared/skeletonLoader';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  // const { showToast } = useToast();
  const {
    orders,
    loading,
    error,
    page,
    total,
    status,
    search,
    setPage,
    setStatus,
    setSearch,
    updateOrderStatus,
    refreshOrders,
    totalPages,
    showingCount,
  } = useOrders({ initialLimit: 20 });

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Update search when debounced value changes
  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  interface StatusOption {
    value: OrderStatus | undefined;
    label: string;
    color: string;
  }

  const statusOptions: StatusOption[] = [
    { value: undefined, label: 'All Orders', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'purple' },
    { value: 'delivering', label: 'Delivering', color: 'orange' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
  ];

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    preparing: Package,
    delivering: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  const statusColors: Record<OrderStatus | 'default', string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    delivering: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  };

  const getStatusColor = (orderStatus: OrderStatus | undefined): string => {
    if (!orderStatus) return statusColors.default;
    return statusColors[orderStatus];
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(`${orderId}-${newStatus}`);
    await updateOrderStatus(orderId, newStatus);
    setActionLoading(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          Error Loading Orders
        </h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={refreshOrders}
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
            Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID, customer name, or phone..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const Icon = option.value ? statusIcons[option.value] : Filter;
              return (
                <button
                  key={option.value || 'all'}
                  onClick={() => setStatus(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    status === option.value
                      ? `bg-${option.color}-100 text-${option.color}-700 dark:bg-${option.color}-900/30 dark:text-${option.color}-300`
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {option.label}
                </button>
              );
            })}
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

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {search || status
                ? 'Try adjusting your filters or search term'
                : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr
                    key={order.$id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.orderId}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.userName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.userPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.items.length} items
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </div>
                      {order.discount > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          -{formatCurrency(order.discount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                        <div className="flex space-x-1">
                          {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                            <>
                              {order.orderStatus === 'pending' && (
                                <button
                                  onClick={() => handleStatusUpdate(order.$id, 'confirmed')}
                                  disabled={actionLoading === `${order.$id}-confirmed`}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded disabled:opacity-50"
                                >
                                  {actionLoading === `${order.$id}-confirmed` ? '...' : 'Confirm'}
                                </button>
                              )}
                              {order.orderStatus === 'confirmed' && (
                                <button
                                  onClick={() => handleStatusUpdate(order.$id, 'preparing')}
                                  disabled={actionLoading === `${order.$id}-preparing`}
                                  className="text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded disabled:opacity-50"
                                >
                                  {actionLoading === `${order.$id}-preparing` ? '...' : 'Start Prep'}
                                </button>
                              )}
                              {order.orderStatus === 'preparing' && (
                                <button
                                  onClick={() => handleStatusUpdate(order.$id, 'delivering')}
                                  disabled={actionLoading === `${order.$id}-delivering`}
                                  className="text-xs px-2 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded disabled:opacity-50"
                                >
                                  {actionLoading === `${order.$id}-delivering` ? '...' : 'Out for Delivery'}
                                </button>
                              )}
                              {order.orderStatus === 'delivering' && (
                                <button
                                  onClick={() => handleStatusUpdate(order.$id, 'delivered')}
                                  disabled={actionLoading === `${order.$id}-delivered`}
                                  className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded disabled:opacity-50"
                                >
                                  {actionLoading === `${order.$id}-delivered` ? '...' : 'Mark Delivered'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.$createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/orders/${order.$id}`)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;