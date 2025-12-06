import React, { createContext, useState, useContext } from 'react';
import PBLoader from '../components/common/PBLoader';

/**
 * Global Loader Context - PBPartners style
 * Use showLoader() and hideLoader() anywhere in the app
 * 
 * Usage:
 * const { showLoader, hideLoader } = useLoader();
 * 
 * showLoader();  // Show rotating Lottie loader
 * await fetchData();
 * hideLoader();  // Hide loader
 */

const LoaderContext = createContext();

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within LoaderProvider');
  }
  return context;
};

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);

  // Show loader - supports nested calls
  const showLoader = () => {
    setLoadingCount(prev => {
      const newCount = prev + 1;
      if (newCount === 1) setIsLoading(true);
      return newCount;
    });
  };

  // Hide loader - only hides when all nested calls are done
  const hideLoader = () => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) setIsLoading(false);
      return newCount;
    });
  };

  // Force hide all loaders
  const forceHideLoader = () => {
    setLoadingCount(0);
    setIsLoading(false);
  };

  const value = {
    isLoading,
    showLoader,
    hideLoader,
    forceHideLoader
  };

  return (
    <LoaderContext.Provider value={value}>
      {children}
      <PBLoader show={isLoading} />
    </LoaderContext.Provider>
  );
};

export default LoaderContext;
