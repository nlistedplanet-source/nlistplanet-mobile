// Format currency
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// Format number
export const formatNumber = (num) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('en-IN').format(n);
};

// Format number in short form (1K, 1L, 1Cr)
export const formatShortNumber = (num) => {
  if (num === undefined || num === null) return '0';
  const n = Number(num) || 0;
  if (n >= 10000000) {
    return (n / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr';
  }
  if (n >= 100000) {
    return (n / 100000).toFixed(1).replace(/\.0$/, '') + ' L';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
  }
  return n.toString();
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

// SELL listing: BuyerPays = SellerGets * 1.02 => SellerGets = BuyerPays / 1.02
export const calculateSellerGetsFromBuyerPrice = (buyerPrice) => {
  return buyerPrice / (1 + PLATFORM_FEE_PERCENTAGE / 100);
};

// BUY listing: SellerGets = BuyerPays * 0.98 => BuyerPays = SellerGets / 0.98
export const calculateBuyerPaysFromSellerPrice = (sellerPrice) => {
  return sellerPrice / (1 - PLATFORM_FEE_PERCENTAGE / 100);
};

/**
 * Universal helper to get the correct price for a specific user
 * @param {object} item - The bid, offer, or counter object
 * @param {string} listingType - 'sell' or 'buy'
 * @param {boolean} isOwner - Is the current user the listing owner?
 * @param {string} counterBy - If this is a counter, who made it? ('buyer' or 'seller')
 * @returns {number} - The price the user should see
 */
export const getNetPriceForUser = (item, listingType, isOwner, counterBy = null) => {
  if (!item) return 0;
  
  const isSell = listingType === 'sell';
  const price = item.price;
  
  // Determine if the current user is the Seller or Buyer in this transaction
  const isCurrentUserSeller = (isSell && isOwner) || (!isSell && !isOwner);
  
  // Who made this price?
  // If no counterBy, we determine based on context:
  // If I am owner of SELL listing, the bid was made by buyer
  // If I am owner of BUY listing, the offer was made by seller
  const maker = counterBy || (isSell ? 'buyer' : 'seller');
  
  if (isCurrentUserSeller) {
    // I am Seller. I want to see what I GET.
    // If buyer made the price at ₹90, seller gets ₹90 * 0.98 = ₹88.20
    if (maker === 'buyer') {
      // Buyer's price is what they're willing to pay
      // Seller receives: price * 0.98 (platform takes 2%)
      return item.sellerReceivesPrice || (price * 0.98);
    }
    // Seller made this price, show as-is (what seller wants to receive)
    return price;
  } else {
    // I am Buyer. I want to see what I PAY.
    if (maker === 'seller') {
      // Seller's price is what they want to receive
      // Buyer pays: price * 1.02 (platform adds 2%)
      return item.buyerOfferedPrice || (price * 1.02);
    }
    // Buyer made this price, show as-is (what buyer is offering to pay)
    return price;
  }
};

// Legacy function for backward compatibility
export const calculateTotalWithFee = (price) => {
  return calculateBuyerPays(price);
};

/**
 * Get display price based on listing type and viewer
 * Platform fee model: Company always earns 2%
 * - SELL listing: Buyer pays price + 2%
 * - BUY listing: Seller gets price - 2%
 * 
 * @param {number} price - Original listing price
 * @param {string} listingType - 'sell' or 'buy'
 * @param {boolean} isOwner - Is the current user the listing owner
 * @returns {object} { displayPrice, label }
 */
export const getPriceDisplay = (price, listingType, isOwner = false) => {
  const isSell = listingType === 'sell';
  
  if (isOwner) {
    // Owner sees original price
    return {
      displayPrice: price,
      label: 'Your Price'
    };
  }
  
  // Other users see price with fee applied (no breakdown shown)
  if (isSell) {
    // SELL listing: Other users are buyers, show what they pay (price + 2%)
    return {
      displayPrice: calculateBuyerPays(price),
      label: 'Price'
    };
  } else {
    // BUY listing: Other users are sellers, show what they get (price - 2%)
    return {
      displayPrice: calculateSellerGets(price),
      label: 'Price'
    };
  }
};

// Format date
export const formatDate = (date, short = false) => {
  if (short) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  }
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
  if (value === undefined || value === null) return '+0.00%';
  const v = Number(value) || 0;
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
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
      if (!item) return null;
      
      // Try to parse as JSON, if fails return raw string (for tokens)
      try {
        return JSON.parse(item);
      } catch {
        // Not valid JSON, return as-is (raw token string)
        return item;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      // Store strings directly, objects as JSON
      const toStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, toStore);
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

// Convert number to words (Indian format) with decimal support
export const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero Rupees';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertTwoDigits = (n) => {
    if (n < 10) return ones[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };
  
  const convertThreeDigits = (n) => {
    if (n === 0) return '';
    if (n < 100) return convertTwoDigits(n);
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertTwoDigits(n % 100) : '');
  };
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = '';
  let remaining = rupees;
  
  if (remaining >= 10000000) {
    const crores = Math.floor(remaining / 10000000);
    result += convertThreeDigits(crores) + ' Crore ';
    remaining %= 10000000;
  }
  
  if (remaining >= 100000) {
    const lakhs = Math.floor(remaining / 100000);
    result += convertTwoDigits(lakhs) + ' Lakh ';
    remaining %= 100000;
  }
  
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    result += convertTwoDigits(thousands) + ' Thousand ';
    remaining %= 1000;
  }
  
  if (remaining >= 100) {
    result += ones[Math.floor(remaining / 100)] + ' Hundred ';
    remaining %= 100;
  }
  
  if (remaining > 0) {
    result += convertTwoDigits(remaining);
  }
  
  result = result.trim();
  
  if (rupees === 0) {
    result = 'Zero';
  }
  result += ' Rupees';
  
  if (paise > 0) {
    result += ' ' + convertTwoDigits(paise) + ' Paise';
  }
  
  return result.replace(/\s+/g, ' ');
};
