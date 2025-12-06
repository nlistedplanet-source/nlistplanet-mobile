import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  RefreshCw,
  Briefcase,
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { portfolioAPI } from '../../utils/api';
import { formatCurrency, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PortfolioPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalGain: 0,
    gainPercentage: 0
  });
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const [statsRes, holdingsRes] = await Promise.all([
        portfolioAPI.getStats(),
        portfolioAPI.getHoldings()
      ]);
      setStats(statsRes.data.data || {
        totalValue: 0,
        totalInvested: 0,
        totalGain: 0,
        gainPercentage: 0
      });
      setHoldings(holdingsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      // Set demo data for now
      setStats({
        totalValue: 0,
        totalInvested: 0,
        totalGain: 0,
        gainPercentage: 0
      });
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchPortfolioData();
    setRefreshing(false);
    haptic.success();
  };

  if (loading) {
    return null;
  }

  const isPositive = stats.totalGain >= 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-100 to-gray-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
        <div className="px-6 pt-safe pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  haptic.light();
                  navigate(-1);
                }}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
                <p className="text-sm text-gray-500">Your investments</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
            >
              <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Value Card */}
      <div className="px-6 pt-6">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Portfolio Value</p>
              <h2 className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/70 text-xs mb-1">Invested</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.totalInvested)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-300" />
                )}
                <p className="text-white/70 text-xs">Returns</p>
              </div>
              <p className={`text-lg font-semibold ${isPositive ? 'text-emerald-300' : 'text-red-300'}`}>
                {isPositive ? '+' : ''}{formatCurrency(stats.totalGain)}
                <span className="text-xs ml-1">({stats.gainPercentage?.toFixed(2) || 0}%)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Section */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Your Holdings</h3>
          <div className="flex items-center gap-1 text-primary-600">
            <PieChart className="w-4 h-4" />
            <span className="text-sm font-medium">{holdings.length} stocks</span>
          </div>
        </div>

        {holdings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-mobile">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Holdings Yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Start building your portfolio by trading on the marketplace
            </p>
            <button
              onClick={() => {
                haptic.medium();
                navigate('/marketplace');
              }}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((holding, index) => (
              <HoldingCard key={index} holding={holding} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              haptic.light();
              navigate('/marketplace');
            }}
            className="bg-white rounded-2xl p-4 shadow-mobile text-left"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900">Buy Shares</p>
            <p className="text-xs text-gray-500 mt-1">Browse marketplace</p>
          </button>
          <button
            onClick={() => {
              haptic.light();
              navigate('/my-posts');
            }}
            className="bg-white rounded-2xl p-4 shadow-mobile text-left"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Sell Shares</p>
            <p className="text-xs text-gray-500 mt-1">Manage your posts</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Holding Card Component
const HoldingCard = ({ holding }) => {
  const isPositive = (holding.gain || 0) >= 0;
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-mobile">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {holding.logo ? (
            <img src={holding.logo} alt={holding.companyName} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-lg font-bold text-gray-600">
              {holding.companyName?.charAt(0) || 'N'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{holding.companyName}</h4>
          <p className="text-sm text-gray-500">{holding.quantity} shares</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatCurrency(holding.currentValue)}</p>
          <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{holding.gainPercentage?.toFixed(2) || 0}%
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </div>
  );
};

export default PortfolioPage;
