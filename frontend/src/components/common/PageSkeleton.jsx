import React from 'react';

/**
 * Inline skeleton loader for page content
 * Use this instead of full-screen LoadingScreen to avoid duplicate loading screens
 */
const PageSkeleton = ({ title, count = 3 }) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-slate-100 to-gray-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
        <div className="px-6 pt-safe pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse" />
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
          {/* Filter Tabs Skeleton */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-6 px-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-6 pt-4 space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-mobile">
    <div className="flex items-start gap-3">
      {/* Icon Skeleton */}
      <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
      
      {/* Content Skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

// Simple inline loader for small sections
export const InlineLoader = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mb-3" />
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

// List skeleton for inside page content
export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export { CardSkeleton };
export default PageSkeleton;
