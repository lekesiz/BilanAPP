const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Webhook extends Model {}

Webhook.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the webhook',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of the webhook',
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Webhook URL',
    },
    type: {
      type: DataTypes.ENUM('incoming', 'outgoing', 'system', 'integration', 'custom'),
      allowNull: false,
      comment: 'Type of webhook',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'error', 'maintenance', 'pending', 'testing'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Status of the webhook',
    },
    events: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Events to listen for',
      get() {
        const rawValue = this.getDataValue('events');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('events', JSON.stringify(value || []));
      },
    },
    config: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Webhook configuration',
      get() {
        const rawValue = this.getDataValue('config');
        return rawValue ? JSON.parse(rawValue) : {
          headers: {},
          auth: {},
          retry: {
            enabled: true,
            maxAttempts: 3,
            delay: 1000
          },
          validation: {
            enabled: true,
            secret: null,
            algorithm: 'sha256'
          },
          timeout: 5000
        };
      },
      set(value) {
        this.setDataValue('config', JSON.stringify(value || {}));
      },
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the webhook',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          description: '',
          environment: 'production',
          owner: null,
          team: null,
          documentation: null,
          monitoring: {
            enabled: true,
            threshold: 3,
            period: '1h'
          },
          statistics: {
            totalCalls: 0,
            successRate: 0,
            averageResponseTime: 0,
            lastResponseTime: 0
          }
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
      comment: 'Tags associated with the webhook',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    integrationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the related integration',
      references: {
        model: 'Integrations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    lastTriggeredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last successful trigger timestamp',
    },
    lastErrorAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last error timestamp',
    },
    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Last error message',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the webhook was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the webhook',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Priority level of the webhook',
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of retry attempts',
    },
    timeout: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5000,
      comment: 'Timeout in milliseconds',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the webhook is active',
    },
  },
  {
    sequelize,
    modelName: 'Webhook',
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
        fields: ['integrationId'],
      },
      {
        fields: ['lastTriggeredAt'],
      },
      {
        fields: ['lastErrorAt'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['version'],
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
        fields: ['integrationId', 'status'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['type', 'priority'],
      },
      {
        fields: ['status', 'isActive'],
      },
    ],
    hooks: {
      beforeCreate: async (webhook) => {
        webhook.lastModifiedAt = new Date();
        if (!webhook.events) {
          webhook.events = [];
        }
        if (!webhook.config) {
          webhook.config = {
            headers: {},
            auth: {},
            retry: {
              enabled: true,
              maxAttempts: 3,
              delay: 1000
            },
            validation: {
              enabled: true,
              secret: null,
              algorithm: 'sha256'
            },
            timeout: 5000
          };
        }
        if (!webhook.metadata) {
          webhook.metadata = {
            description: '',
            environment: 'production',
            owner: null,
            team: null,
            documentation: null,
            monitoring: {
              enabled: true,
              threshold: 3,
              period: '1h'
            },
            statistics: {
              totalCalls: 0,
              successRate: 0,
              averageResponseTime: 0,
              lastResponseTime: 0
            }
          };
        }
        if (!webhook.tags) {
          webhook.tags = [];
        }
      },
      beforeUpdate: async (webhook) => {
        webhook.lastModifiedAt = new Date();
        if (webhook.changed('config') || webhook.changed('status') || webhook.changed('events')) {
          webhook.version += 1;
        }
      },
    },
  },
);

Webhook.associate = function(models) {
  Webhook.belongsTo(models.Integration, {
    foreignKey: 'integrationId',
    as: 'integration',
    onDelete: 'CASCADE',
  });
};

module.exports = Webhook; 