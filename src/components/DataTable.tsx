'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, IconButton, TextField, Box, Typography, Paper, Grid } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { User } from '@/redux/dataTableSlice';
import {
  setSearchTerm,
  setSorting,
  setPage,
  setEditingRows,
  updateUser,
  deleteUser,
  loadFromLocalStorage,
  setColumnOrder,
} from '@/redux/dataTableSlice';
import { loadPreferences } from '@/redux/localStorage';
import EditCell from './EditCell';

const DataTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    columns,
    searchTerm,
    sortField,
    sortDirection,
    currentPage,
    rowsPerPage,
    editingRows,
  } = useAppSelector((state) => state.dataTable);
  const [localEditingRow, setLocalEditingRow] = useState<string | null>(null);

  const handleRowDoubleClick = useCallback((params: any) => {
    setLocalEditingRow(params.id);
    dispatch(setEditingRows([params.id]));
  }, [dispatch]);

  const handleSaveEdit = useCallback(() => {
    setLocalEditingRow(null);
    dispatch(setEditingRows([]));
  }, [dispatch]);

  const handleCancelEdit = useCallback(() => {
    setLocalEditingRow(null);
    dispatch(setEditingRows([]));
  }, [dispatch]);

  useEffect(() => {
    const preferences = loadPreferences();
    if (preferences) {
      dispatch(loadFromLocalStorage(preferences));
    }
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.age.toString().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (user.department && user.department.toLowerCase().includes(searchLower)) ||
        (user.location && user.location.toLowerCase().includes(searchLower))
      );
    });
  }, [users, searchTerm]);

  const getPropertyValue = (obj: User, key: string): any => {
    return (obj as any)[key];
  };

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aValue = getPropertyValue(a, sortField);
      const bValue = getPropertyValue(b, sortField);
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredUsers, sortField, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const startIndex = currentPage * rowsPerPage;
    return sortedUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedUsers, currentPage, rowsPerPage]);

  const visibleColumns = columns.filter(col => col.visible);

  const gridColumns: GridColDef[] = [
    ...visibleColumns.map(col => ({
      field: col.field,
      headerName: col.headerName,
      width: col.width || 150,
      sortable: col.sortable !== false,
      editable: col.editable === true,
      renderCell: (params: GridRenderCellParams) => {
        if (localEditingRow === params.id) {
          return (
            <EditCell
              value={params.value}
              rowId={params.id as string}
              field={col.field}
              type={col.field === 'age' ? 'number' : 'text'}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          );
        }
        return params.value;
      }
    })),
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {localEditingRow === params.id ? (
            <>
               <IconButton size="small" color="primary" onClick={handleSaveEdit}>
                 <SaveIcon />
               </IconButton>
               <IconButton size="small" color="secondary" onClick={handleCancelEdit}>
                 <CancelIcon />
               </IconButton>
             </>
          ) : (
            <>
              <IconButton
                size="small"
                color={editingRows.includes(params.row.id) ? 'primary' : 'default'}
                onClick={() => handleRowDoubleClick(params)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteRow(params.row.id)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  const handleEditRow = (id: string) => {
    if (editingRows.includes(id)) {
      dispatch(setEditingRows(editingRows.filter(rowId => rowId !== id)));
    } else {
      dispatch(setEditingRows([...editingRows, id]));
    }
  };

  const handleDeleteRow = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const handleSortModelChange = (model: any) => {
    if (model.length > 0) {
      dispatch(setSorting({ field: model[0].field, direction: model[0].sort }));
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  const handleRowEditCommit = (params: any) => {
    const { id, field, value } = params;
    dispatch(updateUser({ id, user: { [field]: value } }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="h4" gutterBottom>
              Dynamic Data Table Manager
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              placeholder="Search all fields..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <DataGrid
        rows={paginatedUsers}
        columns={gridColumns}
        pagination
        paginationMode="client"
        onPaginationModelChange={(model) => handlePageChange(model.page)}
        paginationModel={{ page: currentPage, pageSize: rowsPerPage }}
        pageSizeOptions={[5, 10, 25, 50]}

        sortingMode="client"
        sortModel={[{ field: sortField, sort: sortDirection }]}
        onSortModelChange={handleSortModelChange}
        onRowDoubleClick={handleRowDoubleClick}
        onColumnOrderChange={(params) => {
          dispatch(setColumnOrder(params.map(c => c.field)));
        }}
        autoHeight
        disableRowSelectionOnClick
        processRowUpdate={handleRowEditCommit}
        sx={{
          '& .MuiDataGrid-cell:hover': {
            cursor: 'pointer',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
    </Paper>
  );
};

export default DataTable;