const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Feedback extends Model {}

Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the feedback',
    },
    type: {
      type: DataTypes.ENUM(
        'bug_report',
        'feature_request',
        'improvement',
        'general_feedback',
        'other'
      ),
      allowNull: false,
      comment: 'Type of feedback',
    },
    status: {
      type: DataTypes.ENUM(
        'new',
        'in_review',
        'planned',
        'in_progress',
        'completed',
        'rejected',
        'deleted'
      ),
      allowNull: false,
      defaultValue: 'new',
      comment: 'Status of the feedback',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Priority level of the feedback',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Title of the feedback',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Detailed description of the feedback',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'User rating (1-5)',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the feedback',
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
      comment: 'Tags associated with the feedback',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user assigned to handle the feedback',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the feedback was resolved',
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Details of how the feedback was resolved',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who submitted the feedback',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the beneficiary related to the feedback',
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the feedback was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the feedback',
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Attachments associated with the feedback',
      get() {
        const rawValue = this.getDataValue('attachments');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('attachments', JSON.stringify(value || []));
      },
    },
  },
  {
    sequelize,
    modelName: 'Feedback',
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
        fields: ['priority'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['beneficiaryId'],
      },
      {
        fields: ['assignedTo'],
      },
      {
        fields: ['resolvedAt'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['updatedAt'],
      },
    ],
    hooks: {
      beforeCreate: async (feedback) => {
        feedback.lastModifiedAt = new Date();
        if (!feedback.metadata) {
          feedback.metadata = {};
        }
        if (!feedback.tags) {
          feedback.tags = [];
        }
        if (!feedback.attachments) {
          feedback.attachments = [];
        }
      },
      beforeUpdate: async (feedback) => {
        feedback.lastModifiedAt = new Date();
        if (feedback.changed('status') && feedback.status === 'completed' && !feedback.resolvedAt) {
          feedback.resolvedAt = new Date();
        }
      },
    },
  }
);

Feedback.associate = function(models) {
  Feedback.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
  });
  Feedback.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
    onDelete: 'SET NULL',
  });
  Feedback.belongsTo(models.User, {
    foreignKey: 'assignedTo',
    as: 'assignee',
    onDelete: 'SET NULL',
  });
};

module.exports = Feedback; 