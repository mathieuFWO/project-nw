const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { Message, Event, Association, User } = require('../models');

// Envoyer un message
router.post('/', auth, async (req, res) => {
  try {
    const { event_id, association_id, contenu, type } = req.body;

    // Vérifier les permissions selon le type de message
    if (type === 'groupe' && event_id) {
      const event = await Event.findByPk(event_id);
      if (!event) {
        return res.status(404).json({ message: 'Événement non trouvé' });
      }
      if (event.association_id !== req.user.id && req.user.type !== 'association') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    } else if (type === 'privé' && association_id) {
      const association = await Association.findByPk(association_id);
      if (!association) {
        return res.status(404).json({ message: 'Association non trouvée' });
      }
    }

    const message = await Message.create({
      auteur_id: req.user.id,
      event_id,
      association_id,
      contenu,
      type
    });

    // Émettre le message via Socket.io
    req.app.get('io').emit('newMessage', {
      message,
      user: {
        id: req.user.id,
        nom: req.user.nom,
        type: req.user.type
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Récupérer l'historique des messages d'un événement
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    const messages = await Message.findAll({
      where: { event_id: event.id },
      include: [
        {
          model: User,
          attributes: ['id', 'nom', 'type']
        }
      ],
      order: [['date', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Récupérer l'historique des messages privés avec une association
router.get('/association/:associationId', auth, async (req, res) => {
  try {
    const association = await Association.findByPk(req.params.associationId);
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    const messages = await Message.findAll({
      where: {
        association_id: association.id,
        type: 'privé',
        [Op.or]: [
          { auteur_id: req.user.id },
          { auteur_id: association.user_id }
        ]
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nom', 'type']
        }
      ],
      order: [['date', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Envoyer un message groupé aux inscrits d'un événement
router.post('/event/:eventId/broadcast', auth, async (req, res) => {
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

    const message = await Message.create({
      auteur_id: req.user.id,
      event_id: event.id,
      contenu: req.body.contenu,
      type: 'info'
    });

    // Émettre le message à tous les inscrits via Socket.io
    req.app.get('io').to(`event:${event.id}`).emit('broadcastMessage', {
      message,
      event: {
        id: event.id,
        nom: event.nom
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 