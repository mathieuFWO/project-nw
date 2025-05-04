const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middlewares/auth');
const { Payment, Event, User } = require('../models');

// Créer une session de paiement Stripe
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { payment_id } = req.body;

    const payment = await Payment.findOne({
      where: { id: payment_id },
      include: [Event, User]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    if (payment.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Ce paiement a déjà été traité' });
    }

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: payment.Event.nom,
              description: `Inscription à l'événement ${payment.Event.nom}`
            },
            unit_amount: Math.round(payment.montant * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Commission de service',
              description: 'Frais de gestion'
            },
            unit_amount: Math.round(payment.commission * 100),
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        payment_id: payment.id
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Webhook Stripe pour les paiements réussis
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const payment_id = session.metadata.payment_id;

    try {
      // Mettre à jour le statut du paiement
      await Payment.update(
        { 
          statut: 'payé',
          stripe_payment_id: session.payment_intent
        },
        { where: { id: payment_id } }
      );

      // Envoyer un email de confirmation (à implémenter)
      // ...

    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
    }
  }

  res.json({ received: true });
});

// Récupérer l'historique des paiements d'un utilisateur
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { joueur_id: req.user.id },
      include: [
        {
          model: Event,
          attributes: ['id', 'nom', 'date_debut']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rembourser un paiement
router.post('/:id/refund', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { id: req.params.id },
      include: [Event]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    if (payment.statut !== 'payé') {
      return res.status(400).json({ message: 'Ce paiement ne peut pas être remboursé' });
    }

    // Créer le remboursement Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_id
    });

    // Mettre à jour le statut du paiement
    await payment.update({ statut: 'remboursé' });

    res.json({ message: 'Remboursement effectué avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 