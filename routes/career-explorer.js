const express = require('express');

const router = express.Router();
const careerExplorerController = require('../controllers/careerExplorerController');
const { isAuthenticated, isConsultantOrAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Career explorer form
router.get('/', isConsultantOrAdmin, careerExplorerController.showExplorerForm);

// Process career explorer form
router.post('/process', isConsultantOrAdmin, careerExplorerController.processExplorerForm);

// Save results to beneficiary
router.post(
  '/save-results',
  isConsultantOrAdmin,
  careerExplorerController.saveResultsToBeneficiary,
);

// View exploration history for a beneficiary
router.get(
  '/history/:beneficiaryId',
  isConsultantOrAdmin,
  careerExplorerController.viewExplorationHistory,
);

module.exports = router;
