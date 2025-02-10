import React from 'react';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Group as GroupIcon,
  Message as MessageIcon,
  LiveHelp as LiveHelpIcon,
  Help as HelpIcon,
  DataObject as DataObjectIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/authContext';
import Logo from '/assets/png/Logo.png';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
import { DashboardView, SidebarProps } from '../interface/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import { switchLanguage } from './languageSwitch';

const Sidebar: React.FC<SidebarProps> = ({ onViewChange, currentView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, role } = useAuth();
  const { t } = useTranslation();

  const hasRole = (roleName: string) => {
    return role?.name === roleName;
  };

  const canSeeMenuItem = (menuTitle: DashboardView) => {
    // Admin-only views (superadmin and apdq)
    if (
      menuTitle === DashboardView.FAQADMIN ||
      menuTitle === DashboardView.DATA
    ) {
      return hasRole('superadmin') || hasRole('apdq');
    }

    // Message admin view - only for admin roles
    if (menuTitle === DashboardView.MESSAGEADMIN) {
      return hasRole('superadmin') || hasRole('apdq');
    }

    // Message garage view - only for garage role
    if (menuTitle === DashboardView.MESSAGEGARAGE) {
      return hasRole('garage');
    }

    // Other views are visible to all roles by default
    return true;
  };

  const menuItems = [
    {
      title: DashboardView.USERS,
      text: t('dashboard.navigation.users'),
      icon: <GroupIcon />,
      view: DashboardView.USERS,
    },
    {
      title: DashboardView.MESSAGEADMIN,
      text: t('dashboard.navigation.messages'),
      icon: <MessageIcon />,
      view: DashboardView.MESSAGEADMIN,
    },
    {
      title: DashboardView.MESSAGEGARAGE,
      text: t('dashboard.navigation.messages'),
      icon: <MessageIcon />,
      view: DashboardView.MESSAGEGARAGE,
    },
    {
      title: DashboardView.SUPPORT,
      text: t('dashboard.navigation.support'),
      icon: <HelpIcon />,
      view: DashboardView.SUPPORT,
    },
    {
      title: DashboardView.FAQADMIN,
      text: t('dashboard.navigation.faq'),
      icon: <LiveHelpIcon />,
      view: DashboardView.FAQADMIN,
    },
    {
      title: DashboardView.DATA,
      text: t('dashboard.navigation.data'),
      icon: <DataObjectIcon />,
      view: DashboardView.DATA,
    },
    {
      title: DashboardView.SETTINGS,
      text: t('dashboard.navigation.settings'),
      icon: <SettingsIcon />,
      view: DashboardView.SETTINGS,
    },
  ];

  const handleMenuItemClick = (view: DashboardView) => {
    onViewChange(view);

    // Update URL with current language
    const path =
      view === DashboardView.USERS
        ? `/dashboard/${i18n.language}`
        : `/dashboard/${i18n.language}/${view.toLowerCase()}`;

    navigate(path, { replace: true });
  };

  const handleLanguageSwitch = () => {
    switchLanguage(navigate, location.pathname);
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box
      sx={{
        width: 250,
        height: '100vh',
        bgcolor: 'white',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'center',
        }}>
        <Box
          component='img'
          src={Logo}
          alt='Remorqueur Logo'
          sx={{ width: '80%', height: '100%' }}
        />
      </Box>

      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems
          .filter((item) => canSeeMenuItem(item.title))
          .map((item) => (
            <ListItemButton
              key={item.text}
              selected={currentView === item.view}
              onClick={() => handleMenuItemClick(item.view)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  background: 'linear-gradient(to right, #12BCC1, #48BA65)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #12BCC1, #48BA65)',
                    opacity: 0.9,
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#ffffff',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#ffffff',
                    fontWeight: 500,
                  },
                },
              }}>
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: '#666',
                }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    color: '#666',
                  },
                }}
              />
            </ListItemButton>
          ))}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: '#666',
          }}>
          <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText
            primary='Déconnexion'
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.875rem',
              },
            }}
          />
        </ListItemButton>
      </List>

      <Button
        onClick={handleLanguageSwitch}
        sx={{
          backgroundColor: '#14BCBC',
          border: 'none',
          color: '#FFF',
          '&:hover': {
            backgroundColor: '#48BA65',
          },
          margin: '0 auto 40px',
        }}>
        {i18n.language === 'fr' ? 'EN' : 'FR'}
      </Button>
    </Box>
  );
};

export default Sidebar;
