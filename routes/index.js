const express = require('express');
// const { ensureAuthenticated } = require('../middlewares/auth'); // Unused

const router = express.Router();

/* GET home page. */
router.get('/', (req, res /* , next */) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('index', {
      title: 'Plateforme de Bilan de Compétences',
      user: req.user,
    });
  }
});

// Add redirects for common misrouted URLs
router.get('/login', (req, res) => {
  res.redirect('/auth/login');
});

router.get('/register', (req, res) => {
  res.redirect('/auth/register');
});

module.exports = router;
