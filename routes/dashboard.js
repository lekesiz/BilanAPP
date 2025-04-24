const express = require('express');

const router = express.Router();
const { Op } = require('sequelize');
const {
  ensureAuthenticated,
  ensureBeneficiary,
} = require('../middlewares/auth');
const {
  User,
  Beneficiary,
  Appointment,
  Message,
  Questionnaire,
} = require('../models');

// --- Helper Functions (Moved Before Usage) ---

// Danışman istatistiklerini hesapla
async function getConsultantStats(consultantId, isAdmin = false) {
  // Sorgular için temel where koşulu
  const baseWhereBeneficiary = isAdmin ? {} : { consultantId };
  const baseWhereAppointment = isAdmin ? {} : { consultantId };

  // Promise.all ile sorguları paralelleştir
  const [
    beneficiaryCount,
    activeBeneficiaryCount, // Replaced phase counts with just active count
    upcomingAppointmentsCount,
    unreadMessagesCount,
    pendingQuestionnairesCount,
    missingConsentsCount,
  ] = await Promise.all([
    Beneficiary.count({ where: baseWhereBeneficiary }),
    Beneficiary.count({ where: { ...baseWhereBeneficiary, status: 'active' } }), // Count active beneficiaries
    // Beneficiary.count({ where: { ...baseWhereBeneficiary, currentPhase: 'preliminary' } }), // Removed
    // Beneficiary.count({ where: { ...baseWhereBeneficiary, currentPhase: 'investigation' } }), // Removed
    // Beneficiary.count({ where: { ...baseWhereBeneficiary, currentPhase: 'conclusion' } }), // Removed
    Appointment.count({
      where: {
        ...baseWhereAppointment,
        status: 'scheduled',
        date: { [Op.gte]: new Date() },
      },
    }),
    Message.count({
      where: isAdmin ?
        { isRead: false } : // Admin sees ALL unread messages
        { consultantId, isRead: false, senderId: { [Op.ne]: consultantId } }, // Consultant sees messages sent TO them
    }),
    Questionnaire.count({
      // Admin sees all pending. Consultant sees questionnaires FOR their beneficiaries.
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
    activeBeneficiaryCount, // Updated stat name
    // preliminaryCount, // Removed
    // investigationCount, // Removed
    // conclusionCount, // Removed
    upcomingAppointmentsCount,
    unreadMessagesCount,
    pendingQuestionnairesCount,
    missingConsentsCount,
  };
}

// Son aktiviteleri al (Sadece Danışman için)
async function getRecentActivities(consultantId) {
  // Return empty if called for Admin (handled in the route handler now)
  // if (!consultantId) return []; // Or keep this check

  const activities = [];
  // Fetch in parallel
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
      type: 'beneficiary', // Add type for potential filtering/icon
      title: 'Nouveau Bénéficiaire',
      description: `${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      link: `/beneficiaries/${beneficiary.id}`, // Add link
      date: beneficiary.createdAt,
    });
  });
  recentAppointments.forEach((appointment) => {
    if (!appointment.beneficiary) return; // Skip if beneficiary somehow missing
    activities.push({
      type: 'appointment', // Add type
      title: 'Nouveau Rendez-vous',
      description: `${appointment.type} avec ${appointment.beneficiary.user.firstName} ${appointment.beneficiary.user.lastName}`,
      link: `/appointments#appt-${appointment.id}`, // Link needs refinement
      date: appointment.createdAt,
    });
  });

  // Sort and limit combined activities
  return activities.sort((a, b) => b.date - a.date).slice(0, 5);
}

// --- Routes ---

