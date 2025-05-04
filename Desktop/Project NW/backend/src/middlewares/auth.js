const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Veuillez vous authentifier' });
  }
};

const isAssociation = async (req, res, next) => {
  try {
    if (req.user.type !== 'association') {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Accès réservé aux associations' });
  }
};

const isJoueur = async (req, res, next) => {
  try {
    if (req.user.type !== 'joueur') {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(403).json({ message: 'Accès réservé aux joueurs' });
  }
};

module.exports = {
  auth,
  isAssociation,
  isJoueur
}; 