import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    confirmation_mot_de_passe: '',
    type: 'joueur',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

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

    // Validation du mot de passe
    if (formData.mot_de_passe !== formData.confirmation_mot_de_passe) {
      return setError('Les mots de passe ne correspondent pas');
    }

    setLoading(true);

    try {
      const result = await register({
        nom: formData.nom,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
        type: formData.type,
      });

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Inscription
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Nom"
            name="nom"
            fullWidth
            margin="normal"
            value={formData.nom}
            onChange={handleChange}
            required
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <TextField
            label="Mot de passe"
            name="mot_de_passe"
            type="password"
            fullWidth
            margin="normal"
            value={formData.mot_de_passe}
            onChange={handleChange}
            required
          />

          <TextField
            label="Confirmer le mot de passe"
            name="confirmation_mot_de_passe"
            type="password"
            fullWidth
            margin="normal"
            value={formData.confirmation_mot_de_passe}
            onChange={handleChange}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type de compte</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type de compte"
            >
              <MenuItem value="joueur">Joueur</MenuItem>
              <MenuItem value="association">Association</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Déjà inscrit ?{' '}
              <Link component={RouterLink} to="/login">
                Se connecter
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default Register; 