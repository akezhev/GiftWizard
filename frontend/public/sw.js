
// GiftWizard Service Worker v1.0.0
// Оптимизирован для highload, кэширования и оффлайн-режима

const CACHE_VERSION = 'v1.0.0';
const CACHE_PREFIX = 'giftwizard';

// Названия кэшей
const CACHES = {
  STATIC: `${CACHE_PREFIX}-static-${CACHE_VERSION}`,
  DYNAMIC: `${CACHE_PREFIX}-dynamic-${CACHE_VERSION}`,
  API: `${CACHE_PREFIX}-api-${CACHE_VERSION}`,
  IMAGES: `${CACHE_PREFIX}-images-${CACHE_VERSION}`,
  FONTS: `${CACHE_PREFIX}-fonts-${CACHE_VERSION}`
};

// Файлы для кэширования при установке (критические ресурсы)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.svg',
  '/fonts/inter-var.woff2'
];

// API эндпоинты для кэширования (GET запросы)
const API_CACHE_PATTERNS = [
  /^\/api\/quiz\/generate/,
  /^\/api\/products\/search/,
  /^\/api\/categories/,
  /^\/api\/popular-gifts/
];

// Максимальное количество элементов в динамическом кэше
const MAX_DYNAMIC_CACHE_ITEMS = 100;
const MAX_API_CACHE_ITEMS = 50;
const MAX_IMAGE_CACHE_ITEMS = 200;

// Время жизни кэша (в миллисекундах)
const CACHE_TTL = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 дней
  DYNAMIC: 7 * 24 * 60 * 60 * 1000, // 7 дней
  API: 5 * 60 * 1000, // 5 минут
  IMAGES: 30 * 24 * 60 * 60 * 1000 // 30 дней
};

// ==================== Утилиты ====================

/**
 * Логирование в development режиме
 */
const log = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[SW]', ...args);
  }
};

/**
 * Очистка старых кэшей
 */
const clearOldCaches = async () => {
  const cacheNames = await caches.keys();
  const validCaches = Object.values(CACHES);
  
  const deletePromises = cacheNames
    .filter(name => !validCaches.includes(name))
    .map(name => {
      log('Deleting old cache:', name);
      return caches.delete(name);
    });
  
  await Promise.all(deletePromises);
};

/**
 * Управление размером кэша (LRU стратегия)
 */
const limitCacheSize = async (cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const itemsToDelete = keys.length - maxItems;
    log(`Removing ${itemsToDelete} items from ${cacheName}`);
    
    // Удаляем самые старые элементы
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
};

/**
 * Проверка устаревания кэша
 */
const isCacheValid = (cachedResponse, maxAge) => {
  if (!cachedResponse) return false;
  
  const cachedDate = cachedResponse.headers.get('sw-cache-date');
  if (!cachedDate) return false;
  
  const cacheAge = Date.now() - parseInt(cachedDate);
  return cacheAge < maxAge;
};

/**
 * Добавление метаданных в ответ для отслеживания кэша
 */
const addCacheMetadata = (response) => {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('sw-cache-date', Date.now().toString());
  newHeaders.set('sw-cache-version', CACHE_VERSION);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
};

// ==================== Обработчики событий ====================

/**
 * Установка Service Worker
 */
self.addEventListener('install', (event) => {
  log('Installing Service Worker');
  
  event.waitUntil(
    (async () => {
      // Открываем статический кэш
      const staticCache = await caches.open(CACHES.STATIC);
      
      // Добавляем статические ассеты
      await staticCache.addAll(STATIC_ASSETS);
      
      // Кэшируем шрифты отдельно
      const fontCache = await caches.open(CACHES.FONTS);
      await fontCache.add('/fonts/inter-var.woff2');
      
      log('Static assets cached');
      
      // Принудительно активируем SW сразу после установки
      await self.skipWaiting();
    })()
  );
});

/**
 * Активация Service Worker
 */
self.addEventListener('activate', (event) => {
  log('Activating Service Worker');
  
  event.waitUntil(
    (async () => {
      // Очищаем старые кэши
      await clearOldCaches();
      
      // Принимаем контроль над всеми клиентами
      await self.clients.claim();
      
      log('Service Worker activated and ready');
    })()
  );
});

