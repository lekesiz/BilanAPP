const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Migration extends Model {}

Migration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the migration',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Name of the migration',
    },
    type: {
      type: DataTypes.ENUM('up', 'down', 'seed'),
      allowNull: false,
      comment: 'Type of migration',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'rolled_back'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of the migration',
    },
    batch: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Batch number of the migration',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the migration',
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
      comment: 'Tags associated with the migration',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the migration started',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the migration completed',
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
      comment: 'When the migration was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the migration',
    },
  },
  {
    sequelize,
    modelName: 'Migration',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['batch'],
      },
      {
        fields: ['startedAt'],
      },
      {
        fields: ['completedAt'],
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
        fields: ['batch', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (migration) => {
        migration.lastModifiedAt = new Date();
        if (!migration.metadata) {
          migration.metadata = {};
        }
        if (!migration.tags) {
          migration.tags = [];
        }
      },
      beforeUpdate: async (migration) => {
        migration.lastModifiedAt = new Date();
        if (migration.changed('status') || migration.changed('batch')) {
          migration.version += 1;
        }
      },
    },
  },
);

module.exports = Migration; 