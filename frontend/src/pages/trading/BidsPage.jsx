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
  Eye,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, timeAgo, haptic, formatNumber, calculateSellerGets, calculateBuyerPays } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BidsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeSubmenu, setActiveSubmenu] = useState('bids'); // 'bids' or 'offers'
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' or 'expired'
  const [actionLoading, setActionLoading] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQuantity, setCounterQuantity] = useState('');
  const [dealDetails, setDealDetails] = useState({});

  // Define which statuses are "active" vs "expired"
  const activeStatuses = ['pending', 'countered', 'pending_seller_confirmation', 'pending_confirmation'];
  const expiredStatuses = ['accepted', 'rejected', 'expired', 'completed', 'cancelled', 'confirmed', 'sold', 'rejected_by_seller'];

  useEffect(() => {
    fetchMyActivity();
  }, []);

  const fetchMyActivity = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMyPlacedBids();
      const activitiesData = response.data.data || [];
      setActivities(activitiesData);

      // Fetch deal details for confirmed/sold bids
      const confirmedActivities = activitiesData.filter(a => 
        a.dealId && (a.status === 'confirmed' || a.status === 'sold' || a.status === 'pending_seller_confirmation')
      );
      
      for (const activity of confirmedActivities) {
        if (activity.dealId) {
          try {
            const dealResponse = await listingsAPI.getDeal(activity.dealId);
            setDealDetails(prev => ({
              ...prev,
              [activity.dealId]: dealResponse.data.data
            }));
          } catch (error) {
            console.error(`Failed to fetch deal ${activity.dealId}:`, error);
          }
        }
      }
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
    if (!window.confirm('Are you sure you want to accept this offer? This will finalize the deal.')) return;

    try {
      setActionLoading(activity._id);
      haptic.medium();
      await listingsAPI.acceptBid(activity.listing._id, activity._id);
      haptic.success();
      toast.success('Deal accepted! Waiting for other party to confirm or reject');
      fetchMyActivity();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to accept offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (activity) => {
    if (!window.confirm('Are you sure you want to reject this offer?')) return;

    try {
      setActionLoading(activity._id);
      haptic.medium();
      await listingsAPI.rejectBid(activity.listing._id, activity._id);
      toast.success('Offer rejected');
      fetchMyActivity();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to reject offer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounterClick = (activity) => {
    haptic.light();
    setSelectedActivity(activity);
    // Pre-fill with the LAST price from history or original
    const lastPrice = activity.counterHistory?.length > 0 
      ? activity.counterHistory[activity.counterHistory.length - 1].price 
      : activity.price;

    setCounterPrice(lastPrice.toString());
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

  // Helper to determine if action is required
  const isActionRequired = (activity) => {
    if (activity.status !== 'countered') return false;
    if (!activity.counterHistory || activity.counterHistory.length === 0) return false;
    
    const lastCounter = activity.counterHistory[activity.counterHistory.length - 1];
    const isBid = activity.type === 'bid'; // I am Buyer
    
    // If I am Buyer (isBid=true), action required if last counter is from Seller
    // If I am Seller (isBid=false), action required if last counter is from Buyer
    return isBid ? (lastCounter.by === 'seller') : (lastCounter.by === 'buyer');
  };

  // Filter activities based on submenu and status
  const filteredActivities = activities.filter(activity => {
    // First filter by type (bids vs offers)
    const typeMatch = activeSubmenu === 'bids' 
      ? activity.type === 'bid' 
      : activity.type === 'offer';
    
    if (!typeMatch) return false;
    
    // Then filter by status (active vs expired)
    // Also check if listing is deleted (listing might be null or have isActive = false)
    const isListingDeleted = !activity.listing || activity.listing.isActive === false;
    const isActive = activeStatuses.includes(activity.status) && !isListingDeleted;
    
    if (statusFilter === 'active') {
      return isActive;
    } else {
      return !isActive; // expired, rejected, completed, or listing deleted
    }
  });

  // Split active activities into "Action Required" and "Others"
  const actionRequiredActivities = statusFilter === 'active' 
    ? filteredActivities.filter(a => isActionRequired(a))
    : [];
    
  const otherActivities = statusFilter === 'active'
    ? filteredActivities.filter(a => !isActionRequired(a))
    : filteredActivities;

  // Count for badges
  const getStatusCounts = (type) => {
    const typeActivities = activities.filter(a => 
      type === 'bids' ? a.type === 'bid' : a.type === 'offer'
    );
    const activeCount = typeActivities.filter(a => {
      const isListingDeleted = !a.listing || a.listing.isActive === false;
      return activeStatuses.includes(a.status) && !isListingDeleted;
    }).length;
    const expiredCount = typeActivities.length - activeCount;
    return { activeCount, expiredCount, total: typeActivities.length };
  };

  const currentCounts = getStatusCounts(activeSubmenu);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={32} />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
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
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 mb-2">
              <button
                onClick={() => {
                  haptic.light();
                  setActiveSubmenu('bids');
                  setStatusFilter('active');
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
                  setStatusFilter('active');
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

            {/* Active/Expired Toggle - Small Switch */}
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className={`text-[10px] font-semibold ${statusFilter === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                Active ({currentCounts.activeCount})
              </span>
              <button
                onClick={() => {
                  haptic.light();
                  setStatusFilter(statusFilter === 'active' ? 'expired' : 'active');
                }}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                  statusFilter === 'expired' ? 'bg-gray-400' : 'bg-emerald-500'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
                  statusFilter === 'expired' ? 'left-6' : 'left-1'
                }`} />
              </button>
              <span className={`text-[10px] font-semibold ${statusFilter === 'expired' ? 'text-gray-700' : 'text-gray-400'}`}>
                Expired ({currentCounts.expiredCount})
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {statusFilter === 'active' ? (
                  <Clock className="w-8 h-8 text-gray-400" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No {statusFilter === 'active' ? 'Active' : 'Expired/Completed'} {activeSubmenu === 'bids' ? 'Bids' : 'Offers'}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {statusFilter === 'active'
                  ? `Your active ${activeSubmenu === 'bids' ? 'bids' : 'offers'} will appear here`
                  : `${activeSubmenu === 'bids' ? 'Bids' : 'Offers'} that are expired, rejected, or completed will appear here`
                }
              </p>
              {statusFilter === 'active' && (
                <button
                  onClick={() => navigate('/marketplace')}
                  className="btn-primary inline-flex text-sm px-4 py-2"
                >
                  Browse Marketplace
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {/* Action Required Section */}
              {actionRequiredActivities.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider px-1">
                    <AlertTriangle size={14} />
                    Action Required
                  </div>
                  {actionRequiredActivities.map(activity => (
                    <ActivityCard 
                      key={activity._id} 
                      activity={activity}
                      actionLoading={actionLoading}
                      onAccept={() => handleAccept(activity)}
                      onReject={() => handleReject(activity)}
                      onCounter={() => handleCounterClick(activity)}
                      onView={() => activity.listing?._id ? navigate(`/listing/${activity.listing._id}`) : null}
                      isExpired={false}
                      isActionable={true}
                      dealDetails={dealDetails}
                    />
                  ))}
                  
                  {otherActivities.length > 0 && (
                    <div className="border-t border-gray-200 my-4 pt-2">
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider px-1 mb-3">
                        <Clock size={14} />
                        Waiting for Response
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Other Activities */}
              <div className="space-y-3">
                {otherActivities.map((activity) => (
                  <ActivityCard 
                    key={activity._id} 
                    activity={activity}
                    actionLoading={actionLoading}
                    onAccept={() => handleAccept(activity)}
                    onReject={() => handleReject(activity)}
                    onCounter={() => handleCounterClick(activity)}
                    onView={() => activity.listing?._id ? navigate(`/listing/${activity.listing._id}`) : null}
                    isExpired={statusFilter === 'expired'}
                    isActionable={false}
                    dealDetails={dealDetails}
                  />
                ))}
              </div>
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

// Activity Card Component - Mobile Style
const ActivityCard = ({ activity, actionLoading, onAccept, onReject, onCounter, onView, isExpired, isActionable, dealDetails }) => {
  const [expanded, setExpanded] = useState(false);
  
  const isBid = activity.type === 'bid';
  const counterHistory = activity.counterHistory || [];
  const listingPrice = activity.listing?.displayPrice || activity.listing?.listingPrice || activity.listing?.price || 0;
  const hasCounterHistory = counterHistory.length > 0;
  
  // Check if listing is deleted
  const isListingDeleted = !activity.listing || activity.listing.isActive === false;
  
  // Determine display price
  const latestCounter = hasCounterHistory ? counterHistory[counterHistory.length - 1] : null;
  const rawDisplayPrice = latestCounter ? latestCounter.price : (activity.originalPrice || activity.price);
  
  let displayPrice = rawDisplayPrice;
  if (latestCounter) {
     if (isBid) {
       displayPrice = latestCounter.by === 'seller' ? calculateBuyerPays(latestCounter.price) : latestCounter.price;
     } else {
       displayPrice = latestCounter.by === 'buyer' ? calculateSellerGets(latestCounter.price) : latestCounter.price;
     }
  } else {
     // Initial bid/offer - show correct price based on role
     if (isBid) {
       displayPrice = activity.buyerOfferedPrice || activity.originalPrice || activity.price;
     } else {
       displayPrice = activity.sellerReceivesPrice || activity.originalPrice || activity.price;
     }
  }

  const statusConfig = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
    accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Accepted' },
    pending_confirmation: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle, label: 'Confirm/Reject' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
    rejected_by_seller: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected by Seller' },
    countered: { bg: 'bg-purple-100', text: 'text-purple-700', icon: RotateCcw, label: 'Negotiating' },
    expired: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: 'Expired' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Completed' },
    confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: ShieldCheck, label: 'Confirmed' },
    sold: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Sold' },
    pending_seller_confirmation: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Waiting Seller' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: XCircle, label: 'Cancelled' },
  };
  
  const status = statusConfig[activity.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
      isActionable 
        ? 'border-l-4 border-l-amber-500 border-y-amber-200 border-r-amber-200 shadow-md ring-1 ring-amber-100' 
        : isExpired ? 'border-gray-200 opacity-75' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 border-b border-gray-100 ${
        isActionable ? 'bg-amber-50' : isExpired ? 'bg-gray-100' : 'bg-gray-50'
      }`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-gray-900 text-sm truncate">
              {activity.listing?.companyId?.scriptName || activity.listing?.companyId?.name || activity.listing?.companyName || 'Deleted Listing'}
            </h4>
            {isListingDeleted && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600">DELETED</span>
            )}
            {isActionable && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
                <AlertTriangle size={10} /> ACTION
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500">
            {isBid ? 'Seller' : 'Buyer'}: @{activity.listing?.owner?.username || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${status.bg} ${status.text}`}>
            <StatusIcon size={10} />
            {status.label}
          </span>
          {!isListingDeleted && (
            <button 
              onClick={onView}
              className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <Eye size={14} className="text-blue-600" />
            </button>
          )}
        </div>
      </div>

      {/* Action Banner (Only for Actionable Items) */}
      {isActionable && (
        <div className="bg-amber-50 px-3 py-3 border-b border-amber-100">
          <p className="text-xs font-bold text-amber-900 mb-2">
            New Counter Offer Received!
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={onAccept}
              disabled={actionLoading === activity._id}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1"
            >
              {actionLoading === activity._id ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Accept @ {formatCurrency(displayPrice)}
            </button>
            <button 
              onClick={onCounter}
              className="px-3 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
            >
              <RotateCcw size={14} />
            </button>
            <button 
              onClick={onReject}
              className="px-3 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
            >
              <XCircle size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Your Bid Info */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Your {isBid ? 'Bid' : 'Offer'}</p>
            <p className="text-xs font-bold text-green-700">
              {formatCurrency(isBid ? (activity.buyerOfferedPrice || activity.originalPrice || activity.price) : (activity.sellerReceivesPrice || activity.originalPrice || activity.price))}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Qty</p>
            <p className="text-xs font-bold text-gray-900">{activity.quantity}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Total</p>
            <p className="text-xs font-bold text-blue-700">
              {formatCurrency((isBid ? (activity.buyerOfferedPrice || activity.originalPrice || activity.price) : (activity.sellerReceivesPrice || activity.originalPrice || activity.price)) * activity.quantity)}
            </p>
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
                // Viewer perspective logic
                let rowPrice;
                if (isBid) {
                  rowPrice = isSellerCounter ? calculateBuyerPays(counter.price) : counter.price;
                } else {
                  rowPrice = !isSellerCounter ? calculateSellerGets(counter.price) : counter.price;
                }

                return (
                  <div key={idx} className={`p-2 rounded-lg border ${isSellerCounter ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold ${isSellerCounter ? 'text-orange-700' : 'text-blue-700'}`}>
                        {isSellerCounter 
                          ? `${isBid ? 'Seller' : 'Buyer'} Counter` 
                          : 'Your Counter'
                        }
                      </span>
                      <span className="text-[9px] text-gray-500">
                        Round {counter.round || (idx + 1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">
                        {formatCurrency(rowPrice)}
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        {counter.quantity} shares
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Verification Codes (Confirmed) */}
      {(activity.status === 'confirmed' || activity.status === 'sold') && activity.dealId && dealDetails[activity.dealId] && (
        <div className="px-3 py-3 bg-emerald-50 border-t border-emerald-100">
          <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            Deal Confirmed!
          </h5>
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-white rounded p-2 border border-blue-200 text-center">
              <div className="text-[8px] uppercase text-gray-500 font-bold">You</div>
              <div className="text-xs font-bold text-blue-700 font-mono">
                BUY-{dealDetails[activity.dealId].buyerVerificationCode}
              </div>
            </div>
            <div className="bg-white rounded p-2 border border-orange-200 text-center">
              <div className="text-[8px] uppercase text-gray-500 font-bold">Seller</div>
              <div className="text-xs font-bold text-orange-700 font-mono">
                SEL-{dealDetails[activity.dealId].sellerVerificationCode}
              </div>
            </div>
            <div className="bg-white rounded p-2 border border-purple-200 text-center">
              <div className="text-[8px] uppercase text-gray-500 font-bold">Admin</div>
              <div className="text-xs font-bold text-purple-700 font-mono">
                ADM-{dealDetails[activity.dealId].rmVerificationCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Footer */}
      {!isActionable && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-[10px] text-gray-500">
            {timeAgo(activity.createdAt)}
          </p>
          {(activity.status === 'accepted' || activity.status === 'pending_confirmation') && (
            <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
              <AlertTriangle size={12} />
              {activity.status === 'pending_confirmation' ? 'Waiting for confirmation' : 'Deal Accepted!'}
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
        </div>
      )}
    </div>
  );
};

export default BidsPage;
