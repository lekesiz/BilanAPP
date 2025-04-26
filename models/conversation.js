const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Conversation extends Model {}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: 'Unique identifier for the conversation',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Title of the conversation',
    },
    type: {
      type: DataTypes.ENUM('general', 'appointment', 'questionnaire', 'document', 'other'),
      allowNull: false,
      defaultValue: 'general',
      comment: 'Type of the conversation',
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of the last message',
    },
    messages: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Messages in JSON format',
      get() {
        const rawValue = this.getDataValue('messages');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('messages', JSON.stringify(value || []));
      },
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who started the conversation',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the beneficiary in the conversation',
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'deleted', 'pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Status of the conversation',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Priority level of the conversation',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration of the conversation in minutes',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata in JSON format',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          participants: [],
          attachments: [],
          settings: {},
          customFields: {},
          lastReadBy: {},
          readReceipts: []
        };
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value || {}));
      },
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Tags associated with the conversation',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the conversation is pinned',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the conversation was last modified',
    },
  },
  {
    sequelize,
    modelName: 'Conversation',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['senderId'],
      },
      {
        fields: ['beneficiaryId'],
      },
      {
        fields: ['lastMessageAt'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['isPinned'],
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
        fields: ['senderId', 'beneficiaryId'],
      },
      {
        fields: ['type', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (conversation) => {
        conversation.lastModifiedAt = new Date();
        if (!conversation.metadata) {
          conversation.metadata = {
            participants: [],
            attachments: [],
            settings: {},
            customFields: {},
            lastReadBy: {},
            readReceipts: []
          };
        }
        if (!conversation.tags) {
          conversation.tags = [];
        }
        if (!conversation.messages) {
          conversation.messages = [];
        }
      },
      beforeUpdate: async (conversation) => {
        conversation.lastModifiedAt = new Date();
      },
    },
  },
);

Conversation.associate = function(models) {
  Conversation.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender',
  });
  Conversation.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
  });
};

module.exports = Conversation; 