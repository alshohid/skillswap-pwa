'use client';

import { Ban, CheckCircle2, Send, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { PointsPill } from '@/components/common/PointsPill';
import { TaskStatusBadge } from '@/components/common/StatusBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ApplyModal } from '@/components/tasks/apply-modal';
import { CompletionModal } from '@/components/tasks/completion-modal';
import { TaskApplicationsPanel } from '@/components/tasks/task-applications-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import {
  formatDate,
  formatPoints,
  formatRelativeTime,
  getErrorMessage,
} from '@/lib/utils';
import { addAppliedTaskId, getAppliedTaskIds } from '@/lib/session';
import { useGetBalanceQuery } from '@/store/api/transactionsApi';
import {
  useApplyToTaskMutation,
  useCancelTaskMutation,
  useCompleteTaskMutation,
  useGetTaskQuery,
} from '@/store/api/tasksApi';

export default function TaskDetailsPage() {
  const params = useParams<{ id: string }>();
  const taskId = Number(params?.id);
  const validId = Number.isFinite(taskId) && taskId > 0;

  const { user } = useAuth();
  const meId = user?.id;
  const { showToast } = useToast();

  const {
    data: task,
    isLoading,
    isError,
    refetch,
  } = useGetTaskQuery(taskId, { skip: !validId });

  const isCreator = !!task && !!meId && task.creator_id === meId;
  const isAssignee = !!task && !!meId && task.assignee_id === meId;

  // Local record of "I applied to this task" (see lib/session.ts).
  const [appliedHere, setAppliedHere] = useState(false);
  useEffect(() => {
    setAppliedHere(getAppliedTaskIds().includes(taskId));
  }, [taskId]);

  const [applyToTask, { isLoading: applying }] = useApplyToTaskMutation();
  const [completeTask, { isLoading: completing }] = useCompleteTaskMutation();
  const [cancelTask, { isLoading: cancelling }] = useCancelTaskMutation();

  // Refetches automatically via tag invalidation after completion.
  const { data: liveBalance } = useGetBalanceQuery(undefined, { skip: !meId });

  const [applyOpen, setApplyOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completionPoints, setCompletionPoints] = useState<number | null>(null);

  const handleApply = async (message: string) => {
    try {
      await applyToTask({ id: taskId, message }).unwrap();
      addAppliedTaskId(taskId);
      setAppliedHere(true);
      setApplyOpen(false);
      showToast('Application submitted ✅', 'success');
      void refetch();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleComplete = async () => {
    try {
      const receipt = await completeTask(taskId).unwrap();
      setCompletionPoints(receipt?.points_transferred ?? task?.points_offered ?? 0);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelTask(taskId).unwrap();
      setCancelOpen(false);
      showToast('Task cancelled', 'info');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  if (!validId) {
    return (
      <EmptyState
        icon={UserRound}
        title="Task not found"
        description="This link doesn't point to a valid task."
        action={
          <Link
            href="/dashboard/tasks"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Back to Browse Tasks
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <QueryErrorState
        error="Couldn't load this task. It may have been removed."
        onRetry={() => void refetch()}
      />
    );
  }

  const canComplete = isAssignee && task.status === 'ASSIGNED';
  const canCancel =
    (isCreator || isAssignee) &&
    (task.status === 'OPEN' || task.status === 'ASSIGNED');
  const hasApplied = appliedHere;
  const canApply =
    !isCreator && !isAssignee && task.status === 'OPEN' && !hasApplied;

  return (
    <div className="animate-rise mx-auto max-w-2xl">
      <PageHeader title={task.title} backHref="/dashboard/tasks" />

      <Card className="p-5 sm:p-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <PointsPill points={task.points_offered} />
          <TaskStatusBadge status={task.status} />
          <span className="ml-auto text-xs text-zinc-400">
            Posted {formatRelativeTime(task.created_at)} ·{' '}
            {formatDate(task.created_at)}
          </span>
        </div>

        {/* Creator */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <UserAvatar name={task.creator?.full_name} sizeClass="size-10" />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Posted by
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900">
              {task.creator?.full_name ?? `User #${task.creator_id}`}
              {task.creator?.email && (
                <span className="font-normal text-zinc-500">
                  {' '}
                  · {task.creator.email}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Description */}
        <h2 className="mt-6 text-sm font-semibold text-zinc-900">Description</h2>
        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-600">
          {task.description}
        </p>

        {/* Optional requirements checklist */}
        {task.requirements && task.requirements.length > 0 && (
          <>
            <h2 className="mt-6 text-sm font-semibold text-zinc-900">
              Requirements
            </h2>
            <ul className="mt-1.5 space-y-1.5">
              {task.requirements.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-2 text-sm text-zinc-600"
                >
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden
                  />
                  {requirement}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Action area — role & status aware */}
        <div className="mt-7 border-t border-zinc-100 pt-5">
          {canComplete && (
            <div className="rounded-xl bg-brand/5 p-4">
              <p className="text-sm font-semibold text-zinc-900">
                This task is assigned to you
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Finishing up? Mark it complete and{' '}
                {formatPoints(task.points_offered)} will transfer to your
                balance instantly.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="success"
                  loading={completing}
                  onClick={() => void handleComplete()}
                >
                  {!completing && (
                    <CheckCircle2 className="size-4" aria-hidden />
                  )}
                  Mark as Completed
                </Button>
                {canCancel && (
                  <Button
                    variant="secondary"
                    loading={cancelling}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel Task
                  </Button>
                )}
              </div>
            </div>
          )}

          {canApply && (
            <Button
              size="lg"
              fullWidth
              onClick={() => setApplyOpen(true)}
            >
              <Send className="size-4" aria-hidden />
              Apply for this Task
            </Button>
          )}

          {!canApply && hasApplied && task.status === 'OPEN' && (
            <p className="flex items-center justify-center gap-2 rounded-xl bg-warning/10 px-4 py-3 text-sm font-medium text-amber-700">
              <CheckCircle2 className="size-4" aria-hidden />
              Your application is pending review
            </p>
          )}

          {!isCreator &&
            !isAssignee &&
            !hasApplied &&
            task.status === 'ASSIGNED' && (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm text-zinc-500">
                This task has been assigned to another member.
              </p>
            )}

          {task.status === 'COMPLETED' && (
            <p className="flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
              <CheckCircle2 className="size-4" aria-hidden />
              Task completed{canComplete ? '' : ' · points transferred'}
            </p>
          )}

          {task.status === 'CANCELLED' && (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm text-zinc-500">
              This task was cancelled.
            </p>
          )}

          {isCreator && canCancel && !canComplete && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-danger hover:bg-danger/5"
              loading={cancelling}
              onClick={() => setCancelOpen(true)}
            >
              {!cancelling && <Ban className="size-3.5" aria-hidden />}
              Cancel this task
            </Button>
          )}
        </div>
      </Card>

      {/* Owner view: applications management */}
      {isCreator && (
        <div className="mt-6">
          <TaskApplicationsPanel taskId={taskId} />
        </div>
      )}

      {/* Modals */}
      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApply}
        pending={applying}
      />

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this task?"
        description="The task will be closed and no points will be transferred."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep task
            </Button>
            <Button
              variant="danger"
              loading={cancelling}
              onClick={() => void handleCancel()}
            >
              Cancel task
            </Button>
          </div>
        }
      />

      <CompletionModal
        open={completionPoints !== null}
        onClose={() => setCompletionPoints(null)}
        pointsTransferred={completionPoints ?? 0}
        newBalance={liveBalance}
      />
    </div>
  );
}
