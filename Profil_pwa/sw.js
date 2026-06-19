const CACHE_NAME = "profile-pwa-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./sricpt.js",
  "./manifest.json",
  "./WhatsApp Image 2026-03-24 at 07.52.14.jpeg",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  "https://unpkg.com/leaflet/dist/leaflet.css",
  "https://unpkg.com/leaflet/dist/leaflet.js"
];

// Install Event - cache all static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching all static assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clear old cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - network-first for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  // If the request is for the articles API, go network-first
  // Tangkap request API dari endpoint /articles (tidak bergantung localhost)
  if (event.request.url.includes("/articles")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback for offline API request: return an empty list
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic assets if they are valid basic requests
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // If offline and not in cache, fallback gracefully
      });
    })
  );
});

// Message Event - handle push notifications sent from the client
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data);
  if (event.data === "Web Push Notification Berhasil") {
    self.registration.showNotification("Notifikasi PWA", {
      body: "Hebat! Web Push Notification Berhasil di-trigger dari PWA.",
      icon: "./icon-192.png",
      vibrate: [200, 100, 200]
    });
  }
});
