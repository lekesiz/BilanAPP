const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Question extends Model {}

Question.init({
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'multiple_choice', 'rating', 'yes_no'),
    allowNull: false,
    defaultValue: 'text'
  },
  options: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('options');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('options', JSON.stringify(value));
    }
  },
  required: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Question'
});

module.exports = Question;