/**
 * Перехват и обработка запросов
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем неподходящие запросы
  if (request.method !== 'GET') {
    return;
  }
  
  // Пропускаем запросы к браузерным расширениям
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // Пропускаем запросы к аналитике в оффлайн режиме
  if (url.hostname.includes('google-analytics') || url.hostname.includes('googletagmanager')) {
    return;
  }
  
  // Стратегии кэширования в зависимости от типа запроса
  
  // 1. Статические ассеты (Cache First)
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.match(/\.(css|js|json|webmanifest)$/)) {
    event.respondWith(staticCacheStrategy(request));
    return;
  }
  
  // 2. Шрифты (Cache First)
  if (url.pathname.match(/\.(woff2|woff|ttf|eot)$/)) {
    event.respondWith(fontsCacheStrategy(request));
    return;
  }
  
  // 3. Изображения (Stale While Revalidate)
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    event.respondWith(staleWhileRevalidateStrategy(request, CACHES.IMAGES, MAX_IMAGE_CACHE_ITEMS));
    return;
  }
  
  // 4. API запросы (Network First with Cache Fallback)
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request, CACHES.API, MAX_API_CACHE_ITEMS));
    return;
  }
  
  // 5. Все остальное (Network First)
  event.respondWith(networkFirstStrategy(request, CACHES.DYNAMIC, MAX_DYNAMIC_CACHE_ITEMS));
});

// ==================== Стратегии кэширования ====================

/**
 * Стратегия: Cache First (кэш в первую очередь)
 * Используется для статики, которая редко меняется
 */
const staticCacheStrategy = async (request) => {
  const cache = await caches.open(CACHES.STATIC);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    log('Static cache HIT:', request.url);
    return cachedResponse;
  }
  
  log('Static cache MISS:', request.url);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = addCacheMetadata(networkResponse.clone());
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    log('Network failed for static asset:', request.url);
    return new Response('Resource not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
};

/**
 * Стратегия: Network First (сеть в первую очередь)
 * Используется для API и динамического контента
 */
const networkFirstStrategy = async (request, cacheName, maxItems) => {
  try {
    // Пытаемся получить из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      const responseToCache = addCacheMetadata(networkResponse.clone());
      await cache.put(request, responseToCache);
      
      // Управляем размером кэша
      await limitCacheSize(cacheName, maxItems);
      
      log('Network success, cached:', request.url);
      return networkResponse;
    }
    
    throw new Error('Network response not OK');
  } catch (error) {
    // Если сеть недоступна, пытаемся получить из кэша
    log('Network failed, trying cache:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Проверяем, не устарел ли кэш
      if (isCacheValid(cachedResponse, CACHE_TTL.API)) {
        log('Cache HIT (valid):', request.url);
        return cachedResponse;
      } else {
        log('Cache HIT (stale):', request.url);
        // Возвращаем устаревший кэш, но помечаем как устаревший
        const staleResponse = cachedResponse.clone();
        const headers = new Headers(staleResponse.headers);
        headers.set('sw-cache-stale', 'true');
        
        return new Response(staleResponse.body, {
          status: staleResponse.status,
          statusText: staleResponse.statusText,
          headers: headers
        });
      }
    }
    
    // Нет ни сети, ни кэша
    log('No cache available:', request.url);
    
    // Возвращаем fallback для API
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'offline',
        message: 'Нет подключения к интернету. Пожалуйста, проверьте соединение.',
        cached: false
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Для остальных запросов возвращаем страницу оффлайн
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
};

/**
 * Стратегия: Stale While Revalidate
 * Используется для изображений - сначала кэш, потом обновление
 */
