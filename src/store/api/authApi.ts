import { api } from '@/store/api/baseApi';
import type { IAuthResponse, User } from '@/types/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<IAuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<IAuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    /** Current session user (GET /auth/me). */
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApi;
