import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

function PaymentsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/payments/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      setError('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;

    try {
      await axios.post(
        `http://localhost:3000/api/payments/${selectedPayment.id}/refund`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setShowRefundDialog(false);
      fetchPayments(); // Recharger les paiements
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      setError('Erreur lors du remboursement');
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  const formatAmount = (amount) => {
    return `${amount.toFixed(2)}€`;
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

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historique des paiements
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {payments.map((payment) => (
            <React.Fragment key={payment.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle1">
                        {payment.evenement?.nom}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={formatDate(payment.date_creation)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={formatAmount(payment.montant)}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={payment.statut}
                          size="small"
                          color={
                            payment.statut === 'payé'
                              ? 'success'
                              : payment.statut === 'remboursé'
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
                        Terrain: {payment.evenement?.terrain?.nom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Organisateur: {payment.evenement?.association?.nom}
                      </Typography>
                      {payment.date_remboursement && (
                        <Typography variant="body2" color="text.secondary">
                          Remboursé le: {formatDate(payment.date_remboursement)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/events/${payment.evenement_id}`)}
                    sx={{ mr: 1 }}
                  >
                    Voir l'événement
                  </Button>
                  {payment.statut === 'payé' && user?.type === 'association' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowRefundDialog(true);
                      }}
                    >
                      Rembourser
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        {payments.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            Aucun paiement trouvé
          </Typography>
        )}
      </Paper>

      <Dialog
        open={showRefundDialog}
        onClose={() => setShowRefundDialog(false)}
      >
        <DialogTitle>Confirmer le remboursement</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir rembourser ce paiement de{' '}
            {selectedPayment && formatAmount(selectedPayment.montant)} ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRefundDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRefund}
          >
            Confirmer le remboursement
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PaymentsList; 