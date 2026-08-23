import { cn, formatPoints } from '@/lib/utils';

export function PointsPill({
  points,
  className,
}: {
  points: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand',
        className,
      )}
    >
      {formatPoints(points)}
    </span>
  );
}
