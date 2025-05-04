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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

function TerrainsList() {
  const [terrains, setTerrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchTerrains();
  }, []);

  const fetchTerrains = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/terrains');
      setTerrains(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des terrains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce terrain ?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/terrains/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTerrains(terrains.filter(terrain => terrain.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du terrain:', error);
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Terrains
        </Typography>
        {user?.type === 'association' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/terrains/create')}
          >
            Ajouter un terrain
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {terrains.map((terrain) => (
          <Grid item xs={12} sm={6} md={4} key={terrain.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={terrain.visuels?.[0] || '/default-terrain.jpg'}
                alt={terrain.nom}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="h2">
                    {terrain.nom}
                  </Typography>
                  {user?.type === 'association' && user?.id === terrain.association_id && (
                    <Box>
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/terrains/edit/${terrain.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(terrain.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {terrain.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={terrain.association?.nom}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/terrains/${terrain.id}`)}
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
          onClick={() => navigate('/terrains/create')}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}

export default TerrainsList; 