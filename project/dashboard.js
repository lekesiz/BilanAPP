const express = require('express');

const router = express.Router();
const { ensureAuthenticated, ensureConsultant, ensureBeneficiary } = require('../middlewares/auth');

// Tableau de bord principal (redirection selon le type d'utilisateur)
router.get('/', ensureAuthenticated, (req, res) => {
  if (req.user.userType === 'consultant') {
    res.redirect('/dashboard/consultant');
  } else {
    res.redirect('/dashboard/beneficiary');
  }
});

// Tableau de bord consultant
router.get('/consultant', ensureAuthenticated, ensureConsultant, (req, res) => {
  res.render('dashboard/consultant', {
    title: 'Tableau de bord Consultant',
    user: req.user,
  });
});

// Tableau de bord bénéficiaire
router.get('/beneficiary', ensureAuthenticated, ensureBeneficiary, (req, res) => {
  res.render('dashboard/beneficiary', {
    title: 'Mon Bilan de Compétences',
    user: req.user,
  });
});

module.exports = router;
