import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm leading-5 text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
