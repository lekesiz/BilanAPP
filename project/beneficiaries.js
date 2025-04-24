const express = require('express');

const router = express.Router();
const { Op } = require('sequelize');
const {
  ensureAuthenticated,
  ensureConsultant,
} = require('../middlewares/auth');
const { Beneficiary, User, Appointment } = require('../models');

// Liste des bénéficiaires
router.get('/', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.findAll({
      where: { consultantId: req.user.id },
      include: [
        { model: User, as: 'user' },
        {
          model: Appointment,
          as: 'beneficiaryAppointments',
          limit: 1,
          order: [['date', 'DESC']],
        },
      ],
    });

    res.render('beneficiaries/index', {
      title: 'Mes bénéficiaires',
      beneficiaries,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash(
      'error',
      'Une erreur est survenue lors du chargement des bénéficiaires',
    );
    res.redirect('/dashboard');
  }
});

// Formulaire d'ajout d'un bénéficiaire
router.get('/add', ensureAuthenticated, ensureConsultant, (req, res) => {
  res.render('beneficiaries/add', {
    title: 'Ajouter un bénéficiaire',
    user: req.user,
  });
});

// Traitement du formulaire d'ajout
router.post('/add', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, notes,
    } = req.body;

    // Vérifier si l'email existe déjà
    const existingBeneficiary = await Beneficiary.findOne({ where: { email } });
    if (existingBeneficiary) {
      req.flash('error', 'Un bénéficiaire avec cet email existe déjà');
      return res.redirect('/beneficiaries/add');
    }

    // Créer le bénéficiaire
    await Beneficiary.create({
      firstName,
      lastName,
      email,
      phone,
      notes,
      consultantId: req.user.id,
      status: 'initial',
      currentPhase: 'preliminary',
    });

    req.flash('success', 'Bénéficiaire ajouté avec succès');
    res.redirect('/beneficiaries');
  } catch (err) {
    console.error(err);
    req.flash(
      'error',
      "Une erreur est survenue lors de l'ajout du bénéficiaire",
    );
    res.redirect('/beneficiaries/add');
  }
});

// Détails d'un bénéficiaire
router.get('/:id', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: req.params.id,
        consultantId: req.user.id,
      },
      include: [
        { model: User, as: 'user' },
        {
          model: Appointment,
          as: 'beneficiaryAppointments',
          order: [['date', 'DESC']],
        },
      ],
    });

    if (!beneficiary) {
      req.flash('error', 'Bénéficiaire non trouvé');
      return res.redirect('/beneficiaries');
    }

    res.render('beneficiaries/details', {
      title: `Bénéficiaire: ${beneficiary.firstName} ${beneficiary.lastName}`,
      beneficiary,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash(
      'error',
      'Une erreur est survenue lors du chargement des détails du bénéficiaire',
    );
    res.redirect('/beneficiaries');
  }
});

// Formulaire de modification d'un bénéficiaire
router.get(
  '/:id/edit',
  ensureAuthenticated,
  ensureConsultant,
  async (req, res) => {
    try {
      const beneficiary = await Beneficiary.findOne({
        where: {
          id: req.params.id,
          consultantId: req.user.id,
        },
      });

      if (!beneficiary) {
        req.flash('error', 'Bénéficiaire non trouvé');
        return res.redirect('/beneficiaries');
      }

      res.render('beneficiaries/edit', {
        title: `Modifier: ${beneficiary.firstName} ${beneficiary.lastName}`,
        beneficiary,
        user: req.user,
      });
    } catch (err) {
      console.error(err);
      req.flash(
        'error',
        'Une erreur est survenue lors du chargement du formulaire de modification',
      );
      res.redirect('/beneficiaries');
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
        firstName, lastName, email, phone, notes, status, currentPhase,
      } =
        req.body;

      const beneficiary = await Beneficiary.findOne({
        where: {
          id: req.params.id,
          consultantId: req.user.id,
        },
      });

      if (!beneficiary) {
        req.flash('error', 'Bénéficiaire non trouvé');
        return res.redirect('/beneficiaries');
      }

      // Mettre à jour le bénéficiaire
      await beneficiary.update({
        firstName,
        lastName,
        email,
        phone,
        notes,
        status,
        currentPhase,
      });

      req.flash('success', 'Bénéficiaire modifié avec succès');
      res.redirect(`/beneficiaries/${beneficiary.id}`);
    } catch (err) {
      console.error(err);
      req.flash(
        'error',
        'Une erreur est survenue lors de la modification du bénéficiaire',
      );
      res.redirect(`/beneficiaries/${req.params.id}/edit`);
    }
  },
);

module.exports = router;
