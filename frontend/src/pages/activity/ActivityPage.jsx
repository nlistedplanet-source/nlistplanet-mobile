import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package,
  Send,
  Briefcase,
  Bell,
  ChevronRight,
  TrendingUp,
  Archive
} from 'lucide-react';
import { haptic } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const ActivityPage = () => {
  const navigate = useNavigate();
  const { unreadCount } = useAuth();

  const activitySections = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View all your notifications and updates',
      icon: Bell,
      iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconColor: 'text-orange-700',
      path: '/notifications',
    },
    {
      id: 'my-posts',
      title: 'My Posts',
      description: 'View and manage your active listings',
      icon: Package,
      iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconColor: 'text-purple-700',
      path: '/my-posts',
    },
    {
      id: 'bids',
      title: 'My Bids',
      description: 'Track bids and offers you have sent',
      icon: Send,
      iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconColor: 'text-blue-700',
      path: '/bids',
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      description: 'View your holdings and investments',
      icon: Briefcase,
      iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconColor: 'text-emerald-700',
      path: '/portfolio',
    },
    {
      id: 'history',
      title: 'History',
      description: 'View your past listings and transactions',
      icon: Archive,
      iconBg: 'bg-gradient-to-br from-slate-50 to-slate-100',
      iconColor: 'text-slate-700',
      path: '/history',
    },
  ];

  const handleCardClick = (path) => {
    haptic.light();
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Activity</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage your trading</p>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 relative active:scale-90 transition-transform"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white animate-scale-in">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="px-6 pt-6 space-y-4">
        {activitySections.map((section) => {
          const Icon = section.icon;
          const isNotifications = section.id === 'notifications';
          
          return (
            <button
              key={section.id}
              onClick={() => handleCardClick(section.path)}
              className="w-full bg-white rounded-2xl p-5 shadow-mobile active:scale-98 transition-transform text-left border border-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative ${section.iconBg}`}>
                  <Icon className={`w-7 h-7 ${section.iconColor}`} />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 border-2 border-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default ActivityPage;
