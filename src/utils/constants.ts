// Appwrite related constants
export const APPWRITE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  PRODUCTS_PER_PAGE: 20,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

// Validation constants
export const VALIDATION = {
  PRODUCT_NAME: {
    MIN: 2,
    MAX: 100,
  },
  PRODUCT_SKU: {
    MIN: 3,
    MAX: 50,
  },
  PRODUCT_PRICE: {
    MIN: 0,
    MAX: 1000000,
  },
  PRODUCT_STOCK: {
    MIN: 0,
    MAX: 100000,
  },
  PRODUCT_DISCOUNT: {
    MIN: 0,
    MAX: 100,
  },
} as const;

// UI constants
export const UI = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 500,
  MOBILE_BREAKPOINT: 768,
} as const;