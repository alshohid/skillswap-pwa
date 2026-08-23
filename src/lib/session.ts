import {
  APPLIED_TASKS_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '@/lib/constants';
import type { User } from '@/types/api';

/* ------------------------------------------------------------------ */
/* Auth session storage                                                */
/* ------------------------------------------------------------------ */

export function loadStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeSession(token: string, user?: User | null): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

export function loadStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Local record of tasks the current user applied to                   */
/*                                                                     */
/* The API only exposes GET /tasks/:id/applications, so there is no    */
/* single "applications I submitted" endpoint. We keep a best-effort   */
/* local list of task ids to power the "Applied" tab.                  */
/* ------------------------------------------------------------------ */

export function getAppliedTaskIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(APPLIED_TASKS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

export function addAppliedTaskId(taskId: number): void {
  if (typeof window === 'undefined') return;
  const ids = getAppliedTaskIds();
  if (!ids.includes(taskId)) {
    window.localStorage.setItem(
      APPLIED_TASKS_KEY,
      JSON.stringify([taskId, ...ids].slice(0, 200)),
    );
  }
}

export function removeAppliedTaskIds(taskIds: number[]): void {
  if (typeof window === 'undefined') return;
  const ids = getAppliedTaskIds().filter((id) => !taskIds.includes(id));
  window.localStorage.setItem(APPLIED_TASKS_KEY, JSON.stringify(ids));
}
