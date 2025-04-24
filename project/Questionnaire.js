const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Questionnaire extends Model {}

Questionnaire.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'skills',
        'interests',
        'personality',
        'values',
        'other',
      ),
      allowNull: false,
      defaultValue: 'skills',
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Questionnaire',
  },
);

module.exports = Questionnaire;
