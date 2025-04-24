const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CareerExploration = sequelize.define('CareerExploration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  beneficiaryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Beneficiaries',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  currentRole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetRole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  yearsExperience: {
    type: DataTypes.STRING,
  },
  education: {
    type: DataTypes.STRING,
  },
  skills: {
    type: DataTypes.TEXT,
  },
  experience: {
    type: DataTypes.TEXT,
  },
  interests: {
    type: DataTypes.TEXT,
  },
  preferences: {
    type: DataTypes.TEXT,
  },
  results: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  saved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = CareerExploration;
