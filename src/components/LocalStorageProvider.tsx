'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { savePreferences, loadPreferences } from '@/redux/localStorage';
import { loadFromLocalStorage } from '@/redux/dataTableSlice';

const LocalStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { columns, theme, rowsPerPage } = useAppSelector((state) => state.dataTable);

  // Load preferences on mount
  useEffect(() => {
    const preferences = loadPreferences();
    if (preferences) {
      dispatch(loadFromLocalStorage(preferences));
    }
  }, [dispatch]);

  // Save preferences when they change
  useEffect(() => {
    savePreferences({ columns, theme, rowsPerPage });
  }, [columns, theme, rowsPerPage]);

  return <>{children}</>;
};

export default LocalStorageProvider;