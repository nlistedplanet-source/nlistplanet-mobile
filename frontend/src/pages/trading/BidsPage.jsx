import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  RotateCcw,
  Send,
  Loader,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic, formatNumber, calculateSellerGets, calculateBuyerPays } from '../../utils/helpers';
import toast from 'react-hot-toast';
import LoadingScreen from '../../components/common/LoadingScreen';

const BidsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeSubmenu, setActiveSubmenu] = useState('bids'); // 'bids' or 'offers'
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');

  useEffect(() => {
    fetchMyActivity();
  }, []);

  const fetchMyActivity = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMyPlacedBids();
      setActivities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
      toast.error('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchMyActivity();
    setRefreshing(false);
    haptic.success();
  };

  const handleAccept = async (activity) => {
    try {
      setActionLoading(activity._id);
      haptic.medium();
      await listingsAPI.acceptBid(activity.listing._id, activity._id);
      haptic.success();
      toast.success('Counter offer accepted! 🎉');
      fetchMyActivity();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to accept counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (activity) => {
    try {
      setActionLoading(activity._id);
      haptic.medium();
      await listingsAPI.rejectBid(activity.listing._id, activity._id);
      toast.success('Counter offer rejected');
      fetchMyActivity();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to reject counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounterClick = (activity) => {
    haptic.light();
    setSelectedActivity(activity);
    setCounterPrice(activity.price.toString());
    setCounterQuantity(activity.quantity.toString());
    setShowCounterModal(true);
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(selectedActivity._id);
      haptic.medium();
      await listingsAPI.counterBid(selectedActivity.listing._id, selectedActivity._id, {
        price: parseFloat(counterPrice),
        quantity: parseInt(counterQuantity)
      });
      haptic.success();
      toast.success('Counter offer sent! 💬');
      setShowCounterModal(false);
      setSelectedActivity(null);
      setCounterPrice('');
      setCounterQuantity('');
      fetchMyActivity();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to send counter offer');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter activities based on submenu
  const filteredActivities = activities.filter(activity => {
    if (activeSubmenu === 'bids') {
      return activity.type === 'bid'; // Bids placed on SELL listings
    } else {
      return activity.type === 'offer'; // Offers made on BUY listings
    }
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 to-gray-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
          <div className="px-4 pt-safe pb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Bids & Offers</h1>
                <p className="text-xs text-gray-500">{activities.length} Total</p>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center touch-feedback shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Submenu Tabs */}
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  haptic.light();
                  setActiveSubmenu('bids');
                }}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                  activeSubmenu === 'bids'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600'
                }`}
              >
                <TrendingUp size={16} />
                Bids Placed
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeSubmenu === 'bids' ? 'bg-white/20' : 'bg-gray-300'
                }`}>
                  {activities.filter(a => a.type === 'bid').length}
                </span>
              </button>
              <button
                onClick={() => {
                  haptic.light();
                  setActiveSubmenu('offers');
                }}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                  activeSubmenu === 'offers'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600'
                }`}
              >
                <TrendingDown size={16} />
                Offers Made
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeSubmenu === 'offers' ? 'bg-white/20' : 'bg-gray-300'
                }`}>
                  {activities.filter(a => a.type === 'offer').length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No {activeSubmenu === 'bids' ? 'Bids Placed' : 'Offers Made'} Yet
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {activeSubmenu === 'bids' 
                  ? 'Bids you place on sell listings will appear here'
                  : 'Offers you make on buy requests will appear here'
                }
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="btn-primary inline-flex text-sm px-4 py-2"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {filteredActivities.map((activity) => (
                <ActivityCard 
                  key={activity._id} 
                  activity={activity}
                  actionLoading={actionLoading}
                  onAccept={() => handleAccept(activity)}
                  onReject={() => handleReject(activity)}
                  onCounter={() => handleCounterClick(activity)}
                  onView={() => navigate(`/listing/${activity.listing._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Counter Modal */}
      {showCounterModal && selectedActivity && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCounterModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3">
              <h3 className="text-lg font-bold">💬 Send Counter Offer</h3>
              <p className="text-sm opacity-90">{selectedActivity.listing.companyName}</p>
            </div>
            <form onSubmit={handleCounterSubmit} className="p-4">
              <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-200">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  {selectedActivity.status === 'countered' ? "Seller's Counter (You'll Pay)" : `Your ${selectedActivity.type === 'bid' ? 'Bid' : 'Offer'}`}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white rounded-lg p-2 border border-blue-200">
                    <span className="text-gray-500 text-xs block">Price</span>
                    <span className="font-bold text-gray-900">
                      {selectedActivity.status === 'countered' && selectedActivity.counterHistory?.length > 0
                        ? formatCurrency(calculateBuyerPays(selectedActivity.counterHistory[selectedActivity.counterHistory.length - 1].price))
                        : formatCurrency(selectedActivity.price)
                      }
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-blue-200">
                    <span className="text-gray-500 text-xs block">Quantity</span>
                    <span className="font-bold text-gray-900">
                      {selectedActivity.status === 'countered' && selectedActivity.counterHistory?.length > 0
                        ? selectedActivity.counterHistory[selectedActivity.counterHistory.length - 1].quantity
                        : selectedActivity.quantity
                      } shares
                    </span>
                  </div>
                </div>
                {selectedActivity.status === 'countered' && (
                  <p className="text-[10px] text-gray-500 mt-2">After 2% platform fee</p>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">Counter Price *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  step="0.01" 
                  value={counterPrice} 
                  onChange={(e) => setCounterPrice(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900" 
                  placeholder="Enter counter price" 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Quantity *</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={counterQuantity} 
                  onChange={(e) => setCounterQuantity(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold text-gray-900" 
                  placeholder="Enter quantity" 
                />
              </div>
              
              {counterPrice && counterQuantity && (
                <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800 font-semibold text-sm">Total:</span>
                    <span className="text-lg font-bold text-purple-900">
                      {formatCurrency(parseFloat(counterPrice) * parseInt(counterQuantity))}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowCounterModal(false)} 
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading === selectedActivity._id || !counterPrice || !counterQuantity} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === selectedActivity._id ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Activity Card Component - Desktop Style
const ActivityCard = ({ activity, actionLoading, onAccept, onReject, onCounter, onView }) => {
  const [expanded, setExpanded] = useState(false);
  
  const isBid = activity.type === 'bid';
  const counterHistory = activity.counterHistory || [];
  const listingPrice = activity.listing.displayPrice || activity.listing.listingPrice || activity.listing.price;
  const hasCounterHistory = counterHistory.length > 0;
  const showActions = activity.status === 'countered';
  
  // Check if latest counter is from seller (they need to respond)
  const latestCounter = hasCounterHistory ? counterHistory[counterHistory.length - 1] : null;
  const isLatestFromSeller = latestCounter?.by === 'seller';
  const canTakeAction = showActions && isLatestFromSeller;

  const statusConfig = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
    accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    countered: { bg: 'bg-purple-100', text: 'text-purple-700', icon: RotateCcw },
  };
  
  const status = statusConfig[activity.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm truncate">{activity.listing.companyName}</h4>
          <p className="text-[10px] text-gray-500">
            {isBid ? 'Seller' : 'Buyer'}: @{activity.listing.owner?.username || 'Unknown'}
          </p>
          <p className="text-[10px] text-gray-500">
            Listed: {formatCurrency(listingPrice)} × {activity.listing.quantity} shares
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${status.bg} ${status.text}`}>
            <StatusIcon size={10} />
            {activity.status}
          </span>
          <button 
            onClick={onView}
            className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <Eye size={14} className="text-blue-600" />
          </button>
        </div>
      </div>

      {/* Your Bid Info */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Your {isBid ? 'Bid' : 'Offer'}</p>
            <p className="text-xs font-bold text-green-700">{formatCurrency(activity.price)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Qty</p>
            <p className="text-xs font-bold text-gray-900">{activity.quantity}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Total</p>
            <p className="text-xs font-bold text-blue-700">{formatCurrency(activity.price * activity.quantity)}</p>
          </div>
        </div>
      </div>

      {/* Counter History - Collapsible */}
      {hasCounterHistory && (
        <div className="px-3 py-2">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 flex items-center justify-between"
          >
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <RotateCcw size={12} />
              Negotiation History ({counterHistory.length})
            </span>
            {expanded ? <ChevronUp size={16} className="text-purple-600" /> : <ChevronDown size={16} className="text-purple-600" />}
          </button>
          
          {expanded && (
            <div className="mt-2 space-y-2">
              {counterHistory.map((counter, idx) => {
                const isSellerCounter = counter.by === 'seller';
                const isLatest = idx === counterHistory.length - 1;
                // For buyer's view: seller's counter price should show +2% (what buyer will pay)
                // buyer's own counter price is shown as-is (what they offered)
                const displayCounterPrice = isSellerCounter 
                  ? calculateBuyerPays(counter.price) 
                  : counter.price;
                
                return (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-lg border ${
                      isSellerCounter 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold ${isSellerCounter ? 'text-orange-700' : 'text-blue-700'}`}>
                        {counter.round ? `Round ${counter.round}` : `#${idx + 1}`} - {isSellerCounter ? (isBid ? 'Seller' : 'Buyer') : 'You'}
                      </span>
                      {isLatest && canTakeAction && (
                        <span className="text-[9px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded font-bold">
                          RESPOND
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-700">
                        <span className="text-gray-500">Price:</span> <strong>{formatCurrency(displayCounterPrice)}</strong>
                        {isSellerCounter && <span className="text-[9px] text-gray-400 ml-1">(incl. fee)</span>}
                      </span>
                      <span className="text-gray-700">
                        <span className="text-gray-500">Qty:</span> <strong>{counter.quantity}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {canTakeAction && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-[10px] text-orange-700 font-semibold mb-2 text-center">
            ⚡ {isBid ? 'Seller' : 'Buyer'} sent a counter offer - Respond now!
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onAccept}
              disabled={actionLoading === activity._id}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <CheckCircle size={14} />
              Accept
            </button>
            <button
              onClick={onReject}
              disabled={actionLoading === activity._id}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <XCircle size={14} />
              Reject
            </button>
            <button
              onClick={onCounter}
              disabled={actionLoading === activity._id}
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Counter
            </button>
          </div>
        </div>
      )}

      {/* Status Footer */}
      {!canTakeAction && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-[10px] text-gray-500">
            {timeAgo(activity.createdAt)}
          </p>
          {activity.status === 'accepted' && (
            <span className="text-[10px] font-bold text-green-700 flex items-center gap-1">
              <CheckCircle size={12} />
              Deal Accepted!
            </span>
          )}
          {activity.status === 'rejected' && (
            <span className="text-[10px] font-bold text-red-700 flex items-center gap-1">
              <XCircle size={12} />
              Rejected
            </span>
          )}
          {activity.status === 'pending' && (
            <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
              <Clock size={12} />
              Waiting for response...
            </span>
          )}
          {activity.status === 'countered' && !canTakeAction && (
            <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
              <Clock size={12} />
              Waiting for their response...
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BidsPage;
