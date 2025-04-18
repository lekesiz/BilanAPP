const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { ensureAuthenticated } = require('../middlewares/auth');
const { User, Beneficiary, CreditLog, Forfait } = require('../models');

// GET Profil Sayfası
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        let additionalData = {};
        // Kullanıcıyı Forfait bilgisiyle birlikte çek
        const user = await User.findByPk(req.user.id, {
            include: { model: Forfait, as: 'forfait' } // Forfait ilişkisini ekle
        });

        if (!user) {
            req.flash('error_msg', 'Kullanıcı bulunamadı.');
            return res.redirect('/auth/login');
        }

        if (user.userType === 'beneficiary') {
            // Yararlanıcı ise, danışmanını bul
            const beneficiaryProfile = await Beneficiary.findOne({
                where: { userId: user.id },
                include: { model: User, as: 'consultant', attributes: ['id', 'firstName', 'lastName', 'email'] } // Danışman bilgisi
            });
            if (beneficiaryProfile) {
                additionalData.consultant = beneficiaryProfile.consultant;
            }
        } else if (user.userType === 'consultant') {
            // Danışman ise, yararlanıcılarını bul
            const beneficiaries = await Beneficiary.findAll({
                where: { consultantId: user.id },
                limit: 10, // Limitleyelim
                order: [['createdAt', 'DESC']], // Son eklenenler
                include: { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] } // Yararlanıcı kullanıcı bilgisi
            });
            additionalData.beneficiaries = beneficiaries;
        }

        // Son Kredi Hareketlerini Çek (örn: son 5)
        const recentCreditLogs = await CreditLog.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        additionalData.recentCreditLogs = recentCreditLogs;

        res.render('profile/index', { 
            title: 'Mon Profil', 
            user: user, // Forfait bilgisi içeren user objesi
            ...additionalData // Ek verileri view'a gönder
        });
    } catch (error) {
        console.error("Profile page error:", error);
        req.flash('error_msg', 'Profil sayfası yüklenirken bir hata oluştu.');
        res.redirect('/dashboard');
    }
});

// GET Ayarlar Sayfası
router.get('/settings', ensureAuthenticated, (req, res) => {
    res.render('profile/settings', { 
        title: 'Paramètres du Compte', 
        user: req.user 
    });
});

// POST Profil Bilgilerini Güncelleme (Ad/Soyad)
router.post('/settings/info', ensureAuthenticated, async (req, res) => {
    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    if (!firstName || !lastName) {
        req.flash('error_msg', 'Le prénom et le nom sont obligatoires.');
        return res.redirect('/profile/settings');
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/auth/logout'); 
        }

        await user.update({ firstName, lastName });

        req.flash('success_msg', 'Informations du profil mises à jour avec succès.');
        res.redirect('/profile/settings');

    } catch (error) {
        console.error('Profile info update error:', error);
        req.flash('error_msg', 'Une erreur est survenue lors de la mise à jour des informations.');
        res.redirect('/profile/settings');
    }
});

// POST Şifre Değiştirme
router.post('/settings/password', ensureAuthenticated, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Alan kontrolleri
    if (!currentPassword || !newPassword || !confirmPassword) {
        req.flash('error_msg', 'Veuillez remplir tous les champs.');
        return res.redirect('/profile/settings');
    }
    if (newPassword !== confirmPassword) {
        req.flash('error_msg', 'Les nouveaux mots de passe ne correspondent pas.');
        return res.redirect('/profile/settings');
    }
    if (newPassword.length < 6) { // Şifre uzunluk kontrolü (isteğe bağlı)
        req.flash('error_msg', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
        return res.redirect('/profile/settings');
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/auth/logout'); // Güvenlik için çıkış yaptır
        }

        // Mevcut şifreyi doğrula
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Le mot de passe actuel est incorrect.');
            return res.redirect('/profile/settings');
        }

        // Yeni şifreyi hashle ve güncelle (User modelindeki hook bunu otomatik yapmalı ama emin olmak için)
        // Hook çalıştığı için user.save() yeterli olmalı
        // const salt = await bcrypt.genSalt(10);
        // user.password = await bcrypt.hash(newPassword, salt);
        user.password = newPassword; // Hook'un tetiklenmesi için yeni değeri ata
        await user.save();

        req.flash('success_msg', 'Mot de passe mis à jour avec succès.');
        res.redirect('/profile/settings');

    } catch (error) {
        console.error('Password change error:', error);
        req.flash('error_msg', 'Une erreur est survenue lors de la modification du mot de passe.');
        res.redirect('/profile/settings');
    }
});

// GET Kredi Kullanım Geçmişi
router.get('/credits', ensureAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1; // Sayfa numarasını al (varsayılan 1)
        const limit = 15; // Sayfa başına gösterilecek log sayısı
        const offset = (page - 1) * limit;

        const { count, rows: creditLogs } = await CreditLog.findAndCountAll({
            where: { userId: req.user.id },
            include: [
                { model: User, as: 'adminUser', attributes: ['firstName', 'lastName'], required: false } // İşlemi yapan admini getir (varsa)
            ],
            order: [['createdAt', 'DESC']], 
            limit: limit,
            offset: offset
        });

        const totalPages = Math.ceil(count / limit);

        res.render('profile/credits', { 
            title: 'Historique des Crédits', 
            user: req.user,
            creditLogs,
            currentPage: page,
            totalPages: totalPages,
            paginationBaseUrl: '/profile/credits?' // Sayfalama linkleri için temel URL
        });

    } catch (error) {
        console.error('Credit log page error:', error);
        req.flash('error_msg', 'Erreur lors du chargement de l\'historique des crédits.');
        res.redirect('/profile');
    }
});

module.exports = router; 