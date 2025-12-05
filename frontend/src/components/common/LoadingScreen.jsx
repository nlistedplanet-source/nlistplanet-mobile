import React from 'react';

const LoadingScreen = ({ message = '' }) => {
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
        {/* Logo Container with Glow */}
        <div className="relative mb-8">
          {/* Outer glow rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 animate-ping-slow"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-emerald-400/30 to-blue-400/30 animate-pulse-glow"></div>
          </div>
          
          {/* Logo */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1a3a5c] to-[#0d2240] shadow-2xl flex items-center justify-center border border-emerald-500/20 backdrop-blur-sm">
            <img
              src="/Logo.png"
              alt="NlistPlanet"
              className="w-16 h-16 object-contain"
              style={{ 
                filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.4))'
              }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
            NlistPlanet
          </h1>
          <p className="text-gray-400 text-sm mt-2 tracking-widest uppercase">
            Trade Unlisted Shares
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce-dot1"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce-dot2"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce-dot3"></div>
          </div>
        </div>

        {/* Loading Text */}
        {message && (
          <p className="text-gray-500 text-xs font-medium tracking-wide">{message}</p>
        )}
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
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
          100% { transform: scale(0.8); opacity: 0.3; }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        @keyframes bounce-dot1 {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes bounce-dot2 {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes bounce-dot3 {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .animate-float1 { animation: float1 4s ease-in-out infinite; }
        .animate-float2 { animation: float2 5s ease-in-out infinite; }
        .animate-float3 { animation: float3 6s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 1.5s ease-in-out infinite; }
        .animate-bounce-dot1 { animation: bounce-dot1 1.4s ease-in-out infinite; }
        .animate-bounce-dot2 { animation: bounce-dot2 1.4s ease-in-out infinite 0.16s; }
        .animate-bounce-dot3 { animation: bounce-dot3 1.4s ease-in-out infinite 0.32s; }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