const staleWhileRevalidateStrategy = async (request, cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Фоновое обновление
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = addCacheMetadata(networkResponse.clone());
      await cache.put(request, responseToCache);
      await limitCacheSize(cacheName, maxItems);
      log('Background updated:', request.url);
    }
    return networkResponse;
  }).catch(error => {
    log('Background update failed:', request.url, error);
  });
  
  // Возвращаем кэш, если есть
  if (cachedResponse) {
    // Не ждем обновления
    event.waitUntil(fetchPromise);
    return cachedResponse;
  }
  
  // Если нет в кэше, ждем сеть
  try {
    const networkResponse = await fetchPromise;
    return networkResponse;
  } catch (error) {
    log('No cache and network failed:', request.url);
    return new Response('Image not available offline', {
      status: 503,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
};

/**
 * Стратегия: Cache Only для шрифтов (чтобы не ломать отображение)
 */
const fontsCacheStrategy = async (request) => {
  const cache = await caches.open(CACHES.FONTS);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = addCacheMetadata(networkResponse.clone());
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    log('Font not available:', request.url);
    // Возвращаем fallback шрифт
    return new Response('', { status: 404 });
  }
};

// ==================== Фоновая синхронизация ====================

/**
 * Обработка фоновой синхронизации для отложенных запросов
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncQuizResults());
  }
});

/**
 * Синхронизация результатов тестов, сохраненных в оффлайн
 */
const syncQuizResults = async () => {
  log('Syncing quiz results');
  
  try {
    // Получаем сохраненные результаты из IndexedDB
    const db = await openDB();
    const pendingResults = await db.getAll('pending-quiz');
    
    for (const result of pendingResults) {
      try {
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data)
        });
        
        if (response.ok) {
          await db.delete('pending-quiz', result.id);
          log('Synced quiz result:', result.id);
          
          // Отправляем уведомление пользователю
          sendNotification('Результаты готовы!', 'Ваш подбор подарков завершен.');
        }
      } catch (error) {
        log('Failed to sync quiz result:', result.id, error);
      }
    }
  } catch (error) {
    log('Sync failed:', error);
  }
};

// ==================== Push уведомления ====================

/**
 * Получение push-уведомлений
 */
self.addEventListener('push', (event) => {
  log('Push notification received');
  
  let data = {
    title: 'GiftWizard',
    body: 'Новые рекомендации подарков!',
    icon: '/icon-192.png',
    badge: '/favicon-32x32.png'
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Открыть'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Обработка клика по уведомлению
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // Проверяем, есть ли уже открытое окно
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Если нет, открываем новое
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ==================== Утилиты для IndexedDB ====================

/**
 * Открытие соединения с IndexedDB
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GiftWizardDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Создаем хранилище для ожидающих запросов
      if (!db.objectStoreNames.contains('pending-quiz')) {
        const store = db.createObjectStore('pending-quiz', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Создаем хранилище для оффлайн данных
      if (!db.objectStoreNames.contains('offline-data')) {
        db.createObjectStore('offline-data', { keyPath: 'key' });
      }
    };
  });
};

// ==================== Отправка уведомлений ====================

/**
 * Отправка уведомления пользователю
 */
const sendNotification = (title, body) => {
  if (self.registration.showNotification) {
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon-192.png',
      badge: '/favicon-32x32.png',
      vibrate: [200, 100, 200]
    });
  }
};

// ==================== Обновление Service Worker ====================

/**
 * Обработка сообщений от клиента
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        const cacheNames = Object.values(CACHES);
        const deletePromises = cacheNames.map(name => caches.delete(name));
        await Promise.all(deletePromises);
        log('All caches cleared');
        
        if (event.source) {
          event.source.postMessage({ type: 'CACHE_CLEARED' });
        }
      })()
    );
  }
});

// ==================== Периодическая фоновая синхронизация ====================

/**
 * Периодическая фоновая синхронизация (для обновления данных)
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-gifts') {
    event.waitUntil(updatePopularGifts());
  }
});

/**
 * Обновление популярных подарков в фоне
 */
const updatePopularGifts = async () => {
  log('Updating popular gifts in background');
  
  try {
    const response = await fetch('/api/popular-gifts');
    if (response.ok) {
      const data = await response.json();
      
      // Сохраняем в кэш
      const cache = await caches.open(CACHES.API);
      const responseToCache = addCacheMetadata(new Response(JSON.stringify(data)));
      await cache.put('/api/popular-gifts', responseToCache);
      
      log('Popular gifts updated');
    }
  } catch (error) {
    log('Failed to update popular gifts:', error);
  }
};

// ==================== Экспорт для отладки ====================

// В development режиме добавляем глобальные методы для отладки
if (process.env.NODE_ENV === 'development') {
  self.__SW_DEBUG__ = {
    caches: CACHES,
    clearAllCaches: async () => {
      const cacheNames = Object.values(CACHES);
      const deletePromises = cacheNames.map(name => caches.delete(name));
      await Promise.all(deletePromises);
      log('All caches cleared (debug)');
    },
    getCacheStats: async () => {
      const stats = {};
      for (const [name, cacheName] of Object.entries(CACHES)) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[name] = keys.length;
      }
      return stats;
    }
  };
}