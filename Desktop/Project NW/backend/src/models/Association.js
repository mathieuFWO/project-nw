const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Association = sequelize.define('Association', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
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
  logo_url: {
    type: DataTypes.STRING
  }
});

// Définition des relations
Association.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Association, { foreignKey: 'user_id' });

module.exports = Association; 