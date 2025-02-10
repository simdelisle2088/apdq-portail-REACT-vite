import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CreateModalProps,
  CreateRemorqueurRequest,
} from '../interface/interface';
import { useAuth } from '../hooks/authContext';

export const CreateModal: React.FC<CreateModalProps> = ({
  open,
  onClose,
  onConfirm,
  createError,
  createSuccess,
  setCreateError,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    tel: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        tel: '',
        username: '',
        password: '',
      });
      setCreateError(null);
    }
  }, [open, setCreateError]);

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.garage_name) {
      setCreateError(t('dashboard.users.create.error.noGarage'));
      return;
    }

    const createData: CreateRemorqueurRequest = {
      ...formData,
      garage_name: user.garage_name,
      role_name: 'remorqueur',
    };

    try {
      await onConfirm(createData);
    } catch (error) {
      console.error('Error creating remorqueur:', error);
      setCreateError(t('dashboard.users.create.error.generic'));
    }
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.tel ||
      !formData.username ||
      !formData.password
    ) {
      setCreateError(t('dashboard.users.create.error.requiredFields'));
      return false;
    }
    return true;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '500px',
        },
      }}>
      <DialogTitle>{t('dashboard.users.create.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label={t('dashboard.users.create.name')}
            value={formData.name}
            onChange={handleInputChange('name')}
            fullWidth
            required
          />
          <TextField
            label={t('dashboard.users.create.tel')}
            value={formData.tel}
            onChange={handleInputChange('tel')}
            fullWidth
            required
          />
          <TextField
            label={t('dashboard.users.create.username')}
            value={formData.username}
            onChange={handleInputChange('username')}
            fullWidth
            required
          />
          <TextField
            label={t('dashboard.users.create.password')}
            type='password'
            value={formData.password}
            onChange={handleInputChange('password')}
            fullWidth
            required
          />
          {createSuccess && (
            <Alert severity='success'>
              {t('dashboard.users.create.success')}
            </Alert>
          )}
          {createError && <Alert severity='error'>{createError}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#14BCBC' }}>
          {t('dashboard.users.create.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          sx={{
            bgcolor: '#14BCBC',
            '&:hover': {
              bgcolor: '#48BA65',
            },
          }}>
          {t('dashboard.users.create.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
