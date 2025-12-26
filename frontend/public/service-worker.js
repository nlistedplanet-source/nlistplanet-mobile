// Update cache version to force refresh - Dec 26, 2025 v3.0.0 - Share modal fix
const CACHE_NAME = 'nlistplanet-v13';
const STATIC_CACHE = 'nlistplanet-static-v13';

// Only cache static assets, not HTML
const urlsToCache = [
  '/manifest.json',
  '/Logo.png',
  '/new_logo.png'
];

// Install event - cache resources and take over immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('[SW] Cache addAll failed:', error);
      })
  );
  // Force this service worker to become active immediately
  self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL old caches
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - NETWORK FIRST for HTML, cache first for static assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  const url = new URL(event.request.url);
  
  // For HTML requests (navigation) - ALWAYS try network first
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Only serve cached HTML if offline
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For static assets - cache first, then network
  if (url.pathname.startsWith('/static/') || 
      url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          });
        })
    );
    return;
  }

  // For everything else - network first
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('NlistPlanet', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
