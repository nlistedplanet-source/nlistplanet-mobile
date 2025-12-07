import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ message = '' }) => {
  const [dots, setDots] = useState('');

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const displayMessage = message || 'Loading';

  return (
    <div className="fixed inset-0 bg-transparent flex flex-col items-center justify-center z-50">
      {/* Main Content */}
      <div className="flex flex-col items-center">
        {/* Logo Container - White rounded square with shadow */}
        <div className="relative mb-6">
          {/* Main square container with logo */}
          <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden">
            <img 
              src="/Logo copy.png" 
              alt="NlistPlanet" 
              className="w-20 h-20 object-contain"
              onError={(e) => {
                // Fallback to text if image fails
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-4xl font-bold text-emerald-600">N</span>';
              }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-600 text-sm font-medium">
          {displayMessage}{dots}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
