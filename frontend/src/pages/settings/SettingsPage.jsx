import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  ChevronRight,
  Globe,
  Vibrate,
  Send
} from 'lucide-react';
import { haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { sendTestNotification } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [isTestingPush, setIsTestingPush] = useState(false);

  const handleNotificationToggle = () => {
    haptic.light();
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
  };

  const handleTestPush = async () => {
    haptic.light();
    setIsTestingPush(true);
    const success = await sendTestNotification();
    setIsTestingPush(false);
    
    if (success) {
      toast.success('Test notification sent! Check your tray.', { icon: '🚀' });
    } else {
      toast.error('Failed to send test notification. Check permissions.');
    }
  };

  const handleHapticToggle = () => {
    if (hapticEnabled) {
      haptic.light();
    }
    setHapticEnabled(!hapticEnabled);
    toast.success(`Haptic feedback ${!hapticEnabled ? 'enabled' : 'disabled'}`);
  };

  const navigateToPage = (path) => {
    haptic.light();
    navigate(path);
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onClick, rightElement }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 transition-colors touch-feedback"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <Icon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div className="text-left">
          <p className="font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
          {subtitle && <p className="text-sm" style={{ color: 'var(--muted)' }}>{subtitle}</p>}
        </div>
      </div>
      {rightElement || <ChevronRight className="w-5 h-5" style={{ color: 'var(--muted)' }} />}
    </button>
  );

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-primary-600' : ''
      }`}
      style={{ backgroundColor: enabled ? undefined : 'var(--border)' }}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="shadow-sm sticky top-0 z-10" style={{ backgroundColor: 'var(--header-bg)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="px-6 pt-safe pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                haptic.light();
                navigate(-1);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center touch-feedback shadow-sm"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text)' }} />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* App Preferences */}
        <div className="rounded-2xl mb-6 overflow-hidden" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-light)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <h2 className="font-bold" style={{ color: 'var(--text)' }}>App Preferences</h2>
          </div>

          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Receive updates about your trades"
            onClick={handleNotificationToggle}
            rightElement={<ToggleSwitch enabled={notificationsEnabled} onToggle={handleNotificationToggle} />}
          />

          <div style={{ borderTop: '1px solid var(--border-light)' }}>
            <SettingItem
              icon={Send}
              title="Test Push Notification"
              subtitle={isTestingPush ? "Sending..." : "Verify your device registration"}
              onClick={handleTestPush}
              rightElement={isTestingPush ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" /> : null}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)' }}>
            <SettingItem
              icon={Vibrate}
              title="Haptic Feedback"
              subtitle="Vibration on button taps"
              onClick={handleHapticToggle}
              rightElement={<ToggleSwitch enabled={hapticEnabled} onToggle={handleHapticToggle} />}
            />
          </div>

          {/* Dark theme toggle temporarily disabled - will be added later */}

          <div style={{ borderTop: '1px solid var(--border-light)' }}>
            <SettingItem
              icon={Globe}
              title="Language"
              subtitle="English (US)"
              onClick={() => toast('More languages coming soon!', { icon: '🌍' })}
            />
          </div>
        </div>

        {/* Legal & Support */}
        <div className="rounded-2xl mb-6 overflow-hidden" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-light)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <h2 className="font-bold" style={{ color: 'var(--text)' }}>Legal & Support</h2>
          </div>

          <SettingItem
            icon={Shield}
            title="Privacy Policy"
            subtitle="How we handle your data"
            onClick={() => { haptic.light(); navigate('/privacy'); }}
          />

          <div style={{ borderTop: '1px solid var(--border-light)' }}>
            <SettingItem
              icon={FileText}
              title="Terms of Service"
              subtitle="Platform terms and conditions"
              onClick={() => { haptic.light(); navigate('/terms'); }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)' }}>
            <SettingItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Get help with your account"
              onClick={() => { haptic.light(); navigate('/help'); }}
            />
          </div>
        </div>

        {/* App Info */}
        <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-light)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-teal-600">
            <span className="text-3xl font-bold text-white">N</span>
          </div>
          <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>NlistPlanet Mobile</h3>
          <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>Version 1.0.4</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>© 2025 NlistPlanet. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
