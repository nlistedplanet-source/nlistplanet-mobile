// Firebase Cloud Messaging Service Worker
// Handles background notifications when app is not in focus
// Version: 1.0.7 - Force update + Lock screen fix

// Import Firebase scripts - MUST match version in index.html
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (same as in firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyA7jdJrLTnFOcECcmQyrZDL5iEH97zOoJ8",
  authDomain: "nlistplanet.firebaseapp.com",
  projectId: "nlistplanet",
  storageBucket: "nlistplanet.firebasestorage.app",
  messagingSenderId: "630890625828",
  appId: "1:630890625828:web:21e2c38082dd7ac8b851b1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'NListPlanet';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/Logo.png',
    badge: '/Logo.png',
    image: payload.notification?.image || payload.data?.imageUrl,
    tag: payload.data?.type || payload.messageId || 'default',
    timestamp: Date.now(),
    data: {
      url: payload.data?.actionUrl || payload.fcm_options?.link || '/',
      clickAction: payload.data?.actionUrl || payload.fcm_options?.link || '/',
      type: payload.data?.type || 'general',
      payload: payload.data || {}
    },
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200, 100, 200],
    renotify: true,
    dir: 'ltr',
    lang: 'en-US',
    actions: [
      {
        action: 'open',
        title: '📱 Open',
        icon: '/Logo.png'
      },
      {
        action: 'close',
        title: '❌ Dismiss'
      }
    ]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || 
                    event.notification.data?.clickAction || 
                    '/dashboard';

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Navigate to the URL and focus
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated v1.0.5');
  event.waitUntil(self.clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed v1.0.5');
  self.skipWaiting();
});

// CRITICAL: Handle push events directly (fallback if onBackgroundMessage doesn't work)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
  
  if (!event.data) {
    console.log('[firebase-messaging-sw.js] No data in push event');
    return;
  }

  try {
    const payload = event.data.json();
    console.log('[firebase-messaging-sw.js] Push payload:', payload);

    // Check if notification is already handled by FCM
    if (payload.notification) {
      console.log('[firebase-messaging-sw.js] FCM notification, letting Firebase handle it');
      return;
    }

    // Handle data-only messages
    const notificationTitle = payload.data?.title || payload.title || 'NListPlanet';
    const notificationBody = payload.data?.body || payload.body || payload.data?.message || 'You have a new notification';
    
    const notificationOptions = {
      body: notificationBody,
      icon: '/Logo.png',
      badge: '/Logo.png',
      tag: payload.data?.type || 'nlistplanet-push',
      timestamp: Date.now(),
      data: payload.data || {},
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling push:', error);
  }
});
