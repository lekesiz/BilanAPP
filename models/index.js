const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// User Model Relationships
db.User.hasMany(db.Beneficiary, {
  foreignKey: 'consultantId',
  as: 'beneficiaries',
  onDelete: 'CASCADE'
});

db.User.hasMany(db.Appointment, {
  foreignKey: 'consultantId',
  as: 'appointments',
  onDelete: 'CASCADE'
});

db.User.hasMany(db.Conversation, {
  foreignKey: 'senderId',
  as: 'conversations',
  onDelete: 'CASCADE'
});

db.User.hasMany(db.Questionnaire, {
  foreignKey: 'createdBy',
  as: 'questionnaires',
  onDelete: 'CASCADE'
});

db.User.hasMany(db.Document, {
  foreignKey: 'uploadedBy',
  as: 'documents',
  onDelete: 'CASCADE'
});

db.User.hasMany(db.AiAnalysis, {
  foreignKey: 'userId',
  as: 'aiAnalyses',
  onDelete: 'CASCADE'
});

db.User.hasMany(db.CareerExploration, {
  foreignKey: 'userId',
  as: 'careerExplorations',
  onDelete: 'CASCADE'
});

// Add indexes for User model
db.User.addIndex('idx_user_email_type', ['email', 'userType']);
db.User.addIndex('idx_user_status', ['status']);
db.User.addIndex('idx_user_last_login', ['lastLoginAt']);

// Beneficiary Model Relationships
db.Beneficiary.belongsTo(db.User, {
  foreignKey: 'consultantId',
  as: 'consultant',
  onDelete: 'CASCADE'
});

db.Beneficiary.hasMany(db.Appointment, {
  foreignKey: 'beneficiaryId',
  as: 'appointments',
  onDelete: 'CASCADE'
});

db.Beneficiary.hasMany(db.Conversation, {
  foreignKey: 'beneficiaryId',
  as: 'conversations',
  onDelete: 'CASCADE'
});

db.Beneficiary.hasMany(db.Questionnaire, {
  foreignKey: 'beneficiaryId',
  as: 'questionnaires',
  onDelete: 'CASCADE'
});

db.Beneficiary.hasMany(db.Document, {
  foreignKey: 'beneficiaryId',
  as: 'documents',
  onDelete: 'CASCADE'
});

db.Beneficiary.hasMany(db.AiAnalysis, {
  foreignKey: 'beneficiaryId',
  as: 'aiAnalyses',
  onDelete: 'CASCADE'
});

db.Beneficiary.hasMany(db.CareerExploration, {
  foreignKey: 'beneficiaryId',
  as: 'careerExplorations',
  onDelete: 'CASCADE'
});

// Add indexes for Beneficiary model
db.Beneficiary.addIndex('idx_beneficiary_consultant_status', ['consultantId', 'status']);
db.Beneficiary.addIndex('idx_beneficiary_current_phase', ['currentPhase']);
db.Beneficiary.addIndex('idx_beneficiary_last_activity', ['lastActivityAt']);

// Appointment Model Relationships
db.Appointment.belongsTo(db.User, {
  foreignKey: 'consultantId',
  as: 'consultant',
  onDelete: 'CASCADE'
});

db.Appointment.belongsTo(db.Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
  onDelete: 'CASCADE'
});

// Add indexes for Appointment model
db.Appointment.addIndex('idx_appointment_consultant_beneficiary_time', ['consultantId', 'beneficiaryId', 'startTime']);
db.Appointment.addIndex('idx_appointment_status', ['status']);
db.Appointment.addIndex('idx_appointment_type', ['type']);

// Conversation Model Relationships
db.Conversation.belongsTo(db.User, {
  foreignKey: 'senderId',
  as: 'sender',
  onDelete: 'CASCADE'
});

db.Conversation.belongsTo(db.Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
  onDelete: 'CASCADE'
});

// Add indexes for Conversation model
db.Conversation.addIndex('idx_conversation_sender_beneficiary', ['senderId', 'beneficiaryId']);
db.Conversation.addIndex('idx_conversation_status', ['status']);
db.Conversation.addIndex('idx_conversation_last_message', ['lastMessageAt']);

// Questionnaire Model Relationships
db.Questionnaire.belongsTo(db.User, {
  foreignKey: 'createdBy',
  as: 'creator',
  onDelete: 'CASCADE'
});

db.Questionnaire.belongsTo(db.Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
  onDelete: 'CASCADE'
});

// Add indexes for Questionnaire model
db.Questionnaire.addIndex('idx_questionnaire_beneficiary_status', ['beneficiaryId', 'status']);
db.Questionnaire.addIndex('idx_questionnaire_type', ['type']);
db.Questionnaire.addIndex('idx_questionnaire_created_at', ['createdAt']);

// Document Model Relationships
db.Document.belongsTo(db.User, {
  foreignKey: 'uploadedBy',
  as: 'uploader',
  onDelete: 'CASCADE'
});

db.Document.belongsTo(db.Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
  onDelete: 'CASCADE'
});

// Add indexes for Document model
db.Document.addIndex('idx_document_beneficiary_type', ['beneficiaryId', 'type']);
db.Document.addIndex('idx_document_status', ['status']);
db.Document.addIndex('idx_document_created_at', ['createdAt']);

// AiAnalysis Model Relationships
db.AiAnalysis.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

db.AiAnalysis.belongsTo(db.Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
  onDelete: 'CASCADE'
});

// Add indexes for AiAnalysis model
db.AiAnalysis.addIndex('idx_ai_analysis_user_beneficiary', ['userId', 'beneficiaryId']);
db.AiAnalysis.addIndex('idx_ai_analysis_status', ['status']);
db.AiAnalysis.addIndex('idx_ai_analysis_created_at', ['createdAt']);

// CareerExploration Model Relationships
db.CareerExploration.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

db.CareerExploration.belongsTo(db.Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
  onDelete: 'CASCADE'
});

// Add indexes for CareerExploration model
db.CareerExploration.addIndex('idx_career_exploration_user_beneficiary', ['userId', 'beneficiaryId']);
db.CareerExploration.addIndex('idx_career_exploration_status', ['status']);
db.CareerExploration.addIndex('idx_career_exploration_created_at', ['createdAt']);

// Add partitioning for large tables
sequelize.query(`
  ALTER TABLE ActivityLogs PARTITION BY RANGE (TO_DAYS(createdAt)) (
    PARTITION p_2023 VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p_2024 VALUES LESS THAN (TO_DAYS('2025-01-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
  );

  ALTER TABLE SystemLogs PARTITION BY RANGE (TO_DAYS(createdAt)) (
    PARTITION p_2023 VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p_2024 VALUES LESS THAN (TO_DAYS('2025-01-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
  );

  ALTER TABLE Documents PARTITION BY LIST (type) (
    PARTITION p_pdf VALUES IN ('pdf'),
    PARTITION p_doc VALUES IN ('doc', 'docx'),
    PARTITION p_image VALUES IN ('jpg', 'jpeg', 'png', 'gif'),
    PARTITION p_other VALUES IN (DEFAULT)
  );

  ALTER TABLE Conversations PARTITION BY HASH (senderId) PARTITIONS 4;
`);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
