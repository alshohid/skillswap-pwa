import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { API_URL, TOKEN_STORAGE_KEY } from '@/lib/constants';
import { clearAuth } from '@/store/slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders(headers) {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/** Endpoints where a 401 is an expected business result, not a dead session. */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

/**
 * Base query with global 401 handling: any authenticated endpoint that comes
 * back unauthorized clears the local session and hard-navigates to /login
 * (a full navigation also resets the in-memory store cleanly).
 */
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isAuthCall = AUTH_ENDPOINTS.some((endpoint) =>
      url.includes(endpoint),
    );
    if (!isAuthCall) {
      api.dispatch(clearAuth());
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.assign(
          `/login?next=${encodeURIComponent(window.location.pathname)}&expired=1`,
        );
      }
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'User',
    'Task',
    'Tasks',
    'Application',
    'Applications',
    'Transaction',
    'Transactions',
    'Balance',
  ],
  endpoints: () => ({}),
});
