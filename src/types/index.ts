// import type { Models } from "appwrite";

// export interface AppwriteDocument {
//   $id: string;
//   $createdAt: string;
//   $updatedAt: string;
// }

// export interface Product extends AppwriteDocument {
//   name: string;
//   brand: string;
//   description: string;
//   sku: string;
//   price: number;
//   unit: string;
//   discount: number;
//   categoryId: string;
//   images: string[];
//   isFeatured: boolean;
//   isAvailable: boolean;
//   stockQuantity: number;
// }

// export interface ProductFormValues extends Omit<Product, keyof AppwriteDocument | 'images'> {
//   images: (string | File)[];
// }

// export interface AdminUser extends Models.User<Models.Preferences> {}

// export interface AuthContextType {
//   user: AdminUser | null;
//   isLoading: boolean;
//   error: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// // Helper function for safe JSON parsing
// const safeParse = <T>(data: any, fallback: T): T => {
//   if (!data) return fallback;
//   if (typeof data === 'object') return data as T;
//   try {
//     return JSON.parse(data);
//   } catch {
//     return fallback;
//   }
// };

// export function mapDocumentToProduct(doc: any): Product {
//   const rawImages = safeParse<string[]>(doc.images, []);
  
//   return {
//     $id: doc.$id,
//     $createdAt: doc.$createdAt,
//     $updatedAt: doc.$updatedAt,
//     name: String(doc.name || ''),
//     brand: String(doc.brand || ''),
//     sku: String(doc.sku || ''),
//     description: String(doc.description || ''),
//     price: Number(doc.price) || 0,
//     unit: String(doc.unit || 'pcs'),
//     discount: Number(doc.discount) || 0,
//     categoryId: String(doc.categoryId || ''),
//     images: Array.isArray(rawImages) ? rawImages : [],
//     isFeatured: Boolean(doc.isFeatured),
//     isAvailable: Boolean(doc.isAvailable),
//     stockQuantity: Number(doc.stockQuantity) || 0,
//   };
// }

import type { Models } from "appwrite";

export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Banner extends AppwriteDocument {
  image: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Category extends AppwriteDocument {
  name: string;
  sortOrder: number;
  image?: string;
}

export interface Product extends AppwriteDocument {
  name: string;
  brand: string;
  sku: string;
  description: string;
  price: number;
  unit: string;
  discount: number;
  categoryId: string;
  images: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  stockQuantity: number;
}

export type OrderType = 'delivery' | 'pickup';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
}

export interface Order extends AppwriteDocument {
  orderId: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  subTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  orderType: OrderType;
  deliveryAddress: string;
  paymentMethod: 'cod';
  deliveryTime: 'asap' | 'scheduled';
  scheduledTime?: string;
  notes?: string;
}

export interface ProductFormValues extends Omit<Product, keyof AppwriteDocument | 'images'> {
  images: (string | File)[];
}

export interface CategoryFormValues {
  name: string;
  sortOrder: number;
  image?: string | File;
}

export interface BannerFormValues {
  image: string | File;
  link?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminUser extends Models.User<Models.Preferences> {}

export interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Helper function for safe JSON parsing
const safeParse = <T>(data: any, fallback: T): T => {
  if (!data) return fallback;
  if (typeof data === 'object') return data as T;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

// Document mapping functions
export function mapDocumentToBanner(doc: any): Banner {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    image: doc.image || '',
    link: doc.link,
    isActive: Boolean(doc.isActive),
    sortOrder: Number(doc.sortOrder) || 0,
  };
}

export function mapDocumentToCategory(doc: any): Category {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    name: String(doc.name || ''),
    sortOrder: Number(doc.sortOrder) || 0,
    image: doc.image || undefined,
  };
}

export function mapDocumentToProduct(doc: any): Product {
  const rawImages = safeParse<string[]>(doc.images, []);
  
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    name: String(doc.name || ''),
    brand: String(doc.brand || ''),
    sku: String(doc.sku || ''),
    description: String(doc.description || ''),
    price: Number(doc.price) || 0,
    unit: String(doc.unit || 'pcs'),
    discount: Number(doc.discount) || 0,
    categoryId: String(doc.categoryId || ''),
    images: Array.isArray(rawImages) ? rawImages : [],
    isFeatured: Boolean(doc.isFeatured),
    isAvailable: Boolean(doc.isAvailable),
    stockQuantity: Number(doc.stockQuantity) || 0,
  };
}

export function mapDocumentToOrder(doc: any): Order {
  const items = safeParse<OrderItem[]>(doc.items, []);
  
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    orderId: String(doc.orderId || ''),
    userId: String(doc.userId || ''),
    userName: String(doc.userName || ''),
    userPhone: String(doc.userPhone || ''),
    items: items.map(item => ({
      productId: String(item.productId || ''),
      name: String(item.name || ''),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
      unit: item.unit ? String(item.unit) : undefined,
    })),
    subTotal: Number(doc.subTotal) || 0,
    deliveryFee: Number(doc.deliveryFee) || 0,
    discount: Number(doc.discount) || 0,
    total: Number(doc.total) || 0,
    orderStatus: (doc.orderStatus || 'pending') as OrderStatus,
    orderType: (doc.orderType || 'delivery') as OrderType,
    deliveryAddress: String(doc.deliveryAddress || ''),
    paymentMethod: 'cod',
    deliveryTime: (doc.deliveryTime || 'asap') as 'asap' | 'scheduled',
    scheduledTime: doc.scheduledTime,
    notes: doc.notes,
  };
}