const express = require('express');
const { body, validationResult } = require('express-validator');
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

// --- Validation Rules ---

// Yeni Anket Oluşturma/Düzenleme için Kurallar
const questionnaireValidationRules = () => [
  body('title').trim().notEmpty().withMessage('Le titre est requis.').escape(),
  body('description').trim().notEmpty().withMessage('La description est requise.').escape(),
  body('category')
    .optional({ checkFalsy: true })
    .isIn([
      'Intérêts Professionnels',
      'Motivation',
      'Personnalité',
      'Compétences Techniques',
      'Compétences Transversales',
      'Valeurs',
      'Autre',
    ])
    .withMessage('Catégorie invalide.'),
  // Questions dizisi için daha karmaşık doğrulama gerekebilir (şimdilik temel)
  body('questions').optional().isArray().withMessage('Format des questions invalide.'),
  body('questions.*.text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le texte de la question ne peut pas être vide.')
    .escape(),
  body('questions.*.type')
    .optional()
    .isIn(['text', 'textarea', 'radio', 'checkbox', 'scale'])
    .withMessage('Type de question invalide.'),
  body('questions.*.options').optional().trim().escape(), // Gerekirse custom validator ile type'a göre kontrol
];

// Anket Atama için Kurallar
const assignValidationRules = () => [
  body('beneficiaryId')
    .notEmpty()
    .withMessage('Bénéficiaire requis.')
    .isInt()
    .withMessage('ID Bénéficiaire invalide.'),
  body('dueDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('Date limite invalide.'),
];

// Cevap Gönderme için Kurallar (Daha karmaşık, şimdilik basit)
const answerValidationRules = () => [
  body('answers').exists().withMessage('Aucune réponse fournie.'), // Temel kontrol
  // Burada her sorunun tipine göre daha detaylı doğrulama yapılabilir.
];

// Soru Ekleme/Düzenleme için Kurallar
const questionValidationRules = () => [
  body('text').trim().notEmpty().withMessage('Le texte de la question est requis.').escape(),
  body('type')
    .isIn(['text', 'textarea', 'radio', 'checkbox', 'scale'])
    .withMessage('Type de question invalide.'),
  body('options').optional({ checkFalsy: true }).trim().escape(),
  body('order').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Ordre invalide.'),
];

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
  questionnaireValidationRules(),
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
  assignValidationRules(),
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
  answerValidationRules(),
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
  questionnaireValidationRules(),
  questionnaireController.updateQuestionnaire,
);

// POST /:id/questions/add - Add a question to a questionnaire
router.post(
  '/:id/questions/add',
  ensureAuthenticated,
  ensureConsultant,
  questionValidationRules(),
  questionnaireController.addQuestion,
);

// POST /questions/:questionId/delete - Delete a question
router.post(
  '/questions/:questionId/delete',
  ensureAuthenticated,
  ensureConsultant,
  questionnaireController.deleteQuestion,
);

// POST /:id/delete - Delete Questionnaire
router.post(
  '/:id/delete',
  ensureAuthenticated,
  ensureConsultant,
  questionnaireController.deleteQuestionnaire,
);

module.exports = router;
