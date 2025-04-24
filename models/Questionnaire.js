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
    category: {
      type: DataTypes.ENUM(
        'Intérêts Professionnels',
        'Motivation',
        'Personnalité',
        'Compétences Techniques',
        'Compétences Transversales',
        'Valeurs',
        'Autre',
      ),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'completed'),
      defaultValue: 'draft',
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'Questionnaire',
  },
);

module.exports = Questionnaire;
