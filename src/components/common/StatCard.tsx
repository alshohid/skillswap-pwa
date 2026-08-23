import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type StatTone = 'brand' | 'amber' | 'green' | 'violet';

const toneClasses: Record<StatTone, string> = {
  brand: 'bg-brand/10 text-brand',
  amber: 'bg-warning/20 text-amber-500',
  green: 'bg-success/15 text-success',
  violet: 'bg-violet-100 text-violet-600',
};

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: StatTone;
  loading?: boolean;
}

/** Small KPI card used on the dashboard */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  loading,
}: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-xs leading-4 text-zinc-500">
            {label}
          </span>
          {loading ? (
            <span className="h-7 w-14 animate-pulse rounded-md bg-zinc-200" />
          ) : (
            <span className="truncate text-xl font-bold leading-7">
              {value}
            </span>
          )}
        </div>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full',
            toneClasses[tone],
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
    </Card>
  );
}
