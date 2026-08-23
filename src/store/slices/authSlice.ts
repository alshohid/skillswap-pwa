import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/api';

interface AuthState {
  token: string | null;
  /** Hydrated from localStorage first, then refreshed via GET /auth/me. */
  user: User | null;
  /** True once localStorage has been read on the client (avoids SSR flash). */
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user?: User | null }>,
    ) {
      state.token = action.payload.token;
      if (action.payload.user !== undefined) {
        state.user = action.payload.user;
      }
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setHydrated(state) {
      state.hydrated = true;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
      state.hydrated = true;
    },
  },
});

export const { setCredentials, setUser, setHydrated, clearAuth } =
  authSlice.actions;

export default authSlice.reducer;
