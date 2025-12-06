import React, { useState } from 'react';
import { X, Check, TrendingUp, TrendingDown, IndianRupee, Package, AlertTriangle, FileText } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, haptic, calculateBuyerPays, calculateSellerGets, numberToWords } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BidOfferModal = ({ isOpen, onClose, listing, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!isOpen || !listing) return null;

  const isSell = listing.type === 'sell';
  const maxQuantity = listing.quantity;
  const minLot = listing.minLot || 1;
  
  // For SELL listing: Buyer sees price with 2% fee added
  // For BUY listing: Seller sees price with 2% fee deducted (what they'll receive)
  const displayPrice = isSell 
    ? calculateBuyerPays(listing.price)  // Buyer will pay this
    : calculateSellerGets(listing.price); // Seller will receive this
  
  const quantity = parseInt(formData.quantity) || 0;
  const price = parseFloat(formData.price) || 0;
  const totalAmount = quantity * price;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!riskAccepted || !termsAccepted) {
      toast.error('Please accept the risk disclosure and terms');
      return;
    }

    if (!formData.quantity || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    if (quantity < minLot) {
      toast.error(`Minimum lot size is ${minLot} shares`);
      return;
    }

    if (quantity > maxQuantity) {
      toast.error(`Maximum available is ${maxQuantity} shares`);
      return;
    }

    if (price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      haptic.medium();

      const payload = {
        quantity: quantity,
        price: price,
      };

      await listingsAPI.placeBid(listing._id, payload);
      
      haptic.success();
      toast.success('Offer placed successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      haptic.error();
      console.error('Failed to place offer:', error);
      toast.error(error.response?.data?.message || 'Failed to place offer');
    } finally {
      setLoading(false);
    }
  };

  // Floating label input component
  const FloatingInput = ({ label, value, onChange, icon: Icon, type = "text" }) => {
    const hasValue = value && value.toString().length > 0;
    const numValue = parseFloat(value) || 0;
    
    return (
      <div className="relative">
        <div className="relative">
          {Icon && (
            <Icon 
              size={18} 
              className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors ${
                hasValue ? 'text-primary-600' : 'text-gray-400'
              }`}
            />
          )}
          <input
            type={type}
            inputMode={type === 'number' ? 'decimal' : 'text'}
            value={value}
            onChange={onChange}
            placeholder=" "
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 pt-6 pb-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all peer text-base font-medium bg-white`}
            required
          />
          <label 
            className={`absolute ${Icon ? 'left-10' : 'left-4'} transition-all duration-200 pointer-events-none bg-white px-1 ${
              hasValue 
                ? '-top-2.5 text-xs text-primary-600 font-medium' 
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-500 peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-medium'
            }`}
          >
            {label} <span className="text-red-500">*</span>
          </label>
          
          {/* Amount in words - shown inside the input box */}
          {numValue > 0 && (
            <div className="absolute bottom-1 left-10 right-3 text-[10px] text-primary-600 font-medium truncate">
              {numberToWords(numValue)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up pb-safe">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isSell ? 'Place Your Desired Price to Seller' : 'Place Your Offer to Buyer'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{listing.companyName}</p>
          </div>
          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Beautiful Listing Info Card */}
          <div className={`relative overflow-hidden rounded-2xl ${
            isSell 
              ? 'bg-gradient-to-br from-red-50 via-orange-50 to-amber-50' 
              : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'
          }`}>
            {/* Decorative elements */}
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-40 ${
              isSell ? 'bg-red-200' : 'bg-green-200'
            }`} />
            <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full blur-xl opacity-30 ${
              isSell ? 'bg-orange-200' : 'bg-teal-200'
            }`} />
            
            <div className="relative p-4">
              {/* Company Info Row */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                  isSell ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {isSell ? (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {isSell ? 'Seller is Asking' : 'Buyer is Offering'}
                  </p>
                  <p className={`text-2xl font-bold ${isSell ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(displayPrice)}
                    <span className="text-sm font-medium text-gray-500">/share</span>
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/80">
                  <p className="text-xs text-gray-500 mb-1">Available</p>
                  <p className="font-bold text-gray-900">{maxQuantity.toLocaleString('en-IN')} shares</p>
                </div>
                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/80">
                  <p className="text-xs text-gray-500 mb-1">Min Lot</p>
                  <p className="font-bold text-gray-900">{minLot.toLocaleString('en-IN')} shares</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Input - Now First */}
          <FloatingInput
            label="Your Offer Price per Share (₹)"
            value={formData.price}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '');
              setFormData({ ...formData, price: value });
            }}
            icon={IndianRupee}
            type="text"
          />

          {/* Quantity Input - Now Second */}
          <div>
            <FloatingInput
              label="Quantity (Shares)"
              value={formData.quantity}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setFormData({ ...formData, quantity: value });
              }}
              icon={Package}
              type="text"
            />
            <p className="text-xs text-gray-500 mt-1.5 ml-1">
              Min: {minLot.toLocaleString('en-IN')} | Max: {maxQuantity.toLocaleString('en-IN')} shares
            </p>
          </div>

          {/* Total Amount Display */}
          {totalAmount > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-700">Total Amount</span>
                <span className="font-bold text-emerald-600 text-xl">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                {numberToWords(totalAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {quantity.toLocaleString('en-IN')} shares × {formatCurrency(price)}/share
              </p>
            </div>
          )}

          {/* Risk Disclosure Checkbox */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={riskAccepted}
                  onChange={(e) => setRiskAccepted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:border-primary-600 peer-checked:bg-primary-600 transition-all flex items-center justify-center">
                  {riskAccepted && <Check size={14} className="text-white" />}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I understand that unlisted shares are a <span className="font-semibold text-amber-600">high-risk</span> and <span className="font-semibold text-amber-600">low-liquidity</span> investment product. I have done my own research before investing.
                </span>
              </div>
            </label>

            {/* Terms & Conditions Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:border-primary-600 peer-checked:bg-primary-600 transition-all flex items-center justify-center">
                  {termsAccepted && <Check size={14} className="text-white" />}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I agree to the <a href="/terms" className="text-primary-600 font-semibold underline" onClick={(e) => e.stopPropagation()}>Terms & Conditions</a> and <a href="/privacy" className="text-primary-600 font-semibold underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>.
                </span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.quantity || !formData.price || !riskAccepted || !termsAccepted}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-4 text-base font-bold"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Check size={20} />
                Submit Offer
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BidOfferModal;
