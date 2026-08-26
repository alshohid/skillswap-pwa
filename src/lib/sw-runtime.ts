'use client';

/**
 * Client ⇄ service-worker runtime coordination.
 *
 * These helpers let page code tell a *running* service worker about
 * auth-lifecycle events — most importantly wiping user-specific API caches so
 * a shared device never leaks one account's cached (financial) data to the
 * next user (production §10 "user cache isolation").
 *
 * If no service worker is active (dev mode, insecure context, first paint)
 * the calls are safe no-ops; the next controlled worker handles its own
 * lifecycle cleanup.
 */

/** Tell the controlling worker to drop all user-specific cached responses. */
export function clearApiRuntimeCache(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const controller = navigator.serviceWorker.controller;
  if (controller) controller.postMessage({ type: 'CLEAR_API_CACHE' });
}