import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  MessageCircle,
  Plus,
  ThumbsUp,
  X,
  Clock,
  Heart,
  Info,
  Check,
  Send,
  Gavel,
  Star
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, haptic, debounce, formatDate, formatNumber, getPriceDisplay } from '../../utils/helpers';
import { useLoader } from '../../context/LoaderContext';
import toast from 'react-hot-toast';
import BidOfferModal from '../../components/modals/BidOfferModal';

// Format quantity - 5000 to 5K, 100000 to 1L etc
const formatQty = (qty) => {
  if (qty >= 10000000) return (qty / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
  if (qty >= 100000) return (qty / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
  if (qty >= 1000) return (qty / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return qty?.toString() || '0';
};

// Convert number to words (Indian format)
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanHundred = (n) => {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };
  
  const convertLessThanThousand = (n) => {
    if (n < 100) return convertLessThanHundred(n);
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanHundred(n % 100) : '');
  };
  
  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    const remainder = num % 10000000;
    return convertLessThanThousand(crore) + ' Crore' + (remainder ? ' ' + numberToWords(remainder) : '');
  }
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    const remainder = num % 100000;
    return convertLessThanThousand(lakh) + ' Lakh' + (remainder ? ' ' + numberToWords(remainder) : '');
  }
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    return convertLessThanThousand(thousand) + ' Thousand' + (remainder ? ' ' + numberToWords(remainder) : '');
  }
  return convertLessThanThousand(num);
};

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null); // For popup modal
  const [showConfirmation, setShowConfirmation] = useState(false); // Accept confirmation
  const [showBidModal, setShowBidModal] = useState(false); // Bid modal

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, activeFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      showLoader(); // PBPartners style loader
      const response = await listingsAPI.getAll({ status: 'active' });
      setListings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    showLoader(); // PBPartners style loader
    await fetchListings();
    setRefreshing(false);
    haptic.success();
  };

  const filterListings = useCallback(() => {
    let filtered = [...listings];
    if (activeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.type === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.companyName?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query)
      );
    }
    setFilteredListings(filtered);
  }, [listings, searchQuery, activeFilter]);

  const handleCardClick = (listing) => {
    haptic.light();
    setSelectedListing(listing);
  };

  const closeModal = () => {
    setSelectedListing(null);
    setShowConfirmation(false);
  };

  const debouncedSearch = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  // Loading state - return null to let Suspense handle it
  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header - Compact Amber Theme */}
      <div className="bg-gradient-to-r from-slate-100 to-gray-50 sticky top-0 z-20 shadow-sm border-b border-slate-200">
        <div className="px-3 pt-safe pb-2">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base font-bold text-gray-900">Marketplace</h1>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search Bar - Smaller */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Filter Tabs - Smaller */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-3 px-3">
            {[
              { value: 'all', label: 'All' },
              { value: 'sell', label: 'Selling', icon: TrendingDown },
              { value: 'buy', label: 'Buying', icon: TrendingUp }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => { haptic.light(); setActiveFilter(value); }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  activeFilter === value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  {Icon && <Icon size={11} />}
                  {label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid - 2 Column */}
      <div className="px-2 pt-2">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">No Listings Found</h3>
            <p className="text-gray-500 text-xs">
              {searchQuery ? 'Try a different search' : 'No active listings'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 pb-4">
            {filteredListings.map((listing) => (
              <CompactCard 
                key={listing._id} 
                listing={listing} 
                onClick={() => handleCardClick(listing)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {selectedListing && !showBidModal && (
        <PopupModal 
          listing={selectedListing} 
          onClose={closeModal}
          navigate={navigate}
          showConfirmation={showConfirmation}
          setShowConfirmation={setShowConfirmation}
          onBidClick={() => setShowBidModal(true)}
        />
      )}

      {/* Bid/Offer Modal */}
      <BidOfferModal
        isOpen={showBidModal}
        listing={selectedListing}
        onClose={() => {
          setShowBidModal(false);
        }}
        onSuccess={() => {
          setShowBidModal(false);
          setSelectedListing(null);
          fetchListings(); // Refresh listings
        }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPACT CARD - Vibrant design with distinct BUY/SELL styling
// ═══════════════════════════════════════════════════════════════
const CompactCard = ({ listing, onClick }) => {
  const [showQtyTooltip, setShowQtyTooltip] = useState(false);
  const isSell = listing.type === 'sell';
  const priceInfo = getPriceDisplay(listing.price, listing.type, false);
  const displayPrice = priceInfo.displayPrice;
  const qty = listing.quantity || 0;
  const formattedQty = formatQty(qty);
  const fullQty = formatNumber(qty);
  const qtyInWords = numberToWords(qty);
  
  // BUY opportunity = green theme (seller is selling, user can buy)
  // SELL opportunity = blue theme (buyer is buying, user can sell to them)
  const cardStyles = isSell ? {
    border: 'border-blue-200',
    gradient: 'from-blue-50 to-white',
    tagBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    tagText: 'text-white',
    priceColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    shadow: 'shadow-blue-100/50'
  } : {
    border: 'border-green-200',
    gradient: 'from-green-50 to-white',
    tagBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    tagText: 'text-white',
    priceColor: 'text-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    shadow: 'shadow-green-100/50'
  };
  
  return (
    <div
      onClick={onClick}
      className={`relative bg-gradient-to-br ${cardStyles.gradient} rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg ${cardStyles.shadow} active:scale-[0.97] border ${cardStyles.border}`}
    >
      <div className="p-3">
        {/* Top Row: Logo and Company Info */}
        <div className="flex items-start gap-2.5 mb-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            {(listing.companyId?.logo || listing.companyId?.Logo) ? (
              <img
                src={listing.companyId.logo || listing.companyId.Logo}
                alt={listing.companyName}
                className="w-11 h-11 rounded-xl object-contain bg-white border-2 border-white shadow-sm"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className={`w-11 h-11 rounded-xl ${cardStyles.iconBg} flex items-center justify-center border-2 border-white shadow-sm`}>
                <span className={`${cardStyles.iconColor} font-bold text-lg`}>
                  {listing.companyName?.[0] || 'C'}
                </span>
              </div>
            )}
          </div>
          
          {/* Company Name */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-bold text-[13px] text-gray-900 leading-tight line-clamp-2">
              {listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyName}
            </h3>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px ${isSell ? 'bg-blue-100' : 'bg-green-100'} mb-2.5`}></div>

        {/* Price & Qty Row */}
        <div className="flex items-center justify-between">
          {/* Left: Price */}
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Price</p>
            <p className={`text-base font-bold ${cardStyles.priceColor}`}>
              {formatCurrency(displayPrice)}
            </p>
          </div>
          
          {/* Right: Qty with hover tooltip */}
          <div 
            className="relative text-right"
            onMouseEnter={() => setShowQtyTooltip(true)}
            onMouseLeave={() => setShowQtyTooltip(false)}
            onTouchStart={() => setShowQtyTooltip(true)}
            onTouchEnd={() => setTimeout(() => setShowQtyTooltip(false), 2000)}
          >
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Qty</p>
            <p className="text-base font-bold text-gray-700 cursor-help">
              {formattedQty}
            </p>
            
            {/* Quantity Tooltip */}
            {showQtyTooltip && (
              <div className="absolute bottom-full right-0 mb-1 z-50 animate-fadeIn">
                <div className="bg-gray-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                  <p className="font-medium">{fullQty} shares</p>
                  <p className="text-gray-300 text-[9px]">{qtyInWords}</p>
                </div>
                <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Hint */}
        <div className={`mt-2.5 py-1.5 rounded-lg ${isSell ? 'bg-blue-50' : 'bg-green-50'} text-center`}>
          <p className={`text-[10px] font-semibold ${isSell ? 'text-blue-600' : 'text-green-600'}`}>
            {isSell ? 'Tap to Buy Shares →' : 'Tap to Sell Shares →'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// POPUP MODAL - Card click opens animated popup with full details
// ═══════════════════════════════════════════════════════════════
const PopupModal = ({ listing, onClose, navigate, showConfirmation, setShowConfirmation, onBidClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const isSell = listing.type === 'sell';
  const priceInfo = getPriceDisplay(listing.price, listing.type, false);
  const displayPrice = priceInfo.displayPrice;
  const priceLabel = priceInfo.label;
  const bidsCount = isSell ? listing.bids?.length || 0 : listing.offers?.length || 0;
  const company = listing.companyId || {};
  const qty = listing.quantity || 0;
  const totalAmount = displayPrice * qty;
  const platformFee = totalAmount * 0.02;
  const finalAmount = totalAmount + platformFee;

  const handleLike = (e) => {
    e.stopPropagation();
    haptic.light();
    setLiked(!liked);
    if (!liked) {
      toast.success('👍 Liked this listing!', { icon: '👍' });
    } else {
      toast('Removed like', { icon: '👎' });
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    haptic.light();
    setFavorited(!favorited);
    if (!favorited) {
      toast.success('⭐ Added to your Watchlist!', { 
        icon: '⭐',
        duration: 2000
      });
    } else {
      toast('Removed from Watchlist', { icon: '🗑️' });
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    haptic.light();
    if (navigator.share) {
      navigator.share({ 
        title: listing.companyName, 
        url: window.location.origin + `/listing/${listing._id}`
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.origin + `/listing/${listing._id}`);
      toast.success('Link copied!');
    }
  };

  const handleAcceptClick = (e) => {
    e.stopPropagation();
    haptic.medium();
    setShowConfirmation(true);
  };

  const handleBidClick = (e) => {
    e.stopPropagation();
    haptic.medium();
    if (onBidClick) {
      onBidClick(); // Open Bid Modal inline
    } else {
      navigate(`/listing/${listing._id}?action=bid`);
    }
  };

  const handleConfirmPurchase = () => {
    if (!acceptedTerms) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }
    haptic.success();
    toast.success('Order placed successfully!');
    setShowConfirmation(false);
    onClose();
    // TODO: Call API to place order
  };

  // Backdrop click closes modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (showConfirmation) {
        setShowConfirmation(false);
      } else {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scaleIn overflow-hidden max-h-[85vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="p-4">
          {/* ═══ Company Header with Tooltip ═══ */}
          <div className="flex items-start gap-3 mb-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              {(company.logo || company.Logo) ? (
                <img
                  src={company.logo || company.Logo}
                  alt={listing.companyName}
                  className="w-14 h-14 rounded-xl object-contain bg-gray-50 border border-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {listing.companyName?.[0] || 'C'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Company Info */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-base truncate">
                  {company.scriptName || company.ScripName || listing.companyName}
                </h3>
                {/* Type Badge (Flipped for marketplace) */}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  isSell ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {isSell ? 'BUY' : 'SELL'}
                </span>
                {/* Info Tooltip Trigger */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    showTooltip ? 'bg-primary-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <Info size={10} className={showTooltip ? 'text-white' : 'text-gray-500'} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-400">Sector:</span>
                <span className="text-gray-700 font-medium">{company.sector || company.Sector || 'Unlisted'}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] mt-0.5">
                <span className="text-gray-400">{isSell ? 'Seller' : 'Buyer'}:</span>
                <span className="text-gray-700 font-medium">@{listing.username}</span>
              </div>
            </div>
          </div>

          {/* ═══ Company Details Tooltip ═══ */}
          {showTooltip && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] space-y-1.5 animate-fadeIn">
              <p className="text-gray-600">
                <span className="text-gray-400 w-16 inline-block">Company:</span> 
                <span className="font-medium text-gray-800">{company.companyName || company.name || listing.companyName}</span>
              </p>
              {(company.pan || company.PAN) && (
                <p className="text-gray-600">
                  <span className="text-gray-400 w-16 inline-block">PAN:</span> 
                  <span className="font-mono text-gray-800">{company.pan || company.PAN}</span>
                </p>
              )}
              {(company.isin || company.ISIN) && (
                <p className="text-gray-600">
                  <span className="text-gray-400 w-16 inline-block">ISIN:</span> 
                  <span className="font-mono text-gray-800">{company.isin || company.ISIN}</span>
                </p>
              )}
              {(company.cin || company.CIN) && (
                <p className="text-gray-600">
                  <span className="text-gray-400 w-16 inline-block">CIN:</span> 
                  <span className="font-mono text-gray-800 text-[10px]">{company.cin || company.CIN}</span>
                </p>
              )}
            </div>
          )}

          {/* ═══ Price & Quantity ═══ */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-gray-400 text-[10px] mb-1">💰 {priceLabel}</p>
              <p className="text-gray-900 font-bold text-lg">{formatCurrency(displayPrice)}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-gray-400 text-[10px] mb-1">📦 Quantity</p>
              <p className="text-gray-900 font-bold text-lg">{formatNumber(qty)}</p>
            </div>
          </div>

          {/* ═══ Total Value ═══ */}
          <div className="bg-primary-50 rounded-xl p-3 mb-4 border border-primary-100">
            <div className="flex items-center justify-between">
              <span className="text-primary-600 text-sm font-medium">Total Value</span>
              <span className="text-primary-700 font-bold text-lg">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* ═══ Action Buttons - Accept, Bid, Share, Like, Favorite ═══ */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Accept */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleAcceptClick}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-green-500/30"
              >
                <Check size={20} />
              </button>
              <span className="text-[10px] text-gray-500 mt-1 font-medium">Accept</span>
            </div>
            
            {/* Bid */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleBidClick}
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg shadow-blue-500/30"
              >
                <Gavel size={18} />
              </button>
              <span className="text-[10px] text-gray-500 mt-1 font-medium">Bid</span>
            </div>
            
            {/* Share */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleShare}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-all"
              >
                <Send size={18} className="rotate-[-35deg] translate-x-[1px]" />
              </button>
              <span className="text-[10px] text-gray-400 mt-1">Share</span>
            </div>
            
            {/* Like */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleLike}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  liked 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <ThumbsUp size={18} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <span className="text-[10px] text-gray-400 mt-1">Like</span>
            </div>
            
            {/* Favorite */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleFavorite}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  favorited 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Star size={18} fill={favorited ? 'currentColor' : 'none'} />
              </button>
              <span className="text-[10px] text-gray-400 mt-1">Favorite</span>
            </div>
          </div>

          {/* ═══ Tags & Meta Info (Flipped for marketplace) ═══ */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full ${
                isSell ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {isSell ? 'BUY' : 'SELL'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">Unlisted</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Active</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatDate(listing.createdAt, true)}
              </span>
              {bidsCount > 0 && (
                <span className="flex items-center gap-1">
                  <MessageCircle size={10} />
                  {bidsCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ═══ ACCEPT CONFIRMATION MODAL ═══ */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-white z-20 animate-slideUp">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Confirm Purchase</h3>
                <button 
                  onClick={() => setShowConfirmation(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>

              {/* Company Info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                {(company.logo || company.Logo) ? (
                  <img
                    src={company.logo || company.Logo}
                    alt={listing.companyName}
                    className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {listing.companyName?.[0] || 'C'}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {company.scriptName || company.ScripName || listing.companyName}
                  </h4>
                  <p className="text-xs text-gray-500">Seller: @{listing.username}</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Price per Share</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(displayPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Quantity</span>
                  <span className="font-semibold text-gray-900">{formatNumber(qty)} shares</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Platform Fee (2%)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(platformFee)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-primary-600">{formatCurrency(finalAmount)}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  ({numberToWords(Math.round(finalAmount))} Rupees Only)
                </p>
              </div>

              {/* Confirmation Message */}
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 mb-4">
                <p className="text-blue-800 text-xs text-center">
                  By proceeding, you confirm that you agree to purchase{' '}
                  <span className="font-bold">{formatNumber(qty)} shares</span> of{' '}
                  <span className="font-bold">{company.scriptName || listing.companyName}</span>{' '}
                  at <span className="font-bold">{formatCurrency(displayPrice)}</span> per share.
                </p>
              </div>

              {/* Terms & Conditions Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I have read and agree to the{' '}
                  <a href="/terms" className="text-primary-600 font-medium underline">Terms & Conditions</a>,{' '}
                  <a href="/privacy" className="text-primary-600 font-medium underline">Privacy Policy</a>, and{' '}
                  <a href="/disclaimer" className="text-primary-600 font-medium underline">Risk Disclaimer</a>.
                  I understand that unlisted shares carry higher risk and the transaction is final once confirmed.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={!acceptedTerms}
                  className={`flex-1 py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    acceptedTerms 
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check size={18} />
                  Confirm & Buy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
