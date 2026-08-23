import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

/** Tiny classnames helper (no external deps). */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(' ');
}

/** `100` → `100 pts` */
export function formatPoints(points: number | undefined | null): string {
  return `${points ?? 0} pts`;
}

/** Signed variant used on transaction rows. */
export function formatSignedPoints(amount: number, credit: boolean): string {
  return `${credit ? '+' : '-'}${Math.abs(amount)} pts`;
}

const RELATIVE_DIVISIONS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['second', 60],
  ['minute', 60],
  ['hour', 24],
  ['day', 7],
  ['week', 4.345],
  ['month', 12],
  ['year', Number.POSITIVE_INFINITY],
];

/** `3 days ago` / `in 2 hours` — locale-independent English output. */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = (d.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 45) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  let duration = diff;
  for (const [unit, span] of RELATIVE_DIVISIONS) {
    if (abs < span) return rtf.format(Math.round(duration), unit);
    duration /= span;
    if (!Number.isFinite(duration)) break;
  }
  return rtf.format(Math.round(duration), 'year');
}

/** `Aug 22, 2026` */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/** `August 2026` — used for "Member since". */
export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    d,
  );
}

/** `John Doe` → `JD` */
export function initials(name: string | undefined | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** First word of a full name — "Welcome back, John". */
export function firstName(name: string | undefined | null): string {
  return name?.trim().split(/\s+/)[0] ?? '';
}

interface HttpErrorData {
  message?: string | string[];
  error?: string;
}

/**
 * Human-friendly message for RTK Query errors (FetchBaseQueryError or
 * SerializedError), offline 503s from the service worker, plain Errors, etc.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const err = error as FetchBaseQueryError | SerializedError;
    if ('status' in err && err.status !== undefined) {
      const data = 'data' in err ? (err.data as HttpErrorData) : undefined;
      const apiMessage = Array.isArray(data?.message)
        ? data?.message[0]
        : data?.message;
      if (apiMessage) return apiMessage;
      if (typeof data?.error === 'string') return data.error;
      if (err.status === 503) {
        return 'You are offline. Please try again when connected.';
      }
      if (err.status === 401) return 'Your session has expired. Please log in again.';
      if (err.status === 403) return 'You are not allowed to perform this action.';
      if (err.status === 404) return 'Not found.';
      if (typeof err.status === 'number') return `Request failed (${err.status}).`;
      return fallback;
    }
    if ('message' in err && err.message) return err.message;
  }
  return fallback;
}
