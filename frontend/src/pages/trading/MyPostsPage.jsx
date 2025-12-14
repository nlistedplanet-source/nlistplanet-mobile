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
  X,
  History,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic, formatNumber, calculateSellerGets } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MyPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [subTab, setSubTab] = useState('sell'); // sell or buy
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
      // Use cancel API instead of delete to preserve in history
      await listingsAPI.cancel(selectedListing._id, { 
        reason: 'User cancelled - no longer interested' 
      });
      haptic.success();
      toast.success('Listing cancelled successfully');
      setShowCancelModal(false);
      setSelectedListing(null);
      fetchMyListings();
    } catch (error) {
      haptic.error();
      console.error('Failed to cancel listing:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel listing');
    }
  };

  const handleShare = async (listing) => {
    haptic.light();
    
    const isSell = listing.type === 'sell';
    const price = formatCurrency(listing.price);
    const qty = listing.quantity >= 100000 
      ? (listing.quantity / 100000).toFixed(1) + ' Lakh' 
      : listing.quantity >= 1000 
      ? (listing.quantity / 1000).toFixed(1) + 'K' 
      : listing.quantity?.toLocaleString('en-IN');
    
    // Main site referral link for tracking
    const referralLink = `https://nlistplanet.com/listing/${listing._id}?ref=${user?._id || 'guest'}&source=share`;
    
    // Get company highlights
    const sector = listing.companyId?.Sector || listing.companyId?.sector || 'Unlisted Share';
    const highlights = [
      `Sector: ${sector}`,
      'Pre-IPO Investment Opportunity',
      'Verified on NlistPlanet'
    ];
    
    // Professional Share Caption
    const caption = `━━━━━━━━━━━━━━━━━━━━━
   📈 N L I S T P L A N E T
      Trade Unlisted Shares
━━━━━━━━━━━━━━━━━━━━━

🏷️ *UNLISTED SHARE*

═══════════════════════════

        ${isSell ? '🟢 *SELLING*' : '🔵 *BUYING*'}

━━━━━━━━━━━━━━━━━━━━━

🏢 *${listing.companyName}*
    ${sector}

${highlights.map(h => `✦ ${h}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━
  💰 PRICE       ${price}/share
  📦 QUANTITY    ${qty} shares
━━━━━━━━━━━━━━━━━━━━━

👉 *View & Trade:* ${referralLink}

═══════════════════════════

⚠️ *IMPORTANT DISCLAIMER*

• Unlisted shares are NOT traded on NSE/BSE
• HIGH RISK investment - Do your research
• NlistPlanet is a marketplace, not an advisor

━━━━━━━━━━━━━━━━━━━━━
🔒 Verified • Secure • Trusted
━━━━━━━━━━━━━━━━━━━━━`;

    // Try native share first, then WhatsApp
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${listing.companyName} - ${isSell ? 'SELL' : 'BUY'} on NlistPlanet`,
          text: caption,
          url: referralLink
        });
        haptic.success();
        toast.success('Shared successfully! 🎉');
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
        // Fallback to WhatsApp
      }
    }
    
    // Fallback: Open WhatsApp directly
    haptic.medium();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp... 📱');
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
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 to-gray-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
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
                    : 'bg-white text-gray-600 border border-slate-200'
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
                    : 'bg-white text-gray-600 border border-slate-200'
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
                    setShowCancelModal(true);
                  }}
                  onMarkSold={() => handleMarkSold(listing)}
                  onRefresh={fetchMyListings}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete/Cancel Confirmation */}
      {showCancelModal && selectedListing && (
        <CancelModal
          listing={selectedListing}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedListing(null);
          }}
          onSuccess={() => {
            setShowCancelModal(false);
            setSelectedListing(null);
            fetchMyListings();
          }}
        />
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

