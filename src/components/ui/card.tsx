import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

/** White elevated surface — the base of almost every panel in the app. */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
