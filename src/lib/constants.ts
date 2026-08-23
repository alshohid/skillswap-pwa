/** Base URL of the NestJS API (no trailing slash). */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
).replace(/\/+$/, '');

export const TOKEN_STORAGE_KEY = 'skillswap_token';
export const USER_STORAGE_KEY = 'skillswap_user';
/** Task ids the current user applied to (best-effort local record). */
export const APPLIED_TASKS_KEY = 'skillswap_applied_task_ids';

export const PAGE_SIZE = 10;
export const RECENT_ITEMS = 5;
