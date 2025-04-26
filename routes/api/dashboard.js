const express = require('express');
const router = express.Router();
const { isAdmin } = require('@middlewares/auth');
const User = require('@models/user');
const Activity = require('@models/activity');
const Credit = require('@models/credit');
const Package = require('@models/package');
const { formatDate } = require('@utils/helpers');

// Dashboard istatistikleri
router.get('/stats', isAdmin, async (req, res) => {
  try {
    // Kullanıcı istatistikleri
    const totalUsers = await User.countDocuments();
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
    });
    const previousMonthUsers = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
    });
    const userGrowth = {
      isPositive: lastMonthUsers >= previousMonthUsers,
      percentage: previousMonthUsers === 0 ? 100 : Math.round((lastMonthUsers - previousMonthUsers) / previousMonthUsers * 100)
    };

    // Paket istatistikleri
    const activePackages = await Package.countDocuments({ status: 'active' });
    const totalPackages = await Package.countDocuments();

    // Kredi istatistikleri
    const lastMonthCredits = await Credit.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const previousMonthCredits = await Credit.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const usedCredits = lastMonthCredits[0]?.total || 0;
    const creditUsageGrowth = {
      isPositive: (lastMonthCredits[0]?.total || 0) >= (previousMonthCredits[0]?.total || 0),
      percentage: previousMonthCredits[0]?.total === 0 ? 100 : Math.round(((lastMonthCredits[0]?.total || 0) - (previousMonthCredits[0]?.total || 0)) / (previousMonthCredits[0]?.total || 1) * 100)
    };

    // Gelir istatistikleri
    const lastMonthRevenue = await Credit.aggregate([
      {
        $match: {
          type: 'purchase',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const previousMonthRevenue = await Credit.aggregate([
      {
        $match: {
          type: 'purchase',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const totalRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = {
      isPositive: (lastMonthRevenue[0]?.total || 0) >= (previousMonthRevenue[0]?.total || 0),
      percentage: previousMonthRevenue[0]?.total === 0 ? 100 : Math.round(((lastMonthRevenue[0]?.total || 0) - (previousMonthRevenue[0]?.total || 0)) / (previousMonthRevenue[0]?.total || 1) * 100)
    };

    res.json({
      totalUsers,
      activePackages,
      totalPackages,
      usedCredits,
      totalRevenue,
      userGrowth,
      creditUsageGrowth,
      revenueGrowth
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınırken bir hata oluştu.' });
  }
});

// Kullanıcı büyüme grafiği
router.get('/user-growth', isAdmin, async (req, res) => {
  try {
    const monthCount = 6;
    const months = [];
    const userCounts = [];

    for (let i = 0; i < monthCount; i++) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      const count = await User.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });

      months.unshift(startDate.toLocaleString('tr-TR', { month: 'long' }));
      userCounts.unshift(count);
    }

    res.json({
      labels: months,
      data: userCounts
    });
  } catch (error) {
    console.error('User growth chart error:', error);
    res.status(500).json({ error: 'Kullanıcı büyüme grafiği alınırken bir hata oluştu.' });
  }
});

// Kredi kullanım grafiği
router.get('/credit-usage', isAdmin, async (req, res) => {
  try {
    const dayCount = 7;
    const days = [];
    const creditUsage = [];

    for (let i = 0; i < dayCount; i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - i);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      const usage = await Credit.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      days.unshift(startDate.toLocaleString('tr-TR', { weekday: 'long' }));
      creditUsage.unshift(usage[0]?.total || 0);
    }

    res.json({
      labels: days,
      data: creditUsage
    });
  } catch (error) {
    console.error('Credit usage chart error:', error);
    res.status(500).json({ error: 'Kredi kullanım grafiği alınırken bir hata oluştu.' });
  }
});

// Son aktiviteler
router.get('/recent-activities', isAdmin, async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName email');

    const formattedActivities = activities.map(activity => ({
      type: activity.type,
      description: activity.description,
      createdAt: activity.createdAt,
      user: {
        fullName: `${activity.user.firstName} ${activity.user.lastName}`,
        email: activity.user.email
      }
    }));

    res.json(formattedActivities);
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ error: 'Son aktiviteler alınırken bir hata oluştu.' });
  }
});

module.exports = router; 