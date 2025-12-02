import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle, Sparkles, Star, Building2 } from 'lucide-react';

const LandingPage = () => {
  const [displayText, setDisplayText] = useState('Buy');
  
  useEffect(() => {
    const texts = ['Buy', 'Sell'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setDisplayText(texts[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Pre-IPO Access',
      description: 'Invest in top unicorns before they go public'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure Trading',
      description: 'Bank-grade security & KYC verified users'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Instant Settlement',
      description: 'Fast P2P transactions at your price'
    }
  ];

  const companies = [
    { name: 'Razorpay', logo: 'https://logo.clearbit.com/razorpay.com' },
    { name: 'Swiggy', logo: 'https://logo.clearbit.com/swiggy.com' },
    { name: 'Zomato', logo: 'https://logo.clearbit.com/zomato.com' },
    { name: 'PhonePe', logo: 'https://logo.clearbit.com/phonepe.com' },
    { name: 'Zerodha', logo: 'https://logo.clearbit.com/zerodha.com' },
    { name: 'BYJU\'S', logo: 'https://logo.clearbit.com/byjus.com' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-40 left-10 w-72 h-72 bg-teal-200 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-8 pb-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Hero Text with Animation */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl font-bold text-emerald-600 min-w-[70px] text-left transition-all duration-300">
              {displayText}
            </span>
            <span className="text-3xl font-bold text-gray-900">Unlisted</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            <span className="text-emerald-600">Shares</span> Online
          </h2>
          <p className="text-base text-gray-700 font-medium mb-2 px-4">
            Buy & Sell at the Price You Choose
          </p>
          <p className="text-sm text-gray-600 px-4">
            Own a stake in India's fastest-growing companies
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 mb-6 text-xs">
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-full shadow-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-gray-700">10K+ Traders</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-full shadow-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-gray-700">₹500Cr+ Vol</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-8">
          <Link
            to="/register"
            className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-base">Start Trading Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link
            to="/login"
            className="block w-full bg-white border-2 border-emerald-600 text-emerald-600 font-semibold py-4 px-6 rounded-2xl hover:bg-emerald-50 transition-all duration-300 text-center"
          >
            Sign In to Account
          </Link>
        </div>
      </div>

      {/* Featured Companies Carousel */}
      <div className="relative z-10 px-6 pb-8">
        <div className="text-center mb-4">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
            Featured Unlisted Companies
          </h3>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-3 animate-scroll-mobile">
            {[...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 min-w-fit hover:shadow-md transition-shadow"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${company.name}&background=random&size=32`;
                  }}
                />
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Why Choose <span className="text-emerald-600">NlistPlanet</span>?
          </h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-emerald-600 mb-1">10K+</div>
            <div className="text-xs text-gray-600 font-medium">Active Users</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-teal-600 mb-1">500Cr+</div>
            <div className="text-xs text-gray-600 font-medium">Traded Value</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">100+</div>
            <div className="text-xs text-gray-600 font-medium">Companies</div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 px-6 pb-8">
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Ready to Invest?</h3>
            <p className="text-emerald-50 text-sm mb-5">
              Join thousands of investors trading unlisted shares
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-emerald-600 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 pb-6">
        <div className="text-center text-xs text-gray-500">
          <p className="mb-2">© 2024 NlistPlanet. All rights reserved.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-emerald-600 font-medium">Terms</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Privacy</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Support</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-mobile {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-mobile {
          animation: scroll-mobile 20s linear infinite;
        }
        .animate-scroll-mobile:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
