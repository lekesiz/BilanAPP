const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Plateforme de Bilan de Compétences',
    user: req.user,
  });
});

module.exports = router;
