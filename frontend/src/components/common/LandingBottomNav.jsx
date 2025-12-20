import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Download, MoreHorizontal, Info, Mail, HelpCircle } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Lottie animation URLs - direct .lottie files
const LOTTIE_ANIMATIONS = [
  'https://lottie.host/87d22432-d357-4b4c-8580-791909118556/Tckorlt4wb.lottie',
  'https://lottie.host/31b9d722-5036-46a3-a059-07fd153ab3fb/xf0tgPD85m.lottie',
  'https://lottie.host/0571e045-8f3f-4b78-b88c-0d6b5463aa78/gqVauRjqqa.lottie'
];

const LandingBottomNav = ({ onInstallClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0); // 0 = Logo, 1-3 = Lottie animations
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/landing') return 'home';
    if (path === '/blog' || path.startsWith('/blog/')) return 'blog';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    if (path === '/faq') return 'faq';
    return 'home';
  };
  
  const activeTab = getActiveTab();

  // Rotate through Logo → Lottie 1 → Lottie 2 → Lottie 3 → Logo...
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % 4); // 0, 1, 2, 3, 0, 1...
    }, 3500); // Change every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-4">
        {/* Home */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'home' 
              ? 'text-emerald-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Blog */}
        <button
          onClick={() => navigate('/blog')}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
            activeTab === 'blog' 
              ? 'text-emerald-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <BookOpen size={22} />
          <span className="text-[10px] font-medium">Blog</span>
        </button>

        {/* Center Logo - Rotating between Logo and Lottie animations */}
        <button
          onClick={() => navigate('/register')}
          className="relative -mt-6 flex items-center justify-center"
        >
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-gray-900 overflow-hidden">
            {currentLogoIndex === 0 ? (
              // Show N Logo
              <img 
                src="/crismas logo.png" 
                alt="NlistPlanet" 
                className="w-10 h-10 object-contain animate-fade-in"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-2xl font-bold text-emerald-600">N</span>';
                }}
              />
            ) : (
              // Show Lottie animation using DotLottieReact
              <div className="animate-fade-in" style={{ width: 52, height: 52 }}>
                <DotLottieReact
                  src={LOTTIE_ANIMATIONS[currentLogoIndex - 1]}
                  loop
                  autoplay
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            )}
          </div>
        </button>

        {/* App Download */}
        <button
          onClick={onInstallClick}
          className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all text-gray-400 hover:text-gray-300"
        >
          <Download size={22} />
          <span className="text-[10px] font-medium">App</span>
        </button>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
              showMoreMenu || ['about', 'contact', 'faq'].includes(activeTab)
                ? 'text-emerald-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-medium">More</span>
          </button>

          {/* More Dropdown */}
          {showMoreMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="absolute bottom-full right-0 mb-2 w-40 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50">
                <button
                  onClick={() => {
                    navigate('/about');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
                    activeTab === 'about' ? 'text-emerald-400 bg-gray-700/50' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Info size={18} />
                  <span className="text-sm font-medium">About</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/contact');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-t border-gray-700 hover:bg-gray-700 transition-colors ${
                    activeTab === 'contact' ? 'text-emerald-400 bg-gray-700/50' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Mail size={18} />
                  <span className="text-sm font-medium">Contact</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/faq');
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-t border-gray-700 hover:bg-gray-700 transition-colors ${
                    activeTab === 'faq' ? 'text-emerald-400 bg-gray-700/50' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <HelpCircle size={18} />
                  <span className="text-sm font-medium">FAQ</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};

export default LandingBottomNav;
