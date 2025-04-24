const bcrypt = require('bcryptjs');
const {
  User, Beneficiary, CreditLog, Forfait,
} = require('../models');

// GET /profile - Show Profile Page
exports.showProfile = async (req, res) => {
  try {
    const additionalData = {};
    const user = await User.findByPk(req.user.id, {
      include: { model: Forfait, as: 'forfait' },
    });
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/auth/login');
    }

    if (user.userType === 'beneficiary') {
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: user.id },
        include: {
          model: User,
          as: 'consultant',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      });
      additionalData.consultant = beneficiaryProfile?.consultant?.get({
        plain: true,
      }); // Get plain object
    } else if (user.userType === 'consultant') {
      const beneficiaries = await Beneficiary.findAll({
        where: { consultantId: user.id },
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      });
      additionalData.beneficiaries = beneficiaries.map((b) =>
        b.get({ plain: true }),
      ); // Get plain object
    }

    const recentCreditLogs = await CreditLog.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
    additionalData.recentCreditLogs = recentCreditLogs.map((log) =>
      log.get({ plain: true }),
    ); // Get plain object

    res.render('profile/index', {
      title: 'Mon Profil',
      user: user.get({ plain: true }), // Pass plain object
      ...additionalData,
    });
  } catch (error) {
    console.error('Profile page error:', error);
    req.flash('error_msg', 'Erreur chargement profil.');
    res.redirect('/dashboard');
  }
};

// GET /profile/settings - Show Settings Page
exports.showSettings = (req, res) => {
  res.render('profile/settings', {
    title: 'Paramètres du Compte',
    // Pass plain user object to avoid potential prototype issues
    user: req.user ? req.user.get({ plain: true }) : null,
  });
};

// POST /profile/settings/info - Update Profile Info
exports.updateInfo = async (req, res) => {
  const { firstName, lastName } = req.body;
  const userId = req.user.id;

  if (!firstName || !lastName) {
    req.flash('error_msg', 'Prénom et nom requis.');
    return res.redirect('/profile/settings');
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/auth/logout');
    }
    await user.update({ firstName, lastName });
    req.flash('success_msg', 'Informations mises à jour.');
    res.redirect('/profile/settings');
  } catch (error) {
    console.error('Profile info update error:', error);
    req.flash('error_msg', 'Erreur mise à jour informations.');
    res.redirect('/profile/settings');
  }
};

// POST /profile/settings/password - Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    req.flash('error_msg', 'Tous les champs sont requis.');
    return res.redirect('/profile/settings');
  }
  if (newPassword !== confirmPassword) {
    req.flash('error_msg', 'Les nouveaux mots de passe ne correspondent pas.');
    return res.redirect('/profile/settings');
  }
  if (newPassword.length < 6) {
    req.flash(
      'error_msg',
      'Nouveau mot de passe doit faire au moins 6 caractères.',
    );
    return res.redirect('/profile/settings');
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      req.flash('error_msg', 'Utilisateur non trouvé.');
      return res.redirect('/auth/logout');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Mot de passe actuel incorrect.');
      return res.redirect('/profile/settings');
    }

    // Rely on the model hook to hash the password
    user.password = newPassword;
    await user.save();

    req.flash('success_msg', 'Mot de passe mis à jour.');
    res.redirect('/profile/settings');
  } catch (error) {
    console.error('Password change error:', error);
    req.flash('error_msg', 'Erreur changement mot de passe.');
    res.redirect('/profile/settings');
  }
};

// GET /profile/credits - Show Credit History
exports.showCredits = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;

    const { count, rows } = await CreditLog.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'adminUser',
          attributes: ['firstName', 'lastName'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    const creditLogs = rows.map((log) => log.get({ plain: true })); // Pass plain objects

    res.render('profile/credits', {
      title: 'Historique des Crédits',
      user: req.user.get({ plain: true }), // Pass plain object
      creditLogs,
      currentPage: page,
      totalPages,
      paginationBaseUrl: '/profile/credits?',
    });
  } catch (error) {
    console.error('Credit log page error:', error);
    req.flash('error_msg', 'Erreur chargement historique crédits.');
    res.redirect('/profile');
  }
};
