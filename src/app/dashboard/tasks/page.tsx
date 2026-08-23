'use client';

import { ChevronLeft, ChevronRight, Compass, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TaskCard } from '@/components/common/TaskCard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ListSkeleton } from '@/components/ui/spinner';
import { PAGE_SIZE } from '@/lib/constants';
import type { TaskStatus } from '@/types/api';
import { useGetTasksQuery } from '@/store/api/tasksApi';

const STATUS_OPTIONS: Array<{ value: TaskStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function BrowseTasksPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  // Debounce the search box so typing doesn't spam the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetTasksQuery({ page, limit: PAGE_SIZE, status, search });

  const tasks = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  return (
    <div className="animate-rise">
      <PageHeader
        title="Browse Tasks"
        subtitle={`${total} task${total === 1 ? '' : 's'} available`}
      />

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <span className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            aria-label="Search tasks"
            placeholder="Search tasks…"
            className="pl-9"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </span>
        <Select
          aria-label="Filter by status"
          className="sm:w-44"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as TaskStatus | 'ALL');
            setPage(1);
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Results */}
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : isError ? (
        <QueryErrorState error="Couldn't load tasks." onRetry={() => void refetch()} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No tasks found"
          description={
            search || status !== 'ALL'
              ? 'Try a different search term or filter.'
              : 'There are no open tasks right now — check back soon!'
          }
        />
      ) : (
        <>
          <div
            className="grid gap-4 sm:grid-cols-2"
            aria-busy={isFetching || undefined}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-6 flex items-center justify-center gap-3"
            >
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Prev
              </Button>
              <span className="text-xs font-medium tabular-nums text-zinc-500">
                Page {data?.page ?? page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
