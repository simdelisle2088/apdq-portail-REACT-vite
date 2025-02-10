import React, { useState } from 'react';
import { CreateGarageModalProps } from '../interface/interface';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const CreateGarageModal: React.FC<CreateGarageModalProps> = ({
  open,
  onClose,
  onConfirm,
  createError,
  createSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [emailError, setEmailError] = useState<string | null>(null);

  // Handle form submission
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        ...formData,
        email: formData.email.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className='text-xl font-bold'>
        {t('dashboard.garages.createGargage')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className='space-y-4'>
          {createError && <Alert className='mb-4'>{createError}</Alert>}
          {createSuccess && (
            <Alert className='mb-4 bg-green-50 text-green-800'>
              {t('dashboard.garages.success')}
            </Alert>
          )}
          <TextField
            autoFocus
            label={t('dashboard.garages.table.garageName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
            className='mb-4'
            sx={{ marginBottom: '20px' }}
          />
          <TextField
            label={t('dashboard.garages.table.email')}
            type='email'
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (emailError) validateEmail(e.target.value);
            }}
            error={!!emailError}
            helperText={emailError}
            required
            fullWidth
            className='mb-4'
            sx={{ marginBottom: '20px' }}
          />
          <TextField
            label={t('dashboard.garages.table.username')}
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            fullWidth
            className='mb-4'
            sx={{ marginBottom: '20px' }}
          />
          <TextField
            label={t('dashboard.garages.table.password')}
            type='password'
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            fullWidth
            sx={{ marginBottom: '20px' }}
          />
        </DialogContent>
        <DialogActions className='p-4'>
          <Button onClick={onClose} disabled={loading}>
            {t('data.form.buttons.cancel')}
          </Button>
          <Button type='submit' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateGarageModal;
