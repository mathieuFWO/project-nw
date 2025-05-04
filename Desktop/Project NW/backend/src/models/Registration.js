const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Payment = require('./Payment');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  joueur_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Event,
      key: 'id'
    }
  },
  statut: {
    type: DataTypes.ENUM('validée', 'annulée', 'bloquée'),
    defaultValue: 'validée'
  },
  paiement_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Payment,
      key: 'id'
    }
  },
  date_inscription: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Définition des relations
Registration.belongsTo(User, { foreignKey: 'joueur_id' });
User.hasMany(Registration, { foreignKey: 'joueur_id' });

Registration.belongsTo(Event, { foreignKey: 'event_id' });
Event.hasMany(Registration, { foreignKey: 'event_id' });

Registration.belongsTo(Payment, { foreignKey: 'paiement_id' });
Payment.hasOne(Registration, { foreignKey: 'paiement_id' });

module.exports = Registration; 