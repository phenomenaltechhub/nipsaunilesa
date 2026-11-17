import { cacheName, cachePrefix, publicAssets, publicCacheKey } from './src/pwa/cache-policy.js';

const worker = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

worker.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    for (const asset of publicAssets) {
      const url = new URL(asset, worker.registration.scope).href;
      const response = await fetch(new Request(url, { credentials: 'omit', cache: 'reload', redirect: 'error' }));
      if (!response.ok || response.type === 'opaque' || response.url !== url || /no-store|private/i.test(response.headers.get('cache-control') || '')) throw new Error('Public offline shell could not be verified.');
      await cache.put(url, response);
    }
  })());
});

worker.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(cachePrefix) && key !== cacheName) await caches.delete(key);
    await worker.clients.claim();
  })());
});

worker.addEventListener('fetch', event => {
  const key = publicCacheKey(event.request, worker.registration.scope);
  if (!key) return;
  // Runtime requests never populate the cache. Public entries originate only from
  // the credential-free installation above; no authenticated response is stored.
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(key) || fetch(event.request);
  })());
});

worker.addEventListener('message', event => {
  if (event.data?.type !== 'APPLY_PUBLIC_SHELL_UPDATE' || !event.source || !('url' in event.source)) return;
  const source = new URL(event.source.url);
  const scope = new URL(worker.registration.scope);
  if (source.origin === scope.origin && source.pathname.startsWith(scope.pathname)) event.waitUntil(worker.skipWaiting());
});
