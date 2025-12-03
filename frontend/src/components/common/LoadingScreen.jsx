import React from 'react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-primary-50 flex flex-col items-center justify-center z-50">
      <div className="relative flex flex-col items-center mb-6" style={{width:'112px',height:'112px'}}>
        {/* Pulse Effects */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="absolute w-32 h-32 rounded-full bg-primary-400 opacity-15 animate-pulse1"></span>
          <span className="absolute w-20 h-20 rounded-full bg-primary-500 opacity-20 animate-pulse2"></span>
        </span>
        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="rounded-2xl shadow-xl bg-white p-3.5 flex items-center justify-center border border-gray-100">
            <img
              src="/Logo.png"
              alt="NlistPlanet"
              className="w-14 h-14"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(14, 165, 233, 0.3))' }}
            />
          </div>
        </div>
      </div>
      <p className="mt-4 text-gray-600 font-medium tracking-wide text-sm">{message}</p>
      <style>{`
        @keyframes pulse1 {
          0% { transform: scale(0.9); opacity: 0.2; }
          70% { transform: scale(1.4); opacity: 0.03; }
          100% { transform: scale(0.9); opacity: 0.2; }
        }
        @keyframes pulse2 {
          0% { transform: scale(1); opacity: 0.15; }
          70% { transform: scale(1.7); opacity: 0.03; }
          100% { transform: scale(1); opacity: 0.15; }
        }
        .animate-pulse1 { animation: pulse1 1.6s infinite cubic-bezier(0.4,0,0.2,1); }
        .animate-pulse2 { animation: pulse2 2.1s infinite cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
