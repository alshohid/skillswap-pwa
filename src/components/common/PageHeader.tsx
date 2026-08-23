import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Go back"
            className="mt-0.5 rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
