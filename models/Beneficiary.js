const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Beneficiary extends Model {}

Beneficiary.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    consultantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('initial', 'active', 'completed', 'on_hold'),
      defaultValue: 'initial',
      allowNull: false,
    },
    currentPhase: {
      type: DataTypes.ENUM('preliminary', 'investigation', 'conclusion'),
      defaultValue: 'preliminary',
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    identifiedSkills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    careerObjectives: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actionPlan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    synthesis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bilanStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    bilanEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    followUpNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    consentGiven: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    consentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    agreementDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // --- Detaylı Checklist Alanları (Aşama Bazlı) ---
    // Phase Préliminaire
    prelim_entretienInfoFait: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    prelim_analyseDemandeFaite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    prelim_conventionSignee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    // Phase Investigation
    invest_parcoursDetailleFait: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    invest_competencesEvaluees: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    invest_interetsExplores: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    invest_projetExplore: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    // Phase Conclusion
    conclu_syntheseRedigee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    conclu_planActionDefini: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    conclu_entretienSyntheseFait: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    // Suivi
    suivi_entretien6moisFait: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Beneficiary',
  },
);

module.exports = Beneficiary;
