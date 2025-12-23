import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Activity,
  Plus,
  Eye,
  RefreshCw,
  ArrowUpRight,
  Wallet,
  BarChart3,
  Bell,
  ChevronRight,
  Sparkles,
  Target,
  PieChart,
  ArrowRight,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { portfolioAPI, listingsAPI } from '../../utils/api';
import { formatCurrency, formatPercentage, timeAgo, haptic, storage, calculateBuyerPays, calculateSellerGets, getNetPriceForUser } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useLoader } from '../../context/LoaderContext';
import CreateListingModal from '../../components/modals/CreateListingModal';
import VerificationCodesModal from '../../components/modals/VerificationCodesModal';
import AdBanner from '../../components/common/AdBanner';
import { useDashboardTour } from '../../components/TourGuide';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, unreadCount } = useAuth();
  useDashboardTour();
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationDeal, setVerificationDeal] = useState(null);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalGain: 0,
    gainPercentage: 0,
    activeListings: 0,
    completedTrades: 0,
  });
  const [holdings, setHoldings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [myBidsCount, setMyBidsCount] = useState(0);
  const [myPostsCount, setMyPostsCount] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [confirmedDeals, setConfirmedDeals] = useState([]);
  const [visibleCodes, setVisibleCodes] = useState({});

  // Fetch data when auth is ready and user is authenticated
  useEffect(() => {
    const fetchDataIfReady = () => {
      const token = storage.get('token');
      
      // Only fetch if we have both user context AND token in storage
      if (!authLoading && user && token) {
        console.log('🚀 Fetching dashboard data - Auth ready, User:', user.username, 'Token exists:', !!token);
        fetchData();
      } else {
        console.log('⏳ Waiting for auth - AuthLoading:', authLoading, 'User:', !!user, 'Token:', !!token);
        
        // If auth is ready but no token, retry after a short delay
        if (!authLoading && user && !token) {
          console.log('🔄 Retrying token check in 200ms...');
          setTimeout(fetchDataIfReady, 200);
        }
      }
    };
    
    fetchDataIfReady();
  }, [authLoading, user]); // Wait for auth to initialize, then fetch when user is available

  const fetchData = async () => {
    try {
      const token = storage.get('token');
      const rawToken = localStorage.getItem('token');
      
      console.log('🔐 fetchData - Raw token from localStorage:', rawToken);
      console.log('🔐 fetchData - Parsed token:', token);
      
      if (!token) {
        console.error('❌ No token found');
        setLoading(false);
        hideLoader();
        return;
      }

      setLoading(true);
      showLoader();
      
      console.log('📡 Fetching dashboard data...');
      
      // Step 1: Fetch basic stats and portfolio data
      try {
        const [statsRes, holdingsRes] = await Promise.all([
          portfolioAPI.getStats().catch(err => { console.error('Stats API failed:', err); return { data: { data: {} } }; }),
          portfolioAPI.getHoldings().catch(err => { console.error('Holdings API failed:', err); return { data: { data: [] } }; }),
        ]);

        const myActiveListings = holdingsRes.data.data || [];
        
        setStats({
          ...(statsRes.data.data || {}),
          activeListings: myActiveListings.length,
          completedTrades: statsRes.data.data?.totalTransactions || 0
        });
        setHoldings(myActiveListings);
        
        console.log('✅ Stats and holdings loaded');
      } catch (err) {
        console.error('Failed to load stats/holdings:', err);
      }

      // Step 2: Fetch Recent Activities
      try {
        const activitiesRes = await portfolioAPI.getActivities({ limit: 5 });
        const rawActivities = activitiesRes.data?.data || [];
        
        const formattedActivities = rawActivities.map(activity => ({
          type: activity.type,
          action: activity.action,
          title: activity.type === 'listing'
            ? (activity.action === 'listed_sell' ? '📦 Listed for Sale' : '🛒 Created Buy Order')
            : activity.type === 'transaction' 
            ? `${activity.action === 'buy' ? '✅ Bought' : '✅ Sold'}`
            : activity.type === 'bid'
            ? '💰 Placed Bid'
            : '🏷️ Placed Offer',
          subtitle: `${activity.companyName} • ${activity.quantity} shares @ ₹${activity.price?.toLocaleString('en-IN')}`,
          price: activity.price,
          createdAt: activity.date,
          companyName: activity.companyName,
          quantity: activity.quantity
        }));
        
        setActivities(formattedActivities);
        console.log('✅ Activities loaded:', formattedActivities.length);
      } catch (err) {
        console.error('Failed to load activities:', err);
        setActivities([]);
      }

      // Step 2.5: Fetch Confirmed Deals (for code display)
      try {
        const dealsRes = await listingsAPI.getCompletedDeals();
        console.log('📊 All completed deals:', dealsRes.data.data);
        const confirmedOnly = (dealsRes.data.data || []).filter(deal => 
          deal.status === 'confirmed' || deal.status === 'pending_rm_contact' || deal.status === 'rm_contacted'
        );
        console.log('✅ Confirmed deals filtered:', confirmedOnly);
        setConfirmedDeals(confirmedOnly.slice(0, 3)); // Show top 3
        console.log('🎯 Showing top 3 deals:', confirmedOnly.slice(0, 3));
      } catch (error) {
        console.error('❌ Failed to fetch confirmed deals:', error);
      }

      // Step 3: Fetch Action Items and Counts
      try {
        console.log('📡 Fetching my listings and bids...');
        const [sellRes, buyRes, myBidsRes] = await Promise.all([
          listingsAPI.getMyListings({ type: 'sell' }).catch(err => { console.error('Sell listings failed:', err); return { data: { data: [] } }; }),
          listingsAPI.getMyListings({ type: 'buy' }).catch(err => { console.error('Buy listings failed:', err); return { data: { data: [] } }; }),
          listingsAPI.getMyPlacedBids().catch(err => { console.error('My bids failed:', err); return { data: { data: [] } }; })
        ]);

        const myBids = myBidsRes.data.data || [];
        const sellListings = sellRes.data.data || [];
        const buyListings = buyRes.data.data || [];
        
        // Set counts for activity cards
        const bidsCount = myBids.length;
        const postsCount = sellListings.length + buyListings.length;
        const referrals = user?.referralCount || 0;
        
        setMyBidsCount(bidsCount);
        setMyPostsCount(postsCount);
        setReferralCount(referrals);
        
        console.log('✅ Counts updated - Posts:', postsCount, 'Bids:', bidsCount, 'Referrals:', referrals);

        const actions = [];

        // Incoming Bids on my Sell Posts
        sellListings.forEach(listing => {
          (listing.bids || []).forEach(bid => {
            // Use universal helper for display price
            const displayPrice = getNetPriceForUser(bid, 'sell', true);
            
            if (bid.status === 'pending') {
              actions.push({
                type: 'bid_received',
                id: bid._id,
                listingId: listing._id,
                company: listing.companyName,
                companySymbol: listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyId?.symbol || listing.companyName,
                logo: listing.companyId?.logo || listing.companyId?.Logo,
                yourPrice: listing.price,
                counterPrice: displayPrice,
                quantity: bid.quantity,
                user: bid.userId?.username || bid.username,
                date: bid.createdAt,
                status: bid.status
              });
            } else if (bid.status === 'accepted' || bid.status === 'pending_confirmation') {
              // High priority: Deal accepted by one party, waiting for other
              actions.push({
                type: 'deal_accepted',
                id: bid._id,
                listingId: listing._id,
                company: listing.companyName,
                companySymbol: listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyId?.symbol || listing.companyName,
                logo: listing.companyId?.logo || listing.companyId?.Logo,
                yourPrice: listing.price,
                counterPrice: displayPrice,
                quantity: bid.quantity,
                user: bid.userId?.username,
                date: bid.createdAt,
                status: bid.status,
                priority: 'high',
                buyerAcceptedAt: bid.buyerAcceptedAt,
                sellerAcceptedAt: bid.sellerAcceptedAt
              });
            }
          });
        });

        // Incoming Offers on my Buy Posts
        buyListings.forEach(listing => {
          (listing.offers || []).forEach(offer => {
            // Use universal helper for display price
            const displayPrice = getNetPriceForUser(offer, 'buy', true);
            
            if (offer.status === 'pending') {
              actions.push({
                type: 'offer_received',
                id: offer._id,
                listingId: listing._id,
                company: listing.companyName,
                companySymbol: listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyId?.symbol || listing.companyName,
                logo: listing.companyId?.logo || listing.companyId?.Logo,
                yourPrice: listing.price,
                counterPrice: displayPrice,
                quantity: offer.quantity,
                user: offer.userId?.username,
                date: offer.createdAt,
                status: offer.status
              });
            } else if (offer.status === 'accepted') {
              // High priority: Deal accepted by one party, waiting for other
              actions.push({
                type: 'deal_accepted',
                id: offer._id,
                listingId: listing._id,
                company: listing.companyName,
                companySymbol: listing.companyId?.scriptName || listing.companyId?.ScripName || listing.companyId?.symbol || listing.companyName,
                logo: listing.companyId?.logo || listing.companyId?.Logo,
                yourPrice: listing.price,
                counterPrice: displayPrice,
                quantity: offer.quantity,
                user: offer.userId?.username,
                date: offer.createdAt,
                status: offer.status,
                priority: 'high',
                buyerAcceptedAt: offer.buyerAcceptedAt,
                sellerAcceptedAt: offer.sellerAcceptedAt
              });
            }
          });
        });

        // Counter Offers on my Bids
        myBids.forEach(activity => {
          if (activity.status === 'countered') {
            const counterHistory = activity.counterHistory || [];
            const latestCounter = counterHistory[counterHistory.length - 1];
            const isBuyer = activity.type === 'bid';
            
            const rawListingPrice = activity.listing.listingPrice || activity.listing.price;
            const listPrice = isBuyer 
              ? calculateBuyerPays(rawListingPrice)
              : calculateSellerGets(rawListingPrice);

            // Use universal helper for the counter received
            const otherPrice = getNetPriceForUser(activity, activity.type === 'bid' ? 'sell' : 'buy', false, latestCounter?.by);

            actions.push({
              type: 'counter_received',
              id: activity._id,
              listingId: activity.listing._id,
              company: activity.listing.companyName,
              companySymbol: activity.listing.companyId?.scriptName || activity.listing.companyId?.ScripName || activity.listing.companyId?.symbol || activity.listing.companyName,
              logo: activity.listing.companyId?.logo || activity.listing.companyId?.Logo,
              yourPrice: activity.originalPrice || activity.price,
              counterPrice: otherPrice,
              quantity: activity.quantity,
              user: activity.listing.userId?.username || 'Seller',
              date: activity.createdAt,
              isBuyer: isBuyer
            });
          }
        });

        // Sort: high priority (deal_accepted) first, then by date
        const sortedActions = actions.sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1;
          if (a.priority !== 'high' && b.priority === 'high') return 1;
          return new Date(b.date) - new Date(a.date);
        });
        setActionItems(sortedActions);
        console.log('✅ Action items loaded:', actions.length, '(High priority:', actions.filter(a => a.priority === 'high').length + ')');
      } catch (err) {
        console.error('Failed to load action items:', err);
        setActionItems([]);
      }

    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        storage.remove('token');
        storage.remove('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    showLoader(); // PBPartners style loader
    await fetchData();
    setRefreshing(false);
    haptic.success();
  };

  // Action Center handlers
  const handleAcceptAction = async (item) => {
    try {
      const response = await listingsAPI.acceptBid(item.listingId, item.id);
      const status = response.data.status;
      
      if (status === 'confirmed') {
        // Both parties accepted → Deal confirmed
        toast.success('Deal confirmed! 🎉');
        haptic.success();
        
        // Show verification codes modal
        if (response.data.deal) {
          setVerificationDeal(response.data.deal);
          setShowVerificationModal(true);
        }
      } else if (status === 'accepted') {
        // First acceptance → Waiting for other party
        toast.success('Accepted! Waiting for other party to confirm. ⏳');
        haptic.success();
        await fetchData();
      } else {
        // Default success
        toast.success(response.data.message || 'Accepted successfully! 🎉');
        haptic.success();
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to accept:', error);
      toast.error(error.response?.data?.message || 'Failed to accept. Please try again.');
      haptic.error();
    }
  };

  const handleRejectAction = async (item) => {
    try {
      await listingsAPI.rejectBid(item.listingId, item.id);
      toast.success('Bid/Offer rejected');
      haptic.success();
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error(error.response?.data?.message || 'Failed to reject. Please try again.');
      haptic.error();
    }
  };

  const handleCounterAction = (item) => {
    // Navigate to the appropriate page where user can counter
    haptic.light();
    if (item.type === 'counter_received') {
      navigate('/bids');
    } else {
      navigate('/my-posts');
    }
    toast.info('Please counter the offer in the detailed view');
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-100 via-gray-50 to-slate-50 px-5 pt-safe pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-lg">{getInitials(user?.fullName || user?.username)}</span>
            </div>
            <div>
              <p className="text-slate-700 text-xs font-medium">Welcome back,</p>
              <h1 className="text-gray-900 text-xl font-bold">{user?.fullName || user?.username}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-slate-200 relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white animate-scale-in">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-slate-200"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mb-6">
          <AdBanner position="dashboard_top" className="h-24" />
        </div>

        {/* Portfolio Value Card */}
        <div id="mobile-portfolio-card" className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Total Portfolio Value</p>
            </div>
            <button className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(stats.totalValue)}
          </h2>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              stats.gainPercentage >= 0 ? 'bg-emerald-50' : 'bg-red-50'
            }`}>
              {stats.gainPercentage >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${
                stats.gainPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {formatPercentage(stats.gainPercentage)}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              {stats.totalGain >= 0 ? '+' : ''}{formatCurrency(stats.totalGain)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div id="mobile-quick-stats" className="px-5 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                <p className="text-xs text-gray-500 font-medium">Active Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTrades}</p>
                <p className="text-xs text-gray-500 font-medium">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div id="mobile-quick-actions" className="px-5 mt-6">
        <h3 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              haptic.medium();
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white rounded-2xl p-4 shadow-lg shadow-blue-200/50 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm text-left">Create Post</p>
            <p className="text-xs text-white/70 text-left">List your shares</p>
          </button>

          <button
            onClick={() => {
              haptic.light();
              navigate('/marketplace');
            }}
            className="bg-white text-gray-900 rounded-2xl p-4 shadow-sm border border-slate-200 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-semibold text-sm text-left">Browse Market</p>
            <p className="text-xs text-gray-400 text-left">Find opportunities</p>
          </button>
        </div>
      </div>

      {/* My Activity Section */}
      <div id="mobile-activity-grid" className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">My Activity</h3>
          <button 
            onClick={() => navigate('/my-posts')}
            className="text-blue-600 text-sm font-semibold flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => navigate('/my-posts')}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <img src="/Post_icon.png" alt="My Posts" className="w-6 h-6 object-contain" />
            </div>
            <p className="text-lg font-bold text-gray-900">{myPostsCount}</p>
            <p className="text-[10px] font-medium text-gray-600 mt-0.5">My Posts</p>
          </button>
          
          <button
            onClick={() => navigate('/bids')}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <img src="/Bids.png" alt="My Bids" className="w-6 h-6 object-contain" />
            </div>
            <p className="text-lg font-bold text-gray-900">{myBidsCount}</p>
            <p className="text-[10px] font-medium text-gray-600 mt-0.5">My Bids</p>
          </button>
          
          <button
            onClick={() => navigate('/my-posts')}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{actionItems.length}</p>
            <p className="text-[10px] font-medium text-gray-600 mt-0.5">Pending</p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{referralCount}</p>
            <p className="text-[10px] font-medium text-gray-600 mt-0.5">Referral</p>
          </button>
        </div>
      </div>

      {/* Pending Actions Notification */}
      {actionItems.length > 0 && (
        <div className="px-5 mt-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {actionItems.length} Pending Action{actionItems.length > 1 ? 's' : ''}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  You have {actionItems.length} bid{actionItems.length > 1 ? 's' : ''}/offer{actionItems.length > 1 ? 's' : ''} waiting for your response.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      haptic.light();
                      navigate('/my-posts');
                    }}
                    className="bg-orange-500 text-white px-3 py-2 rounded-lg font-semibold text-xs flex-1"
                  >
                    View Posts
                  </button>
                  <button
                    onClick={() => {
                      haptic.light();
                      navigate('/bids');
                    }}
                    className="bg-white text-orange-600 px-3 py-2 rounded-lg font-semibold text-xs flex-1 border border-orange-300"
                  >
                    View Bids
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High Priority Notification Banner */}
      {actionItems.some(item => item.priority === 'high') && (
        <div className="px-5 mt-6">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-base">🎉 Deal Accepted!</h3>
                <p className="text-sm text-emerald-50 mt-0.5">
                  You have {actionItems.filter(a => a.priority === 'high').length} mutually accepted {actionItems.filter(a => a.priority === 'high').length === 1 ? 'deal' : 'deals'} waiting for confirmation
                </p>
              </div>
              <button 
                onClick={() => {
                  haptic.light();
                  const firstHighPriority = document.querySelector('[data-priority="high"]');
                  if (firstHighPriority) {
                    firstHighPriority.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Deals Section - Mobile */}
      {confirmedDeals.length > 0 && (
        <div className="px-5 mt-6">
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-md border-2 border-green-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white" size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Confirmed Deals
                    <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {confirmedDeals.length}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-600">Your verification codes</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {confirmedDeals.map((deal) => {
                // Properly compare ObjectIds as strings
                const userIdStr = user._id?.toString() || user._id;
                const sellerIdStr = deal.sellerId?._id?.toString() || deal.sellerId?.toString() || deal.sellerId;
                const buyerIdStr = deal.buyerId?._id?.toString() || deal.buyerId?.toString() || deal.buyerId;
                
                const isSeller = sellerIdStr === userIdStr;
                const isBuyer = buyerIdStr === userIdStr;
                
                const myCode = isSeller ? deal.sellerVerificationCode : deal.buyerVerificationCode;
                const otherPartyCode = isSeller ? deal.buyerVerificationCode : deal.sellerVerificationCode;
                const otherPartyName = isSeller 
                  ? (deal.buyerId?.username || deal.buyerName || deal.buyerUsername) 
                  : (deal.sellerId?.username || deal.sellerName || deal.sellerUsername);

                return (
                  <div key={deal._id} className="bg-white rounded-xl border-2 border-green-300 p-2.5 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs">{deal.companyName}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {deal.quantity} shares @ ₹{isSeller ? deal.sellerReceivesPerShare : deal.buyerPaysPerShare}
                        </p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-lg text-xs font-bold ${
                        isSeller ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isSeller ? 'SELL' : 'BUY'}
                      </span>
                    </div>

                    {/* My Code */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2 mb-2">
                      <p className="text-xs text-green-700 font-semibold mb-1">Your Code:</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-lg font-bold text-green-700 tracking-widest flex-1">
                          {visibleCodes[deal._id] ? myCode : '••••••'}
                        </p>
                        <button
                          onClick={() => {
                            setVisibleCodes(prev => ({ ...prev, [deal._id]: !prev[deal._id] }));
                            haptic('light');
                          }}
                          className="p-1.5 hover:bg-green-100 rounded transition-colors"
                        >
                          <Eye className={`w-5 h-5 text-green-600 ${visibleCodes[deal._id] ? 'fill-green-600' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Other Party Info */}
                    <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-200">
                      <p className="text-xs text-gray-600">
                        {isSeller ? 'Buyer' : 'Seller'}: <span className="font-semibold text-gray-900">@{otherPartyName}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Their Code: <span className="font-mono font-bold text-gray-700">{otherPartyCode}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/confirmation-codes')}
              className="mt-2 w-full px-3 py-1.5 bg-white border-2 border-green-600 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-50 transition-all flex items-center justify-center gap-2"
            >
              View All Codes
              <ArrowRight size={14} />
            </button>

            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-900">
                <span className="font-bold">ℹ️ Important:</span> Share your verification code only with our official RM during the confirmation call.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Center */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Action Center</h3>
            {actionItems.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                {actionItems.length}
              </span>
            )}
          </div>
          {actionItems.length > 0 && (
            <button 
              onClick={() => navigate('/my-posts')}
              className="text-blue-600 text-sm font-semibold"
            >
              View All
            </button>
          )}
        </div>
        
        {actionItems.length > 0 ? (
          <div className="space-y-3">
            {actionItems.map((item) => (
              <div 
                key={item.id}
                data-priority={item.priority === 'high' ? 'high' : undefined}
                className={`rounded-xl shadow-sm border overflow-hidden ${
                  item.priority === 'high' 
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300' 
                    : 'bg-white border-slate-200'
                }`}
              >
                {item.priority === 'high' ? (
                  // High Priority: Deal Accepted Card
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-white" />
                        <div>
                          <h4 className="text-sm font-bold text-white">🎉 Deal Accepted!</h4>
                          <p className="text-xs text-emerald-50">Both parties agreed - Confirm to finalize</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Deal Details */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {item.logo ? (
                          <img src={item.logo} alt={item.company} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{item.companySymbol}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-emerald-200">
                          <p className="text-xs text-gray-600 mb-1">Your Price</p>
                          <p className="text-sm font-bold text-purple-600">{formatCurrency(item.yourPrice)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-emerald-200">
                          <p className="text-xs text-gray-600 mb-1">Agreed Price</p>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(item.counterPrice)}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAcceptAction(item)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Confirm Deal
                        </button>
                        <button 
                          onClick={() => {
                            haptic.light();
                            navigate('/bids');
                          }}
                          className="bg-white text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm border border-gray-300 flex items-center justify-center"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center">{timeAgo(item.date)}</p>
                    </div>
                  </>
                ) : (
                  // Regular Pending Action Card
                  <>
                    {/* Header */}
                    <div className="grid grid-cols-5 bg-slate-50 border-b border-slate-200">
                      <div className="text-[9px] font-bold text-gray-500 uppercase py-2 px-1 text-center border-r border-slate-200">Type</div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase py-2 px-1 text-center border-r border-slate-200">Company</div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase py-2 px-1 text-center border-r border-slate-200">Your Bid</div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase py-2 px-1 text-center border-r border-slate-200">
                        {item.type === 'counter_received' 
                          ? (item.isBuyer ? 'Seller' : 'Buyer')
                          : (item.type === 'bid_received' ? 'Buyer' : 'Seller')}
                      </div>
                      <div className="text-[9px] font-bold text-gray-500 uppercase py-2 px-1 text-center">Actions</div>
                    </div>
                    
                    {/* Data */}
                    <div className="grid grid-cols-5 items-stretch">
                      {/* Type */}
                      <div className="p-2 border-r border-slate-200 flex flex-col justify-center items-center text-center">
                        <p className="text-[10px] font-bold text-gray-900">
                          {item.type === 'counter_received' ? 'Counter' : 
                           item.type === 'bid_received' ? 'Bid In' : 'Offer In'}
                        </p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{timeAgo(item.date)}</p>
                      </div>
                      
                      {/* Company (No Logo) */}
                      <div className="p-2 border-r border-slate-200 flex flex-col justify-center items-center text-center min-w-0">
                        <p className="text-[10px] font-bold text-gray-900 truncate w-full">{item.companySymbol}</p>
                        <p className="text-[8px] text-gray-500 mt-0.5">Qty: {item.quantity?.toLocaleString('en-IN')}</p>
                      </div>
                      
                      {/* Your Bid */}
                      <div className="p-2 border-r border-slate-200 flex items-center justify-center">
                        <p className="text-[10px] font-bold text-purple-600">{formatCurrency(item.yourPrice)}</p>
                      </div>
                      
                      {/* Seller/Buyer Price */}
                      <div className="p-2 border-r border-slate-200 flex items-center justify-center">
                        <p className="text-[10px] font-bold text-blue-600">{formatCurrency(item.counterPrice)}</p>
                      </div>
                      
                      {/* Actions (2x2 Grid) */}
                      <div className="p-1.5 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-1 w-full">
                          <button 
                            onClick={() => handleAcceptAction(item)}
                            className="bg-green-100 text-green-700 p-1 rounded flex items-center justify-center"
                          >
                            <CheckCircle size={12} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleRejectAction(item)}
                            className="bg-red-100 text-red-700 p-1 rounded flex items-center justify-center"
                          >
                            <XCircle size={12} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleCounterAction(item)}
                            className="bg-orange-100 text-orange-700 p-1 rounded flex items-center justify-center"
                          >
                            <RotateCcw size={12} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => {
                              haptic.light();
                              navigate(item.type === 'counter_received' ? '/bids' : '/my-posts');
                            }}
                            className="bg-gray-100 text-gray-700 p-1 rounded flex items-center justify-center"
                          >
                            <Eye size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">All Caught Up!</p>
            <p className="text-xs text-gray-500 mt-1">No pending actions</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="px-5 mt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
          {activities.length > 0 && (
            <button 
              onClick={() => navigate('/activity')}
              className="text-blue-600 text-sm font-semibold"
            >
              View All
            </button>
          )}
        </div>
        
        {activities.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {activities.map((activity, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-4 ${index !== activities.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'listing' 
                    ? 'bg-purple-100'
                    : activity.action === 'buy' 
                    ? 'bg-green-100' 
                    : activity.action === 'sell'
                    ? 'bg-red-100'
                    : activity.type === 'bid'
                    ? 'bg-blue-100'
                    : 'bg-orange-100'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    activity.type === 'listing' 
                      ? 'text-purple-600'
                      : activity.action === 'buy' 
                      ? 'text-green-600' 
                      : activity.action === 'sell'
                      ? 'text-red-600'
                      : activity.type === 'bid'
                      ? 'text-blue-600'
                      : 'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{activity.subtitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No Recent Activity</p>
            <p className="text-xs text-gray-500">Your trading activity will appear here</p>
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          navigate('/marketplace');
        }}
      />

      {/* Verification Codes Modal */}
      <VerificationCodesModal 
        isOpen={showVerificationModal}
        deal={verificationDeal}
        onClose={() => {
          setShowVerificationModal(false);
          setVerificationDeal(null);
          fetchData(); // Refresh data to remove item from action center
        }}
      />
    </div>
  );
};

export default HomePage;
