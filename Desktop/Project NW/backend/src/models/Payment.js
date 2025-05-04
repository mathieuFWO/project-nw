const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.90
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'payé', 'remboursé'),
    defaultValue: 'en_attente'
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
  stripe_payment_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Définition des relations
Payment.belongsTo(User, { foreignKey: 'joueur_id' });
User.hasMany(Payment, { foreignKey: 'joueur_id' });

Payment.belongsTo(Event, { foreignKey: 'event_id' });
Event.hasMany(Payment, { foreignKey: 'event_id' });

module.exports = Payment; 