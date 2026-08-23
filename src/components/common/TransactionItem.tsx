import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatRelativeTime, formatSignedPoints, cn } from '@/lib/utils';
import type { Transaction } from '@/types/api';

export interface TransactionItemProps {
  transaction: Transaction;
  viewerId: number;
}

/**
 * One point-transfer row. Direction is derived by comparing the current
 * user's id with the transaction endpoints (falls back to the API-provided
 * CREDIT/DEBIT type when present).
 */
export function TransactionItem({
  transaction,
  viewerId,
}: TransactionItemProps) {
  const credit =
    transaction.type === 'CREDIT'
      ? true
      : transaction.type === 'DEBIT'
        ? false
        : transaction.to_user_id === viewerId;

  const counterparty = credit
    ? (transaction.from_user?.full_name ?? `user #${transaction.from_user_id}`)
    : (transaction.to_user?.full_name ?? `user #${transaction.to_user_id}`);

  const title =
    transaction.task?.title ?? transaction.description ?? 'Skill point transfer';

  return (
    <div className="flex items-center gap-3 py-3.5">
      <span
        aria-hidden
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          credit ? 'bg-success/15 text-success' : 'bg-danger/10 text-danger',
        )}
      >
        {credit ? (
          <ArrowDownLeft className="size-4" />
        ) : (
          <ArrowUpRight className="size-4" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-950">{title}</p>
        <p className="truncate text-xs text-zinc-500">
          {credit ? 'Received from' : 'Sent to'}{' '}
          <span className="font-medium">{counterparty}</span> ·{' '}
          {formatRelativeTime(transaction.created_at)}
        </p>
      </div>

      <span
        className={cn(
          'shrink-0 text-sm font-bold tabular-nums',
          credit ? 'text-success' : 'text-danger',
        )}
      >
        {formatSignedPoints(transaction.amount, credit)}
      </span>
    </div>
  );
}
