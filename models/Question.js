const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Question extends Model {}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the question',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The question text',
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
      comment: 'Type of the question',
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the question is required',
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order of the question in the questionnaire',
    },
    options: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Options for choice/multiple_choice questions',
      get() {
        const rawValue = this.getDataValue('options');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('options', JSON.stringify(value || []));
      },
    },
    validation: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Validation rules for the question',
      get() {
        const rawValue = this.getDataValue('validation');
        return rawValue ? JSON.parse(rawValue) : {
          required: false,
          min: null,
          max: null,
          pattern: null,
          format: null,
          custom: null,
          errorMessage: null
        };
      },
      set(value) {
        this.setDataValue('validation', JSON.stringify(value || {}));
      },
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the question',
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
      comment: 'Tags associated with the question',
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
      comment: 'Version of the question',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the question was last modified',
    },
    questionnaireId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the questionnaire this question belongs to',
      references: {
        model: 'Questionnaires',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who created the question',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Question',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['required'],
      },
      {
        fields: ['order'],
      },
      {
        fields: ['version'],
      },
      {
        fields: ['questionnaireId'],
      },
      {
        fields: ['createdBy'],
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
        fields: ['type', 'required'],
      },
      {
        fields: ['questionnaireId', 'order'],
      },
    ],
    hooks: {
      beforeCreate: async (question) => {
        question.lastModifiedAt = new Date();
        if (!question.options) {
          question.options = [];
        }
        if (!question.validation) {
          question.validation = {
            required: false,
            min: null,
            max: null,
            pattern: null,
            format: null,
            custom: null,
            errorMessage: null
          };
        }
        if (!question.metadata) {
          question.metadata = {};
        }
        if (!question.tags) {
          question.tags = [];
        }
      },
      beforeUpdate: async (question) => {
        question.lastModifiedAt = new Date();
        if (question.changed('text') || question.changed('type') || question.changed('options')) {
          question.version += 1;
        }
      },
    },
  }
);

Question.associate = function(models) {
  Question.belongsTo(models.Questionnaire, {
    foreignKey: 'questionnaireId',
    as: 'questionnaire',
    onDelete: 'CASCADE',
  });
  
  Question.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator',
    onDelete: 'CASCADE',
  });
  
  Question.hasMany(models.Answer, {
    foreignKey: 'questionId',
    as: 'answers',
    onDelete: 'CASCADE',
  });
};

module.exports = Question; 