import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Snackbar,
  Typography,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import dataController from '../controllers/dataController';
import {
  VehicleResponse,
  DataProps,
  VehicleCreate,
  FileUploadResponse,
} from '../interface/interface';
import { useTranslation } from 'react-i18next';
// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function Data({ vehicleId }: DataProps) {
  const baseURL = 'http://127.0.0.1:8000';
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponse | null>(
    null
  );
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleResponse[]>(
    []
  );
  const [selectedFiles, setSelectedFiles] = useState<{
    neutralPdf?: File;
    deactivationPdf?: File;
    image?: File;
  }>({});

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredVehicles(vehicles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vehicles.filter((vehicle) => {
      const brand = vehicle.brand.toLowerCase();
      const model = vehicle.model.toLowerCase();
      const years = `${vehicle.year_from}${
        vehicle.year_to ? `-${vehicle.year_to}` : ''
      }`;

      return (
        brand.includes(query) || model.includes(query) || years.includes(query)
      );
    });

    setFilteredVehicles(filtered);
  }, [searchQuery, vehicles]);

  const fetchAllVehicles = async () => {
    try {
      const allVehicles = await dataController.getVehicles();
      setVehicles(allVehicles);
    } catch (err) {
      setError((err as Error).message);
      showSnackbar('Error loading vehicles');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Get form data from the form element
      const formElement = event.target as HTMLFormElement;
      const formData = new FormData(formElement);

      // Create the vehicle data object from form values
      const vehicleData: VehicleCreate = {
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        year_from: parseInt(formData.get('year_from') as string),
        year_to: formData.get('year_to')
          ? parseInt(formData.get('year_to') as string)
          : undefined,
        neutral_proc: (formData.get('neutral_proc') as string) || undefined,
        deactivation_proc:
          (formData.get('deactivation_proc') as string) || undefined,
        delay_time_neutral: formData.get('delay_time_neutral')
          ? parseInt(formData.get('delay_time_neutral') as string)
          : undefined,
        delay_time_deactivation: formData.get('delay_time_deactivation')
          ? parseInt(formData.get('delay_time_deactivation') as string)
          : undefined,
      };

      // First create the vehicle
      const newVehicle = await dataController.createVehicle(vehicleData);

      // Upload neutral procedure PDF if selected
      if (selectedFiles.neutralPdf) {
        await dataController.uploadNeutralPDF(
          newVehicle.id,
          selectedFiles.neutralPdf
        );
      }

      // Upload deactivation procedure PDF if selected
      if (selectedFiles.deactivationPdf) {
        await dataController.uploadDeactivationPDF(
          newVehicle.id,
          selectedFiles.deactivationPdf
        );
      }

      // Upload image if selected
      if (selectedFiles.image) {
        await dataController.uploadImage(newVehicle.id, selectedFiles.image);
      }

      // Refresh the vehicles list to show the new data
      await fetchAllVehicles();

      // Reset form state and close dialog
      setSelectedFiles({});
      setOpenDialog(false);
      showSnackbar('Vehicle and files created successfully');
    } catch (err) {
      setError((err as Error).message);
      showSnackbar(`Error creating vehicle: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    vehicleId: number,
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'neutralPdf' | 'deactivationPdf' | 'image'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(true);
    try {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (!vehicle) throw new Error('Vehicle not found');

      let response: FileUploadResponse;

      switch (type) {
        case 'neutralPdf':
          if (!file.type.includes('pdf')) {
            throw new Error('Please upload a PDF file');
          }
          // Check if vehicle already has a neutral PDF
          if (vehicle.neutral_pdfs && vehicle.neutral_pdfs.length > 0) {
            response = await dataController.updateNeutralPDF(vehicleId, file);
          } else {
            response = await dataController.uploadNeutralPDF(vehicleId, file);
          }
          break;

        case 'deactivationPdf':
          if (!file.type.includes('pdf')) {
            throw new Error('Please upload a PDF file');
          }
          // Check if vehicle already has a deactivation PDF
          if (
            vehicle.deactivation_pdfs &&
            vehicle.deactivation_pdfs.length > 0
          ) {
            response = await dataController.updateDeactivationPDF(
              vehicleId,
              file
            );
          } else {
            response = await dataController.uploadDeactivationPDF(
              vehicleId,
              file
            );
          }
          break;

        case 'image':
          if (!file.type.includes('image')) {
            throw new Error('Please upload an image file');
          }
          // Check if vehicle already has an image
          if (vehicle.images && vehicle.images.length > 0) {
            response = await dataController.updateImage(vehicleId, file);
          } else {
            response = await dataController.uploadImage(vehicleId, file);
          }
          break;
      }

      showSnackbar(
        `${type} ${
          vehicle.images && vehicle.images.length > 0 ? 'updated' : 'uploaded'
        } successfully`
      );
      await fetchAllVehicles();
    } catch (err) {
      setError((err as Error).message);
      showSnackbar(`Error handling ${type}: ${(err as Error).message}`);
    } finally {
      setUploadProgress(false);
      event.target.value = '';
    }
  };

  // File deletion handlers
  const handleDelete = async (
    vehicleId: number,
    type: 'neutralPdf' | 'deactivationPdf' | 'image',
    fileId: number
  ) => {
    try {
      switch (type) {
        case 'neutralPdf':
          await dataController.deleteNeutralPDF(vehicleId, fileId);
          break;
        case 'deactivationPdf':
          await dataController.deleteDeactivationPDF(vehicleId, fileId);
          break;
        case 'image':
          await dataController.deleteImage(vehicleId, fileId);
          break;
      }

      showSnackbar(`${type} deleted successfully`);
      // Refresh all vehicles data
      await fetchAllVehicles();
    } catch (err) {
      setError((err as Error).message);
      showSnackbar(`Error deleting ${type}: ${(err as Error).message}`);
    }
  };
  // Utility function to show snackbar messages
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const VehicleFormDialog = () => (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              required
              label={t('data.form.brand.label')}
              name='brand'
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              label={t('data.form.model.label')}
              name='model'
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              type='number'
              label={t('data.form.yearFrom.label')}
              name='year_from'
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type='number'
              label={t('data.form.yearTo.label')}
              name='year_to'
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type='number'
              label={t('data.form.delayTimeNeutral.label')}
              name='delay_time_neutral'
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type='number'
              label={t('data.form.delayTimeDeactivation.label')}
              name='delay_time_deactivation'
              sx={{ mb: 2 }}
            />

            {/* File inputs */}
            {/* Updated file inputs */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  {t('data.form.files.title')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <input
                  accept='.pdf'
                  style={{ display: 'none' }}
                  id='neutral-pdf-upload'
                  type='file'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFiles((prev) => ({
                        ...prev,
                        neutralPdf: file,
                      }));
                    }
                  }}
                />
                <label htmlFor='neutral-pdf-upload'>
                  <Button
                    variant='outlined'
                    component='span'
                    fullWidth
                    startIcon={<PdfIcon />}>
                    {selectedFiles.neutralPdf?.name ||
                      t('data.form.files.selectNeutral')}
                  </Button>
                </label>
              </Grid>
              <Grid item xs={6}>
                <input
                  accept='.pdf'
                  style={{ display: 'none' }}
                  id='deactivation-pdf-upload'
                  type='file'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFiles((prev) => ({
                        ...prev,
                        deactivationPdf: file,
                      }));
                    }
                  }}
                />
                <label htmlFor='deactivation-pdf-upload'>
                  <Button
                    variant='outlined'
                    component='span'
                    fullWidth
                    startIcon={<PdfIcon />}>
                    {selectedFiles.deactivationPdf?.name ||
                      t('data.form.files.selectDeactivation')}
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom sx={{ mt: 2 }}>
                  Images
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <input
                  accept='image/*'
                  style={{ display: 'none' }}
                  id='image-upload'
                  type='file'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFiles((prev) => ({ ...prev, image: file }));
                    }
                  }}
                />
                <label htmlFor='image-upload'>
                  <Button
                    variant='outlined'
                    component='span'
                    fullWidth
                    startIcon={<ImageIcon />}>
                    {selectedFiles.image?.name ||
                      t('data.form.files.selectImage')}
                  </Button>
                </label>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('data.form.buttons.cancel')}
          </Button>
          <Button type='submit' variant='contained' disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              t('data.form.buttons.create')
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  // Add these handlers to your Data component
  const handleEditClick = (vehicle: VehicleResponse) => {
    setEditingVehicle(vehicle);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingVehicle) return;

    setLoading(true);
    try {
      const formElement = event.target as HTMLFormElement;
      const formData = new FormData(formElement);

      const vehicleData: VehicleCreate = {
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        year_from: parseInt(formData.get('year_from') as string),
        year_to: formData.get('year_to')
          ? parseInt(formData.get('year_to') as string)
          : undefined,
        delay_time_neutral: formData.get('delay_time_neutral')
          ? parseInt(formData.get('delay_time_neutral') as string)
          : undefined,
        delay_time_deactivation: formData.get('delay_time_deactivation')
          ? parseInt(formData.get('delay_time_deactivation') as string)
          : undefined,
      };

      await dataController.updateVehicle(editingVehicle.id, vehicleData);

      // Refresh the vehicles list
      await fetchAllVehicles();
      setEditDialogOpen(false);
      showSnackbar(t('data.messages.success.update'));
    } catch (err) {
      setError((err as Error).message);
      showSnackbar(
        `${t('data.messages.error.update')}: ${(err as Error).message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const VehicleEditDialog = () => (
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
      {editingVehicle && (
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                required
                label={t('data.form.brand.label')}
                name='brand'
                defaultValue={editingVehicle.brand}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                required
                label={t('data.form.model.label')}
                name='model'
                defaultValue={editingVehicle.model}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                required
                type='number'
                label={t('data.form.yearFrom.label')}
                name='year_from'
                defaultValue={editingVehicle.year_from}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type='number'
                label={t('data.form.yearTo.label')}
                name='year_to'
                defaultValue={editingVehicle.year_to}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type='number'
                label={t('data.form.delayTimeNeutral.label')}
                name='delay_time_neutral'
                defaultValue={editingVehicle.delay_time_neutral}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type='number'
                label={t('data.form.delayTimeDeactivation.label')}
                name='delay_time_deactivation'
                defaultValue={editingVehicle.delay_time_deactivation}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type='submit' variant='contained' disabled={loading}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                t('data.form.buttons.update')
              )}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );

  const renderVehicleCard = (vehicle: VehicleResponse) => (
    <Card key={vehicle.id} sx={{ mb: 4 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}>
          <Typography variant='h6'>
            {`${vehicle.brand} ${vehicle.model} (${vehicle.year_from}${
              vehicle.year_to ? `-${vehicle.year_to}` : ''
            })`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              color='primary'
              onClick={() => handleEditClick(vehicle)}
              sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <Button
              component='label'
              variant='outlined'
              startIcon={<PdfIcon />}
              sx={{ mr: 1 }}>
              {t('data.fileManagement.neutralProcedure')}
              <input
                type='file'
                hidden
                accept='.pdf'
                onChange={(e) => handleFileUpload(vehicle.id, e, 'neutralPdf')}
              />
            </Button>
            <Button
              component='label'
              variant='outlined'
              startIcon={<PdfIcon />}
              sx={{ mr: 1 }}>
              {t('data.fileManagement.deactivationProcedure')}
              <input
                type='file'
                hidden
                accept='.pdf'
                onChange={(e) =>
                  handleFileUpload(vehicle.id, e, 'deactivationPdf')
                }
              />
            </Button>
            <Button
              component='label'
              variant='outlined'
              startIcon={<ImageIcon />}>
              {t('data.fileManagement.image')}
              <input
                type='file'
                hidden
                accept='image/*'
                onChange={(e) => handleFileUpload(vehicle.id, e, 'image')}
              />
            </Button>
          </Box>
        </Box>

        {/* Vehicle Details */}
        <Grid container spacing={2}>
          {/* Basic vehicle details remain the same */}
          <Grid item xs={12} md={2}>
            <Typography variant='subtitle2' color='textSecondary'>
              {t('data.vehicleDetails.brand')}
            </Typography>
            <Typography>{vehicle.brand}</Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant='subtitle2' color='textSecondary'>
              {t('data.vehicleDetails.model')}
            </Typography>
            <Typography>{vehicle.model}</Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant='subtitle2' color='textSecondary'>
              {t('data.vehicleDetails.delayNeutral')}
            </Typography>
            <Typography>
              {vehicle.delay_time_neutral}
              {t('data.vehicleDetails.minutes')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant='subtitle2' color='textSecondary'>
              {t('data.vehicleDetails.delayDeactivation')}
            </Typography>
            <Typography>
              {vehicle.delay_time_deactivation}
              {t('data.vehicleDetails.minutes')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant='subtitle2' color='textSecondary'>
              {t('data.vehicleDetails.yearFrom')}
            </Typography>
            <Typography>{vehicle.year_from}</Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant='subtitle2' color='textSecondary'>
              {t('data.vehicleDetails.yearTo')}
            </Typography>
            <Typography>{vehicle.year_to || '-'}</Typography>
          </Grid>
        </Grid>

        {/* Files List */}
        <Box sx={{ mt: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            {t('data.fileManagement.uploadedFiles')}
          </Typography>

          {/* Neutral PDFs */}
          {vehicle.neutral_pdfs && vehicle.neutral_pdfs.length > 0 && (
            <>
              <Typography
                variant='subtitle2'
                color='textSecondary'
                sx={{ mt: 2, mb: 1 }}>
                {t('data.fileManagement.neutralProcedure')}
              </Typography>
              <List>
                {vehicle.neutral_pdfs.map((pdf) => (
                  <ListItem
                    key={pdf.id}
                    sx={{
                      border: '1px solid #eee',
                      borderRadius: 1,
                      mb: 1,
                    }}>
                    <PdfIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary={pdf.file_name}
                      secondary={`Size: ${formatFileSize(pdf.file_size)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge='end'
                        aria-label='delete'
                        onClick={() =>
                          handleDelete(vehicle.id, 'neutralPdf', pdf.id)
                        }
                        disabled={uploadProgress}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Deactivation PDFs */}
          {vehicle.deactivation_pdfs &&
            vehicle.deactivation_pdfs.length > 0 && (
              <>
                <Typography
                  variant='subtitle2'
                  color='textSecondary'
                  sx={{ mt: 2, mb: 1 }}>
                  {t('data.fileManagement.deactivationProcedure')}
                </Typography>
                <List>
                  {vehicle.deactivation_pdfs.map((pdf) => (
                    <ListItem
                      key={pdf.id}
                      sx={{
                        border: '1px solid #eee',
                        borderRadius: 1,
                        mb: 1,
                      }}>
                      <PdfIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={pdf.file_name}
                        secondary={`Size: ${formatFileSize(pdf.file_size)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge='end'
                          aria-label='delete'
                          onClick={() =>
                            handleDelete(vehicle.id, 'deactivationPdf', pdf.id)
                          }
                          disabled={uploadProgress}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

          {/* Images */}
          {vehicle.images && vehicle.images.length > 0 && (
            <>
              <Typography
                variant='subtitle2'
                color='textSecondary'
                sx={{ mt: 2, mb: 1 }}>
                {t('data.fileManagement.image')}
              </Typography>
              <List>
                {vehicle.images.map((image) => (
                  <ListItem
                    key={image.id}
                    sx={{
                      border: '1px solid #eee',
                      borderRadius: 1,
                      mb: 1,
                    }}>
                    <ListItem>
                      <img
                        src={`${baseURL}/ftp/images/${image.file_path}`}
                        alt={image.file_name}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'contain',
                          marginRight: 16,
                          borderRadius: 8,
                        }}
                      />
                      <ListItemText
                        primary={image.file_name}
                        secondary={`Size: ${formatFileSize(image.file_size)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge='end'
                          aria-label='delete'
                          onClick={() =>
                            handleDelete(vehicle.id, 'image', image.id)
                          }
                          disabled={uploadProgress}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge='end'
                        aria-label='delete'
                        onClick={() =>
                          handleDelete(vehicle.id, 'image', image.id)
                        }
                        disabled={uploadProgress}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    const container = document.getElementById('scrollable-box');
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [vehicles]);

  return (
    <Container maxWidth='lg'>
      <Box
        id='scrollable-box'
        sx={{
          mt: 4,
          mb: 4,
          maxHeight: '85vh',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography
              sx={{ color: '#202224', fontWeight: 'bold' }}
              variant='h4'>
              {t('data.title')}
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', width: '300px' }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size='small'
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  paddingRight: '40px',
                },
              }}
            />
            <SearchIcon
              sx={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'grey.500',
              }}
            />
          </Box>
          <Button
            sx={{ color: '#fff', marginLeft: '20px' }}
            variant='contained'
            onClick={() => setOpenDialog(true)}
            startIcon={<AddIcon />}>
            {t('data.createVehicle')}
          </Button>
        </Box>

        {filteredVehicles.length === 0 ? (
          <Alert severity='info'>
            {searchQuery
              ? 'No vehicles found matching your search.'
              : 'No vehicles found. Create a vehicle to manage its files.'}
          </Alert>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Accordion key={vehicle.id} sx={{ mb: 1 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`vehicle-${vehicle.id}-content`}
                id={`vehicle-${vehicle.id}-header`}>
                <Typography>
                  {`${vehicle.brand} ${vehicle.model} (${vehicle.year_from}${
                    vehicle.year_to ? `-${vehicle.year_to}` : ''
                  })`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>{renderVehicleCard(vehicle)}</AccordionDetails>
            </Accordion>
          ))
        )}

        <VehicleEditDialog />
        <VehicleFormDialog />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
}

export default Data;
