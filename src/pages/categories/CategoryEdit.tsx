import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CategoryForm from '../../components/forms/CategoryForm';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { CategoryFormValues } from '../../types';

const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const isEdit = !!id && id !== 'new';
  
  const [loading, setLoading] = useState(isEdit);
  const [categoryData, setCategoryData] = useState<Partial<CategoryFormValues> | null>(null);
  
  const { getCategoryById, createCategory, updateCategory } = useCategories();

  useEffect(() => {
    if (isEdit && id) {
      loadCategory();
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const category = await getCategoryById(id!); // Add ! to assert id is not undefined
      
      const formData: Partial<CategoryFormValues> = {
        name: category.name,
        sortOrder: category.sortOrder,
        image: category.image,
      };
      
      setCategoryData(formData);
    } catch (error) {
      showToast('Failed to load category', 'error');
      console.error('Error loading category:', error);
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      
      if (isEdit && id) {
        await updateCategory(id, data);
        showToast('Category updated successfully', 'success');
        navigate('/categories');
      } else {
        await createCategory(data);
        showToast('Category created successfully', 'success');
        navigate('/categories');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save category';
      showToast(message, 'error');
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/categories');
  };

  if (loading && !categoryData && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading category..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/categories')}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Category' : 'Create New Category'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update category details' : 'Add a new category'}
          </p>
        </div>
      </div>

      {/* Category Form */}
      <CategoryForm
        initialData={categoryData || {}}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
        isEdit={isEdit}
      />
    </div>
  );
};

export default CategoryEdit;