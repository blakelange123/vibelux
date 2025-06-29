const CACHE_NAME = 'vibelux-v2';
const urlsToCache = [
  '/',
  '/dashboard',
  '/design',
  '/calculators',
  '/fixtures',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico'
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

// Fetch event - Pass through to network
self.addEventListener('fetch', event => {
  // Skip chrome-extension and data URLs
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip certain problematic URLs (removed icon exclusion)
  if (event.request.url.includes('_next/static') ||
      event.request.url.includes('chunks/app/')) {
    return;
  }
  
  // Pass through all requests to the network
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.log('SW fetch failed for:', event.request.url, error);
      return new Response('Offline', { status: 503 });
    })
  );
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

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