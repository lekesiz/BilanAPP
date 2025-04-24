const User = require('./User');
const Beneficiary = require('./Beneficiary');
const Appointment = require('./Appointment');
const Message = require('./Message');
const Questionnaire = require('./Questionnaire');
const Document = require('./Document');
const Question = require('./Question');
const Answer = require('./Answer');

// Relations entre les modèles
// Relation Consultant-Bénéficiaire
User.hasMany(Beneficiary, { foreignKey: 'consultantId', as: 'beneficiaries' });
Beneficiary.belongsTo(User, { foreignKey: 'consultantId', as: 'consultant' });

// Relation Bénéficiaire-Utilisateur (compte bénéficiaire)
Beneficiary.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Beneficiary, { foreignKey: 'userId', as: 'beneficiaryProfile' });

// Relations pour les rendez-vous
Appointment.belongsTo(User, { foreignKey: 'consultantId', as: 'consultant' });
Appointment.belongsTo(Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
});
User.hasMany(Appointment, {
  foreignKey: 'consultantId',
  as: 'consultantAppointments',
});
Beneficiary.hasMany(Appointment, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiaryAppointments',
});

// Relations pour les messages
Message.belongsTo(User, { foreignKey: 'consultantId', as: 'consultant' });
Message.belongsTo(Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
});
User.hasMany(Message, { foreignKey: 'consultantId', as: 'sentMessages' });
Beneficiary.hasMany(Message, {
  foreignKey: 'beneficiaryId',
  as: 'receivedMessages',
});

// Relations pour les questionnaires
Questionnaire.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Questionnaire.belongsTo(Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
});
User.hasMany(Questionnaire, {
  foreignKey: 'createdBy',
  as: 'createdQuestionnaires',
});
Beneficiary.hasMany(Questionnaire, {
  foreignKey: 'beneficiaryId',
  as: 'assignedQuestionnaires',
});

// Relations pour les documents
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });
Document.belongsTo(Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
});
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'uploadedDocuments' });
Beneficiary.hasMany(Document, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiaryDocuments',
});

// Relations pour les questions et réponses
Questionnaire.hasMany(Question, {
  foreignKey: 'questionnaireId',
  as: 'questions',
});
Question.belongsTo(Questionnaire, {
  foreignKey: 'questionnaireId',
  as: 'questionnaire',
});
Question.hasMany(Answer, { foreignKey: 'questionId', as: 'answers' });
Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });
Answer.belongsTo(Beneficiary, {
  foreignKey: 'beneficiaryId',
  as: 'beneficiary',
});

module.exports = {
  User,
  Beneficiary,
  Appointment,
  Message,
  Questionnaire,
  Document,
  Question,
  Answer,
};
