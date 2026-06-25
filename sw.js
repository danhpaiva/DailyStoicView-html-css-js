const CACHE  = 'stoic-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/quotes.js',
  './assets/js/selector.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@400;500&display=swap',
];

// ── Install: precache all static assets ──────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ──────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for same-origin assets; network-first for fonts ───
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Network-first for Google Fonts (keeps typography fresh when online)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for everything else (app shell + assets)
  e.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback: return cached index.html for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
}
