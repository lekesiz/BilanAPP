module.exports = {
  // Vérifier si l'utilisateur est authentifié
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page');
    res.redirect('/auth/login');
  },
  
  // Vérifier si l'utilisateur est un consultant
  ensureConsultant: (req, res, next) => {
    if (req.user && req.user.userType === 'consultant') {
      return next();
    }
    req.flash('error_msg', 'Accès non autorisé (Consultant requis)');
    res.redirect('/dashboard');
  },
  
  // Vérifier si l'utilisateur est un bénéficiaire
  ensureBeneficiary: (req, res, next) => {
    if (req.user && req.user.userType === 'beneficiary') {
      return next();
    }
    req.flash('error_msg', 'Accès non autorisé (Bénéficiaire requis)');
    res.redirect('/dashboard');
  },

  // Vérifier si l'utilisateur est un consultant OU un bénéficiaire
  ensureConsultantOrBeneficiary: (req, res, next) => {
    if (req.user && (req.user.userType === 'consultant' || req.user.userType === 'beneficiary')) {
      return next();
    }
    req.flash('error_msg', 'Accès non autorisé');
    res.redirect('/dashboard');
  }
};
