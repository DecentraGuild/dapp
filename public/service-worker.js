// Service Worker for dGuild dApp
// Lightweight caching for better performance

const CACHE_VERSION = 'dguild-v1.0.1'
const CACHE_NAME = `dguild-cache-${CACHE_VERSION}`

// Assets to cache on install (minimal - just index)
const PRECACHE_ASSETS = [
  '/index.html'
]

// Cache strategy: Network first with cache fallback
const NETWORK_FIRST_URLS = [
  '/SLP/', // All SLP JSON and image assets
  '.json'
]

// Cache strategy: Cache first for static built assets only
const CACHE_FIRST_URLS = [
  '/assets/', // Only built JS/CSS assets from Vite
]

// Skip caching for these (let browser handle)
const NO_CACHE_URLS = [
  'chrome-extension',
  'hot-update',
  '/__vite',
  '/node_modules'
]

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS)
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting()
    })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old cache versions
            return cacheName.startsWith('dguild-cache-') && cacheName !== CACHE_NAME
          })
          .map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim()
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Skip URLs that shouldn't be cached
  if (NO_CACHE_URLS.some(pattern => url.href.includes(pattern))) {
    return
  }

  // Determine caching strategy based on URL
  const isCacheFirst = CACHE_FIRST_URLS.some(pattern => url.pathname.includes(pattern))
  const isNetworkFirst = NETWORK_FIRST_URLS.some(pattern => 
    url.pathname.includes(pattern) || url.pathname.endsWith('.json')
  )

  if (isCacheFirst) {
    // Cache first strategy (for static built assets only)
    event.respondWith(cacheFirstStrategy(request))
  } else if (isNetworkFirst) {
    // Network first strategy (for dynamic SLP data)
    event.respondWith(networkFirstStrategy(request))
  } else {
    // Default: Network only (no caching for other resources)
    return
  }
})

// Cache first strategy - check cache, fallback to network
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    // Return cached response immediately
    return cachedResponse
  }

  try {
    // Fetch from network
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, no cache available
    console.error('Fetch failed:', error)
    throw error
  }
}

// Network first strategy - try network, fallback to cache
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Both network and cache failed
    console.error('Network and cache failed:', error)
    throw error
  }
}

// Message event - handle cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'CACHE_CLEARED',
              message: 'Cache has been cleared'
            })
          })
        })
      })
    )
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

