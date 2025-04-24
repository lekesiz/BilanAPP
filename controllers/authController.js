const passport = require('passport');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { getDefaultCreditsForForfait } = require('../services/creditService');

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
  const {
    firstName, lastName, email, password, password2, userType,
  } =
    req.body;
  const errors = [];

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !password2 ||
    !userType
  ) {
    errors.push({ msg: 'Veuillez remplir tous les champs.' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Les mots de passe ne correspondent pas.' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Mot de passe: 6 caractères minimum.' });
  }

  if (errors.length > 0) {
    return res.render('auth/register', {
      title: 'Inscription',
      errors,
      firstName,
      lastName,
      email,
      userType,
      layout: 'auth',
    });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      errors.push({ msg: 'Cet email est déjà enregistré.' });
      return res.render('auth/register', {
        title: 'Inscription',
        errors,
        firstName,
        lastName,
        email,
        userType,
        layout: 'auth',
      });
    }
    const defaultForfait = 'Standard'; // Or determine based on userType?
    const defaultCredits = await getDefaultCreditsForForfait(defaultForfait);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Hook will hash password
      userType,
      forfaitType: defaultForfait,
      availableCredits: defaultCredits,
    });
    await newUser.save();
    req.flash('success_msg', 'Inscription réussie! Connectez-vous.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Register error:', err);
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
