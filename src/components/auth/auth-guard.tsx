'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { FullScreenSplash } from '@/components/common/FullScreenSplash';
import { ErrorState } from '@/components/ui/error-state';

/**
 * Client-side route protection for the whole /dashboard subtree.
 * JWT lives in localStorage so guarding happens after hydration; the splash
 * screen covers the brief bootstrap window without flashing content.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { token, user, hydrated, isLoading, meError, refetchMe } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, token, pathname, router]);

  if (!hydrated || isLoading || !token) {
    return <FullScreenSplash />;
  }

  // Token exists but the session check failed and there is no cached
  // profile — most likely offline with a cold cache. Let the user retry
  // instead of bouncing them to /login.
  if (meError && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState
          title="Couldn't load your session"
          message="You appear to be offline or the server is unreachable."
          onRetry={() => void refetchMe()}
        />
      </div>
    );
  }

  return <>{children}</>;
}
