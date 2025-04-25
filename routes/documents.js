const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
// const multer = require('multer'); // Multer is used in controller, not directly in router
const { ensureAuthenticated, ensureConsultantOrBeneficiary } = require('../middlewares/auth');
const { checkAndDeductCredits } = require('../middlewares/credits');
// Remove requires now handled by controller
// const { Document, Beneficiary, User } = require('../models');
// const path = require('path');
// const fs = require('fs');
// const { Op } = require('sequelize');
// const { logCreditChange } = require('../services/creditService');

// Require the controller
const documentController = require('../controllers/documentController');

// --- Constants ---
const UPLOAD_COST = 2; // Define cost here or get from config

// --- Validation Rules ---
const documentValidationRules = () => [
  // beneficiaryId: Opsiyonel, ama varsa integer olmalı
  body('beneficiaryId')
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage('ID Bénéficiaire invalide.'),
  body('description').optional({ checkFalsy: true }).trim().escape(),
  // category: Modeldeki ENUM değerlerinden biri olmalı
  body('category')
    .optional({ checkFalsy: true })
    .isIn([
      'CV',
      'Lettre de Motivation',
      'Résultats Tests',
      'Synthèse',
      "Plan d'Action",
      'Administratif',
      'Convention',
      'Portfolio',
      'Autre',
    ])
    .withMessage('Catégorie invalide.'),
  // bilanPhase: Modeldeki ENUM değerlerinden biri olmalı
  body('bilanPhase')
    .optional({ checkFalsy: true })
    .isIn(['Preliminaire', 'Investigation', 'Conclusion', 'Suivi', 'General'])
    .withMessage('Phase Bilan invalide.'),
];

// --- Document Routes ---

// GET / - List documents
router.get(
  '/',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  documentController.listDocuments,
);

// GET /upload - Show Upload Form
router.get(
  '/upload',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  documentController.showUploadForm,
);

// POST /upload - Handle File Upload
router.post(
  '/upload',
  ensureAuthenticated,
  documentController.handleUploadMiddleware,
  checkAndDeductCredits(UPLOAD_COST),
  documentValidationRules(),
  documentController.uploadDocument,
);

// GET /:id/edit - Show Edit Document Form
router.get(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  documentController.showEditForm,
);

// POST /:id/edit - Update Document Metadata
router.post(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  documentValidationRules(),
  documentController.updateDocument,
);

// POST /:id/delete - Delete Document
router.post(
  '/:id/delete',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  documentController.deleteDocument,
);

module.exports = router;

// ---------- REMOVED INLINE HANDLER LOGIC & MULTER SETUP ----------
