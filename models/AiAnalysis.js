const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class AiAnalysis extends Model {}

AiAnalysis.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        'competency_analysis',
        'career_explorer',
        'skill_assessment',
        'personality_analysis',
        'motivation_analysis',
        'learning_style',
        'work_preferences',
        'job_market_analysis',
        'education_path',
        'other'
      ),
      allowNull: false,
      comment: 'Type of analysis',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'archived'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of the analysis',
    },
    input: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Input data for the analysis (JSON string)',
      get() {
        const rawValue = this.getDataValue('input');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('input', JSON.stringify(value || {}));
      },
    },
    results: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Results of the analysis (JSON string)',
      get() {
        const rawValue = this.getDataValue('results');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('results', JSON.stringify(value || {}));
      },
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the analysis (JSON string)',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value || {}));
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who requested the analysis',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the beneficiary for whom the analysis was performed (if applicable)',
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    creditCost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of credits charged for this analysis',
    },
    isSaved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the analysis has been saved to beneficiary records',
    },
    processingTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Processing time in milliseconds',
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if the analysis failed',
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of times the analysis has been retried',
    },
    lastRetryAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of the last retry attempt',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the analysis was completed',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the analysis was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the analysis',
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Tags associated with the analysis (JSON string)',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Context information for the analysis (JSON string)',
      get() {
        const rawValue = this.getDataValue('context');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('context', JSON.stringify(value || {}));
      },
    },
    requestId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'Unique identifier for the analysis request',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Priority level of the analysis',
    },
    duration: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Duration of the analysis in milliseconds',
    },
  },
  {
    sequelize,
    modelName: 'AiAnalysis',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['beneficiaryId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['isSaved'],
      },
      {
        fields: ['completedAt'],
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
        fields: ['requestId'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['type', 'status'],
      },
      {
        fields: ['userId', 'status'],
      },
      {
        fields: ['beneficiaryId', 'status'],
      },
      {
        fields: ['priority', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (analysis) => {
        analysis.lastModifiedAt = new Date();
        if (!analysis.metadata) {
          analysis.metadata = {};
        }
        if (!analysis.tags) {
          analysis.tags = [];
        }
        if (!analysis.context) {
          analysis.context = {};
        }
      },
      beforeUpdate: async (analysis) => {
        analysis.lastModifiedAt = new Date();
        if (analysis.changed('results') || analysis.changed('status')) {
          analysis.version += 1;
        }
      },
    },
  },
);

AiAnalysis.associate = function(models) {
  AiAnalysis.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
  });
  AiAnalysis.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
    onDelete: 'SET NULL',
  });
};

module.exports = AiAnalysis;
