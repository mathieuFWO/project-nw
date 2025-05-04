const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Association = require('./Association');

const Ban = sequelize.define('Ban', {
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
  association_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Association,
      key: 'id'
    }
  },
  raison: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Définition des relations
Ban.belongsTo(User, { foreignKey: 'joueur_id' });
User.hasMany(Ban, { foreignKey: 'joueur_id' });

Ban.belongsTo(Association, { foreignKey: 'association_id' });
Association.hasMany(Ban, { foreignKey: 'association_id' });

module.exports = Ban; 