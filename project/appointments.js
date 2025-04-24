const express = require('express');

const router = express.Router();
const { Op } = require('sequelize');
const {
  ensureAuthenticated,
  ensureConsultant,
  ensureBeneficiary,
} = require('../middlewares/auth');
const { Appointment, Beneficiary, User } = require('../models');

// Liste des rendez-vous pour le consultant
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    let appointments;

    if (req.user.userType === 'consultant') {
      // Pour les consultants, afficher tous leurs rendez-vous
      appointments = await Appointment.findAll({
        where: { consultantId: req.user.id },
        include: [{ model: Beneficiary, as: 'beneficiary' }],
        order: [['date', 'ASC']],
      });
    } else {
      // Pour les bénéficiaires, trouver leur profil et afficher leurs rendez-vous
      const beneficiary = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });

      if (!beneficiary) {
        req.flash('error', 'Profil bénéficiaire non trouvé');
        return res.redirect('/dashboard');
      }

      appointments = await Appointment.findAll({
        where: { beneficiaryId: beneficiary.id },
        include: [{ model: User, as: 'consultant' }],
        order: [['date', 'ASC']],
      });
    }

    res.render('appointments/index', {
      title: 'Mes rendez-vous',
      appointments,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash(
      'error',
      'Une erreur est survenue lors du chargement des rendez-vous',
    );
    res.redirect('/dashboard');
  }
});

// Formulaire d'ajout d'un rendez-vous
router.get('/add', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    // Récupérer la liste des bénéficiaires pour le consultant
    const beneficiaries = await Beneficiary.findAll({
      where: { consultantId: req.user.id },
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC'],
      ],
    });

    // Si un ID de bénéficiaire est fourni dans l'URL
    const { beneficiaryId } = req.query;

    res.render('appointments/add', {
      title: 'Planifier un rendez-vous',
      beneficiaries,
      beneficiaryId,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash(
      'error',
      'Une erreur est survenue lors du chargement du formulaire',
    );
    res.redirect('/appointments');
  }
});

// Traitement du formulaire d'ajout
router.post('/add', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const {
      beneficiaryId,
      title,
      date,
      time,
      duration,
      location,
      isOnline,
      meetingLink,
      notes,
    } = req.body;

    // Vérifier que le bénéficiaire appartient bien au consultant
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: beneficiaryId,
        consultantId: req.user.id,
      },
    });

    if (!beneficiary) {
      req.flash('error', 'Bénéficiaire non trouvé ou non autorisé');
      return res.redirect('/appointments/add');
    }

    // Combiner date et heure
    const dateTime = new Date(`${date}T${time}`);

    // Créer le rendez-vous
    await Appointment.create({
      title,
      date: dateTime,
      duration: parseInt(duration, 10),
      location,
      isOnline: isOnline === 'on',
      meetingLink,
      notes,
      status: 'scheduled',
      consultantId: req.user.id,
      beneficiaryId,
    });

    req.flash('success', 'Rendez-vous planifié avec succès');
    res.redirect('/appointments');
  } catch (err) {
    console.error(err);
    req.flash(
      'error',
      'Une erreur est survenue lors de la planification du rendez-vous',
    );
    res.redirect('/appointments/add');
  }
});

// Détails d'un rendez-vous
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    let appointment;

    if (req.user.userType === 'consultant') {
      // Pour les consultants, vérifier que le rendez-vous leur appartient
      appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          consultantId: req.user.id,
        },
        include: [{ model: Beneficiary, as: 'beneficiary' }],
      });
    } else {
      // Pour les bénéficiaires, vérifier que le rendez-vous leur est assigné
      const beneficiary = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });

      if (!beneficiary) {
        req.flash('error', 'Profil bénéficiaire non trouvé');
        return res.redirect('/dashboard');
      }

      appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          beneficiaryId: beneficiary.id,
        },
        include: [{ model: User, as: 'consultant' }],
      });
    }

    if (!appointment) {
      req.flash('error', 'Rendez-vous non trouvé ou non autorisé');
      return res.redirect('/appointments');
    }

    res.render('appointments/details', {
      title: `Rendez-vous: ${appointment.title}`,
      appointment,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash(
      'error',
      'Une erreur est survenue lors du chargement des détails du rendez-vous',
    );
    res.redirect('/appointments');
  }
});

