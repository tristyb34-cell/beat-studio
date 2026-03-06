const CACHE_NAME = 'sqweeky-clean-v22';
const ASSETS = [
  './',
  './index.html',
  './css/style.css?v=22',
  './js/audio-engine.js?v=22',
  './js/sound-library.js?v=22',
  './js/sequencer.js?v=22',
  './js/sound-editor.js?v=22',
  './js/templates.js?v=22',
  './js/app.js?v=22',
  './favicon.svg'
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

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
