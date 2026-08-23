import { api } from '@/store/api/baseApi';
import { normalizeBalance, normalizeTransactions } from '@/lib/normalize';
import type { Transaction } from '@/types/api';

export const transactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /transactions/me — the logged-in user's point history. */
    getMyTransactions: builder.query<Transaction[], void>({
      query: () => '/transactions/me',
      transformResponse: normalizeTransactions,
      providesTags: [{ type: 'Transactions', id: 'LIST' }],
    }),

    /** GET /transactions — every transfer (admin scope). */
    getAllTransactions: builder.query<Transaction[], void>({
      query: () => '/transactions',
      transformResponse: normalizeTransactions,
      providesTags: [{ type: 'Transactions', id: 'LIST' }],
    }),

    /** GET /transactions/balance — normalised to a bare number. */
    getBalance: builder.query<number, void>({
      query: () => '/transactions/balance',
      transformResponse: normalizeBalance,
      providesTags: ['Balance'],
    }),
  }),
});

export const {
  useGetMyTransactionsQuery,
  useGetAllTransactionsQuery,
  useGetBalanceQuery,
} = transactionsApi;
