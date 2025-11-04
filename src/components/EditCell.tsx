'use client';

import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { useAppDispatch } from '@/redux/hooks';
import { updateUser } from '@/redux/dataTableSlice';

interface EditCellProps {
  value: any;
  rowId: string;
  field: string;
  type?: 'text' | 'number' | 'email';
  onSave: () => void;
  onCancel: () => void;
}

const EditCell: React.FC<EditCellProps> = ({ value, rowId, field, type = 'text', onSave, onCancel }) => {
  const [editValue, setEditValue] = useState(value);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  const handleSave = () => {
    let finalValue = editValue;
    
    // Validate based on type
    if (type === 'number') {
      const numValue = Number(editValue);
      if (isNaN(numValue)) {
        alert('Please enter a valid number');
        return;
      }
      finalValue = numValue;
    } else if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editValue)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    dispatch(updateUser({ id: rowId, user: { [field]: finalValue } }));
    onSave();
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancel();
  };

  return (
    <TextField
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      size="small"
      autoFocus
      fullWidth
      inputProps={{
        style: { fontSize: '14px' }
      }}
    />
  );
};

export default EditCell;