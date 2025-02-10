import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { AdminUpdateForm, GarageUpdateForm } from '../interface/interface';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { settingsController } from '../controllers/settingsController';
import loginController from '../controllers/loginController';
import { stripeController } from '../controllers/stripeController';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';

const Settings: React.FC = () => {
  const { t } = useTranslation();

  const userRole = loginController.getUserRole()?.name;
  const isAdmin = userRole === 'superadmin' || userRole === 'apdq';
  const currentUsername = loginController.getCurrentUser()?.username || '';
  const [billingError, setBillingError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [adminForm, setAdminForm] = useState<AdminUpdateForm>({
    username: currentUsername,
    new_username: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [garageForm, setGarageForm] = useState<GarageUpdateForm>({
    newPassword: '',
    confirmPassword: '',
  });

  const handleAdminFormChange =
    (field: keyof AdminUpdateForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAdminForm({
        ...adminForm,
        [field]: event.target.value,
      });
      setError('');
    };

  const handleGarageFormChange =
    (field: keyof GarageUpdateForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setGarageForm({
        ...garageForm,
        [field]: event.target.value,
      });
      setError('');
    };

  // Handler for password update submission
  const handleUpdate = async () => {
    // Different validation based on user type
    if (isAdmin) {
      if (adminForm.newPassword !== adminForm.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      if (garageForm.newPassword !== garageForm.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsUpdating(true);
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        throw new Error('Missing authentication details. Please log in again.');
      }

      let response;
      if (isAdmin) {
        // Admin update with correct structure
        response = await settingsController.updateAdmin(
          authToken,
          currentUsername,
          {
            new_username: adminForm.new_username || undefined,
            password: adminForm.newPassword || undefined,
          }
        );
      } else {
        // Garage update with correct structure
        const garageName = localStorage.getItem('garageName');
        if (!garageName) {
          throw new Error('Missing garage details. Please log in again.');
        }
        response = await settingsController.updateGarage(
          authToken,
          garageName,
          {
            password: garageForm.newPassword,
          }
        );
      }

      if (response.success) {
        // Reset appropriate form
        if (isAdmin) {
          setAdminForm({
            ...adminForm,
            new_username: '',
            newPassword: '',
            confirmPassword: '',
          });
        } else {
          setGarageForm({
            newPassword: '',
            confirmPassword: '',
          });
        }

        setError('');
        setSuccessMessage('Update successful!');

        // Update localStorage if admin username was changed
        if (isAdmin && response.data.username) {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.username = response.data.username;
          localStorage.setItem('user', JSON.stringify(userData));
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Failed to update');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('API Error:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });

        switch (err.response?.status) {
          case 403:
            setError('You do not have permission to perform this update');
            break;
          case 404:
            setError(isAdmin ? 'User not found' : 'Garage not found');
            break;
          case 400:
            setError(err.response.data?.detail || 'Invalid input');
            break;
          default:
            setError('Network error occurred. Please try again.');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setBillingError('');

      const response = await stripeController.createPortalSession();

      if (response.success && response.data?.url) {
        // Open in new window instead of redirecting
        const portalWindow = window.open(
          response.data.url,
          'StripePortal', // Name for the new window
          'width=1000,height=800,menubar=no,toolbar=no,location=no' // Window features
        );

        // Check if window was successfully opened
        if (!portalWindow) {
          setBillingError(
            'Pop-up was blocked. Please allow pop-ups and try again.'
          );
        }
      } else {
        setBillingError(response.message);
      }
    } catch (err) {
      console.error('Billing portal error:', err);
      setBillingError(
        'Failed to access billing portal. Please try again later.'
      );
    }
  };
  return (
    <Box
      sx={{
        padding: '24px',
        backgroundColor: '#fff',
        borderRadius: '14px',
        height: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflowY: 'auto', // Added to handle overflow content
      }}>
      {/* Main Title */}
      <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#202224' }}>
        {t('dashboard.garages.settings.title')}
      </Typography>

      {/* Account Settings Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4, // Increased gap for better section separation
          maxWidth: 400,
        }}>
        {/* Form Fields Container */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isAdmin ? (
            // Admin form fields
            <>
              <TextField
                label={t('dashboard.garages.settings.currentUsername')}
                variant='outlined'
                fullWidth
                value={currentUsername}
                disabled
              />
              <TextField
                label={t('dashboard.garages.settings.newUsername')}
                variant='outlined'
                fullWidth
                value={adminForm.new_username}
                onChange={handleAdminFormChange('new_username')}
                error={!!error}
              />
              <TextField
                label={t('dashboard.garages.settings.newPassword')}
                type='password'
                variant='outlined'
                fullWidth
                value={adminForm.newPassword}
                onChange={handleAdminFormChange('newPassword')}
                error={!!error}
              />
              <TextField
                label={t('dashboard.garages.settings.confirmPassword')}
                type='password'
                variant='outlined'
                fullWidth
                value={adminForm.confirmPassword}
                onChange={handleAdminFormChange('confirmPassword')}
                error={!!error}
                helperText={error}
              />
            </>
          ) : (
            // Garage form fields
            <>
              <TextField
                label={t('dashboard.garages.settings.garageName')}
                variant='outlined'
                fullWidth
                disabled
                value={localStorage.getItem('garageName') || ''}
              />
              <TextField
                label={t('dashboard.garages.settings.username')}
                variant='outlined'
                fullWidth
                disabled
                value={currentUsername}
              />
              <TextField
                label={t('dashboard.garages.settings.newPassword')}
                type='password'
                variant='outlined'
                fullWidth
                value={garageForm.newPassword}
                onChange={handleGarageFormChange('newPassword')}
                error={!!error}
              />
              <TextField
                label={t('dashboard.garages.settings.confirmPassword')}
                type='password'
                variant='outlined'
                fullWidth
                value={garageForm.confirmPassword}
                onChange={handleGarageFormChange('confirmPassword')}
                error={!!error}
                helperText={error}
              />
            </>
          )}

          {/* Update Button */}
          <Button
            variant='contained'
            color='primary'
            size='large'
            onClick={handleUpdate}
            disabled={isUpdating}
            sx={{
              background: 'linear-gradient(to right, #12BCC1, #5C8A47)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
              },
              color: '#FFF',
              mt: 2,
            }}>
            {isUpdating
              ? t('dashboard.garages.settings.buttonUpdating')
              : t('dashboard.garages.settings.button')}
          </Button>

          {/* Success Message */}
          {successMessage && (
            <Typography color='success' sx={{ mt: 2 }}>
              {successMessage}
            </Typography>
          )}
        </Box>
      </Box>
      {/* Billing Section - Only shown for garage users */}
      {!isAdmin && (
        <Box
          sx={{
            mt: 4,
            pt: 4,
            borderTop: '1px solid #e0e0e0',
          }}>
          <Button
            variant='outlined'
            color='primary'
            onClick={handleManageBilling}
            startIcon={<CreditCardIcon />}
            sx={{
              width: 'fit-content',
              borderColor: '#12BCC1',
              color: '#12BCC1',
              '&:hover': {
                borderColor: '#5C8A47',
                backgroundColor: 'rgba(92, 138, 71, 0.04)',
              },
            }}>
            {t('dashboard.garages.settings.manageBilling')}
          </Button>

          {/* Add a helper text */}
          <Typography
            variant='caption'
            color='textSecondary'
            sx={{
              display: 'block',
              mt: 1,
            }}>
            {t(
              'dashboard.garages.settings.billingPopupNote',
              'The billing portal will open in a new window. Please ensure pop-ups are allowed.'
            )}
          </Typography>

          {/* Billing Error Message */}
          {billingError && (
            <Typography color='error' sx={{ mt: 2, fontSize: '0.875rem' }}>
              {billingError}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Settings;
