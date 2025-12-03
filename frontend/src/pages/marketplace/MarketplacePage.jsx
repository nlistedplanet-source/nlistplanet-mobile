import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  MessageCircle,
  Play,
  Plus,
  ThumbsUp,
  ThumbsDown,
  X,
  Clock,
  Heart,
  Info,
  Check,
  Send,
  ChevronDown
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, haptic, debounce, formatDate, formatNumber, getPriceDisplay } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const expandedRef = useRef(null);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, activeFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getAll({ status: 'open' });
      setListings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
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

  // Close expanded card when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (expandedRef.current && !expandedRef.current.contains(e.target)) {
        setExpandedId(null);
      }
    };
    if (expandedId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [expandedId]);

  const handleCardClick = (listing) => {
    haptic.light();
    setExpandedId(expandedId === listing._id ? null : listing._id);
  };

  const debouncedSearch = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  // Group listings into rows of 2
  const getListingRows = () => {
    const rows = [];
    for (let i = 0; i < filteredListings.length; i += 2) {
      rows.push(filteredListings.slice(i, i + 2));
    }
    return rows;
  };

  const listingRows = getListingRows();

  if (loading) {
    return (
      <div className="min-h-screen-nav flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-6 h-6 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen-nav bg-gray-100 pb-20">
      {/* Header - Compact Light Theme */}
      <div className="bg-white sticky top-0 z-20 shadow-sm">
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

      {/* Listings Grid */}
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
          <div className="pb-4">
            {listingRows.map((row, rowIndex) => {
              const expandedInRow = row.find(l => l._id === expandedId);
              
              return (
                <div key={rowIndex} className="mb-3">
                  {/* Row of 2 cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {row.map((listing) => (
                      <CompactCard 
                        key={listing._id} 
                        listing={listing} 
                        isExpanded={expandedId === listing._id}
                        onClick={() => handleCardClick(listing)}
                      />
                    ))}
                  </div>
                  
                  {/* Expanded Panel - Netflix Style */}
                  {expandedInRow && (
                    <div ref={expandedRef} className="mt-2.5">
                      <ExpandedPanel 
                        listing={expandedInRow} 
                        onClose={() => setExpandedId(null)}
                        navigate={navigate}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPACT CARD - Light Theme (Logo + Company + Price & Qty)
// ═══════════════════════════════════════════════════════════════
const CompactCard = ({ listing, isExpanded, onClick }) => {
  const isSell = listing.type === 'sell';
  const priceInfo = getPriceDisplay(listing.price, listing.type, false);
  const displayPrice = priceInfo.displayPrice;
  
  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm ${
        isExpanded 
          ? 'ring-2 ring-primary-500 scale-[1.02] z-10' 
          : 'hover:shadow-md active:scale-[0.98]'
      }`}
    >
      {/* Type Badge - Smaller */}
      <div className={`absolute top-1.5 left-1.5 px-1 py-0.5 rounded text-[7px] font-bold z-10 ${
        isSell ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
      }`}>
        {isSell ? 'SELL' : 'BUY'}
      </div>

      {/* Company Logo - Bigger */}
      <div className="pt-6 pb-1.5 px-3 flex justify-center">
        {(listing.companyId?.logo || listing.companyId?.Logo) ? (
          <img
            src={listing.companyId.logo || listing.companyId.Logo}
            alt={listing.companyName}
            className="w-16 h-16 rounded-xl object-contain bg-gray-50 border border-gray-100"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {listing.companyName?.[0] || 'C'}
            </span>
          </div>
        )}
      </div>

      {/* Company Name */}
      <div className="px-2 pb-1 text-center">
        <h3 className="font-semibold text-[11px] text-gray-900 leading-tight truncate">
          {listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyName}
        </h3>
      </div>

      {/* Price & Qty - Same Row */}
      <div className="px-2 pb-2.5 flex items-center justify-center gap-2">
        <p className="text-sm font-bold text-gray-900">
          {formatCurrency(displayPrice)}
        </p>
        <span className="text-gray-300">•</span>
        <p className="text-[10px] text-gray-500 font-medium">
          {formatNumber(listing.quantity)} qty
        </p>
      </div>

      {/* Expand Indicator */}
      {isExpanded && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-t-full"></div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// EXPANDED PANEL - Netflix Style with Tooltip
// ═══════════════════════════════════════════════════════════════
const ExpandedPanel = ({ listing, onClose, navigate }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showRateOptions, setShowRateOptions] = useState(false);
  const [rating, setRating] = useState(null); // 'like', 'dislike', 'love'
  const [favorited, setFavorited] = useState(false);
  
  const isSell = listing.type === 'sell';
  const priceInfo = getPriceDisplay(listing.price, listing.type, false);
  const displayPrice = priceInfo.displayPrice;
  const priceLabel = priceInfo.label;
  const bidsCount = isSell ? listing.bids?.length || 0 : listing.offers?.length || 0;
  const company = listing.companyId || {};

  const handleRate = (type, e) => {
    e?.stopPropagation();
    haptic.light();
    if (rating === type) {
      setRating(null);
      toast.success('Rating removed');
    } else {
      setRating(type);
      const messages = {
        like: 'Liked!',
        dislike: 'Not for me',
        love: 'Love it! ❤️'
      };
      toast.success(messages[type]);
    }
    setShowRateOptions(false);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    haptic.light();
    setFavorited(!favorited);
    toast.success(favorited ? 'Removed from list' : 'Added to My List!');
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

  const handleAccept = (e) => {
    e.stopPropagation();
    haptic.medium();
    navigate(`/listing/${listing._id}?action=accept`);
  };

  // Get rate icon based on current rating
  const getRateIcon = () => {
    if (rating === 'like') return <ThumbsUp size={16} />;
    if (rating === 'dislike') return <ThumbsDown size={16} />;
    if (rating === 'love') return <Heart size={16} fill="currentColor" />;
    return <ThumbsUp size={16} />;
  };

  return (
    <div 
      className="relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg animate-slideDown"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10"
      >
        <X size={12} className="text-gray-600" />
      </button>

      <div className="p-3">
        {/* ═══ Company Header with Tooltip ═══ */}
        <div className="flex items-start gap-2.5 mb-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            {(company.logo || company.Logo) ? (
              <img
                src={company.logo || company.Logo}
                alt={listing.companyName}
                className="w-11 h-11 rounded-lg object-contain bg-gray-50 border border-gray-100"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-base">
                  {listing.companyName?.[0] || 'C'}
                </span>
              </div>
            )}
          </div>
          
          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-bold text-gray-900 text-sm truncate">
                {company.scriptName || company.ScripName || listing.companyName}
              </h3>
              {/* Tooltip Trigger */}
              <button 
                onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  showTooltip ? 'bg-primary-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <Info size={8} className={showTooltip ? 'text-white' : 'text-gray-500'} />
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-gray-400">Sector:</span>
              <span className="text-gray-700 font-medium">{company.sector || company.Sector || 'Unlisted'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
              <span className="text-gray-400">Seller:</span>
              <span className="text-gray-700 font-medium">@{listing.username}</span>
            </div>
          </div>
        </div>

        {/* ═══ Company Details Tooltip ═══ */}
        {showTooltip && (
          <div className="mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-[10px] space-y-1 animate-fadeIn">
            <p className="text-gray-600">
              <span className="text-gray-400 w-14 inline-block">Company:</span> 
              <span className="font-medium text-gray-800">{company.companyName || company.name || listing.companyName}</span>
            </p>
            {(company.pan || company.PAN) && (
              <p className="text-gray-600">
                <span className="text-gray-400 w-14 inline-block">PAN:</span> 
                <span className="font-mono text-gray-800">{company.pan || company.PAN}</span>
              </p>
            )}
            {(company.isin || company.ISIN) && (
              <p className="text-gray-600">
                <span className="text-gray-400 w-14 inline-block">ISIN:</span> 
                <span className="font-mono text-gray-800">{company.isin || company.ISIN}</span>
              </p>
            )}
            {(company.cin || company.CIN) && (
              <p className="text-gray-600">
                <span className="text-gray-400 w-14 inline-block">CIN:</span> 
                <span className="font-mono text-gray-800 text-[9px]">{company.cin || company.CIN}</span>
              </p>
            )}
          </div>
        )}

        {/* ═══ Price & Quantity Row ═══ */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
            <p className="text-gray-400 text-[9px] mb-0.5">💰 {priceLabel}</p>
            <p className="text-gray-900 font-bold text-base">{formatCurrency(displayPrice)}</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
            <p className="text-gray-400 text-[9px] mb-0.5">📦 Quantity</p>
            <p className="text-gray-900 font-bold text-base">{formatNumber(listing.quantity)}</p>
          </div>
        </div>

        {/* ═══ Action Buttons - Light Theme ═══ */}
        <div className="flex items-center gap-1.5 mb-2.5">
          {/* Play/View Button */}
          <div className="group relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic.medium();
                navigate(`/listing/${listing._id}`);
              }}
              className="w-9 h-9 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all"
            >
              <Play size={16} fill="currentColor" />
            </button>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isSell ? 'Place Bid' : 'Make Offer'}
            </div>
          </div>
          
          {/* Add to List Button */}
          <div className="group relative">
            <button
              onClick={handleFavorite}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${
                favorited 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-transparent text-gray-600 border-gray-300 hover:border-gray-900'
              }`}
            >
              {favorited ? <Check size={16} /> : <Plus size={16} />}
            </button>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {favorited ? 'In List' : 'Add'}
            </div>
          </div>
          
          {/* Rate Button with Hover Popup */}
          <div 
            className="group relative"
            onMouseEnter={() => setShowRateOptions(true)}
            onMouseLeave={() => setShowRateOptions(false)}
            onTouchStart={() => setShowRateOptions(true)}
          >
            <button
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${
                rating 
                  ? rating === 'love' 
                    ? 'bg-red-500 text-white border-red-500' 
                    : rating === 'like'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-400 text-white border-gray-400'
                  : 'bg-transparent text-gray-600 border-gray-300 hover:border-gray-900'
              }`}
            >
              {getRateIcon()}
            </button>
            
            {/* Rate Options Popup */}
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-full p-1 border border-gray-200 shadow-lg transition-all duration-200 ${
              showRateOptions ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
            }`}>
              {/* Dislike */}
              <button
                onClick={(e) => handleRate('dislike', e)}
                className={`relative group/btn w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  rating === 'dislike' 
                    ? 'bg-gray-400 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110'
                }`}
              >
                <ThumbsDown size={14} />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] font-medium rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                  Not for me
                </span>
              </button>
              
              {/* Like */}
              <button
                onClick={(e) => handleRate('like', e)}
                className={`relative group/btn w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  rating === 'like' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110'
                }`}
              >
                <ThumbsUp size={14} />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] font-medium rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                  I like this
                </span>
              </button>
              
              {/* Love it */}
              <button
                onClick={(e) => handleRate('love', e)}
                className={`relative group/btn w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  rating === 'love' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110'
                }`}
              >
                <Heart size={14} fill={rating === 'love' ? 'currentColor' : 'none'} />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] font-medium rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                  Love this!
                </span>
              </button>
            </div>
          </div>
          
          {/* Accept Button */}
          <div className="group relative">
            <button
              onClick={handleAccept}
              className="w-9 h-9 bg-transparent text-gray-600 border-2 border-gray-300 hover:border-green-500 hover:text-green-500 rounded-full flex items-center justify-center transition-all hover:bg-green-50"
            >
              <Check size={16} />
            </button>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Accept
            </div>
          </div>
          
          {/* Share Button */}
          <div className="group relative">
            <button
              onClick={handleShare}
              className="w-9 h-9 bg-transparent text-gray-600 border-2 border-gray-300 hover:border-gray-900 rounded-full flex items-center justify-center transition-all"
            >
              <Send size={14} className="rotate-[-35deg] translate-x-[1px]" />
            </button>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Share
            </div>
          </div>
          
          {/* More Info Button */}
          <div className="group relative ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic.light();
                navigate(`/listing/${listing._id}`);
              }}
              className="w-9 h-9 bg-transparent text-gray-600 border-2 border-gray-300 hover:border-gray-900 rounded-full flex items-center justify-center transition-all"
            >
              <ChevronDown size={16} />
            </button>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[8px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              More
            </div>
          </div>
        </div>

        {/* ═══ Tags & Meta Info ═══ */}
        <div className="flex items-center justify-between text-[9px] text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className={`px-1.5 py-0.5 rounded ${
              isSell ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {isSell ? 'SELL' : 'BUY'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">Unlisted</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600">Active</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={9} />
              {formatDate(listing.createdAt, true)}
            </span>
            {bidsCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle size={9} />
                {bidsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
