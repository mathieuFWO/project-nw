import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

function RegistrationsList() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchRegistrations();
  }, [tabValue, eventId]);

  const fetchRegistrations = async () => {
    try {
      let endpoint;
      if (eventId) {
        endpoint = `http://localhost:3000/api/registrations/event/${eventId}`;
      } else if (user?.type === 'joueur') {
        endpoint = 'http://localhost:3000/api/registrations/joueur';
      } else {
        endpoint = 'http://localhost:3000/api/registrations/association';
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRegistrations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
      setError('Erreur lors du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/registrations/${id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      fetchRegistrations();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'inscription:', error);
      setError('Erreur lors de l\'annulation de l\'inscription');
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const filteredRegistrations = registrations.filter(registration => {
    if (tabValue === 0) return true; // Toutes les inscriptions
    if (tabValue === 1) return registration.statut === 'confirmée';
    if (tabValue === 2) return registration.statut === 'annulée';
    return true;
  });

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {eventId ? 'Inscriptions à l\'événement' : 'Mes inscriptions'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Toutes" />
          <Tab label="Confirmées" />
          <Tab label="Annulées" />
        </Tabs>

        <List>
          {filteredRegistrations.map((registration) => (
            <React.Fragment key={registration.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle1">
                        {registration.evenement?.nom}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={formatDate(registration.evenement?.date_debut)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`${registration.evenement?.prix}€`}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={registration.statut}
                          size="small"
                          color={
                            registration.statut === 'confirmée'
                              ? 'success'
                              : registration.statut === 'annulée'
                              ? 'error'
                              : 'default'
                          }
                        />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Terrain: {registration.evenement?.terrain?.nom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Organisateur: {registration.evenement?.association?.nom}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/events/${registration.evenement_id}`)}
                    sx={{ mr: 1 }}
                  >
                    Voir l'événement
                  </Button>
                  {registration.statut === 'confirmée' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleCancel(registration.id)}
                    >
                      Annuler
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {filteredRegistrations.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            Aucune inscription trouvée
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default RegistrationsList; 