// Ana dashboard (kullanıcı tipine göre yönlendirme)
router.get('/', ensureAuthenticated, (req, res) => {
  // console.log('[DEBUG] GET /dashboard - req.user:', req.user?.get({ plain: true })); // Debug log eklendi
  const userType = req.user?.userType?.toLowerCase();
  if (userType === 'consultant') {
    // console.log('[DEBUG] Redirecting to /dashboard/consultant');
    res.redirect('/dashboard/consultant');
  } else if (userType === 'beneficiary') {
    // console.log('[DEBUG] Redirecting to /dashboard/beneficiary');
    res.redirect('/dashboard/beneficiary');
  } else {
    // Kullanıcı tipi tanımsız veya hatalıysa?
    // console.error('[ERROR] Unknown userType in GET /dashboard:', req.user?.userType);
    req.flash(
      'error_msg',
      "Type d'utilisateur inconnu pour accéder au tableau de bord.",
    );
    res.redirect('/auth/login');
  }
});

// Danışman dashboard'u
router.get('/consultant', ensureAuthenticated, async (req, res) => {
  try {
    const consultantId = req.user.id;
    const isAdmin = req.user.forfaitType === 'Admin';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch data in parallel
    const [
      stats,
      appointmentsRaw,
      recentActivities, // Will be empty for Admin based on current function
      followUpBeneficiariesRaw,
      recentlyCompletedQuestionnairesRaw,
      beneficiariesForAlertsRaw,
      overdueQuestionnairesRaw,
    ] = await Promise.all([
      getConsultantStats(consultantId, isAdmin), // İstatistikleri hesapla
      // Yaklaşan randevuları al (Admin tümünü görür)
      Appointment.findAll({
        where: {
          ...(isAdmin ? {} : { consultantId }),
          date: { [Op.gte]: new Date() },
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
      // Son aktiviteleri al (Sadece Danışman için)
      isAdmin ? Promise.resolve([]) : getRecentActivities(consultantId), // Return empty array for admin
      // Takip Görüşmesi Hatırlatıcıları (Admin tümünü görür)
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
      // Son Tamamlanan Anketler (Admin tümünü görür)
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
      // Consent Alert için Beneficiary'ler (Admin tümünü görür)
      Beneficiary.findAll({
        where: isAdmin ? {} : { consultantId },
        attributes: ['id', 'userId', 'consentGiven'],
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      }),
      // Teslim tarihi geçmiş anketler (Admin tümünü görür)
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

    res.render('dashboard/consultant', {
      title: isAdmin ? 'Tableau de bord Admin' : 'Tableau de bord Consultant', // Update title for Admin
      user: req.user,
      stats,
      upcomingAppointments,
      recentActivities, // Will be empty for Admin
      followUpBeneficiaries,
      recentlyCompletedQuestionnaires,
      missingConsents,
      overdueQuestionnaires,
      isAdmin,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash(
      'error',
      'Une erreur est survenue lors du chargement du tableau de bord',
    );
    res.redirect('/');
  }
});

// Yararlanıcı dashboard'u
router.get(
  '/beneficiary',
  ensureAuthenticated,
  ensureBeneficiary,
  async (req, res) => {
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

      const upcomingAppointments = await Appointment.findAll({
        where: {
          beneficiaryId: beneficiary.id,
          date: {
            [Op.gte]: new Date(),
          },
        },
        order: [['date', 'ASC']],
        limit: 3,
      });

      const pendingQuestionnaires = await Questionnaire.findAll({
        where: {
          beneficiaryId: beneficiary.id,
          status: 'pending',
        },
        limit: 5,
      });

      res.render('dashboard/beneficiary', {
        title: 'Mon Bilan de Compétences',
        user: req.user,
        beneficiary,
        upcomingAppointments,
        pendingQuestionnaires,
      });
    } catch (error) {
      console.error('Beneficiary dashboard error:', error);
      req.flash(
        'error',
        'Une erreur est survenue lors du chargement du tableau de bord',
      );
      res.redirect('/');
    }
  },
);

// --- Helper Functions (Definitions Moved Above) ---
/*
async function getConsultantStats(consultantId, isAdmin = false) {
  ...
}
async function getRecentActivities(consultantId) {
  ...
}
*/

module.exports = router;
