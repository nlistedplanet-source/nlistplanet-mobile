import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * Loading animation - matches bottom nav logo style
 * Shows rotating Logo and Lottie animations with slide transition
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('enter'); // 'enter' or 'exit'

  // Rotate through Logo → Lottie 1 → Lottie 2 → Lottie 3 → Logo...
  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      // Start exit animation
      setDirection('exit');
      setIsTransitioning(true);
      
      // After exit animation, change index and start enter animation
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % 4); // 0, 1, 2, 3, 0, 1...
        setDirection('enter');
        
        // Reset transitioning after enter animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 400);
      }, 400);
    }, 2500); // Slower rotation - 2.5 seconds per icon

    return () => clearInterval(interval);
  }, [show]);

  // Reset index when loader hides
  useEffect(() => {
    if (!show) {
      setCurrentIndex(0);
      setIsTransitioning(false);
      setDirection('enter');
    }
  }, [show]);

  if (!show) return null;

  const getAnimationClass = () => {
    if (direction === 'exit') return 'animate-slide-out-left';
    if (direction === 'enter') return 'animate-slide-in-right';
    return '';
  };

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
        <div className={getAnimationClass()}>
          {currentIndex === 0 ? (
            // Show N Logo - same as bottom nav
            <img
              src="/new_logo.png"
              alt="NlistPlanet"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"><span class="text-white text-2xl font-bold">N</span></div>';
              }}
            />
          ) : (
            // Show Lottie animation using DotLottieReact - same as bottom nav
            <div style={{ width: 56, height: 56 }}>
              <DotLottieReact
                src={LOTTIE_ANIMATIONS[currentIndex - 1]}
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-out-left {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes slide-in-right {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-out-left { 
          animation: slide-out-left 0.4s ease-in-out forwards; 
        }
        .animate-slide-in-right { 
          animation: slide-in-right 0.4s ease-in-out forwards; 
        }
      `}</style>
    </div>
  );
};

export default PBLoader;
