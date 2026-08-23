'use client';

import { FileText, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppliedApplications } from '@/components/tasks/applied-applications';
import { TaskApplicationsPanel } from '@/components/tasks/task-applications-panel';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import { getAppliedTaskIds } from '@/lib/session';
import { cn } from '@/lib/utils';
import { useGetTasksQuery } from '@/store/api/tasksApi';

const FETCH_LIMIT = 50;
/** Bound the number of per-task application requests on the Received tab. */
const MAX_RECEIVED_TASKS = 8;

type Tab = 'received' | 'applied';

export default function ApplicationsPage() {
  const [tab, setTab] = useState<Tab>('received');
  const { user } = useAuth();
  const meId = user?.id;

  const {
    data,
    isLoading,
  } = useGetTasksQuery({ page: 1, limit: FETCH_LIMIT }, { skip: !meId });

  const myTasks = (data?.items ?? [])
    .filter(
      (task) =>
        task.creator_id === meId &&
        (task.status === 'OPEN' || task.status === 'ASSIGNED'),
    )
    .slice(0, MAX_RECEIVED_TASKS);

  // Local record of tasks this user applied to.
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  useEffect(() => {
    setTab('received'); // reset view state on mount
    setAppliedIds(getAppliedTaskIds());
  }, []);

  return (
    <div className="animate-rise">
      <PageHeader
        title="Applications"
        subtitle="Applications on your tasks, and ones you submitted."
      />

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Application views"
        className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1"
      >
        {(
          [
            { key: 'received', label: 'Received', icon: Inbox },
            { key: 'applied', label: 'Applied', icon: FileText },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors',
              tab === key
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : tab === 'received' ? (
        myTasks.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No open tasks of yours"
            description="Post a task first — applications from other members will land here."
            action={
              <Link
                href="/dashboard/tasks/create"
                className="text-sm font-semibold text-brand hover:underline"
              >
                Create a task →
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {myTasks.map((task) => (
              <section key={task.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Link
                    href={`/dashboard/tasks/${task.id}`}
                    className="truncate text-sm font-semibold text-brand hover:underline"
                  >
                    {task.title}
                  </Link>
                  <span className="shrink-0 text-xs font-bold text-brand">
                    {task.points_offered} pts
                  </span>
                </div>
                <TaskApplicationsPanel taskId={task.id} />
              </section>
            ))}
          </div>
        )
      ) : appliedIds.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="You haven't applied to anything yet"
          description="Find an open task that matches your skills and send your first application."
          action={
            <Link
              href="/dashboard/tasks"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Browse tasks →
            </Link>
          }
        />
      ) : (
        <AppliedApplications ids={appliedIds} />
      )}
    </div>
  );
}
