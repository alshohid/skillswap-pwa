import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'brand'
  | 'amber'
  | 'green'
  | 'red'
  | 'gray'
  | 'violet';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  brand: 'bg-brand/10 text-brand',
  amber: 'bg-warning/20 text-amber-600',
  green: 'bg-success/15 text-success',
  red: 'bg-danger/10 text-danger',
  gray: 'bg-zinc-100 text-zinc-600',
  violet: 'bg-violet-100 text-violet-600',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = 'gray',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
