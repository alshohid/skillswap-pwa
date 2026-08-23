import { Loader2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ className, ...props }: HTMLAttributes<SVGSVGElement>) {
  return (
    <Loader2
      className={cn('size-5 animate-spin text-brand', className)}
      aria-label="Loading"
      {...props}
    />
  );
}

/** Row of skeletons used by list pages while queries load. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-zinc-200 bg-white p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-zinc-200" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-200" />
          </div>
          <div className="mt-3 h-3 w-1/2 animate-pulse rounded-md bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}
