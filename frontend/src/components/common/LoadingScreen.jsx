import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

// Lottie animation URLs - PolicyBazaar style rotating icons
const LOTTIE_ANIMATIONS = [
  {
    url: 'https://lottie.host/87d22432-d357-4b4c-8580-791909118556/Tckorlt4wb.lottie',
    label: 'Loading market data...'
  },
  {
    url: 'https://lottie.host/31b9d722-5036-46a3-a059-07fd153ab3fb/xf0tgPD85m.lottie',
    label: 'Fetching listings...'
  },
  {
    url: 'https://lottie.host/0571e045-8f3f-4b78-b88c-0d6b5463aa78/gqVauRjqqa.lottie',
    label: 'Almost there...'
  }
];

// Cache for loaded animation data
const animationCache = {};

const LoadingScreen = ({ message = '', variant = 'full' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationData, setAnimationData] = useState(null);
  const [showNLogo, setShowNLogo] = useState(false);

  // Rotate through animations every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        // After all lottie animations, show N logo
        if (next >= LOTTIE_ANIMATIONS.length) {
          setShowNLogo(true);
          return 0; // Reset for next cycle
        }
        setShowNLogo(false);
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Fetch and cache Lottie JSON data
  useEffect(() => {
    const fetchAnimation = async () => {
      if (showNLogo) {
        setAnimationData(null);
        return;
      }

      const url = LOTTIE_ANIMATIONS[currentIndex].url;
      
      // Check cache first
      if (animationCache[url]) {
        setAnimationData(animationCache[url]);
        return;
      }

      try {
        // Convert .lottie URL to JSON URL (lottie.host specific)
        const jsonUrl = url.replace('.lottie', '.json');
        const response = await fetch(jsonUrl);
        const data = await response.json();
        animationCache[url] = data;
        setAnimationData(data);
      } catch (error) {
        console.log('Lottie fetch error, using fallback');
        setAnimationData(null);
      }
    };

    fetchAnimation();
  }, [currentIndex, showNLogo]);

  const currentLabel = showNLogo 
    ? (message || 'Welcome to NlistPlanet!')
    : (message || LOTTIE_ANIMATIONS[currentIndex]?.label || 'Loading...');

  // Compact variant for API calls (inline loader)
  if (variant === 'compact') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-20 h-20 mb-4">
          {showNLogo || !animationData ? (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center animate-pulse-glow">
              <span className="text-white text-3xl font-bold">N</span>
            </div>
          ) : (
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
        <p className="text-gray-400 text-sm">{currentLabel}</p>
        
        {/* Progress dots */}
        <div className="flex gap-2 mt-4">
          {LOTTIE_ANIMATIONS.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex && !showNLogo
                  ? 'bg-emerald-400 scale-125'
                  : 'bg-gray-600'
              }`}
            />
          ))}
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              showNLogo ? 'bg-emerald-400 scale-125' : 'bg-gray-600'
            }`}
          />
        </div>

        <style>{`
          @keyframes pulse-glow {
            0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
          }
          .animate-pulse-glow { animation: pulse-glow 1.5s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  // Full screen variant (app start, page transitions)
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f2847] to-[#0a1628] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-emerald-400/30 rounded-full animate-float1"></div>
        <div className="absolute top-40 right-16 w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-float2"></div>
        <div className="absolute bottom-32 left-20 w-2 h-2 bg-emerald-300/25 rounded-full animate-float3"></div>
        <div className="absolute bottom-48 right-24 w-1 h-1 bg-cyan-400/35 rounded-full animate-float1"></div>
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-teal-400/30 rounded-full animate-float2"></div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center z-10">
        {/* Lottie Animation Container */}
        <div className="relative mb-6">
          {/* Outer glow ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 animate-ping-slow"></div>
          </div>
          
          {/* Animation Container */}
          <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-[#1a3a5c]/80 to-[#0d2240]/80 shadow-2xl flex items-center justify-center border border-emerald-500/20 backdrop-blur-sm overflow-hidden">
            {showNLogo || !animationData ? (
              // N Logo (5th item)
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center animate-n-logo">
                <span className="text-white text-5xl font-bold drop-shadow-lg">N</span>
              </div>
            ) : (
              // Lottie Animation
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{ width: 120, height: 120 }}
              />
            )}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex gap-2 mb-6">
          {LOTTIE_ANIMATIONS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentIndex && !showNLogo
                  ? 'w-6 bg-gradient-to-r from-emerald-400 to-cyan-400'
                  : idx < currentIndex || showNLogo
                    ? 'w-3 bg-emerald-500/50'
                    : 'w-3 bg-gray-600'
              }`}
            />
          ))}
          {/* N Logo indicator */}
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              showNLogo
                ? 'w-6 bg-gradient-to-r from-emerald-400 to-cyan-400'
                : 'w-3 bg-gray-600'
            }`}
          />
        </div>

        {/* Brand Name */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
            NlistPlanet
          </h1>
        </div>

        {/* Loading Text - Dynamic */}
        <p className="text-gray-400 text-sm font-medium tracking-wide animate-fade-in-out">
          {currentLabel}
        </p>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-gray-600 text-[10px] tracking-widest uppercase">
          Secure • Verified • Trusted
        </p>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-15px) translateX(-8px); opacity: 0.7; }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.25; }
          50% { transform: translateY(-25px) translateX(12px); opacity: 0.5; }
        }
        @keyframes ping-slow {
          0% { transform: scale(0.9); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.15; }
          100% { transform: scale(0.9); opacity: 0.3; }
        }
        @keyframes n-logo {
          0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-float1 { animation: float1 4s ease-in-out infinite; }
        .animate-float2 { animation: float2 5s ease-in-out infinite; }
        .animate-float3 { animation: float3 6s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 2.5s ease-in-out infinite; }
        .animate-n-logo { animation: n-logo 0.5s ease-out forwards; }
        .animate-fade-in-out { animation: fade-in-out 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
