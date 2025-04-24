const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Appointment, Beneficiary, User } = require('../models');
const {
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
} = require('../middlewares/auth');
// Remove requires handled by the controller
// const { Appointment, Beneficiary, User } = require('../models');
// const { Op } = require('sequelize');

// Require the new controller
const appointmentController = require('../controllers/appointmentController');

// --- Validation Rules ---
const appointmentValidationRules = () => [
    // beneficiaryId: Controller içinde kontrol ediliyor (yetki vs)
    body('type').isIn([
        'Entretien Préliminaire',
        'Entretien d\'Investigation',
        'Entretien de Synthèse',
        'Passation Tests',
        'Suivi',
        'Autre']).withMessage('Type de rendez-vous invalide.'),
    body('date').isISO8601().withMessage('Date invalide.'),
    body('time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Heure invalide (HH:MM format requis).'),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    body('location').optional({ checkFalsy: true }).trim().escape(),
    body('notes').optional({ checkFalsy: true }).trim().escape(),
    // Edit için status ekleyelim (add için gerekli değil)
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled']).withMessage('Statut invalide.')
];

const addAppointmentValidationRules = () => [
    ...appointmentValidationRules()
];

const editAppointmentValidationRules = () => [
    // beneficiaryId: Controller içinde kontrol ediliyor
    ...appointmentValidationRules(),
    body('status').notEmpty().isIn(['scheduled', 'completed', 'cancelled']).withMessage('Statut invalide.') // Edit için zorunlu
];

// --- Appointment Routes ---

// GET / - List Appointments
router.get(
  '/',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  appointmentController.listAppointments,
);

// GET /add - Show New Appointment Form
router.get(
  '/add',
  ensureAuthenticated,
  ensureConsultantOrBeneficiary,
  appointmentController.showNewForm,
);

// POST /add - Add New Appointment
router.post(
  '/add',
  ensureAuthenticated,
  body('beneficiaryId').notEmpty().withMessage('Bénéficiaire requis.').isInt().withMessage('ID Bénéficiaire invalide.'),
  addAppointmentValidationRules(),
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
  editAppointmentValidationRules(),
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
