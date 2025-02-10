import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Stack,
  TextField,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  EditOutlined,
  DeleteOutline,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import {
  dashboardUserController,
  Remorqueur,
} from '../controllers/dashboardUserController';
import { useAuth } from '../hooks/authContext';
import { Navigate, useLocation } from 'react-router-dom';
import {
  CreateGarageFormData,
  CreateRemorqueurRequest,
  DashboardView,
  GarageWithRemorqueurs,
  TableFilters,
  UpdateRemorqueurRequest,
} from '../interface/interface';
import { useTranslation } from 'react-i18next';
import { EditModal } from '../components/editModal';
import { DeleteModal } from '../components/deleteModal';
import { CreateModal } from '../components/createModal';
import CreateGarageModal from '../components/createGarageModal';
import Sidebar from '../components/sidebar';
import Settings from '../components/settings';
import Data from '../components/data';
import FaqAdmin from '../components/faqAdmin';
import FaqModal from '../components/faqModal';
import MessageAdmin from '../components/messageAdmin';
import MessageGarage from '../components/messageGarage';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated, user, role } = useAuth();
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [expandedGarage, setExpandedGarage] = useState<number | null>(null);
  const [garages, setGarages] = useState<GarageWithRemorqueurs[]>([]);
  const [remorqueurs, setRemorqueurs] = useState<Remorqueur[]>([]);
  const [currentView, setCurrentView] = useState<DashboardView>(
    DashboardView.USERS
  );
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    status: 'all',
    sortBy: 'name',
  });

  const [error, setError] = useState<string | null>(null);

  const hasAdminAccess = useCallback(() => {
    return role?.name === 'superadmin' || role?.name === 'apdq';
  }, [role?.name]);

  const handleGarageClick = (garageId: number) => {
    setExpandedGarage(expandedGarage === garageId ? null : garageId);
  };
  //   create Garage for admin Modal
  const [createGarageModalOpen, setCreateGarageModalOpen] = useState(false);
  const [createGarageError, setCreateGarageError] = useState<string | null>(
    null
  );
  const [createGarageSuccess, setCreateGarageSuccess] = useState(false);
  const [garageCount, setGarageCount] = useState<number>(0);

  //   create USER Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  //   Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRemorqueur, setEditingRemorqueur] =
    useState<UpdateRemorqueurRequest>({
      name: '',
      tel: '',
      username: '',
      password: '',
      is_active: false,
    });
  const [currentRemorqueurId, setCurrentRemorqueurId] = useState<number | null>(
    null
  );
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  //   Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRemorqueur, setDeletingRemorqueur] =
    useState<Remorqueur | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // This effect handles view changes based on the path
  useEffect(() => {
    const path = location.pathname.split('/').pop() || '';
    switch (path.toLowerCase()) {
      case 'settings':
        setCurrentView(DashboardView.SETTINGS);
        break;
      case 'messageadmin':
        setCurrentView(DashboardView.MESSAGEADMIN);
        break;
      case 'messagegarage':
        setCurrentView(DashboardView.MESSAGEGARAGE);
        break;
      case 'data':
        setCurrentView(DashboardView.DATA);
        break;
      case 'faqadmin':
        setCurrentView(DashboardView.FAQADMIN);
        break;
      case 'support':
        setCurrentView(DashboardView.SUPPORT);
        break;
      default:
        setCurrentView(DashboardView.USERS);
    }
  }, [location]);

  useEffect(() => {
    console.log('Current view changed to:', currentView);
  }, [currentView]);

  // Function to render the current view
  const renderView = () => {
    console.log('Rendering view for:', currentView);

    switch (currentView) {
      case DashboardView.SETTINGS:
        return <Settings />;
      case DashboardView.USERS:
        return renderDashboardContent();
      case DashboardView.MESSAGEADMIN:
        return <MessageAdmin />;
      case DashboardView.MESSAGEGARAGE:
        return <MessageGarage />;
      case DashboardView.DATA:
        return <Data />;
      case DashboardView.FAQADMIN:
        return <FaqAdmin />;
      case DashboardView.SUPPORT:
        return (
          <FaqModal
            open={isFaqModalOpen}
            onClose={() => setIsFaqModalOpen(false)}
          />
        );
      default:
        console.log('Falling back to default view');
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity='error'>{error}</Alert>
        </Box>
      );
    }

    return hasAdminAccess() ? renderAdminDashboard() : renderGarageDashboard();
  };

  const fetchGarageCount = async () => {
    if (!token) return;

    try {
      const response = await dashboardUserController.getGarageCount(token);
      if (response.success) {
        setGarageCount(response.data.total_garages);
      }
    } catch (error) {
      console.error('Failed to fetch garage count:', error);
    }
  };

  const handleCreateGarage = async (createData: CreateGarageFormData) => {
    if (!token || !user?.id) {
      setCreateGarageError(
        'Authentication token or user information is missing'
      );
      return;
    }

    try {
      const response = await dashboardUserController.createGarage(token, {
        ...createData,
        role_name: 'garage',
      });

      if (response.success) {
        // Transform the GarageResponse into a GarageWithRemorqueurs
        const newGarage: GarageWithRemorqueurs = {
          id: response.data.id,
          name: response.data.name,
          username: response.data.username,
          role_id: response.data.role.id,
          created_by_id: user.id,
          is_active: response.data.is_active,
          remorqueurs: [], // New garage starts with no remorqueurs
          role: response.data.role,
        };

        setGarages((prev) => [...prev, newGarage]);
        await fetchGarageCount();
        setCreateGarageSuccess(true);

        setTimeout(() => {
          setCreateGarageModalOpen(false);
          setCreateGarageSuccess(false);
        }, 1500);
      } else {
        setCreateGarageError(response.message);
      }
    } catch (error) {
      console.error('Error creating garage:', error);
      setCreateGarageError('Failed to create garage');
    }
  };
  // ======================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch garage count first
        await fetchGarageCount();

        // Then fetch appropriate data based on role
        if (hasAdminAccess()) {
          const response =
            await dashboardUserController.getAllGaragesWithRemorqueurs(token);
          if (response.success) {
            setGarages(response.data);
          } else {
            setError(response.message);
          }
        } else {
          const response = await dashboardUserController.getGarageRemorqueurs(
            token
          );
          if (response.success) {
            setRemorqueurs(response.data);
          } else {
            setError(response.message);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, role?.name]);

  if (!isAuthenticated || !token) {
    return <Navigate to='/login' replace />;
  }

  const handleStatusChange = (newStatus: 'all' | 'active' | 'inactive') => {
    setFilters({ ...filters, status: newStatus });
  };

  const getVehicleCount = (count: number) => {
    if (count === 0) {
      return `${t('dashboard.garages.vehicle.noVehicles')}`;
    }

    const vehicleText =
      count === 1
        ? t('dashboard.garages.vehicle.singular')
        : t('dashboard.garages.vehicle.plural');

    return `${count} ${vehicleText}`;
  };

  //====== Admin dashboard user view =================
  const renderAdminDashboard = () => {
    return (
      <Box
        sx={{
          // Fixed container that won't scroll
          backgroundColor: '#fff',
          width: '90%',
          margin: '0 auto',
          borderRadius: '14px',
          height: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
        <Box
          sx={{
            padding: '24px',
            backgroundColor: '#fff',
            zIndex: 1,
          }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
            <Box>
              <Typography
                sx={{ fontSize: '2rem', fontWeight: 'bold', color: '#202224' }}>
                {t('dashboard.garages.title')}
              </Typography>
              <Typography sx={{ color: '#666', mt: 1 }}>
                {t('dashboard.garages.count')}
                {garageCount}
              </Typography>
            </Box>
            <Box>
              <TextField
                placeholder={t('dashboard.garages.search')}
                size='small'
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                sx={{
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#666', mr: 1 }} />,
                }}
              />
              <IconButton
                onClick={() => setCreateGarageModalOpen(true)}
                sx={{
                  marginLeft: '20px',
                  bgcolor: '#14BCBC',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#48BA65',
                  },
                  '&:active': {
                    bgcolor: '#3da956',
                  },
                }}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '0.4em',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent',
            },
            scrollbarWidth: 'none',
            '-ms-overflow-style': 'none',
            padding: '24px',
            scrollBehavior: 'smooth',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 8%)',
          }}>
          {/* Garages List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {garages.map((garage) => (
              <Box
                key={garage.id}
                sx={{
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  },
                }}>
                {/* Garage Header */}
                <Box
                  onClick={() => handleGarageClick(garage.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                    backgroundColor: '#f8f9fc',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f1f4f9' },
                    transition: 'background-color 0.2s ease',
                  }}>
                  <Stack
                    direction='row'
                    spacing={2}
                    alignItems='center'
                    flex={1}>
                    <Avatar
                      sx={{
                        bgcolor: '#f0f0f0',
                        color: '#666',
                        width: 40,
                        height: 40,
                      }}>
                      {garage.name[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: '#202224',
                          fontSize: '1.1rem',
                        }}>
                        {garage.name}
                      </Typography>
                      <Typography sx={{ color: '#666', fontSize: '0.875rem' }}>
                        {getVehicleCount(garage.remorqueurs.length)}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Status Badge and Arrow */}
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        bgcolor: garage.is_active ? '#00b8a2' : '#ff3d57',
                        color: 'white',
                        mr: 2,
                      }}>
                      {garage.is_active
                        ? t('dashboard.garages.status.paid')
                        : t('dashboard.garages.status.unpaid')}
                    </Box>
                    <Box
                      sx={{
                        transition: 'transform 0.3s ease',
                        transform:
                          expandedGarage === garage.id
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                      }}>
                      <KeyboardArrowDownIcon />
                    </Box>
                  </Stack>
                </Box>

                {/* Collapsible Remorqueurs Table */}
                <Collapse in={expandedGarage === garage.id} timeout='auto'>
                  <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <TableContainer sx={{ bgcolor: 'white' }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: '#f1f4f9' }}>
                          <TableRow>
                            <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                              {t('dashboard.users.table.nameAndSurname')}
                            </TableCell>

                            <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                              {t('dashboard.users.table.status')}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {garage.remorqueurs.map((remorqueur) => (
                            <TableRow
                              key={remorqueur.id}
                              sx={{
                                '&:hover': { bgcolor: '#f5f5f5' },
                                animation: 'fadeIn 0.3s ease-in',
                              }}>
                              <TableCell>
                                <Stack
                                  direction='row'
                                  spacing={2}
                                  alignItems='center'>
                                  <Avatar
                                    sx={{
                                      bgcolor: '#f0f0f0',
                                      color: '#666',
                                      width: 32,
                                      height: 32,
                                      fontSize: '0.9rem',
                                    }}>
                                    {remorqueur.name[0].toUpperCase()}
                                  </Avatar>
                                  <Typography sx={{ color: '#333' }}>
                                    {remorqueur.name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    bgcolor: remorqueur.is_active
                                      ? '#00b8a2'
                                      : '#ff3d57',
                                    color: 'white',
                                  }}>
                                  {remorqueur.is_active
                                    ? t('dashboard.users.status.active')
                                    : t('dashboard.users.status.inactive')}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        </Box>
        <CreateGarageModal
          open={createGarageModalOpen}
          onClose={() => {
            setCreateGarageModalOpen(false);
            setCreateGarageError(null);
            setCreateGarageSuccess(false);
          }}
          onConfirm={handleCreateGarage}
          createError={createGarageError}
          createSuccess={createGarageSuccess}
        />
      </Box>
    );
  };
  //====== create pop up =================

  const handleCreateClick = () => {
    setCreateModalOpen(true);
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleCloseCreate = () => {
    setCreateModalOpen(false);
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleConfirmCreate = async (createData: CreateRemorqueurRequest) => {
    if (!token || !user?.garage_name) {
      setCreateError(t('dashboard.users.create.error.noAuth'));
      return;
    }

    try {
      console.log('Attempting to create remorqueur with data:', createData); // Add this

      const response = await dashboardUserController.createRemorqueur(
        token,
        createData
      );

      console.log('Create response:', response); // Add this

      if (response.success) {
        setCreateSuccess(true);
        setRemorqueurs((prev) =>
          [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name))
        );

        // Show success message for a moment before closing
        setTimeout(() => {
          handleCloseCreate();
        }, 1500);
      } else {
        setCreateError(
          response.message || t('dashboard.users.create.error.generic')
        );
      }
    } catch (error) {
      console.error('Error in handleConfirmCreate:', error); // Add this
      setCreateError(t('dashboard.users.create.error.generic'));
    }
  };

  //====== update pop up =================
  const handleEditClick = (remorqueur: Remorqueur) => {
    setCurrentRemorqueurId(remorqueur.id);
    setEditingRemorqueur({
      name: remorqueur.name,
      tel: remorqueur.tel,
      username: remorqueur.username,
      is_active: remorqueur.is_active,
      password: '',
    });
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    setEditingRemorqueur({
      name: '',
      tel: '',
      username: '',
      password: '',
      is_active: false,
    });
    setCurrentRemorqueurId(null);
  };

  const handleUpdateRemorqueur = async () => {
    if (!currentRemorqueurId || !token) return;

    try {
      const response = await dashboardUserController.updateRemorqueur(
        token,
        currentRemorqueurId,
        editingRemorqueur
      );

      if (response.success) {
        setUpdateSuccess(true);
        setRemorqueurs(
          remorqueurs.map((r) =>
            r.id === currentRemorqueurId ? response.data : r
          )
        );
        setTimeout(() => {
          handleCloseEdit();
        }, 1500);
      } else {
        setUpdateError(response.message);
      }
    } catch (error) {
      console.log(error);
      setUpdateError(t('dashboard.users.edit.error'));
    }
  };

  //====== Delete MODAL =================
  const handleDeleteClick = (remorqueur: Remorqueur) => {
    setDeletingRemorqueur(remorqueur);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
    setDeletingRemorqueur(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRemorqueur || !token) return;

    try {
      const response = await dashboardUserController.deleteRemorqueur(
        token,
        deletingRemorqueur.id
      );

      if (response.success) {
        setRemorqueurs(
          remorqueurs.filter((r) => r.id !== deletingRemorqueur.id)
        );
        handleCloseDelete();
      } else {
        setDeleteError(response.message);
      }
    } catch (error) {
      console.log(error);
      setDeleteError(t('dashboard.users.delete.error'));
    }
  };

  const filteredRemorqueurs = remorqueurs
    .filter((remorqueur) => {
      const matchesSearch =
        remorqueur.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        remorqueur.username
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchesStatus =
        filters.status === 'all'
          ? true
          : filters.status === 'active'
          ? remorqueur.is_active
          : !remorqueur.is_active;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // garage dashboard view
  const renderGarageDashboard = () => {
    return (
      <Box
        sx={{
          // Main container with fixed dimensions
          backgroundColor: '#fff',
          width: '90%',
          margin: '0 auto',
          borderRadius: '14px',
          height: 'calc(100vh - 48px)', // Accounts for parent padding
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden', // Prevents outer scrolling
        }}>
        {/* Fixed Header Section */}
        <Box
          sx={{
            padding: '24px 24px 0 24px',
            backgroundColor: '#fff',
            borderTopLeftRadius: '14px',
            borderTopRightRadius: '14px',
            zIndex: 2,
          }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
            {/* Title stays the same */}
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#202224',
                flexShrink: 0,
              }}>
              {t('dashboard.users.title')}
            </Typography>

            {/* Controls Group - Search, Status Filter, Add Button */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
              {/* Search Field */}
              <TextField
                placeholder={t('dashboard.users.search')}
                size='small'
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                sx={{
                  width: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: 'white',
                  },
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#666', mr: 1 }} />,
                }}
              />

              {/* Status Filter */}
              <Select
                value={filters.status}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as 'all' | 'active' | 'inactive'
                  )
                }
                size='small'
                displayEmpty
                sx={{
                  width: 120,
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}>
                <MenuItem value='all'>
                  {t('dashboard.users.status.all')}
                </MenuItem>
                <MenuItem value='active'>
                  {t('dashboard.users.status.active')}
                </MenuItem>
                <MenuItem value='inactive'>
                  {t('dashboard.users.status.inactive')}
                </MenuItem>
              </Select>

              {/* Add Button */}
              <IconButton
                onClick={handleCreateClick}
                sx={{
                  bgcolor: '#14BCBC',
                  color: 'white',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: '#48BA65',
                  },
                  '&:active': {
                    bgcolor: '#3da956',
                  },
                }}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Scrollable Content Section */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            // Hide scrollbar while maintaining functionality
            '&::-webkit-scrollbar': {
              width: '0.4em',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent',
            },
            scrollbarWidth: 'none',
            '-ms-overflow-style': 'none',
            scrollBehavior: 'smooth',
            // Add subtle fade effect at the top when scrolling
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 8%)',
          }}>
          {/* Table Container */}
          <TableContainer>
            <Table>
              {/* Table Header */}
              <TableHead sx={{ backgroundColor: '#f1f4f9' }}>
                <TableRow>
                  <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                    {t('dashboard.users.table.nameAndSurname')}
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                    {t('dashboard.users.table.username')}
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                    {t('dashboard.users.table.phoneNumber')}
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                    {t('dashboard.users.table.status')}
                  </TableCell>
                  <TableCell sx={{ color: '#666', fontWeight: 500 }}>
                    {t('dashboard.users.table.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {filteredRemorqueurs.map((remorqueur) => (
                  <TableRow
                    key={remorqueur.id}
                    sx={{
                      '&:hover': { bgcolor: '#f5f5f5' },
                      transition: 'background-color 0.2s ease',
                    }}>
                    {/* Name Cell */}
                    <TableCell>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Avatar
                          sx={{
                            bgcolor: '#f0f0f0',
                            color: '#666',
                            width: 32,
                            height: 32,
                            fontSize: '0.9rem',
                          }}>
                          {remorqueur.name[0].toUpperCase()}
                        </Avatar>
                        <Typography sx={{ color: '#333' }}>
                          {remorqueur.name}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Phone Number Cell */}
                    <TableCell sx={{ color: '#666' }}>
                      {remorqueur.username}
                    </TableCell>
                    {/* Phone Number Cell */}
                    <TableCell sx={{ color: '#666' }}>
                      {remorqueur.tel}
                    </TableCell>

                    {/* Status Cell */}
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          bgcolor: remorqueur.is_active ? '#00b8a2' : '#ff3d57',
                          color: 'white',
                          transition: 'background-color 0.2s ease',
                        }}>
                        {remorqueur.is_active
                          ? t('dashboard.users.status.active')
                          : t('dashboard.users.status.inactive')}
                      </Box>
                    </TableCell>

                    {/* Actions Cell */}
                    <TableCell>
                      <Stack direction='row' spacing={1}>
                        <IconButton
                          size='small'
                          sx={{
                            color: '#2196f3',
                            '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' },
                          }}
                          onClick={() => handleEditClick(remorqueur)}>
                          <EditOutlined sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton
                          size='small'
                          sx={{
                            color: '#f44336',
                            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                          }}
                          onClick={() => handleDeleteClick(remorqueur)}>
                          <DeleteOutline sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    );
  };

  //=================== Main return =================
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar onViewChange={setCurrentView} currentView={currentView} />
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: '#F5F6FA',
          p: 3,
        }}>
        {renderView()}
        {!hasAdminAccess() && (
          <>
            <CreateModal
              open={createModalOpen}
              onClose={handleCloseCreate}
              onConfirm={handleConfirmCreate}
              createError={createError}
              createSuccess={createSuccess}
              setCreateError={setCreateError}
            />
            <EditModal
              open={editModalOpen}
              onClose={handleCloseEdit}
              onUpdate={handleUpdateRemorqueur}
              editingRemorqueur={editingRemorqueur}
              setEditingRemorqueur={setEditingRemorqueur}
              updateSuccess={updateSuccess}
              updateError={updateError}
            />
            <DeleteModal
              open={deleteModalOpen}
              onClose={handleCloseDelete}
              onConfirm={handleConfirmDelete}
              remorqueurName={deletingRemorqueur?.name || ''}
              deleteError={deleteError}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
