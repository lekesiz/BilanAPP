const express = require('express');

const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const {
  ensureAuthenticated,
  ensureConsultant,
} = require('../middlewares/auth');
const { checkAccessLevel } = require('../middlewares/permissions');
const {
  Beneficiary, Appointment, Questionnaire, User,
} = require('../models');

const MIN_FORFAIT_REPORTS = 'Standard';

// GET Raporlama Sayfası (Sadece Danışmanlar için ve belirli paket seviyesi)
router.get(
  '/',
  ensureAuthenticated,
  ensureConsultant,
  checkAccessLevel(MIN_FORFAIT_REPORTS),
  async (req, res) => {
    try {
      const consultantId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // 1. Yararlanıcı Durum/Aşama Sayıları
      const [beneficiaryCountsByPhase, beneficiaryCountsByStatus] =
        await Promise.all([
          Beneficiary.findAll({
            where: { consultantId },
            attributes: [
              'currentPhase',
              [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            ],
            group: ['currentPhase'],
          }),
          Beneficiary.findAll({
            where: { consultantId },
            attributes: [
              'status',
              [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            ],
            group: ['status'],
          }),
        ]);

      // Verileri daha kolay işlenebilir hale getir (varsayılan 0 değeri ile)
      const phaseCounts = {
        preliminary: 0,
        investigation: 0,
        conclusion: 0,
        ...beneficiaryCountsByPhase.reduce((acc, item) => {
          acc[item.getDataValue('currentPhase')] = item.getDataValue('count');
          return acc;
        }, {}),
      };
      const statusCounts = {
        initial: 0,
        active: 0,
        completed: 0,
        on_hold: 0,
        ...beneficiaryCountsByStatus.reduce((acc, item) => {
          acc[item.getDataValue('status')] = item.getDataValue('count');
          return acc;
        }, {}),
      };

      // 2. Yaklaşan Randevular (Sayı)
      const upcomingAppointmentsCount = await Appointment.count({
        where: {
          consultantId,
          status: 'scheduled',
          date: {
            [Op.gte]: today,
            [Op.lte]: next7Days,
          },
        },
      });

      // 3. Gecikmiş Anketler (Sayı)
      const ownBeneficiaryIds = (
        await Beneficiary.findAll({
          where: { consultantId },
          attributes: ['id'],
        })
      ).map((b) => b.id);
      const overdueQuestionnairesCount =
        ownBeneficiaryIds.length > 0 ?
          await Questionnaire.count({
            where: {
              beneficiaryId: { [Op.in]: ownBeneficiaryIds },
              status: 'pending',
              dueDate: {
                [Op.ne]: null,
                [Op.lt]: today,
              },
            },
          }) :
          0;

      // 4. Yaklaşan Takip Görüşmeleri (Sayı)
      const upcomingFollowUpsCount = await Beneficiary.count({
        where: {
          consultantId,
          followUpDate: {
            [Op.ne]: null,
            [Op.gte]: today,
            [Op.lte]: next30Days,
          },
        },
      });

      // 5. Eksik Rıza Sayısı
      const missingConsentsCount = await Beneficiary.count({
        where: {
          consultantId,
          consentGiven: false,
          status: { [Op.ne]: 'completed' },
        },
      });

      // 6. Yararlanıcı Paket Dağılımı
      const beneficiariesWithForfait = await Beneficiary.findAll({
        where: { consultantId },
        include: [{ model: User, as: 'user', attributes: ['forfaitType'] }],
        attributes: [], // Sadece include edilen User'dan forfaitType yeterli
      });
      const beneficiaryForfaitCounts = beneficiariesWithForfait.reduce(
        (acc, ben) => {
          const type = ben.user?.forfaitType || 'Aucun';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {},
      );

      res.render('reports/index', {
        title: 'Rapports et Suivi',
        user: req.user,
        phaseCounts,
        statusCounts,
        upcomingAppointmentsCount,
        overdueQuestionnairesCount,
        upcomingFollowUpsCount,
        missingConsentsCount,
        beneficiaryForfaitCounts,
        // Grafik verilerini de gönderelim
        chartData: {
          phases: {
            labels: Object.keys(phaseCounts),
            data: Object.values(phaseCounts),
          },
          statuses: {
            labels: Object.keys(statusCounts),
            data: Object.values(statusCounts),
          },
        },
      });
    } catch (error) {
      console.error('Reporting page error:', error);
      req.flash('error_msg', 'Rapor sayfası yüklenirken bir hata oluştu.');
      res.redirect('/dashboard');
    }
  },
);

module.exports = router;
