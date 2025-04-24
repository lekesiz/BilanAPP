const express = require('express');

const router = express.Router();
const { ensureAuthenticated, ensureConsultant } = require('../middlewares/auth');
const { checkAccessLevel } = require('../middlewares/permissions');
const { checkAiLimit } = require('../middlewares/limits');
const aiController = require('../controllers/aiController');

// Apply middleware to all routes
router.use(ensureAuthenticated);
router.use(checkAccessLevel('Premium')); // Require Premium for all AI tools
router.use(checkAiLimit); // Check AI usage limits for all tools

// GET /ai/synthesis-generator - Display UI for synthesis generation
router.get('/synthesis-generator', ensureConsultant, aiController.showSynthesisGenerator);

// POST /ai/synthesis-generator - Handle generation request
router.post('/synthesis-generator', ensureConsultant, aiController.generateSynthesis);

// GET /ai/action-plan-generator - Display UI for action plan generation
router.get('/action-plan-generator', ensureConsultant, aiController.showActionPlanGenerator);

// POST /ai/action-plan-generator - Handle generation request
router.post('/action-plan-generator', ensureConsultant, aiController.generateActionPlan);

// GET /ai/strategy-plan-generator - Display UI for strategy plan generation
router.get('/strategy-plan-generator', ensureConsultant, aiController.showStrategyPlanGenerator);

// POST /ai/strategy-plan-generator - Handle generation request
router.post('/strategy-plan-generator', ensureConsultant, aiController.generateStrategyPlan);

// GET /ai/career-explorer - Display career exploration UI
router.get('/career-explorer', aiController.showCareerExplorer);

// POST /ai/career-explorer - Handle career exploration request
router.post('/career-explorer', aiController.exploreCareer);

// GET /ai/competency-analyzer - Display competency analysis UI
router.get('/competency-analyzer', aiController.showCompetencyAnalyzer);

// POST /ai/competency-analyzer - Handle competency analysis request
router.post('/competency-analyzer', aiController.analyzeCompetencies);

module.exports = router;
