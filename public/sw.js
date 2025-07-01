const CACHE_NAME = 'vibelux-v3';
const STATIC_CACHE = 'vibelux-static-v3';
const DYNAMIC_CACHE = 'vibelux-dynamic-v3';

const urlsToCache = [
  '/',
  '/dashboard',
  '/design',
  '/calculators',
  '/fixtures',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg'
];

// Static assets to cache (CSS, JS, images)
const staticAssets = [
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/offline.html'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Enhanced fetch strategy with caching
self.addEventListener('fetch', event => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip problematic URLs
  if (event.request.url.includes('_next/static') ||
      event.request.url.includes('chunks/app/') ||
      event.request.url.includes('hot-reload') ||
      event.request.url.includes('sockjs-node')) {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Network first for API calls (skip caching for non-GET requests)
  if (url.pathname.startsWith('/api/')) {
    if (request.method !== 'GET') {
      event.respondWith(fetch(request));
    } else {
      event.respondWith(networkFirst(request));
    }
    return;
  }

  // Cache first for static assets
  if (request.destination === 'image' || 
      request.destination === 'script' ||
      request.destination === 'style' ||
      staticAssets.some(asset => url.pathname.includes(asset))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale while revalidate for pages
  event.respondWith(staleWhileRevalidate(request));
});

// Network first strategy (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response(
      JSON.stringify({ error: 'Offline' }), 
      { status: 503, headers: { 'Content-Type': 'application/json' }}
    );
  }
}

// Cache first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback for essential assets
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    return new Response('', { status: 503 });
  }
}

// Stale while revalidate strategy (for pages)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse || caches.match('/offline.html'));
  
  return cachedResponse || fetchPromise;
}

// Activate Service Worker and clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-designs') {
    event.waitUntil(syncDesigns());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Vibelux', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Helper function to sync offline data
async function syncDesigns() {
  // Implementation for syncing offline data
  console.log('Syncing offline designs...');
}