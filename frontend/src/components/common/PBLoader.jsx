import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * Loading animation - matches bottom nav logo style
 * Shows rotating Logo and Lottie animations
 * 
 * Usage: 
 * <PBLoader show={isLoading} />
 */

const LOTTIE_ANIMATIONS = [
  'https://lottie.host/87d22432-d357-4b4c-8580-791909118556/Tckorlt4wb.lottie',
  'https://lottie.host/31b9d722-5036-46a3-a059-07fd153ab3fb/xf0tgPD85m.lottie',
  'https://lottie.host/0571e045-8f3f-4b78-b88c-0d6b5463aa78/gqVauRjqqa.lottie'
];

const PBLoader = ({ show = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = Logo, 1-3 = Lottie animations

  // Rotate through Logo → Lottie 1 → Lottie 2 → Lottie 3 → Logo...
  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 4); // 0, 1, 2, 3, 0, 1...
    }, 1200); // Faster rotation for loader

    return () => clearInterval(interval);
  }, [show]);

  // Reset index when loader hides
  useEffect(() => {
    if (!show) {
      setCurrentIndex(0);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto backdrop-blur-[2px]"></div>
      
      {/* Loader Box - Same style as bottom nav logo */}
      <div 
        className="relative bg-white rounded-2xl flex items-center justify-center overflow-hidden border-4 border-gray-100"
        style={{
          width: '72px',
          height: '72px',
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.25), 0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        {currentIndex === 0 ? (
          // Show N Logo - same as bottom nav
          <img 
            src="/Logo copy.png" 
            alt="NlistPlanet" 
            className="w-12 h-12 object-contain animate-scale-in"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"><span class="text-white text-2xl font-bold">N</span></div>';
            }}
          />
        ) : (
          // Show Lottie animation using DotLottieReact - same as bottom nav
          <div className="animate-fade-in" style={{ width: 56, height: 56 }}>
            <DotLottieReact
              src={LOTTIE_ANIMATIONS[currentIndex - 1]}
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PBLoader;
