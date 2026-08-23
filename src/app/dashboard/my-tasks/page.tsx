'use client';

import { ClipboardList, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { TaskListItem } from '@/components/common/TaskListItem';
import { TaskStatusBadge } from '@/components/common/StatusBadge';
import { buttonClasses } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryErrorState } from '@/components/ui/error-state';
import { ListSkeleton } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import { formatPoints, formatRelativeTime } from '@/lib/utils';
import { useGetTasksQuery } from '@/store/api/tasksApi';

const FETCH_LIMIT = 100;

export default function MyTasksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const meId = user?.id;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetTasksQuery(
    { page: 1, limit: FETCH_LIMIT },
    { skip: !meId },
  );

  const tasks = data?.items ?? [];
  const posted = tasks.filter((task) => task.creator_id === meId);
  const working = tasks.filter((task) => task.assignee_id === meId);

  const renderRow = (task: (typeof tasks)[number]) => (
    <TaskListItem
      key={task.id}
      task={task}
      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
      trailing={
        <span className="flex shrink-0 items-center gap-2.5">
          <span className="hidden text-xs text-zinc-400 sm:inline">
            {formatRelativeTime(task.created_at)}
          </span>
          <TaskStatusBadge status={task.status} />
        </span>
      }
    />
  );

  return (
    <div className="animate-rise">
      <PageHeader
        title="My Tasks"
        subtitle="Everything you posted and everything assigned to you."
        action={
          <Link href="/dashboard/tasks/create" className={buttonClasses('primary', 'sm')}>
            <Plus className="size-3.5" aria-hidden />
            New task
          </Link>
        }
      />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : isError ? (
        <QueryErrorState error="Couldn't load your tasks." onRetry={() => void refetch()} />
      ) : (
        <div className="space-y-6">
          {/* Posted by you */}
          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-900">
              Posted by you{' '}
              <span className="text-zinc-400">({posted.length})</span>
            </h2>
            {posted.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="You haven't posted any tasks"
                description="Need something done? Post a task and offer Skill Points."
                action={
                  <Link
                    href="/dashboard/tasks/create"
                    className={buttonClasses('primary', 'sm')}
                  >
                    Create your first task
                  </Link>
                }
              />
            ) : (
              <Card className="divide-y divide-zinc-100 px-4">
                {posted.map(renderRow)}
              </Card>
            )}
          </section>

          {/* Assigned to you */}
          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-900">
              Assigned to you{' '}
              <span className="text-zinc-400">({working.length})</span>
            </h2>
            {working.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Nothing assigned right now"
                description="Browse open tasks and apply — assigned work shows up here."
                action={
                  <Link
                    href="/dashboard/tasks"
                    className={buttonClasses('secondary', 'sm')}
                  >
                    Browse tasks
                  </Link>
                }
              />
            ) : (
              <Card className="divide-y divide-zinc-100 px-4">
                {working.map(renderRow)}
              </Card>
            )}
          </section>

          <p className="text-center text-xs text-zinc-400">
            Balances update automatically when work is completed —{' '}
            {formatPoints(user?.skill_points ?? 0)} currently.
          </p>
        </div>
      )}
    </div>
  );
}
