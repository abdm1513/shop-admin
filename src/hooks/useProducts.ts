import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFormValues } from '../types';
import * as productService from '../services/productService';
import { useToast } from './useToast';

interface UseProductsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialFeatured?: boolean;
  initialAvailable?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const {
    initialPage = 1,
    initialLimit = 20,
    initialSearch = '',
    initialFeatured,
    initialAvailable
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [limit] = useState<number>(initialLimit);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>(initialSearch);
  const [isFeatured, setIsFeatured] = useState<boolean | undefined>(initialFeatured);
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(initialAvailable);
  
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await productService.getProducts({
        page,
        limit,
        search,
        isFeatured,
        isAvailable,
      });
      
      setProducts(result.products);
      setTotal(result.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, isFeatured, isAvailable, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add this function to get a single product by ID
  const getProductById = async (id: string): Promise<Product> => {
    try {
      setLoading(true);
      const product = await productService.getProductById(id);
      return product;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch product';
      showToast(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductFormValues): Promise<Product | null> => {
    try {
      setLoading(true);
      const newProduct = await productService.createProduct(productData);
      await fetchProducts(); // Refresh the list
      showToast('Product created successfully', 'success');
      return newProduct;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      showToast(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductFormValues>): Promise<Product | null> => {
    try {
      setLoading(true);
      const updatedProduct = await productService.updateProduct(id, productData);
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.$id === id ? updatedProduct : product
      ));
      
      showToast('Product updated successfully', 'success');
      return updatedProduct;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      showToast(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await productService.deleteProduct(id);
      
      // Update local state
      setProducts(prev => prev.filter(product => product.$id !== id));
      setTotal(prev => prev - 1);
      
      showToast('Product deleted successfully', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      showToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean): Promise<boolean> => {
    try {
      const updatedProduct = await productService.toggleFeatured(id, featured);
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.$id === id ? updatedProduct : product
      ));
      
      showToast(`Product ${featured ? 'marked as featured' : 'removed from featured'}`, 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      showToast(message, 'error');
      return false;
    }
  };

  const toggleAvailable = async (id: string, available: boolean): Promise<boolean> => {
    try {
      const updatedProduct = await productService.toggleAvailable(id, available);
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.$id === id ? updatedProduct : product
      ));
      
      showToast(`Product ${available ? 'set as available' : 'set as unavailable'}`, 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      showToast(message, 'error');
      return false;
    }
  };

  const refreshProducts = () => {
    fetchProducts();
  };

  const resetFilters = () => {
    setPage(1);
    setSearch('');
    setIsFeatured(undefined);
    setIsAvailable(undefined);
  };

  return {
    // State
    products,
    loading,
    error,
    page,
    total,
    search,
    isFeatured,
    isAvailable,
    
    // Actions
    setPage,
    setSearch,
    setIsFeatured,
    setIsAvailable,
    
    // CRUD Operations
    getProductById, // Added this
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured,
    toggleAvailable,
    
    // Utilities
    refreshProducts,
    resetFilters,
    
    // Computed values
    totalPages: Math.ceil(total / limit),
    hasProducts: products.length > 0,
    showingCount: `${Math.min(page * limit, total)} of ${total} products`,
  };
};