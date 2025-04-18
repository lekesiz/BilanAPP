const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureConsultant, ensureBeneficiary } = require('../middlewares/auth');
const { User, Beneficiary, Appointment, Message, Questionnaire } = require('../models');
const { Op } = require('sequelize');

// Ana dashboard (kullanıcı tipine göre yönlendirme)
router.get('/', ensureAuthenticated, (req, res) => {
  if (req.user.userType === 'consultant') {
    res.redirect('/dashboard/consultant');
  } else {
    res.redirect('/dashboard/beneficiary');
  }
});

// Danışman dashboard'u
router.get('/consultant', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const consultantId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // İstatistikleri hesapla
    const stats = await getConsultantStats(consultantId);
    
    // Yaklaşan randevuları al
    const upcomingAppointments = await Appointment.findAll({
      where: {
        consultantId,
        date: {
          [Op.gte]: new Date()
        }
      },
      include: [{
        model: Beneficiary,
        as: 'beneficiary',
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }]
      }],
      order: [['date', 'ASC']],
      limit: 5
    });

    // Son aktiviteleri al
    const recentActivities = await getRecentActivities(consultantId);

    // Takip Görüşmesi Hatırlatıcıları
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const followUpBeneficiaries = await Beneficiary.findAll({
        where: {
            consultantId,
            followUpDate: {
                [Op.ne]: null, // Takip tarihi atanmış olanlar
                [Op.lte]: thirtyDaysFromNow // Önümüzdeki 30 gün içinde veya daha önce
            },
            // Opsiyonel: Sadece bilani tamamlanmış veya aktif olanlar?
            // status: { [Op.in]: ['active', 'completed'] } 
        },
        include: { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
        order: [['followUpDate', 'ASC']] // Yaklaşanlar önce gelsin
    });

    // Son Tamamlanan Anketler (Danışmanın yararlanıcılarına ait)
    const ownBeneficiaryIds = (await Beneficiary.findAll({
         where: { consultantId }, 
         attributes: ['id']
        })).map(b => b.id);

    const recentlyCompletedQuestionnaires = await Questionnaire.findAll({
        where: {
            beneficiaryId: { [Op.in]: ownBeneficiaryIds }, // Sadece danışmanın yararlanıcıları
            status: 'completed',
            // updatedAt alanı kullanılabilir, ancak Answer modeli üzerinden gitmek daha doğru olabilir.
            // Şimdilik son 1 haftada tamamlananları alalım (updatedAt varsayımıyla)
            updatedAt: {
                [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) // Son 7 gün
            }
        },
        include: [
            { model: Beneficiary, as: 'beneficiary', include: { model: User, as: 'user' } },
            { model: User, as: 'creator' } // İsteğe bağlı: Anketi kimin oluşturduğu
        ],
        order: [['updatedAt', 'DESC']], // En son tamamlananlar üstte
        limit: 5
    });

    // --- Uyarılar / Gerekli Aksiyonlar --- 
    const beneficiariesForAlerts = await Beneficiary.findAll({
        where: { consultantId },
        attributes: ['id', 'userId', 'consentGiven', 'agreementSigned'],
        include: { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }
    });

    const missingConsents = beneficiariesForAlerts.filter(b => !b.consentGiven);
    const missingAgreements = beneficiariesForAlerts.filter(b => !b.agreementSigned);

    // Teslim tarihi geçmiş anketler
     const overdueQuestionnaires = await Questionnaire.findAll({
         where: {
             beneficiaryId: { [Op.in]: ownBeneficiaryIds },
             status: 'pending',
             dueDate: {
                 [Op.ne]: null,
                 [Op.lt]: today // Bugünden küçük (geçmiş)
             }
         },
         include: [
             { model: Beneficiary, as: 'beneficiary', include: { model: User, as: 'user' } }
         ],
         order: [['dueDate', 'ASC']], // En eski gecikenler önce
         limit: 5 
     });

    res.render('dashboard/consultant', {
      title: 'Tableau de bord Consultant',
      user: req.user,
      stats,
      upcomingAppointments,
      recentActivities,
      followUpBeneficiaries,
      recentlyCompletedQuestionnaires,
      missingConsents,
      missingAgreements,
      overdueQuestionnaires
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement du tableau de bord');
    res.redirect('/');
  }
});

