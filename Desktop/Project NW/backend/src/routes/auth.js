const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Association } = require('../models');

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, email, mot_de_passe, type } = req.body;

    // Vérification si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Création de l'utilisateur
    const user = await User.create({
      nom,
      email,
      mot_de_passe,
      type
    });

    // Si c'est une association, création du profil association
    if (type === 'association') {
      await Association.create({
        user_id: user.id,
        nom: nom
      });
    }

    // Génération du token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        type: user.type
      },
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Recherche de l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérification du mot de passe
    const isPasswordValid = await user.verifyPassword(mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Génération du token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        type: user.type
      },
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Récupération du profil
router.get('/me', require('../middlewares/auth').auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['mot_de_passe'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 