import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error = false, ...props }: InputProps) {
  return (
    <input
      aria-invalid={error || undefined}
      className={cn(
        'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs',
        'placeholder:text-zinc-400 transition-colors',
        'focus:outline-none focus:ring-4',
        'disabled:cursor-not-allowed disabled:opacity-60',
        error
          ? 'border-danger/60 focus:border-danger focus:ring-danger/15'
          : 'border-zinc-300 focus:border-brand focus:ring-brand/15',
        className,
      )}
      {...props}
    />
  );
}
