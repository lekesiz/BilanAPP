const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Answer extends Model {}

Answer.init(
  {
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Answer',
  },
);

module.exports = Answer;
