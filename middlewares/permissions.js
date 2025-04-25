// const { FORFAITS } = require('../config/forfaits');

/**
 * Kullanıcının paket seviyesinin, gereken minimum seviyeyi karşılayıp karşılamadığını kontrol eder.
 * @param {string} requiredForfait Gereken minimum paket tipi (örn: 'Premium').
 */
const checkAccessLevel = (requiredForfait) => (req, res, next) => {
  const { user } = req;
  if (!user || !user.forfaitType) {
    req.flash('error_msg', 'Accès non autorisé. Forfait manquant.');
    return res.redirect('/dashboard');
  }

  // Paket seviyeleri doğrudan burada tanımlandı
  const forfaitLevels = {
    Essentiel: 1,
    Standard: 2,
    Premium: 3,
    Entreprise: 4,
    Admin: 5, // Admin her şeye erişebilir varsayımı
  };

  const userLevel = forfaitLevels[user.forfaitType] || 0;
  const requiredLevel = forfaitLevels[requiredForfait] || 0;

  if (userLevel >= requiredLevel) {
    return next();
  }
  req.flash(
    'error_msg',
    `Accès non autorisé. Cette fonctionnalité requiert le forfait '${requiredForfait}' ou supérieur.`,
  );
  return res.redirect('back');
};

module.exports = {
  checkAccessLevel,
};
