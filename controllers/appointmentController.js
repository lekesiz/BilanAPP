const { Op } = require('sequelize');
const { Appointment, Beneficiary, User } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

// GET /appointments - List Appointments
exports.listAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;
    const whereClause = {};
    const { beneficiary, status, dateStart, dateEnd } = req.query;
    const { userType } = req.user;
    const userId = req.user.id;
    const isAdmin = req.user.forfaitType === 'Admin';

    if (!isAdmin) {
      if (userType === 'consultant') {
        whereClause.consultantId = userId;
        if (beneficiary) whereClause.beneficiaryId = beneficiary;
      } else {
        // beneficiary
        const beneficiaryProfile = await Beneficiary.findOne({
          where: { userId },
          attributes: ['id'],
        });
        if (!beneficiaryProfile) return res.redirect('/dashboard');
        whereClause.beneficiaryId = beneficiaryProfile.id;
      }
    }

    if (status) whereClause.status = status;
    if (dateStart || dateEnd) {
      whereClause.date = {};
      if (dateStart) whereClause.date[Op.gte] = new Date(dateStart);
      if (dateEnd) whereClause.date[Op.lte] = new Date(dateEnd);
    }

    const queryOptions = {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'consultant',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Beneficiary,
          as: 'beneficiary',
          attributes: ['id', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [['date', 'DESC']],
    };

    const { count, rows } = await Appointment.findAndCountAll(queryOptions);
    const appointments = rows.map((a) => a.get({ plain: true }));

    let beneficiariesForFilter = [];
    if (isAdmin || userType === 'consultant') {
      const whereCondition = isAdmin ? {} : { consultantId: userId };
      const benefs = await Beneficiary.findAll({
        where: whereCondition,
        attributes: ['id'],
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      beneficiariesForFilter = benefs.map((b) => b.get({ plain: true }));
    }

    const totalPages = Math.ceil(count / limit);

    res.render('appointments/index', {
      title: 'Rendez-vous',
      appointments,
      beneficiaries: beneficiariesForFilter,
      selectedBeneficiary: beneficiary,
      user: req.user,
      isConsultant: userType === 'consultant',
      isAdmin,
      pagination: {
        page,
        limit,
        totalRows: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        beneficiary: beneficiary || '',
        status: status || '',
        date_start: dateStart || '',
        date_end: dateEnd || '',
      },
    });
  } catch (err) {
    logger.error('Appointments list error:', { error: err });
    req.flash('error_msg', 'Erreur lors du chargement des rendez-vous.');
    res.redirect('/dashboard');
  }
};

// GET /appointments/new - Show New Appointment Form
exports.showNewForm = async (req, res) => {
  try {
    let beneficiaries = [];
    let preselectedBeneficiary = req.query.beneficiary;
    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultant = req.user.userType === 'consultant';

    if (isAdmin || isConsultant) {
      const whereCondition = isAdmin ? {} : { consultantId: req.user.id };
      const rawBeneficiaries = await Beneficiary.findAll({
        where: whereCondition,
        include: { model: User, as: 'user' },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      beneficiaries = rawBeneficiaries.map((b) => b.get({ plain: true }));
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });
      if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profil non trouvé.');
        return res.redirect('/appointments');
      }
      preselectedBeneficiary = beneficiaryProfile.id;
    }

    res.render('appointments/new', {
      title: 'Planifier un rendez-vous',
      user: req.user,
      beneficiaries,
      preselectedBeneficiary,
      isConsultant: req.user.userType === 'consultant',
    });
  } catch (error) {
    logger.error('New appointment form error:', { error: error });
    req.flash('error_msg', 'Erreur chargement formulaire RDV.');
    res.redirect('/appointments');
  }
};

