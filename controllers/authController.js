const { User } = require('../models');
const { getDefaultCreditsForForfait } = require('../services/creditService');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

// GET /login - Show Login Page
exports.showLoginPage = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'Connexion', layout: 'auth' });
};

// POST /login - Handle Login Attempt
// passport.authenticate is middleware, so it stays in the router
// We might add a controller function here if there was logic *after* successful login,
// but for simple redirects, the middleware handles it.

// GET /register - Show Registration Page
exports.showRegisterPage = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { title: 'Inscription', layout: 'auth' });
};

// POST /register - Handle Registration Submission
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/register', {
      title: 'Inscription',
      errors: errors.array(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      userType: req.body.userType,
      layout: 'auth',
    });
  }

  const { firstName, lastName, email, password, userType } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Inscription',
        errors: [{ msg: 'Cet email est déjà enregistré.' }],
        firstName,
        lastName,
        email,
        userType,
        layout: 'auth',
      });
    }
    const defaultForfait = 'Standard';
    const defaultCredits = await getDefaultCreditsForForfait(defaultForfait);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      userType,
      forfaitType: defaultForfait,
      availableCredits: defaultCredits,
    });
    await newUser.save();
    req.flash('success_msg', 'Inscription réussie! Connectez-vous.');
    res.redirect('/auth/login');
  } catch (err) {
    logger.error('Register error:', { error: err, email: email });
    req.flash('error_msg', "Erreur lors de l'inscription.");
    res.redirect('/auth/register');
  }
};

// GET /logout - Handle Logout
exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'Déconnexion réussie.');
    res.redirect('/');
  });
};
