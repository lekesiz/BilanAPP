const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Appointment extends Model {}

Appointment.init({
  consultantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  beneficiaryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Beneficiaries',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
        'Entretien Préliminaire', 
        'Entretien d\'Investigation', 
        'Entretien de Synthèse', 
        'Passation Tests', 
        'Suivi', 
        'Autre'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Appointment'
});

module.exports = Appointment;
