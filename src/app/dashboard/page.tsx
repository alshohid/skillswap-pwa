'use client';

import { ArrowRight, Coins, ListTodo, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/common/StatCard';
import { TaskListItem } from '@/components/common/TaskListItem';
import { TransactionItem } from '@/components/common/TransactionItem';
import { QueryErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import { ListSkeleton, Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import { PAGE_SIZE, RECENT_ITEMS } from '@/lib/constants';
import { firstName, formatPoints } from '@/lib/utils';
import { useGetTasksQuery } from '@/store/api/tasksApi';
import {
  useGetBalanceQuery,
  useGetMyTransactionsQuery,
} from '@/store/api/transactionsApi';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const meId = user?.id;

  const {
    data: balance,
    isLoading: balanceLoading,
  } = useGetBalanceQuery(undefined, { skip: !meId });

  const {
    data: tasksResult,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useGetTasksQuery({ page: 1, limit: PAGE_SIZE }, { skip: !meId });

  const {
    data: transactions,
    isLoading: txLoading,
    isError: txError,
    refetch: refetchTx,
  } = useGetMyTransactionsQuery(undefined, { skip: !meId });

  const tasks = tasksResult?.items ?? [];
  const recentTasks = tasks.slice(0, RECENT_ITEMS);
  const recentTransactions = transactions?.slice(0, RECENT_ITEMS) ?? [];

  const openCount = tasks.filter((task) => task.status === 'OPEN').length;
  const postedCount = tasks.filter((task) => task.creator_id === meId).length;

  return (
    <div className="animate-rise space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950">
          Welcome back, {firstName(user?.full_name) || 'there'} 👋
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Here's what's happening on SkillSwap today.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Skill Points"
          value={formatPoints(balance ?? user?.skill_points ?? 0)}
          icon={Coins}
          tone="brand"
          loading={balanceLoading && !user}
        />
        <StatCard
          label="Open tasks"
          value={tasksLoading ? '' : openCount}
          icon={ListTodo}
          tone="amber"
          loading={tasksLoading}
        />
        <StatCard
          label="Posted by you"
          value={tasksLoading ? '' : postedCount}
          icon={ReceiptText}
          tone="green"
          loading={tasksLoading}
        />
      </div>

      {/* Recent tasks */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Recent tasks</h2>
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            Browse all
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {tasksLoading ? (
          <ListSkeleton rows={3} />
        ) : tasksError ? (
          <QueryErrorState error="Couldn't load tasks." onRetry={refetchTasks} />
        ) : recentTasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Be the first to post a task or check back soon."
            action={
              <Link
                href="/dashboard/tasks/create"
                className="text-sm font-semibold text-brand hover:underline"
              >
                Create the first task →
              </Link>
            }
          />
        ) : (
          <Card className="divide-y divide-zinc-100 px-4">
            {recentTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
              />
            ))}
          </Card>
        )}
      </section>

      {/* Recent transactions */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent transactions
          </h2>
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : txError ? (
          <QueryErrorState
            error="Couldn't load transactions."
            onRetry={refetchTx}
          />
        ) : recentTransactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No transactions yet"
            description="Complete your first task and point transfers will show up here."
          />
        ) : meId ? (
          <Card className="divide-y divide-zinc-100 px-4">
            {recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                viewerId={meId}
              />
            ))}
          </Card>
        ) : null}
      </section>
    </div>
  );
}
