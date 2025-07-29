/**
 * Service Worker for MarkDown Ultra Editor
 * Provides offline functionality and caching for better performance
 */

const CACHE_NAME = "markdown-ultra-v1";
const STATIC_CACHE_NAME = "markdown-ultra-static-v1";
const DYNAMIC_CACHE_NAME = "markdown-ultra-dynamic-v1";

// Development-only logging helper
const devLog = (message, ...args) => {
  if (
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1"
  ) {
    console.log(message, ...args);
  }
};

const devError = (message, ...args) => {
  // Always log errors for debugging, but prefix for development
  if (
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1"
  ) {
    console.error(message, ...args);
  } else {
    // In production, only log critical errors
    console.error("SW Error:", message);
  }
};

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/files",
  "/markdownlogo.svg",
  "/site.webmanifest",
  // Add other static assets as needed
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  "/api/",
  "https://clerk.com",
  "https://clerk.accounts.dev",
  ".supabase.co",
];

// Cache-first resources (try cache first, fallback to network)
const CACHE_FIRST = [
  ".js",
  ".css",
  ".woff",
  ".woff2",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".ico",
];

/**
 * Install event - cache static assets
 */
self.addEventListener("install", (event) => {
  devLog("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        devLog("Service Worker: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        devLog("Service Worker: Installation complete");
        return self.skipWaiting();
      })
      .catch((error) => {
        devError("Service Worker: Installation failed", error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  devLog("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              devLog("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        devLog("Service Worker: Activation complete");
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle requests with caching strategies
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(handleFetch(request));
});

/**
 * Handle fetch requests with appropriate caching strategy
 */
async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // Network-first strategy for API calls and auth
    if (NETWORK_FIRST.some((pattern) => url.href.includes(pattern))) {
      return await networkFirst(request);
    }

    // Cache-first strategy for static assets
    if (CACHE_FIRST.some((pattern) => url.href.includes(pattern))) {
      return await cacheFirst(request);
    }

    // Stale-while-revalidate for HTML pages
    if (request.destination === "document") {
      return await staleWhileRevalidate(request);
    }

    // Default to network-first
    return await networkFirst(request);
  } catch (error) {
    devError("Service Worker: Fetch failed", error);

    // Return offline fallback if available
    if (request.destination === "document") {
      const cache = await caches.open(STATIC_CACHE_NAME);
      const fallback = await cache.match("/");
      if (fallback) {
        return fallback;
      }
    }

    // Return a basic offline response
    return new Response("Offline - Please check your connection", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" },
    });
  }
}

/**
 * Network-first caching strategy
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Cache-first caching strategy
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback to network
  const networkResponse = await fetch(request);

  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

/**
 * Stale-while-revalidate caching strategy
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Start network request in background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Otherwise wait for network
  return networkPromise;
}

/**
 * Background sync for offline file saves
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "file-save") {
    devLog("Service Worker: Background sync - file save");
    event.waitUntil(syncFileSaves());
  }
});

/**
 * Sync pending file saves when back online
 */
async function syncFileSaves() {
  try {
    // Get pending saves from IndexedDB or localStorage
    // This would integrate with your file storage service
    devLog("Service Worker: Syncing pending file saves...");

    // Notify main thread that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        data: { type: "file-save" },
      });
    });
  } catch (error) {
    devError("Service Worker: Sync failed", error);
  }
}

/**
 * Handle messages from main thread
 */
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CACHE_FILE":
      // Cache a file for offline access
      cacheFile(data.url, data.content);
      break;

    case "CLEAR_CACHE":
      // Clear specific cache
      clearCache(data.cacheName);
      break;

    default:
      devLog("Service Worker: Unknown message type", type);
  }
});

/**
 * Cache a file with custom content
 */
async function cacheFile(url, content) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(content, {
      headers: { "Content-Type": "text/markdown" },
    });
    await cache.put(url, response);
    devLog("Service Worker: File cached", url);
  } catch (error) {
    devError("Service Worker: Failed to cache file", error);
  }
}

/**
 * Clear specific cache
 */
async function clearCache(cacheName) {
  try {
    await caches.delete(cacheName);
    devLog("Service Worker: Cache cleared", cacheName);
  } catch (error) {
    devError("Service Worker: Failed to clear cache", error);
  }
}

devLog("Service Worker: Script loaded");
