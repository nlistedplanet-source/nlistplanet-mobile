import React, { useState } from 'react';
import { X, Check, TrendingUp, TrendingDown } from 'lucide-react';
import { listingsAPI } from '../../utils/api';
import { formatCurrency, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BidOfferModal = ({ isOpen, onClose, listing, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !listing) return null;

  const isSell = listing.type === 'sell';
  const maxQuantity = listing.quantity;
  
  const quantity = parseInt(formData.quantity) || 0;
  const price = parseFloat(formData.price) || 0;
  const totalAmount = quantity * price;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.quantity || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    if (quantity <= 0 || quantity > maxQuantity) {
      toast.error(`Quantity must be between 1 and ${maxQuantity}`);
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up pb-safe">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isSell ? 'Place Buy Offer' : 'Place Sell Offer'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{listing.companyName}</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Listing Info */}
          <div className={`${isSell ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-2xl p-4`}>
            <div className="flex items-center gap-3 mb-3">
              {isSell ? (
                <TrendingDown className="w-5 h-5 text-red-600" />
              ) : (
                <TrendingUp className="w-5 h-5 text-green-600" />
              )}
              <p className="font-semibold text-gray-900">
                {isSell ? 'Seller' : 'Buyer'} is asking {formatCurrency(listing.price)}/share
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Available quantity: <span className="font-semibold">{listing.quantity} shares</span>
            </p>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Quantity (shares) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder={`Max ${maxQuantity} shares`}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="input-field"
              min="1"
              max={maxQuantity}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can buy/sell up to {maxQuantity} shares
            </p>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Your offer price per share (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter your price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input-field"
              min="0"
              step="0.01"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Listed price: {formatCurrency(listing.price)}/share
            </p>
          </div>

          {/* Total Amount Display */}
          {totalAmount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="font-bold text-emerald-600 text-xl">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {quantity} shares × {formatCurrency(price)}/share
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.quantity || !formData.price}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Check size={18} />
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
