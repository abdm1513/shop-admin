import React, { useState, useEffect } from 'react';
import { Save, X, Image as ImageIcon, Link as LinkIcon, Hash, Eye } from 'lucide-react';
import { BannerFormValues } from '../../types';
import { Input } from '../shared/Input';

interface BannerFormProps {
  initialData?: Partial<BannerFormValues>;
  onSubmit: (data: BannerFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const defaultValues: BannerFormValues = {
  image: '',
  link: '',
  isActive: true,
  sortOrder: 0,
};

export const BannerForm: React.FC<BannerFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<BannerFormValues>({
    ...defaultValues,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      
      // Set image preview if image exists
      if (initialData.image) {
        if (typeof initialData.image === 'string') {
          setImagePreview(initialData.image);
        } else if (initialData.image instanceof File) {
          setImagePreview(URL.createObjectURL(initialData.image));
        }
      }
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
    
    if ((name === 'sortOrder') && value === '') {
      setFormData((prev) => ({
        ...prev,
        [name]: 0,
      }));
      validateField(name, 0);
    } else {
      validateField(name, value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Only JPEG, PNG, and WebP images are allowed',
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image size should be less than 5MB',
      }));
      return;
    }

    // Clear any previous image error
    if (errors.image) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }));
    setImagePreview(null);
    
    if (errors.image) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const validateField = (name: string, value: any) => {
    const newErrors: Record<string, string> = { ...errors };
    
    if (name === 'image') {
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        newErrors.image = 'Banner image is required';
      } else {
        delete newErrors.image;
      }
    }
    
    if (name === 'link') {
      if (value && value.trim().length > 0) {
        try {
          new URL(value);
          delete newErrors.link;
        } catch {
          newErrors.link = 'Please enter a valid URL';
        }
      } else {
        delete newErrors.link;
      }
    }
    
    if (name === 'sortOrder') {
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      if (numValue < 0) {
        newErrors.sortOrder = 'Sort order cannot be negative';
      } else if (numValue > 100) {
        newErrors.sortOrder = 'Sort order cannot exceed 100';
      } else {
        delete newErrors.sortOrder;
      }
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate form
    const validationErrors: Record<string, string> = {};
    
    if (!formData.image || (typeof formData.image === 'string' && formData.image.trim().length === 0)) {
      validationErrors.image = 'Banner image is required';
    }
    
    if (formData.link && formData.link.trim().length > 0) {
      try {
        new URL(formData.link);
      } catch {
        validationErrors.link = 'Please enter a valid URL';
      }
    }
    
    const sortOrder = formData.sortOrder || 0;
    if (sortOrder < 0) {
      validationErrors.sortOrder = 'Sort order cannot be negative';
    } else if (sortOrder > 100) {
      validationErrors.sortOrder = 'Sort order cannot exceed 100';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Banner Information
        </h3>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Banner Image <span className="text-red-500">*</span>
          </label>
          
          {errors.image && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.image}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.image instanceof File ? formData.image.name : 'Uploaded image'}
                        </p>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="mt-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Remove image
                        </button>
                      </div>
                      <a
                        href={imagePreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Full Size
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area */}
            {!imagePreview && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <div className="max-w-md mx-auto">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <ImageIcon className="h-6 w-6 text-gray-500" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Upload banner image
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Required. Recommended ratio: 16:9 • Max 5MB
                    </p>
                  </div>

                  <input
                    type="file"
                    id="banner-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="banner-image">
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Select Image
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Link URL (Optional)"
            name="link"
            value={formData.link}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.link ? errors.link : undefined}
            placeholder="https://example.com/page"
            helperText="Where users will be directed when clicking the banner"
            icon={LinkIcon}
          />

          <Input
            label="Sort Order"
            name="sortOrder"
            type="number"
            min="0"
            max="100"
            value={formData.sortOrder === 0 ? '' : formData.sortOrder}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.sortOrder ? errors.sortOrder : undefined}
            placeholder="0"
            helperText="Lower numbers appear first (0-100)"
            icon={Hash}
          />
        </div>

        {/* Status */}
        <div className="mt-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active Banner
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
            Only active banners are displayed on the website
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isEdit ? 'Update banner details' : 'Create a new banner'}
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
                  {isEdit ? 'Update Banner' : 'Create Banner'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default BannerForm;