import { Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  /** Show the "SkillSwap" wordmark next to the mark */
  withText?: boolean;
  /** Tailwind size classes for the square mark */
  sizeClass?: string;
  className?: string;
}

/** Brand logo — blue rounded square + swap arrows + wordmark */
export function Logo({
  withText = true,
  sizeClass = 'size-8',
  className,
}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-lg bg-brand text-white',
          sizeClass,
        )}
      >
        <Repeat className="size-1/2" aria-hidden />
      </span>
      {withText && (
        <span className="text-lg font-bold tracking-tight">SkillSwap</span>
      )}
    </span>
  );
}
