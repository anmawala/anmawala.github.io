const CACHE_NAME = 'v1.0.2';
const resources = [
    "/sw/",
    "/sw/index.html",
    "/sw/style.css",
    //"/sw/script.js",
    "/sw/icons/icon-192x192.png",
    "/sw/icons/icon-512x512.png",
    "/sw/version.json",
];

async function addResourcesToCache(resources) {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(resources);
}

self.addEventListener("install", (event) => {
    event.waitUntil(addResourcesToCache(resources));
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Handle fetch errors
                return caches.match("/sw/index.html");
            });
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Listen for skip waiting message
self.addEventListener("message", (event) => {
    if (event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.onpush = (event) => {
    console.log(event);
};
