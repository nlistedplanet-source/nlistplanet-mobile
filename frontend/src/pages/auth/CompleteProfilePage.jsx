import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Shield, Loader, CheckCircle, ArrowLeft } from 'lucide-react';
import { haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { user, completeProfile, verifyProfileOtp } = useAuth();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if profile already complete
    if (user && user.fullName && user.phone && user.isPhoneVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      toast.error('Full name must be at least 2 characters');
      haptic.error();
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      haptic.error();
      return;
    }

    setLoading(true);
    haptic.medium();

    const result = await completeProfile(formData.fullName, formData.phone);

    setLoading(false);

    if (result.success) {
      haptic.success();
      setStep(2);
    } else {
      haptic.error();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      haptic.error();
      return;
    }

    setLoading(true);
    haptic.medium();

    const result = await verifyProfileOtp(otp);

    setLoading(false);

    if (result.success) {
      haptic.success();
      navigate('/');
    } else {
      haptic.error();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col px-6 pt-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {step === 1 ? 'Complete Profile' : 'Verify Phone'}
        </h1>
        <p className="text-gray-600">
          {step === 1 
            ? 'Please provide your details to continue' 
            : `Enter the code sent to ${formData.phone}`}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmitDetails} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field pl-12"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                className="input-field pl-12"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              We'll send a verification code to this number.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
              Enter 6-Digit OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="input-field text-center text-2xl tracking-[0.5em] font-mono py-4"
              maxLength={6}
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Verify & Finish</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full flex items-center justify-center gap-2 text-gray-500 font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back to details</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default CompleteProfilePage;
