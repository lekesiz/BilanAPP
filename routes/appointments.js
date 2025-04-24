const express = require('express');

const router = express.Router();
const {
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
} = require('../middlewares/auth');
// Remove requires handled by the controller
// const { Appointment, Beneficiary, User } = require('../models');
// const { Op } = require('sequelize');

// Require the new controller
const appointmentController = require('../controllers/appointmentController');

// --- Appointment Routes ---

// GET / - List Appointments
router.get(
  '/',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  appointmentController.listAppointments,
);

// GET /new - Show New Appointment Form
router.get(
  '/new',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  appointmentController.showNewForm,
);

// POST /new - Add New Appointment
router.post(
  '/new',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  appointmentController.addAppointment,
);

// GET /:id/edit - Show Edit Appointment Form
router.get(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  appointmentController.showEditForm,
);

// POST /:id/edit - Update Appointment
router.post(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  appointmentController.updateAppointment,
);

// POST /:id/delete - Delete Appointment
router.post(
  '/:id/delete',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  appointmentController.deleteAppointment,
);

module.exports = router;

// ---------- REMOVED INLINE HANDLER LOGIC ----------
