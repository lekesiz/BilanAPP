const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Backup extends Model {}

Backup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the backup',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of the backup',
    },
    type: {
      type: DataTypes.ENUM('full', 'incremental', 'differential'),
      allowNull: false,
      comment: 'Type of backup',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'deleted'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of the backup',
    },
    storageType: {
      type: DataTypes.ENUM('local', 's3', 'google_drive', 'dropbox'),
      allowNull: false,
      defaultValue: 'local',
      comment: 'Storage type for the backup',
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Backup file path',
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Backup size in bytes',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the backup',
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
      comment: 'Tags associated with the backup',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who initiated the backup',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the backup started',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the backup completed',
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
      comment: 'When the backup was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the backup',
    },
  },
  {
    sequelize,
    modelName: 'Backup',
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
        fields: ['storageType'],
      },
      {
        fields: ['userId'],
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
        fields: ['storageType', 'status'],
      },
      {
        fields: ['userId', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (backup) => {
        backup.lastModifiedAt = new Date();
        if (!backup.metadata) {
          backup.metadata = {};
        }
        if (!backup.tags) {
          backup.tags = [];
        }
      },
      beforeUpdate: async (backup) => {
        backup.lastModifiedAt = new Date();
        if (backup.changed('status') || backup.changed('path')) {
          backup.version += 1;
        }
      },
    },
  },
);

Backup.associate = function(models) {
  Backup.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
};

module.exports = Backup; 