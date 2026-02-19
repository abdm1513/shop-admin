import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Clock, Package, CreditCard, MessageSquare, Calendar } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Order, OrderStatus } from '../../types';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  
  const { getOrderById, updateOrderStatus } = useOrders();

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await getOrderById(id!);
      setOrder(orderData);
    } catch (error) {
      showToast('Failed to load order', 'error');
      console.error('Error loading order:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setLoading(true);
      await updateOrderStatus(id!, newStatus);
      await loadOrder(); // Reload order to get updated data
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    delivering: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  interface StatusOption {
    value: OrderStatus;
    label: string;
  }

  const statusOptions: StatusOption[] = [
    { value: 'confirmed', label: 'Confirm Order' },
    { value: 'preparing', label: 'Start Preparation' },
    { value: 'delivering', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Mark as Delivered' },
    { value: 'cancelled', label: 'Cancel Order' },
  ];

  const nextStatusMap: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['delivering', 'cancelled'],
    delivering: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading order..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Order not found
        </h3>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order.orderId}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.orderStatus]}`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {formatDate(order.$createdAt)}
          </p>
        </div>

        {/* Status Actions */}
        {nextStatusMap[order.orderStatus].length > 0 && (
          <div className="flex space-x-2">
            {nextStatusMap[order.orderStatus].map((status) => {
              const option = statusOptions.find(opt => opt.value === status);
              if (!option) return null;
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <User className="h-4 w-4 mr-2" />
                  Customer Name
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.userName}
                </p>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Number
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.userPhone}
                </p>
              </div>

              {order.deliveryAddress && (
                <div className="md:col-span-2">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    Delivery Address
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.deliveryAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items ({order.items.length})
            </h3>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.quantity} × {formatCurrency(item.price)} {item.unit ? `per ${item.unit}` : ''}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(order.subTotal)}
                </span>
              </div>
              
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(order.deliveryFee)}
                  </span>
                </div>
              )}
              
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-lg text-blue-600 dark:text-blue-400">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Meta */}
        <div className="space-y-6">
          {/* Order Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Order Information
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Order Type
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                </p>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Delivery Time
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {order.deliveryTime === 'asap' ? 'ASAP' : 'Scheduled'}
                  {order.scheduledTime && (
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(order.scheduledTime)}
                    </span>
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Method
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Cash on Delivery (COD)
                </p>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Order Date
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(order.$createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Customer Notes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;