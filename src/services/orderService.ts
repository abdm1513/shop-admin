import { databases, Query, handleAppwriteError } from '../lib/appwrite';
import { DATABASE_ID, ORDERS_COLLECTION_ID } from '../lib/appwrite';
import { Order, OrderStatus, mapDocumentToOrder } from '../types';

/**
 * Get all orders with optional filtering and pagination
 */
export const getOrders = async (
  options: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<{ orders: Order[]; total: number }> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search = '',
      startDate,
      endDate
    } = options;

    const queries: string[] = [];
    
    // Add status filter
    if (status) {
      queries.push(Query.equal('orderStatus', status));
    }
    
    // Add search filter
    if (search.trim()) {
      queries.push(Query.search('orderId', search));
      queries.push(Query.search('userName', search));
      queries.push(Query.search('userPhone', search));
    }
    
    // Add date filters
    if (startDate) {
      queries.push(Query.greaterThanEqual('$createdAt', startDate));
    }
    
    if (endDate) {
      queries.push(Query.lessThanEqual('$createdAt', endDate));
    }

    // Add pagination
    const offset = (page - 1) * limit;
    queries.push(Query.limit(limit));
    queries.push(Query.offset(offset));
    
    // Sort by creation date (newest first)
    queries.push(Query.orderDesc('$createdAt'));

    const response = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      queries
    );

    const orders = response.documents.map(mapDocumentToOrder);
    
    return {
      orders,
      total: response.total
    };
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      id
    );
    return mapDocumentToOrder(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Get a single order by orderId (custom ID)
 */
export const getOrderByOrderId = async (orderId: string): Promise<Order | null> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      [Query.equal('orderId', orderId)]
    );
    
    if (response.documents.length === 0) {
      return null;
    }
    
    return mapDocumentToOrder(response.documents[0]);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      id,
      { orderStatus: status }
    );
    
    return mapDocumentToOrder(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Update order details
 */
export const updateOrder = async (id: string, data: Partial<{
  orderStatus: OrderStatus;
  deliveryAddress: string;
  deliveryTime: 'asap' | 'scheduled';
  scheduledTime: string;
  notes: string;
}>): Promise<Order> => {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      id,
      data
    );
    
    return mapDocumentToOrder(doc);
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};

/**
 * Generate a unique order ID
 */
export const generateOrderId = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Get order statistics
 */
export const getOrderStats = async (): Promise<{
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveringOrders: number;
  revenue: number;
}> => {
  try {
    // Get all orders
    const response = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      [Query.limit(1000)] // Limit for performance
    );

    const orders = response.documents.map(mapDocumentToOrder);
    
    // Calculate statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.orderStatus === 'pending').length;
    const confirmedOrders = orders.filter(order => order.orderStatus === 'confirmed').length;
    const deliveringOrders = orders.filter(order => order.orderStatus === 'delivering').length;
    const revenue = orders
      .filter(order => order.orderStatus === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
    
    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveringOrders,
      revenue,
    };
  } catch (error) {
    throw new Error(handleAppwriteError(error));
  }
};