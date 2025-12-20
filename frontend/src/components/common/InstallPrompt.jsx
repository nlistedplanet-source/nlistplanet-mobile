import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { triggerHaptic } from '../../utils/helpers';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = Math.floor((Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds of usage
      // setTimeout(() => {
      //   setShowPrompt(true);
      // }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    triggerHaptic('medium');
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 animate-slide-up">
      <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all active:scale-90 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative p-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            {/* App Icon */}
            <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <Download className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base mb-0.5 tracking-tight">
                Install NlistPlanet App
              </h3>
              <p className="text-white/90 text-xs leading-relaxed">
                Quick access, offline mode & instant updates
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleInstall}
            className="w-full bg-white text-emerald-600 rounded-xl px-4 py-2.5 font-bold text-sm hover:bg-white/95 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install Now
          </button>
        </div>

        {/* iOS Instructions */}
        {/iPhone|iPad|iPod/.test(navigator.userAgent) && (
          <div className="px-4 pb-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <p className="text-[10px] text-white/90 leading-relaxed">
                <span className="font-semibold">iOS:</span> Tap Share 
                <svg className="inline w-2.5 h-2.5 mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                </svg>
                → Add to Home Screen
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
