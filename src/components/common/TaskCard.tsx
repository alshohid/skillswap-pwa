import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PointsPill } from '@/components/common/PointsPill';
import { UserAvatar } from '@/components/common/UserAvatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Task } from '@/types/api';

export interface TaskCardProps {
  task: Task;
}

/** Grid card used on Browse Tasks — title, excerpt, creator and status. */
export function TaskCard({ task }: TaskCardProps) {
  const href = `/dashboard/tasks/${task.id}`;
  return (
    <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30">
      <Card
        className={cn(
          'flex h-full flex-col gap-2 p-4 transition-all',
          'hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-semibold leading-6 text-zinc-950">
            {task.title}
          </h3>
          <PointsPill points={task.points_offered} />
        </div>

        <p className="line-clamp-2 text-sm leading-5 text-zinc-500">
          {task.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="flex min-w-0 items-center gap-2">
            <UserAvatar
              name={task.creator?.full_name}
              sizeClass="size-6"
            />
            <span className="truncate text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">
                {task.creator?.full_name ?? `User #${task.creator_id}`}
              </span>
              {' · '}
              {formatRelativeTime(task.created_at)}
            </span>
          </span>
          <Badge
            variant={
              task.status === 'OPEN'
                ? 'brand'
                : task.status === 'ASSIGNED'
                  ? 'amber'
                  : task.status === 'COMPLETED'
                    ? 'green'
                    : 'gray'
            }
          >
            {task.status.charAt(0) + task.status.slice(1).toLowerCase()}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
