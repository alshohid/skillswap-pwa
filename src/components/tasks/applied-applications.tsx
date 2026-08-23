'use client';

import { ApplicationCard } from '@/components/common/ApplicationCard';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import { useGetTaskApplicationsQuery, useGetTaskQuery } from '@/store/api/tasksApi';

/**
 * The API has no "list my applications" endpoint (only per-task
 * GET /tasks/:id/applications), so the Applied tab replays the locally
 * recorded task ids and checks each one for the viewer's application.
 */
function AppliedApplicationItem({
  taskId,
  viewerId,
}: {
  taskId: number;
  viewerId: number;
}) {
  const { data: task } = useGetTaskQuery(taskId);
  const { data: applications, isLoading } =
    useGetTaskApplicationsQuery(taskId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  const mine = applications?.find((app) => app.applicant_id === viewerId);
  if (!mine) return null; // application withdrawn / task deleted

  return (
    <ApplicationCard
      application={mine}
      contextHref={`/dashboard/tasks/${taskId}`}
      contextLabel={task?.title ?? `Task #${taskId}`}
    />
  );
}

export function AppliedApplications({ ids }: { ids: number[] }) {
  const { user } = useAuth();
  const viewerId = user?.id;

  if (!viewerId || ids.length === 0) return null;

  return (
    <div className="space-y-3">
      {ids.map((id) => (
        <Card key={id} className="p-0.5">
          <AppliedApplicationItem taskId={id} viewerId={viewerId} />
        </Card>
      ))}
    </div>
  );
}
