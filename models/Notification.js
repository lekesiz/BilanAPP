const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('system', 'user', 'appointment', 'document', 'message', 'task', 'alert', 'reminder'),
      allowNull: false,
      defaultValue: 'system',
    },
    status: {
      type: DataTypes.ENUM('unread', 'read', 'archived', 'deleted', 'action_required'),
      allowNull: false,
      defaultValue: 'unread',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
    },
    channel: {
      type: DataTypes.ENUM('email', 'push', 'sms', 'in_app', 'webhook'),
      allowNull: false,
      defaultValue: 'in_app',
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actionTakenAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isSticky: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value));
      },
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          description: '',
          customFields: {},
          history: {
            statusChanges: [],
            deliveryAttempts: [],
            actionHistory: []
          },
          actions: {
            available: [],
            taken: [],
            required: [],
            custom: []
          },
          statistics: {
            deliveryCount: 0,
            readCount: 0,
            actionCount: 0,
            responseTime: 0,
            engagementRate: 0
          },
          settings: {
            deliveryRetry: 3,
            deliveryInterval: 300,
            maxDeliveryAttempts: 5,
            customSettings: {}
          }
        };
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value));
      },
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['expiresAt'],
      },
      {
        fields: ['isSticky'],
      },
      {
        fields: ['userId', 'type', 'status'],
      },
      {
        fields: ['type', 'status'],
      },
      {
        fields: ['priority', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (notification) => {
        notification.lastModifiedAt = new Date();
        if (!notification.metadata) {
          notification.metadata = {
            description: '',
            customFields: {},
            history: {
              statusChanges: [],
              deliveryAttempts: [],
              actionHistory: []
            },
            actions: {
              available: [],
              taken: [],
              required: [],
              custom: []
            },
            statistics: {
              deliveryCount: 0,
              readCount: 0,
              actionCount: 0,
              responseTime: 0,
              engagementRate: 0
            },
            settings: {
              deliveryRetry: 3,
              deliveryInterval: 300,
              maxDeliveryAttempts: 5,
              customSettings: {}
            }
          };
        }
        if (!notification.tags) {
          notification.tags = [];
        }
      },
      beforeUpdate: async (notification) => {
        notification.lastModifiedAt = new Date();
        if (notification.changed('status')) {
          const metadata = notification.metadata;
          metadata.history.statusChanges.push({
            date: new Date(),
            oldStatus: notification.previous('status'),
            newStatus: notification.status,
            changedBy: notification.userId
          });
          notification.metadata = metadata;
        }
        if (notification.changed('status') && notification.status === 'read') {
          notification.readAt = new Date();
        }
        if (notification.changed('status') && notification.status === 'action_required') {
          notification.actionTakenAt = new Date();
        }
      },
    },
  },
);

Notification.associate = function(models) {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
};

module.exports = Notification; 