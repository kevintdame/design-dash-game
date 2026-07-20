const CACHE_NAME = 'designdash-v3';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
  // Clear old cache versions
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Never cache API requests or non-GET requests
  if (e.request.url.includes('/api/') || e.request.method !== 'GET') {
    return;
  }

  const url = e.request.url;
  // Network-First for HTML documents and manifest configurations to prevent caching old script hashes
  const isHtml = url.endsWith('/') || url.includes('index.html') || url.includes('manifest.json');

  if (isHtml) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
  } else {
    // Cache-First falling back to Network for hashed bundle assets and static files
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        });
      })
    );
  }
});
