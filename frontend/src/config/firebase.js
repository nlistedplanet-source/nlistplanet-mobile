// Firebase SDK loaded via CDN (see index.html)
// Using compat mode for CDN compatibility

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA7jdJrLTnFOcECcmQyrZDL5iEH97zOoJ8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "nlistplanet.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "nlistplanet",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "nlistplanet.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "630890625828",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:630890625828:web:21e2c38082dd7ac8b851b1",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-7HZRR4L29F"
};

console.log('🔥 Firebase Config API Key (first 10):', firebaseConfig.apiKey.substring(0, 10) + '...');
console.log('🔥 Firebase Auth Domain:', firebaseConfig.authDomain);
console.log('🔥 Firebase Project ID:', firebaseConfig.projectId);

// VAPID key for web push (from Firebase Console → Cloud Messaging → Web Push Certificates)
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY || "BA1cPlr8LOVkTbtsxMV06mNMAMLwEd0Kj9LLaGGLEACgNxZcGlyzHLkHs68oZ_OucDPWM_zbzdEf7rPNbdmf-7I";

let app = null;
let messaging = null;
let auth = null;

// Initialize Firebase
try {
  // Wait for CDN-loaded Firebase
  if (window.firebase) {
    console.log('🔥 Firebase SDK detected, initializing...');
    app = window.firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
    
    // Initialize Firebase Authentication
    auth = window.firebase.auth();
    
    // Check if messaging is supported in this browser
    if ('Notification' in window && 'serviceWorker' in navigator) {
      messaging = window.firebase.messaging();
      console.log('✅ Firebase messaging initialized');
    } else {
      console.warn('❌ Push notifications are not supported in this browser');
    }
  } else {
    console.error('❌ Firebase SDK not loaded from CDN - check index.html');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Requesting notification permission...');
    
    if (!messaging) {
      console.warn('❌ Firebase messaging not initialized - check if SDK loaded');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    console.log('📱 Permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Register service worker
      console.log('📝 Registering service worker...');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service worker registered:', registration.scope);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');
      
      // Get FCM token
      console.log('🔑 Getting FCM token with VAPID key:', VAPID_KEY.substring(0, 20) + '...');
      try {
        const token = await messaging.getToken({
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          console.log('✅ FCM Token obtained:', token.substring(0, 30) + '...');
          return token;
        } else {
          console.warn('❌ No FCM token available - check VAPID key');
          return null;
        }
      } catch (tokenError) {
        console.error('❌ Failed to get FCM token:', tokenError);
        console.error('Error details:', tokenError.message);
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('❌ Notification permission denied by user');
      return null;
    } else {
      console.warn('⚠️ Notification permission dismissed');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in requestNotificationPermission:', error);
    console.error('Stack:', error.stack);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param {Function} callback - Called when message received in foreground
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return () => {};
  }

  return messaging.onMessage((payload) => {
    console.log('Foreground message received:', payload);
    
    // Extract notification data
    const { title, body, icon, data } = payload.notification || {};
    const actionUrl = payload.data?.actionUrl;
    
    // Call callback with notification data
    if (callback) {
      callback({
        title,
        body,
        icon,
        data: payload.data,
        actionUrl
      });
    }
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/logo192.png',
        badge: '/logo192.png',
        tag: payload.messageId,
        requireInteraction: true,
        data: { actionUrl }
      });
      
      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        if (actionUrl) {
          window.location.href = actionUrl;
        }
        notification.close();
      };
    }
  });
};

/**
 * Check if notifications are enabled
 * @returns {boolean}
 */
export const areNotificationsEnabled = () => {
  return Notification.permission === 'granted';
};

/**
 * Get current notification permission status
 * @returns {'granted'|'denied'|'default'}
 */
export const getNotificationPermission = () => {
  return Notification.permission;
};

/**
 * Sign in with Google
 * @returns {Promise<{idToken: string, email: string, displayName: string, photoURL: string}>}
 */
export const signInWithGoogle = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    const idToken = await user.getIdToken();
    
    return {
      idToken,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid
    };
  } catch (error) {
    console.error('Google sign-in error details:', {
      code: error.code,
      message: error.message,
      fullError: error
    });
    throw error;
  }
};

/**
 * Sign out from Firebase
 */
export const signOutFirebase = async () => {
  try {
    if (auth) {
      await auth.signOut();
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export { messaging, auth };
export default app;
