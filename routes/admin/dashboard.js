const express = require('express');
const router = express.Router();
const dashboardController = require('@controllers/admin/dashboard');

// Dashboard sayfası
router.get('/', dashboardController.getDashboard);

module.exports = router; 