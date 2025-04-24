const express = require('express');

const router = express.Router();
const {
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
} = require('../middlewares/auth');
const { checkAndDeductCredits } = require('../middlewares/credits');
// Remove requires now handled by controller
// const { Document, Beneficiary, User } = require('../models');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { Op } = require('sequelize');
// const { logCreditChange } = require('../services/creditService');

// Require the controller
const documentController = require('../controllers/documentController');

// --- Constants ---
const UPLOAD_COST = 2; // Define cost here or get from config

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
  ensureConsultantOrBeneficiary,
  checkAndDeductCredits(UPLOAD_COST), // Check credits first
  documentController.handleUploadMiddleware, // Then handle upload via Multer middleware from controller
  documentController.uploadDocument, // Finally, process the upload in the controller
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
