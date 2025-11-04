'use client';

import React, { useRef, useState } from 'react';
import { Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, Tooltip, IconButton, Checkbox, Grid } from '@mui/material';
import { Upload as UploadIcon, Download as DownloadIcon, Settings as SettingsIcon, Add as AddIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { addUser, toggleColumnVisibility, addColumn, saveAll, cancelAll } from '@/redux/dataTableSlice';
import * as Papa from 'papaparse';
import { saveAs } from 'file-saver';

const Toolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, columns } = useAppSelector((state) => state.dataTable);
  
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnField, setNewColumnField] = useState('');

  const visibleColumns = columns.filter(col => col.visible);

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          alert(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
          return;
        }

        const importedUsers = results.data.map((row: any, index: number) => {
          if (!row.name || !row.email) {
            alert(`Row ${index + 1}: Missing required fields (name, email)`);
            return null;
          }

          let age = 0;
          if (row.age) {
            age = parseInt(row.age);
            if (isNaN(age)) {
              alert(`Row ${index + 1}: Age must be a number`);
              return null;
            }
          }

          return {
            id: `imported_${Date.now()}_${index}`,
            name: row.name.trim(),
            email: row.email.trim(),
            age: age,
            role: row.role || 'Unknown',
            department: row.department || '',
            location: row.location || '',
          };
        }).filter(Boolean);

        if (importedUsers.length > 0) {
          importedUsers.forEach(user => {
            if (user) dispatch(addUser(user));
          });
          alert(`Successfully imported ${importedUsers.length} users`);
        }
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
      }
    });

    event.target.value = '';
  };

  const handleExportCSV = () => {
    const exportData = users.map(user => {
      const filteredUser: any = {};
      visibleColumns.forEach(col => {
        filteredUser[col.headerName] = user[col.field as keyof typeof user];
      });
      return filteredUser;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'data_export.csv');
  };



  const handleAddColumn = () => {
    if (newColumnName && newColumnField) {
      dispatch(addColumn({
        field: newColumnField.toLowerCase().replace(/\s+/g, '_'),
        headerName: newColumnField,
        visible: true,
        width: 150,
        sortable: true,
        editable: true,
      }));
      setNewColumnName('');
      setNewColumnField('');
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm="auto">
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-import"
            type="file"
            onChange={handleImportCSV}
          />
          <label htmlFor="csv-import">
            <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
              Import CSV
            </Button>
          </label>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Button 
            variant="outlined" 
            onClick={handleExportCSV}
            startIcon={<DownloadIcon />}
          >
            Export CSV
          </Button>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Button 
            variant="outlined" 
            onClick={() => setColumnDialogOpen(true)}
            startIcon={<SettingsIcon />}
          >
            Manage Columns
          </Button>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Button variant="contained" color="primary" onClick={() => dispatch(saveAll())}>
            Save All
          </Button>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Button variant="contained" color="secondary" onClick={() => dispatch(cancelAll())}>
            Cancel All
          </Button>
        </Grid>

      </Grid>

      <Dialog 
        open={columnDialogOpen} 
        onClose={() => setColumnDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Columns</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Show/Hide Columns
            </Typography>
            {columns.map((column) => (
              <FormControlLabel
                key={column.field}
                control={
                  <Checkbox
                    checked={column.visible}
                    onChange={() => dispatch(toggleColumnVisibility(column.field))}
                  />
                }
                label={column.headerName}
              />
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Add New Column
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Column name"
                value={newColumnField}
                onChange={(e) => setNewColumnField(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddColumn}
                startIcon={<AddIcon />}
                disabled={!newColumnField.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColumnDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Toolbar;