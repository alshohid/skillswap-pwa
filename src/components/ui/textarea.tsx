import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({
  className,
  error = false,
  ...props
}: TextareaProps) {
  return (
    <textarea
      aria-invalid={error || undefined}
      className={cn(
        'w-full min-h-[110px] resize-y rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-xs',
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
