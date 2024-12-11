const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
    '/sw/',
    '/sw/icons/icon-192x192.png',
    '/sw/icons/icon-512x512.png',
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache:', error);
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    console.log('Fetch event for:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Found in cache:', event.request.url);
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Activate event
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

// Versione 2