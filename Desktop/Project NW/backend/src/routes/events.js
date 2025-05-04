const express = require('express');
const router = express.Router();
const { auth, isAssociation } = require('../middlewares/auth');
const { Event, Association, Terrain, Registration, User } = require('../models');

// Créer un événement
router.post('/', auth, isAssociation, async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    // Vérifier que le terrain appartient à l'association
    const terrain = await Terrain.findOne({
      where: {
        id: req.body.terrain_id,
        association_id: association.id
      }
    });

    if (!terrain) {
      return res.status(404).json({ message: 'Terrain non trouvé ou non autorisé' });
    }

    const event = await Event.create({
      association_id: association.id,
      terrain_id: req.body.terrain_id,
      nom: req.body.nom,
      description: req.body.description,
      date_debut: req.body.date_debut,
      date_fin: req.body.date_fin,
      récurrence: req.body.récurrence || 'unique',
      prix: req.body.prix,
      nombre_places: req.body.nombre_places,
      statut: 'actif'
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lister les événements d'une association
router.get('/association', auth, isAssociation, async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    const events = await Event.findAll({
      where: { association_id: association.id },
      include: [
        { model: Terrain, attributes: ['nom', 'description'] },
        { 
          model: Registration,
          include: [{ model: User, attributes: ['id', 'nom', 'email'] }]
        }
      ],
      order: [['date_debut', 'ASC']]
    });

    res.json(events);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mettre à jour un événement
router.put('/:id', auth, isAssociation, async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    const event = await Event.findOne({
      where: {
        id: req.params.id,
        association_id: association.id
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Vérifier que le terrain appartient à l'association si changement de terrain
    if (req.body.terrain_id && req.body.terrain_id !== event.terrain_id) {
      const terrain = await Terrain.findOne({
        where: {
          id: req.body.terrain_id,
          association_id: association.id
        }
      });

      if (!terrain) {
        return res.status(404).json({ message: 'Terrain non trouvé ou non autorisé' });
      }
    }

    await event.update({
      terrain_id: req.body.terrain_id || event.terrain_id,
      nom: req.body.nom || event.nom,
      description: req.body.description || event.description,
      date_debut: req.body.date_debut || event.date_debut,
      date_fin: req.body.date_fin || event.date_fin,
      récurrence: req.body.récurrence || event.récurrence,
      prix: req.body.prix || event.prix,
      nombre_places: req.body.nombre_places || event.nombre_places,
      statut: req.body.statut || event.statut
    });

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Annuler un événement
router.post('/:id/cancel', auth, isAssociation, async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    const event = await Event.findOne({
      where: {
        id: req.params.id,
        association_id: association.id
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    await event.update({ statut: 'annulé' });

    // Notifier les inscrits (à implémenter)
    // ...

    res.json({ message: 'Événement annulé avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lister tous les événements (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { statut: 'actif' },
      include: [
        { 
          model: Association,
          attributes: ['id', 'nom']
        },
        { 
          model: Terrain,
          attributes: ['id', 'nom', 'description']
        }
      ],
      order: [['date_debut', 'ASC']]
    });

    res.json(events);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtenir les détails d'un événement
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { 
          model: Association,
          attributes: ['id', 'nom']
        },
        { 
          model: Terrain,
          attributes: ['id', 'nom', 'description']
        },
        {
          model: Registration,
          include: [{ model: User, attributes: ['id', 'nom'] }]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 