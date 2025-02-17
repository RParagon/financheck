const CACHE_NAME = 'financheck-cache-v1';
const urlsToCache = [
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/supabaseClient.js',
  './js/auth.js',
  './js/storage.js',
  './js/gamification.js',
  './js/ui.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
