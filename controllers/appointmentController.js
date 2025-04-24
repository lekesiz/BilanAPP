const { Op } = require('sequelize');
const { Appointment, Beneficiary, User } = require('../models');

// GET /appointments - List Appointments
exports.listAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;
    const whereClause = {};
    const {
      beneficiary, status, date_start, date_end,
    } = req.query;
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
    if (date_start || date_end) {
      whereClause.date = {};
      if (date_start) whereClause.date[Op.gte] = new Date(date_start);
      if (date_end) whereClause.date[Op.lte] = new Date(date_end);
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
        date_start: date_start || '',
        date_end: date_end || '',
      },
    });
  } catch (err) {
    console.error('Appointments list error:', err);
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
    console.error('New appointment form error:', error);
    req.flash('error_msg', 'Erreur chargement formulaire RDV.');
    res.redirect('/appointments');
  }
};

// POST /appointments/new - Add New Appointment
exports.addAppointment = async (req, res) => {
  const {
    beneficiaryId, date, time, type, description, location, notes,
  } =
    req.body;
  const dateTime = `${date} ${time}`;

  try {
    let consultantId;
    let finalBeneficiaryId = beneficiaryId;

    if (req.user.userType === 'consultant') {
      consultantId = req.user.id;
      const isOwnBeneficiary = await Beneficiary.findOne({
        where: { id: beneficiaryId, consultantId: req.user.id },
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
      date: dateTime,
      type,
      description,
      location,
      notes,
      status: 'scheduled',
    });

    req.flash('success_msg', 'Rendez-vous planifié.');
    res.redirect('/appointments');
  } catch (err) {
    console.error('Appointment add error:', err);
    req.flash('error_msg', 'Erreur lors de la planification du RDV.');
    res.redirect('/appointments/new'); // Consider re-rendering with data
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
      req.user.userType === 'consultant' &&
      appointment.consultantId === req.user.id;
    const isBeneficiaryOwner =
      req.user.userType === 'beneficiary' &&
      appointment.beneficiary?.userId === req.user.id;

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
    console.error('Appointment edit form error:', err);
    req.flash('error_msg', 'Erreur chargement formulaire modification RDV.');
    res.redirect('/appointments');
  }
};

// POST /appointments/:id/edit - Update Appointment
exports.updateAppointment = async (req, res) => {
  const {
    beneficiaryId,
    date,
    time,
    type,
    description,
    location,
    notes,
    status,
  } = req.body;
  const appointmentId = req.params.id;
  const dateTime = `${date} ${time}`;

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
      req.user.userType === 'consultant' &&
      appointment.consultantId === req.user.id;
    const isBeneficiaryOwner =
      req.user.userType === 'beneficiary' &&
      appointment.beneficiary?.userId === req.user.id;

    if (!(isAdmin || isConsultantOwner || isBeneficiaryOwner)) {
      req.flash('error_msg', 'Accès non autorisé pour modifier ce RDV.');
      return res.redirect('/appointments');
    }

    let finalBeneficiaryId = appointment.beneficiaryId;
    if (
      (isAdmin || req.user.userType === 'consultant') &&
      beneficiaryId &&
      beneficiaryId != appointment.beneficiaryId
    ) {
      const benefWhere = { id: beneficiaryId };
      if (!isAdmin) benefWhere.consultantId = req.user.id;
      const canAssignBeneficiary = await Beneficiary.findOne({
        where: benefWhere,
      });
      if (!canAssignBeneficiary) {
        req.flash(
          'error_msg',
          'Sélection bénéficiaire invalide ou non autorisé.',
        );
        return res.redirect(`/appointments/${appointmentId}/edit`);
      }
      finalBeneficiaryId = beneficiaryId;
    } else if (
      req.user.userType === 'beneficiary' &&
      beneficiaryId &&
      beneficiaryId != appointment.beneficiaryId
    ) {
      req.flash('error_msg', 'Impossible de changer le bénéficiaire assigné.');
      return res.redirect(`/appointments/${appointmentId}/edit`);
    }

    await appointment.update({
      beneficiaryId: finalBeneficiaryId,
      date: dateTime,
      type,
      description,
      location,
      notes,
      status,
    });

    req.flash('success_msg', 'Rendez-vous modifié.');
    res.redirect('/appointments');
  } catch (err) {
    console.error('Appointment edit error:', err);
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
      req.user.userType === 'consultant' &&
      appointment.consultantId === req.user.id;
    const isBeneficiaryOwner =
      req.user.userType === 'beneficiary' &&
      appointment.beneficiary?.userId === req.user.id;

    if (!(isAdmin || isConsultantOwner || isBeneficiaryOwner)) {
      req.flash('error_msg', 'Accès non autorisé pour supprimer ce RDV.');
      return res.redirect('/appointments');
    }

    await appointment.destroy(); // Relies on onDelete: CASCADE defined in Appointment model
    req.flash('success_msg', 'Rendez-vous supprimé.');
    res.redirect('/appointments');
  } catch (err) {
    console.error('Appointment delete error:', err);
    req.flash('error_msg', 'Erreur lors de la suppression du RDV.');
    res.redirect('/appointments');
  }
};
