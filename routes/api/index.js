const express = require('express');
const router = express.Router();

// Dashboard routes
router.use('/dashboard', require('./dashboard'));

module.exports = router; 