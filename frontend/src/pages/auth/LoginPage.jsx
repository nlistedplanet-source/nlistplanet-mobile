import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/helpers';
import { haptic } from '../../utils/helpers';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
// BrandLogo removed from login page per request

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // OTP Verification Modal States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle OTP Resend
  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await authAPI.resendOTP(unverifiedEmail);
      toast.success('OTP sent to your email and phone!');
      startResendTimer();
      haptic.success();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
      haptic.error();
    } finally {
      setResendLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setVerifyLoading(true);
    try {
      await authAPI.verifyOTP({ email: unverifiedEmail, otp });
      toast.success('Account verified! Please login again.');
      haptic.success();
      setShowVerificationModal(false);
      setOtp('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      haptic.error();
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    haptic.medium();
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        haptic.success();
        // Check if profile is complete
        if (result.profileComplete === false) {
          navigate('/complete-profile');
        } else {
          navigate('/');
        }
      } else {
        haptic.error();
      }
    } catch (error) {
      console.error('Google login failed:', error);
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      haptic.error();
      return;
    }

    setLoading(true);
    haptic.medium();

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        haptic.success();
        // Small delay to ensure token is fully set in localStorage before navigation
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        haptic.error();
        // Check if error is about email verification
        if (result.message && result.message.toLowerCase().includes('verify')) {
          setUnverifiedEmail(formData.email);
          setShowVerificationModal(true);
          // Auto-resend OTP
          handleResendOTP();
        }
        setLoading(false);
      }
    } catch (error) {
      haptic.error();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-600">Sign in to continue trading</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input-field pl-12 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 touch-feedback"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm font-semibold text-primary-600 touch-feedback"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 active:bg-gray-100 transition-all touch-feedback mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-primary-600 touch-feedback"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4">
        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-primary-600 font-medium">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="text-primary-600 font-medium">Privacy Policy</Link>
        </p>
      </div>

      {/* OTP Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowVerificationModal(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h3 className="text-lg font-bold">Verify Your Account</h3>
                  <p className="text-sm text-white/80">Complete registration to continue</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-gray-600 text-sm">
                  We've sent an OTP to <span className="font-semibold text-gray-800">{unverifiedEmail}</span>
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoFocus
                />
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOTP}
                disabled={verifyLoading || otp.length !== 6}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {verifyLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-semibold text-primary-600">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="text-sm font-semibold text-primary-600 flex items-center gap-2 mx-auto"
                  >
                    {resendLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* Help Text */}
              <p className="text-xs text-center text-gray-500">
                Didn't receive the OTP? Check your spam folder or try resending.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
