const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ActivityLog extends Model {}

ActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    action: {
      type: DataTypes.ENUM(
        'create', 'read', 'update', 'delete',
        'login', 'logout', 'search', 'export',
        'import', 'share', 'comment', 'like',
        'follow', 'unfollow', 'subscribe', 'unsubscribe',
        'approve', 'reject', 'assign', 'unassign',
        'complete', 'cancel'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('success', 'failure', 'pending', 'cancelled', 'in_progress'),
      allowNull: false,
      defaultValue: 'success',
    },
    type: {
      type: DataTypes.ENUM('user', 'system', 'admin', 'api', 'integration', 'security', 'audit'),
      allowNull: false,
      defaultValue: 'user',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
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
            actionHistory: [],
            relatedActivities: []
          },
          performance: {
            responseTime: null,
            memoryUsage: null,
            cpuUsage: null,
            customMetrics: {}
          },
          relatedRecords: {
            userIds: [],
            documentIds: [],
            transactionIds: [],
            customIds: {}
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
    modelName: 'ActivityLog',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['action'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['action', 'type', 'createdAt'],
      },
      {
        fields: ['status', 'createdAt'],
      },
      {
        fields: ['userId', 'createdAt'],
      },
    ],
    hooks: {
      beforeCreate: async (log) => {
        log.lastModifiedAt = new Date();
        if (!log.metadata) {
          log.metadata = {
            description: '',
            customFields: {},
            history: {
              statusChanges: [],
              actionHistory: [],
              relatedActivities: []
            },
            performance: {
              responseTime: null,
              memoryUsage: null,
              cpuUsage: null,
              customMetrics: {}
            },
            relatedRecords: {
              userIds: [],
              documentIds: [],
              transactionIds: [],
              customIds: {}
            }
          };
        }
        if (!log.tags) {
          log.tags = [];
        }
      },
      beforeUpdate: async (log) => {
        log.lastModifiedAt = new Date();
        if (log.changed('status')) {
          const metadata = log.metadata;
          metadata.history.statusChanges.push({
            date: new Date(),
            oldStatus: log.previous('status'),
            newStatus: log.status,
            changedBy: log.userId
          });
          log.metadata = metadata;
        }
        if (log.changed('action')) {
          const metadata = log.metadata;
          metadata.history.actionHistory.push({
            date: new Date(),
            oldAction: log.previous('action'),
            newAction: log.action,
            changedBy: log.userId
          });
          log.metadata = metadata;
        }
      },
    },
  },
);

ActivityLog.associate = function(models) {
  ActivityLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
  });
};

module.exports = ActivityLog; 