const { deductCredits } = require('../services/creditService');

/**
 * Middleware to check if the user has enough credits and deduct them.
 * @param {number} cost The amount of credits required for the action.
 */
const checkAndDeductCredits = (cost) => async (req, res, next) => {
  if (!req.user) {
    // Should be caught by ensureAuthenticated, but as a safeguard
    req.flash('error_msg', 'Authentication requise.');
    return res.redirect('/auth/login');
  }

  const userId = req.user.id;
  const creditCheckResult = await deductCredits(userId, cost);

  if (!creditCheckResult.success) {
    req.flash(
      'error_msg',
      creditCheckResult.message || 'Erreur de crédit inconnue.',
    );
    // Redirect back? Need to know the original path or a default.
    // For now, redirecting to dashboard, but specific routes might need different handling.
    // Or maybe redirect back using req.originalUrl or req.headers.referer (less reliable)
    // Let's try redirecting back to the referer if available
    const redirectUrl = req.headers.referer || '/dashboard';
    return res.redirect(redirectUrl);
  }

  // Add cost info to request for potential success message customization
  req.creditCost = cost;
  next(); // Credits OK, proceed to the next middleware/route handler
};

module.exports = {
  checkAndDeductCredits,
};
