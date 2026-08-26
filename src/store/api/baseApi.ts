import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { API_URL, TOKEN_STORAGE_KEY } from '@/lib/constants';
import { clearAuth } from '@/store/slices/authSlice';
import { reportApiFailure, reportApiSuccess } from '@/lib/connectivity';
import { clearApiRuntimeCache } from '@/lib/sw-runtime';

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


const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // Feed the connectivity banner: FETCH_ERROR means the fetch itself failed
  // (offline / DNS / timeout) — any HTTP status means the server answered.
  if (result.error?.status === 'FETCH_ERROR') {
    reportApiFailure();
  } else if (!result.error) {
    reportApiSuccess();
  }

  if (result.error?.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isAuthCall = AUTH_ENDPOINTS.some((endpoint) =>
      url.includes(endpoint),
    );
    if (!isAuthCall) {
      api.dispatch(clearAuth());
      // Session token is gone → purge that user's cached API responses too
      // so a later account on this device can't read financial data offline.
      clearApiRuntimeCache();
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
