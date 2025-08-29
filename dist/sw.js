const CACHE_NAME = 'speaktiles-v1'
const STATIC_ASSETS = [
  './',
  './index.html',
  './src/main.jsx',
  './src/App.jsx',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker installed')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Service Worker install failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response before using it
        const responseClone = response.clone()
        
        // Cache successful responses (but not for external resources)
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone)
          })
        }
        
        return response
      })
      .catch(() => {
        // Network failed, try cache
        console.log('Network failed, trying cache for:', event.request.url)
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('Serving from cache:', event.request.url)
              return cachedResponse
            }
            
            // If not in cache and it's a page request, return the main page
            if (event.request.destination === 'document') {
              console.log('Returning main page for offline navigation')
              return caches.match('./index.html')
            }
            
            // Return a basic offline response
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            })
          })
      })
  )
})

// Handle offline/online status
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})