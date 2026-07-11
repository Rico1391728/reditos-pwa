// Mis Réditos - Service Worker v4
var CACHE = 'reditos-v4';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
          .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.url.startsWith(self.location.origin)) {
    // Para archivos HTML, siempre ir a la red primero
    if (e.request.url.endsWith('.html') || e.request.url.endsWith('/') || e.request.headers.get('accept').includes('text/html')) {
      e.respondWith(
        fetch(e.request).catch(function() {
          return caches.match(e.request);
        })
      );
    } else {
      // Para otros archivos (CSS, JS, imágenes), usar caché primero
      e.respondWith(
        caches.open(CACHE).then(function(cache) {
          return cache.match(e.request).then(function(response) {
            var fetchPromise = fetch(e.request).then(function(networkResponse) {
              cache.put(e.request, networkResponse.clone());
              return networkResponse;
            });
            return response || fetchPromise;
          });
        })
      );
    }
  }
});
