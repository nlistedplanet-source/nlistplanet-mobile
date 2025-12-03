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
      <div className="min-h-screen-nav flex items-center justify-center bg-black">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen-nav bg-black pb-20">
      {/* Header - Netflix Style Dark */}
      <div className="bg-black/95 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-800">
        <div className="px-4 pt-safe pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">Marketplace</h1>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search companies..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Filter Tabs - Netflix Red Theme */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4">
            {[
              { value: 'all', label: 'All' },
              { value: 'sell', label: 'Selling', icon: TrendingDown },
              { value: 'buy', label: 'Buying', icon: TrendingUp }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => { haptic.light(); setActiveFilter(value); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {Icon && <Icon size={14} />}
                  {label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="px-3 pt-4">
        {filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Listings Found</h3>
            <p className="text-gray-500 text-sm">
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
// COMPACT CARD - Netflix Style (Logo + Company + Price)
// ═══════════════════════════════════════════════════════════════
const CompactCard = ({ listing, isExpanded, onClick }) => {
  const isSell = listing.type === 'sell';
  const priceInfo = getPriceDisplay(listing.price, listing.type, false);
  const displayPrice = priceInfo.displayPrice;
  
  return (
    <div
      onClick={onClick}
      className={`relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        isExpanded 
          ? 'ring-2 ring-red-500 scale-[1.02] z-10' 
          : 'hover:scale-[1.02] active:scale-[0.98]'
      }`}
    >
      {/* Type Badge */}
      <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold z-10 ${
        isSell ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
      }`}>
        {isSell ? 'SELL' : 'BUY'}
      </div>

      {/* Company Logo - Prominent */}
      <div className="pt-7 pb-2 px-3 flex justify-center">
        {(listing.companyId?.logo || listing.companyId?.Logo) ? (
          <img
            src={listing.companyId.logo || listing.companyId.Logo}
            alt={listing.companyName}
            className="w-14 h-14 rounded-lg object-contain bg-gray-800"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {listing.companyName?.[0] || 'C'}
            </span>
          </div>
        )}
      </div>

      {/* Company Name */}
      <div className="px-2 pb-1 text-center">
        <h3 className="font-semibold text-xs text-white leading-tight truncate">
          {listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyName}
        </h3>
      </div>

      {/* Price - Bold */}
      <div className="px-2 pb-3 text-center">
        <p className="text-base font-bold text-white">
          {formatCurrency(displayPrice)}
        </p>
        <p className="text-[10px] text-gray-500">
          {formatNumber(listing.quantity)} qty
        </p>
      </div>

      {/* Expand Indicator */}
      {isExpanded && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-500 rounded-t-full"></div>
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
    if (rating === 'like') return <ThumbsUp size={18} />;
    if (rating === 'dislike') return <ThumbsDown size={18} />;
    if (rating === 'love') return <Heart size={18} fill="currentColor" />;
    return <ThumbsUp size={18} />;
  };

  return (
    <div 
      className="relative bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden border border-gray-800 animate-slideDown"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center z-10"
      >
        <X size={14} className="text-white" />
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
                className="w-12 h-12 rounded-lg object-contain bg-gray-800"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {listing.companyName?.[0] || 'C'}
                </span>
              </div>
            )}
          </div>
          
          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-base truncate">
                {company.scriptName || company.ScripName || listing.companyName}
              </h3>
              {/* Tooltip Trigger */}
              <button 
                onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  showTooltip ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Info size={10} className="text-white" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Sector:</span>
              <span className="text-white font-medium">{company.sector || company.Sector || 'Unlisted'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-0.5">
              <span className="text-gray-400">Seller:</span>
              <span className="text-white font-medium">@{listing.username}</span>
            </div>
          </div>
        </div>

        {/* ═══ Company Details Tooltip ═══ */}
        {showTooltip && (
          <div className="mb-4 p-3 bg-gray-800/80 backdrop-blur rounded-lg border border-gray-700 text-xs space-y-1.5 animate-fadeIn">
            <p className="text-gray-300">
              <span className="text-gray-500 w-16 inline-block">Company:</span> 
              <span className="font-medium">{company.companyName || company.name || listing.companyName}</span>
            </p>
            {(company.pan || company.PAN) && (
              <p className="text-gray-300">
                <span className="text-gray-500 w-16 inline-block">PAN:</span> 
                <span className="font-mono">{company.pan || company.PAN}</span>
              </p>
            )}
            {(company.isin || company.ISIN) && (
              <p className="text-gray-300">
                <span className="text-gray-500 w-16 inline-block">ISIN:</span> 
                <span className="font-mono">{company.isin || company.ISIN}</span>
              </p>
            )}
            {(company.cin || company.CIN) && (
              <p className="text-gray-300">
                <span className="text-gray-500 w-16 inline-block">CIN:</span> 
                <span className="font-mono text-[10px]">{company.cin || company.CIN}</span>
              </p>
            )}
          </div>
        )}

        {/* ═══ Price & Quantity Row ═══ */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gray-800/50 rounded-lg p-2.5 text-center">
            <p className="text-gray-500 text-[10px] mb-0.5">💰 {priceLabel}</p>
            <p className="text-white font-bold text-lg">{formatCurrency(displayPrice)}</p>
          </div>
          <div className="flex-1 bg-gray-800/50 rounded-lg p-2.5 text-center">
            <p className="text-gray-500 text-[10px] mb-0.5">📦 Quantity</p>
            <p className="text-white font-bold text-lg">{formatNumber(listing.quantity)}</p>
          </div>
        </div>

        {/* ═══ Action Buttons - Netflix Style ═══ */}
        <div className="flex items-center gap-2 mb-3">
          {/* Play/View Button */}
          <div className="group relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic.medium();
                navigate(`/listing/${listing._id}`);
              }}
              className="w-11 h-11 bg-white hover:bg-gray-100 active:bg-gray-200 text-black rounded-full flex items-center justify-center transition-all"
            >
              <Play size={20} fill="currentColor" />
            </button>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[10px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isSell ? 'Place Bid' : 'Make Offer'}
            </div>
          </div>
          
          {/* Add to List Button */}
          <div className="group relative">
            <button
              onClick={handleFavorite}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border-2 ${
                favorited 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-white border-gray-400 hover:border-white'
              }`}
            >
              {favorited ? <Check size={20} /> : <Plus size={20} />}
            </button>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[10px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {favorited ? 'In My List' : 'Add to List'}
            </div>
          </div>
          
          {/* Rate Button with Hover Popup - Netflix Style */}
          <div 
            className="group relative"
            onMouseEnter={() => setShowRateOptions(true)}
            onMouseLeave={() => setShowRateOptions(false)}
            onTouchStart={() => setShowRateOptions(true)}
          >
            <button
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border-2 ${
                rating 
                  ? rating === 'love' 
                    ? 'bg-red-600 text-white border-red-600' 
                    : rating === 'like'
                      ? 'bg-white text-black border-white'
                      : 'bg-gray-600 text-white border-gray-600'
                  : 'bg-transparent text-white border-gray-400 hover:border-white'
              }`}
            >
              {getRateIcon()}
            </button>
            
            {/* Rate Options Popup */}
            <div className={`absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900 rounded-full p-1.5 border border-gray-700 shadow-xl transition-all duration-200 ${
              showRateOptions ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
            }`}>
              {/* Dislike */}
              <button
                onClick={(e) => handleRate('dislike', e)}
                className={`relative group/btn w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  rating === 'dislike' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-110'
                }`}
              >
                <ThumbsDown size={18} />
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white text-black text-[9px] font-semibold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                  Not for me
                </span>
              </button>
              
              {/* Like */}
              <button
                onClick={(e) => handleRate('like', e)}
                className={`relative group/btn w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  rating === 'like' 
                    ? 'bg-white text-black' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-110'
                }`}
              >
                <ThumbsUp size={18} />
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white text-black text-[9px] font-semibold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                  I like this
                </span>
              </button>
              
              {/* Love it */}
              <button
                onClick={(e) => handleRate('love', e)}
                className={`relative group/btn w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  rating === 'love' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-110'
                }`}
              >
                <Heart size={18} fill={rating === 'love' ? 'currentColor' : 'none'} />
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white text-black text-[9px] font-semibold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">
                  Love this!
                </span>
              </button>
            </div>
            
            {/* Label when not hovering */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[10px] font-semibold rounded opacity-0 group-hover:opacity-0 pointer-events-none">
              Rate
            </div>
          </div>
          
          {/* Accept Button */}
          <div className="group relative">
            <button
              onClick={handleAccept}
              className="w-11 h-11 bg-transparent text-white border-2 border-gray-400 hover:border-white rounded-full flex items-center justify-center transition-all hover:bg-green-600 hover:border-green-600"
            >
              <Check size={20} />
            </button>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[10px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Accept
            </div>
          </div>
          
          {/* Share Button - Paper Plane Style */}
          <div className="group relative">
            <button
              onClick={handleShare}
              className="w-11 h-11 bg-transparent text-white border-2 border-gray-400 hover:border-white rounded-full flex items-center justify-center transition-all"
            >
              <Send size={18} className="rotate-[-35deg] translate-x-[1px]" />
            </button>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[10px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Share
            </div>
          </div>
          
          {/* More Info / Expand Button */}
          <div className="group relative ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                haptic.light();
                navigate(`/listing/${listing._id}`);
              }}
              className="w-11 h-11 bg-transparent text-white border-2 border-gray-400 hover:border-white rounded-full flex items-center justify-center transition-all"
            >
              <ChevronDown size={20} />
            </button>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[10px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              More Info
            </div>
          </div>
        </div>

        {/* ═══ Tags & Meta Info ═══ */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded ${
              isSell ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'
            }`}>
              {isSell ? 'SELL' : 'BUY'}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-400">Unlisted</span>
            <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400">Active</span>
          </div>
          <div className="flex items-center gap-3">
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
    </div>
  );
};

export default MarketplacePage;
