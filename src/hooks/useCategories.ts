import { useState, useEffect, useCallback } from 'react';
import { Category, CategoryFormValues } from '../types';
import * as categoryService from '../services/categoryService';
import { useToast } from './useToast';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedCategories = await categoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryById = async (id: string): Promise<Category> => {
    try {
      setLoading(true);
      const category = await categoryService.getCategoryById(id);
      return category;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch category';
      showToast(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: CategoryFormValues): Promise<Category | null> => {
    try {
      setLoading(true);
      const newCategory = await categoryService.createCategory(categoryData);
      await fetchCategories(); // Refresh the list
      showToast('Category created successfully', 'success');
      return newCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      showToast(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<CategoryFormValues>): Promise<Category | null> => {
    try {
      setLoading(true);
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      
      // Update local state
      setCategories(prev => prev.map(category => 
        category.$id === id ? updatedCategory : category
      ));
      
      showToast('Category updated successfully', 'success');
      return updatedCategory;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      showToast(message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await categoryService.deleteCategory(id);
      
      // Update local state
      setCategories(prev => prev.filter(category => category.$id !== id));
      
      showToast('Category deleted successfully', 'success');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      showToast(message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = () => {
    fetchCategories();
  };

  return {
    // State
    categories,
    loading,
    error,
    
    // Actions
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    
    // Computed values
    hasCategories: categories.length > 0,
    sortedCategories: [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
  };
};