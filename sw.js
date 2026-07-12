// Version 4.2 — siempre red fetch, nunca cache de auth
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(k) { return Promise.all(k.map(function(x) { return caches.delete(x); })); }));
  return self.clients.claim();
});
self.addEventListener('fetch', function(e) {
  // No cachear nunca páginas HTML ni auth redirects
  if (e.request.method === 'GET') {
    var url = new URL(e.request.url);
    if (url.pathname.indexOf('__/auth/') >= 0 || url.pathname.indexOf('reditos-pwa') >= 0) {
      e.respondWith(fetch(e.request));
      return;
    }
  }
  e.respondWith(fetch(e.request).catch(function() { return caches.match(e.request); }));
});