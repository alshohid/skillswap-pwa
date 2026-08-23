import { formatPoints } from '@/lib/utils';
import { TaskStatusBadge } from '@/components/common/StatusBadge';
import type { Task } from '@/types/api';

export interface TaskListItemProps {
  task: Task;
  /** Right-side slot (actions / badges) */
  trailing?: React.ReactNode;
  onClick?: () => void;
}

/**
 * One task row: title + points on the left, status/actions on the right.
 * Presentation only — no data fetching (SRP).
 */
export function TaskListItem({ task, trailing, onClick }: TaskListItemProps) {
  const clickable = typeof onClick === 'function';

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={
        clickable
          ? 'flex cursor-pointer items-center justify-between gap-3 py-3.5 text-left'
          : 'flex items-center justify-between gap-3 py-3.5'
      }
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium leading-5 text-zinc-950">
          {task.title}
        </span>
        <span className="text-xs leading-4 text-zinc-500">
          {formatPoints(task.points_offered)}
        </span>
      </div>

      {trailing ?? <TaskStatusBadge status={task.status} />}
    </div>
  );
}
