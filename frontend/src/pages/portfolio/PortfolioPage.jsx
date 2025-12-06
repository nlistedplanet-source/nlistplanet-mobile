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
  Wallet,
  X,
  Search,
  Loader
} from 'lucide-react';
import { companiesAPI } from '../../utils/api';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ companyName: '', quantity: '', buyPrice: '', companyId: null });
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Search companies for manual add
  useEffect(() => {
    const searchCompanies = async () => {
      if (searchTerm.length < 2) {
        setCompanies([]);
        return;
      }
      setSearching(true);
      try {
        const response = await companiesAPI.search(searchTerm);
        setCompanies(response.data.data || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    };
    const debounce = setTimeout(searchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleCompanySelect = (company) => {
    setAddForm(prev => ({
      ...prev,
      companyName: company.CompanyName || company.name || company.ScriptName,
      companyId: company._id
    }));
    setSearchTerm('');
    setCompanies([]);
  };

  const handleAddHolding = async () => {
    if (!addForm.companyName || !addForm.quantity || !addForm.buyPrice) {
      toast.error('Please fill all fields');
      return;
    }
    setSaving(true);
    try {
      // Add to local holdings (backend integration can be added later)
      const newHolding = {
        companyName: addForm.companyName,
        quantity: parseInt(addForm.quantity),
        buyPrice: parseFloat(addForm.buyPrice),
        currentValue: parseInt(addForm.quantity) * parseFloat(addForm.buyPrice),
        gain: 0,
        gainPercentage: 0,
        logo: null,
        companyId: addForm.companyId
      };
      setHoldings(prev => [...prev, newHolding]);
      setStats(prev => ({
        ...prev,
        totalValue: prev.totalValue + newHolding.currentValue,
        totalInvested: prev.totalInvested + newHolding.currentValue
      }));
      toast.success('Share added to portfolio!');
      setShowAddModal(false);
      setAddForm({ companyName: '', quantity: '', buyPrice: '', companyId: null });
      haptic.success();
    } catch (error) {
      toast.error('Failed to add share');
    } finally {
      setSaving(false);
    }
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
        {/* Add Share Manually Button */}
        <button
          onClick={() => {
            haptic.medium();
            setShowAddModal(true);
          }}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-lg flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Share Manually
        </button>
      </div>

      {/* Add Share Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Share Manually</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({ companyName: '', quantity: '', buyPrice: '', companyId: null });
                  setSearchTerm('');
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Company Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                {addForm.companyName ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                    <span className="flex-1 font-semibold text-green-800">{addForm.companyName}</span>
                    <button
                      onClick={() => setAddForm(prev => ({ ...prev, companyName: '', companyId: null }))}
                      className="text-green-600 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search or type company name..."
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {searching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={20} />}
                  </div>
                )}
                {/* Company Suggestions */}
                {companies.length > 0 && !addForm.companyName && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-xl bg-white">
                    {companies.map((company) => (
                      <button
                        key={company._id}
                        onClick={() => handleCompanySelect(company)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <p className="font-semibold text-gray-900">{company.CompanyName || company.name || company.ScriptName}</p>
                        <p className="text-xs text-gray-500">{company.Sector || company.sector || 'Unlisted'}</p>
                      </button>
                    ))}
                  </div>
                )}
                {/* Manual entry if no suggestions */}
                {searchTerm.length >= 2 && companies.length === 0 && !searching && !addForm.companyName && (
                  <button
                    onClick={() => setAddForm(prev => ({ ...prev, companyName: searchTerm, companyId: null }))}
                    className="w-full mt-2 text-left px-4 py-3 bg-blue-50 rounded-xl border border-blue-200"
                  >
                    <p className="font-semibold text-blue-800">+ Add "{searchTerm}" as new company</p>
                  </button>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (Shares) *</label>
                <input
                  type="number"
                  value={addForm.quantity}
                  onChange={(e) => setAddForm(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter number of shares"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>

              {/* Buy Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Buy Price (per share) *</label>
                <input
                  type="number"
                  value={addForm.buyPrice}
                  onChange={(e) => setAddForm(prev => ({ ...prev, buyPrice: e.target.value }))}
                  placeholder="Enter price per share"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0.01"
                  step="0.01"
                />
              </div>

              {/* Total Value Preview */}
              {addForm.quantity && addForm.buyPrice && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-sm text-purple-700">Total Investment Value</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(parseInt(addForm.quantity) * parseFloat(addForm.buyPrice))}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleAddHolding}
                disabled={saving || !addForm.companyName || !addForm.quantity || !addForm.buyPrice}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><Loader className="animate-spin" size={20} /> Adding...</>
                ) : (
                  <><Plus size={20} /> Add to Portfolio</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
