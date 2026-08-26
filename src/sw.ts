/// <reference lib="webworker" />

import { clientsClaim, setCacheNameDetails } from 'workbox-core';
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
} from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import * as navigationPreload from 'workbox-navigation-preload';

declare const self: ServiceWorkerGlobalScope;


declare const __API_BASE__: string;
declare const __BUILD_ID__: string;

// ---------------------------------------------------------------------------
// Build/deployment version (§12). In production the esbuild `define` replaces
// __BUILD_ID__ with Next.js' per-build id (scripts/build-sw.mjs), so every
// deploy names a fresh set of runtime caches — old pages/image/font/API caches
// are then swept by the activate routine below. 'dev' is only a safe fallback
// if the define is accidentally stripped.
// ---------------------------------------------------------------------------
const BUILD_ID = typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : '';
const VERSION = BUILD_ID || 'v1';
const PAGES_CACHE = `skillswap-runtime-pages-${VERSION}`;
const IMAGES_CACHE = `skillswap-runtime-images-${VERSION}`;
const FONTS_CACHE = `skillswap-runtime-fonts-${VERSION}`;
const API_CACHE = `skillswap-api-readonly-${VERSION}`;
const OFFLINE_URL = '/offline.html';

setCacheNameDetails({ prefix: 'skillswap' });

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();


let API_ORIGIN = '';
let API_PATH_PREFIX = '';
try {
  const parsed = new URL(__API_BASE__);
  API_ORIGIN = parsed.origin;
  // "/api" when the base is https://host/api — "" for a bare host.
  API_PATH_PREFIX = parsed.pathname.replace(/\/+$/, '');
} catch {
  /* invalid config → all API routes stay disabled, requests pass through */
}

function isApiUrl(url: URL): boolean {
  if (API_ORIGIN && url.origin === API_ORIGIN) {
    return url.pathname.startsWith(API_PATH_PREFIX || '/');
  }
  // Also cover a same-origin /api proxy setup.
  return url.origin === self.location.origin && url.pathname.startsWith('/api/');
}

/** Path relative to the API prefix, e.g. "/tasks/12/applications". */
function apiPath(url: URL): string {
  if (url.origin === API_ORIGIN && API_PATH_PREFIX) {
    return url.pathname.slice(API_PATH_PREFIX.length) || '/';
  }
  return url.pathname.replace(/^\/api/, '') || '/';
}

/**
 * Explicit READ-ONLY cache allowlist (§10). Deliberately EXCLUDED:
 *   /auth/*    — authentication responses are never cached
 *   /users/me  — authorization-sensitive personal data (the app already
 *                keeps the last profile in localStorage for cold boots)
 *   anything else not listed — falls through to the network untouched
 *
 * Included: marketplace task content and the user's own point history /
 * balance (readonly financial data, per §26: NetworkFirst only, short TTL —
 * the UI labels it as last-synced whenever the offline banner is visible).
 */
const CACHEABLE_API_GET = new RegExp(
  '^/(?:' +
  'tasks(?:/\\d+(?:/applications)?)?' +
  '|transactions(?:/(?:me|balance))?' +
  ')/?$',
);

// ---------------------------------------------------------------------------
// 2. API mutations — NetworkOnly (§11). Registered FIRST so they always win.
//    A failed mutation surfaces as a genuine network error to the page;
//    the service worker never fabricates a 503 response body.
// ---------------------------------------------------------------------------
if (API_ORIGIN) {
  const mutationHandler = new NetworkOnly();
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'] as const) {
    registerRoute(({ url }) => isApiUrl(url), mutationHandler, method);
  }

  // 3. Whitelisted API GETs — NetworkFirst, only HTTP 200 cached, 10 min TTL.
  registerRoute(
    ({ url }) => isApiUrl(url) && CACHEABLE_API_GET.test(apiPath(url)),
    new NetworkFirst({
      cacheName: API_CACHE,
      networkTimeoutSeconds: 5,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 10 * 60,
          purgeOnQuotaError: true,
        }),
      ],
    }),
    'GET',
  );
}

