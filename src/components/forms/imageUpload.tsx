import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Eye, Trash2 } from 'lucide-react';
import { validateImageFile } from '../../utils/validators';
import { formatFileSize } from '../../utils/formatters';
import { getFileUrl } from '../../lib/appwrite';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ImageUploadProps {
  images: (string | File)[];
  onChange: (images: (string | File)[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 10,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadingIndex, _setUploadingIndex] = useState<number | null>(null);

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const newImages: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        const error = validateImageFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          newImages.push(file);
        }
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      if (newImages.length > 0) {
        const totalImages = images.length + newImages.length;
        if (totalImages > maxImages) {
          alert(`Maximum ${maxImages} images allowed. You have ${images.length} images.`);
          return;
        }

        onChange([...images, ...newImages]);
      }
    },
    [images, onChange, maxImages, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    },
    [images, onChange]
  );

  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      const newImages = [...images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      onChange(newImages);
    },
    [images, onChange]
  );

  const getImageUrl = (image: string | File): string => {
    if (typeof image === 'string') {
      return getFileUrl(image);
    }
    return URL.createObjectURL(image);
  };

  const renderImage = (image: string | File, index: number) => {
    const url = getImageUrl(image);
    const isUploading = uploadingIndex === index;

    return (
      <div
        key={index}
        className="relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Image */}
        <div className="aspect-square relative overflow-hidden">
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <LoadingSpinner size="md" text="Uploading..." />
            </div>
          ) : (
            <img
              src={url}
              alt={`Product image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onLoad={() => {
                if (image instanceof File) {
                  URL.revokeObjectURL(url);
                }
              }}
            />
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => window.open(url, '_blank')}
              className="p-2 bg-white rounded-full m-1 hover:bg-gray-100 transition-colors"
              title="View full size"
            >
              <Eye className="h-4 w-4 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => removeImage(index)}
              disabled={disabled}
              className="p-2 bg-white rounded-full m-1 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Drag handle */}
          {images.length > 1 && !disabled && (
            <div
              className="absolute top-2 left-2 p-1.5 bg-black bg-opacity-50 rounded cursor-move"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                moveImage(fromIndex, index);
              }}
              title="Drag to reorder"
            >
              <div className="w-4 h-1 bg-white mb-1"></div>
              <div className="w-4 h-1 bg-white mb-1"></div>
              <div className="w-4 h-1 bg-white"></div>
            </div>
          )}

          {/* Image info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {image instanceof File ? (
              <>
                <p className="font-medium truncate">{image.name}</p>
                <p>{formatFileSize(image.size)}</p>
              </>
            ) : (
              <p className="truncate">Uploaded image</p>
            )}
          </div>

          {/* Index badge */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            {index + 1}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Product Images
        <span className="text-gray-500 text-xs ml-2">
          {images.length} / {maxImages}
        </span>
      </label>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => renderImage(image, index))}
        </div>
      )}

      {/* Upload area */}
      {images.length < maxImages && !disabled && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="max-w-md mx-auto">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Upload className="h-6 w-6 text-gray-500" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Drag & drop images here
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                or click to browse files
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports JPG, PNG, WebP, GIF • Max 5MB per image
              </p>
            </div>

            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files)}
              className="hidden"
            />
            <label htmlFor="image-upload">
              <div className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors">
                <ImageIcon className="h-4 w-4 mr-2" />
                Select Images
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Help text */}
      {images.length === 0 && !disabled && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload at least one image for the product. First image will be used as the main product image.
        </p>
      )}

      {/* Error state */}
      {disabled && images.length === 0 && (
        <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No images uploaded
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;