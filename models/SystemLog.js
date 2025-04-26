const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class SystemLog extends Model {}

SystemLog.init(
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
    level: {
      type: DataTypes.ENUM('debug', 'info', 'warning', 'error', 'critical', 'security', 'audit'),
      allowNull: false,
      defaultValue: 'info',
    },
    category: {
      type: DataTypes.ENUM('system', 'security', 'performance', 'database', 'api', 'integration', 'user', 'application'),
      allowNull: false,
      defaultValue: 'system',
    },
    status: {
      type: DataTypes.ENUM('active', 'resolved', 'archived', 'suppressed'),
      allowNull: false,
      defaultValue: 'active',
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('context');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('context', JSON.stringify(value));
      },
    },
    stackTrace: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolution: {
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
            resolutionHistory: [],
            relatedLogs: []
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
    modelName: 'SystemLog',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['level'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['source'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['level', 'category', 'createdAt'],
      },
      {
        fields: ['status', 'createdAt'],
      },
      {
        fields: ['source', 'createdAt'],
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
              resolutionHistory: [],
              relatedLogs: []
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
        if (!log.context) {
          log.context = {};
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
        if (log.changed('resolution')) {
          const metadata = log.metadata;
          metadata.history.resolutionHistory.push({
            date: new Date(),
            resolution: log.resolution,
            resolvedBy: log.userId
          });
          log.metadata = metadata;
        }
      },
    },
  },
);

SystemLog.associate = function(models) {
  SystemLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
  });
};

module.exports = SystemLog; 