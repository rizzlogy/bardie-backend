const CACHE_NAME = "bardie-cache-v1";
const urlsToCache = [
  "/",
  "/chat",
  "/assets/js/manifest.json",
  "/assets/img/icon.png",
  "/assets/css/bard.css",
  "/assets/js/bard.js",
  "https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif",
  "https://www.gravatar.com/avatar",
  "/favicon",
  "https://github-production-user-asset-6210df.s3.amazonaws.com/141845356/282263069-da757ced-10e1-4f07-b84a-a705a8cc619f.png",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
  "https://cdn.jsdelivr.net/npm/sweetalert2@10",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
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
        }),
      );
    }),
  );
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/assets/js/service-worker.js")
    .then((registration) => {
      console.log("Service Worker registered");
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}
