import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand/30',
  secondary:
    'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 focus-visible:ring-zinc-400/30',
  success:
    'bg-success text-white hover:bg-success/90 focus-visible:ring-success/30',
  danger:
    'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/30',
  ghost: 'text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-400/30',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-11 gap-2 rounded-xl px-5 text-sm',
};

/** Shared classes so `<Link>` elements can look like buttons too. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(
    'inline-flex select-none items-center justify-center font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-4',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses(
        variant,
        size,
        cn(fullWidth && 'w-full', className),
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
