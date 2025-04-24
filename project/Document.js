const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Document extends Model {}

Document.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('contract', 'assessment', 'report', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Document',
  },
);

module.exports = Document;
