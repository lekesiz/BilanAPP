const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { ensureAuthenticated } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();
// Remove requires handled by controller
// const bcrypt = require('bcryptjs');
// const { User } = require('../models');
// const { getDefaultCreditsForForfait } = require('../services/creditService');

// --- Auth Routes ---

// GET /login - Show Login Page
router.get('/login', authController.showLoginPage);

// POST /login - Handle Login Attempt (using passport middleware directly)
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true,
  }),
);

// GET /register - Show Registration Page
router.get('/register', authController.showRegisterPage);

// POST /register - Handle Registration Submission
router.post(
  '/register',
  [
    // Doğrulama kuralları dizisi
    body('firstName').trim().notEmpty().withMessage('Le prénom est requis.').escape(),
    body('lastName').trim().notEmpty().withMessage('Le nom est requis.').escape(),
    body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas.');
      }
      return true;
    }),
    body('userType').isIn(['consultant', 'beneficiary']).withMessage('Type de compte invalide.'),
  ],
  authController.registerUser, // Doğrulama sonrası controller'ı çağır
);

// GET /logout - Handle Logout
router.get('/logout', ensureAuthenticated, authController.logoutUser);

module.exports = router;

// ---------- REMOVED INLINE HANDLER LOGIC ----------
