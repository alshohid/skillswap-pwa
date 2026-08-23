'use client';

import { Coins, ReceiptText } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { TransactionItem } from '@/components/common/TransactionItem';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import { formatPoints } from '@/lib/utils';
import {
  useGetBalanceQuery,
  useGetMyTransactionsQuery,
} from '@/store/api/transactionsApi';

export default function TransactionsPage() {
  const { user } = useAuth();
  const meId = user?.id;

  const { data: balance, isLoading: balanceLoading } = useGetBalanceQuery(
    undefined,
    { skip: !meId },
  );

  const {
    data: transactions,
    isLoading,
    isError,
    refetch,
  } = useGetMyTransactionsQuery(undefined, { skip: !meId });

  const shownBalance = balance ?? user?.skill_points ?? 0;
  const list = transactions ?? [];

  return (
    <div className="animate-rise">
      <PageHeader
        title="Transactions"
        subtitle="Every Skill Point that came in or went out."
      />

      {/* Balance hero */}
      <Card className="mb-5 border-brand/20 bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-md">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/80">
          <Coins className="size-3.5" aria-hidden />
          Current balance
        </p>
        {balanceLoading && !user ? (
          <span className="mt-1 block h-9 w-28 animate-pulse rounded-lg bg-white/25" />
        ) : (
          <p className="mt-1 text-4xl font-extrabold tabular-nums tracking-tight">
            {formatPoints(shownBalance)}
          </p>
        )}
      </Card>

      {/* History */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : isError ? (
        <QueryErrorState
          error="Couldn't load your transactions."
          onRetry={() => void refetch()}
        />
      ) : list.length === 0 || !meId ? (
        <EmptyState
          icon={ReceiptText}
          title="No transactions yet"
          description="Complete a task to receive points — every transfer will be listed here."
        />
      ) : (
        <Card className="divide-y divide-zinc-100 px-4">
          {list.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              viewerId={meId}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
