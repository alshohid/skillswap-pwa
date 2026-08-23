'use client';

import { useEffect } from 'react';
import { useGetMeQuery } from '@/store/api/authApi';
import { setCredentials, setUser, setHydrated } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadStoredToken,
  loadStoredUser,
  storeSession,
} from '@/lib/session';

/**
 * Runs once on mount: replays the persisted session (cached profile first
 * for an instant authenticated paint), then lets /auth/me revalidate.
 * Also persists every successful profile fetch back to localStorage so the
 * PWA can still render the shell when offline.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const storedUser = loadStoredUser();
    if (storedUser?.id) dispatch(setUser(storedUser));

    const storedToken = loadStoredToken();
    if (storedToken) dispatch(setCredentials({ token: storedToken }));

    dispatch(setHydrated());
  }, [dispatch]);

  const { data: user } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (token && user) {
      dispatch(setUser(user));
      storeSession(token, user);
    }
  }, [token, user, dispatch]);

  return null;
}
