import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  ChevronRight,
  Calendar,
  Package,
  Share2,
  Zap,
  MessageCircle,
  Heart,
  Info
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic, debounce, formatDate, formatNumber, calculateTotalWithFee } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, sell, buy

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.type === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.companyName?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query)
      );
    }

    setFilteredListings(filtered);
  }, [listings, searchQuery, activeFilter]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  const handleListingClick = (listing) => {
    haptic.light();
    navigate(`/listing/${listing._id}`);
  };

  const FilterButton = ({ value, label, icon: Icon }) => (
    <button
      onClick={() => {
        haptic.light();
        setActiveFilter(value);
      }}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        activeFilter === value
          ? 'bg-primary-600 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} />}
        {label}
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen-nav flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen-nav bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-6 pt-safe pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
            >
              <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-6 px-6">
            <FilterButton value="all" label="All Posts" />
            <FilterButton value="sell" label="Selling" icon={TrendingDown} />
            <FilterButton value="buy" label="Buying" icon={TrendingUp} />
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="px-6 pt-4">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Listings Found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'No active listings available'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {filteredListings.map((listing) => (
              <ListingCard 
                key={listing._id} 
                listing={listing} 
                onClick={() => handleListingClick(listing)}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Listing Card Component
const ListingCard = ({ listing, onClick, navigate }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isSell = listing.type === 'sell';
  const totalPrice = calculateTotalWithFee(listing.price);
  const bidsCount = isSell ? listing.bids?.length || 0 : listing.offers?.length || 0;
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 shadow-mobile active:scale-98 transition-transform cursor-pointer ${
        listing.isBoosted ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      {/* Boosted Badge */}
      {listing.isBoosted && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Zap size={12} fill="white" />
          BOOSTED
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            {(listing.companyId?.logo || listing.companyId?.Logo) ? (
              <img
                src={listing.companyId.logo || listing.companyId.Logo}
                alt={listing.companyName}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-bold text-lg">
                  {listing.companyName?.[0] || 'C'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-gray-900 leading-tight truncate">
                {listing.companyId?.scriptName || listing.companyName}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <Info size={12} className="text-gray-600" />
              </button>
            </div>
            <p className="text-xs text-gray-500">{listing.companyId?.sector || 'Company'}</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
          isSell ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {isSell ? 'SELL' : 'BUY'}
        </span>
      </div>

      {/* Mobile Tooltip */}
      {showTooltip && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-sm text-gray-900">{listing.companyId?.scriptName || listing.companyName}</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-semibold">Sector:</span> {listing.companyId?.sector || 'N/A'}</p>
            {listing.companyId?.isin && <p><span className="font-semibold">ISIN:</span> {listing.companyId.isin}</p>}
            {listing.companyId?.pan && <p><span className="font-semibold">PAN:</span> {listing.companyId.pan}</p>}
            {listing.companyId?.cin && <p><span className="font-semibold">CIN:</span> {listing.companyId.cin}</p>}
            {listing.companyId?.description && <p className="mt-2 text-gray-700">{listing.companyId.description}</p>}
          </div>
        </div>
      )}

      {/* Description */}
      {listing.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {listing.description}
        </p>
      )}

      {/* Price & Quantity */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">
            {isSell ? 'Buyer Pays' : 'Seller Gets'}
          </p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totalPrice)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Quantity</p>
          <p className="text-lg font-bold text-gray-900">{formatNumber(listing.quantity)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Min: {formatNumber(listing.minLot)}
          </p>
        </div>
      </div>

      {/* ...removed Total Amount section... */}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-2">
        <button
          className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex-1 transition-colors"
          onClick={(e) => { 
            e.stopPropagation(); 
            haptic.medium();
            navigate(`/listing/${listing._id}`);
          }}
        >
          Place Bid
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex-1 transition-colors"
          onClick={(e) => { 
            e.stopPropagation(); 
            haptic.medium();
            navigate(`/listing/${listing._id}`);
          }}
        >
          Accept
        </button>
        <button
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-lg flex items-center justify-center transition-colors"
          onClick={(e) => { 
            e.stopPropagation(); 
            haptic.light(); 
            if (navigator.share) {
              navigator.share({ 
                title: listing.companyName, 
                text: `Check out ${listing.companyName} on NlistPlanet`,
                url: window.location.origin + `/listing/${listing._id}`
              }).catch(() => {});
            } else {
              toast.success('Link copied!');
            }
          }}
        >
          <Share2 size={18} />
        </button>
        <button
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 active:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg flex items-center justify-center transition-colors"
          onClick={(e) => { 
            e.stopPropagation(); 
            haptic.light(); 
            toast.success('Added to favorites!'); 
          }}
        >
          <Heart size={18} />
        </button>
      </div>
      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          {formatDate(listing.createdAt)}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle size={14} />
          {bidsCount} {isSell ? 'Bids' : 'Offers'}
        </div>
        <div className="flex items-center gap-1">
          <Package size={14} />
          @{listing.username}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
