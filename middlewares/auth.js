const logger = require('../config/logger'); // Import logger

module.exports = {
  // Vérifier si l'utilisateur est authentifié
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette ressource.');
    return res.redirect('/auth/login');
  },

  // Vérifier si l'utilisateur est un consultant
  ensureConsultant: (req, res, next) => {
    console.log('[AUTH DEBUG] ensureConsultant - User info:', req.user?.id, req.user?.userType, req.user);
    if (
      req.isAuthenticated() &&
      (req.user.userType === 'consultant' || req.user.forfaitType === 'Admin')
    ) {
      return next();
    }
    req.flash('error_msg', 'Accès refusé. Cette zone est réservée aux consultants.');
    return res.redirect('/dashboard');
  },

  // Vérifier si l'utilisateur est un bénéficiaire
  ensureBeneficiary: (req, res, next) => {
    // --- DEBUG LOGGING START ---
    logger.info('[AUTH DEBUG] ensureBeneficiary - Checking user:', { 
      userId: req.user?.id, 
      userType: req.user?.userType, 
      isAuthenticated: req.isAuthenticated() 
    });
    // --- DEBUG LOGGING END ---
    if (req.isAuthenticated() && req.user.userType === 'beneficiary') {
      return next();
    }
    logger.warn('[AUTH DEBUG] ensureBeneficiary - Access DENIED. Redirecting to /dashboard.'); // Log denial
    req.flash('error_msg', 'Accès refusé. Cette zone est réservée aux bénéficiaires.');
    return res.redirect('/dashboard');
  },

  // Vérifier si l'utilisateur est un consultant OU un bénéficiaire
  ensureConsultantOrBeneficiary: (req, res, next) => {
    if (
      req.isAuthenticated() &&
      (req.user.userType === 'consultant' ||
        req.user.userType === 'beneficiary' ||
        req.user.forfaitType === 'Admin')
    ) {
      return next();
    }
    req.flash('error_msg', 'Accès non autorisé.');
    return res.redirect('/auth/login');
  },

  // Vérifier si l'utilisateur est un Admin (basé sur forfaitType)
  ensureAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.forfaitType === 'Admin') {
      return next();
    }
    req.flash('error_msg', 'Accès refusé. Zone réservée aux administrateurs.');
    return res.redirect('/dashboard');
  },
};
