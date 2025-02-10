import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useAuth } from '../hooks/authContext';
import faqController from '../controllers/faqController';
import { FAQ, FaqModalProps } from '../interface/interface';
import { t } from 'i18next';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FaqModal: React.FC<FaqModalProps> = () => {
  const { token } = useAuth();
  const params = useParams();
  const { i18n } = useTranslation();
  const currentLang = params.lang || i18n.language;

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false);

  const fetchFaqs = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await faqController.getFaqs(token, currentLang);

      if (response.success) {
        setFaqs(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(t('FAQ.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [token, currentLang, t]);

  useEffect(() => {
    if (token) {
      fetchFaqs();
    }
  }, [fetchFaqs]);

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        width: '90%',
        margin: '0 auto',
        borderRadius: '14px',
        height: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Header */}
      <Box
        sx={{
          padding: '24px',
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          zIndex: 1,
        }}>
        <Typography
          variant='h5'
          component='h2'
          sx={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#202224',
          }}>
          FAQ/Support
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          '&::-webkit-scrollbar': {
            width: '0.4em',
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'transparent',
          },
          scrollbarWidth: 'none',
          '-ms-overflow-style': 'none',
        }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color='error' align='center'>
            {error}
          </Typography>
        ) : faqs.length === 0 ? (
          <Typography align='center' color='text.secondary'>
            {t('FAQ.noFaqs')}
          </Typography>
        ) : (
          faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleAccordionChange(`panel${index}`)}
              sx={{
                mb: 2,
                '&:before': {
                  display: 'none',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
                '&:not(:last-child)': {
                  marginBottom: '16px',
                },
              }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, .03)',
                  borderBottom: expanded === `panel${index}` ? 1 : 0,
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, .05)',
                  },
                }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#202224',
                    fontSize: '1.1rem',
                  }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  padding: '16px 24px',
                  backgroundColor: '#fff',
                }}>
                <Typography
                  sx={{
                    color: '#666',
                    lineHeight: 1.6,
                  }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Box>
  );
};

export default FaqModal;
