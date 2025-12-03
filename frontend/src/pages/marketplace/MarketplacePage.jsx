import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Calendar,
  Package,
  Share2,
  Zap,
  MessageCircle,
  Info
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

// Listing Card Component - Same as Desktop Design
const ListingCard = ({ listing, onClick, navigate }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isSell = listing.type === 'sell';
  
  // Marketplace shows prices to non-owners (isOwner = false)
  const priceInfo = getPriceDisplay(listing.price, listing.type, false);
  const displayPrice = priceInfo.displayPrice;
  const priceLabel = priceInfo.label;
  const totalAmount = displayPrice * listing.quantity;
  const bidsCount = isSell ? listing.bids?.length || 0 : listing.offers?.length || 0;
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 shadow-sm relative active:scale-98 transition-transform cursor-pointer ${
        listing.isBoosted ? 'ring-2 ring-primary-500' : ''
      }`}
    >
      {/* Boosted Badge */}
      {listing.isBoosted && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Zap size={12} fill="white" />
          BOOSTED
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {(listing.companyId?.logo || listing.companyId?.Logo) ? (
            <img
              src={listing.companyId.logo || listing.companyId.Logo}
              alt={listing.companyName}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {!(listing.companyId?.logo || listing.companyId?.Logo) ? (
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-lg">
                {listing.companyName?.[0] || 'C'}
              </span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary-100 items-center justify-center hidden">
              <span className="text-primary-700 font-bold text-lg">
                {listing.companyName?.[0] || 'C'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0 relative">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-lg text-gray-900 leading-tight truncate">
                {listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyName}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
                className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <Info size={12} className="text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500">{listing.companyId?.sector || listing.companyId?.Sector || 'Company'}</p>
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute left-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-20 min-w-[250px]">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center font-semibold border-b border-gray-700 pb-1 mb-2">
                    <span>{listing.companyName}</span>
                    <button onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} className="text-gray-400 hover:text-white">&times;</button>
                  </div>
                  {(listing.companyId?.sector || listing.companyId?.Sector) && (
                    <div><span className="text-gray-400">Sector:</span> {listing.companyId.sector || listing.companyId.Sector}</div>
                  )}
                  {(listing.companyId?.isin || listing.companyId?.ISIN) && (
                    <div><span className="text-gray-400">ISIN:</span> {listing.companyId.isin || listing.companyId.ISIN}</div>
                  )}
                  {(listing.companyId?.pan || listing.companyId?.PAN) && (
                    <div><span className="text-gray-400">PAN:</span> {listing.companyId.pan || listing.companyId.PAN}</div>
                  )}
                  {(listing.companyId?.cin || listing.companyId?.CIN) && (
                    <div><span className="text-gray-400">CIN:</span> {listing.companyId.cin || listing.companyId.CIN}</div>
                  )}
                  {listing.companySegmentation && (
                    <div className="pt-1 mt-1 border-t border-gray-700">
                      <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                        {listing.companySegmentation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isSell ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {isSell ? 'SELL' : 'BUY'}
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {listing.description}
        </p>
      )}

      {/* Price & Quantity */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">{priceLabel}</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(displayPrice)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Quantity</p>
          <p className="text-lg font-bold text-gray-900">{formatNumber(listing.quantity)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Min: {formatNumber(listing.minLot)}
          </p>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-primary-50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Amount:</span>
          <span className="text-xl font-bold text-primary-700">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
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

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            haptic.medium();
            navigate(`/listing/${listing._id}`);
          }}
          className="flex-1 bg-primary-600 active:bg-primary-700 text-white text-sm py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <TrendingUp size={18} />
          {isSell ? 'Place Bid' : 'Make Offer'}
        </button>
        
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            haptic.medium();
            navigate(`/listing/${listing._id}`);
          }}
          className="flex-1 bg-green-600 active:bg-green-700 text-white text-sm py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          Accept
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
          className="bg-gray-100 active:bg-gray-200 text-gray-700 text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 px-4"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default MarketplacePage;
