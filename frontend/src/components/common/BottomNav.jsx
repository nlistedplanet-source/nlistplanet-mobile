import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, PlusCircle, Bell, User } from 'lucide-react';
import { notificationsAPI } from '../../utils/api';
import { haptic } from '../../utils/helpers';
import CreateListingModal from '../modals/CreateListingModal';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await notificationsAPI.getAll({ limit: 1 });
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Market', path: '/marketplace' },
    { icon: PlusCircle, label: 'Post', path: '/create', highlight: true },
    { icon: Bell, label: 'Activity', path: '/activity', badge: unreadCount },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = (path) => {
    haptic.light();
    
    if (path === '/create') {
      setShowCreateModal(true);
    } else {
      navigate(path);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    navigate('/marketplace'); // Navigate to marketplace after creating listing
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-40 safe-area-bottom">
        <nav className="mx-auto max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2.5rem] px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 rounded-3xl transition-all relative touch-feedback ${
                    item.highlight 
                      ? '' 
                      : active 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'
                  }`}
                  style={{ minHeight: '56px' }}
                >
                  {item.highlight ? (
                    <div className="relative -mt-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/40 border-4 border-white dark:border-zinc-900 transform active:scale-90 transition-transform">
                        <Icon size={26} strokeWidth={2.5} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative flex flex-col items-center">
                        <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-primary-50 dark:bg-primary-900/20 scale-110' : ''}`}>
                          <Icon 
                            size={22} 
                            strokeWidth={active ? 2.5 : 2}
                          />
                        </div>
                        {item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-scale-in border-2 border-white dark:border-zinc-900">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                        {/* Active Indicator Dot */}
                        {active && (
                          <div className="absolute -bottom-1.5 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full animate-fade-in" />
                        )}
                      </div>
                      <span className={`text-[10px] mt-1.5 transition-all duration-300 ${active ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

    {/* Create Listing Modal */}
    <CreateListingModal 
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onSuccess={handleCreateSuccess}
    />
    {/* Theme toggle disabled for now */}
    </>
  );
};

export default BottomNav;
