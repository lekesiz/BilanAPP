/**
 * Utility functions for tracking user activity and recent actions
 */

const { Op } = require('sequelize');
const {
  Activity,
  Beneficiary,
  User,
  Appointment,
  Document,
  Message,
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
exports.logActivity = async (
  userId,
  type,
  action,
  resourceId,
  details = '',
) => {
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
 * This is used for the dashboard to show recent interactions
 * @param {number} beneficiaryId - Beneficiary ID
 * @param {number} limit - Maximum number of activities to return
 * @returns {Promise<Array>} Recent activity records with associated resource details
 */
exports.getRecentActivitiesFor = async (beneficiaryId, limit = 5) => {
  try {
    // First, get the user ID associated with this beneficiary
    const beneficiary = await Beneficiary.findByPk(beneficiaryId);
    if (!beneficiary) {
      return [];
    }

    // Get all activities for this user
    const activities = await Activity.findAll({
      where: {
        userId: beneficiary.userId,
      },
      order: [['createdAt', 'DESC']],
      limit,
    });

    // Enhance activities with details about the resources
    const enhancedActivities = await Promise.all(
      activities.map(async (activity) => {
        const plainActivity = activity.get({ plain: true });

        // Add resource details based on type
        switch (plainActivity.type) {
          case 'appointment':
            const appointment = await Appointment.findByPk(
              plainActivity.resourceId,
            );
            if (appointment) {
              plainActivity.resourceDetails = appointment.get({ plain: true });
            }
            break;
          case 'document':
            const document = await Document.findByPk(plainActivity.resourceId);
            if (document) {
              plainActivity.resourceDetails = document.get({ plain: true });
            }
            break;
          case 'message':
            const message = await Message.findByPk(plainActivity.resourceId);
            if (message) {
              plainActivity.resourceDetails = message.get({ plain: true });
            }
            break;
          // Add more types as needed
        }

        return plainActivity;
      }),
    );

    return enhancedActivities;
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
    const types = [
      'appointment',
      'document',
      'message',
      'questionnaire',
      'profile',
    ];
    for (const type of types) {
      stats.byType[type] = await Activity.count({
        where: { ...whereClause, type },
      });
    }

    // Count activities by action
    const actions = ['create', 'view', 'update', 'delete', 'complete'];
    for (const action of actions) {
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

    const beneficiaryIds = beneficiaries.map((b) => b.id);

    // For each beneficiary, get their most recent activity
    const result = [];
    for (const beneficiary of beneficiaries) {
      const latestActivity = await Activity.findOne({
        where: { userId: beneficiary.userId },
        order: [['createdAt', 'DESC']],
      });

      if (latestActivity) {
        result.push({
          beneficiary: beneficiary.get({ plain: true }),
          latestActivity: latestActivity.get({ plain: true }),
        });
      }
    }

    // Sort by most recent activity and limit
    return result
      .sort(
        (a, b) =>
          new Date(b.latestActivity.createdAt) -
          new Date(a.latestActivity.createdAt),
      )
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recently active beneficiaries:', error);
    return [];
  }
};
