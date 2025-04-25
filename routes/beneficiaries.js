const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const {
  ensureAuthenticated,
  ensureConsultant,
  ensureConsultantOrBeneficiary,
} = require('../middlewares/auth');
const { checkAndDeductCredits } = require('../middlewares/credits');
const { checkAccessLevel } = require('../middlewares/permissions');
const { checkAiLimit } = require('../middlewares/limits');

// Require the new controller
const beneficiaryController = require('../controllers/beneficiaryController');

// --- Validation Rules ---
const beneficiaryValidationRules = () => [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis.')
    .escape(),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis.')
    .escape(),
  body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().escape(), // Opsiyonel, ama varsa temizle
  body('status')
    .isIn(['initial', 'active', 'completed', 'on_hold'])
    .withMessage('Statut invalide.'),
  body('currentPhase')
    .isIn(['preliminary', 'investigation', 'conclusion'])
    .withMessage('Phase invalide.'),
  // Diğer alanlar için de kurallar eklenebilir (escape, trim vb.)
  body('notes').optional({ checkFalsy: true }).trim().escape(),
  body('education').optional({ checkFalsy: true }).trim().escape(),
  body('experience').optional({ checkFalsy: true }).trim().escape(),
  body('identifiedSkills').optional({ checkFalsy: true }).trim().escape(),
  body('careerObjectives').optional({ checkFalsy: true }).trim().escape(),
  body('actionPlan').optional({ checkFalsy: true }).trim().escape(),
  body('synthesis').optional({ checkFalsy: true }).trim().escape(),
  body('bilanStartDate').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('bilanEndDate').optional({ checkFalsy: true }).isISO8601().toDate(),
];

// --- Beneficiary Routes ---

// Liste des bénéficiaires (GET /)
router.get(
  '/',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  beneficiaryController.listBeneficiaries,
);

// Formulaire d'ajout d'un bénéficiaire (GET /add)
router.get('/add', ensureAuthenticated, ensureConsultant, beneficiaryController.showAddForm);

// Traitement du formulaire d'ajout (POST /add)
router.post(
  '/add',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryValidationRules(),
  beneficiaryController.addBeneficiary,
);

// Détails d'un bénéficiaire (GET /:id)
router.get(
  '/:id',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  beneficiaryController.showDetails,
);

// Formulaire de modification d'un bénéficiaire (GET /:id/edit)
router.get(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  beneficiaryController.showEditForm,
);

// Traitement du formulaire de modification (POST /:id/edit)
router.post(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  beneficiaryValidationRules(),
  beneficiaryController.updateBeneficiary,
);

// Yararlanıcı silme (POST /:id/delete)
router.post(
  '/:id/delete',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  beneficiaryController.deleteBeneficiary,
);

// Yararlanıcının Bilan aşamasını güncelle (POST /:id/update-phase)
router.post(
  '/:id/update-phase',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  body('currentPhase')
    .isIn(['preliminary', 'investigation', 'conclusion'])
    .withMessage('Phase invalide.'),
  beneficiaryController.updatePhase,
);

// AJAX Update Routes
router.post(
  '/:id/update-skills',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryController.updateSkills,
);
router.post(
  '/:id/update-notes',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryController.updateNotes,
);
router.post(
  '/:id/update-education',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryController.updateEducation,
);
router.post(
  '/:id/update-experience',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryController.updateExperience,
);
router.post(
  '/:id/update-objectives',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryController.updateObjectives,
);
router.post(
  '/:id/update-actionplan',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryController.updateActionPlan,
);
router.post(
  '/:id/update-synthesis',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryController.updateSynthesis,
);
router.post(
  '/:id/update-followup-notes',
  ensureAuthenticated,
  ensureConsultant,
  beneficiaryController.updateFollowUpNotes,
);

// --- AI Generation Routes ---
const MIN_FORFAIT_AI = 'Premium'; // Define this constant here if needed by middleware
const GENERATE_SYNTHESIS_COST = 20;
const GENERATE_ACTIONPLAN_COST = 15;

// Sentez Taslağı Oluşturma (AI ile) (POST /:id/generate-synthesis)
router.post(
  '/:id/generate-synthesis',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary, // Allow Admin via logic inside controller
  checkAccessLevel(MIN_FORFAIT_AI),
  checkAiLimit, // Check limit before deducting credits
  checkAndDeductCredits(GENERATE_SYNTHESIS_COST),
  beneficiaryController.generateSynthesis, // Controller handles final logic
);

// Aksiyon Planı Taslağı Oluşturma (AI ile) (POST /:id/generate-actionplan)
router.post(
  '/:id/generate-actionplan',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary, // Allow Admin via logic inside controller
  checkAccessLevel(MIN_FORFAIT_AI),
  checkAiLimit, // Check limit before deducting credits
  checkAndDeductCredits(GENERATE_ACTIONPLAN_COST),
  beneficiaryController.generateActionPlan, // Controller handles final logic
);

module.exports = router;
