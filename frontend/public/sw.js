const CACHE_VERSION = 'v1.0.0';
const CACHE_PREFIX = 'giftwizard';
const CACHES = {
  STATIC: `${CACHE_PREFIX}-static-${CACHE_VERSION}`,
  DYNAMIC: `${CACHE_PREFIX}-dynamic-${CACHE_VERSION}`,
  API: `${CACHE_PREFIX}-api-${CACHE_VERSION}`,
  IMAGES: `${CACHE_PREFIX}-images-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.svg',
  '/fonts/inter-var.woff2'
];

const API_CACHE_PATTERNS = [
  /^\/api\/quiz\/generate/,
  /^\/api\/products\/search/,
  /^\/api\/gifts\/popular/
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHES.STATIC);
      await cache.addAll(STATIC_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validCaches = Object.values(CACHES);
      await Promise.all(
        cacheNames
          .filter(name => !validCaches.includes(name))
          .map(name => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.match(/\.(css|js|json)$/)) {
    event.respondWith(staticCacheStrategy(request));
    return;
  }

  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  event.respondWith(networkFirstStrategy(request));
});

const staticCacheStrategy = async (request) => {
  const cache = await caches.open(CACHES.STATIC);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Resource not available offline', { status: 503 });
  }
};

const networkFirstStrategy = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHES.API);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not OK');
  } catch (error) {
    const cache = await caches.open(CACHES.API);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'offline',
        message: 'Нет подключения к интернету'
      }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Offline', { status: 503 });
  }
};

const staleWhileRevalidateStrategy = async (request) => {
  const cache = await caches.open(CACHES.IMAGES);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {});
  
  if (cachedResponse) {
    event.waitUntil(fetchPromise);
    return cachedResponse;
  }
  
  try {
    return await fetchPromise;
  } catch (error) {
    return new Response('Image not available', { status: 503 });
  }
};

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});