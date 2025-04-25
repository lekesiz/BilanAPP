const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
// Remove requires handled by controller
// const bcrypt = require('bcryptjs');
const { ensureAuthenticated } = require('../middlewares/auth');
// const { User, Beneficiary, CreditLog, Forfait } = require('../models');

// Require the new controller
const profileController = require('../controllers/profileController');

// --- Validation Rules ---
const infoValidationRules = () => [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis.')
    .escape(),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis.')
    .escape(),
];

const passwordValidationRules = () => [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Les nouveaux mots de passe ne correspondent pas.');
    }
    return true;
  }),
];

// GET /profile - Show Profile Page
router.get('/', ensureAuthenticated, profileController.showProfile);

// GET /profile/settings - Show Settings Page
router.get('/settings', ensureAuthenticated, profileController.showSettings);

// POST /profile/settings/info - Update Profile Info
router.post(
  '/settings/info',
  ensureAuthenticated,
  infoValidationRules(),
  profileController.updateInfo,
);

// POST /profile/settings/password - Change Password
router.post(
  '/settings/password',
  ensureAuthenticated,
  passwordValidationRules(),
  profileController.changePassword,
);

// GET /profile/credits - Show Credit History
router.get('/credits', ensureAuthenticated, profileController.showCredits);

module.exports = router;

// ---------- REMOVED INLINE HANDLER LOGIC ----------
