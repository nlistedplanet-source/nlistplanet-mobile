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
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'sold', 'cancelled', 'expired'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Fetch inactive listings (sold, cancelled, expired)
      const response = await listingsAPI.getMy({ status: 'inactive' });
      setHistoryItems(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    haptic.light();
    await fetchHistory();
    setRefreshing(false);
    haptic.success();
  };

  const filteredItems = historyItems.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'sold':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bg: 'bg-green-100',
          label: 'Sold',
          borderColor: 'border-green-400'
        };
      case 'cancelled':
        return { 
          icon: Trash2, 
          color: 'text-red-600', 
          bg: 'bg-red-100',
          label: 'Cancelled',
          borderColor: 'border-red-400'
        };
      case 'expired':
        return { 
          icon: XCircle, 
          color: 'text-gray-600', 
          bg: 'bg-gray-100',
          label: 'Expired',
          borderColor: 'border-gray-400'
        };
      default:
        return { 
          icon: Archive, 
          color: 'text-gray-600', 
          bg: 'bg-gray-100',
          label: status,
          borderColor: 'border-gray-400'
        };
    }
  };

  const FilterButton = ({ value, label, activeColor }) => (
    <button
      onClick={() => {
        haptic.light();
        setFilterStatus(value);
      }}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        filterStatus === value
          ? `${activeColor} text-white shadow-lg`
          : 'bg-white text-gray-700 border border-gray-200'
      }`}
    >
      {label}
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
                <p className="text-sm text-gray-500">{filteredItems.length} items</p>
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
            <FilterButton value="all" label="All" activeColor="bg-primary-600" />
            <FilterButton value="sold" label="Sold" activeColor="bg-green-600" />
            <FilterButton value="cancelled" label="Cancelled" activeColor="bg-red-600" />
            <FilterButton value="expired" label="Expired" activeColor="bg-gray-600" />
          </div>
        </div>
      </div>

      {/* History Items */}
      <div className="px-6 pt-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No History</h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? "Your completed listings will appear here"
                : `No ${filterStatus} listings found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredItems.map((item) => (
              <HistoryCard key={item._id} item={item} getStatusConfig={getStatusConfig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// History Card Component
const HistoryCard = ({ item, getStatusConfig }) => {
  const isSell = item.type === 'sell';
  const price = isSell ? (item.sellerDesiredPrice || item.price) : (item.buyerMaxPrice || item.price);
  const totalAmount = price * item.quantity;
  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;

  // Format quantity
  const formatQty = (qty) => {
    if (qty >= 10000000) return (qty / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
    if (qty >= 100000) return (qty / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    if (qty >= 1000) return (qty / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return qty?.toString() || '0';
  };

  // Format short amount
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

      {/* Sold Price (if applicable) */}
      {item.status === 'sold' && item.soldPrice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-semibold">Final Sale Price:</span>
            <span className="font-bold text-amber-900">{formatCurrency(item.soldPrice)}</span>
          </div>
        </div>
      )}

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
