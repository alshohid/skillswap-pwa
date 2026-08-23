/*
 * SkillSwap service worker.
 *
 * Caching strategy:
 *   - App shell / navigations ......... network-first, fall back to cache
 *   - Static assets (_next/static …) .. cache-first (immutable hashes)
 *   - API GET requests ................ network-first, cached for offline reads
 *   - API mutations (POST/PATCH/…) .... NOT intercepted at all. The browser
 *                                       performs them natively, so real
 *                                       network/CORS/timeout errors surface
 *                                       with their true status codes instead
 *                                       of a synthetic "offline" 503.
 *
 * NOTE: never gate fetches on `navigator.onLine`. It only reports whether a
 * network *interface* exists, not reachability — a false negative here used
 * to turn every login into an instant 503 before any bytes left the browser.
 */
/* eslint-disable no-restricted-globals */

const VERSION = 'v2';
const SHELL_CACHE = `skillswap-shell-${VERSION}`;
const ASSET_CACHE = `skillswap-assets-${VERSION}`;
const API_CACHE = `skillswap-api-${VERSION}`;
const KNOWN_CACHES = [SHELL_CACHE, ASSET_CACHE, API_CACHE];

const SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon.svg',
];

// The API base URL arrives via registration query param (?api=…).
const params = new URL(self.location.href).searchParams;
const API_BASE = (
  params.get('api') || 'http://localhost:3001/api'
).replace(/\/+$/, '');

let API_ORIGIN = '';
try {
  API_ORIGIN = new URL(API_BASE).origin;
} catch {
  /* invalid config — API caching disabled */
}

function isApiUrl(url) {
  if (API_ORIGIN && url.origin === API_ORIGIN) return true;
  // Also cover a same-origin /api proxy setup.
  return url.origin === self.location.origin && url.pathname.startsWith('/api/');
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.webmanifest' ||
    /\.(?:png|jpe?g|svg|webp|gif|ico|woff2?|ttf)$/i.test(pathname)
  );
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function offlineHtml() {
  return new Response(
    '<!doctype html><title>Offline</title><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<body style="font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f8fafc;color:#18181b">' +
      '<p style="text-align:center">You are offline.<br>SkillSwap will reconnect automatically.</p></body>',
    { headers: { 'Content-Type': 'text/html' } },
  );
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxEntries);
  }
}

/** GET API: fresh when possible, cached copy when the network fails. */
async function apiNetworkFirst(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await trimCache(API_CACHE, 60);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return (
      cached ??
      jsonResponse(503, {
        statusCode: 503,
        message: 'You are offline. Showing cached data.',
      })
    );
  }
}

/** Page navigations: try network, keep every visited route for offline reuse. */
async function navigationNetworkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await trimCache(SHELL_CACHE, 30);
    }
    return response;
  } catch {
    return (
      (await cache.match(request)) ??
      (await cache.match('/')) ??
      offlineHtml()
    );
  }
}

/** Immutable static assets: cache-first. */
async function assetCacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !KNOWN_CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Mutations (POST/PUT/PATCH/DELETE) are NEVER intercepted. Not calling
  // respondWith lets the browser perform the request natively — login,
  // register and transfer calls go straight to the backend and genuine
  // failures (CORS, timeouts, Render cold starts) surface with their real
  // status codes instead of a fake "You are offline" 503.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isApiUrl(url)) {
    event.respondWith(apiNetworkFirst(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(assetCacheFirst(request));
  }
});
