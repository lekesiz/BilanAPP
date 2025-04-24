module.exports = {
  // Vérifier si l'utilisateur est authentifié
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page');
    res.redirect('/auth/login');
    return;
  },

  // Vérifier si l'utilisateur est un consultant
  ensureConsultant: (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page');
      return res.redirect('/auth/login');
    }
    console.log(
      '[AUTH DEBUG] ensureConsultant - User info:',
      req.user.id,
      req.user.userType,
      req.user.get ? req.user.get({ plain: true }) : req.user,
    );

    if (req.user.userType !== 'consultant' && req.user.forfaitType !== 'Admin') {
      req.flash('error_msg', 'Accès non autorisé. Cette page est réservée aux consultants.');
      return res.redirect('/dashboard');
    }
    return next();
  },

  // Vérifier si l'utilisateur est un bénéficiaire
  ensureBeneficiary: (req, res, next) => {
    if (req.user && req.user.userType === 'beneficiary') {
      return next();
    }
    req.flash('error_msg', 'Accès non autorisé (Bénéficiaire requis)');
    res.redirect('/dashboard');
    return;
  },

  // Vérifier si l'utilisateur est un consultant OU un bénéficiaire
  ensureConsultantOrBeneficiary: (req, res, next) => {
    if (req.user && (req.user.userType === 'consultant' || req.user.userType === 'beneficiary')) {
      return next();
    }
    req.flash('error_msg', 'Accès non autorisé');
    res.redirect('/dashboard');
    return;
  },

  // Vérifier si l'utilisateur est un Admin (basé sur forfaitType)
  ensureAdmin: (req, res, next) => {
    if (req.user && req.user.forfaitType === 'Admin') {
      return next();
    }
    req.flash('error_msg', 'Accès non autorisé (Admin requis)');
    // Admin olmayanları nereye yönlendirelim? Dashboard?
    res.redirect('/dashboard');
    return;
  },
};
