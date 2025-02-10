import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  FormLabel,
  FormControlLabel,
  Box,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/authContext';
import faqController from '../controllers/faqController';
import { t } from 'i18next';
import { FAQ } from '../interface/interface';

const FaqAdmin: React.FC = () => {
  const { token } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr' | ''>(
    ''
  );
  const [languageError, setLanguageError] = useState<string>('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [, setLoading] = useState(true);
  const fetchFaqs = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await faqController.getAllFaqs(token);
      if (response.success) {
        setFaqs(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFaqs();
    }
  }, [fetchFaqs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !question.trim() || !answer.trim()) return;

    // Validate language selection
    if (!selectedLanguage) {
      setLanguageError('Please select a language');
      return;
    }
    setLanguageError('');

    const response = await faqController.createFaq(token, {
      question: question.trim(),
      answer: answer.trim(),
      language: selectedLanguage, // Include the selected language
    });

    if (response.success) {
      setQuestion('');
      setAnswer('');
      setSelectedLanguage(''); // Reset language selection
      fetchFaqs();
    } else {
      setError(response.message);
    }
  };

  const handleLanguageChange = (lang: 'en' | 'fr') => {
    setSelectedLanguage(lang);
    setLanguageError(''); // Clear any error when a language is selected
  };

  const handleDeleteClick = (faq: FAQ) => {
    setFaqToDelete(faq);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !faqToDelete?.id) {
      console.error('Missing token or FAQ ID');
      return;
    }

    const response = await faqController.deleteFaq(token, faqToDelete.id);
    if (response.success) {
      await fetchFaqs();
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
    } else {
      setError(response.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFaqToDelete(null);
  };

  // Rest of the component remains the same
  return (
    <Container>
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Typography variant='h5' gutterBottom>
          {t('FAQ.create')}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('FAQ.question.label')}
            variant='outlined'
            margin='normal'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label={t('FAQ.answer.label')}
            variant='outlined'
            margin='normal'
            multiline
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
          <FormControl
            component='fieldset'
            error={!!languageError}
            sx={{ width: '100%', marginTop: 2 }}>
            <FormLabel component='legend'>{t('FAQ.language.select')}</FormLabel>
            <Box sx={{ display: 'flex', gap: 2, marginTop: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedLanguage === 'en'}
                    onChange={() => handleLanguageChange('en')}
                  />
                }
                label={t('FAQ.language.english')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedLanguage === 'fr'}
                    onChange={() => handleLanguageChange('fr')}
                  />
                }
                label={t('FAQ.language.french')}
              />
            </Box>
            {languageError && (
              <FormHelperText error>{languageError}</FormHelperText>
            )}
          </FormControl>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            fullWidth
            sx={{ marginTop: 2, color: '#FFF' }}>
            {t('FAQ.submit')}
          </Button>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
        <Typography sx={{ fontWeight: 'bold' }} variant='h6'>
          {t('FAQ.FaqList')}
        </Typography>
        <List>
          {faqs.map((faq) => (
            <ListItem key={faq.id}>
              <ListItemText
                primary={
                  <>
                    <strong>Q: </strong> {faq.question}
                  </>
                }
                secondary={
                  <>
                    <strong>A: </strong> {faq.answer}
                  </>
                }
              />
              <ListItem
                secondaryAction={
                  <IconButton
                    edge='end'
                    aria-label='delete'
                    onClick={() => handleDeleteClick(faq)}
                    color='error'>
                    <DeleteIcon />
                  </IconButton>
                }></ListItem>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'>
        <DialogTitle id='delete-dialog-title'>
          {t('FAQ.delete.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('FAQ.delete.confirmation', {
              question: faqToDelete?.question,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='primary'>
            {t('FAQ.delete.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' autoFocus>
            {t('FAQ.delete.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FaqAdmin;
