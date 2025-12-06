import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle, Sparkles, Star, Building2, ChevronRight, Wallet, BarChart3, Globe, DollarSign, Clock, Lock, Menu, Download, Smartphone, X, Home, BookOpen, Info, Mail, Phone, HelpCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayText, setDisplayText] = useState('Buy');
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Check if already installed
  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    // Show banner after 2 seconds if not installed
    const timer = setTimeout(() => {
      if (!isInstalled && (deferredPrompt || isIOSDevice)) {
        setShowInstallBanner(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  // Handle Install Click
  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    }
  };
  
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

  const benefitCards = [
    {
      icon: '💰',
      title: 'Best Prices',
      description: 'Set your own price and get competitive bids'
    },
    {
      icon: '⚡',
      title: 'Quick Listing',
      description: 'List your shares in less than 5 minutes'
    },
    {
      icon: '🔒',
      title: 'Secure Transfer',
      description: 'Safe and verified ownership transfer process'
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
      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center p-4">
          <div className="bg-white rounded-t-3xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white relative">
              <button 
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
              >
                <X size={18} />
              </button>
              <h3 className="text-lg font-bold">📲 Install NlistPlanet App</h3>
              <p className="text-emerald-100 text-xs">Add to Home Screen on iOS</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">1</div>
                <div>
                  <p className="font-semibold text-gray-900">Tap the Share button</p>
                  <p className="text-sm text-gray-500">Located at the bottom of Safari</p>
                  <div className="mt-2 bg-gray-100 rounded-lg p-2 inline-flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm text-gray-600">Share Icon</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">2</div>
                <div>
                  <p className="font-semibold text-gray-900">Tap "Add to Home Screen"</p>
                  <p className="text-sm text-gray-500">Scroll down in the share menu</p>
                  <div className="mt-2 bg-gray-100 rounded-lg p-2 inline-flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-600">Add to Home Screen</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">3</div>
                <div>
                  <p className="font-semibold text-gray-900">Tap "Add"</p>
                  <p className="text-sm text-gray-500">Confirm to install the app</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install App Banner - Floating */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 shadow-2xl shadow-emerald-500/30 border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <img src="/new_logo.png" alt="NlistPlanet" className="w-10 h-10 object-contain" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-sm">Install NlistPlanet App</h4>
                <p className="text-emerald-100 text-xs truncate">Trade faster with our app!</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-white text-emerald-600 font-bold text-sm rounded-xl flex items-center gap-1.5 shadow-lg"
                >
                  <Download size={16} />
                  Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-gradient-to-l from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-5 py-4 flex items-center justify-between bg-transparent sticky top-0">
        <div className="flex items-center gap-2">
          <img 
            src="/new_logo.png" 
            alt="NlistPlanet" 
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
            <span className="text-xl font-bold text-white">N</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Install App Button */}
          {!isInstalled && (deferredPrompt || isIOS) && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download size={14} />
              App
            </button>
          )}
          <Link
            to="/login"
            className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-8 pb-6">
        {/* Hero Text */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-xs font-medium">India's #1 Unlisted Share Platform</span>
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

        {/* CTA Buttons - Single Row */}
        <div className="flex gap-3 mb-6">
          <Link
            to="/register"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            Start Trading <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex-1 bg-gray-800 border border-gray-700 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 hover:bg-gray-700 transition-all"
          >
            Sign In <ChevronRight className="w-4 h-4" />
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

      {/* Benefit Cards Section - NEW */}
      <div className="relative z-10 px-6 pb-6">
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            {benefitCards.map((card, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{card.icon}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{card.title}</h4>
                <p className="text-gray-500 text-[10px] leading-tight">{card.description}</p>
              </div>
            ))}
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
      <div className="relative z-10 px-6 pb-24">
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

      {/* Bottom Navigation Bar - Website Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              activeTab === 'home' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('blog');
              navigate('/blog');
            }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              activeTab === 'blog' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <BookOpen size={20} />
            <span className="text-[10px] font-medium">Blog</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('about');
              navigate('/about');
            }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              activeTab === 'about' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Info size={20} />
            <span className="text-[10px] font-medium">About</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('contact');
              navigate('/contact');
            }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              activeTab === 'contact' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Mail size={20} />
            <span className="text-[10px] font-medium">Contact</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('help');
              navigate('/faq');
            }}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              activeTab === 'help' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <HelpCircle size={20} />
            <span className="text-[10px] font-medium">FAQ</span>
          </button>
        </div>
      </nav>

      <style>{`
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
        @keyframes slide-up {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
