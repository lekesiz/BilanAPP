const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {}

Message.init(
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    senderType: {
      type: DataTypes.ENUM('consultant', 'beneficiary'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Message',
  },
);

module.exports = Message;
