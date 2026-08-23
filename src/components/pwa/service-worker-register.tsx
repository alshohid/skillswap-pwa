'use client';

import { useEffect } from 'react';
import { API_URL } from '@/lib/constants';

/**
 * Registers /sw.js and passes the API base URL as a query param — service
 * workers can't read NEXT_PUBLIC_* at runtime, but they CAN read their own
 * script URL.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register(`/sw.js?api=${encodeURIComponent(API_URL)}`)
      .catch(() => {
        // Insecure context or unsupported browser — PWA features stay off.
      });
  }, []);

  return null;
}
