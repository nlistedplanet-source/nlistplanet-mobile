import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  X,
  Package,
  Share2,
  Zap,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader,
  MessageSquare,
  Info
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic, formatNumber } from '../../utils/helpers';
import toast from 'react-hot-toast';
import LoadingScreen from '../../components/common/LoadingScreen';

const MyPostsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [subTab, setSubTab] = useState('sell'); // sell or buy
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMyListings({ type: subTab });
      setListings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  }, [subTab]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchMyListings();
    setRefreshing(false);
    haptic.success();
  };

  const handleDeleteListing = async () => {
    if (!selectedListing) return;

    try {
      haptic.medium();
      await listingsAPI.delete(selectedListing._id);
      haptic.success();
      toast.success('Post deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedListing(null);
      fetchMyListings();
    } catch (error) {
      haptic.error();
      console.error('Failed to delete listing:', error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleShare = async (listing) => {
    haptic.light();
    const shareUrl = `${window.location.origin}/listing/${listing._id}`;
    const shareText = `Check out ${listing.companyName} on NList Planet - ${formatCurrency(listing.price)} per share`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing.companyName} - NList Planet`,
          text: shareText,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleBoost = async (listing) => {
    haptic.medium();
    try {
      await listingsAPI.boost(listing._id);
      toast.success('Listing boosted for 24 hours! 🚀');
      fetchMyListings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to boost listing');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading My Posts..." />;
  }

  return (
    <>
      <div className="min-h-screen bg-amber-50/50 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 sticky top-0 z-10 shadow-sm border-b border-amber-100">
          <div className="px-4 pt-safe pb-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center touch-feedback shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* SELL / BUY Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  haptic.light();
                  setSubTab('sell');
                }}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                  subTab === 'sell'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-600 border border-amber-100'
                }`}
              >
                <TrendingUp size={16} />
                SELL Posts
              </button>
              <button
                onClick={() => {
                  haptic.light();
                  setSubTab('buy');
                }}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                  subTab === 'buy'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-600 border border-amber-100'
                }`}
              >
                <Package size={16} />
                BUY Requests
              </button>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="px-4 pt-3">
          {listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Listings Yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Create your first {subTab === 'sell' ? 'sell post' : 'buy request'}
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="btn-primary inline-flex text-sm px-4 py-2"
              >
                Go to Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {listings.map((listing) => (
                <MyPostCard 
                  key={listing._id} 
                  listing={listing}
                  onView={() => navigate(`/listing/${listing._id}`)}
                  onShare={() => handleShare(listing)}
                  onBoost={() => handleBoost(listing)}
                  onDelete={() => {
                    setSelectedListing(listing);
                    setShowDeleteConfirm(true);
                  }}
                  onRefresh={fetchMyListings}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedListing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete Listing</h3>
                  <p className="text-red-100 text-xs">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-700 text-sm mb-2">
                Are you sure you want to delete this listing?
              </p>
              <p className="text-gray-600 text-sm mb-3">
                <strong>{selectedListing.companyName}</strong> • {formatCurrency(selectedListing.price)}
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4">
                <p className="text-amber-800 text-xs flex items-start gap-2">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  <span>All active bids will be cancelled.</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    haptic.light();
                    setShowDeleteConfirm(false);
                    setSelectedListing(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteListing}
                  className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-semibold flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// My Post Card Component - Desktop Style
const MyPostCard = ({ listing, onView, onShare, onBoost, onDelete, onRefresh }) => {
  const [bidsExpanded, setBidsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  
  const isSell = listing.type === 'sell';
  const bidsArray = (isSell ? listing.bids : listing.offers) || [];
  const activeBidsCount = bidsArray.filter(b => b.status === 'pending' || b.status === 'countered').length;
  const sellerPrice = isSell ? (listing.sellerDesiredPrice || listing.price) : (listing.buyerMaxPrice || listing.price);
  const totalAmount = sellerPrice * listing.quantity;

  const handleAccept = async (bid) => {
    try {
      setActionLoading(bid._id);
      haptic.medium();
      await listingsAPI.acceptBid(listing._id, bid._id);
      haptic.success();
      toast.success('Bid accepted! 🎉');
      onRefresh();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to accept bid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bid) => {
    try {
      setActionLoading(bid._id);
      haptic.medium();
      await listingsAPI.rejectBid(listing._id, bid._id);
      toast.success('Bid rejected');
      onRefresh();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to reject bid');
    } finally {
      setActionLoading(null);
    }
  };

  // Format short quantity
  const formatShortQty = (num) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(1).replace(/\.0$/, '') + ' L';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
    return num?.toLocaleString('en-IN') || '0';
  };

  // Format short amount
  const formatShortAmt = (num) => {
    if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
    if (num >= 100000) return '₹' + (num / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
    if (num >= 1000) return '₹' + (num / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
    return formatCurrency(num);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Status Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            listing.status === 'active' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}>
            🟢 {listing.status?.toUpperCase() || 'ACTIVE'}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            isSell 
              ? 'bg-red-50 text-red-700 border-red-300' 
              : 'bg-green-50 text-green-700 border-green-300'
          }`}>
            {isSell ? 'SELL' : 'BUY'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span className="flex items-center gap-1">
            <span className="text-gray-500">{isSell ? 'Bids' : 'Offers'}</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full">{activeBidsCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-500" />
            <span className="font-bold text-gray-900">{listing.views || 0}</span>
          </span>
        </div>
      </div>

      {/* Company Info */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSell ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <span className={`text-lg font-bold ${isSell ? 'text-red-600' : 'text-green-600'}`}>
              {listing.companyName?.charAt(0) || 'C'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {listing.companyId?.ScriptName || listing.companyName || 'Unknown'}
            </h3>
            <p className="text-[10px] text-gray-500">
              {listing.companyId?.Sector || 'Unlisted Share'}
            </p>
          </div>
        </div>
      </div>

      {/* Price Table */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Price</p>
            <p className="text-xs font-bold text-gray-900">{formatCurrency(sellerPrice)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Qty</p>
            <p className="text-xs font-bold text-gray-900">{formatShortQty(listing.quantity)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Min Lot</p>
            <p className="text-xs font-bold text-gray-900">{formatShortQty(listing.minQuantity || 1)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Total</p>
            <p className="text-xs font-bold text-green-600">{formatShortAmt(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={onShare}
            className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1"
          >
            <Share2 size={12} /> Share
          </button>
          <button 
            onClick={onBoost}
            className="px-2.5 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1"
          >
            <Zap size={12} /> Boost
          </button>
          {activeBidsCount === 0 && listing.status === 'active' && (
            <button 
              onClick={onDelete}
              className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
          <button 
            onClick={onView}
            className="px-2.5 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1"
          >
            <Eye size={12} /> View
          </button>
        </div>
      </div>

      {/* Bids Section - Collapsible */}
      {bidsArray.length > 0 && (
        <div className="px-3 py-2">
          <button 
            onClick={() => {
              haptic.light();
              setBidsExpanded(!bidsExpanded);
            }}
            className="w-full bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-gray-200 flex items-center justify-between"
          >
            <span className="text-xs font-bold text-gray-900">
              {isSell ? 'Bids' : 'Offers'} ({activeBidsCount})
            </span>
            {bidsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {bidsExpanded && (
            <div className="mt-2 space-y-2">
              {bidsArray.filter(b => b.status === 'pending' || b.status === 'countered').map((bid, index) => {
                const bidPrice = bid.originalPrice || bid.price;
                const displayPrice = bidPrice * 0.98;
                const bidTotal = displayPrice * bid.quantity;
                
                return (
                  <div key={bid._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700">
                          @{bid.user?.username || bid.username || `trader_${index + 1}`}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          bid.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          bid.status === 'countered' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div>
                        <p className="text-[9px] text-gray-500">Price</p>
                        <p className="text-xs font-bold">{formatCurrency(displayPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500">Qty</p>
                        <p className="text-xs font-bold">{formatShortQty(bid.quantity)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500">Total</p>
                        <p className="text-xs font-bold text-green-600">{formatShortAmt(bidTotal)}</p>
                      </div>
                    </div>
                    
                    {bid.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAccept(bid)}
                          disabled={actionLoading === bid._id}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          {actionLoading === bid._id ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(bid)}
                          disabled={actionLoading === bid._id}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;
