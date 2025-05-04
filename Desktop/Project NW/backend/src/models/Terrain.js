const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Association = require('./Association');

const Terrain = sequelize.define('Terrain', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  association_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Association,
      key: 'id'
    }
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  visuels: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
});

// Définition des relations
Terrain.belongsTo(Association, { foreignKey: 'association_id' });
Association.hasMany(Terrain, { foreignKey: 'association_id' });

module.exports = Terrain; 