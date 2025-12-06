import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  RefreshCw,
  Archive,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Clock,
  Phone,
  Shield,
  Key,
  Handshake,
  AlertCircle
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [completedDeals, setCompletedDeals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('completed'); // 'completed', 'all', 'sold', 'cancelled', 'expired'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both completed deals and history items in parallel
      const [completedRes, historyRes] = await Promise.all([
        listingsAPI.getCompletedDeals().catch(() => ({ data: { data: [] } })),
        listingsAPI.getMy({ status: 'inactive' }).catch(() => ({ data: { data: [] } }))
      ]);
      
      setCompletedDeals(completedRes.data.data || []);
      setHistoryItems(historyRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load history');
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

  const getDisplayItems = () => {
    if (filterStatus === 'completed') {
      return { type: 'completed', items: completedDeals };
    }
    
    const filtered = historyItems.filter(item => {
      if (filterStatus === 'all') return true;
      return item.status === filterStatus;
    });
    
    return { type: 'history', items: filtered };
  };

  const { type: displayType, items: displayItems } = getDisplayItems();

  const FilterButton = ({ value, label, activeColor, count }) => (
    <button
      onClick={() => {
        haptic.light();
        setFilterStatus(value);
      }}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
        filterStatus === value
          ? `${activeColor} text-white shadow-lg`
          : 'bg-white text-gray-700 border border-gray-200'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          filterStatus === value ? 'bg-white/20' : 'bg-gray-100'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return null;
  }

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
                <h1 className="text-2xl font-bold text-gray-900">History</h1>
                <p className="text-sm text-gray-500">{displayItems.length} items</p>
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

          {/* Filter Tabs */}
          <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-6 px-6">
            <FilterButton 
              value="completed" 
              label="Completed" 
              activeColor="bg-emerald-600" 
              count={completedDeals.length}
            />
            <FilterButton value="all" label="All" activeColor="bg-primary-600" count={historyItems.length} />
            <FilterButton value="sold" label="Sold" activeColor="bg-green-600" />
            <FilterButton value="cancelled" label="Cancelled" activeColor="bg-red-600" />
            <FilterButton value="expired" label="Expired" activeColor="bg-gray-600" />
          </div>
        </div>
      </div>

      {/* History Items */}
      <div className="px-6 pt-4">
        {displayItems.length === 0 ? (
          <EmptyState filterStatus={filterStatus} />
        ) : (
          <div className="space-y-3 pb-4">
            {displayType === 'completed' ? (
              displayItems.map((deal) => (
                <CompletedDealCard key={deal._id} deal={deal} />
              ))
            ) : (
              displayItems.map((item) => (
                <HistoryCard key={item._id} item={item} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ filterStatus }) => {
  const Icon = filterStatus === 'completed' ? Handshake : Archive;
  const title = filterStatus === 'completed' ? 'No Completed Deals' : 'No History';
  const message = filterStatus === 'completed' 
    ? 'Your accepted deals will appear here'
    : filterStatus === 'all' 
      ? 'Your completed listings will appear here'
      : `No ${filterStatus} listings found`;

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

// Completed Deal Card Component (with verification codes)
const CompletedDealCard = ({ deal }) => {
  const [showCodes, setShowCodes] = useState(false);
  
  const formatQty = (qty) => {
    if (qty >= 10000000) return (qty / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
    if (qty >= 100000) return (qty / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    if (qty >= 1000) return (qty / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return qty?.toString() || '0';
  };

  const formatShortAmt = (amt) => {
    if (amt >= 10000000) return '₹' + (amt / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
    if (amt >= 100000) return '₹' + (amt / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
    if (amt >= 1000) return '₹' + (amt / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return formatCurrency(amt);
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending_rm_contact': 'Awaiting RM Call',
      'rm_contacted': 'RM Contacted',
      'documents_pending': 'Documents Pending',
      'payment_pending': 'Payment Pending',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-mobile overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{deal.companyName}</h4>
              <p className="text-xs text-gray-500">Deal accepted</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(deal.status)}`}>
              {getStatusLabel(deal.status)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              deal.userRole === 'buyer' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {deal.userRole === 'buyer' ? 'BUYING' : 'SELLING'}
            </span>
          </div>
        </div>

        {/* Deal Details */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-[10px] text-gray-500">Price</p>
            <p className="font-bold text-gray-900 text-sm">{formatCurrency(deal.agreedPrice)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-[10px] text-gray-500">Qty</p>
            <p className="font-bold text-gray-900 text-sm">{formatQty(deal.quantity)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-[10px] text-gray-500">Total</p>
            <p className="font-bold text-emerald-600 text-sm">{formatShortAmt(deal.totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* RM Contact Message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-blue-800 font-semibold text-sm mb-1">RM Will Contact You</p>
            <p className="text-blue-700 text-xs leading-relaxed">
              Our team representative will call you shortly to complete your transaction. 
              Use the verification codes below to ensure secure communication.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Codes Section */}
      <div className="p-4">
        <button
          onClick={() => {
            haptic.light();
            setShowCodes(!showCodes);
          }}
          className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl mb-3"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700">Verification Codes</span>
          </div>
          <span className="text-xs text-primary-600 font-medium">
            {showCodes ? 'Hide' : 'Show'}
          </span>
        </button>

        {showCodes && (
          <div className="space-y-3">
            {/* Your Code - RM will ask this */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-800">Your Code</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-900 tracking-widest">{deal.myVerificationCode}</p>
                  <p className="text-[10px] text-amber-700 mt-1">RM will ask for this code to verify it's you</p>
                </div>
              </div>
            </div>

            {/* RM Code - You will ask RM this */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800">RM Code</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-900 tracking-widest">{deal.rmVerificationCode}</p>
                  <p className="text-[10px] text-emerald-700 mt-1">Ask RM for this code to verify the call is genuine</p>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2 bg-gray-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-600 leading-relaxed">
                <span className="font-semibold">Security Tip:</span> Never share your verification code unless the RM first provides the correct RM Code. This ensures both parties are verified.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Deal: {formatDate(deal.dealAcceptedAt || deal.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(deal.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

// History Card Component (for sold/cancelled/expired)
const HistoryCard = ({ item }) => {
  const isSell = item.type === 'sell';
  const price = isSell ? (item.sellerDesiredPrice || item.price) : (item.buyerMaxPrice || item.price);
  const totalAmount = price * item.quantity;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'sold':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Sold' };
      case 'cancelled':
        return { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' };
      case 'expired':
        return { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Expired' };
      default:
        return { icon: Archive, color: 'text-gray-600', bg: 'bg-gray-100', label: status };
    }
  };

  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;

  const formatQty = (qty) => {
    if (qty >= 10000000) return (qty / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
    if (qty >= 100000) return (qty / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    if (qty >= 1000) return (qty / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return qty?.toString() || '0';
  };

  const formatShortAmt = (amt) => {
    if (amt >= 10000000) return '₹' + (amt / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
    if (amt >= 100000) return '₹' + (amt / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
    if (amt >= 1000) return '₹' + (amt / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return formatCurrency(amt);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-mobile overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.bg}`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{item.companyName}</h4>
            <p className="text-xs text-gray-500">{item.companyId?.Sector || item.companyId?.sector || 'N/A'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusConfig.bg} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isSell ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {isSell ? 'SELL' : 'BUY'}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] text-gray-500 mb-0.5">Price/Share</p>
          <p className="font-bold text-gray-900">{formatCurrency(price)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] text-gray-500 mb-0.5">Quantity</p>
          <p className="font-bold text-gray-900">{formatQty(item.quantity)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] text-gray-500 mb-0.5">Total Amount</p>
          <p className="font-bold text-green-600">{formatShortAmt(totalAmount)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] text-gray-500 mb-0.5">Bids/Offers</p>
          <p className="font-bold text-blue-600">
            {isSell ? (item.bids?.length || 0) : (item.offers?.length || 0)}
          </p>
        </div>
      </div>

      {/* Footer - Dates */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Created: {formatDate(item.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(item.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
