// const { FORFAITS } = require('../config/forfaits');

/**
 * Kullanıcının paket seviyesinin, gereken minimum seviyeyi karşılayıp karşılamadığını kontrol eder.
 * @param {string} requiredForfait Gereken minimum paket tipi (örn: 'Premium').
 */
const checkAccessLevel = (requiredForfait) => {
    return (req, res, next) => {
        if (!req.user || !req.user.forfaitType) {
            req.flash('error_msg', 'Accès non autorisé. Forfait utilisateur inconnu.');
            return res.redirect('/dashboard');
        }

        // Paket seviyeleri doğrudan burada tanımlandı
        const forfaitLevels = {
            'Essentiel': 1,
            'Standard': 2,
            'Premium': 3,
            'Entreprise': 4,
            'Admin': 5 // Admin her şeye erişebilir varsayımı
        };

        const userLevel = forfaitLevels[req.user.forfaitType] || 0;
        const requiredLevel = forfaitLevels[requiredForfait] || 0;

        if (userLevel >= requiredLevel) {
            next(); // Erişim izni verildi
        } else {
            req.flash('error_msg', `Accès non autorisé. Cette fonctionnalité nécessite un forfait \'${requiredForfait}\' ou supérieur.`);
            // Kullanıcıyı geldiği sayfaya veya dashboard'a yönlendir
            const redirectUrl = req.headers.referer || '/dashboard';
            res.redirect(redirectUrl);
        }
    };
};

module.exports = {
    checkAccessLevel
}; 