const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Event = require('./Event');
const Association = require('./Association');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  auteur_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Event,
      key: 'id'
    }
  },
  association_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Association,
      key: 'id'
    }
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('groupe', 'privé', 'info'),
    defaultValue: 'privé'
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Définition des relations
Message.belongsTo(User, { foreignKey: 'auteur_id' });
User.hasMany(Message, { foreignKey: 'auteur_id' });

Message.belongsTo(Event, { foreignKey: 'event_id' });
Event.hasMany(Message, { foreignKey: 'event_id' });

Message.belongsTo(Association, { foreignKey: 'association_id' });
Association.hasMany(Message, { foreignKey: 'association_id' });

module.exports = Message; 