import { Badge, type BadgeVariant } from '@/components/ui/badge';
import type { ApplicationStatus, TaskStatus } from '@/types/api';

const STATUS_MAP: Record<TaskStatus, { label: string; variant: BadgeVariant }> = {
  OPEN: { label: 'Open', variant: 'brand' },
  ASSIGNED: { label: 'Assigned', variant: 'amber' },
  COMPLETED: { label: 'Completed', variant: 'green' },
  CANCELLED: { label: 'Cancelled', variant: 'gray' },
};

const APP_STATUS_MAP: Record<
  ApplicationStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Pending', variant: 'amber' },
  ACCEPTED: { label: 'Accepted', variant: 'green' },
  REJECTED: { label: 'Rejected', variant: 'red' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { label, variant } = STATUS_MAP[status] ?? {
    label: status,
    variant: 'gray' as BadgeVariant,
  };
  return <Badge variant={variant}>{label}</Badge>;
}

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const { label, variant } = APP_STATUS_MAP[status] ?? {
    label: status,
    variant: 'gray' as BadgeVariant,
  };
  return <Badge variant={variant}>{label}</Badge>;
}
