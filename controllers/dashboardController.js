const { Op } = require('sequelize');
const {
  User,
  Beneficiary,
  Appointment,
  Message,
  Questionnaire,
  Document,
} = require('../models');
const { getRecentActivitiesFor } = require('../utils/activity');

// --- Helper Functions ---

// Calculate consultant/admin stats
async function getConsultantStats(consultantId, isAdmin = false) {
  const baseWhereBeneficiary = isAdmin ? {} : { consultantId };
  const baseWhereAppointment = isAdmin ? {} : { consultantId };

  const [
    beneficiaryCount,
    activeBeneficiaryCount,
    upcomingAppointmentsCount,
    unreadMessagesCount,
    pendingQuestionnairesCount,
    missingConsentsCount,
  ] = await Promise.all([
    Beneficiary.count({ where: baseWhereBeneficiary }),
    Beneficiary.count({ where: { ...baseWhereBeneficiary, status: 'active' } }),
    Appointment.count({
      where: { ...baseWhereAppointment, date: { [Op.gte]: new Date() } },
    }),
    Message.count({
      where: isAdmin ?
        { isRead: false } : // Admin sees ALL unread messages
        { consultantId, isRead: false, senderId: { [Op.ne]: consultantId } },
    }),
    Questionnaire.count({
      where: isAdmin ?
        { status: 'pending' } :
        {
          status: 'pending',
          beneficiaryId: {
            [Op.in]: (
              await Beneficiary.findAll({
                where: { consultantId },
                attributes: ['id'],
              })
            ).map((b) => b.id),
          },
        },
    }),
    Beneficiary.count({
      where: { ...baseWhereBeneficiary, consentGiven: false },
    }),
  ]);

  return {
    beneficiaryCount,
    activeBeneficiaryCount,
    upcomingAppointmentsCount,
    unreadMessagesCount,
    pendingQuestionnairesCount,
    missingConsentsCount,
  };
}

