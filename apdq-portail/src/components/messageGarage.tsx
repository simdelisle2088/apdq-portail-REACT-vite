import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/authContext';
import messageController from '../controllers/messagesController';
import { dashboardUserController } from '../controllers/dashboardUserController';
import { format } from 'date-fns';
import apdqLogo from '/assets/png/apdq.png';
// import { t } from 'i18next';  // If you’re using i18n, otherwise omit

interface Remorqueur {
  id: number;
  name: string;
}

// Admin->Garage message shape (if different than Garage->Remorqueur, adjust as needed)
interface AdminMessage {
  id: number;
  title: string;
  content: string;
  created_at: string;
  to_all: boolean;
  garage_ids: number[]; // or whatever your shape is
}

// Garage->Remorqueur message shape
interface GarageMessage {
  id: number;
  title: string;
  content: string;
  created_at: string;
  to_all: boolean;
  remorqueur_ids: number[];
}

// We’ll do a tab-based approach. “Inbox” = messages from Admin to this garage.
// “Sent” = messages from this garage to its remorqueurs.
const MessageGarage: React.FC = () => {
  const { user } = useAuth();
  const garageId = user?.id || 0;

  // "Inbox" (Admin -> Garage):
  const [inboxMessages, setInboxMessages] = useState<AdminMessage[]>([]);
  // "Sent" (Garage -> Remorqueur):
  const [sentMessages, setSentMessages] = useState<GarageMessage[]>([]);

  // For creating a new message (which belongs in “Sent”):
  const [openDialog, setOpenDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    to_all: false,
    remorqueur_ids: [] as number[],
    garage_id: garageId,
  });

  // Remorqueur list for picking recipients
  const [remorqueurs, setRemorqueurs] = useState<Remorqueur[]>([]);

  // Track selected messages (if you want to do multi-delete). In a real app,
  // you might track this separately for inbox vs. sent.
  const [selectedSent, setSelectedSent] = useState<number[]>([]);
  const [selectedInbox, setSelectedInbox] = useState<number[]>([]);

  // Which tab is active? “inbox” or “sent”
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  // On mount, fetch both inbox and sent
  useEffect(() => {
    fetchInboxMessages();
    fetchSentMessages();
    fetchRemorqueurs();
  }, []);

  // Get messages from Admin to this garage
  const fetchInboxMessages = async () => {
    try {
      const adminMsgs = await messageController.getAdminMessages(garageId);
      setInboxMessages(adminMsgs);
    } catch (err) {
      console.error('Error fetching inbox messages', err);
    }
  };

  // Get messages from this garage (sent to remorqueurs)
  const fetchSentMessages = async () => {
    try {
      const garageMsgs = await messageController.getAllGarageMessages(garageId);
      setSentMessages(garageMsgs);
    } catch (err) {
      console.error('Error fetching sent messages', err);
    }
  };

  // Fetch remorqueur list for the “to_all = false” scenario
  const fetchRemorqueurs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await dashboardUserController.getGarageRemorqueurs(token);
    if (response.success && response.data) {
      setRemorqueurs(response.data);
    }
  };

  // Create new “sent” message from garage -> remorqueurs
  const handleCreateMessage = async () => {
    try {
      const messageToSend = {
        ...newMessage,
        remorqueur_ids: newMessage.to_all ? [] : newMessage.remorqueur_ids,
      };

      const created = await messageController.createGarageMessage(
        messageToSend
      );
      if (created) {
        setSentMessages((prev) => [...prev, created]);
        setOpenDialog(false);
        resetNewMessage();
        // If desired, automatically switch to the “Sent” tab after creation:
        setActiveTab('sent');
      }
    } catch (err) {
      console.error('Error creating message', err);
    }
  };

  const resetNewMessage = () => {
    setNewMessage({
      title: '',
      content: '',
      to_all: false,
      remorqueur_ids: [],
      garage_id: garageId,
    });
  };

  // Single delete from “Sent”
  const handleDeleteSentMessage = async (messageId: number) => {
    const response = await messageController.deleteGarageMessage(messageId);
    if (response) {
      setSentMessages(sentMessages.filter((m) => m.id !== messageId));
    }
  };

  // Single delete from “Inbox” (if you want to allow that)
  // This would call deleteAdminMessage(...) if your API allows
  const handleDeleteInboxMessage = async (messageId: number) => {
    const response = await messageController.deleteAdminMessage(messageId);
    if (response) {
      setInboxMessages(inboxMessages.filter((m) => m.id !== messageId));
    }
  };

  // Tab change
  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: 'inbox' | 'sent'
  ) => {
    setActiveTab(newValue);
  };

  // “Sent” table rendering
  const SentMessagesTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding='checkbox'>
                <Checkbox
                  checked={
                    selectedSent.length === sentMessages.length &&
                    sentMessages.length > 0
                  }
                  indeterminate={
                    selectedSent.length > 0 &&
                    selectedSent.length < sentMessages.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSent(sentMessages.map((m) => m.id));
                    } else {
                      setSelectedSent([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Destinataires</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sentMessages.map((message) => (
              <TableRow key={message.id}>
                <TableCell padding='checkbox'>
                  <Checkbox
                    checked={selectedSent.includes(message.id)}
                    onChange={() => {
                      setSelectedSent((prev) =>
                        prev.includes(message.id)
                          ? prev.filter((id) => id !== message.id)
                          : [...prev, message.id]
                      );
                    }}
                  />
                </TableCell>
                <TableCell>{message.title}</TableCell>
                <TableCell>{message.content}</TableCell>
                <TableCell>
                  {message.to_all ? (
                    <Chip label='Tous les remorqueurs' color='primary' />
                  ) : (
                    message.remorqueur_ids.map((id) => {
                      const r = remorqueurs.find((rm) => rm.id === id);
                      return r ? (
                        <Chip key={id} label={r.name} sx={{ mr: 1 }} />
                      ) : null;
                    })
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(message.created_at), 'h:mm a')}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleDeleteSentMessage(message.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // “Inbox” table rendering
  const InboxMessagesTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding='checkbox'>
                <Checkbox
                  checked={
                    selectedInbox.length === inboxMessages.length &&
                    inboxMessages.length > 0
                  }
                  indeterminate={
                    selectedInbox.length > 0 &&
                    selectedInbox.length < inboxMessages.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedInbox(inboxMessages.map((m) => m.id));
                    } else {
                      setSelectedInbox([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>Sent by</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inboxMessages.map((message) => (
              <TableRow key={message.id}>
                <TableCell padding='checkbox'>
                  <Checkbox
                    checked={selectedInbox.includes(message.id)}
                    onChange={() => {
                      setSelectedInbox((prev) =>
                        prev.includes(message.id)
                          ? prev.filter((id) => id !== message.id)
                          : [...prev, message.id]
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <img
                    src={apdqLogo}
                    alt='APDQ logo'
                    style={{ width: '40px', height: 'auto' }}
                  />
                </TableCell>
                <TableCell>{message.title}</TableCell>
                <TableCell>{message.content}</TableCell>
                <TableCell>
                  {format(new Date(message.created_at), 'h:mm a')}
                </TableCell>
                <TableCell>
                  {/* Optionally allow deleting an admin->garage message if your API permits */}
                  <IconButton
                    onClick={() => handleDeleteInboxMessage(message.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label='Inbox' value='inbox' />
        <Tab label='Sent' value='sent' />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 'inbox' && (
          <>
            {/* Inbox actions (e.g., bulk delete) */}
            {selectedInbox.length > 0 && (
              <Button
                variant='contained'
                color='error'
                sx={{ mb: 2 }}
                startIcon={<DeleteIcon />}
                onClick={() => {
                  // Example of bulk-deleting admin messages if your endpoint allows it
                  // Or just do single-delete in a loop
                }}>
                Delete selected ({selectedInbox.length})
              </Button>
            )}
            <InboxMessagesTable />
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {/* Sent actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  backgroundColor: '#48BA65',
                  '&:hover': { backgroundColor: '#3a9651' },
                }}>
                Nouveau message
              </Button>
              {selectedSent.length > 0 && (
                <Button
                  variant='contained'
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    // Bulk-delete logic for "sentMessages" if you have that endpoint
                  }}>
                  Delete selected ({selectedSent.length})
                </Button>
              )}
            </Box>
            <SentMessagesTable />
          </>
        )}
      </Box>

      {/* Dialog for creating a new “Sent” message */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetNewMessage();
        }}
        maxWidth='sm'
        fullWidth>
        <DialogTitle>Nouveau message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Titre'
            fullWidth
            value={newMessage.title}
            onChange={(e) =>
              setNewMessage({ ...newMessage, title: e.target.value })
            }
          />
          <TextField
            margin='dense'
            label='Contenu'
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
                    remorqueur_ids: e.target.checked
                      ? []
                      : newMessage.remorqueur_ids,
                  })
                }
              />
            }
            label='Envoyer à tous les remorqueurs ?'
          />
          {/* If not sending to all, let user pick from remorqueurs */}
          {!newMessage.to_all && (
            <FormControl fullWidth margin='dense'>
              <InputLabel>Choisir remorqueurs</InputLabel>
              <Select
                multiple
                value={newMessage.remorqueur_ids}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewMessage({
                    ...newMessage,
                    remorqueur_ids:
                      typeof val === 'string' ? [] : (val as number[]),
                  });
                }}>
                {remorqueurs.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
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
            Annuler
          </Button>
          <Button
            variant='contained'
            sx={{
              backgroundColor: '#48BA65',
              '&:hover': { backgroundColor: '#3a9651' },
            }}
            onClick={handleCreateMessage}>
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessageGarage;
