const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Beneficiary extends Model {}

Beneficiary.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('initial', 'in_progress', 'completed'),
      defaultValue: 'initial',
      allowNull: false,
    },
    currentPhase: {
      type: DataTypes.ENUM('preliminary', 'investigation', 'conclusion'),
      defaultValue: 'preliminary',
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Beneficiary',
  },
);

module.exports = Beneficiary;