// Get recent activities (Consultant only)
async function getRecentActivities(consultantId) {
  const activities = [];
  const [recentBeneficiaries, recentAppointments] = await Promise.all([
    Beneficiary.findAll({
      where: { consultantId },
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 3,
    }),
    Appointment.findAll({
      where: { consultantId },
      include: [
        {
          model: Beneficiary,
          as: 'beneficiary',
          include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 3,
    }),
  ]);

  recentBeneficiaries.forEach((beneficiary) => {
    activities.push({
      type: 'beneficiary',
      title: 'Nouveau Bénéficiaire',
      description: `${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      link: `/beneficiaries/${beneficiary.id}`,
      date: beneficiary.createdAt,
    });
  });
  recentAppointments.forEach((appointment) => {
    if (!appointment.beneficiary) return;
    activities.push({
      type: 'appointment',
      title: 'Nouveau Rendez-vous',
      description: `${appointment.type} avec ${appointment.beneficiary.user.firstName} ${appointment.beneficiary.user.lastName}`,
      link: `/appointments#appt-${appointment.id}`,
      date: appointment.createdAt,
    });
  });

  return activities.sort((a, b) => b.date - a.date).slice(0, 5);
}

// --- Route Handlers ---

// GET /dashboard - Redirect based on user type
exports.redirectToDashboard = (req, res) => {
  // console.log('[DEBUG] GET /dashboard - req.user:', req.user?.get({ plain: true }));
  // console.log('[DEBUG] GET /dashboard - userType:', req.user?.userType);
  // console.log('[DEBUG] GET /dashboard - instanceof User:', req.user?.constructor?.name);

  // Ensure userType is pulled directly from the object in case of get method issues
  const userType =
    req.user?.userType || (req.user?.get ? req.user?.get('userType') : null);
  // console.log('[DEBUG] GET /dashboard - extracted userType:', userType);

  if (userType === 'consultant') {
    // console.log('[DEBUG] Redirecting to /dashboard/consultant');
    return res.redirect('/dashboard/consultant');
  } if (userType === 'beneficiary') {
    // console.log('[DEBUG] Redirecting to /dashboard/beneficiary');
    return res.redirect('/dashboard/beneficiary');
  }
  // console.error('[ERROR] Unknown userType in GET /dashboard:', userType);
  req.flash('error_msg', "Type d'utilisateur inconnu.");
  return res.redirect('/auth/login');
};

// GET /dashboard/consultant - Show Consultant/Admin Dashboard
exports.showConsultantDashboard = async (req, res) => {
  const consultantId = req.user.id;
  const isAdmin = req.user.forfaitType === 'Admin';
  // console.log('[DEBUG] showConsultantDashboard - consultantId:', consultantId, 'isAdmin:', isAdmin);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // console.log('[DEBUG] Today date used for queries:', today);

    // Fetch data in parallel
    const [
      stats,
      appointmentsRaw,
      recentActivities,
      followUpBeneficiariesRaw,
      recentlyCompletedQuestionnairesRaw,
      beneficiariesForAlertsRaw,
      overdueQuestionnairesRaw,
    ] = await Promise.all([
      getConsultantStats(consultantId, isAdmin),
      Appointment.findAll({
        where: {
          ...(isAdmin ? {} : { consultantId }),
          date: { [Op.gte]: today },
        },
        include: [
          {
            model: Beneficiary,
            as: 'beneficiary',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName'],
              },
            ],
          },
        ],
        order: [['date', 'ASC']],
        limit: 5,
      }),
      getRecentActivitiesFor(isAdmin ? null : consultantId),
      Beneficiary.findAll({
        where: {
          ...(isAdmin ? {} : { consultantId }),
          followUpDate: {
            [Op.ne]: null,
            [Op.lte]: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
        order: [['followUpDate', 'ASC']],
      }),
      Questionnaire.findAll({
        where: {
          ...(isAdmin ?
            {} :
            {
              beneficiaryId: {
                [Op.in]: (
                  await Beneficiary.findAll({
                    where: { consultantId },
                    attributes: ['id'],
                  })
                ).map((b) => b.id),
              },
            }),
          status: 'completed',
          updatedAt: {
            [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: [
          {
            model: Beneficiary,
            as: 'beneficiary',
            include: { model: User, as: 'user' },
          },
          { model: User, as: 'creator' },
        ],
        order: [['updatedAt', 'DESC']],
        limit: 5,
      }),
      Beneficiary.findAll({
        where: isAdmin ? {} : { consultantId },
        attributes: ['id', 'userId', 'consentGiven'],
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      }),
      Questionnaire.findAll({
        where: {
          ...(isAdmin ?
            {} :
            {
              beneficiaryId: {
                [Op.in]: (
                  await Beneficiary.findAll({
                    where: { consultantId },
                    attributes: ['id'],
                  })
                ).map((b) => b.id),
              },
            }),
          status: 'pending',
          dueDate: { [Op.ne]: null, [Op.lt]: today },
        },
        include: [
          {
            model: Beneficiary,
            as: 'beneficiary',
            include: { model: User, as: 'user' },
          },
        ],
        order: [['dueDate', 'ASC']],
        limit: 5,
      }),
    ]);

    // Process raw data
    const upcomingAppointments = appointmentsRaw.map((a) =>
      a.get({ plain: true }),
    );
    // console.log(`[DEBUG] Upcoming appointments found: ${upcomingAppointments.length}`);
    // console.log('[DEBUG] Appointment details:', JSON.stringify(upcomingAppointments, null, 2));

    const followUpBeneficiaries = followUpBeneficiariesRaw.map((b) =>
      b.get({ plain: true }),
    );
    const recentlyCompletedQuestionnaires =
      recentlyCompletedQuestionnairesRaw.map((q) => q.get({ plain: true }));
    const beneficiariesForAlerts = beneficiariesForAlertsRaw.map((b) =>
      b.get({ plain: true }),
    );
    const missingConsents = beneficiariesForAlerts.filter(
      (b) => !b.consentGiven,
    );
    const overdueQuestionnaires = overdueQuestionnairesRaw.map((q) =>
      q.get({ plain: true }),
    );

    // Add preliminary/investigation/conclusion phase counts
    stats.preliminaryCount = await Beneficiary.count({
      where: {
        ...(isAdmin ? {} : { consultantId }),
        currentPhase: 'preliminary',
      },
    });
    stats.investigationCount = await Beneficiary.count({
      where: {
        ...(isAdmin ? {} : { consultantId }),
        currentPhase: 'investigation',
      },
    });
    stats.conclusionCount = await Beneficiary.count({
      where: {
        ...(isAdmin ? {} : { consultantId }),
        currentPhase: 'conclusion',
      },
    });

    res.render('dashboard/consultant', {
      title: isAdmin ? 'Tableau de bord Admin' : 'Tableau de bord Consultant',
      user: req.user,
      stats,
      upcomingAppointments,
      recentActivities,
      followUpBeneficiaries,
      recentlyCompletedQuestionnaires,
      missingConsents,
      overdueQuestionnaires,
      isAdmin,
    });
  } catch (error) {
    // console.error('Dashboard error:', error);
    req.flash(
      'error',
      'Une erreur est survenue lors du chargement du tableau de bord',
    );
    res.redirect('/');
  }
};

// GET /dashboard/beneficiary - Show Beneficiary Dashboard
exports.showBeneficiaryDashboard = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'consultant',
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!beneficiary) {
      req.flash('error_msg', 'Profil bénéficiaire non trouvé.');
      return res.redirect('/'); // Or maybe login?
    }

    const [upcomingAppointments, pendingQuestionnaires, recentActivities] =
      await Promise.all([
        Appointment.findAll({
          where: {
            beneficiaryId: beneficiary.id,
            date: { [Op.gte]: new Date() },
          },
          order: [['date', 'ASC']],
          limit: 3,
        }),
        Questionnaire.findAll({
          where: { beneficiaryId: beneficiary.id, status: 'pending' },
          limit: 5,
        }),
        getRecentActivitiesFor(beneficiary.id),
      ]);

    res.render('dashboard/beneficiary', {
      title: 'Mon Bilan de Compétences',
      user: req.user,
      beneficiary: beneficiary.get({ plain: true }),
      upcomingAppointments: upcomingAppointments.map((a) =>
        a.get({ plain: true }),
      ),
      pendingQuestionnaires: pendingQuestionnaires.map((q) =>
        q.get({ plain: true }),
      ),
      recentActivities,
    });
  } catch (error) {
    // console.error('Beneficiary dashboard error:', error);
    req.flash(
      'error',
      'Une erreur est survenue lors du chargement du tableau de bord',
    );
    res.redirect('/');
  }
};
