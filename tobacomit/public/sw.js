const CACHE_NAME = 'stop-tabac-v2';
const ASSETS = [
  // Do NOT cache HTML routes to avoid stale sessions
  '/stylesheets/style.css',
  '/javascripts/pwa.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const accept = req.headers.get('accept') || '';

  // Always network-first for navigations/HTML so session is fresh
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      fetch(req).catch(() => caches.match('/'))
    );
    return;
  }

  // Network-first for APIs
  if (req.url.includes('/api/')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});


