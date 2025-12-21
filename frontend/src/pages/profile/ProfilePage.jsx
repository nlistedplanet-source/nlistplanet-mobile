import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail,
  Phone,
  Calendar,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle,
  XCircle,
  Gift,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { BrandLogo } from '../../components/common';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    haptic.medium();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    haptic.success();
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'kyc',
      icon: Shield,
      label: 'KYC Verification',
      description: user?.kycStatus === 'verified' ? 'Verified' : 'Not verified',
      badge: user?.kycStatus === 'verified' ? 'verified' : user?.kycStatus === 'pending' ? 'pending' : null,
      onClick: () => {
        haptic.light();
        navigate('/kyc');
      }
    },
    {
      id: 'referrals',
      icon: Gift,
      label: 'Referrals',
      description: 'Invite friends and earn',
      onClick: () => {
        haptic.light();
        navigate('/referrals');
      }
    },
    {
      id: 'settings',
      icon: Bell,
      label: 'Settings',
      description: 'App preferences and notifications',
      onClick: () => {
        haptic.light();
        navigate('/settings');
      }
    },
    {
      id: 'privacy',
      icon: FileText,
      label: 'Privacy Policy',
      description: 'View privacy terms',
      onClick: () => {
        haptic.light();
        navigate('/privacy');
      }
    },
    {
      id: 'terms',
      icon: FileText,
      label: 'Terms of Service',
      description: 'View terms and conditions',
      onClick: () => {
        haptic.light();
        navigate('/terms');
      }
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help with your account',
      onClick: () => {
        haptic.light();
        navigate('/help');
      }
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 px-6 pt-safe pb-20 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-primary-400/20 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center mt-4">
          {/* Avatar with Logo Overlay */}
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3">
              <span className="text-4xl font-bold text-primary-600 dark:text-primary-400 -rotate-3">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl shadow-lg">
              <BrandLogo size={24} />
            </div>
          </div>

          {/* User Info */}
          <h1 className="text-2xl font-bold text-white mb-1">
            {user?.fullName || 'User'}
          </h1>
          <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full">
            <p className="text-white/90 text-xs font-medium">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Account Information Card */}
      <div className="px-6 -mt-12 relative z-20">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-black/5 overflow-hidden border border-white/20 dark:border-zinc-800/50">
          <div className="p-4 border-b border-gray-50 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Account Details</h2>
          </div>
          <InfoRow icon={Mail} label="Email" value={user?.email} color="blue" />
          <InfoRow icon={Phone} label="Phone" value={user?.phone || 'Not provided'} color="indigo" />
          <InfoRow 
            icon={Calendar} 
            label="Member Since" 
            value={formatDate(user?.createdAt)} 
            color="purple"
          />
          <InfoRow 
            icon={Shield} 
            label="KYC Status" 
            value={
              <div className="flex items-center gap-2">
                {user?.kycStatus === 'verified' ? (
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm flex items-center gap-1">
                    <CheckCircle size={14} /> Verified
                  </span>
                ) : user?.kycStatus === 'pending' ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Pending
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-bold text-sm flex items-center gap-1">
                    <XCircle size={14} /> Not Verified
                  </span>
                )}
              </div>
            }
            isLast
            color="emerald"
          />
        </div>
      </div>

      {/* Settings & Actions */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">Settings & Support</h2>
        <div className="grid grid-cols-1 gap-3">
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              description={item.description}
              badge={item.badge}
              onClick={() => {
                haptic.light();
                item.onClick();
              }}
            />
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6 mt-10 mb-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl p-4 font-bold flex items-center justify-center gap-3 touch-feedback border border-red-100 dark:border-red-500/20 shadow-sm active:scale-[0.98] transition-transform"
        >
          <LogOut size={20} />
          Logout Account
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Logout Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  haptic.light();
                  setShowLogoutConfirm(false);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold touch-feedback"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold touch-feedback"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, isLast, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className={`flex items-center gap-4 p-4 ${!isLast ? 'border-b border-gray-50 dark:border-zinc-800' : ''}`}>
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{label}</p>
        <div className="text-gray-900 dark:text-zinc-100 font-semibold truncate">{value}</div>
      </div>
    </div>
  );
};

// Menu Item Component
const MenuItem = ({ icon: Icon, label, description, badge, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 text-left touch-feedback bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-50 dark:border-zinc-800/50 active:scale-[0.98] transition-all"
  >
    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
      <Icon size={22} className="text-primary-600 dark:text-primary-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-gray-900 dark:text-zinc-100">{label}</p>
      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{description}</p>
    </div>
    <div className="flex items-center gap-2">
      {badge && (
        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-tight ${
          badge === 'verified' 
            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' 
            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
        }`}>
          {badge}
        </span>
      )}
      <div className="w-8 h-8 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
        <ChevronRight size={18} className="text-gray-400 dark:text-zinc-600" />
      </div>
    </div>
  </button>
);

export default ProfilePage;
