const CACHE_NAME = 'sqweeky-clean-v27';
const ASSETS = [
  './',
  './index.html',
  './css/style.css?v=27',
  './js/audio-engine.js?v=27',
  './js/sound-library.js?v=27',
  './js/sequencer.js?v=27',
  './js/sound-editor.js?v=27',
  './js/templates.js?v=27',
  './js/app.js?v=27',
  './favicon.svg',
  './manifest.json'
];

// Install: pre-cache all assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fall back to cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((response) => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
      return response;
    }).catch(() => caches.match(e.request))
  );
});
