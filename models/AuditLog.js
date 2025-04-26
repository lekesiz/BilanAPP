const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the audit log',
    },
    action: {
      type: DataTypes.ENUM(
        'create',
        'update',
        'delete',
        'login',
        'logout',
        'password_change',
        'role_change',
        'permission_change',
        'system_config_change',
        'file_upload',
        'file_download',
        'export',
        'import',
        'backup',
        'restore',
        'api_call',
        'data_access',
        'security_event',
        'system_event',
        'other'
      ),
      allowNull: false,
      comment: 'Type of audit action',
    },
    entityType: {
      type: DataTypes.ENUM(
        'user',
        'beneficiary',
        'document',
        'appointment',
        'questionnaire',
        'notification',
        'activity_log',
        'feedback',
        'audit_log',
        'system_log',
        'setting',
        'email_template',
        'other'
      ),
      allowNull: true,
      comment: 'Type of the entity affected by the action',
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the entity affected by the action',
    },
    status: {
      type: DataTypes.ENUM('success', 'failure', 'warning'),
      allowNull: false,
      defaultValue: 'success',
      comment: 'Status of the action',
    },
    changes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Details of the changes made',
      get() {
        const rawValue = this.getDataValue('changes');
        return rawValue ? JSON.parse(rawValue) : {
          before: {},
          after: {},
          fields: [],
          type: 'update'
        };
      },
      set(value) {
        this.setDataValue('changes', JSON.stringify(value || {}));
      },
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP address of the user',
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'User agent/browser information',
    },
    targetUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user affected by the action',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if the action failed',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the audit action',
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
      comment: 'Tags associated with the audit action',
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
      allowNull: true,
      comment: 'ID of the user who performed the action',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the audit log was last modified',
    },
    duration: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Duration of the action in milliseconds',
    },
    requestId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'ID of the request that triggered the action',
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['action'],
      },
      {
        fields: ['entityType'],
      },
      {
        fields: ['entityType', 'entityId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['targetUserId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['requestId'],
        unique: true,
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['updatedAt'],
      },
      {
        fields: ['action', 'status'],
      },
      {
        fields: ['entityType', 'status'],
      },
      {
        fields: ['userId', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (auditLog) => {
        auditLog.lastModifiedAt = new Date();
        if (!auditLog.changes) {
          auditLog.changes = {
            before: {},
            after: {},
            fields: [],
            type: 'update'
          };
        }
        if (!auditLog.metadata) {
          auditLog.metadata = {};
        }
        if (!auditLog.tags) {
          auditLog.tags = [];
        }
        if (!auditLog.duration) {
          auditLog.duration = 0;
        }
      },
      beforeUpdate: async (auditLog) => {
        auditLog.lastModifiedAt = new Date();
      },
    },
  }
);

AuditLog.associate = function(models) {
  AuditLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
  });
  AuditLog.belongsTo(models.User, {
    foreignKey: 'targetUserId',
    as: 'targetUser',
    onDelete: 'SET NULL',
  });
};

module.exports = AuditLog; 