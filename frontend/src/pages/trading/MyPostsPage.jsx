import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Package,
  Share2,
  Zap,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader,
  MessageSquare,
  Info,
  X
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic, formatNumber } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingScreen from '../../components/common/LoadingScreen';

const MyPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [subTab, setSubTab] = useState('sell'); // sell or buy
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);

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

  const handleShare = (listing) => {
    haptic.light();
    setSelectedListing(listing);
    setShowShareModal(true);
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

  const handleModify = (listing) => {
    haptic.light();
    setSelectedListing(listing);
    setShowModifyModal(true);
  };

  const handleMarkSold = (listing) => {
    haptic.light();
    setSelectedListing(listing);
    setShowSoldModal(true);
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
                  userId={user?._id}
                  onShare={() => handleShare(listing)}
                  onBoost={() => handleBoost(listing)}
                  onModify={() => handleModify(listing)}
                  onDelete={() => {
                    setSelectedListing(listing);
                    setShowDeleteConfirm(true);
                  }}
                  onMarkSold={() => handleMarkSold(listing)}
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

      {/* Modify Modal */}
      {showModifyModal && selectedListing && (
        <ModifyModal 
          listing={selectedListing}
          onClose={() => {
            setShowModifyModal(false);
            setSelectedListing(null);
          }}
          onSuccess={() => {
            setShowModifyModal(false);
            setSelectedListing(null);
            fetchMyListings();
          }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedListing && (
        <ShareModal 
          listing={selectedListing}
          userId={user?._id}
          onClose={() => {
            setShowShareModal(false);
            setSelectedListing(null);
          }}
        />
      )}

      {/* Mark Sold Modal */}
      {showSoldModal && selectedListing && (
        <SoldModal 
          listing={selectedListing}
          onClose={() => {
            setShowSoldModal(false);
            setSelectedListing(null);
          }}
          onSuccess={() => {
            setShowSoldModal(false);
            setSelectedListing(null);
            fetchMyListings();
          }}
        />
      )}
    </>
  );
};

// My Post Card Component - Desktop Style with all actions
const MyPostCard = ({ listing, userId, onShare, onBoost, onModify, onDelete, onMarkSold, onRefresh }) => {
  const [bidsExpanded, setBidsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  
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

  const handleCounterClick = (bid) => {
    setSelectedBid(bid);
    setCounterPrice(bid.price.toString());
    setCounterQuantity(bid.quantity.toString());
    setShowCounterModal(true);
  };

  const handleCounterSubmit = async () => {
    if (!selectedBid || !counterPrice || !counterQuantity) return;
    try {
      setActionLoading(selectedBid._id);
      haptic.medium();
      await listingsAPI.counterBid(listing._id, selectedBid._id, {
        price: parseFloat(counterPrice),
        quantity: parseInt(counterQuantity)
      });
      haptic.success();
      toast.success('Counter offer sent! 💬');
      setShowCounterModal(false);
      setSelectedBid(null);
      setCounterPrice('');
      setCounterQuantity('');
      onRefresh();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to send counter');
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

      {/* Actions - Icon with Label below, all in one row */}
      <div className="px-3 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
        <div className="flex items-center justify-center gap-3">
          {/* Share */}
          <button 
            onClick={onShare}
            className="flex flex-col items-center gap-1 min-w-[50px]"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors">
              <Share2 size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-600">Share</span>
          </button>

          {/* Boost */}
          <button 
            onClick={onBoost}
            className="flex flex-col items-center gap-1 min-w-[50px]"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-600">Boost</span>
          </button>

          {/* Modify - only if no bids */}
          {activeBidsCount === 0 && listing.status === 'active' && (
            <button 
              onClick={onModify}
              className="flex flex-col items-center gap-1 min-w-[50px]"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-md hover:bg-purple-600 transition-colors">
                <Edit size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">Modify</span>
            </button>
          )}

          {/* Delete - only if no bids */}
          {activeBidsCount === 0 && listing.status === 'active' && (
            <button 
              onClick={onDelete}
              className="flex flex-col items-center gap-1 min-w-[50px]"
            >
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                <Trash2 size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">Delete</span>
            </button>
          )}

          {/* Sold */}
          {listing.status === 'active' && (
            <button 
              onClick={onMarkSold}
              className="flex flex-col items-center gap-1 min-w-[50px]"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition-colors">
                <CheckCircle size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">Sold</span>
            </button>
          )}
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
                        <button
                          onClick={() => handleCounterClick(bid)}
                          disabled={actionLoading === bid._id}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <MessageSquare size={14} />
                          Counter
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

      {/* Counter Modal */}
      {showCounterModal && selectedBid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <h3 className="text-lg font-bold">💬 Counter Offer</h3>
              <p className="text-blue-100 text-xs">{listing.companyName}</p>
            </div>
            <div className="p-4">
              <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-200">
                <p className="text-xs text-gray-600 mb-2">Original Bid:</p>
                <div className="flex justify-between">
                  <span className="font-bold">{formatCurrency(selectedBid.price)}</span>
                  <span className="font-bold">{formatShortQty(selectedBid.quantity)} shares</span>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Counter Price</label>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-sm font-semibold"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={counterQuantity}
                    onChange={(e) => setCounterQuantity(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-sm font-semibold"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              {counterPrice && counterQuantity && (
                <div className="bg-green-50 rounded-xl p-3 mb-4 border border-green-200">
                  <p className="text-xs text-gray-600">Counter Total:</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(parseFloat(counterPrice) * parseInt(counterQuantity))}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCounterModal(false);
                    setSelectedBid(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCounterSubmit}
                  disabled={actionLoading || !counterPrice || !counterQuantity}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODIFY MODAL
// ═══════════════════════════════════════════════════════════════
const ModifyModal = ({ listing, onClose, onSuccess }) => {
  const [price, setPrice] = useState(listing.price?.toString() || '');
  const [quantity, setQuantity] = useState(listing.quantity?.toString() || '');
  const [minQuantity, setMinQuantity] = useState(listing.minQuantity?.toString() || '1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      haptic.medium();
      await listingsAPI.update(listing._id, {
        price: parseFloat(price),
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity)
      });
      haptic.success();
      toast.success('Listing updated! 🎉');
      onSuccess();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
          <h3 className="text-lg font-bold">✏️ Modify Listing</h3>
          <p className="text-purple-100 text-xs">{listing.companyName}</p>
        </div>
        <div className="p-4">
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Price (per share)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Total Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Min Lot Size</label>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 text-sm font-semibold"
              />
            </div>
          </div>

          {price && quantity && (
            <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-200">
              <p className="text-xs text-gray-600">New Total:</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(parseFloat(price) * parseInt(quantity))}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !price || !quantity}
              className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Edit size={16} />}
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SHARE MODAL - Beautiful card with deep tracking link
// ═══════════════════════════════════════════════════════════════
const ShareModal = ({ listing, userId, onClose }) => {
  const isSell = listing.type === 'sell';
  const price = formatCurrency(listing.price);
  const qty = listing.quantity >= 100000 
    ? (listing.quantity / 100000).toFixed(1) + ' Lakh' 
    : listing.quantity >= 1000 
    ? (listing.quantity / 1000).toFixed(1) + 'K' 
    : listing.quantity?.toLocaleString('en-IN');
  const totalValue = listing.price * listing.quantity;
  const totalFormatted = totalValue >= 10000000 
    ? '₹' + (totalValue / 10000000).toFixed(2) + ' Cr'
    : totalValue >= 100000 
    ? '₹' + (totalValue / 100000).toFixed(2) + ' Lakh'
    : formatCurrency(totalValue);
  
  // Deep tracking link with referral
  const deepLink = `${window.location.origin}/listing/${listing._id}?ref=${userId || 'guest'}&source=share`;
  
  // Clean company name for hashtag (remove special chars)
  const cleanCompanyName = (listing.companyName || '').replace(/[^a-zA-Z0-9]/g, '');
  
  // Professional, Compliant Share Caption
  const caption = `━━━━━━━━━━━━━━━━━━━━━
📈 *NlistPlanet - Trade Unlisted Shares*
━━━━━━━━━━━━━━━━━━━━━

${isSell ? '🟢 SELLING' : '🔵 BUYING'} Unlisted Shares!

🏢 *${listing.companyName}*
${listing.companyId?.Sector ? `📁 Sector: ${listing.companyId.Sector}` : ''}

💰 Price: *${price}*/share
📦 Quantity: *${qty}* shares
💎 Total Value: *${totalFormatted}*

👉 View & Trade: ${deepLink}

━━━━━━━━━━━━━━━━━━━━━
⚠️ *Disclaimer:* Unlisted shares are high-risk investments. Please do your own research before investing. Past performance is not indicative of future results.

✅ Trade safely on NlistPlanet
🔒 Verified listings • Secure transactions
━━━━━━━━━━━━━━━━━━━━━

#UnlistedShares #PreIPO #${cleanCompanyName} #NlistPlanet`;

  // Short caption for Twitter (character limit)
  const shortCaption = `${isSell ? '🟢 SELLING' : '🔵 BUYING'}: ${listing.companyName}\n\n` +
    `💰 ${price}/share • 📦 ${qty} shares\n\n` +
    `Trade on @NlistPlanet 👇\n${deepLink}\n\n` +
    `#UnlistedShares #PreIPO`;

  const handleCopyLink = async () => {
    haptic.light();
    await navigator.clipboard.writeText(deepLink);
    toast.success('Link copied! 📋');
  };

  const handleCopyCaption = async () => {
    haptic.light();
    await navigator.clipboard.writeText(caption);
    toast.success('Caption copied! 📋');
  };

  const handleWhatsApp = () => {
    haptic.medium();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegram = () => {
    haptic.medium();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(caption)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleTwitter = () => {
    haptic.medium();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortCaption)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleNativeShare = async () => {
    haptic.medium();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing.companyName} on NlistPlanet`,
          text: caption,
          url: deepLink
        });
        toast.success('Shared successfully! 🎉');
      } catch (e) {
        if (e.name !== 'AbortError') {
          handleCopyCaption();
        }
      }
    } else {
      handleCopyCaption();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white relative">
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X size={18} />
          </button>
          <h3 className="text-lg font-bold">📤 Share Listing</h3>
          <p className="text-emerald-100 text-xs">Share with referral tracking link</p>
        </div>

        {/* Professional Preview Card */}
        <div className="p-4">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-4">
            {/* Card Header with Brand */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-xs">NlistPlanet</p>
                  <p className="text-gray-400 text-[8px]">Trade Unlisted Shares</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[9px] font-bold ${
                isSell 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {isSell ? '🟢 SELLING' : '🔵 BUYING'}
              </span>
            </div>
            
            {/* Company Info */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                  isSell ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {listing.companyName?.charAt(0) || 'C'}
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900 leading-tight">{listing.companyName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{listing.companyId?.Sector || 'Unlisted Share'}</p>
                </div>
              </div>
              
              {/* Price Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100 shadow-sm">
                  <p className="text-[8px] text-gray-400 uppercase font-semibold">Price/Share</p>
                  <p className="text-sm font-bold text-gray-900">{price}</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100 shadow-sm">
                  <p className="text-[8px] text-gray-400 uppercase font-semibold">Quantity</p>
                  <p className="text-sm font-bold text-gray-900">{qty}</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100 shadow-sm">
                  <p className="text-[8px] text-gray-400 uppercase font-semibold">Total Value</p>
                  <p className="text-sm font-bold text-emerald-600">{totalFormatted}</p>
                </div>
              </div>
            </div>
            
            {/* Footer with Compliance */}
            <div className="bg-gray-100 px-3 py-2 border-t border-gray-200">
              <p className="text-[8px] text-gray-500 text-center">
                ⚠️ Unlisted shares are high-risk. Do your own research before investing.
              </p>
            </div>
          </div>

          {/* Share Buttons */}
          <p className="text-xs text-gray-500 text-center mb-3 font-medium">Share via</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button onClick={handleWhatsApp} className="flex flex-col items-center gap-1.5 p-2 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100">
              <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-gray-700">WhatsApp</span>
            </button>
            <button onClick={handleTelegram} className="flex flex-col items-center gap-1.5 p-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-gray-700">Telegram</span>
            </button>
            <button onClick={handleTwitter} className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
              <div className="w-11 h-11 bg-gradient-to-br from-slate-800 to-black rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-gray-700">X / Twitter</span>
            </button>
            <button onClick={handleNativeShare} className="flex flex-col items-center gap-1.5 p-2 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <Share2 size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-700">More</span>
            </button>
          </div>

          {/* Copy Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200"
            >
              🔗 Copy Tracking Link
            </button>
            <button
              onClick={handleCopyCaption}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              📋 Copy Full Caption
            </button>
          </div>

          {/* Referral Tracking Info */}
          <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3 border border-amber-200">
            <p className="text-[10px] text-amber-800 flex items-start gap-2">
              <span className="text-base">🎯</span>
              <span><strong>Referral Tracking:</strong> Anyone who clicks your link will be tracked as your referral. Earn rewards when they trade!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SOLD MODAL
// ═══════════════════════════════════════════════════════════════
const SoldModal = ({ listing, onClose, onSuccess }) => {
  const [soldPrice, setSoldPrice] = useState(listing.price?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      haptic.medium();
      // Mark as sold API call (you may need to add this endpoint)
      await listingsAPI.update(listing._id, { status: 'sold', soldPrice: parseFloat(soldPrice) });
      haptic.success();
      toast.success('Marked as Sold! 🎉');
      onSuccess();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to mark as sold');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
          <h3 className="text-lg font-bold">✅ Mark as Sold</h3>
          <p className="text-amber-100 text-xs">{listing.companyName}</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Mark this listing as sold. This will deactivate the listing and cancel all pending bids.
          </p>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Final Sale Price (per share)</label>
            <input
              type="number"
              value={soldPrice}
              onChange={(e) => setSoldPrice(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 text-sm font-semibold"
              placeholder="Enter final price"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !soldPrice}
              className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Confirm Sold
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;
