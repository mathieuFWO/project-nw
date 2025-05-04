const express = require('express');
const router = express.Router();
const { auth, isAssociation } = require('../middlewares/auth');
const { Terrain, Association } = require('../models');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/terrains');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Créer un terrain
router.post('/', auth, isAssociation, upload.array('visuels', 5), async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    const visuels = req.files ? req.files.map(file => file.path) : [];

    const terrain = await Terrain.create({
      association_id: association.id,
      nom: req.body.nom,
      description: req.body.description,
      visuels
    });

    res.status(201).json(terrain);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lister les terrains d'une association
router.get('/association', auth, isAssociation, async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    const terrains = await Terrain.findAll({
      where: { association_id: association.id }
    });

    res.json(terrains);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mettre à jour un terrain
router.put('/:id', auth, isAssociation, upload.array('visuels', 5), async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    const terrain = await Terrain.findOne({
      where: {
        id: req.params.id,
        association_id: association.id
      }
    });

    if (!terrain) {
      return res.status(404).json({ message: 'Terrain non trouvé' });
    }

    const visuels = req.files ? req.files.map(file => file.path) : terrain.visuels;

    await terrain.update({
      nom: req.body.nom || terrain.nom,
      description: req.body.description || terrain.description,
      visuels
    });

    res.json(terrain);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un terrain
router.delete('/:id', auth, isAssociation, async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    const terrain = await Terrain.findOne({
      where: {
        id: req.params.id,
        association_id: association.id
      }
    });

    if (!terrain) {
      return res.status(404).json({ message: 'Terrain non trouvé' });
    }

    await terrain.destroy();
    res.json({ message: 'Terrain supprimé avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lister tous les terrains (public)
router.get('/', async (req, res) => {
  try {
    const terrains = await Terrain.findAll({
      include: [{
        model: Association,
        attributes: ['nom']
      }]
    });
    res.json(terrains);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 