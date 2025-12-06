import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

/**
 * PBPartners-style inline rotating loader
 * Shows a small box with rotating Lottie icons over page content
 * 
 * Usage: 
 * <PBLoader show={isLoading} />
 */

const LOTTIE_ANIMATIONS = [
  'https://lottie.host/87d22432-d357-4b4c-8580-791909118556/Tckorlt4wb.lottie',
  'https://lottie.host/31b9d722-5036-46a3-a059-07fd153ab3fb/xf0tgPD85m.lottie',
  'https://lottie.host/0571e045-8f3f-4b78-b88c-0d6b5463aa78/gqVauRjqqa.lottie'
];

// Cache for loaded animation data
const animationCache = {};

const PBLoader = ({ show = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationData, setAnimationData] = useState(null);
  const [showNLogo, setShowNLogo] = useState(false);

  // Rotate through animations every 1.5 seconds
  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= LOTTIE_ANIMATIONS.length) {
          setShowNLogo(true);
          setTimeout(() => setShowNLogo(false), 1500);
          return 0;
        }
        setShowNLogo(false);
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [show]);

  // Fetch and cache Lottie JSON data
  useEffect(() => {
    if (!show) return;

    const fetchAnimation = async () => {
      if (showNLogo) {
        setAnimationData(null);
        return;
      }

      const url = LOTTIE_ANIMATIONS[currentIndex];
      
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
  }, [currentIndex, showNLogo, show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Semi-transparent overlay - very light */}
      <div className="absolute inset-0 bg-black/10 pointer-events-auto"></div>
      
      {/* Loader Box - PBPartners style */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden"
        style={{
          width: '80px',
          height: '80px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
        }}
      >
        {showNLogo || !animationData ? (
          // N Logo
          <div 
            className="flex items-center justify-center animate-scale-in"
            style={{ width: '50px', height: '50px' }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">N</span>
            </div>
          </div>
        ) : (
          // Lottie Animation
          <div className="animate-fade-in">
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: 60, height: 60 }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PBLoader;
