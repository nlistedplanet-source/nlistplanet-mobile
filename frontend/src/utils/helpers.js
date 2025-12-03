// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format number
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Format number in short form (1K, 1L, 1Cr)
export const formatShortNumber = (num) => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr';
  }
  if (num >= 100000) {
    return (num / 100000).toFixed(1).replace(/\.0$/, '') + ' L';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
  }
  return num.toString();
};

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 2;

export const calculatePlatformFee = (amount) => {
  return (amount * PLATFORM_FEE_PERCENTAGE) / 100;
};

// Calculate what BUYER pays (original price + 2%)
export const calculateBuyerPays = (price) => {
  return price * (1 + PLATFORM_FEE_PERCENTAGE / 100);
};

// Calculate what SELLER gets (original price - 2%)
export const calculateSellerGets = (price) => {
  return price * (1 - PLATFORM_FEE_PERCENTAGE / 100);
};

// Legacy function for backward compatibility
export const calculateTotalWithFee = (price) => {
  return calculateBuyerPays(price);
};

/**
 * Get display price based on listing type and viewer
 * @param {number} price - Original listing price
 * @param {string} listingType - 'sell' or 'buy'
 * @param {boolean} isOwner - Is the current user the listing owner
 * @returns {object} { buyerPays, sellerGets, displayPrice, label }
 */
export const getPriceDisplay = (price, listingType, isOwner = false) => {
  const isSell = listingType === 'sell';
  const buyerPays = calculateBuyerPays(price);
  const sellerGets = isSell ? price : calculateSellerGets(price);
  
  if (isOwner) {
    // Owner sees original price
    return {
      buyerPays,
      sellerGets,
      displayPrice: price,
      label: 'Your Price'
    };
  }
  
  // Other users see price with fee
  if (isSell) {
    // SELL listing: Other users are buyers, show what they pay
    return {
      buyerPays,
      sellerGets,
      displayPrice: buyerPays,
      label: 'Price'
    };
  } else {
    // BUY listing: Other users are sellers, show what they get
    return {
      buyerPays,
      sellerGets,
      displayPrice: sellerGets,
      label: 'Price'
    };
  }
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Format time ago
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};

// Format percentage
export const formatPercentage = (value) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

// Validate password
export const isValidPassword = (password) => {
  return password.length >= 8;
};

// Generate letter avatar
export const getLetterAvatar = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

// Get company logo URL
export const getCompanyLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  
  // If already full URL
  if (logoPath.startsWith('http')) return logoPath;
  
  // Construct full URL from relative path
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';
  return `${frontendUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Share listing
export const shareListing = async (listing) => {
  const shareUrl = `${window.location.origin}/listing/${listing._id}`;
  const shareText = `Check out this ${listing.type === 'sell' ? 'selling' : 'buying'} opportunity: ${listing.companyName} at ${formatCurrency(listing.price)} per share`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${listing.companyName} - NList Planet`,
        text: shareText,
        url: shareUrl
      });
      return true;
    } catch (error) {
      // User cancelled or error
      console.log('Share cancelled:', error);
      return false;
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      return 'copied';
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Haptic feedback (if available)
export const haptic = {
  light: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  },
  medium: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  },
  heavy: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  },
  success: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([10, 50, 10]);
    }
  },
  error: () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([50, 100, 50]);
    }
  }
};

// Trigger haptic feedback function for easier import
export const triggerHaptic = (type = 'light') => {
  if (haptic[type]) {
    haptic[type]();
  }
};
