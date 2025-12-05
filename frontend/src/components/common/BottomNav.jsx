import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, PlusCircle, Bell, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
           style={{ backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2.5 rounded-2xl transition-all relative touch-feedback ${
                item.highlight 
                  ? '' 
                  : active 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              style={{ minHeight: '60px' }}
            >
              {item.highlight ? (
                <div className="relative -mt-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Icon size={26} strokeWidth={2} className="text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-primary-50 dark:bg-primary-500/20' : ''}`}>
                      <Icon 
                        size={22} 
                        strokeWidth={active ? 2.5 : 2}
                      />
                    </div>
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-scale-in">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>

    {/* Create Listing Modal */}
    <CreateListingModal 
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onSuccess={handleCreateSuccess}
    />
    {/* Theme toggle - quick access */}
    <ThemeToggle />
    </>
  );
};

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={() => toggle()}
      className="fixed bottom-24 right-4 w-12 h-12 rounded-xl flex items-center justify-center text-white z-50 shadow-lg touch-feedback transition-all duration-300"
      style={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
          : 'linear-gradient(135deg, #6366f1, #4f46e5)'
      }}
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default BottomNav;
