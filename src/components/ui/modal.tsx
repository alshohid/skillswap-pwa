import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * Dependency-free modal dialog.
 * Bottom-sheet style on mobile, centered card on ≥sm screens.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl',
          'sm:max-w-md sm:rounded-2xl',
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold leading-6 text-zinc-950">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm leading-5 text-zinc-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {children}

        {footer && <div className="mt-5">{footer}</div>}
      </div>
    </div>
  );
}
