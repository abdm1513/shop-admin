import React, { useState, useEffect } from 'react';
import { Save, X, Package, DollarSign, Percent, Hash, Box } from 'lucide-react';
import { ProductFormValues } from '../../types';
import { validateProductForm } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatters';
import { Input, TextArea, Select } from '../shared/Input';
import { useCategories } from '../../hooks/useCategories';
import ImageUpload from './imageUpload';

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const defaultValues: ProductFormValues = {
  name: '',
  brand: '',
  sku: '',
  description: '',
  price: 0,
  unit: 'pcs',
  discount: 0,
  categoryId: '',
  images: [],
  isFeatured: false,
  isAvailable: true,
  stockQuantity: 0,
};

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<ProductFormValues>({
    ...defaultValues,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Use real categories from database
  const { categories, loading: categoriesLoading } = useCategories();

  const units = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'g', label: 'Grams' },
    { value: 'l', label: 'Liters' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'm', label: 'Meters' },
    { value: 'cm', label: 'Centimeters' },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    let newValue: any;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      // Handle empty string or invalid number
      const numValue = parseFloat(value);
      newValue = isNaN(numValue) ? '' : numValue;
    } else {
      newValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (touched[name]) {
      validateField(name, newValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Convert empty string to 0 for number fields on blur
    if ((name === 'price' || name === 'discount' || name === 'stockQuantity') && value === '') {
      setFormData((prev) => ({
        ...prev,
        [name]: 0,
      }));
      validateField(name, 0);
    } else {
      validateField(name, value);
    }
  };

  const validateField = (name: string, value: any) => {
    const validationErrors = validateProductForm({
      name: name === 'name' ? String(value) : formData.name,
      sku: name === 'sku' ? String(value) : formData.sku,
      price: name === 'price' ? (typeof value === 'number' ? value : parseFloat(value) || 0) : formData.price,
      discount: name === 'discount' ? (typeof value === 'number' ? value : parseFloat(value) || 0) : formData.discount,
      stockQuantity: name === 'stockQuantity' ? (typeof value === 'number' ? value : parseFloat(value) || 0) : formData.stockQuantity,
    });

    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name] || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Convert empty strings to 0 for number fields
    const submitData = {
      ...formData,
      price: formData.price || 0,
      discount: formData.discount || 0,
      stockQuantity: formData.stockQuantity || 0,
    };

    // Validate all fields
    const validationErrors = validateProductForm({
      name: submitData.name,
      sku: submitData.sku,
      price: submitData.price,
      discount: submitData.discount,
      stockQuantity: submitData.stockQuantity,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Additional validation
    if (submitData.images.length === 0) {
      setErrors((prev) => ({ ...prev, images: 'At least one image is required' }));
      return;
    }

    // Clear images error if exists
    if (errors.images) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const calculateFinalPrice = () => {
    const price = formData.price || 0;
    const discount = formData.discount || 0;
    const discountAmount = price * (discount / 100);
    return price - discountAmount;
  };

  const handleImagesChange = (images: (string | File)[]) => {
    setFormData((prev) => ({ ...prev, images }));
    if (errors.images && images.length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  // Convert categories to select options
  const categoryOptions = categories.map(category => ({
    value: category.$id,
    label: category.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : undefined}
            placeholder="Enter product name"
            required
            icon={Package}
          />

          <Input
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.sku ? errors.sku : undefined}
            placeholder="Enter SKU"
            required
            icon={Hash}
          />

          <Input
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter brand name"
          />

          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            onBlur={handleBlur}
            options={categoryOptions}
            placeholder={categoriesLoading ? "Loading categories..." : "Select category"}
            disabled={categoriesLoading}
            required
          />
        </div>

        <div className="mt-6">
          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter product description"
            rows={4}
          />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Pricing & Stock
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Input
            label="Price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price === 0 ? '' : formData.price}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.price ? errors.price : undefined}
            placeholder="0.00"
            required
            icon={DollarSign}
          />

          <Input
            label="Discount (%)"
            name="discount"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.discount === 0 ? '' : formData.discount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.discount ? errors.discount : undefined}
            placeholder="0"
            icon={Percent}
          />

          <Input
            label="Stock Quantity"
            name="stockQuantity"
            type="number"
            min="0"
            value={formData.stockQuantity === 0 ? '' : formData.stockQuantity}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.stockQuantity ? errors.stockQuantity : undefined}
            placeholder="0"
            required
            icon={Box}
          />

          <Select
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            onBlur={handleBlur}
            options={units}
          />
        </div>

        {/* Price summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Original Price:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(formData.price || 0)}
            </span>
          </div>
          {(formData.discount || 0) > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Discount ({formData.discount}%):</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency((formData.price || 0) * ((formData.discount || 0) / 100))}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Final Price:</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(calculateFinalPrice())}
            </span>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Product Images
        </h3>
        
        {errors.images && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.images}</p>
          </div>
        )}

        <ImageUpload
          images={formData.images}
          onChange={handleImagesChange}
          maxImages={10}
          disabled={isLoading}
        />
      </div>

      {/* Status & Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Status & Actions
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Featured Product
              </span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Available for Sale
              </span>
            </label>
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="h-4 w-4 mr-2 inline" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;