// Service Worker for smart caching and performance optimization

const CACHE_NAME = 'loveworld-praise-v3';
const STATIC_CACHE = 'static-cache-v3';
const API_CACHE = 'api-cache-v3';
const IMAGE_CACHE = 'image-cache-v3';

// Resources to cache immediately for instant loading
const STATIC_RESOURCES = [
  '/',
  '/home',
  '/pages/rehearsals',
  '/pages/profile',
  '/pages/praise-night',
  '/pages/chat',
  '/pages/groups',
  '/pages/notifications',
  '/pages/support',
  '/logo.png',
  '/lmm.png',
  '/APP ICON/pwa_192_filled.png',
  '/APP ICON/pwa_512_filled.png',
  '/manifest.json',
  // Critical CSS and JS for instant loading
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  // Add other critical static resources
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/songs',
  '/api/praise-nights',
  '/api/categories',
  '/api/media',
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache static resources with error handling
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_RESOURCES).catch(error => {
          console.log('Failed to cache some static resources:', error);
          // Continue even if some resources fail
        });
      }),
      
      // Cache API endpoints with better error handling
      caches.open(API_CACHE).then(cache => {
        return Promise.allSettled(
          API_ENDPOINTS.map(endpoint => 
            cache.add(endpoint).catch(() => {
              console.log(`Failed to cache ${endpoint}`);
            })
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('🔄 Background sync: Syncing offline data...');
    // Sync any pending messages, profile updates, etc.
    // This runs when the user comes back online
  } catch (error) {
    console.log('Background sync error:', error);
  }
}

// Push notifications for PWA
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/APP ICON/pwa_192_filled.png',
    badge: '/APP ICON/pwa_192_filled.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/APP ICON/pwa_192_filled.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/APP ICON/pwa_192_filled.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LoveWorld Singers', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Fetch event - implement smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with fallbacks
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstWithFallback(request, STATIC_CACHE));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirstWithFallback(request, IMAGE_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstWithFallback(request, API_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationWithFallback(request, STATIC_CACHE));
  } else {
    event.respondWith(networkFirstWithFallback(request, API_CACHE));
  }
});

// Improved cache strategies with fallbacks
async function cacheFirstWithFallback(request, cacheName) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache first failed:', error);
    // Return a basic fallback instead of error
    return new Response('Resource not available', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function networkFirstWithFallback(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network first failed, trying cache:', error);
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return basic fallback
    return new Response('Service unavailable', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function navigationWithFallback(request, cacheName) {
  try {
    // For navigation requests, try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Navigation failed:', error);
    // For navigation, always return something to prevent white screen
    const fallbackResponse = await caches.match('/');
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // Ultimate fallback - return a basic HTML page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LoveWorld Singers</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              margin: 0;
            }
            .container { max-width: 400px; margin: 0 auto; }
            .logo { font-size: 2em; margin-bottom: 20px; }
            .message { margin: 20px 0; }
            .button { 
              background: white; 
              color: #667eea; 
              padding: 10px 20px; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer;
              text-decoration: none;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎵 LoveWorld Singers</div>
            <div class="message">Loading your rehearsal hub...</div>
            <a href="/" class="button">Refresh</a>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network first failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached response or offline page
    return cachedResponse || new Response('Offline', { status: 503 });
  });

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/) || 
         url.hostname.includes('cloudinary.com');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase.co');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log('Performing background sync...');
  
  // You can implement offline action queuing here
  // For example, sync uploaded songs, comments, etc.
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View',
          icon: '/logo.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/logo.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});