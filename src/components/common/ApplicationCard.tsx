import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ApplicationStatusBadge } from '@/components/common/StatusBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatRelativeTime } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { Application } from '@/types/api';

export interface ApplicationCardProps {
  application: Application;
  /** Optional link over the applicant name (e.g. to the parent task). */
  contextHref?: string;
  contextLabel?: string;
  actions?: ReactNode;
}

/** One application row: applicant, message, status and owner actions. */
export function ApplicationCard({
  application,
  contextHref,
  contextLabel,
  actions,
}: ApplicationCardProps) {
  const applicantName =
    application.applicant?.full_name ?? `User #${application.applicant_id}`;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar name={applicantName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-950">
              {applicantName}
            </p>
            <p className="text-xs text-zinc-500">
              Applied {formatRelativeTime(application.created_at)}
              {contextHref && contextLabel && (
                <>
                  {' · on '}
                  <Link
                    href={contextHref}
                    className="font-medium text-brand hover:underline"
                  >
                    {contextLabel}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-5 text-zinc-600">
        {application.message}
      </p>

      {actions && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">{actions}</div>
      )}
    </Card>
  );
}
