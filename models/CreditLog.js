const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CreditLog extends Model {}

CreditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the credit log',
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Amount of credits',
    },
    type: {
      type: DataTypes.ENUM(
        'purchase',
        'refund',
        'bonus',
        'penalty',
        'expiration',
        'transfer',
        'adjustment',
        'other'
      ),
      allowNull: false,
      comment: 'Type of the credit transaction',
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of the credit transaction',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the credit transaction',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the credit transaction',
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
      comment: 'Tags associated with the credit transaction',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the credit log',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the credit log was last modified',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the credit transaction was processed',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who owns the credit log',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who processed the credit transaction',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the related entity (e.g. appointment, questionnaire)',
    },
    relatedType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of the related entity',
    },
  },
  {
    sequelize,
    modelName: 'CreditLog',
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
        fields: ['amount'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['processedBy'],
      },
      {
        fields: ['processedAt'],
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
      {
        fields: ['type', 'status'],
      },
      {
        fields: ['userId', 'type'],
      },
      {
        fields: ['relatedId', 'relatedType'],
      },
    ],
    hooks: {
      beforeCreate: async (creditLog) => {
        creditLog.lastModifiedAt = new Date();
        if (!creditLog.metadata) {
          creditLog.metadata = {};
        }
        if (!creditLog.tags) {
          creditLog.tags = [];
        }
      },
      beforeUpdate: async (creditLog) => {
        creditLog.lastModifiedAt = new Date();
        if (creditLog.changed('status') || creditLog.changed('amount')) {
          creditLog.version += 1;
        }
      },
    },
  }
);

CreditLog.associate = function(models) {
  CreditLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
  
  CreditLog.belongsTo(models.User, {
    foreignKey: 'processedBy',
    as: 'processor',
    onDelete: 'SET NULL',
  });
};

module.exports = CreditLog; 