import { configureStore } from '@reduxjs/toolkit';
import dataTableReducer from './dataTableSlice';

export const store = configureStore({
  reducer: {
    dataTable: dataTableReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;