// Yararlanıcı dashboard'u
router.get('/beneficiary', ensureAuthenticated, ensureBeneficiary, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'consultant',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    const upcomingAppointments = await Appointment.findAll({
      where: {
        beneficiaryId: beneficiary.id,
        date: {
          [Op.gte]: new Date()
        }
      },
      order: [['date', 'ASC']],
      limit: 3
    });

    const pendingQuestionnaires = await Questionnaire.findAll({
      where: {
        beneficiaryId: beneficiary.id,
        status: 'pending'
      },
      limit: 5
    });

    res.render('dashboard/beneficiary', {
      title: 'Mon Bilan de Compétences',
      user: req.user,
      beneficiary,
      upcomingAppointments,
      pendingQuestionnaires
    });
  } catch (error) {
    console.error('Beneficiary dashboard error:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement du tableau de bord');
    res.redirect('/');
  }
});

// Danışman istatistiklerini hesapla
async function getConsultantStats(consultantId) {
  // Promise.all ile sorguları paralelleştir
  const [ 
      beneficiaryCount, preliminaryCount, investigationCount, conclusionCount,
      upcomingAppointments, unreadMessages, pendingQuestionnaires,
      missingConsentsCount, missingAgreementsCount // Yeni sayımlar
    ] = await Promise.all([
        Beneficiary.count({ where: { consultantId } }),
        Beneficiary.count({ where: { consultantId, currentPhase: 'preliminary' } }),
        Beneficiary.count({ where: { consultantId, currentPhase: 'investigation' } }),
        Beneficiary.count({ where: { consultantId, currentPhase: 'conclusion' } }),
        Appointment.count({ where: { consultantId, status: 'scheduled', date: { [Op.gte]: new Date() } } }),
        Message.count({ where: { consultantId, isRead: false, senderId: { [Op.ne]: consultantId } } }),
        Questionnaire.count({ where: { createdBy: consultantId, status: 'pending' /* Daha iyi sorgu? */ } }),
        // Yeni Sayımlar:
        Beneficiary.count({ where: { consultantId, consentGiven: false } }), 
        Beneficiary.count({ where: { consultantId, agreementSigned: false } })
  ]);

  return {
    beneficiaryCount, 
    preliminaryCount,
    investigationCount,
    conclusionCount,
    upcomingAppointments,
    unreadMessages,
    pendingQuestionnaires,
    missingConsentsCount, // Yeni
    missingAgreementsCount // Yeni
  };
}

// Son aktiviteleri al
async function getRecentActivities(consultantId) {
  const activities = [];

  // Son eklenen yararlanıcılar
  const recentBeneficiaries = await Beneficiary.findAll({
    where: { consultantId },
    include: [{
      model: User,
      as: 'user',
      attributes: ['firstName', 'lastName']
    }],
    order: [['createdAt', 'DESC']],
    limit: 3
  });

  recentBeneficiaries.forEach(beneficiary => {
    activities.push({
      title: 'Nouveau Bénéficiaire',
      description: `${beneficiary.user.firstName} ${beneficiary.user.lastName} a été ajouté`,
      date: beneficiary.createdAt
    });
  });

  // Son randevular
  const recentAppointments = await Appointment.findAll({
    where: { consultantId },
    include: [{
      model: Beneficiary,
      as: 'beneficiary',
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }]
    }],
    order: [['createdAt', 'DESC']],
    limit: 3
  });

  recentAppointments.forEach(appointment => {
    activities.push({
      title: 'Nouveau Rendez-vous',
      description: `Rendez-vous planifié avec ${appointment.beneficiary.user.firstName} ${appointment.beneficiary.user.lastName}`,
      date: appointment.createdAt
    });
  });

  // Aktiviteleri tarihe göre sırala
  return activities.sort((a, b) => b.date - a.date).slice(0, 5);
}

module.exports = router;
