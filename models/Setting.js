const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Setting extends Model {}

Setting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the setting',
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Setting key',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Setting value',
      get() {
        const rawValue = this.getDataValue('value');
        const type = this.getDataValue('type');
        if (type === 'json' || type === 'array' || type === 'object') {
          return rawValue ? JSON.parse(rawValue) : null;
        }
        return rawValue;
      },
      set(value) {
        const type = this.getDataValue('type');
        if (type === 'json' || type === 'array' || type === 'object') {
          this.setDataValue('value', JSON.stringify(value));
        } else {
          this.setDataValue('value', value);
        }
      },
    },
    defaultValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Default value for the setting',
      get() {
        const rawValue = this.getDataValue('defaultValue');
        const type = this.getDataValue('type');
        if (type === 'json' || type === 'array' || type === 'object') {
          return rawValue ? JSON.parse(rawValue) : null;
        }
        return rawValue;
      },
      set(value) {
        const type = this.getDataValue('type');
        if (type === 'json' || type === 'array' || type === 'object') {
          this.setDataValue('defaultValue', JSON.stringify(value));
        } else {
          this.setDataValue('defaultValue', value);
        }
      },
    },
    type: {
      type: DataTypes.ENUM(
        'string',
        'number',
        'boolean',
        'json',
        'array',
        'object',
        'date',
        'time',
        'datetime',
        'other'
      ),
      allowNull: false,
      defaultValue: 'string',
      comment: 'Data type of the setting value',
    },
    category: {
      type: DataTypes.ENUM(
        'general',
        'system',
        'user',
        'security',
        'email',
        'notification',
        'storage',
        'payment',
        'api',
        'other'
      ),
      allowNull: false,
      defaultValue: 'general',
      comment: 'Category of the setting',
    },
    group: {
      type: DataTypes.ENUM(
        'core',
        'features',
        'integrations',
        'appearance',
        'localization',
        'performance',
        'maintenance',
        'other'
      ),
      allowNull: true,
      comment: 'Group of the setting',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the setting',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the setting is publicly accessible',
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the setting is a system setting',
    },
    isEditable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the setting can be edited',
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the setting value is encrypted',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the setting',
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
      comment: 'Tags associated with the setting',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    lastModifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who last modified the setting',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the setting was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the setting',
    },
    validation: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Validation rules for the setting value',
      get() {
        const rawValue = this.getDataValue('validation');
        return rawValue ? JSON.parse(rawValue) : {
          required: true,
          min: null,
          max: null,
          pattern: null,
          format: null,
          enum: null,
          custom: null,
          errorMessage: null
        };
      },
      set(value) {
        this.setDataValue('validation', JSON.stringify(value || {}));
      },
    },
    environment: {
      type: DataTypes.ENUM('development', 'staging', 'production'),
      allowNull: false,
      defaultValue: 'production',
      comment: 'Environment where the setting applies',
    },
    dependencies: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Other settings that this setting depends on',
      get() {
        const rawValue = this.getDataValue('dependencies');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('dependencies', JSON.stringify(value || []));
      },
    },
    changeHistory: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'History of changes to the setting',
      get() {
        const rawValue = this.getDataValue('changeHistory');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('changeHistory', JSON.stringify(value || []));
      },
    },
  },
  {
    sequelize,
    modelName: 'Setting',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['key'],
        unique: true,
      },
      {
        fields: ['category'],
      },
      {
        fields: ['group'],
      },
      {
        fields: ['isPublic'],
      },
      {
        fields: ['isSystem'],
      },
      {
        fields: ['isEditable'],
      },
      {
        fields: ['isEncrypted'],
      },
      {
        fields: ['lastModifiedBy'],
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
        fields: ['environment'],
      },
      {
        fields: ['category', 'group'],
      },
      {
        fields: ['isPublic', 'isSystem'],
      },
      {
        fields: ['isEditable', 'isEncrypted'],
      },
      {
        fields: ['environment', 'category'],
      },
    ],
    hooks: {
      beforeCreate: async (setting) => {
        setting.lastModifiedAt = new Date();
        if (!setting.metadata) {
          setting.metadata = {};
        }
        if (!setting.tags) {
          setting.tags = [];
        }
        if (!setting.validation) {
          setting.validation = {
            required: true,
            min: null,
            max: null,
            pattern: null,
            format: null,
            enum: null,
            custom: null,
            errorMessage: null
          };
        }
        if (!setting.dependencies) {
          setting.dependencies = [];
        }
        if (!setting.changeHistory) {
          setting.changeHistory = [];
        }
      },
      beforeUpdate: async (setting) => {
        setting.lastModifiedAt = new Date();
        setting.version += 1;
        
        // Add change to history
        const changeHistory = setting.changeHistory || [];
        changeHistory.push({
          timestamp: new Date(),
          userId: setting.lastModifiedBy,
          oldValue: setting._previousDataValues.value,
          newValue: setting.value,
          reason: 'update'
        });
        setting.changeHistory = changeHistory;
      },
    },
  }
);

Setting.associate = function(models) {
  Setting.belongsTo(models.User, {
    foreignKey: 'lastModifiedBy',
    as: 'modifier',
    onDelete: 'SET NULL',
  });
};

module.exports = Setting; 