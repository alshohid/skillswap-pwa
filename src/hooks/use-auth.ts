'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/store/api/baseApi';
import { setCredentials, setUser, clearAuth } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearStoredSession, storeSession } from '@/lib/session';
import { useGetMeQuery } from '@/store/api/authApi';
import type { User } from '@/types/api';

/**
 * Central auth accessor: session state, /auth/me hydration and
 * login/logout helpers shared across the app.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, user, hydrated } = useAppSelector((state) => state.auth);

  const {
    data: fetchedUser,
    isFetching,
    isError,
    refetch,
  } = useGetMeQuery(undefined, { skip: !token });

  // Persist every successful profile fetch so offline boots still render.
  useEffect(() => {
    if (token && fetchedUser) {
      dispatch(setUser(fetchedUser));
      storeSession(token, fetchedUser);
    }
  }, [token, fetchedUser, dispatch]);

  const login = useCallback(
    (newToken: string, newUser?: User | null) => {
      storeSession(newToken, newUser ?? null);
      dispatch(setCredentials({ token: newToken, user: newUser }));
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    clearStoredSession();
    dispatch(clearAuth());
    dispatch(api.util.resetApiState());
    router.replace('/login');
  }, [dispatch, router]);

  return {
    token,
    user,
    hydrated,
    isAuthenticated: Boolean(token && user),
    /** True during localStorage bootstrap or the first /auth/me roundtrip. */
    isLoading: !hydrated || (!!token && !user && isFetching),
    /** Token present but session check failed (e.g. offline, cold cache). */
    meError: Boolean(token && isError && !user),
    refetchMe: refetch,
    login,
    logout,
  };
}
