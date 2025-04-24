const express = require('express');
const { ensureAuthenticated } = require('../middlewares/auth');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res /*, next */) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('index', {
      title: 'Plateforme de Bilan de Compétences',
      user: req.user,
    });
  }
});

module.exports = router;
