const express = require('express');

const router = express.Router();
// Remove requires handled by controller
// const bcrypt = require('bcryptjs');
const { ensureAuthenticated } = require('../middlewares/auth');
// const { User, Beneficiary, CreditLog, Forfait } = require('../models');

// Require the new controller
const profileController = require('../controllers/profileController');

// GET /profile - Show Profile Page
router.get('/', ensureAuthenticated, profileController.showProfile);

// GET /profile/settings - Show Settings Page
router.get('/settings', ensureAuthenticated, profileController.showSettings);

// POST /profile/settings/info - Update Profile Info
router.post(
  '/settings/info',
  ensureAuthenticated,
  profileController.updateInfo,
);

// POST /profile/settings/password - Change Password
router.post(
  '/settings/password',
  ensureAuthenticated,
  profileController.changePassword,
);

// GET /profile/credits - Show Credit History
router.get('/credits', ensureAuthenticated, profileController.showCredits);

module.exports = router;

// ---------- REMOVED INLINE HANDLER LOGIC ----------
