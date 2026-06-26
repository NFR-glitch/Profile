const CACHE_NAME = "profile-pwa-v2";

const ASSETS = [
  "../index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install - cache semua asset
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - hapus cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch - cache first, fallback ke network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Message - handle push notification dari client
self.addEventListener("message", (event) => {
  if (event.data === "Web Push Notification Berhasil") {
    self.registration.showNotification("Notifikasi PWA", {
      body: "Web Push Notification Berhasil!",
      icon: "./icon-192.png",
      vibrate: [200, 100, 200]
    });
  }
});