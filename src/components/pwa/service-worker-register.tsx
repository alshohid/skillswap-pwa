'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Single Service Worker registration point for the whole app.
 *
 * - Registers /sw.js in PRODUCTION ONLY (dev stays SW-free to avoid stale
 *   caching confusion; run `npm run build && npm start` to test PWA locally).
 * - Detects updates and asks the user instead of force-activating: the new
 *   worker waits until "Refresh" is clicked, then SKIP_WAITING + one reload.
 *   This prevents old-HTML/new-JS hydration mismatches (spec §21/§38).
 */
export function ServiceWorkerRegister() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    let registration: ServiceWorkerRegistration | undefined;
    let cancelled = false;

    const announce = (worker: ServiceWorker) => {
      if (!cancelled) setWaiting(worker);
    };

    navigator.serviceWorker
      .register('/sw.js', {
        // Never serve sw.js itself from the HTTP cache — a new deployment
        // must be discovered on the next check, not after cache expiry.
        updateViaCache: 'none',
      })
      .then((reg) => {
        registration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) {
          announce(reg.waiting); // update arrived while this tab was closed
        }
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          installing?.addEventListener('statechange', () => {
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              announce(installing);
            }
          });
        });
      })
      .catch(() => {
        /* insecure context or unsupported browser — PWA features stay off */
      });

    // Re-check periodically while the tab is visible (throttled to hourly).
    let lastCheck = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastCheck < 60 * 60 * 1000) return;
      lastCheck = Date.now();
      void registration?.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Reload exactly once once the waiting worker takes over. The listener is
  // only attached after explicit user consent, so first-install clients.claim()
  // never triggers a spurious reload.
  useEffect(() => {
    if (!waiting) return;
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      onControllerChange,
    );
    return () =>
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange,
      );
  }, [waiting]);

  const applyUpdate = useCallback(() => {
    waiting?.postMessage({ type: 'SKIP_WAITING' });
  }, [waiting]);

  if (!waiting) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-[55] lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-80">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-lg"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <RefreshCw className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-950">
            New version available
          </p>
          <p className="truncate text-xs text-zinc-500">
            Refresh to update SkillSwap
          </p>
        </div>
        <Button size="sm" onClick={applyUpdate}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
