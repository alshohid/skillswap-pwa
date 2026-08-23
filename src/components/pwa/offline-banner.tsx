'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Slim banner pinned above everything when the device is offline. */
export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white"
    >
      <WifiOff className="size-3.5 shrink-0" aria-hidden />
      You're offline — showing cached content
    </div>
  );
}
