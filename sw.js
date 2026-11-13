/* StudySphere Service Worker — conservative strategy
 *
 * - HTML page loads (navigations): ALWAYS network-first, so the daily
 *   content updates (news, quizzes, notes published into index.html)
 *   are never stuck behind a stale cache. The cache is only a fallback
 *   when the phone is offline.
 * - Same-origin static assets (icons, CSS, JS, images, PDFs):
 *   cache-first with network fallback, refreshed in the background.
 * - Cross-origin requests (e.g. GoatCounter, Google Fonts): untouched,
 *   handled by the network as usual.
 */

const CACHE_NAME = 'studysphere-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => { /* never block installation on a failed precache */ })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests on our own origin.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML / navigation requests: NETWORK-FIRST (fresh daily content wins).
  const isNavigation = request.mode === 'navigate';
  const acceptsHtml = (request.headers.get('accept') || '').includes('text/html');
  if (isNavigation || acceptsHtml) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Keep a fresh copy for offline fallback.
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: CACHE-FIRST, then network (and cache what we fetch).
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
