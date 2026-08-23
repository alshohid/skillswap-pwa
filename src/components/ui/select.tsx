import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <span className="relative block w-full">
      <select
        className={cn(
          'w-full cursor-pointer appearance-none rounded-xl border border-zinc-300 bg-white py-2.5 pl-3.5 pr-9 text-sm text-zinc-900 shadow-xs',
          'transition-colors focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
    </span>
  );
}
