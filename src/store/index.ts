import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/store/api/baseApi';
import authReducer from '@/store/slices/authSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
