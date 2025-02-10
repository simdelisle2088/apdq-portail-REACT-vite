import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
} from '@mui/material';
import Logo from '../components/logo';
import i18n from '../i18n';
import { useAuth } from '../hooks/authContext';
import { switchLanguage } from '../components/languageSwitch';
import { LoginCredentials } from '../interface/interface';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();

  // State management
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  useState<NodeJS.Timeout | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const result = await login(credentials);

      if (result.success) {
        navigate(`/dashboard/${i18n.language}`, { replace: true });
      } else {
        setError(result.error || t('login.errors.default'));
      }
    } catch (err) {
      setError(t('login.errors.default'));
      console.error('Login error:', err);
    }
  };

  const handleLanguageSwitch = () => {
    switchLanguage(navigate, location.pathname);
  };

  // The JSX return statement remains the same as in your original code
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #14B8A6, #16A34A)',
        padding: 2,
        position: 'relative',
      }}>
      <Button
        onClick={handleLanguageSwitch}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'white',
          border: 'none',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'grey.100',
          },
        }}>
        {i18n.language === 'fr' ? 'EN' : 'FR'}
      </Button>

      {successMessage && (
        <Alert
          severity='success'
          sx={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '300px',
            zIndex: 1000,
          }}>
          {successMessage}
        </Alert>
      )}

      <Container maxWidth='sm'>
        <Paper
          elevation={4}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '24px',
          }}>
          <Logo sx={{ marginBottom: 3 }} />

          <Typography variant='h5' gutterBottom>
            {t('login.title')}
          </Typography>

          <Typography
            variant='body2'
            color='text.secondary'
            textAlign='center'
            gutterBottom>
            {t('login.subtitle')}
          </Typography>

          {error && (
            <Alert severity='error' sx={{ width: '100%', marginY: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{ width: '100%', mt: 2 }}>
            <TextField
              fullWidth
              label={t('login.username.label')}
              type='text'
              name='username'
              value={credentials.username}
              onChange={handleChange}
              margin='normal'
              required
              placeholder={t('login.username.placeholder')}
            />

            <TextField
              fullWidth
              label={t('login.password.label')}
              type='password'
              name='password'
              value={credentials.password}
              onChange={handleChange}
              margin='normal'
              required
              placeholder={t('login.password.placeholder')}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1,
              }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color='primary'
                  />
                }
                label={t('login.rememberMe')}
              />

              <Link href='/forgot-password' color='primary' underline='hover'>
                {t('login.forgotPassword')}
              </Link>
            </Box>

            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
              sx={{
                mt: 3,
                mb: 2,
                color: '#FFF',
                position: 'relative',
                background: 'linear-gradient(to right, #12BCC1, #48BA65)',
              }}>
              {t('login.submit')}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
