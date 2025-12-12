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
  ArrowRight
} from 'lucide-react';
import { portfolioAPI, listingsAPI } from '../../utils/api';
import { formatCurrency, formatPercentage, timeAgo, haptic, storage } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useLoader } from '../../context/LoaderContext';
import CreateListingModal from '../../components/modals/CreateListingModal';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      // Verify token exists before making API calls
      const token = storage.get('token');
      if (!token) {
        console.error('❌ No token found, skipping data fetch');
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      setLoading(true);
      showLoader(); // PBPartners style loader
      
      console.log('📡 Starting API calls with token:', token.substring(0, 20) + '...');
      
      // Fetch basic stats and holdings first
      const [statsRes, holdingsRes, activitiesRes, myListingsRes] = await Promise.all([
        portfolioAPI.getStats(),
        portfolioAPI.getHoldings(),
        portfolioAPI.getActivities({ limit: 5 }),
        listingsAPI.getMyListings({ status: 'active' }),
      ]);

      console.log('✅ API responses received');

      // Get active listings count from my listings
      const myActiveListings = myListingsRes.data.data || [];
      const activeListingsCount = myActiveListings.filter(l => l.status === 'active').length;

      setStats({
        ...(statsRes.data.data || {}),
        activeListings: activeListingsCount,
        completedTrades: statsRes.data.data?.totalTransactions || 0
      });
      setHoldings(holdingsRes.data.data || []);
      
      // Format activities for display - handle both data structures
      const rawActivities = activitiesRes.data?.data || activitiesRes.data || [];
      console.log('📊 Raw Activities Response:', activitiesRes.data);
      console.log('📊 Raw Activities Array:', rawActivities);
      console.log('📊 Activities Array Length:', rawActivities.length);
      
      const formattedActivities = Array.isArray(rawActivities) ? rawActivities.map(activity => {
        console.log('🔄 Processing activity:', activity);
        return {
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
        };
      }) : [];
      
      console.log('✅ Formatted Activities:', formattedActivities);
      console.log('✅ Setting activities state with length:', formattedActivities.length);
      setActivities(formattedActivities);

      // Fetch Action Items (Incoming Bids/Offers & Counter Offers) separately
      try {
        const [sellRes, buyRes, myBidsRes] = await Promise.all([
          listingsAPI.getMyListings({ type: 'sell' }),
          listingsAPI.getMyListings({ type: 'buy' }),
          listingsAPI.getMyPlacedBids()
        ]);

        console.log('📥 Action Items API responses received');

        const actions = [];

        // 1. Incoming Bids on my Sell Posts
        const sellListings = sellRes.data.data || [];
        sellListings.forEach(listing => {
          const bids = listing.bids || [];
          bids.forEach(bid => {
            if (bid.status === 'pending') {
              actions.push({
                type: 'bid_received',
                id: bid._id,
                listingId: listing._id,
                company: listing.companyName,
                logo: listing.companyId?.logo || listing.companyId?.Logo,
                price: bid.price,
                quantity: bid.quantity,
                user: bid.userId?.username,
                date: bid.createdAt,
                originalListing: listing
              });
            }
          });
        });

        // 2. Incoming Offers on my Buy Posts
        const buyListings = buyRes.data.data || [];
        buyListings.forEach(listing => {
          const offers = listing.offers || [];
          offers.forEach(offer => {
            if (offer.status === 'pending') {
              actions.push({
                type: 'offer_received',
                id: offer._id,
                listingId: listing._id,
                company: listing.companyName,
                logo: listing.companyId?.logo || listing.companyId?.Logo,
                price: offer.price,
                quantity: offer.quantity,
                user: offer.userId?.username,
                date: offer.createdAt,
                originalListing: listing
              });
            }
          });
        });

        // 3. Counter Offers on my Bids/Offers
        const myBids = myBidsRes.data.data || [];
        myBids.forEach(activity => {
          if (activity.status === 'countered' && activity.listing) {
            actions.push({
              type: 'counter_received',
              id: activity._id,
              listingId: activity.listing._id,
              company: activity.listing.companyName,
              logo: activity.listing.companyId?.logo || activity.listing.companyId?.Logo,
              price: activity.price, // Counter price
              quantity: activity.quantity,
              user: 'Seller', // Usually the owner
              date: activity.updatedAt,
              originalListing: activity.listing
            });
          }
        });

        // Sort by date (newest first) and set action items
        console.log('🎯 Action Items Count:', actions.length);
        setActionItems(actions.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (actionError) {
        console.error('Failed to fetch action items:', actionError);
        // Don't fail the entire fetch if action items fail
        setActionItems([]);
      }

    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // If it's a 401, token might be invalid
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        storage.remove('token');
        storage.remove('user');
        navigate('/login');
      } else {
        toast.error('Failed to load dashboard data');
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
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-slate-200"
            >
              <Bell className="w-5 h-5 text-gray-600" />
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

        {/* Portfolio Value Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/50 border border-slate-200">
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
      <div className="px-5 -mt-4">
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
      <div className="px-5 mt-6">
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
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">My Activity</h3>
          <button 
            onClick={() => navigate('/my-posts')}
            className="text-blue-600 text-sm font-semibold flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/my-posts')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">My Posts</p>
          </button>
          
          <button
            onClick={() => navigate('/bids')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">My Bids</p>
          </button>
          
          <button
            onClick={() => navigate('/offers')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">Received</p>
          </button>
        </div>
      </div>

      {/* Action Center (Replaces Holdings) */}
      {actionItems.length > 0 ? (
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">Action Center</h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {actionItems.length} New
            </span>
          </div>
          <div className="space-y-2">
            {actionItems.map((item, index) => (
              <div 
                key={index} 
                onClick={() => navigate((item.type === 'counter_received') ? '/bids' : '/my-posts')}
                className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center justify-between active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === 'bid_received' ? 'bg-blue-50 text-blue-600' :
                    item.type === 'offer_received' ? 'bg-green-50 text-green-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {item.type === 'bid_received' ? <TrendingDown size={18} /> :
                     item.type === 'offer_received' ? <TrendingUp size={18} /> :
                     <Activity size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {item.type === 'counter_received' ? 'Counter Offer' : 
                       item.type === 'bid_received' ? 'Bid Received' : 'Offer Received'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      <span className="font-medium text-gray-700">{item.company}</span> • {item.quantity} @ {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-2">
                   <button className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm">
                     View
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recent Activity */}
      <div className="px-5 mt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
          {activities.length > 0 && (
            <button 
              onClick={() => navigate('/activity')}
              className="text-blue-600 text-sm font-semibold flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {activities.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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

      {/* Empty State */}
      {holdings.length === 0 && activities.length === 0 && (
        <div className="px-5 mt-8 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Activity Yet</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Start trading to see your portfolio and activity here
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-200/50 inline-flex items-center gap-2"
            >
              Browse Marketplace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      <CreateListingModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          navigate('/marketplace');
        }}
      />
    </div>
  );
};

export default HomePage;
