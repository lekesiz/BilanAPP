const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Questionnaire extends Model {}

Questionnaire.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Title of the questionnaire',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the questionnaire',
    },
    category: {
      type: DataTypes.ENUM(
        'professional_interests',
        'motivation',
        'personality',
        'technical_skills',
        'soft_skills',
        'values',
        'career_goals',
        'work_preferences',
        'learning_style',
        'other'
      ),
      allowNull: true,
      comment: 'Category of the questionnaire',
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed', 'archived', 'deleted'),
      defaultValue: 'draft',
      allowNull: false,
      comment: 'Status of the questionnaire',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the questionnaire',
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this is a template questionnaire',
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated completion time in minutes',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Due date for completion',
    },
    questions: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Questions in JSON format',
      get() {
        const rawValue = this.getDataValue('questions');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('questions', JSON.stringify(value || []));
      },
    },
    responses: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Responses in JSON format',
      get() {
        const rawValue = this.getDataValue('responses');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('responses', JSON.stringify(value || []));
      },
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Tags in JSON format',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata in JSON format',
      get() {
        const rawValue = this.getDataValue('metadata');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('metadata', JSON.stringify(value || {}));
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who created the questionnaire',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the beneficiary this questionnaire is for',
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the questionnaire was completed',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the questionnaire was last modified',
    },
    aiAnalysisId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the AI analysis that generated this questionnaire',
      references: {
        model: 'AiAnalysis',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'en',
      comment: 'Language of the questionnaire',
    },
    scoring: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Scoring rules and configuration',
      get() {
        const rawValue = this.getDataValue('scoring');
        return rawValue ? JSON.parse(rawValue) : {
          method: 'sum',
          weights: {},
          thresholds: {},
          categories: {}
        };
      },
      set(value) {
        this.setDataValue('scoring', JSON.stringify(value || {}));
      },
    },
    validation: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Validation rules for questions and responses',
      get() {
        const rawValue = this.getDataValue('validation');
        return rawValue ? JSON.parse(rawValue) : {
          required: [],
          patterns: {},
          minLength: {},
          maxLength: {},
          custom: {}
        };
      },
      set(value) {
        this.setDataValue('validation', JSON.stringify(value || {}));
      },
    },
    changeHistory: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'History of changes to the questionnaire',
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
    modelName: 'Questionnaire',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['isTemplate'],
      },
      {
        fields: ['createdBy'],
      },
      {
        fields: ['beneficiaryId'],
      },
      {
        fields: ['dueDate'],
      },
      {
        fields: ['completedAt'],
      },
      {
        fields: ['lastModifiedAt'],
      },
      {
        fields: ['aiAnalysisId'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['updatedAt'],
      },
      {
        fields: ['language'],
      },
      {
        fields: ['status', 'category'],
      },
      {
        fields: ['isTemplate', 'language'],
      },
      {
        fields: ['createdBy', 'status'],
      },
      {
        fields: ['beneficiaryId', 'status'],
      },
    ],
    hooks: {
      beforeCreate: async (questionnaire) => {
        questionnaire.lastModifiedAt = new Date();
        if (!questionnaire.questions) {
          questionnaire.questions = [];
        }
        if (!questionnaire.responses) {
          questionnaire.responses = [];
        }
        if (!questionnaire.tags) {
          questionnaire.tags = [];
        }
        if (!questionnaire.metadata) {
          questionnaire.metadata = {};
        }
        if (!questionnaire.scoring) {
          questionnaire.scoring = {
            method: 'sum',
            weights: {},
            thresholds: {},
            categories: {}
          };
        }
        if (!questionnaire.validation) {
          questionnaire.validation = {
            required: [],
            patterns: {},
            minLength: {},
            maxLength: {},
            custom: {}
          };
        }
        if (!questionnaire.changeHistory) {
          questionnaire.changeHistory = [];
        }
      },
      beforeUpdate: async (questionnaire) => {
        questionnaire.lastModifiedAt = new Date();
        if (questionnaire.changed('questions') || questionnaire.changed('responses')) {
          questionnaire.version += 1;
          
          // Add change to history
          const changeHistory = questionnaire.changeHistory || [];
          changeHistory.push({
            timestamp: new Date(),
            userId: questionnaire.lastModifiedBy,
            changes: {
              questions: questionnaire.changed('questions') ? {
                old: questionnaire._previousDataValues.questions,
                new: questionnaire.questions
              } : null,
              responses: questionnaire.changed('responses') ? {
                old: questionnaire._previousDataValues.responses,
                new: questionnaire.responses
              } : null
            },
            reason: 'update'
          });
          questionnaire.changeHistory = changeHistory;
        }
      },
    },
  }
);

Questionnaire.associate = function(models) {
  Questionnaire.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator',
    onDelete: 'CASCADE',
  });
  
  Questionnaire.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
    onDelete: 'SET NULL',
  });
  
  Questionnaire.belongsTo(models.AiAnalysis, {
    foreignKey: 'aiAnalysisId',
    as: 'aiAnalysis',
    onDelete: 'SET NULL',
  });
};

module.exports = Questionnaire;
