import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import insuranceReducer from './slices/insuranceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    insurance: insuranceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
