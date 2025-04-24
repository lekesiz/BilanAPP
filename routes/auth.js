const express = require('express');

const router = express.Router();
const passport = require('passport');
// Remove requires handled by controller
// const bcrypt = require('bcryptjs');
// const { User } = require('../models');
// const { getDefaultCreditsForForfait } = require('../services/creditService');
const { ensureAuthenticated } = require('../middlewares/auth');

// Require the new controller
const authController = require('../controllers/authController');

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
router.post('/register', authController.registerUser);

// GET /logout - Handle Logout
router.get('/logout', ensureAuthenticated, authController.logoutUser);

module.exports = router;

// ---------- REMOVED INLINE HANDLER LOGIC ----------
