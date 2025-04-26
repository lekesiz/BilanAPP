const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class EmailTemplate extends Model {}

EmailTemplate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the email template',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Name of the email template',
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Email subject template',
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Email body template',
    },
    type: {
      type: DataTypes.ENUM(
        'notification',
        'alert',
        'reminder',
        'welcome',
        'password_reset',
        'verification',
        'invitation',
        'newsletter',
        'marketing',
        'transactional',
        'system',
        'other'
      ),
      allowNull: false,
      comment: 'Type of email template',
    },
    category: {
      type: DataTypes.ENUM(
        'general',
        'user',
        'system',
        'marketing',
        'transactional',
        'notification',
        'alert',
        'other'
      ),
      allowNull: false,
      defaultValue: 'general',
      comment: 'Category of the email template',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the email template',
    },
    variables: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Available variables in the template',
      get() {
        const rawValue = this.getDataValue('variables');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('variables', JSON.stringify(value || []));
      },
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      comment: 'Additional metadata about the template',
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
      comment: 'Tags associated with the template',
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the template is active',
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the template is a system template',
    },
    lastModifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who last modified the template',
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    lastModifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the template was last modified',
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Version of the template',
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'Attachments for the email template',
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
      comment: 'Validation rules for the template variables',
      get() {
        const rawValue = this.getDataValue('validation');
        return rawValue ? JSON.parse(rawValue) : {
          required: [],
          optional: [],
          formats: {},
          minLength: {},
          maxLength: {},
          patterns: {},
          custom: {}
        };
      },
      set(value) {
        this.setDataValue('validation', JSON.stringify(value || {}));
      },
    },
  },
  {
    sequelize,
    modelName: 'EmailTemplate',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
        unique: true,
      },
      {
        fields: ['type'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['isSystem'],
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
        fields: ['type', 'category'],
      },
      {
        fields: ['isActive', 'isSystem'],
      },
    ],
    hooks: {
      beforeCreate: async (template) => {
        template.lastModifiedAt = new Date();
        if (!template.variables) {
          template.variables = [];
        }
        if (!template.metadata) {
          template.metadata = {};
        }
        if (!template.tags) {
          template.tags = [];
        }
        if (!template.attachments) {
          template.attachments = [];
        }
        if (!template.validation) {
          template.validation = {
            required: [],
            optional: [],
            formats: {},
            minLength: {},
            maxLength: {},
            patterns: {},
            custom: {}
          };
        }
      },
      beforeUpdate: async (template) => {
        template.lastModifiedAt = new Date();
        if (template.changed('subject') || template.changed('body')) {
          template.version += 1;
        }
      },
    },
  }
);

EmailTemplate.associate = function(models) {
  EmailTemplate.belongsTo(models.User, {
    foreignKey: 'lastModifiedBy',
    as: 'modifier',
    onDelete: 'SET NULL',
  });
};

module.exports = EmailTemplate; 