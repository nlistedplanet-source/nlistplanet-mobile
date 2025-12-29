import React from 'react';
import { X, Copy, CheckCircle, Phone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { haptic } from '../../utils/helpers';

const VerificationCodesModal = ({ isOpen, deal, onClose }) => {
  if (!isOpen || !deal) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied!');
    haptic.success();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
            <CheckCircle size={24} className="text-white" />
          </div>
          <h2 className="text-lg font-bold mb-0.5">Deal Confirmed!</h2>
          <p className="text-green-100 text-[10px]">Transaction successfully initiated</p>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center mb-4">
            <p className="text-gray-500 text-[10px] mb-0.5">You have successfully accepted the deal for</p>
            <p className="text-gray-900 font-bold text-sm">{deal.companyName || 'Shares'}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
            <h3 className="text-blue-800 font-bold text-[10px] mb-2.5 flex items-center gap-1">
              <ShieldCheck size={12} />
              YOUR VERIFICATION CODES
            </h3>
            
            <div className="space-y-2">
              {/* My Code */}
              <div className="bg-white rounded-lg p-2.5 border border-blue-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[8px] text-gray-400 uppercase font-bold tracking-wider">Your Code</p>
                  <p className="text-sm font-mono font-bold text-gray-900 tracking-widest">
                    {deal.buyerCode || deal.sellerCode || deal.myVerificationCode}
                  </p>
                  <p className="text-[8px] text-blue-600 mt-0.5">Share with RM</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(deal.buyerCode || deal.sellerCode || deal.myVerificationCode)}
                  className="p-1.5 bg-gray-50 rounded-lg text-gray-500 active:bg-gray-200 transition-colors"
                >
                  <Copy size={14} />
                </button>
              </div>

              {/* RM Code */}
              <div className="bg-white rounded-lg p-2.5 border border-blue-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[8px] text-gray-400 uppercase font-bold tracking-wider">RM Code</p>
                  <p className="text-sm font-mono font-bold text-gray-900 tracking-widest">
                    {deal.rmCode || deal.rmVerificationCode}
                  </p>
                  <p className="text-[8px] text-blue-600 mt-0.5">Verify RM with this</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(deal.rmCode || deal.rmVerificationCode)}
                  className="p-1.5 bg-gray-50 rounded-lg text-gray-500 active:bg-gray-200 transition-colors"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 mb-4">
            <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600">
              <Phone size={12} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">What happens next?</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                A Company Representative (RM) will call you within 24 hours to verify the transaction.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-semibold text-xs active:scale-95 transition-transform shadow-lg shadow-gray-200"
          >
            Got it, I'll wait for the call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodesModal;
