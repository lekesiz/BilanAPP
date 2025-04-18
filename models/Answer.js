const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Answer extends Model {}

Answer.init({
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  beneficiaryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Beneficiaries',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  sequelize,
  modelName: 'Answer'
});

module.exports = Answer;
