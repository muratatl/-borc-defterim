'use strict';

// Cache sürümünü uygulama kabuğunda değişiklik yaptığında artır.
const CACHE_NAME = 'borc-defterim-v8-shell-3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

const scopedUrl = path => new URL(path, self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL.map(scopedUrl));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name.startsWith('borc-defterim-v8-shell-') && name !== CACHE_NAME)
        .map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase/CDN is network-only.

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          // Cache the canonical app entry, not an arbitrary query-string URL.
          await cache.put(scopedUrl('./index.html'), response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(scopedUrl('./index.html')))
          || (await caches.match(scopedUrl('./')))
          || new Response('Çevrimdışı. Uygulamayı ilk kez açmak için internet bağlantısı gerekir.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      return await fetch(request);
    } catch (_) {
      return new Response('', { status: 503, statusText: 'Offline' });
    }
  })());
});
