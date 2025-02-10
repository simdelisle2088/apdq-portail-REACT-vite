import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/authContext';
import messageController from '../controllers/messagesController';
import { dashboardUserController } from '../controllers/dashboardUserController';
import { format } from 'date-fns';
import { t } from 'i18next';

interface Garage {
  id: number;
  name: string;
}

interface Message {
  id: number;
  title: string;
  content: string;
  created_at: string;
  to_all: boolean;
  garage_ids: number[];
}

const MessageAdmin: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [garages, setGarages] = useState<Garage[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    to_all: false,
    garage_ids: [] as number[],
    admin_id: user?.id || 0,
  });

  // Fetch messages and garages on component mount
  useEffect(() => {
    fetchAllAdminMessages();
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await dashboardUserController.getAllGaragesWithRemorqueurs(
      token
    );
    if (response.success && response.data) {
      // Filter only active garages
      const activeGarages = response.data
        .filter((garage) => garage.is_active)
        .map((garage) => ({
          id: garage.id,
          name: garage.name,
        }));
      setGarages(activeGarages);
    }
  };

  // In admin component:
  const fetchAllAdminMessages = async () => {
    const response = await messageController.getAllAdminMessages();
    setMessages(response);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allMessageIds = filteredMessages.map((message) => message.id);
      setSelectedMessages(allMessageIds);
    } else {
      setSelectedMessages([]);
    }
  };

  // Add handleSelectMessage function
  const handleSelectMessage = (messageId: number) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Add handleDeleteSelected function
  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) return;

    const response = await messageController.deleteMultipleAdminMessages(
      selectedMessages
    );
    if (response) {
      setMessages(messages.filter((msg) => !selectedMessages.includes(msg.id)));
      setSelectedMessages([]);
    }
  };

  const handleCreateMessage = async () => {
    const messageToSend = {
      ...newMessage,
      garage_ids: newMessage.to_all ? [] : newMessage.garage_ids,
    };

    const response = await messageController.createAdminMessage(messageToSend);
    if (response) {
      setMessages([...messages, response]);
      setOpenDialog(false);
      resetNewMessage();
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    const response = await messageController.deleteAdminMessage(messageId);
    if (response) {
      setMessages(messages.filter((msg) => msg.id !== messageId));
    }
  };

  const resetNewMessage = () => {
    setNewMessage({
      title: '',
      content: '',
      to_all: false,
      garage_ids: [],
      admin_id: user?.id || 0,
    });
  };

  const getRecipientDisplay = (message: Message) => {
    if (message.to_all) {
      return (
        <Chip
          label={t('data.messages.dashboard_message_admin.all')}
          color='primary'
        />
      );
    }

    const recipientGarages = message.garage_ids
      .map((id) => garages.find((g) => g.id === id)?.name)
      .filter(Boolean);

    return recipientGarages.map((name, index) => (
      <Chip key={index} label={name} sx={{ mr: 1, mb: 1 }} />
    ));
  };

  const filteredMessages = messages.filter((message) => {
    // Get recipient names for this message
    const recipientNames = message.garage_ids
      .map((id) => garages.find((g) => g.id === id)?.name || '')
      .join(' ')
      .toLowerCase();

    // Search term
    const search = searchTerm.toLowerCase();

    // Search in title, content, and recipient names
    return (
      message.title.toLowerCase().includes(search) ||
      message.content.toLowerCase().includes(search) ||
      recipientNames.includes(search)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: '#48BA65',
            '&:hover': { backgroundColor: '#3a9651' },
          }}>
          {t('data.messages.dashboard_message_admin.new')}
        </Button>
        <TextField
          placeholder={t('data.messages.dashboard_message_admin.search')}
          variant='outlined'
          size='small'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
        {selectedMessages.length > 0 && (
          <Button
            variant='contained'
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#b71c1c' },
            }}>
            {t('data.messages.dashboard_message_admin.delete')} (
            {selectedMessages.length})
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding='checkbox'>
                <Checkbox
                  checked={
                    selectedMessages.length === filteredMessages.length &&
                    filteredMessages.length > 0
                  }
                  indeterminate={
                    selectedMessages.length > 0 &&
                    selectedMessages.length < filteredMessages.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>
                {t('data.messages.dashboard_message_admin.name')}
              </TableCell>
              <TableCell>
                {t('data.messages.dashboard_message_admin.message')}
              </TableCell>
              <TableCell>
                {t('data.messages.dashboard_message_admin.recipients')}
              </TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMessages.map((message) => (
              <TableRow key={message.id}>
                <TableCell padding='checkbox'>
                  <Checkbox
                    checked={selectedMessages.includes(message.id)}
                    onChange={() => handleSelectMessage(message.id)}
                  />
                </TableCell>
                <TableCell>{message.title}</TableCell>
                <TableCell>{message.content}</TableCell>
                <TableCell>{getRecipientDisplay(message)}</TableCell>
                <TableCell>
                  {format(
                    new Date(message.created_at),
                    'EEEE, MMM d, yyyy h:mm a'
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteMessage(message.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetNewMessage();
        }}
        maxWidth='sm'
        fullWidth>
        <DialogTitle>
          {t('data.messages.dashboard_message_admin.new')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label={t('data.messages.dashboard_message_admin.title')}
            fullWidth
            value={newMessage.title}
            onChange={(e) =>
              setNewMessage({ ...newMessage, title: e.target.value })
            }
          />
          <TextField
            margin='dense'
            label={t('data.messages.dashboard_message_admin.content')}
            fullWidth
            multiline
            rows={4}
            value={newMessage.content}
            onChange={(e) =>
              setNewMessage({ ...newMessage, content: e.target.value })
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={newMessage.to_all}
                onChange={(e) =>
                  setNewMessage({
                    ...newMessage,
                    to_all: e.target.checked,
                    garage_ids: e.target.checked ? [] : newMessage.garage_ids,
                  })
                }
              />
            }
            label={t('data.messages.dashboard_message_admin.send_all')}
          />
          {!newMessage.to_all && (
            <FormControl fullWidth margin='dense'>
              <InputLabel
                sx={{
                  backgroundColor: 'white',
                  pl: 1,
                  pr: 1,
                }}>
                {t('data.messages.dashboard_message_admin.select')}
              </InputLabel>
              <Select
                value={newMessage.garage_ids}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewMessage({
                    ...newMessage,
                    garage_ids:
                      typeof value === 'string'
                        ? [parseInt(value)]
                        : [value as unknown as number],
                  });
                }}
                MenuProps={{
                  autoFocus: false,
                  disableAutoFocusItem: true,
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}>
                {garages.map((garage) => (
                  <MenuItem key={garage.id} value={garage.id}>
                    {garage.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              resetNewMessage();
            }}>
            {t('data.messages.dashboard_message_admin.cancel')}
          </Button>
          <Button
            onClick={handleCreateMessage}
            variant='contained'
            sx={{
              backgroundColor: '#48BA65',
              '&:hover': { backgroundColor: '#3a9651' },
            }}>
            {t('data.messages.dashboard_message_admin.send')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessageAdmin;
