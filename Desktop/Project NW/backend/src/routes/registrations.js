const express = require('express');
const router = express.Router();
const { auth, isJoueur } = require('../middlewares/auth');
const { Registration, Event, User, Payment } = require('../models');

// S'inscrire à un événement
router.post('/', auth, isJoueur, async (req, res) => {
  try {
    const event = await Event.findByPk(req.body.event_id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    if (event.statut !== 'actif') {
      return res.status(400).json({ message: 'Cet événement n\'est plus disponible' });
    }

    // Vérifier si le joueur est déjà inscrit
    const existingRegistration = await Registration.findOne({
      where: {
        joueur_id: req.user.id,
        event_id: event.id
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit à cet événement' });
    }

    // Vérifier s'il reste des places
    const registrationsCount = await Registration.count({
      where: {
        event_id: event.id,
        statut: 'validée'
      }
    });

    if (registrationsCount >= event.nombre_places) {
      return res.status(400).json({ message: 'Plus de places disponibles pour cet événement' });
    }

    // Créer le paiement
    const payment = await Payment.create({
      montant: event.prix,
      commission: 0.90,
      statut: 'en_attente',
      joueur_id: req.user.id,
      event_id: event.id
    });

    // Créer l'inscription
    const registration = await Registration.create({
      joueur_id: req.user.id,
      event_id: event.id,
      paiement_id: payment.id,
      statut: 'validée'
    });

    res.status(201).json({
      registration,
      payment
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Annuler une inscription
router.post('/:id/cancel', auth, isJoueur, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      where: {
        id: req.params.id,
        joueur_id: req.user.id
      },
      include: [Event]
    });

    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Vérifier si l'annulation est possible (par exemple, 24h avant l'événement)
    const eventDate = new Date(registration.Event.date_debut);
    const now = new Date();
    const hoursBeforeEvent = (eventDate - now) / (1000 * 60 * 60);

    if (hoursBeforeEvent < 24) {
      return res.status(400).json({ message: 'L\'annulation n\'est plus possible' });
    }

    // Mettre à jour le statut de l'inscription
    await registration.update({ statut: 'annulée' });

    // Mettre à jour le statut du paiement
    await Payment.update(
      { statut: 'remboursé' },
      { where: { id: registration.paiement_id } }
    );

    res.json({ message: 'Inscription annulée avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Liste des inscriptions d'un joueur
router.get('/joueur', auth, isJoueur, async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      where: { joueur_id: req.user.id },
      include: [
        {
          model: Event,
          include: [
            { model: Association, attributes: ['id', 'nom'] },
            { model: Terrain, attributes: ['id', 'nom'] }
          ]
        },
        { model: Payment }
      ],
      order: [['date_inscription', 'DESC']]
    });

    res.json(registrations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Liste des inscriptions pour un événement (association)
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.eventId, {
      include: [Association]
    });

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Vérifier si l'utilisateur est l'association organisatrice
    if (event.association_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const registrations = await Registration.findAll({
      where: { event_id: event.id },
      include: [
        { model: User, attributes: ['id', 'nom', 'email'] },
        { model: Payment }
      ],
      order: [['date_inscription', 'DESC']]
    });

    res.json(registrations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 