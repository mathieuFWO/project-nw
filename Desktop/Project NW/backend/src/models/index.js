const sequelize = require('../config/database');

// Import des modèles
const User = require('./User');
const Association = require('./Association');
const Terrain = require('./Terrain');
const Event = require('./Event');
const Registration = require('./Registration');
const Payment = require('./Payment');
const Ban = require('./Ban');
const Message = require('./Message');

// Synchronisation de la base de données
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Base de données synchronisée avec succès');
  } catch (error) {
    console.error('Erreur lors de la synchronisation de la base de données:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Association,
  Terrain,
  Event,
  Registration,
  Payment,
  Ban,
  Message,
  syncDatabase
}; 