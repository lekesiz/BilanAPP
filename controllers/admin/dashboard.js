const axios = require('axios');
const config = require('@config');

exports.getDashboard = async (req, res) => {
  try {
    // API'den verileri al
    const [stats, userGrowth, creditUsage, recentActivities] = await Promise.all([
      axios.get(`${config.api.baseUrl}/api/dashboard/stats`),
      axios.get(`${config.api.baseUrl}/api/dashboard/user-growth`),
      axios.get(`${config.api.baseUrl}/api/dashboard/credit-usage`),
      axios.get(`${config.api.baseUrl}/api/dashboard/recent-activities`)
    ]);

    res.render('admin/dashboard', {
      title: 'Dashboard',
      ...stats.data,
      userGrowthLabels: JSON.stringify(userGrowth.data.labels),
      userGrowthData: JSON.stringify(userGrowth.data.data),
      creditUsageLabels: JSON.stringify(creditUsage.data.labels),
      creditUsageData: JSON.stringify(creditUsage.data.data),
      recentActivities: recentActivities.data
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Dashboard verileri yüklenirken bir hata oluştu');
    res.redirect('/admin');
  }
}; 