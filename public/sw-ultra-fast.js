// ULTRA FAST Service Worker - Aggressive Caching for Instant Loading

const CACHE_VERSION = 'ultra-fast-v' + Date.now();
const CACHE_NAMES = {
  STATIC: 'static-ultra-fast',
  API: 'api-ultra-fast', 
  IMAGES: 'images-ultra-fast',
  PAGES: 'pages-ultra-fast'
};

// Cache EVERYTHING aggressively
const AGGRESSIVE_CACHE_PATTERNS = [
  // All pages
  /^\/$/,
  /^\/home/,
  /^\/pages\/rehearsals/,
  /^\/pages\/profile/,
  /^\/pages\/praise-night/,
  /^\/admin/,
  /^\/auth/,
  
  // All API calls
  /^\/api\//,
  
  // All static assets
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$/,
  
  // Cloudinary images
  /cloudinary\.com/,
  
  // Supabase calls
  /supabase\.co/
];

// Install - Cache everything immediately
self.addEventListener('install', (event) => {
  console.log('🚀 ULTRA FAST SW installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.STATIC),
      caches.open(CACHE_NAMES.API),
      caches.open(CACHE_NAMES.IMAGES),
      caches.open(CACHE_NAMES.PAGES)
    ]).then(() => {
      console.log('🚀 ULTRA FAST SW installed - Ready for instant loading!');
      return self.skipWaiting();
    })
  );
});

// Activate - Take control immediately
self.addEventListener('activate', (event) => {
  console.log('🚀 ULTRA FAST SW activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🚀 ULTRA FAST SW activated - Taking control!');
      return self.clients.claim();
    })
  );
});

// Fetch - ULTRA AGGRESSIVE CACHING
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Determine cache strategy based on URL
  if (isPageRequest(request)) {
    event.respondWith(ultraFastPageStrategy(request));
  } else if (isImageRequest(request)) {
    event.respondWith(ultraFastImageStrategy(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(ultraFastAPIStrategy(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(ultraFastStaticStrategy(request));
  } else {
    event.respondWith(ultraFastDefaultStrategy(request));
  }
});

// ULTRA FAST STRATEGIES

// Pages: Cache first, then network, then offline page
async function ultraFastPageStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.PAGES);
  
  // Try cache first (INSTANT)
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request, cache);
    return cachedResponse;
  }

  // Try network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for page:', request.url);
  }

  // Return offline page
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Offline - LWSRH</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui; text-align: center; padding: 50px; }
          .offline { color: #666; }
        </style>
      </head>
      <body>
        <h1 class="offline">You're offline</h1>
        <p>This page will be available when you're back online.</p>
        <button onclick="location.reload()">Retry</button>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Images: Cache first, aggressive caching
async function ultraFastImageStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.IMAGES);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// API: Network first with aggressive caching
async function ultraFastAPIStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.API);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache for 5 minutes
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      
      // Auto-expire after 5 minutes
      setTimeout(() => {
        cache.delete(request);
      }, 5 * 60 * 1000);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static assets: Cache forever
async function ultraFastStaticStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.STATIC);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

// Default: Cache first
async function ultraFastDefaultStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.STATIC);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Helper function to fetch and cache in background
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Ignore background fetch errors
  }
}

// Helper functions
function isPageRequest(request) {
  return request.mode === 'navigate' || 
         request.headers.get('accept')?.includes('text/html');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/) ||
         url.hostname.includes('cloudinary.com');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('supabase.co');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/) ||
         url.pathname.startsWith('/_next/static/');
}

// Background sync for instant updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Background sync - keeping cache fresh');
  
  // Pre-cache likely next pages
  const likelyPages = [
    '/',
    '/home',
    '/pages/rehearsals',
    '/pages/profile',
    '/pages/praise-night'
  ];
  
  const cache = await caches.open(CACHE_NAMES.PAGES);
  
  for (const page of likelyPages) {
    try {
      const response = await fetch(page);
      if (response.ok) {
        cache.put(page, response.clone());
      }
    } catch (error) {
      // Ignore errors
    }
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAMES.PAGES).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  // Handle cache clearing requests
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(CACHE_NAMES.STATIC),
        caches.delete(CACHE_NAMES.API),
        caches.delete(CACHE_NAMES.IMAGES),
        caches.delete(CACHE_NAMES.PAGES)
      ]).then(() => {
        console.log('🧹 Service Worker cache cleared');
        event.ports[0]?.postMessage({ success: true });
      })
    );
  }
  
  // Handle version-based cache invalidation
  if (event.data && event.data.type === 'VERSION_UPDATE') {
    const newVersion = event.data.version;
    if (newVersion !== CACHE_VERSION) {
      console.log('🔄 Version changed, clearing cache...');
      event.waitUntil(
        Promise.all([
          caches.delete(CACHE_NAMES.STATIC),
          caches.delete(CACHE_NAMES.API),
          caches.delete(CACHE_NAMES.IMAGES),
          caches.delete(CACHE_NAMES.PAGES)
        ]).then(() => {
          console.log('✅ Cache cleared for new version');
        })
      );
    }
  }
});

console.log('🚀 ULTRA FAST Service Worker loaded - Ready for instant speed!');
