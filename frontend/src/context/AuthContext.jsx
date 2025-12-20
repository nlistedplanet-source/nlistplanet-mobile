import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { storage, haptic } from '../utils/helpers';
import toast from 'react-hot-toast';
import { 
  requestNotificationPermission, 
  onForegroundMessage,
  signInWithGoogle as firebaseGoogleSignIn
} from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logout();
        toast.error('Session expired due to inactivity');
      }, INACTIVITY_TIMEOUT);
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Start timer

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = storage.get('token');
        const storedUser = storage.get('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          
          // Verify token is still valid (but don't block if it fails initially)
          try {
            const response = await authAPI.getProfile();
            setUser(response.data.user);
            storage.set('user', response.data.user);
          } catch (error) {
            // If verification fails, don't immediately logout - 
            // token might be valid but backend might be cold starting
            console.log('Token verification failed, using cached user data');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register FCM token when user logs in
  useEffect(() => {
    console.log('🔔 FCM Registration Effect - user:', !!user, 'fcmToken:', !!fcmToken);
    
    if (!user) {
      console.log('⏳ Waiting for user to login...');
      return;
    }
    
    if (fcmToken) {
      console.log('✅ FCM token already registered');
      return;
    }

    const registerFCMToken = async () => {
      console.log('🚀 Starting FCM token registration...');
      try {
        const token = await requestNotificationPermission();
        console.log('📱 requestNotificationPermission result:', token ? 'Got token!' : 'No token');
        
        if (token) {
          setFcmToken(token);
          
          // Register token with backend
          const apiUrl = process.env.REACT_APP_API_URL || 'https://unlistedhub-usm-backend.onrender.com';
          console.log('📤 Sending FCM token to backend:', apiUrl);
          
          const response = await fetch(`${apiUrl}/api/notifications/register-device`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storage.get('token')}`
            },
            body: JSON.stringify({ fcmToken: token })
          });
          
          console.log('📥 Backend response status:', response.status);
          
          if (response.ok) {
            console.log('✅ FCM token registered successfully with backend!');
            haptic.success();
            toast.success('🔔 Push notifications enabled!', { duration: 2000 });
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Backend rejected FCM token:', errorData);
          }
        } else {
          console.warn('⚠️ No FCM token received - check notification permission');
        }
      } catch (error) {
        console.error('❌ Failed to register FCM token:', error);
        console.error('Error details:', error.message, error.stack);
      }
    };

    // Ask for permission after a short delay (better UX)
    console.log('⏱️ Scheduling FCM registration in 2 seconds...');
    const timer = setTimeout(() => {
      registerFCMToken();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, fcmToken]);

  // Listen for foreground messages
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onForegroundMessage((notification) => {
      // Trigger haptic feedback
      haptic.notification();
      
      // Show toast notification
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            onClick={() => {
              if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
              }
              toast.dismiss(t.id);
            }}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl">🔔</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {notification.body}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  haptic.light();
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 active:bg-gray-50"
              >
                ✕
              </button>
            </div>
          </div>
        ),
        { duration: 6000, position: 'top-center' }
      );
    });

    return unsubscribe;
  }, [user]);

  const login = async (email, password) => {
    try {
      // Backend expects field name `username` (can be email or username)
      const response = await authAPI.login({ username: email, password });
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);
      storage.set('token', newToken);
      storage.set('user', newUser);

      toast.success(`Welcome back, ${newUser.fullName || newUser.username}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      toast.success('Registration successful! Please verify your email.');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      // Unregister FCM token if present
      if (fcmToken) {
        await fetch(`${process.env.REACT_APP_API_URL || 'https://unlistedhub-usm-backend.onrender.com'}/api/notifications/unregister-device`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.get('token')}`
          },
          body: JSON.stringify({ fcmToken })
        });
        setFcmToken(null);
      }
    } catch (error) {
      console.error('Failed to unregister FCM token:', error);
    }
    
    setUser(null);
    setToken(null);
    storage.remove('token');
    storage.remove('user');
    haptic.success();
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
    storage.set('user', userData);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
