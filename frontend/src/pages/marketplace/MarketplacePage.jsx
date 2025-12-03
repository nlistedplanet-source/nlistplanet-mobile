import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Package,
  MessageCircle
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

      {/* Listings Grid - 2 columns */}
      <div className="px-4 pt-4">
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
          <div className="grid grid-cols-2 gap-3 pb-4">
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

// Listing Card Component - Desktop-like Compact Design
const ListingCard = ({ listing, onClick, navigate }) => {
  const isSell = listing.type === 'sell';
  
  // Marketplace shows prices to non-owners (isOwner = false)
  const priceInfo = getPriceDisplay(listing.price, listing.type, false);
  const displayPrice = priceInfo.displayPrice;
  const priceLabel = priceInfo.label;
  const bidsCount = isSell ? listing.bids?.length || 0 : listing.offers?.length || 0;
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-98 transition-transform cursor-pointer ${
        listing.isBoosted ? 'ring-2 ring-yellow-400' : ''
      }`}
    >
      {/* Top Badges Row */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 border-b border-gray-100">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          isSell ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          {isSell ? 'Sell' : 'Buy'}
        </span>
        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-semibold">
          Unlisted
        </span>
        <span className="ml-auto text-[10px] text-gray-400">
          {formatDate(listing.createdAt, true)}
        </span>
      </div>

      {/* Company Info */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          {(listing.companyId?.logo || listing.companyId?.Logo) ? (
            <img
              src={listing.companyId.logo || listing.companyId.Logo}
              alt={listing.companyName}
              className="w-8 h-8 rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-sm">
                {listing.companyName?.[0] || 'C'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-gray-900 leading-tight truncate">
              {listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyName}
            </h3>
            <p className="text-[10px] text-gray-500 truncate">
              {listing.companyId?.sector || listing.companyId?.Sector || 'Company'}
            </p>
          </div>
        </div>

        {/* Seller/Buyer Info */}
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
          <Package size={10} />
          <span>{isSell ? 'Seller' : 'Buyer'}:</span>
          <span className="font-medium text-gray-700">@{listing.username}</span>
        </div>

        {/* Price & Quantity */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500">{priceLabel}</span>
            <span className="text-base font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500">Quantity</span>
            <span className="text-sm font-semibold text-gray-700">{formatNumber(listing.quantity)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              haptic.medium();
              navigate(`/listing/${listing._id}`);
            }}
            className="flex-1 bg-primary-600 active:bg-primary-700 text-white text-xs py-2 rounded-lg font-semibold"
          >
            {isSell ? 'Place Your Bid' : 'Make Offer'}
          </button>
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              haptic.light(); 
              if (navigator.share) {
                navigator.share({ 
                  title: listing.companyName, 
                  url: window.location.origin + `/listing/${listing._id}`
                }).catch(() => {});
              } else {
                toast.success('Link copied!');
              }
            }}
            className="bg-gray-100 active:bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded-lg font-medium flex items-center justify-center"
          >
            Share
          </button>
        </div>

        {/* Bids Count & Wishlist */}
        {bidsCount > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-gray-500">
            <MessageCircle size={10} />
            <span>{bidsCount} {isSell ? 'bids' : 'offers'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
