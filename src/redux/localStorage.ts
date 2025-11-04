import { DataTableState } from './dataTableSlice';

const STORAGE_KEY = 'dataTablePreferences';

export const loadPreferences = (): Partial<DataTableState> | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Error loading preferences from localStorage:', error);
    return null;
  }
};

export const savePreferences = (state: Partial<DataTableState>) => {
  try {
    const preferences = {
      columns: state.columns,
      theme: state.theme,
      rowsPerPage: state.rowsPerPage,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error);
  }
};