// POST /appointments/new - Add New Appointment
exports.addAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      let beneficiaries = [];
      const isAdmin = req.user.forfaitType === 'Admin';
      const isConsultant = req.user.userType === 'consultant';
      if (isAdmin || isConsultant) {
        const whereCondition = isAdmin ? {} : { consultantId: req.user.id };
        const rawBeneficiaries = await Beneficiary.findAll({
          where: whereCondition,
          include: { model: User, as: 'user' },
        });
        beneficiaries = rawBeneficiaries.map((b) => b.get({ plain: true }));
      }
      return res.render('appointments/new', {
        title: 'Planifier un rendez-vous',
        user: req.user,
        beneficiaries,
        preselectedBeneficiary: req.body.beneficiaryId,
        isConsultant,
        errors: errors.array(),
        formData: req.body,
      });
    } catch (renderError) {
      logger.error('Error re-rendering new appointment form:', { error: renderError });
      req.flash('error_msg', "Erreur lors de l'affichage du formulaire.");
      return res.redirect('/appointments');
    }
  }

  const { beneficiaryId, date, time, type, description, location, notes } = req.body;
  const dateTime = `${date} ${time}:00`;

  try {
    let consultantId;
    let finalBeneficiaryId = beneficiaryId;

    if (req.user.userType === 'consultant') {
      consultantId = req.user.id;
      const isOwnBeneficiary = await Beneficiary.findOne({
        where: { id: finalBeneficiaryId, consultantId: req.user.id },
      });
      if (!isOwnBeneficiary) {
        req.flash('error_msg', 'Sélection bénéficiaire invalide.');
        return res.redirect('/appointments/new');
      }
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });
      if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profil non trouvé.');
        return res.redirect('/appointments');
      }
      consultantId = beneficiaryProfile.consultantId;
      finalBeneficiaryId = beneficiaryProfile.id;
    }

    await Appointment.create({
      consultantId,
      beneficiaryId: finalBeneficiaryId,
      date: new Date(dateTime),
      type,
      description,
      location,
      notes,
      status: 'scheduled',
    });

    req.flash('success_msg', 'Rendez-vous planifié.');
    res.redirect('/appointments');
  } catch (err) {
    logger.error('Appointment add error:', { error: err, body: req.body });
    req.flash('error_msg', 'Erreur lors de la planification du RDV.');
    try {
      let beneficiaries = [];
      const isAdmin = req.user.forfaitType === 'Admin';
      const isConsultant = req.user.userType === 'consultant';
      if (isAdmin || isConsultant) {
        const whereCondition = isAdmin ? {} : { consultantId: req.user.id };
        const rawBeneficiaries = await Beneficiary.findAll({
          where: whereCondition,
          include: { model: User, as: 'user' },
        });
        beneficiaries = rawBeneficiaries.map((b) => b.get({ plain: true }));
      }
      return res.render('appointments/new', {
        title: 'Planifier un rendez-vous',
        user: req.user,
        beneficiaries,
        preselectedBeneficiary: req.body.beneficiaryId,
        isConsultant,
        errors: [{ msg: req.flash('error_msg') }],
        formData: req.body,
      });
    } catch (renderError) {
      logger.error('Error re-rendering new appointment form on catch:', { error: renderError });
      return res.redirect('/appointments');
    }
  }
};