// My Post Card Component - Mobile Design with Counter Offers & Pending Bids sections
const MyPostCard = ({ listing, userId, onShare, onBoost, onModify, onDelete, onMarkSold, onRefresh }) => {
  const [counterOffersExpanded, setCounterOffersExpanded] = useState(true);
  const [pendingBidsExpanded, setPendingBidsExpanded] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showBidDetailModal, setShowBidDetailModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  
  const isSell = listing.type === 'sell';
  const bidsArray = (isSell ? listing.bids : listing.offers) || [];
  
  // Separate bids into Counter Offers (in-progress) and Pending Bids
  const counterOfferBids = bidsArray.filter(b => b.status === 'countered');
  const pendingBids = bidsArray.filter(b => b.status === 'pending');
  const activeBidsCount = counterOfferBids.length + pendingBids.length;
  
  const sellerPrice = isSell ? (listing.sellerDesiredPrice || listing.price) : (listing.buyerMaxPrice || listing.price);
  const totalAmount = sellerPrice * listing.quantity;

  // Helper to get latest counter info for a bid
  const getLatestCounterInfo = (bid) => {
    if (!bid.counterHistory || bid.counterHistory.length === 0) {
      return { buyerBid: bid.price, buyerQty: bid.quantity, yourPrice: null, yourQty: null, rounds: 0, latestBy: 'buyer' };
    }
    
    const history = bid.counterHistory;
    let latestBuyerCounter = null;
    let latestSellerCounter = null;
    
    for (let i = history.length - 1; i >= 0; i--) {
      if (!latestBuyerCounter && history[i].by === 'buyer') latestBuyerCounter = history[i];
      if (!latestSellerCounter && history[i].by === 'seller') latestSellerCounter = history[i];
      if (latestBuyerCounter && latestSellerCounter) break;
    }
    
    const latestEntry = history[history.length - 1];
    
    return {
      buyerBid: latestBuyerCounter ? latestBuyerCounter.price : bid.price,
      buyerQty: latestBuyerCounter ? latestBuyerCounter.quantity : bid.quantity,
      yourPrice: latestSellerCounter ? latestSellerCounter.price : null,
      yourQty: latestSellerCounter ? latestSellerCounter.quantity : null,
      rounds: history.length,
      latestBy: latestEntry.by
    };
  };

  const handleAccept = async (bid) => {
    try {
      setActionLoading(bid._id);
      haptic.medium();
      await listingsAPI.acceptBid(listing._id, bid._id);
      haptic.success();
      toast.success('Bid accepted! 🎉');
      setShowBidDetailModal(false);
      setSelectedBid(null);
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
      setShowBidDetailModal(false);
      setSelectedBid(null);
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
    setShowBidDetailModal(false);
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

  const handleBidCardClick = (bid) => {
    haptic.light();
    setSelectedBid(bid);
    setShowBidDetailModal(true);
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

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Status Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            listing.status === 'active' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : listing.status === 'negotiating'
              ? 'bg-amber-100 text-amber-700 border border-amber-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}>
            {listing.status === 'active' ? '🟢' : listing.status === 'negotiating' ? '🟠' : '⚪'} {listing.status?.toUpperCase() || 'ACTIVE'}
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
              {listing.companyId?.scriptName || listing.companyId?.name || listing.companyName || 'Unknown'}
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
            <p className="text-[9px] text-gray-500 uppercase font-semibold">{isSell ? 'Sell' : 'Buy'} Price</p>
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
          <button onClick={onShare} className="flex flex-col items-center gap-1 min-w-[50px]">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors">
              <Share2 size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-600">Share</span>
          </button>

          {/* Boost */}
          <button onClick={onBoost} className="flex flex-col items-center gap-1 min-w-[50px]">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-gray-600">Boost</span>
          </button>

          {/* Modify - only if no bids */}
          {activeBidsCount === 0 && listing.status === 'active' && (
            <button onClick={onModify} className="flex flex-col items-center gap-1 min-w-[50px]">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-md hover:bg-purple-600 transition-colors">
                <Edit size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">Modify</span>
            </button>
          )}

          {/* Delete - only if no bids */}
          {activeBidsCount === 0 && listing.status === 'active' && (
            <button onClick={onDelete} className="flex flex-col items-center gap-1 min-w-[50px]">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                <Trash2 size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">Delete</span>
            </button>
          )}

          {/* Sold */}
          {listing.status === 'active' && (
            <button onClick={onMarkSold} className="flex flex-col items-center gap-1 min-w-[50px]">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition-colors">
                <CheckCircle size={18} className="text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-600">Sold</span>
            </button>
          )}
        </div>
      </div>

      {/* Two Sections: Counter Offers In-Progress + Pending Bids */}
      {bidsArray.length > 0 && (
        <div className="px-3 py-2 space-y-2">
          {/* Section 1: Counter Offers In-Progress */}
          {counterOfferBids.length > 0 && (
            <div>
              <button 
                onClick={() => {
                  haptic.light();
                  setCounterOffersExpanded(!counterOffersExpanded);
                }}
                className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-lg border-2 border-blue-400 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🔵</span>
                  <span className="text-xs font-bold text-blue-800">Counter Offers ({counterOfferBids.length})</span>
                </div>
                {counterOffersExpanded ? <ChevronUp size={16} className="text-blue-700" /> : <ChevronDown size={16} className="text-blue-700" />}
              </button>
              
              {counterOffersExpanded && (
                <div className="mt-2 space-y-2">
                  {counterOfferBids.map((bid, index) => {
                    const counterInfo = getLatestCounterInfo(bid);
                    // Seller sees what they will RECEIVE (buyer's bid × 0.98)
                    const displayBuyerBid = calculateSellerGets(counterInfo.buyerBid);
                    const isLatestFromBuyer = counterInfo.latestBy === 'buyer';
                    
                    return (
                      <div 
                        key={bid._id}
                        onClick={() => handleBidCardClick(bid)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isLatestFromBuyer 
                            ? 'bg-orange-50 border-orange-300 hover:bg-orange-100' 
                            : 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-700">
                              👤 @{bid.user?.username || bid.username || `trader_${index + 1}`}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isLatestFromBuyer 
                                ? 'bg-orange-200 text-orange-800' 
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                              {isLatestFromBuyer ? 'Your Turn' : 'Waiting'}
                            </span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        
                        <div className="flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-gray-500">Buyer: </span>
                            <span className="font-bold text-gray-900">{formatCurrency(displayBuyerBid)} × {formatShortQty(counterInfo.buyerQty)}</span>
                          </div>
                          <div className="text-gray-400">|</div>
                          <div>
                            <span className="text-gray-500">You: </span>
                            <span className="font-bold text-purple-700">
                              {counterInfo.yourPrice ? `${formatCurrency(counterInfo.yourPrice)}` : '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-1 text-[10px] text-gray-500">
                          Rounds: {counterInfo.rounds}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Pending Bids */}
          {pendingBids.length > 0 && (
            <div>
              <button 
                onClick={() => {
                  haptic.light();
                  setPendingBidsExpanded(!pendingBidsExpanded);
                }}
                className="w-full bg-gradient-to-r from-orange-100 to-slate-100 px-3 py-2 rounded-lg border-2 border-orange-400 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">🟠</span>
                  <span className="text-xs font-bold text-orange-800">Pending Bids ({pendingBids.length})</span>
                </div>
                {pendingBidsExpanded ? <ChevronUp size={16} className="text-orange-700" /> : <ChevronDown size={16} className="text-orange-700" />}
              </button>
              
              {pendingBidsExpanded && (
                <div className="mt-2 space-y-2">
                  {pendingBids.map((bid, index) => {
                    // Seller sees what they will RECEIVE (buyer's bid × 0.98)
                    const buyerBidPrice = bid.originalPrice || bid.price;
                    const displayPrice = calculateSellerGets(buyerBidPrice);
                    const bidTotal = displayPrice * bid.quantity;
                    
                    return (
                      <div 
                        key={bid._id}
                        onClick={() => handleBidCardClick(bid)}
                        className="p-3 rounded-lg bg-orange-50 border-2 border-orange-300 cursor-pointer hover:bg-orange-100 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-700">
                              👤 @{bid.user?.username || bid.username || `trader_${index + 1}`}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-200 text-amber-800">
                              NEW
                            </span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        
                        <div className="flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-gray-500">Price: </span>
                            <span className="font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Qty: </span>
                            <span className="font-bold">{formatShortQty(bid.quantity)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total: </span>
                            <span className="font-bold text-green-600">{formatShortAmt(bidTotal)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-1 text-[10px] text-gray-500">
                          {formatDate(bid.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* No Active Bids */}
          {counterOfferBids.length === 0 && pendingBids.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-xs">No active bids yet</p>
            </div>
          )}
        </div>
      )}

      {/* Bid Detail Popup Modal */}
      {showBidDetailModal && selectedBid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{isSell ? 'Bid Details' : 'Offer Details'}</h3>
                  <p className="text-blue-100 text-xs">{listing.companyName}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowBidDetailModal(false);
                    setSelectedBid(null);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Bidder Info */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-700">
                    👤 @{selectedBid.user?.username || selectedBid.username || 'trader'}
                  </span>
                  <span className="text-xs text-gray-500">⭐ {selectedBid.user?.rating?.toFixed(1) || '4.5'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  selectedBid.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-400' :
                  selectedBid.status === 'countered' ? 'bg-blue-100 text-blue-800 border border-blue-400' :
                  'bg-gray-100 text-gray-800 border border-gray-400'
                }`}>
                  {selectedBid.status}
                </span>
              </div>

              {/* Price Summary */}
              {(() => {
                const counterInfo = getLatestCounterInfo(selectedBid);
                // Seller sees what they will RECEIVE (buyer's bid × 0.98)
                const displayBuyerBid = calculateSellerGets(counterInfo.buyerBid);
                const bidTotal = displayBuyerBid * counterInfo.buyerQty;
                
                return (
                  <div className="space-y-3 mb-4">
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                      <p className="text-[10px] text-gray-600 uppercase font-semibold mb-1">{isSell ? 'Buyer Bid' : 'Seller Offer'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(displayBuyerBid)}</span>
                        <span className="text-sm font-semibold text-gray-700">× {formatShortQty(counterInfo.buyerQty)}</span>
                      </div>
                      <p className="text-xs text-green-600 font-bold mt-1">Total: {formatShortAmt(bidTotal)}</p>
                    </div>

                    {counterInfo.yourPrice && (
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                        <p className="text-[10px] text-gray-600 uppercase font-semibold mb-1">Your Counter</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-700">{formatCurrency(counterInfo.yourPrice)}</span>
                          <span className="text-sm font-semibold text-gray-700">× {formatShortQty(counterInfo.yourQty)}</span>
                        </div>
                      </div>
                    )}

                    {counterInfo.rounds > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <p className="text-[10px] text-gray-600 uppercase font-semibold mb-1">Negotiation Rounds</p>
                        <p className="text-lg font-bold text-gray-900">{counterInfo.rounds}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Counter History */}
              {selectedBid.counterHistory && selectedBid.counterHistory.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={14} className="text-gray-500" />
                    <span className="text-xs font-bold text-gray-700">Counter History</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 max-h-32 overflow-y-auto">
                    {selectedBid.counterHistory.map((counter, cIdx) => {
                      // Seller sees: own counter as-is, buyer's counter ×0.98
                      const counterDisplayPrice = counter.by === 'seller' 
                        ? counter.price 
                        : calculateSellerGets(counter.price);
                      return (
                        <div key={cIdx} className={`py-1.5 px-2 rounded-lg mb-1 ${counter.by === 'seller' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className={`font-bold ${counter.by === 'seller' ? 'text-purple-700' : 'text-blue-700'}`}>
                              {counter.by === 'seller' ? 'You' : 'Buyer'} #{counter.round || cIdx + 1}
                            </span>
                            <span className="text-gray-500">{formatDate(counter.timestamp)}</span>
                          </div>
                          <div className="text-xs font-semibold text-gray-800 mt-0.5">
                            {formatCurrency(counterDisplayPrice)} × {formatShortQty(counter.quantity)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              {(selectedBid.status === 'pending' || (selectedBid.status === 'countered' && getLatestCounterInfo(selectedBid).latestBy === 'buyer')) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(selectedBid)}
                    disabled={actionLoading === selectedBid._id}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    {actionLoading === selectedBid._id ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(selectedBid)}
                    disabled={actionLoading === selectedBid._id}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleCounterClick(selectedBid)}
                    disabled={actionLoading === selectedBid._id}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <MessageSquare size={14} />
                    Counter
                  </button>
                </div>
              )}
              {selectedBid.status === 'countered' && getLatestCounterInfo(selectedBid).latestBy === 'seller' && (
                <div className="text-center text-sm text-blue-600 py-2 flex items-center justify-center gap-2">
                  <Clock size={16} />
                  Waiting for buyer's response...
                </div>
              )}
            </div>
          </div>
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
                <p className="text-xs text-gray-600 mb-2">Buyer's Bid (You'll Receive):</p>
                <div className="flex justify-between">
                  <span className="font-bold">{formatCurrency(calculateSellerGets(selectedBid.price))}</span>
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
// CANCEL MODAL - For cancelling/deleting listing
// ═══════════════════════════════════════════════════════════════
const CancelModal = ({ listing, onClose, onSuccess }) => {
  const isSell = listing.type === 'sell';
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reasonOptions = [
    'No longer interested',
    'Found better price elsewhere',
    'Changed my mind',
    'Shares already sold/bought',
    'Other'
  ];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      haptic.medium();
      
      await listingsAPI.cancel(listing._id, { 
        reason: reason || 'User cancelled' 
      });
      
      haptic.success();
      toast.success('Listing cancelled successfully');
      onSuccess();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to cancel listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cancel Listing</h3>
              <p className="text-red-100 text-xs">This will move listing to history</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* Listing Info */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isSell ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <span className={`text-lg font-bold ${isSell ? 'text-red-600' : 'text-green-600'}`}>
                  {listing.companyName?.charAt(0) || 'C'}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{listing.companyName}</p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(listing.price)} × {listing.quantity} shares
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                All pending {isSell ? 'bids' : 'offers'} will be rejected and bidders will be notified.
              </p>
            </div>
          </div>
          
          {/* Reason Selection */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Reason for cancellation (optional)
            </label>
            <div className="space-y-2">
              {reasonOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setReason(opt)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                    reason === opt 
                      ? 'bg-red-50 border-red-300 text-red-700 font-medium' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 font-semibold"
            >
              Keep Listing
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Cancel Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SOLD MODAL - For marking listing as sold externally
// ═══════════════════════════════════════════════════════════════
const SoldModal = ({ listing, onClose, onSuccess }) => {
  const isSell = listing.type === 'sell';
  const [soldPrice, setSoldPrice] = useState(listing.price?.toString() || '');
  const [soldQuantity, setSoldQuantity] = useState(listing.quantity?.toString() || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!soldPrice || parseFloat(soldPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      haptic.medium();
      
      await listingsAPI.markAsSold(listing._id, {
        soldPrice: parseFloat(soldPrice),
        soldQuantity: parseInt(soldQuantity) || listing.quantity,
        notes: notes.trim()
      });
      
      haptic.success();
      toast.success(`Successfully marked as ${isSell ? 'sold' : 'bought'}! 🎉`);
      onSuccess();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to mark as sold');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = (parseFloat(soldPrice) || 0) * (parseInt(soldQuantity) || listing.quantity);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isSell ? '✅ Mark as Sold' : '✅ Mark as Bought'}
              </h3>
              <p className="text-green-100 text-xs">{listing.companyName}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                {isSell 
                  ? "Use this if you've sold your shares outside our platform. This will close the listing and cancel all pending bids."
                  : "Use this if you've bought shares outside our platform. This will close the request and cancel all pending offers."
                }
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isSell ? 'Sold Price (per share) *' : 'Bought Price (per share) *'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input
                  type="number"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 text-sm font-semibold"
                  placeholder="Enter final price"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Quantity {isSell ? 'Sold' : 'Bought'}
              </label>
              <input
                type="number"
                value={soldQuantity}
                onChange={(e) => setSoldQuantity(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 text-sm font-semibold"
                placeholder={`Max: ${listing.quantity}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 text-sm resize-none"
                rows={2}
                placeholder="Any additional details..."
              />
            </div>
          </div>

          {/* Total Summary */}
          {soldPrice && (
            <div className="bg-green-50 rounded-xl p-3 mb-4 border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Total Amount:</span>
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                {formatNumber(parseInt(soldQuantity) || listing.quantity)} shares × ₹{parseFloat(soldPrice).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !soldPrice}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;
