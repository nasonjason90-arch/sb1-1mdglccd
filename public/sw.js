self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('zh-v1').then((cache) => cache.addAll(['/','/index.html']))
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const resClone = res.clone();
      caches.open('zh-v1').then((cache) => cache.put(req, resClone));
      return res;
    }).catch(() => cached))
  );
});
