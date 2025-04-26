const express = require('express');
const router = express.Router();
const { isAdmin } = require('@middlewares/auth');
const { setActiveMenu, setAdminData } = require('@middlewares/admin');

// Admin middleware
router.use(isAdmin);
router.use(setActiveMenu);
router.use(setAdminData);

// Dashboard routes
router.use('/dashboard', require('./dashboard'));

// User routes
router.use('/users', require('./users'));

// Package routes
router.use('/packages', require('./packages'));

// Settings routes
router.use('/settings', require('./settings'));

// Ana sayfa
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

module.exports = router; 