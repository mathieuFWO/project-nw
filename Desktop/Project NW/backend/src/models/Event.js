const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Association = require('./Association');
const Terrain = require('./Terrain');

const Event = sequelize.define('Event', {
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
  terrain_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Terrain,
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
  date_debut: {
    type: DataTypes.DATE,
    allowNull: false
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  récurrence: {
    type: DataTypes.ENUM('unique', 'hebdo', 'mensuel'),
    defaultValue: 'unique'
  },
  prix: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  nombre_places: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('actif', 'annulé', 'complet'),
    defaultValue: 'actif'
  }
});

// Définition des relations
Event.belongsTo(Association, { foreignKey: 'association_id' });
Association.hasMany(Event, { foreignKey: 'association_id' });

Event.belongsTo(Terrain, { foreignKey: 'terrain_id' });
Terrain.hasMany(Event, { foreignKey: 'terrain_id' });

module.exports = Event; 