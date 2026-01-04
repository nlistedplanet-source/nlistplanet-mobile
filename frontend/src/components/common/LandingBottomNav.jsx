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
    <div className="fixed bottom-4 left-4 right-4 z-50 safe-area-bottom">
      <nav className="mx-auto max-w-md bg-gray-900/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-[2.5rem] px-2 py-2">
        <div className="flex items-center justify-around">
          {/* Home */}
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all relative ${
              activeTab === 'home' 
                ? 'text-emerald-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'home' ? 'bg-emerald-500/10 scale-110' : ''}`}>
              <Home size={22} />
            </div>
            <span className="text-[10px] font-medium">Home</span>
            {activeTab === 'home' && (
              <div className="absolute -bottom-1 w-1 h-1 bg-emerald-400 rounded-full animate-fade-in" />
            )}
          </button>

          {/* Blog */}
          <button
            onClick={() => navigate('/blog')}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all relative ${
              activeTab === 'blog' 
                ? 'text-emerald-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === 'blog' ? 'bg-emerald-500/10 scale-110' : ''}`}>
              <BookOpen size={22} />
            </div>
            <span className="text-[10px] font-medium">Blog</span>
            {activeTab === 'blog' && (
              <div className="absolute -bottom-1 w-1 h-1 bg-emerald-400 rounded-full animate-fade-in" />
            )}
          </button>

          {/* Center Logo - Rotating between Logo and Lottie animations */}
          <button
            onClick={() => navigate('/register')}
            className="relative -mt-10 flex items-center justify-center"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-gray-900 overflow-hidden transform active:scale-90 transition-transform">
              {currentLogoIndex === 0 ? (
                // Show N Logo
                <img
                  src="/new_logo.png"
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
            className="flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all text-gray-400 hover:text-gray-300"
          >
            <div className="p-1.5 rounded-xl">
              <Download size={22} />
            </div>
            <span className="text-[10px] font-medium">App</span>
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all relative ${
                showMoreMenu || ['about', 'contact', 'faq'].includes(activeTab)
                  ? 'text-emerald-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${showMoreMenu || ['about', 'contact', 'faq'].includes(activeTab) ? 'bg-emerald-500/10 scale-110' : ''}`}>
                <MoreHorizontal size={22} />
              </div>
              <span className="text-[10px] font-medium">More</span>
              {['about', 'contact', 'faq'].includes(activeTab) && (
                <div className="absolute -bottom-1 w-1 h-1 bg-emerald-400 rounded-full animate-fade-in" />
              )}
            </button>

            {/* More Dropdown */}
            {showMoreMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute bottom-full right-0 mb-4 w-44 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-scale-in">
                  <button
                    onClick={() => {
                      navigate('/about');
                      setShowMoreMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors ${
                      activeTab === 'about' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-300'
                    }`}
                  >
                    <Info size={18} />
                    <span className="text-sm font-medium">About Us</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/contact');
                      setShowMoreMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 border-t border-white/5 hover:bg-white/5 transition-colors ${
                      activeTab === 'contact' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-300'
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
                    className={`w-full flex items-center gap-3 px-4 py-3.5 border-t border-white/5 hover:bg-white/5 transition-colors ${
                      activeTab === 'faq' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-300'
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
      </nav>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingBottomNav;
