const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Settings extends Model {}

Settings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
      type: DataTypes.ENUM('system', 'user', 'organization', 'module', 'feature', 'integration'),
      allowNull: false,
      defaultValue: 'system',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deprecated', 'experimental'),
      allowNull: false,
      defaultValue: 'active',
    },
    scope: {
      type: DataTypes.ENUM('global', 'user', 'role', 'department', 'project'),
      allowNull: false,
      defaultValue: 'global',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('value');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('value', JSON.stringify(value));
      },
    },
    defaultValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('defaultValue');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('defaultValue', JSON.stringify(value));
      },
    },
    validationRules: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('validationRules');
        return rawValue ? JSON.parse(rawValue) : {
          type: 'string',
          required: true,
          minLength: null,
          maxLength: null,
          pattern: null,
          enum: [],
          format: null,
          customRules: []
        };
      },
      set(value) {
        this.setDataValue('validationRules', JSON.stringify(value));
      },
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
            valueChanges: [],
            statusChanges: [],
            versionHistory: []
          },
          statistics: {
            usageCount: 0,
            lastUsed: null,
            averageValue: null,
            customStats: {}
          },
          dependencies: {
            requiredBy: [],
            dependsOn: [],
            conflictsWith: [],
            customDeps: {}
          },
          customization: {
            options: [],
            presets: [],
            templates: [],
            customOptions: {}
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
    modelName: 'Settings',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['key'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['scope'],
      },
      {
        fields: ['isRequired'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['key', 'type', 'scope'],
        unique: true,
      },
      {
        fields: ['type', 'status'],
      },
      {
        fields: ['scope', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (setting) => {
        setting.lastModifiedAt = new Date();
        if (!setting.metadata) {
          setting.metadata = {
            description: '',
            customFields: {},
            history: {
              valueChanges: [],
              statusChanges: [],
              versionHistory: []
            },
            statistics: {
              usageCount: 0,
              lastUsed: null,
              averageValue: null,
              customStats: {}
            },
            dependencies: {
              requiredBy: [],
              dependsOn: [],
              conflictsWith: [],
              customDeps: {}
            },
            customization: {
              options: [],
              presets: [],
              templates: [],
              customOptions: {}
            }
          };
        }
        if (!setting.tags) {
          setting.tags = [];
        }
        if (!setting.validationRules) {
          setting.validationRules = {
            type: 'string',
            required: true,
            minLength: null,
            maxLength: null,
            pattern: null,
            enum: [],
            format: null,
            customRules: []
          };
        }
      },
      beforeUpdate: async (setting) => {
        setting.lastModifiedAt = new Date();
        if (setting.changed('value')) {
          const metadata = setting.metadata;
          metadata.history.valueChanges.push({
            date: new Date(),
            oldValue: setting.previous('value'),
            newValue: setting.value,
            changedBy: setting.userId
          });
          setting.metadata = metadata;
        }
        if (setting.changed('status')) {
          const metadata = setting.metadata;
          metadata.history.statusChanges.push({
            date: new Date(),
            oldStatus: setting.previous('status'),
            newStatus: setting.status,
            changedBy: setting.userId
          });
          setting.metadata = metadata;
        }
        if (setting.changed('version')) {
          const metadata = setting.metadata;
          metadata.history.versionHistory.push({
            date: new Date(),
            oldVersion: setting.previous('version'),
            newVersion: setting.version,
            changedBy: setting.userId
          });
          setting.metadata = metadata;
        }
      },
    },
  },
);

Settings.associate = function(models) {
  Settings.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
};

module.exports = Settings; 