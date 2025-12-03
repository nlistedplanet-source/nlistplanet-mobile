import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle, Sparkles, Star, Building2, ChevronRight, Wallet, BarChart3, Globe } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('Buy');
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const texts = ['Buy', 'Sell', 'Trade'];
    let index = 0;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        index = (index + 1) % texts.length;
        setDisplayText(texts[index]);
        setIsAnimating(false);
      }, 200);
    }, 2500);
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
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-gradient-to-l from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-12 pb-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gray-900 p-3 rounded-2xl border border-gray-800">
              <img 
                src="/new_logo.png" 
                alt="NlistPlanet" 
                className="w-14 h-14 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center" style={{display: 'none'}}>
                <span className="text-2xl font-bold text-white">N</span>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-sm font-medium">India's #1 Unlisted Share Platform</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            <span 
              className={`inline-block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
            >
              {displayText}
            </span>
            {' '}Unlisted
            <br />
            <span className="text-gray-100">Shares Online</span>
          </h1>
          
          <p className="text-gray-400 text-base mb-2 max-w-xs mx-auto">
            Trade at <span className="text-white font-semibold">your price</span> with 
            <span className="text-emerald-400 font-semibold"> zero brokerage</span>
          </p>
          <p className="text-gray-500 text-sm">
            Own a stake in India's fastest-growing companies
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-800">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">10K+</p>
              <p className="text-gray-500 text-[10px]">Traders</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-800">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">₹500Cr+</p>
              <p className="text-gray-500 text-[10px]">Volume</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-800">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">100+</p>
              <p className="text-gray-500 text-[10px]">Companies</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-8">
          <Link
            to="/register"
            className="block w-full relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-2 py-4 px-6 font-semibold text-white">
              <span className="text-base">Start Trading Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          
          <Link
            to="/login"
            className="block w-full bg-gray-900 border border-gray-700 text-white font-semibold py-4 px-6 rounded-2xl hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 text-center group"
          >
            <span className="flex items-center justify-center gap-2">
              Sign In to Account
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </span>
          </Link>
        </div>

        {/* Quick Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 bg-gray-900/60 px-3 py-1.5 rounded-full border border-gray-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-300 text-xs">KYC Verified</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-900/60 px-3 py-1.5 rounded-full border border-gray-800">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-300 text-xs">Secure Escrow</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-900/60 px-3 py-1.5 rounded-full border border-gray-800">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-gray-300 text-xs">Instant Match</span>
          </div>
        </div>
      </div>

      {/* Featured Companies Carousel */}
      <div className="relative z-10 px-6 pb-8">
        <div className="text-center mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Trade Shares of Top Companies
          </h3>
        </div>
        <div className="overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-4">
          <div className="flex gap-4 animate-scroll-mobile">
            {[...companies, ...companies].map((company, index) => (
              <div
                key={index}
                className="bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-700/50 flex items-center gap-3 min-w-fit hover:bg-gray-800 hover:border-gray-600 transition-all"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-8 w-8 object-contain rounded-lg bg-white p-1"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${company.name}&background=random&size=32`;
                  }}
                />
                <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 pb-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 border border-gray-700/50 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Why Choose <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">NlistPlanet</span>?
          </h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="relative z-10 px-6 pb-8">
        <h3 className="text-lg font-bold text-white mb-4 text-center">How It Works</h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold">1</span>
            </div>
            <p className="text-xs text-gray-400">Sign Up & Complete KYC</p>
          </div>
          <div className="w-8 h-px bg-gradient-to-r from-emerald-500/50 to-teal-500/50"></div>
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-teal-500/30">
              <span className="text-teal-400 font-bold">2</span>
            </div>
            <p className="text-xs text-gray-400">Browse & Place Orders</p>
          </div>
          <div className="w-8 h-px bg-gradient-to-r from-teal-500/50 to-cyan-500/50"></div>
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-cyan-500/30">
              <span className="text-cyan-400 font-bold">3</span>
            </div>
            <p className="text-xs text-gray-400">Trade & Build Wealth</p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 px-6 pb-8">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative p-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-medium">Limited Time Offer</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Ready to Invest?</h3>
            <p className="text-emerald-100 text-sm mb-5">
              Join 10,000+ investors trading unlisted shares
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 pb-8">
        <div className="text-center text-xs text-gray-500">
          <p className="mb-3">© 2024 NlistPlanet. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate('/terms')} className="text-gray-400 hover:text-emerald-400 transition-colors">Terms</button>
            <span className="text-gray-700">•</span>
            <button onClick={() => navigate('/privacy')} className="text-gray-400 hover:text-emerald-400 transition-colors">Privacy</button>
            <span className="text-gray-700">•</span>
            <a href="mailto:support@nlistplanet.com" className="text-gray-400 hover:text-emerald-400 transition-colors">Support</a>
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
