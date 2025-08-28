// Service Worker for FreelancePro SL PWA
const CACHE_NAME = 'freelance-pro-sl-v2';
const BASE_PATH = location.pathname.replace(/\/service-worker\.js$/, '');

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/images/favicon.svg`,
  `${BASE_PATH}/images/favicon.png`,
  `${BASE_PATH}/images/icon-192.png`,
  `${BASE_PATH}/images/icon-512.png`,
  `${BASE_PATH}/images/logo.svg`,
  `${BASE_PATH}/images/logo-mobile.svg`,
  `${BASE_PATH}/images/hero-illustration.svg`
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API requests
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          });
      })
  );
});

// Update a service worker
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
  // Tell the active service worker to take control of the page immediately
  self.clients.claim();
});

// Handle push notifications
self.addEventListener('push', event => {
  const title = 'FreelancePro SL';
  const options = {
    body: event.data.text(),
    icon: '/images/favicon.png',
    badge: '/images/favicon.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://freelanceprosl.github.io')
  );
});
