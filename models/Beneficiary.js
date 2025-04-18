const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Beneficiary extends Model {}

Beneficiary.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  consultantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('initial', 'active', 'completed', 'on_hold'),
    defaultValue: 'initial',
    allowNull: false
  },
  currentPhase: {
    type: DataTypes.ENUM('preliminary', 'investigation', 'conclusion'),
    defaultValue: 'preliminary',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  identifiedSkills: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  careerObjectives: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  actionPlan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  synthesis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bilanStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  bilanEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  followUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  followUpNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  consentGiven: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  consentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  agreementSigned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  agreementDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // --- Qualiopi/Metodoloji Checklist Alanları ---
  preliminaryInterviewDone: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  investigationPhaseStarted: { // Araştırma fazı başladı mı?
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  synthesisMeetingDone: { // Sentez toplantısı yapıldı mı?
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  followUpMeetingDone: { // Takip toplantısı yapıldı mı?
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // --- Sentez Tamamlama Alanları ---
  synthesisFinalized: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  synthesisFinalizedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Beneficiary'
});

module.exports = Beneficiary;