// ---------------------------------------------------------------------------
// 3a. Next.js build output — /_next/static/* (JS, CSS, chunks, RSC payloads)
//     (§3/§18). These are ALSO in the precache manifest from build time, but an
//     explicit CacheFirst is a hard guarantee: any chunk that lands after a
//     mid-session update, or that the manifest missed, still serves offline.
//     Content-hashes in the filename make collision-safety trivial.
// ---------------------------------------------------------------------------
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    request.method === 'GET' &&
    url.pathname.startsWith('/_next/static/'),
  new CacheFirst({
    cacheName: 'skillswap-runtime-static-' + VERSION,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 365 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ---------------------------------------------------------------------------
// 3b. RSC payloads — the App Router fetches server components with `RSC: 1`
//     header / `?_rsc` query during <Link> client-side navigation. These are
//     NOT mode='navigate' (the react router handles them as soft fetches), so
//     the navigation route below never touches them. Caching them with
//     StaleWhileRevalidate is what lets the app keep "traveling" between
//     already-visited routes while offline (review §14/§18).
// ---------------------------------------------------------------------------
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    request.method === 'GET' &&
    (request.headers.get('rsc') === '1' || request.headers.get('RSC') === '1'),
  new StaleWhileRevalidate({
    cacheName: PAGES_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 40,
        maxAgeSeconds: 7 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ---------------------------------------------------------------------------
// 4. Fonts — immutable in practice; long-lived cache (§17).
//    Inter is self-hosted by next/font under /_next/static/media;
//    fonts.gstatic.com covered defensively. Status 0 allowed for opaque
//    cross-origin responses.
// ---------------------------------------------------------------------------
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    ((url.origin === self.location.origin ||
      url.origin === 'https://fonts.gstatic.com') &&
      /\.(?:woff2?|ttf|otf)$/i.test(url.pathname)),
  new CacheFirst({
    cacheName: FONTS_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);
// ---------------------------------------------------------------------------
// 5. Same-origin images (incl. /_next/image optimizer output) — CacheFirst
//    with bounded entries and TTL (§16). Remote hosts are intentionally not
//    cached: the app currently ships no third-party image CDN assets.
// ---------------------------------------------------------------------------
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    request.method === 'GET' &&
    (/\.(?:png|jpe?g|gif|webp|avif|ico|svg)$/i.test(url.pathname) ||
      url.pathname.startsWith('/_next/image')),
  new CacheFirst({
    cacheName: IMAGES_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ---------------------------------------------------------------------------
// 6. Navigations — NetworkFirst with navigation preload (§20): the browser
//    starts the document request while the SW boots; workbox-strategies'
//    StrategyHandler consumes event.preloadResponse automatically.
//    On failure: previously cached page → precached /offline.html.
//    This handler can NEVER answer API requests (mode === 'navigate' only),
//    so there is no global offline-JSON trap (§18).
// ---------------------------------------------------------------------------
navigationPreload.enable();

const pagesStrategy = new NetworkFirst({
  cacheName: PAGES_CACHE,
  networkTimeoutSeconds: 4,
  plugins: [
    new CacheableResponsePlugin({ statuses: [200] }),
    new ExpirationPlugin({
      maxEntries: 30,
      maxAgeSeconds: 7 * 24 * 60 * 60,
      purgeOnQuotaError: true,
    }),
  ],
});

async function resolveOfflineFallback(): Promise<Response | null> {
  // App Shell first (§14): if the requested route document was never fully
  // navigated (e.g. only reached via client-side RSC links), serve the cached
  // /dashboard shell instead of the bare offline page. The client router then
  // boots the real SkillSwap UI with cached data + the offline banner. On App
  // Router, /dashboard is the document the app always full-loads, so it is
  // reliably present in PAGES_CACHE after the first visit.
  const shellCache = await caches
    .open(PAGES_CACHE)
    .catch(() => undefined);
  if (shellCache) {
    const shell = await shellCache
      .match('/dashboard', { ignoreSearch: true })
      .catch(() => null);
    if (shell) return shell;
  }

  // Precached standalone offline page as the last resort.
  try {
    const fallback = await matchPrecache(OFFLINE_URL);
    if (fallback) return fallback;
  } catch {
    /* precache unavailable — propagate a network error below */
  }
  return null;
}

async function handleNavigation(options: {
  event: ExtendableEvent;
  request: Request;
}): Promise<Response> {
  // The router always dispatches navigations with the real FetchEvent
  // (which carries preloadResponse); extend onward to keep strategy typing.
  const event = options.event as FetchEvent;
  const request = options.request;
  let response: Response | undefined;
  try {
    response = await pagesStrategy.handle({ event, request });
  } catch {
    /* fall through to the offline fallback */
  }
  if (response) return response;

  const fallback = await resolveOfflineFallback();
  return fallback ?? Response.error();
}

registerRoute(({ request }) => request.mode === 'navigate', handleNavigation);

// ---------------------------------------------------------------------------
// Lifecycle & controlled updates (§21)
// ---------------------------------------------------------------------------
// Legacy vanilla-SW caches from previous deployments — removed once, then gone.
const LEGACY_CACHE_RE = /^skillswap-(shell|assets|api)-v\d+$/;

// Every runtime cache this worker can own (built from the current build id).
const CURRENT_RUNTIME_CACHES = new Set([
  PAGES_CACHE,
  IMAGES_CACHE,
  FONTS_CACHE,
  API_CACHE,
  `skillswap-runtime-static-${VERSION}`,
]);
// Any runtime cache family across past builds (so old-version caches die).
const RUNTIME_CACHE_RE =
  /^(?:skillswap-runtime-(?:pages|images|fonts|static)|skillswap-api-readonly)-/;

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              LEGACY_CACHE_RE.test(key) ||
              (RUNTIME_CACHE_RE.test(key) && !CURRENT_RUNTIME_CACHES.has(key)),
          )
          .map((key) => caches.delete(key)),
      );
      console.log(`[SW] active (${VERSION})`);
    })(),
  );
});

// Take control of open tabs once an update has been approved by the page.
clientsClaim();

// The page decides WHEN a waiting worker activates — never automatically
// (no unconditional skipWaiting: avoids old-HTML/new-JS hydration mismatches).
// Also handles client-requested user-cache isolation (§10): a logout or
// session-expiry asks the worker to drop every cached API response so the next
// account on a shared device never reads financial data offline.
self.addEventListener('message', (event) => {
  const type = (event.data as { type?: string } | undefined)?.type;
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (type === 'CLEAR_API_CACHE') {
    const msgEvent = event as ExtendableMessageEvent;
    // Wipe ALL API cache versions (not just the current one) defensively.
    msgEvent.waitUntil?.(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((name) => /^skillswap-api-readonly-/.test(name))
              .map((name) => caches.delete(name)),
          ),
        )
        .catch(() => undefined),
    );
  }
});

