import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvent(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error);
      setError('Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      // Créer l'inscription
      const registrationResponse = await axios.post(
        'http://localhost:3000/api/registrations',
        { event_id: id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      // Créer la session de paiement
      const paymentResponse = await axios.post(
        'http://localhost:3000/api/payments/create-checkout-session',
        { payment_id: registrationResponse.data.payment_id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setPaymentUrl(paymentResponse.data.url);
      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
    fetchEvent(); // Recharger les détails de l'événement
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return null;
  }

  const isRegistered = event.inscriptions?.some(
    (inscription) => inscription.joueur_id === user?.id
  );

  const isOrganizer = user?.type === 'association' && user?.id === event.association_id;

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {event.nom}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Chip
                label={formatDate(event.date_debut)}
                sx={{ mr: 1 }}
              />
              <Chip
                label={`${event.prix}€`}
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip
                label={`${event.inscriptions?.length || 0}/${event.nombre_places} places`}
                color={event.inscriptions?.length >= event.nombre_places ? 'error' : 'success'}
              />
            </Box>

            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Terrain
            </Typography>
            <Typography variant="body1" paragraph>
              {event.terrain?.nom}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.terrain?.description}
            </Typography>

            {event.recurrence && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Récurrence
                </Typography>
                <Typography variant="body1">
                  {event.recurrence.charAt(0).toUpperCase() + event.recurrence.slice(1)}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Organisateur
              </Typography>
              <Typography variant="body1" paragraph>
                {event.association?.nom}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Inscrits
              </Typography>
              <List>
                {event.inscriptions?.map((inscription) => (
                  <React.Fragment key={inscription.id}>
                    <ListItem>
                      <ListItemText
                        primary={inscription.joueur?.nom}
                        secondary={inscription.statut}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              {!isOrganizer && (
                <Box sx={{ mt: 3 }}>
                  {isRegistered ? (
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      onClick={() => navigate(`/registrations/${event.inscriptions.find(i => i.joueur_id === user?.id).id}/cancel`)}
                    >
                      Annuler l'inscription
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleRegister}
                      disabled={event.inscriptions?.length >= event.nombre_places || event.statut === 'annulé'}
                    >
                      S'inscrire
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)}>
        <DialogTitle>Paiement</DialogTitle>
        <DialogContent>
          <Typography>
            Vous allez être redirigé vers la page de paiement. Une fois le paiement effectué,
            vous serez automatiquement inscrit à l'événement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.location.href = paymentUrl;
            }}
          >
            Procéder au paiement
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EventDetails; 