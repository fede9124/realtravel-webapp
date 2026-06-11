/* Real Travel — Service Worker
   Estrategias:
   - Navegación: network-first → caché → /offline
   - Estáticos de Next (hash inmutable): cache-first
   - Imágenes (Unsplash): stale-while-revalidate con límite
*/

const VERSION = 'rt-v1'
const SHELL_CACHE = `${VERSION}-shell`
const RUNTIME_CACHE = `${VERSION}-runtime`
const IMAGE_CACHE = `${VERSION}-images`
const IMAGE_LIMIT = 60

const PRECACHE = [
  '/explorar',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    await cache.delete(keys[0])
    return trimCache(cacheName, maxEntries)
  }
}

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Navegación: network-first con fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match('/offline')
        })
    )
    return
  }

  // Estáticos de Next con hash: cache-first
  if (url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(response => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy))
          return response
        })
      )
    )
    return
  }

  // Imágenes externas: stale-while-revalidate con límite
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async cache => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then(response => {
            if (response.ok) {
              cache.put(request, response.clone())
              trimCache(IMAGE_CACHE, IMAGE_LIMIT)
            }
            return response
          })
          .catch(() => cached)
        return cached || network
      })
    )
    return
  }

  // Resto del mismo origen: network-first con fallback a caché
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request))
    )
  }
})
