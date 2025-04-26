const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { ensureAuthenticated } = require('../middlewares/auth');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validateRequest');
const { handleErrors } = require('../middlewares/errorHandler');

const router = express.Router();
// Remove requires handled by controller
// const bcrypt = require('bcryptjs');
// const { User } = require('../models');
// const { getDefaultCreditsForForfait } = require('../services/creditService');

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    'string.empty': 'Le prénom est requis.',
    'any.required': 'Le prénom est requis.',
  }),
  lastName: Joi.string().trim().required().messages({
    'string.empty': 'Le nom est requis.',
    'any.required': 'Le nom est requis.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Adresse email invalide.',
    'any.required': 'L\'email est requis.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères.',
    'any.required': 'Le mot de passe est requis.',
  }),
  password2: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Les mots de passe ne correspondent pas.',
    'any.required': 'La confirmation du mot de passe est requise.',
  }),
  userType: Joi.string().valid('consultant', 'beneficiary').required().messages({
    'any.only': 'Type de compte invalide.',
    'any.required': 'Le type de compte est requis.',
  }),
});

// --- Auth Routes ---

// GET /v1/auth/login - Show Login Page
router.get('/login', authController.showLoginPage);

// POST /v1/auth/login - Handle Login Attempt
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
    body('password').notEmpty().withMessage('Le mot de passe est requis.'),
  ],
  validateRequest,
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true,
  }),
  handleErrors,
);

// GET /v1/auth/register - Show Registration Page
router.get('/register', authController.showRegisterPage);

// POST /v1/auth/register - Handle Registration Submission
router.post(
  '/register',
  registerLimiter,
  validateRequest(registerSchema),
  authController.registerUser,
  handleErrors,
);

// GET /v1/auth/logout - Handle Logout
router.get('/logout', ensureAuthenticated, authController.logoutUser);

module.exports = router;

// ---------- REMOVED INLINE HANDLER LOGIC ----------
