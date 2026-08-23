import { api } from '@/store/api/baseApi';
import type { User } from '@/types/api';

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** Full profile of the logged-in user (GET /users/me). */
    getProfile: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    /** PATCH /users/me — currently only fullName is editable. */
    updateProfile: builder.mutation<User, { fullName: string; bio?: string }>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = usersApi;
