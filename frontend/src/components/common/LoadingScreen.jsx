import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ message = '' }) => {
  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center z-[9999]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative flex flex-col items-center px-6 text-center animate-fade-in">
        {/* Logo Container */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full group-hover:bg-primary-500/30 transition-all duration-500" />
          <div className="relative w-28 h-28 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-2xl flex items-center justify-center overflow-hidden border border-white/20 dark:border-zinc-800 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <img
              src="/new_logo.png"
              alt="NlistPlanet"
              className="w-20 h-20 object-contain -rotate-3 group-hover:rotate-0 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-5xl font-black text-primary-600 dark:text-primary-400">N</span>';
              }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 tracking-tight">Nlist</span>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Planet</span>
        </div>

        {/* Tagline */}
        <p className="text-slate-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-[0.2em] mb-12">
          P2P Platform for Unlisted Shares
        </p>

        {/* Modern Loading Indicator */}
        <div className="w-48 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-500 w-1/2 rounded-full animate-loading-bar" />
        </div>

        {/* Loading Message */}
        {message && (
          <p className="mt-4 text-slate-400 dark:text-zinc-500 text-xs font-medium animate-pulse">
            {message}...
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-zinc-800 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Secure P2P Trading</span>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s infinite ease-in-out;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
