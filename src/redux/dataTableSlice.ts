import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  department?: string;
  location?: string;
}

export interface ColumnConfig {
  field: string;
  headerName: string;
  visible: boolean;
  width?: number;
  sortable?: boolean;
  editable?: boolean;
}

export interface DataTableState {
  users: User[];
  columns: ColumnConfig[];
  searchTerm: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  rowsPerPage: number;
  editingRows: string[];
  theme: 'light' | 'dark';
}

const initialUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, role: 'Developer' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, role: 'Designer' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35, role: 'Manager' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', age: 28, role: 'Developer' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', age: 32, role: 'QA Engineer' },
  { id: '6', name: 'Diana Davis', email: 'diana@example.com', age: 29, role: 'Product Manager' },
  { id: '7', name: 'Edward Miller', email: 'edward@example.com', age: 31, role: 'Developer' },
  { id: '8', name: 'Fiona Garcia', email: 'fiona@example.com', age: 27, role: 'Designer' },
  { id: '9', name: 'George Martinez', email: 'george@example.com', age: 33, role: 'DevOps' },
  { id: '10', name: 'Helen Rodriguez', email: 'helen@example.com', age: 26, role: 'Developer' },
  { id: '11', name: 'Ian Thompson', email: 'ian@example.com', age: 34, role: 'Architect' },
  { id: '12', name: 'Julia White', email: 'julia@example.com', age: 30, role: 'Scrum Master' },
];

const initialColumns: ColumnConfig[] = [
  { field: 'name', headerName: 'Name', visible: true, width: 150, sortable: true, editable: true },
  { field: 'email', headerName: 'Email', visible: true, width: 200, sortable: true, editable: true },
  { field: 'age', headerName: 'Age', visible: true, width: 100, sortable: true, editable: true },
  { field: 'role', headerName: 'Role', visible: true, width: 150, sortable: true, editable: true },
  { field: 'department', headerName: 'Department', visible: false, width: 150, sortable: true, editable: true },
  { field: 'location', headerName: 'Location', visible: false, width: 150, sortable: true, editable: true },
];

const initialState: DataTableState = {
  users: initialUsers,
  columns: initialColumns,
  searchTerm: '',
  sortField: 'name',
  sortDirection: 'asc',
  currentPage: 0,
  rowsPerPage: 10,
  editingRows: [],
  theme: 'light',
};

const dataTableSlice = createSlice({
  name: 'dataTable',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<{ id: string; user: Partial<User> }>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload.user };
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 0;
    },
    setSorting: (state, action: PayloadAction<{ field: string; direction: 'asc' | 'desc' }>) => {
      state.sortField = action.payload.field;
      state.sortDirection = action.payload.direction;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 0;
    },
    toggleColumnVisibility: (state, action: PayloadAction<string>) => {
      const column = state.columns.find(col => col.field === action.payload);
      if (column) {
        column.visible = !column.visible;
      }
    },
    addColumn: (state, action: PayloadAction<ColumnConfig>) => {
      state.columns.push(action.payload);
    },
    setEditingRows: (state, action: PayloadAction<string[]>) => {
      state.editingRows = action.payload;
    },
    addEditingRow: (state, action: PayloadAction<string>) => {
      if (!state.editingRows.includes(action.payload)) {
        state.editingRows.push(action.payload);
      }
    },
    removeEditingRow: (state, action: PayloadAction<string>) => {
      state.editingRows = state.editingRows.filter(id => id !== action.payload);
    },
    updateEditingValue: (state, action: PayloadAction<{ id: string; field: string; value: any }>) => {
      const user = state.users.find(u => u.id === action.payload.id);
      if (user) {
        (user as any)[action.payload.field] = action.payload.value;
      }
    },
    saveAll: (state) => {
      state.editingRows = [];
    },
    cancelAll: (state) => {
      state.editingRows = [];
    },
    setColumnOrder: (state, action: PayloadAction<string[]>) => {
      const newColumns = action.payload.map(field => {
        return state.columns.find(c => c.field === field)!;
      });
      state.columns = newColumns;
    },

    loadFromLocalStorage: (state, action: PayloadAction<Partial<DataTableState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setSearchTerm,
  setSorting,
  setPage,
  setRowsPerPage,
  toggleColumnVisibility,
  addColumn,
  setEditingRows,
  addEditingRow,
  removeEditingRow,
  updateEditingValue,
  saveAll,
  cancelAll,
  setColumnOrder,
  loadFromLocalStorage,
} = dataTableSlice.actions;

export default dataTableSlice.reducer;