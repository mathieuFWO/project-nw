import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

function EventEdit() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    terrain_id: '',
    nom: '',
    description: '',
    date_debut: '',
    date_fin: '',
    recurrence: '',
    prix: '',
    nombre_places: '',
  });
  const [terrains, setTerrains] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvent();
    fetchTerrains();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const event = response.data;
      setFormData({
        terrain_id: event.terrain_id,
        nom: event.nom,
        description: event.description,
        date_debut: event.date_debut,
        date_fin: event.date_fin,
        recurrence: event.recurrence || '',
        prix: event.prix,
        nombre_places: event.nombre_places,
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error);
      setError('Erreur lors du chargement de l\'événement');
    }
  };

  const fetchTerrains = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/terrains', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTerrains(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des terrains:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.put(
        `http://localhost:3000/api/events/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate('/events');
    } catch (error) {
      console.error('Erreur lors de la modification de l\'événement:', error);
      setError(error.response?.data?.message || 'Erreur lors de la modification de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Modifier l'événement
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="terrain-label">Terrain</InputLabel>
                <Select
                  labelId="terrain-label"
                  name="terrain_id"
                  value={formData.terrain_id}
                  onChange={handleChange}
                  label="Terrain"
                  required
                >
                  {terrains.map((terrain) => (
                    <MenuItem key={terrain.id} value={terrain.id}>
                      {terrain.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Nom de l'événement"
                name="nom"
                fullWidth
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date de début"
                name="date_debut"
                type="datetime-local"
                fullWidth
                value={formData.date_debut}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date de fin"
                name="date_fin"
                type="datetime-local"
                fullWidth
                value={formData.date_fin}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="recurrence-label">Récurrence</InputLabel>
                <Select
                  labelId="recurrence-label"
                  name="recurrence"
                  value={formData.recurrence}
                  onChange={handleChange}
                  label="Récurrence"
                >
                  <MenuItem value="">Aucune</MenuItem>
                  <MenuItem value="quotidien">Quotidien</MenuItem>
                  <MenuItem value="hebdomadaire">Hebdomadaire</MenuItem>
                  <MenuItem value="mensuel">Mensuel</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Prix (€)"
                name="prix"
                type="number"
                fullWidth
                value={formData.prix}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre de places"
                name="nombre_places"
                type="number"
                fullWidth
                value={formData.nombre_places}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={() => navigate('/events')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Modification en cours...' : 'Enregistrer les modifications'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default EventEdit; 