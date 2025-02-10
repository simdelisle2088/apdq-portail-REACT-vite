import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DeleteModalProps } from '../interface/interface';

export const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
  remorqueurName,
  deleteError,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('dashboard.users.delete.title')}</DialogTitle>
      <DialogContent>
        <Typography>
          {t('dashboard.users.delete.confirmation', { name: remorqueurName })}
        </Typography>
        {deleteError && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {deleteError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('dashboard.users.delete.cancel')}</Button>
        <Button onClick={onConfirm} color='error' variant='contained'>
          {t('dashboard.users.delete.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
