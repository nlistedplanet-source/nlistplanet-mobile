import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  User,
  Package,
  AlertCircle,
  Share2,
  RefreshCw
} from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, formatDate, timeAgo, shareListing, haptic } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import BidOfferModal from '../../components/modals/BidOfferModal';
import toast from 'react-hot-toast';

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getById(id);
      setListing(response.data.data);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      toast.error('Failed to load listing details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    haptic.light();
    const result = await shareListing(listing);
    if (result === 'copied') {
      toast.success('Link copied to clipboard!');
    } else if (result) {
      toast.success('Shared successfully!');
    }
  };

  const handlePlaceBid = () => {
    if (!user) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }
    haptic.medium();
    setShowBidModal(true);
  };

  const handleBidSuccess = () => {
    setShowBidModal(false);
    fetchListing(); // Refresh listing data
  };

  if (loading) {
    return null;
  }

  if (!listing) {
    return null;
  }

  const isSell = listing.type === 'sell';
  const isOwnListing = user && listing.userId === user._id;
  const totalAmount = listing.price * listing.quantity;
  const platformFee = (totalAmount * 2) / 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className={`${isSell ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-green-600 to-green-700'} px-6 pt-safe pb-6`}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              haptic.light();
              navigate(-1);
            }}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center touch-feedback"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center touch-feedback"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-primary-700">
              {listing.companyName?.charAt(0) || '?'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{listing.companyName}</h1>
            <div className="flex items-center gap-2">
              {isSell ? (
                <TrendingDown className="w-4 h-4 text-white" />
              ) : (
                <TrendingUp className="w-4 h-4 text-white" />
              )}
              <span className="text-white/90 text-sm font-semibold">
                {isSell ? 'SELLING' : 'BUYING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Card */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-2xl p-6 shadow-mobile">
          <p className="text-sm text-gray-500 mb-1">Price per share</p>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {formatCurrency(listing.price)}
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Quantity</p>
              <p className="text-lg font-bold text-gray-900">{listing.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listing Details */}
      <div className="px-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
        
        <div className="bg-white rounded-2xl shadow-mobile overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Posted by</p>
              <p className="font-semibold text-gray-900">
                {listing.userInfo?.fullName || 'Anonymous'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Posted on</p>
              <p className="font-semibold text-gray-900">{formatDate(listing.createdAt)}</p>
              <p className="text-xs text-gray-400">{timeAgo(listing.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-green-600 capitalize">{listing.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <div className="px-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
          <div className="bg-white rounded-2xl p-4 shadow-mobile">
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      {!isOwnListing && listing.status === 'active' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-lg">
          <button
            onClick={handlePlaceBid}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {isSell ? 'Place Buy Offer' : 'Place Sell Offer'}
            <TrendingUp size={18} />
          </button>
        </div>
      )}

      {isOwnListing && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-lg">
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-gray-600">This is your listing</p>
          </div>
        </div>
      )}

      {/* Bid/Offer Modal */}
      <BidOfferModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        listing={listing}
        onSuccess={handleBidSuccess}
      />
    </div>
  );
};

export default ListingDetailPage;
