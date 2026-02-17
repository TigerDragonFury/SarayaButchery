// Service Worker for Al Saraya Butchery - Caching & Offline Support
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Static assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/favicon.png',
  '/app-icon.png',
];

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Strategy 1: Supabase API — Network first, cache fallback (stale 5min)
  if (url.hostname.includes('supabase') && url.pathname.includes('/rest/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, 5 * 60 * 1000));
    return;
  }

  // Strategy 2: Images — Cache first, network fallback
  if (
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|webp|avif|gif|svg|ico)(\?|$)/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirstWithNetwork(request, IMAGE_CACHE, 7 * 24 * 60 * 60 * 1000));
    return;
  }

  // Strategy 3: JS/CSS bundles — Cache first (immutable hashed filenames)
  if (/\.(js|css)(\?|$)/i.test(url.pathname) && url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE, 30 * 24 * 60 * 60 * 1000));
    return;
  }

  // Strategy 4: Fonts — Cache first, long TTL
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE, 365 * 24 * 60 * 60 * 1000));
    return;
  }

  // Strategy 5: HTML navigation — Network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithCache(request, STATIC_CACHE, 60 * 1000));
    return;
  }
});

// Network first, fallback to cache
async function networkFirstWithCache(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const cloned = response.clone();
      // Store with timestamp header
      const headers = new Headers(cloned.headers);
      headers.set('sw-cached-at', Date.now().toString());
      const body = await cloned.blob();
      const cachedResponse = new Response(body, { status: cloned.status, statusText: cloned.statusText, headers });
      cache.put(request, cachedResponse);
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) {
      const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
      if (Date.now() - cachedAt < maxAge) return cached;
    }
    // For navigation, return cached index
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/');
      if (fallback) return fallback;
    }
    throw e;
  }
}

// Cache first, fallback to network
async function cacheFirstWithNetwork(request, cacheName, maxAge) {
  const cached = await caches.match(request);
  if (cached) {
    const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
    // For hashed assets, always serve from cache (immutable)
    if (cachedAt === 0 || Date.now() - cachedAt < maxAge) return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const cloned = response.clone();
      const headers = new Headers(cloned.headers);
      headers.set('sw-cached-at', Date.now().toString());
      const body = await cloned.blob();
      cache.put(request, new Response(body, { status: cloned.status, statusText: cloned.statusText, headers }));
    }
    return response;
  } catch (e) {
    if (cached) return cached;
    throw e;
  }
}
