/**
 * Utility functions for tracking user activity and recent actions
 */

const { Op } = require('sequelize');
const {
  Activity, Beneficiary, User, Appointment, Message,
  // Questionnaire, // Removed unused import
  // Answer, // Removed unused import
} = require('../models');

/**
 * Log an activity for a user
 * @param {number} userId - User ID
 * @param {string} type - Activity type (e.g., 'appointment', 'document', 'message')
 * @param {string} action - Action performed (e.g., 'create', 'view', 'update')
 * @param {number} resourceId - ID of the related resource
 * @param {string} details - Additional details about the activity
 * @returns {Promise<Activity>} Created activity record
 */
exports.logActivity = async (userId, type, action, resourceId, details = '') => {
  try {
    return await Activity.create({
      userId,
      type,
      action,
      resourceId,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should not interrupt main flow
    return null;
  }
};

/**
 * Get recent activities for a user
 * @param {number} userId - User ID
 * @param {number} limit - Maximum number of activities to return
 * @returns {Promise<Array>} Recent activity records
 */
exports.getRecentActivities = async (userId, limit = 10) => {
  try {
    return await Activity.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }
};

/**
 * Get recent activities for a beneficiary with detailed resource information
 */
exports.getRecentActivitiesFor = async (beneficiaryId, limit = 5) => {
  try {
    const beneficiary = await Beneficiary.findByPk(beneficiaryId);
    if (!beneficiary) return [];

    // Farklı türdeki son aktiviteleri çek (Örnek: Son randevular ve mesajlar)
    const [recentAppointments, recentMessages] = await Promise.all([
      Appointment.findAll({
        where: { beneficiaryId },
        order: [['date', 'DESC']],
        limit,
        include: [{ model: User, as: 'consultant', attributes: ['firstName', 'lastName'] }],
      }),
      Message.findAll({
        where: { beneficiaryId },
        order: [['createdAt', 'DESC']],
        limit,
        include: [{ model: User, as: 'sender', attributes: ['firstName', 'lastName'] }],
      }),
      // Buraya başka aktivite türleri (Doküman, Anket vb.) eklenebilir
    ]);

    // Aktiviteleri birleştir ve formatla
    const activities = [];
    recentAppointments.forEach((a) =>
      activities.push({
        type: 'appointment',
        title: 'Rendez-vous',
        description: `${a.type} avec ${a.consultant.firstName}`,
        link: `/appointments#appt-${a.id}`,
        date: a.date,
      }),
    );
    recentMessages.forEach((m) =>
      activities.push({
        type: 'message',
        title: 'Nouveau Message',
        description: `De ${m.sender.firstName}: ${m.subject || m.body.substring(0, 20)}...`,
        link: `/messages/conversation/${m.consultantId}`,
        date: m.createdAt,
      }),
    );

    // Tarihe göre sırala ve limitle
    activities.sort((a, b) => b.date - a.date);
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent activities for beneficiary:', error);
    return [];
  }
};

/**
 * Get activity statistics for a user or beneficiary
 * @param {number} userId - User ID
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Activity statistics
 */
exports.getActivityStats = async (userId, options = {}) => {
  try {
    const { startDate, endDate } = options;
    const whereClause = { userId };

    // Add date filters if provided
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Get counts by type
    const stats = {
      total: await Activity.count({ where: whereClause }),
      byType: {},
      byAction: {},
    };

    // Count activities by type
    const types = ['appointment', 'document', 'message', 'questionnaire', 'profile'];
    for (const type of types) {
      // eslint-disable-next-line no-await-in-loop
      stats.byType[type] = await Activity.count({
        where: { ...whereClause, type },
      });
    }

    // Count activities by action
    const actions = ['create', 'view', 'update', 'delete', 'complete'];
    for (const action of actions) {
      // eslint-disable-next-line no-await-in-loop
      stats.byAction[action] = await Activity.count({
        where: { ...whereClause, action },
      });
    }

    return stats;
  } catch (error) {
    console.error('Error getting activity statistics:', error);
    return {
      total: 0,
      byType: {},
      byAction: {},
    };
  }
};

/**
 * Get recently active beneficiaries for a consultant
 * @param {number} consultantId - Consultant's user ID
 * @param {number} limit - Maximum number of beneficiaries to return
 * @returns {Promise<Array>} Recently active beneficiaries
 */
exports.getRecentlyActiveBeneficiaries = async (consultantId, limit = 5) => {
  try {
    // Get beneficiaries associated with this consultant
    const beneficiaries = await Beneficiary.findAll({
      where: { consultantId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    // const beneficiaryIds = beneficiaries.map((b) => b.id); // Removed unused variable

    // For each beneficiary, get their most recent activity
    // Use Promise.all to fetch activities in parallel
    const activityPromises = beneficiaries.map(async (beneficiary) => {
      // eslint-disable-next-line no-await-in-loop
      const latestActivity = await Activity.findOne({
        where: { userId: beneficiary.userId },
        order: [['createdAt', 'DESC']],
      });
      return latestActivity ? {
        beneficiary: beneficiary.get({ plain: true }),
        latestActivity: latestActivity.get({ plain: true }),
      } : null;
    });

    const resultsWithNulls = await Promise.all(activityPromises);
    const result = resultsWithNulls.filter((r) => r !== null);

    // Sort by most recent activity and limit
    const sortedResult = result.sort((a, b) => {
      const dateA = new Date(a.latestActivity.createdAt);
      const dateB = new Date(b.latestActivity.createdAt);
      return dateB - dateA; // Sort descending (most recent first)
    });

    return sortedResult.slice(0, limit);
  } catch (error) {
    console.error('Error getting recently active beneficiaries:', error);
    return [];
  }
};

/**
 * Fetches recent activities specifically for a consultant (new beneficiaries, new messages).
 */
exports.getRecentActivitiesForConsultant = async (consultantId, limit = 5) => {
  if (!consultantId) return [];

  try {
    // Fetch recent new beneficiaries
    const newBeneficiaries = await Beneficiary.findAll({
      where: { consultantId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']], // En yeniye göre sırala
      limit, // Limiti uygula
    });

    // Sadece yeni faydalanıcı aktivitesini döndür
    const activities = newBeneficiaries.map((beneficiary) => ({
      type: 'beneficiary',
      title: 'Nouveau Bénéficiaire',
      description: `${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      link: `/beneficiaries/${beneficiary.id}`,
      date: beneficiary.createdAt,
    }));

    return activities;
  } catch (error) {
    console.error('Error getting recent consultant activities:', error);
    return [];
  }
};
