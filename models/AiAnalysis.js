const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AiAnalysis = sequelize.define(
  'AiAnalysis',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type of analysis (competency_analysis, career_explorer, etc)',
    },
    input: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Input data for the analysis (JSON string)',
    },
    results: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Results of the analysis (JSON string)',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the user who requested the analysis',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the beneficiary for whom the analysis was performed (if applicable)',
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
  },
  {
    timestamps: true,
  },
);

module.exports = AiAnalysis;
