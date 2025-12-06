import React, { useState, useEffect } from 'react';
import { X, Search, TrendingUp, TrendingDown, Package, Info, IndianRupee, Check, AlertCircle } from 'lucide-react';
import { companiesAPI, listingsAPI } from '../../utils/api';
import { formatCurrency, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

// Number to words converter (Indian format)
const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  if (num < 1000) return convertLessThanThousand(num);
  if (num < 100000) return convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertLessThanThousand(num % 1000) : '');
  if (num < 10000000) return convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');
  return convertLessThanThousand(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numberToWords(num % 10000000) : '');
};

const CreateListingModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState('sell');
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPriceTooltip, setShowPriceTooltip] = useState(false);
  
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    companyLogo: '',
    companyPan: '',
    companyISIN: '',
    companyCIN: '',
    companySegmentation: '',
    price: '',
    quantity: '',
    minLot: '1'
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setType('sell');
      setSearchTerm('');
      setCompanies([]);
      setShowSuggestions(false);
      setManualEntry(false);
      setShowPreview(false);
      setAgreedToTerms(false);
      setShowPriceTooltip(false);
      setFormData({
        companyId: '',
        companyName: '',
        companyLogo: '',
        companyPan: '',
        companyISIN: '',
        companyCIN: '',
        companySegmentation: '',
        price: '',
        quantity: '',
        minLot: '1'
      });
    }
  }, [isOpen]);

  // Debounced company search
  useEffect(() => {
    if (searchTerm.length > 0) {
      const delayDebounce = setTimeout(async () => {
        try {
          const response = await companiesAPI.getAll({ search: searchTerm, limit: 10 });
          setCompanies(response.data.data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch companies:', error);
          setCompanies([]);
        }
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else {
      setCompanies([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleCompanySelect = (company) => {
    haptic.medium();
    setFormData({
      ...formData,
      companyId: company._id,
      companyName: company.CompanyName || company.name,
      companyLogo: company.Logo || company.logo || '',
      companyPan: company.PAN || '',
      companyISIN: company.ISIN || '',
      companyCIN: company.CIN || ''
    });
    setSearchTerm(company.CompanyName || company.name);
    setShowSuggestions(false);
    setManualEntry(false);
    setStep(2);
  };

  const handleManualEntry = () => {
    if (searchTerm.length > 0) {
      haptic.medium();
      setFormData({
        ...formData,
        companyId: '',
        companyName: searchTerm
      });
      setManualEntry(true);
      setShowSuggestions(false);
      setStep(2);
    } else {
      toast.error('Please enter company name');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.price || !formData.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to Terms & Conditions');
      return;
    }

    haptic.medium();
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    haptic.medium();
    
    try {
      const payload = {
        type,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        minLot: parseInt(formData.minLot) || 1,
        companyPan: formData.companyPan || undefined,
        companyISIN: formData.companyISIN || undefined,
        companyCIN: formData.companyCIN || undefined,
        companySegmentation: formData.companySegmentation || undefined
      };

      if (formData.companyId) {
        payload.companyId = formData.companyId;
      } else {
        payload.companyName = formData.companyName;
      }

      await listingsAPI.create(payload);
      
      haptic.success();
      toast.success(`${type === 'sell' ? 'Sell post' : 'Buy request'} created successfully!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      haptic.error();
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = formData.price && formData.quantity 
    ? parseFloat(formData.price) * parseInt(formData.quantity) 
    : 0;
  const platformFee = totalAmount * 0.02;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up pb-safe">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 ? 'Create New Post' : showPreview ? 'Review Listing' : `Create ${type === 'sell' ? 'Sell' : 'Buy'} Post`}
          </h2>
          <button
            onClick={() => {
              haptic.light();
              if (showPreview) {
                setShowPreview(false);
              } else {
                onClose();
              }
            }}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Step 1: Type & Company Selection */}
        {step === 1 && !showPreview && (
          <div className="p-5 space-y-5">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Listing Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { haptic.light(); setType('sell'); }}
                  className={`py-4 px-4 rounded-xl border-2 font-semibold transition-all ${
                    type === 'sell'
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 text-red-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  <TrendingDown className="mx-auto mb-2" size={24} />
                  Sell Your Share
                </button>
                <button
                  onClick={() => { haptic.light(); setType('buy'); }}
                  className={`py-4 px-4 rounded-xl border-2 font-semibold transition-all ${
                    type === 'buy'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  <TrendingUp className="mx-auto mb-2" size={24} />
                  BUY Request
                </button>
              </div>
            </div>

            {/* Company Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Start typing company name..."
                  className="w-full px-4 py-3.5 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Select from suggestions or continue typing to add manually
              </p>
            </div>

            {/* Company Suggestions */}
            {showSuggestions && companies.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-primary-200 rounded-xl p-2 bg-white">
                <p className="text-xs font-semibold text-gray-600 px-2 py-1">Suggestions from database:</p>
                {companies.map((company) => (
                  <button
                    key={company._id}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-primary-50 active:bg-primary-100 rounded-xl transition-all text-left"
                  >
                    {(company.Logo || company.logo) ? (
                      <img
                        src={company.Logo || company.logo}
                        alt={company.CompanyName || company.name}
                        className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-bold text-lg">
                          {(company.CompanyName || company.name)?.[0] || 'C'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{company.CompanyName || company.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                        {company.ScripName && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{company.ScripName}</span>
                        )}
                        <span className="truncate">{company.Sector || company.sector || 'Unlisted'}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showSuggestions && searchTerm.length > 0 && companies.length === 0 && (
              <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-600 text-sm">No companies found matching "{searchTerm}"</p>
              </div>
            )}

            {/* Manual Entry Option */}
            {searchTerm.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Can't find <span className="font-bold">"{searchTerm}"</span> in suggestions?
                </p>
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3.5 rounded-xl font-semibold active:scale-[0.98] transition-all"
                >
                  Continue with "{searchTerm}"
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  You'll be able to list this company manually
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Form Details */}
        {step === 2 && !showPreview && (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Selected Company */}
            <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-3">
              {formData.companyLogo ? (
                <img
                  src={formData.companyLogo}
                  alt={formData.companyName}
                  className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {formData.companyName?.[0] || 'C'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{formData.companyName}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  {type === 'sell' ? 'Selling shares' : 'Buying shares'}
                  {manualEntry && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Manual</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  setStep(1);
                  setSearchTerm('');
                  setManualEntry(false);
                }}
                className="text-primary-600 text-sm font-semibold"
              >
                Change
              </button>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Price per Share (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowPriceTooltip(true)}
                    onMouseLeave={() => setShowPriceTooltip(false)}
                    onTouchStart={() => setShowPriceTooltip(true)}
                    onTouchEnd={() => setTimeout(() => setShowPriceTooltip(false), 2000)}
                    className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center"
                  >
                    <Info size={12} className="text-primary-600" />
                  </button>
                  {showPriceTooltip && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 animate-fade-in">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                        <p className="font-medium">Platform Fee: 2%</p>
                        <p className="text-gray-300 text-[10px]">Charged on successful trade</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, price: val });
                  }}
                  placeholder="Enter price"
                  className="w-full px-4 py-3.5 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                  required
                />
              </div>
              {formData.price && (
                <p className="text-sm font-medium text-purple-600 mt-2 bg-purple-50 px-3 py-1.5 rounded-lg inline-block">
                  ₹ {numberToWords(parseFloat(formData.price))} Rupees
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity (Shares) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.quantity}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, quantity: val });
                  }}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3.5 pl-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                  required
                />
              </div>
              {formData.quantity && (
                <p className="text-sm font-medium text-indigo-600 mt-2 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
                  📊 {numberToWords(parseInt(formData.quantity))} Shares
                </p>
              )}
            </div>

            {/* Min Lot Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Lot Size
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.minLot}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, minLot: val });
                }}
                placeholder="1"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>

            {/* Company Segmentation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Segmentation
              </label>
              <select
                value={formData.companySegmentation}
                onChange={(e) => setFormData({ ...formData, companySegmentation: e.target.value })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base appearance-none bg-white"
              >
                <option value="">Select Segmentation</option>
                <option value="SME">SME</option>
                <option value="Mainboard">Mainboard</option>
                <option value="Unlisted">Unlisted</option>
                <option value="Pre-IPO">Pre-IPO</option>
                <option value="Startup">Startup</option>
              </select>
            </div>

            {/* Company PAN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company PAN
              </label>
              <input
                type="text"
                value={formData.companyPan}
                onChange={(e) => setFormData({ ...formData, companyPan: e.target.value.toUpperCase() })}
                placeholder="AAAAA0000A"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-mono"
                maxLength="10"
              />
            </div>

            {/* Company ISIN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company ISIN
              </label>
              <input
                type="text"
                value={formData.companyISIN}
                onChange={(e) => setFormData({ ...formData, companyISIN: e.target.value.toUpperCase() })}
                placeholder="INE000X00000"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-mono"
                maxLength="12"
              />
            </div>

            {/* Company CIN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company CIN
              </label>
              <input
                type="text"
                value={formData.companyCIN}
                onChange={(e) => setFormData({ ...formData, companyCIN: e.target.value.toUpperCase() })}
                placeholder="U00000XX0000XXX000000"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-mono"
                maxLength="21"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                I agree to the <span className="text-primary-600 font-semibold">Terms & Conditions</span> and confirm that all information provided is accurate
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  setStep(1);
                }}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl active:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!agreedToTerms || !formData.price || !formData.quantity}
                className="flex-1 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                Preview & Submit
              </button>
            </div>
          </form>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="p-5 space-y-5">
            <p className="text-sm text-gray-600">Please verify all details before posting</p>

            {/* Company */}
            <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl p-4">
              <p className="text-xs text-gray-600 mb-1">Company</p>
              <div className="flex items-center gap-3">
                {formData.companyLogo ? (
                  <img
                    src={formData.companyLogo}
                    alt={formData.companyName}
                    className="w-10 h-10 rounded-lg object-contain bg-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                    <span className="text-white font-bold">{formData.companyName?.[0]}</span>
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-gray-900">{formData.companyName}</p>
                  {manualEntry && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Manual Entry</span>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-600 mb-1">Type</p>
                <p className={`font-bold ${type === 'sell' ? 'text-red-600' : 'text-green-600'}`}>
                  {type === 'sell' ? 'SELL' : 'BUY'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-600 mb-1">Price per Share</p>
                <p className="font-bold text-gray-900">₹{parseFloat(formData.price).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-600 mb-1">Quantity</p>
                <p className="font-bold text-gray-900">{parseInt(formData.quantity).toLocaleString('en-IN')} shares</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-600 mb-1">Min Lot</p>
                <p className="font-bold text-gray-900">{formData.minLot}</p>
              </div>
            </div>

            {/* Extra Details */}
            {(formData.companyPan || formData.companyISIN || formData.companyCIN || formData.companySegmentation) && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-xs text-gray-600 mb-2 font-semibold">Company Details</p>
                {formData.companySegmentation && (
                  <p className="text-sm text-gray-900">Segment: <span className="font-medium">{formData.companySegmentation}</span></p>
                )}
                {formData.companyPan && (
                  <p className="text-sm text-gray-900">PAN: <span className="font-mono">{formData.companyPan}</span></p>
                )}
                {formData.companyISIN && (
                  <p className="text-sm text-gray-900">ISIN: <span className="font-mono">{formData.companyISIN}</span></p>
                )}
                {formData.companyCIN && (
                  <p className="text-sm text-gray-900">CIN: <span className="font-mono text-xs">{formData.companyCIN}</span></p>
                )}
              </div>
            )}

            {/* Total Amount */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Value</span>
                <span className="font-bold text-primary-600 text-xl">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  haptic.light();
                  setShowPreview(false);
                }}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl active:bg-gray-200 transition-all"
              >
                Edit
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Confirm & Post
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListingModal;
