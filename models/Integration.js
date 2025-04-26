const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Integration extends Model {}

Integration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the integration',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Name of the integration',
    },
    type: {
      type: DataTypes.ENUM('api', 'webhook', 'oauth', 'sdk', 'database', 'file', 'message_queue', 'other'),
      allowNull: false,
      comment: 'Type of integration',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'error', 'maintenance', 'pending', 'testing', 'deprecated'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Status of the integration',
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Integration provider',
    },
    version: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Version of the integration provider',
    },
    config: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Integration configuration',
      get() {
        const rawValue = this.getDataValue('config');
        return rawValue ? JSON.parse(rawValue) : {
          connection: {
            type: 'http',
            url: null,
            credentials: {
              type: 'api_key',
              key: null,
              secret: null
            },
            options: {
              timeout: 5000,
              retry: {
                enabled: true,
                maxAttempts: 3,
                delay: 1000
              }
            }
          },
          sync: {
            enabled: true,
            interval: '1h',
            direction: 'bidirectional',
            strategy: 'incremental'
          },
          validation: {
            enabled: true,
            schema: null,
            rules: []
          },
          mapping: {
            fields: {},
            transformations: []
          }
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
      comment: 'Additional metadata about the integration',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {
          description: '',
          documentation: null,
          environment: 'production',
          owner: null,
          team: null,
          support: {
            contact: null,
            documentation: null,
            statusPage: null
          },
          monitoring: {
            enabled: true,
            metrics: {
              uptime: 100,
              responseTime: 0,
              errorRate: 0
            },
            alerts: {
              enabled: true,
              threshold: 3,
              period: '1h'
            }
          },
          statistics: {
            totalSyncs: 0,
            successRate: 0,
            lastSyncDuration: 0,
            dataVolume: 0
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
      comment: 'Tags associated with the integration',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last successful sync timestamp',
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
      comment: 'When the integration was last modified',
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the integration',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Priority level of the integration',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the integration is active',
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of retry attempts',
    },
    syncInterval: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Sync interval in cron format',
    },
  },
  {
    sequelize,
    modelName: 'Integration',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
        unique: true,
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['provider'],
      },
      {
        fields: ['lastSyncAt'],
      },
      {
        fields: ['lastErrorAt'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['versionNumber'],
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
        fields: ['provider', 'status'],
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
      beforeCreate: async (integration) => {
        integration.lastModifiedAt = new Date();
        if (!integration.config) {
          integration.config = {
            connection: {
              type: 'http',
              url: null,
              credentials: {
                type: 'api_key',
                key: null,
                secret: null
              },
              options: {
                timeout: 5000,
                retry: {
                  enabled: true,
                  maxAttempts: 3,
                  delay: 1000
                }
              }
            },
            sync: {
              enabled: true,
              interval: '1h',
              direction: 'bidirectional',
              strategy: 'incremental'
            },
            validation: {
              enabled: true,
              schema: null,
              rules: []
            },
            mapping: {
              fields: {},
              transformations: []
            }
          };
        }
        if (!integration.metadata) {
          integration.metadata = {
            description: '',
            documentation: null,
            environment: 'production',
            owner: null,
            team: null,
            support: {
              contact: null,
              documentation: null,
              statusPage: null
            },
            monitoring: {
              enabled: true,
              metrics: {
                uptime: 100,
                responseTime: 0,
                errorRate: 0
              },
              alerts: {
                enabled: true,
                threshold: 3,
                period: '1h'
              }
            },
            statistics: {
              totalSyncs: 0,
              successRate: 0,
              lastSyncDuration: 0,
              dataVolume: 0
            }
          };
        }
        if (!integration.tags) {
          integration.tags = [];
        }
      },
      beforeUpdate: async (integration) => {
        integration.lastModifiedAt = new Date();
        if (integration.changed('config') || integration.changed('status') || integration.changed('version')) {
          integration.versionNumber += 1;
        }
      },
    },
  },
);

Integration.associate = function(models) {
  Integration.hasMany(models.Webhook, {
    foreignKey: 'integrationId',
    as: 'webhooks',
    onDelete: 'CASCADE',
  });
};

module.exports = Integration; 