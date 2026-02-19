import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import * as orderService from '../services/orderService';
import { useToast } from './useToast';

interface UseOrdersOptions {
  initialPage?: number;
  initialLimit?: number;
  initialStatus?: OrderStatus;
  initialSearch?: string;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const {
    initialPage = 1,
    initialLimit = 20,
    initialStatus,
    initialSearch = '',
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [limit] = useState<number>(initialLimit);
  const [total, setTotal] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus | undefined>(initialStatus);
  const [search, setSearch] = useState<string>(initialSearch);
  
  const { showToast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await orderService.getOrders({
        page,
        limit,
        status,
        search,
      });
      
      setOrders(result.orders);
      setTotal(result.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrderById = async (id: string): Promise<Order> => {
    try {
      setLoading(true);
      const order = await orderService.getOrderById(id);
      return order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order';
      showToast(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: OrderStatus): Promise<boolean> => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, newStatus);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.$id === id ? updatedOrder : order
      ));
      
      showToast(`Order status updated to ${newStatus}`, 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      showToast(message, 'error');
      return false;
    }
  };

  const updateOrder = async (id: string, data: Partial<{
    orderStatus: OrderStatus;
    deliveryAddress: string;
    deliveryTime: 'asap' | 'scheduled';
    scheduledTime: string;
    notes: string;
  }>): Promise<Order | null> => {
    try {
      setLoading(true);
      const updatedOrder = await orderService.updateOrder(id, data);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.$id === id ? updatedOrder : order
      ));
      
      showToast('Order updated successfully', 'success');
      return updatedOrder;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order';
      showToast(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOrderStats = async () => {
    try {
      return await orderService.getOrderStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order statistics';
      showToast(message, 'error');
      throw err;
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  const resetFilters = () => {
    setPage(1);
    setSearch('');
    setStatus(undefined);
  };

  return {
    // State
    orders,
    loading,
    error,
    page,
    total,
    status,
    search,
    
    // Actions
    setPage,
    setStatus,
    setSearch,
    getOrderById,
    updateOrderStatus,
    updateOrder,
    getOrderStats,
    refreshOrders,
    resetFilters,
    
    // Computed values
    totalPages: Math.ceil(total / limit),
    hasOrders: orders.length > 0,
    showingCount: `${Math.min(page * limit, total)} of ${total} orders`,
    
    // Filtered orders
    pendingOrders: orders.filter(order => order.orderStatus === 'pending'),
    confirmedOrders: orders.filter(order => order.orderStatus === 'confirmed'),
    deliveringOrders: orders.filter(order => order.orderStatus === 'delivering'),
    deliveredOrders: orders.filter(order => order.orderStatus === 'delivered'),
  };
};