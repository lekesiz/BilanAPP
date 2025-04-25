const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {
  // Add a getter to map 'body' to 'content' for consistency in controllers
  get content() {
    return this.getDataValue('body');
  }
  
  // Add a setter to map 'content' to 'body' for controllers that use 'content'
  set content(val) {
    this.setDataValue('body', val);
  }
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'body'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    consultantId: {
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
      allowNull: false,
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    }
  },
  {
    sequelize,
    modelName: 'Message',
    timestamps: true
  },
);

Message.associate = function(models) {
  // Belongs to User (sender)
  Message.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  });
  
  // Belongs to User (consultant)
  Message.belongsTo(models.User, {
    foreignKey: 'consultantId',
    as: 'consultant'
  });
  
  // Belongs to Beneficiary
  Message.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary'
  });
};

module.exports = Message;
