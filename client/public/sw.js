// Service Worker for Ausflug Manager PWA
const CACHE_VERSION = 'v2';
const CACHE_NAME = `ausflug-manager-${CACHE_VERSION}`;
const API_CACHE = `ausflug-api-${CACHE_VERSION}`;

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip WebSocket upgrade requests - they must not be intercepted by Service Worker
  // WebSocket upgrades use the upgrade header which cannot be handled by fetch()
  if (request.headers.get('upgrade') === 'websocket') {
    console.log('[Service Worker] Skipping WebSocket upgrade request:', url.pathname);
    return;
  }

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // Clone the response before caching
            const responseToCache = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  if (
    request.method === 'GET' &&
    (url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.gif') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.ttf') ||
      url.pathname.endsWith('.eot'))
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return response;
            })
            .catch(() => {
              // Return a fallback if both cache and network fail
              if (request.destination === 'image') {
                return caches.match('/images/placeholder.png');
              }
              return new Response('Offline - resource not available', {
                status: 503,
              });
            })
        );
      })
    );
    return;
  }

  // HTML documents - Network first, fallback to cache
  if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Default strategy - network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);

  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  } else if (event.tag === 'location-sync') {
    event.waitUntil(syncLocation());
  }
});

async function syncTrips() {
  try {
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes('/api/trips')) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response.clone());
          }
        } catch (error) {
          console.error('[Service Worker] Sync failed for:', request.url, error);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync error:', error);
  }
}

// Background location sync
async function syncLocation() {
  try {
    console.log('[Service Worker] Syncing location data...');

    // Get pending location from IndexedDB (if available)
    const db = await openIndexedDB();
    if (!db) {
      console.warn('[Service Worker] IndexedDB not available');
      return;
    }

    const pendingLocations = await getPendingLocations(db);
    if (pendingLocations.length === 0) {
      console.log('[Service Worker] No pending locations to sync');
      return;
    }

    for (const location of pendingLocations) {
      try {
        const response = await fetch('/trpc/push.updateLocation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
          }),
        });

        if (response.ok) {
          await removePendingLocation(db, location.id);
          console.log('[Service Worker] Location synced successfully');
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync location:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Location sync error:', error);
  }
}

// IndexedDB helpers for location caching
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ausflug-manager', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-locations')) {
        db.createObjectStore('pending-locations', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getPendingLocations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-locations'], 'readonly');
    const store = transaction.objectStore('pending-locations');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingLocation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-locations'], 'readwrite');
    const store = transaction.objectStore('pending-locations');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  if (!event.data) {
    console.warn('[Service Worker] Push event has no data');
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    console.warn('[Service Worker] Failed to parse push payload as JSON');
    payload = {
      title: 'Ausflug Manager',
      message: event.data.text(),
    };
  }

  const options = {
    body: payload.message || 'Neue Benachrichtigung',
    title: payload.title || 'Ausflug Manager',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    tag: payload.tag || 'notification',
    vibrate: [100, 50, 100],
    data: payload.data || {},
  };

  console.log('[Service Worker] Showing notification:', options);

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);

  event.notification.close();

  // Get the URL from notification data
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === new URL(url, self.location.origin).href && 'focus' in client) {
          console.log('[Service Worker] Focusing existing window');
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        console.log('[Service Worker] Opening new window:', url);
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.tag);
});
