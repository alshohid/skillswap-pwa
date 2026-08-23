import type {
  Paginated,
  Task,
  Transaction,
} from '@/types/api';

type Raw = Record<string, unknown>;

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Normalises the many shapes a paginated endpoint might return into one
 * envelope: `{ items, total, page, limit, totalPages }`. Handles raw arrays,
 * `{ data, meta }`, `{ items, ... }`, `{ results, total }`, etc.
 */
export function normalizePaginated<T>(
  raw: unknown,
  fallbackPage = 1,
  fallbackLimit = 10,
): Paginated<T> {
  if (Array.isArray(raw)) {
    return {
      items: raw as T[],
      total: raw.length,
      page: fallbackPage,
      limit: fallbackLimit,
      totalPages: 1,
    };
  }

  const body = (raw ?? {}) as Raw;
  const items = ((body.data ?? body.items ?? body.results ?? body.tasks ??
    body.rows) ?? []) as T[];

  const meta = (body.meta ?? body.pagination ?? body.pageInfo ?? {}) as Raw;
  const total = num(body.total ?? meta.total ?? body.totalItems ?? body.count, items.length);
  const page = num(body.page ?? meta.page ?? body.currentPage, fallbackPage);
  const limit = num(
    body.limit ?? meta.limit ?? body.perPage ?? body.take,
    items.length || fallbackLimit,
  );
  const totalPages = num(
    body.totalPages ?? meta.totalPages ?? body.lastPage ?? meta.lastPage,
    limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1,
  );

  return { items, total, page, limit, totalPages };
}

/** Tolerates `amount` / `points` / `points_transferred` field names. */
export function normalizeTransaction(raw: Raw): Transaction {
  return {
    id: num(raw.id),
    from_user_id: num(raw.from_user_id ?? raw.fromUserId ?? raw.sender_id),
    to_user_id: num(raw.to_user_id ?? raw.toUserId ?? raw.receiver_id),
    task_id:
      raw.task_id === null || raw.task_id === undefined
        ? null
        : num(raw.task_id),
    amount: num(raw.amount ?? raw.points ?? raw.points_transferred),
    type:
      raw.type === 'CREDIT' || raw.type === 'DEBIT'
        ? raw.type
        : raw.transaction_type === 'CREDIT' ||
            raw.transaction_type === 'DEBIT'
          ? raw.transaction_type
          : undefined,
    description:
      typeof raw.description === 'string' ? raw.description : null,
    created_at: String(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
    task: Array.isArray(raw.task)
      ? null
      : ((raw.task as Transaction['task']) ?? null),
    from_user: (raw.from_user as Transaction['from_user']) ?? null,
    to_user: (raw.to_user as Transaction['to_user']) ?? null,
  };
}

export function normalizeTransactions(raw: unknown): Transaction[] {
  const list = Array.isArray(raw)
    ? raw
    : (((raw as Raw | null)?.data ??
        (raw as Raw | null)?.items ??
        (raw as Raw | null)?.results ??
        []) as unknown[]);
  return (list as Raw[]).map(normalizeTransaction);
}

/** Tolerates `{ balance }` / `{ skill_points }` / bare number. */
export function normalizeBalance(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  const body = (raw ?? {}) as Raw;
  return num(body.balance ?? body.skill_points ?? body.points ?? body.amount);
}

/** Task detail endpoints sometimes wrap the entity; unwrap when needed. */
export function unwrapTask<T = Task>(raw: unknown): T {
  if (
    raw &&
    typeof raw === 'object' &&
    !('id' in (raw as Raw)) &&
    'data' in (raw as Raw)
  ) {
    return (raw as Raw).data as T;
  }
  return raw as T;
}