// Formulaire de modification d'un rendez-vous
router.get(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultant,
  async (req, res) => {
    try {
      const appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          consultantId: req.user.id,
        },
        include: [{ model: Beneficiary, as: 'beneficiary' }],
      });

      if (!appointment) {
        req.flash('error', 'Rendez-vous non trouvé ou non autorisé');
        return res.redirect('/appointments');
      }

      // Récupérer la liste des bénéficiaires pour le consultant
      const beneficiaries = await Beneficiary.findAll({
        where: { consultantId: req.user.id },
        order: [
          ['lastName', 'ASC'],
          ['firstName', 'ASC'],
        ],
      });

      // Formater la date et l'heure pour les champs du formulaire
      const date = appointment.date.toISOString().split('T')[0];
      const time = appointment.date
        .toTimeString()
        .split(' ')[0]
        .substring(0, 5);

      res.render('appointments/edit', {
        title: `Modifier: ${appointment.title}`,
        appointment,
        beneficiaries,
        date,
        time,
        user: req.user,
      });
    } catch (err) {
      console.error(err);
      req.flash(
        'error',
        'Une erreur est survenue lors du chargement du formulaire de modification',
      );
      res.redirect('/appointments');
    }
  },
);

// Traitement du formulaire de modification
router.post(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultant,
  async (req, res) => {
    try {
      const {
        beneficiaryId,
        title,
        date,
        time,
        duration,
        location,
        isOnline,
        meetingLink,
        notes,
        status,
      } = req.body;

      const appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          consultantId: req.user.id,
        },
      });

      if (!appointment) {
        req.flash('error', 'Rendez-vous non trouvé ou non autorisé');
        return res.redirect('/appointments');
      }

      // Vérifier que le bénéficiaire appartient bien au consultant
      const beneficiary = await Beneficiary.findOne({
        where: {
          id: beneficiaryId,
          consultantId: req.user.id,
        },
      });

      if (!beneficiary) {
        req.flash('error', 'Bénéficiaire non trouvé ou non autorisé');
        return res.redirect(`/appointments/${appointment.id}/edit`);
      }

      // Combiner date et heure
      const dateTime = new Date(`${date}T${time}`);

      // Mettre à jour le rendez-vous
      await appointment.update({
        title,
        date: dateTime,
        duration: parseInt(duration, 10),
        location,
        isOnline: isOnline === 'on',
        meetingLink,
        notes,
        status,
        beneficiaryId,
      });

      req.flash('success', 'Rendez-vous modifié avec succès');
      res.redirect(`/appointments/${appointment.id}`);
    } catch (err) {
      console.error(err);
      req.flash(
        'error',
        'Une erreur est survenue lors de la modification du rendez-vous',
      );
      res.redirect(`/appointments/${req.params.id}/edit`);
    }
  },
);

// Annuler un rendez-vous
router.post('/:id/cancel', ensureAuthenticated, async (req, res) => {
  try {
    let appointment;

    if (req.user.userType === 'consultant') {
      // Pour les consultants, vérifier que le rendez-vous leur appartient
      appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          consultantId: req.user.id,
        },
      });
    } else {
      // Pour les bénéficiaires, vérifier que le rendez-vous leur est assigné
      const beneficiary = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });

      if (!beneficiary) {
        req.flash('error', 'Profil bénéficiaire non trouvé');
        return res.redirect('/dashboard');
      }

      appointment = await Appointment.findOne({
        where: {
          id: req.params.id,
          beneficiaryId: beneficiary.id,
        },
      });
    }

    if (!appointment) {
      req.flash('error', 'Rendez-vous non trouvé ou non autorisé');
      return res.redirect('/appointments');
    }

    // Mettre à jour le statut du rendez-vous
    await appointment.update({
      status: 'cancelled',
    });

    req.flash('success', 'Rendez-vous annulé avec succès');
    res.redirect('/appointments');
  } catch (err) {
    console.error(err);
    req.flash(
      'error',
      "Une erreur est survenue lors de l'annulation du rendez-vous",
    );
    res.redirect('/appointments');
  }
});

module.exports = router;
