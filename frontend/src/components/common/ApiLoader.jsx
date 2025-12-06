import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

/**
 * PolicyBazaar-style rotating Lottie loader for API calls
 * Usage: <ApiLoader /> or <ApiLoader message="Loading data..." />
 */

const LOTTIE_ANIMATIONS = [
  {
    url: 'https://lottie.host/87d22432-d357-4b4c-8580-791909118556/Tckorlt4wb.lottie',
    label: 'Loading...'
  },
  {
    url: 'https://lottie.host/31b9d722-5036-46a3-a059-07fd153ab3fb/xf0tgPD85m.lottie',
    label: 'Please wait...'
  },
  {
    url: 'https://lottie.host/0571e045-8f3f-4b78-b88c-0d6b5463aa78/gqVauRjqqa.lottie',
    label: 'Almost there...'
  }
];

// Cache for loaded animation data
const animationCache = {};

const ApiLoader = ({ message = '', size = 'medium' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationData, setAnimationData] = useState(null);
  const [showNLogo, setShowNLogo] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { container: 'w-16 h-16', icon: 60, text: 'text-xs' },
    medium: { container: 'w-24 h-24', icon: 80, text: 'text-sm' },
    large: { container: 'w-32 h-32', icon: 100, text: 'text-base' }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Rotate through animations every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= LOTTIE_ANIMATIONS.length) {
          setShowNLogo(true);
          return 0;
        }
        setShowNLogo(false);
        return next;
      });
    }, 2000);

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
      
      if (animationCache[url]) {
        setAnimationData(animationCache[url]);
        return;
      }

      try {
        const jsonUrl = url.replace('.lottie', '.json');
        const response = await fetch(jsonUrl);
        const data = await response.json();
        animationCache[url] = data;
        setAnimationData(data);
      } catch (error) {
        setAnimationData(null);
      }
    };

    fetchAnimation();
  }, [currentIndex, showNLogo]);

  const currentLabel = message || (showNLogo ? 'NlistPlanet' : LOTTIE_ANIMATIONS[currentIndex]?.label);

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Animation Container */}
      <div className={`relative ${config.container} mb-3`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 animate-pulse"></div>
        
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#1a3a5c]/50 to-[#0d2240]/50 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
          {showNLogo || !animationData ? (
            <div className="w-3/4 h-3/4 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center animate-bounce-subtle">
              <span className="text-white text-2xl font-bold">N</span>
            </div>
          ) : (
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: config.icon, height: config.icon }}
            />
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-2">
        {LOTTIE_ANIMATIONS.map((_, idx) => (
          <div
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex && !showNLogo
                ? 'bg-emerald-400 scale-125'
                : 'bg-gray-600'
            }`}
          />
        ))}
        <div
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            showNLogo ? 'bg-emerald-400 scale-125' : 'bg-gray-600'
          }`}
        />
      </div>

      {/* Label */}
      <p className={`text-gray-400 ${config.text} font-medium`}>{currentLabel}</p>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ApiLoader;
