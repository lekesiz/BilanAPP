const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt'); // bcrypt zaten import edilmiş olmalı
const { User } = require('../models');
const { getDefaultCreditsForForfait } = require('../services/creditService');
const { ensureAuthenticated } = require('../middlewares/auth');

// Page de connexion
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { 
    title: 'Connexion',
    layout: 'auth'
  });
});

// Traitement de la connexion
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Déconnexion
router.get('/logout', ensureAuthenticated, (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'Vous êtes déconnecté');
    res.redirect('/');
  });
});

// Register Handle
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, password2, userType } = req.body;
    let errors = [];

    // Check required fields
    if (!firstName || !lastName || !email || !password || !password2 || !userType) {
        errors.push({ msg: 'Veuillez remplir tous les champs obligatoires.' });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Les mots de passe ne correspondent pas.' });
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    if (errors.length > 0) {
        res.render('auth/register', {
            title: 'Inscription',
            errors,
            firstName,
            lastName,
            email,
            userType
        });
    } else {
        try {
            // Validation passed
            const user = await User.findOne({ where: { email: email } });
            if (user) {
                // User exists
                errors.push({ msg: 'Cet email est déjà enregistré.' });
                res.render('auth/register', {
                     title: 'Inscription',
                    errors,
                    firstName,
                    lastName,
                    email,
                    userType
                });
            } else {
                 const defaultForfait = 'Standard'; 
                 // Veritabanından varsayılan krediyi al
                 const defaultCredits = await getDefaultCreditsForForfait(defaultForfait);

                 const newUser = new User({
                    firstName,
                    lastName,
                    email,
                    password, // Hook hashleyecek
                    userType,
                    forfaitType: defaultForfait,
                    availableCredits: defaultCredits // DB'den gelen değer
                 });

                // Save user (password will be hashed by hook)
                await newUser.save();
                req.flash('success_msg', 'Inscription réussie! Vous pouvez maintenant vous connecter.');
                res.redirect('/auth/login');
            }
        } catch (err) {
            console.error('Register error:', err);
            req.flash('error_msg', 'Une erreur est survenue lors de l\'inscription.');
            res.redirect('/auth/register');
        }
    }
});

module.exports = router;
