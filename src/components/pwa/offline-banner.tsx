'use client';

import { CloudOff, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  initConnectivity,
  subscribeConnectivity,
  type ConnectivityState,
} from '@/lib/connectivity';

/**
 * Slim banner pinned above everything while connectivity is degraded.
 *
 * Distinguishes real-world states instead of labelling every failure
 * "offline" (§28):
 *   - browser-offline     → "You're offline — showing last synchronized data."
 *   - server-unreachable  → "Unable to reach SkillSwap servers — retrying…"
 *
 * State comes from lib/connectivity (online/offline events + a CORS-safe
 * reachability probe fed by actual RTK Query failures), not just
 * navigator.onLine.
 */
export function OfflineBanner() {
  const [state, setState] = useState<ConnectivityState>('online');

  useEffect(() => {
    initConnectivity();
    return subscribeConnectivity(setState);
  }, []);

  if (state === 'online') return null;

  const browserOffline = state === 'browser-offline';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white"
    >
      {browserOffline ? (
        <WifiOff className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <CloudOff className="size-3.5 shrink-0" aria-hidden />
      )}
      {browserOffline
        ? "You're offline — showing last synchronized data."
        : 'Unable to reach SkillSwap servers — retrying…'}
    </div>
  );
}
