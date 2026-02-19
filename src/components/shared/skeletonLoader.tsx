import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'table' | 'form';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  className = '',
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const renderCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <div className="bg-gray-300 dark:bg-gray-700 h-24 w-24 rounded-md"></div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="flex space-x-2 pt-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {skeletons.map((i) => (
          <div key={i} className="p-4 flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
            </div>
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="space-y-6">
        <div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/6 mb-2"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/6 mb-2"></div>
          <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/6 mb-2"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          <div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/6 mb-2"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      {skeletons.map((i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
          </div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return renderCardSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'form':
        return renderFormSkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  if (count > 1 && type !== 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {skeletons.map((i) => (
          <div key={i}>{renderSkeleton()}</div>
        ))}
      </div>
    );
  }

  return <div className={className}>{renderSkeleton()}</div>;
};

export default SkeletonLoader;