/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();
self.skipWaiting();

// Precache all files
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Cache first strategy for static assets
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  })
);

// Network first strategy for API calls
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 })],
  })
);

// Network first for HTML navigation
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'navigation-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);
registerRoute(navigationRoute);

// Fetch event - intercept requests but NOT WebSocket upgrades
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // CRITICAL: Skip WebSocket upgrade requests - they must NOT be intercepted by Service Worker
  // WebSocket upgrades use the 'upgrade' header which cannot be handled by fetch()
  // This must be done in the fetch event, not in route handlers
  if (request.headers.get('upgrade') === 'websocket') {
    console.log('[Service Worker] Skipping WebSocket upgrade request:', url.pathname);
    return;
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
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

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === new URL(url, self.location.origin).href && 'focus' in client) {
          console.log('[Service Worker] Focusing existing window');
          return client.focus();
        }
      }
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
