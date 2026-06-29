const CACHE_NAME = 'spa-portal-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/studentportal.html',
  '/style.css',
  '/logo.png',
  '/bg.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
