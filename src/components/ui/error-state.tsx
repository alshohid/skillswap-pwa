'use client';

import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/20 bg-white px-6 py-14 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="size-5" aria-hidden />
      </span>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="max-w-sm text-sm leading-5 text-zinc-500">
        {message ?? 'Please try again in a moment.'}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCw className="size-3.5" aria-hidden />
          Retry
        </Button>
      )}
    </div>
  );
}

/** Convenience wrapper that renders a friendly message for an RTK error. */
export function QueryErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <ErrorState message={getErrorMessage(error)} onRetry={onRetry} />
  );
}
