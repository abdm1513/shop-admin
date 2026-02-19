import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '../../components/forms/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ProductFormValues } from '../../types';

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id && id !== 'new';
  
  const [loading, setLoading] = useState(isEdit);
  const [productData, setProductData] = useState<Partial<ProductFormValues> | null>(null);
  
  // Use the hook at the top level
  const { getProductById, createProduct, updateProduct } = useProducts();

  useEffect(() => {
    if (isEdit && id) {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [id, isEdit]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await getProductById(id!);
      
      // Convert product to form values
      const formData: Partial<ProductFormValues> = {
        name: product.name,
        brand: product.brand,
        sku: product.sku,
        description: product.description,
        price: product.price,
        unit: product.unit,
        discount: product.discount,
        categoryId: product.categoryId,
        images: product.images,
        isFeatured: product.isFeatured,
        isAvailable: product.isAvailable,
        stockQuantity: product.stockQuantity,
      };
      
      setProductData(formData);
    } catch (error) {
      showToast('Failed to load product', 'error');
      console.error('Error loading product:', error);
      navigate('/products'); // Redirect to products list if error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      
      if (isEdit && id) {
        // Update existing product
        await updateProduct(id, data);
        showToast('Product updated successfully', 'success');
        navigate('/products');
      } else {
        // Create new product
        await createProduct(data);
        showToast('Product created successfully', 'success');
        navigate('/products');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save product';
      showToast(message, 'error');
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loading && !productData && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update product details' : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        initialData={productData || {}}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
        isEdit={isEdit} // This should be true when editing
      />
    </div>
  );
};

export default ProductEdit;