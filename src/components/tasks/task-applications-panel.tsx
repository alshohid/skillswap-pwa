'use client';

import { ClipboardList, UserCheck } from 'lucide-react';
import { ApplicationCard } from '@/components/common/ApplicationCard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/utils';
import {
  useAssignApplicationMutation,
  useGetTaskApplicationsQuery,
} from '@/store/api/tasksApi';
import type { Application } from '@/types/api';

/**
 * Owner-only panel: everyone who applied for this task, with Assign actions
 * (POST /tasks/:taskId/assign/:applicationId).
 *
 * NOTE: the current backend exposes no reject endpoint, so only Assign is
 * offered — see README “Backend gaps”.
 */
export function TaskApplicationsPanel({ taskId }: { taskId: number }) {
  const { showToast } = useToast();

  const {
    data: applications,
    isLoading,
    isError,
    refetch,
  } = useGetTaskApplicationsQuery(taskId);

  const [assignApplication, { isLoading: assigning }] =
    useAssignApplicationMutation();

  const handleAssign = async (application: Application) => {
    try {
      await assignApplication({
        taskId,
        applicationId: application.id,
      }).unwrap();
      showToast(
        `Assigned to ${application.applicant?.full_name ?? 'applicant'} 🤝`,
        'success',
      );
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        error="Couldn't load applications."
        onRetry={() => void refetch()}
      />
    );
  }

  const list = applications ?? [];

  return (
    <section aria-label="Applications">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">
        Applications{' '}
        <span className="text-zinc-400">({list.length})</span>
      </h2>

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Members who apply for this task will appear here."
        />
      ) : (
        <div className="space-y-3">
          {list.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              actions={
                application.status === 'PENDING' ? (
                  <Button
                    size="sm"
                    variant="success"
                    loading={assigning}
                    onClick={() => void handleAssign(application)}
                  >
                    {!assigning && (
                      <UserCheck className="size-3.5" aria-hidden />
                    )}
                    Assign
                  </Button>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
