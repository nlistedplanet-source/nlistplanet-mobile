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
import { portfolioAPI } from '../../utils/api';
import { formatCurrency, formatPercentage, timeAgo, haptic } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import CreateListingModal from '../../components/modals/CreateListingModal';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, holdingsRes, activitiesRes] = await Promise.all([
        portfolioAPI.getStats(),
        portfolioAPI.getHoldings(),
        portfolioAPI.getActivities({ limit: 5 }),
      ]);

      setStats(statsRes.data.data || {});
      setHoldings(holdingsRes.data.data || []);
      setActivities(activitiesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
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
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 px-5 pt-safe pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
              <span className="text-white font-bold text-lg">{getInitials(user?.fullName || user?.username)}</span>
            </div>
            <div>
              <p className="text-amber-700 text-xs font-medium">Welcome back,</p>
              <h1 className="text-gray-900 text-xl font-bold">{user?.fullName || user?.username}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-amber-100"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm border border-amber-100"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Portfolio Value Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xl shadow-amber-100/50 border border-amber-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-amber-600" />
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
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                <p className="text-xs text-gray-500 font-medium">Active Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50">
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
            className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 text-white rounded-2xl p-4 shadow-lg shadow-amber-200/50 active:scale-95 transition-transform"
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
            className="bg-white text-gray-900 rounded-2xl p-4 shadow-sm border border-amber-100 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-amber-600" />
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
            className="text-amber-600 text-sm font-semibold flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/my-posts')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50 text-center"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">My Posts</p>
          </button>
          
          <button
            onClick={() => navigate('/bids')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50 text-center"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">My Bids</p>
          </button>
          
          <button
            onClick={() => navigate('/offers')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50 text-center"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900">Received</p>
          </button>
        </div>
      </div>

      {/* Recent Holdings */}
      {holdings.length > 0 && (
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">Top Holdings</h3>
            <button 
              onClick={() => navigate('/portfolio')}
              className="text-amber-600 text-sm font-semibold flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {holdings.slice(0, 3).map((holding, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-700">
                        {holding.company?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{holding.company}</p>
                      <p className="text-sm text-gray-400">{holding.quantity} shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(holding.totalValue)}
                    </p>
                    <p className={`text-sm font-medium ${
                      holding.gainPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(holding.gainPercent)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="px-5 mt-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
            <button 
              onClick={() => navigate('/activity')}
              className="text-amber-600 text-sm font-semibold flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-amber-50 overflow-hidden">
            {activities.map((activity, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-4 ${index !== activities.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(activity.createdAt)}</p>
                </div>
                {activity.amount && (
                  <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                    {formatCurrency(activity.amount)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {holdings.length === 0 && activities.length === 0 && (
        <div className="px-5 mt-8 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-50">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Activity Yet</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Start trading to see your portfolio and activity here
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-amber-200/50 inline-flex items-center gap-2"
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
