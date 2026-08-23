'use client';

import { useRef, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '@/store';
import { ToastProvider } from '@/components/ui/toast';
import { AuthBootstrap } from '@/components/auth/auth-bootstrap';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';

/** Composes all client-side providers: Redux store, toasts, SW registration. */
export function AppProviders({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return (
    <Provider store={storeRef.current}>
      <ToastProvider>
        <AuthBootstrap />
        <ServiceWorkerRegister />
        {children}
      </ToastProvider>
    </Provider>
  );
}