// GET /appointments/:id/edit - Show Edit Appointment Form
exports.showEditForm = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'consultant',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Beneficiary,
          as: 'beneficiary',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
      ],
    });

    if (!appointment) {
      req.flash('error_msg', 'Rendez-vous non trouvé.');
      return res.redirect('/appointments');
    }

    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultantOwner =
      req.user.userType === 'consultant' && appointment.consultantId === req.user.id;
    const isBeneficiaryOwner =
      req.user.userType === 'beneficiary' && appointment.beneficiary?.userId === req.user.id;

    if (!(isAdmin || isConsultantOwner || isBeneficiaryOwner)) {
      req.flash('error_msg', 'Accès non autorisé pour modifier ce RDV.');
      return res.redirect('/appointments');
    }

    let beneficiaries = [];
    if (req.user.userType === 'consultant' || isAdmin) {
      const whereCondition = isAdmin ? {} : { consultantId: req.user.id };
      const rawBenefs = await Beneficiary.findAll({
        where: whereCondition,
        include: { model: User, as: 'user' },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      beneficiaries = rawBenefs.map((b) => b.get({ plain: true }));
    }

    res.render('appointments/edit', {
      title: 'Modifier le rendez-vous',
      appointment: appointment.get({ plain: true }),
      appointmentDate: new Date(appointment.date).toISOString().split('T')[0],
      appointmentTime: new Date(appointment.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      beneficiaries,
      user: req.user,
      isConsultant: req.user.userType === 'consultant',
    });
  } catch (err) {
    logger.error('Appointment edit form error:', { error: err });
    req.flash('error_msg', 'Erreur chargement formulaire modification RDV.');
    res.redirect('/appointments');
  }
};

// POST /appointments/:id/edit - Update Appointment
exports.updateAppointment = async (req, res) => {
  const appointmentId = req.params.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      const appointment = await Appointment.findByPk(appointmentId, {
        include: [{ model: Beneficiary, as: 'beneficiary' }],
      });
      if (!appointment) {
        req.flash('error_msg', 'Rendez-vous non trouvé.');
        return res.redirect('/appointments');
      }

      let beneficiaries = [];
      if (req.user.userType === 'consultant' || req.user.forfaitType === 'Admin') {
        const whereCondition =
          req.user.forfaitType === 'Admin' ? {} : { consultantId: req.user.id };
        beneficiaries = (await Beneficiary.findAll({ where: whereCondition, include: 'user' })).map(
          (b) => b.get({ plain: true }),
        );
      }

      return res.render('appointments/edit', {
        title: 'Modifier le rendez-vous',
        appointment: appointment.get({ plain: true }),
        appointmentDate: req.body.date,
        appointmentTime: req.body.time,
        beneficiaries,
        user: req.user,
        isConsultant: req.user.userType === 'consultant',
        errors: errors.array(),
        formData: req.body,
      });
    } catch (renderError) {
      logger.error('Error re-rendering edit appointment form:', { error: renderError });
      req.flash('error_msg', "Erreur lors de l'affichage du formulaire.");
      return res.redirect('/appointments');
    }
  }

  const { beneficiaryId, date, time, type, description, location, notes, status } = req.body;
  const dateTime = `${date} ${time}:00`;

  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [{ model: Beneficiary, as: 'beneficiary' }],
    });
    if (!appointment) {
      req.flash('error_msg', 'Rendez-vous non trouvé.');
      return res.redirect('/appointments');
    }

    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultantOwner =
      req.user.userType === 'consultant' && appointment.consultantId === req.user.id;
    const isBeneficiaryOwner =
      req.user.userType === 'beneficiary' && appointment.beneficiary?.userId === req.user.id;

    if (!(isAdmin || isConsultantOwner || isBeneficiaryOwner)) {
      req.flash('error_msg', 'Accès non autorisé pour modifier ce RDV.');
      return res.redirect('/appointments');
    }

    let finalBeneficiaryId = appointment.beneficiaryId;
    if (
      (isAdmin || req.user.userType === 'consultant') &&
      beneficiaryId &&
      beneficiaryId !== appointment.beneficiaryId
    ) {
      const benefWhere = { id: beneficiaryId };
      if (!isAdmin) benefWhere.consultantId = req.user.id;
      const canAssignBeneficiary = await Beneficiary.findOne({
        where: benefWhere,
      });
      if (!canAssignBeneficiary) {
        req.flash('error_msg', 'Sélection bénéficiaire invalide ou non autorisé.');
        return res.redirect(`/appointments/${appointmentId}/edit`);
      }
      finalBeneficiaryId = beneficiaryId;
    } else if (
      req.user.userType === 'beneficiary' &&
      beneficiaryId &&
      beneficiaryId !== appointment.beneficiaryId
    ) {
      req.flash('error_msg', 'Impossible de changer le bénéficiaire assigné.');
      return res.redirect(`/appointments/${appointmentId}/edit`);
    }

    await appointment.update({
      beneficiaryId: finalBeneficiaryId,
      date: new Date(dateTime),
      type,
      description,
      location,
      notes,
      status,
    });

    req.flash('success_msg', 'Rendez-vous modifié.');
    res.redirect('/appointments');
  } catch (err) {
    logger.error('Appointment edit error:', { error: err, appointmentId: appointmentId });
    req.flash('error_msg', 'Erreur lors de la modification du RDV.');
    res.redirect(`/appointments/${appointmentId}/edit`);
  }
};

// POST /appointments/:id/delete - Delete Appointment
exports.deleteAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  try {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [{ model: Beneficiary, as: 'beneficiary' }],
    });
    if (!appointment) {
      req.flash('error_msg', 'Rendez-vous non trouvé.');
      return res.redirect('/appointments');
    }

    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultantOwner =
      req.user.userType === 'consultant' && appointment.consultantId === req.user.id;
    const isBeneficiaryOwner =
      req.user.userType === 'beneficiary' && appointment.beneficiary?.userId === req.user.id;

    if (!(isAdmin || isConsultantOwner || isBeneficiaryOwner)) {
      req.flash('error_msg', 'Accès non autorisé pour supprimer ce RDV.');
      return res.redirect('/appointments');
    }

    await appointment.destroy(); // Relies on onDelete: CASCADE defined in Appointment model
    req.flash('success_msg', 'Rendez-vous supprimé.');
    res.redirect('/appointments');
  } catch (err) {
    logger.error('Appointment delete error:', { error: err, appointmentId: appointmentId });
    req.flash('error_msg', 'Erreur lors de la suppression du RDV.');
    res.redirect('/appointments');
  }
};
