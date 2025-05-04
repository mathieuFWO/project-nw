import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Fab,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [tabValue]);

  const fetchEvents = async () => {
    try {
      const endpoint = user?.type === 'association'
        ? 'http://localhost:3000/api/events/association'
        : 'http://localhost:3000/api/events';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cet événement ?')) {
      return;
    }

    try {
      await axios.post(`http://localhost:3000/api/events/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvents(); // Recharger les événements
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'événement:', error);
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  const filteredEvents = events.filter(event => {
    if (tabValue === 0) return true; // Tous les événements
    if (tabValue === 1) return event.statut === 'actif';
    if (tabValue === 2) return event.statut === 'annulé';
    return true;
  });

  if (loading) {
    return (
      <Container>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Événements
        </Typography>
        {user?.type === 'association' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
          >
            Créer un événement
          </Button>
        )}
      </Box>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Tous" />
        <Tab label="Actifs" />
        <Tab label="Annulés" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={event.terrain?.visuels?.[0] || '/default-event.jpg'}
                alt={event.nom}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="h2">
                    {event.nom}
                  </Typography>
                  {user?.type === 'association' && user?.id === event.association_id && (
                    <Box>
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/events/edit/${event.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      {event.statut === 'actif' && (
                        <IconButton
                          color="warning"
                          onClick={() => handleCancel(event.id)}
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(event.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {event.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={formatDate(event.date_debut)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${event.prix}€`}
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${event.inscriptions?.length || 0}/${event.nombre_places} places`}
                    size="small"
                    color={event.inscriptions?.length >= event.nombre_places ? 'error' : 'success'}
                  />
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  Voir les détails
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {user?.type === 'association' && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/events/create')}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}

export default EventsList; 