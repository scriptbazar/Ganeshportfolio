const CACHE_NAME = 'ganeshdev-v6.5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/projects.html',
  '/manifest.json'
];

// Install Event - Pre-cache core static assets safely
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        // Silently handle pre-cache warning
      });
    }).catch(() => {})
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()).catch(() => {})
  );
});

// Fetch Event - Safe Network-First with Cache Fallback
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Only cache same-origin assets, bypass external APIs / embeds
  if (!isSameOrigin) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache).catch(() => {
              // Silently ignore sandbox/network error on put
            });
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request).catch(() => {});
      })
  );
});
