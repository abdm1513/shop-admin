import { VALIDATION, APPWRITE_CONFIG } from './constants';

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

/**
 * Validate product name
 */
export const validateProductName = (name: string): string | null => {
  if (!name) return 'Product name is required';
  if (name.length < VALIDATION.PRODUCT_NAME.MIN) {
    return `Product name must be at least ${VALIDATION.PRODUCT_NAME.MIN} characters`;
  }
  if (name.length > VALIDATION.PRODUCT_NAME.MAX) {
    return `Product name must not exceed ${VALIDATION.PRODUCT_NAME.MAX} characters`;
  }
  return null;
};

/**
 * Validate product SKU
 */
export const validateProductSKU = (sku: string): string | null => {
  if (!sku) return 'SKU is required';
  if (sku.length < VALIDATION.PRODUCT_SKU.MIN) {
    return `SKU must be at least ${VALIDATION.PRODUCT_SKU.MIN} characters`;
  }
  if (sku.length > VALIDATION.PRODUCT_SKU.MAX) {
    return `SKU must not exceed ${VALIDATION.PRODUCT_SKU.MAX} characters`;
  }
  if (!/^[A-Za-z0-9\-_]+$/.test(sku)) {
    return 'SKU can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
};

/**
 * Validate product price
 */
export const validateProductPrice = (price: number): string | null => {
  if (price === undefined || price === null) return 'Price is required';
  if (typeof price !== 'number' || isNaN(price)) return 'Price must be a valid number';
  if (price < 0) return 'Price cannot be negative';
  if (price > VALIDATION.PRODUCT_PRICE.MAX) {
    return `Price cannot exceed ${VALIDATION.PRODUCT_PRICE.MAX}`;
  }
  return null;
};

/**
 * Validate product discount
 */
export const validateProductDiscount = (discount: number): string | null => {
  if (discount < 0) return 'Discount cannot be negative';
  if (discount > VALIDATION.PRODUCT_DISCOUNT.MAX) {
    return `Discount cannot exceed ${VALIDATION.PRODUCT_DISCOUNT.MAX}%`;
  }
  return null;
};

/**
 * Validate product stock quantity
 */
export const validateStockQuantity = (quantity: number): string | null => {
  if (quantity < 0) return 'Stock quantity cannot be negative';
  if (quantity > VALIDATION.PRODUCT_STOCK.MAX) {
    return `Stock quantity cannot exceed ${VALIDATION.PRODUCT_STOCK.MAX}`;
  }
  return null;
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): string | null => {
  if (!file) return 'File is required';
  
  if (file.size > APPWRITE_CONFIG.MAX_FILE_SIZE) {
    return `File size cannot exceed ${APPWRITE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }
  
  // Type guard to check if file type is in allowed types
  const isAllowedType = APPWRITE_CONFIG.ALLOWED_IMAGE_TYPES.some(
    allowedType => file.type === allowedType
  );
  
  if (!isAllowedType) {
    const allowedTypes = APPWRITE_CONFIG.ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1]).join(', ');
    return `Only ${allowedTypes} files are allowed`;
  }
  
  return null;
};

/**
 * Validate product form data
 */
export const validateProductForm = (data: {
  name: string;
  sku: string;
  price: number;
  discount: number;
  stockQuantity: number;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const nameError = validateProductName(data.name);
  if (nameError) errors.name = nameError;
  
  const skuError = validateProductSKU(data.sku);
  if (skuError) errors.sku = skuError;
  
  const priceError = validateProductPrice(data.price);
  if (priceError) errors.price = priceError;
  
  const discountError = validateProductDiscount(data.discount);
  if (discountError) errors.discount = discountError;
  
  const stockError = validateStockQuantity(data.stockQuantity);
  if (stockError) errors.stockQuantity = stockError;
  
  return errors;
};