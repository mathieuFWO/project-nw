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
  Chip,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

function Home() {
  const [events, setEvents] = useState([]);
  const [terrains, setTerrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, terrainsResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/events'),
          axios.get('http://localhost:3000/api/terrains')
        ]);

        setEvents(eventsResponse.data);
        setTerrains(terrainsResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  if (loading) {
    return (
      <Container>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      {/* Section Événements */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Événements à venir
        </Typography>
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={event.terrain?.visuels?.[0] || '/default-event.jpg'}
                  alt={event.nom}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {event.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {event.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={`${formatDate(event.date_debut)}`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${event.prix}€`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Button
                    variant="contained"
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
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Section Terrains */}
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Terrains disponibles
        </Typography>
        <Grid container spacing={3}>
          {terrains.map((terrain) => (
            <Grid item xs={12} sm={6} md={4} key={terrain.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={terrain.visuels?.[0] || '/default-terrain.jpg'}
                  alt={terrain.nom}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {terrain.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {terrain.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Par {terrain.association?.nom}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/terrains/${terrain.id}`)}
                  >
                    Voir le terrain
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default Home; 