import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Access the global toast queue */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-zinc-900',
};

/**
 * Minimal global toast system (no external deps).
 * Renders a stacked list above the bottom navigation.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg',
              VARIANT_CLASSES[toast.variant],
            )}
          >
            {toast.variant === 'success' && (
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            )}
            {toast.variant === 'error' && (
              <AlertCircle className="size-4 shrink-0" aria-hidden />
            )}
            {toast.variant === 'info' && (
              <Info className="size-4 shrink-0" aria-hidden />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
