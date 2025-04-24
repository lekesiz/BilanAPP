const express = require('express');

const router = express.Router();
const {
  ensureAuthenticated,
  ensureConsultant,
  ensureBeneficiary,
  ensureConsultantOrBeneficiary,
} = require('../middlewares/auth');
const { checkAndDeductCredits } = require('../middlewares/credits');
const { checkAccessLevel } = require('../middlewares/permissions');

// Require the new controller
const questionnaireController = require('../controllers/questionnaireController');

const MIN_FORFAIT_QUESTIONNAIRE_CREATE = 'Standard';
const ASSIGN_COST = 10;

// --- Questionnaire Routes ---

// GET / - List Questionnaires
router.get(
  '/',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  questionnaireController.listQuestionnaires,
);

// GET /new - Show New Questionnaire Form
router.get(
  '/new',
  ensureAuthenticated,
  ensureConsultant,
  checkAccessLevel(MIN_FORFAIT_QUESTIONNAIRE_CREATE),
  questionnaireController.showNewForm,
);

// POST /new - Create New Questionnaire
router.post(
  '/new',
  ensureAuthenticated,
  ensureConsultant,
  questionnaireController.createQuestionnaire,
);

// GET /:id - Show Questionnaire Details / Assign Form
router.get(
  '/:id',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  questionnaireController.showDetails,
);

// POST /:id/assign - Assign Questionnaire to Beneficiary
router.post(
  '/:id/assign',
  ensureAuthenticated,
  ensureConsultant,
  checkAndDeductCredits(ASSIGN_COST),
  questionnaireController.assignQuestionnaire,
);

// GET /:id/answer - Show Form for Beneficiary to Answer
router.get(
  '/:id/answer',
  ensureAuthenticated,
  ensureBeneficiary,
  questionnaireController.showAnswerForm,
);

// POST /:id/answer - Submit Beneficiary Answers
router.post(
  '/:id/answer',
  ensureAuthenticated,
  ensureBeneficiary,
  questionnaireController.submitAnswers,
);

// GET /:id/results - View Questionnaire Results
router.get(
  '/:id/results',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  questionnaireController.showResults,
);

// GET /:id/edit - Show Edit Questionnaire Form (Stub)
router.get(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultant,
  questionnaireController.showEditQuestionnaireForm,
);

// POST /:id/edit - Update Questionnaire (Stub)
router.post(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultant,
  questionnaireController.updateQuestionnaire,
);

// POST /:id/delete - Delete Questionnaire
router.post(
  '/:id/delete',
  ensureAuthenticated,
  ensureConsultant,
  questionnaireController.deleteQuestionnaire,
);

module.exports = router;
