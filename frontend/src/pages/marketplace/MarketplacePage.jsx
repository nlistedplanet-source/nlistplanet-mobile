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
  MessageCircle
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
          <div className="relative group">
            {(listing.companyId?.logo || listing.companyId?.Logo) ? (
              <img
                src={listing.companyId.logo || listing.companyId.Logo}
                alt={listing.companyName}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 cursor-pointer">
                <span className="text-primary-700 font-bold text-lg">
                  {listing.companyName?.[0] || 'C'}
                </span>
              </div>
            )}
            {/* Tooltip for company details */}
            <div className="absolute left-14 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[180px]">
              <span className="font-bold text-gray-900 mb-1">{listing.companyId?.scriptName || listing.companyName}</span>
              <span className="text-xs text-gray-500 mb-1">Sector: {listing.companyId?.sector || 'N/A'}</span>
              {listing.companyId?.isin && <span className="text-xs text-gray-500 mb-1">ISIN: {listing.companyId.isin}</span>}
              {listing.companyId?.pan && <span className="text-xs text-gray-500 mb-1">PAN: {listing.companyId.pan}</span>}
              {listing.companyId?.cin && <span className="text-xs text-gray-500 mb-1">CIN: {listing.companyId.cin}</span>}
              {listing.companyId?.description && <span className="text-xs text-gray-500">{listing.companyId.description}</span>}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-900 leading-tight truncate">
              {listing.companyId?.scriptName || listing.companyName}
            </h3>
            <p className="text-xs text-gray-500">{listing.companyId?.sector || 'Company'}</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
          isSell ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {isSell ? 'SELL' : 'BUY'}
        </span>
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
      <div className="flex items-center justify-between gap-2 mt-2">
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-xs font-semibold flex-1"
          onClick={(e) => { e.stopPropagation(); haptic.medium(); onClick(); }}
        >
          Place Bid
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold flex-1"
          onClick={(e) => { e.stopPropagation(); haptic.medium(); onClick(); }}
        >
          Accept
        </button>
        <button
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
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
              toast.success('Share link copied!');
            }
          }}
        >
          <Share2 size={14} /> Share
        </button>
        <button
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
          onClick={(e) => { e.stopPropagation(); haptic.light(); toast.success('Liked!'); }}
        >
          <TrendingUp size={14} /> Like
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
