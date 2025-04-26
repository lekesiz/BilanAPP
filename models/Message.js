const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the message',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Content of the message',
    },
    type: {
      type: DataTypes.ENUM(
        'text',
        'image',
        'file',
        'link',
        'location',
        'system',
        'other'
      ),
      allowNull: false,
      defaultValue: 'text',
      comment: 'Type of the message',
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed', 'deleted'),
      allowNull: false,
      defaultValue: 'sent',
      comment: 'Status of the message',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the message',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value || {}));
      },
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Tags associated with the message',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Attachments associated with the message',
      get() {
        const rawValue = this.getDataValue('attachments');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('attachments', JSON.stringify(value || []));
      },
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the message',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the message was last modified',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the message was read',
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the conversation this message belongs to',
      references: {
        model: 'Conversations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who sent the message',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who received the message',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'Message',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['conversationId'],
      },
      {
        fields: ['senderId'],
      },
      {
        fields: ['recipientId'],
      },
      {
        fields: ['readAt'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['updatedAt'],
      },
      {
        fields: ['type', 'status'],
      },
      {
        fields: ['conversationId', 'createdAt'],
      },
      {
        fields: ['senderId', 'recipientId'],
      },
    ],
    hooks: {
      beforeCreate: async (message) => {
        message.lastModifiedAt = new Date();
        if (!message.metadata) {
          message.metadata = {};
        }
        if (!message.tags) {
          message.tags = [];
        }
        if (!message.attachments) {
          message.attachments = [];
        }
      },
      beforeUpdate: async (message) => {
        message.lastModifiedAt = new Date();
        if (message.changed('content') || message.changed('type') || message.changed('attachments')) {
          message.version += 1;
        }
      },
    },
  }
);

Message.associate = function(models) {
  Message.belongsTo(models.Conversation, {
    foreignKey: 'conversationId',
    as: 'conversation',
    onDelete: 'CASCADE',
  });
  
  Message.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender',
    onDelete: 'CASCADE',
  });
  
  Message.belongsTo(models.User, {
    foreignKey: 'recipientId',
    as: 'recipient',
    onDelete: 'SET NULL',
  });
};

module.exports = Message; 