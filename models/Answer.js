const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Answer extends Model {}

Answer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the answer',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The answer value',
    },
    type: {
      type: DataTypes.ENUM(
        'text',
        'number',
        'boolean',
        'choice',
        'multiple_choice',
        'rating',
        'date',
        'time',
        'datetime',
        'file',
        'location',
        'other'
      ),
      allowNull: false,
      defaultValue: 'text',
      comment: 'Type of the answer',
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'reviewed', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'draft',
      comment: 'Status of the answer',
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Score for the answer if applicable',
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the answer',
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
      comment: 'Tags associated with the answer',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Attachments associated with the answer',
      get() {
        const rawValue = this.getDataValue('attachments');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('attachments', JSON.stringify(value || []));
      },
    },
    validation: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Validation rules and results',
      get() {
        const rawValue = this.getDataValue('validation');
        return rawValue ? JSON.parse(rawValue) : {
          isValid: true,
          errors: [],
          warnings: [],
          rules: {}
        };
      },
      set(value) {
        this.setDataValue('validation', JSON.stringify(value || {}));
      },
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the answer',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the answer was last modified',
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the answer was submitted',
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the answer was reviewed',
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who reviewed the answer',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the question this answer belongs to',
      references: {
        model: 'Questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    questionnaireId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the questionnaire this answer belongs to',
      references: {
        model: 'Questionnaires',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the beneficiary who provided the answer',
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who provided the answer',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'Answer',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['questionId'],
      },
      {
        fields: ['questionnaireId'],
      },
      {
        fields: ['beneficiaryId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['reviewedBy'],
      },
      {
        fields: ['submittedAt'],
      },
      {
        fields: ['reviewedAt'],
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
        fields: ['status', 'type'],
      },
      {
        fields: ['questionnaireId', 'beneficiaryId'],
      },
      {
        fields: ['questionId', 'beneficiaryId'],
      },
    ],
    hooks: {
      beforeCreate: async (answer) => {
        answer.lastModifiedAt = new Date();
        if (!answer.metadata) {
          answer.metadata = {};
        }
        if (!answer.tags) {
          answer.tags = [];
        }
        if (!answer.attachments) {
          answer.attachments = [];
        }
        if (!answer.validation) {
          answer.validation = {
            isValid: true,
            errors: [],
            warnings: [],
            rules: {}
          };
        }
      },
      beforeUpdate: async (answer) => {
        answer.lastModifiedAt = new Date();
        if (answer.changed('value') || answer.changed('status')) {
          answer.version += 1;
        }
      },
    },
  }
);

Answer.associate = function(models) {
  Answer.belongsTo(models.Question, {
    foreignKey: 'questionId',
    as: 'question',
    onDelete: 'CASCADE',
  });
  
  Answer.belongsTo(models.Questionnaire, {
    foreignKey: 'questionnaireId',
    as: 'questionnaire',
    onDelete: 'CASCADE',
  });
  
  Answer.belongsTo(models.Beneficiary, {
    foreignKey: 'beneficiaryId',
    as: 'beneficiary',
    onDelete: 'CASCADE',
  });
  
  Answer.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
  });
  
  Answer.belongsTo(models.User, {
    foreignKey: 'reviewedBy',
    as: 'reviewer',
    onDelete: 'SET NULL',
  });
};

module.exports = Answer; 