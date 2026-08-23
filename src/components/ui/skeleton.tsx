import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-lg bg-zinc-200/70', className)}
      {...props}
    />
  );
}
