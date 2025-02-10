// src/components/dashboard/EditModal.tsx

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  EditModalProps,
  UpdateRemorqueurRequest,
} from '../interface/interface';

// Create the EditModal component as a separate functional component
export const EditModal: React.FC<EditModalProps> = ({
  open,
  onClose,
  onUpdate,
  editingRemorqueur,
  setEditingRemorqueur,
  updateSuccess,
  updateError,
}) => {
  const { t } = useTranslation();

  // Create local state to manage form inputs smoothly
  const [formData, setFormData] = useState(editingRemorqueur);

  // Update local state when the editingRemorqueur prop changes
  useEffect(() => {
    setFormData(editingRemorqueur);
  }, [editingRemorqueur]);

  // Handle input changes for all form fields
  const handleInputChange =
    (field: keyof UpdateRemorqueurRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'is_active' ? e.target.checked : e.target.value;
      // Update both local and parent state
      setFormData((prev) => ({ ...prev, [field]: value }));
      setEditingRemorqueur((prev) => ({ ...prev, [field]: value }));
    };

  return (
    <Dialog
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '600px',
        },
      }}
      open={open}
      onClose={onClose}>
      <DialogTitle>{t('dashboard.users.edit.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label={t('dashboard.users.edit.name')}
            value={formData.name}
            onChange={handleInputChange('name')}
            fullWidth
            autoComplete='off'
          />
          <TextField
            label={t('dashboard.users.edit.tel')}
            value={formData.tel}
            onChange={handleInputChange('tel')}
            fullWidth
            autoComplete='off'
          />
          <TextField
            label={t('dashboard.users.edit.username')}
            value={formData.username}
            onChange={handleInputChange('username')}
            fullWidth
            autoComplete='off'
          />
          <TextField
            label={t('dashboard.users.edit.password')}
            type='password'
            value={formData.password}
            onChange={handleInputChange('password')}
            fullWidth
            placeholder={t('dashboard.users.edit.placeholder')}
            autoComplete='new-password'
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => {
                  handleInputChange('is_active')(e as any);
                }}
              />
            }
            label={
              formData.is_active
                ? t('dashboard.users.status.active')
                : t('dashboard.users.status.inactive')
            }
          />
          {updateSuccess && (
            <Alert severity='success'>
              {t('dashboard.users.edit.success')}
            </Alert>
          )}
          {updateError && <Alert severity='error'>{updateError}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('dashboard.users.edit.cancel')}</Button>
        <Button onClick={onUpdate} variant='contained' color='primary'>
          {t('dashboard.users.edit.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
