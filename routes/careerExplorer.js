const express = require('express');

const router = express.Router();
const careerExplorerController = require('../controllers/careerExplorerController');
const {
  ensureAuthenticated,
  ensureConsultant,
  ensureBeneficiaryAccess,
} = require('../middleware/auth');

// All routes require authentication
router.use(ensureAuthenticated);

// All routes related to beneficiaries require consultant access
router.use('/beneficiaries/:id', ensureBeneficiaryAccess);

// Career Explorer form route
router.get(
  '/beneficiaries/:id/career-explorer',
  careerExplorerController.showCareerExplorerForm,
);

// Process career exploration request
router.post(
  '/beneficiaries/:id/career-explorer',
  careerExplorerController.processCareerExplorer,
);

// Show career exploration results
router.get(
  '/beneficiaries/:id/career-explorer/results/:analysisId',
  careerExplorerController.showResults,
);

module.exports = router;
