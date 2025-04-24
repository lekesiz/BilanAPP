const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Answer extends Model {}

Answer.init(
  {
    questionnaireId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questionnaires',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Answer',
  },
);

module.exports = Answer;
