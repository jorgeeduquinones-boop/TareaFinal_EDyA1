// =============================================================================
// service-worker.js — Cachea la app para uso offline
// =============================================================================
// Estrategia: cache-first para los assets propios; network-first para Chart.js
// (CDN). Si la red falla y no hay cache, intenta servir index.html como fallback.
// =============================================================================

const CACHE = 'clientela-edya1-v5';
const ASSETS = [
  './',
  './index.html',
  './inicio.html',
  './404.html',
  './manifest.json',
  './css/styles.css',
  './css/inicio.css',
  './js/algoritmos.js',
  './js/parser.js',
  './js/util.js',
  './js/generador.js',
  './js/benchmark.js',
  './js/tests.js',
  './js/icons.js',
  './js/app.js',
  './js/inicio.js',
  './icons/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Solo cacheamos GET.
  if (e.request.method !== 'GET') return;

  // CDN externo: network-first, cache como fallback.
  if (url.origin !== self.location.origin) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Mismo origen: cache-first.
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) return res;
      return fetch(e.request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
