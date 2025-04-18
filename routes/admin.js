const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureConsultant } = require('../middlewares/auth'); // Şimdilik ensureConsultant kullanalım
const { User, Forfait, Beneficiary } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { logCreditChange, getDefaultCreditsForForfait } = require('../services/creditService'); // getDefaultCreditsForForfait ekle
// const { FORFAITS } = require('../config/forfaits'); // Bu satır silinmeli veya yorum satırı yapılmalı
const { checkAccessLevel } = require('../middlewares/permissions'); 

// GET Admin Ana Sayfası (Dashboard)
router.get('/', ensureAuthenticated, ensureConsultant, async (req, res) => {
    try {
        // Paralel sorgular için Promise.all
        const [ 
            totalUsers, totalConsultants, totalBeneficiaries, 
            forfaitDistribution, 
            pendingConsentCount, pendingAgreementCount
        ] = await Promise.all([
            User.count(),
            User.count({ where: { userType: 'consultant' } }),
            User.count({ where: { userType: 'beneficiary' } }),
            User.findAll({
                attributes: [
                    'forfaitType',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                group: ['forfaitType']
            }),
            // Aktif/Initial yararlanıcılarda eksik rızalar
            Beneficiary.count({ where: { consentGiven: false, status: {[Op.ne]: 'completed'} } }), 
            // Aktif/Initial yararlanıcılarda eksik sözleşmeler
            Beneficiary.count({ where: { agreementSigned: false, status: {[Op.ne]: 'completed'} } })
        ]);

        // Forfait dağılımını işle
        const forfaitCounts = forfaitDistribution.reduce((acc, item) => {
            const type = item.getDataValue('forfaitType') || 'Aucun';
            acc[type] = item.getDataValue('count');
            return acc;
        }, {});

        res.render('admin/index', {
            title: 'Administration - Tableau de bord',
            user: req.user,
            totalUsers,
            totalConsultants,
            totalBeneficiaries,
            forfaitCounts,
            pendingConsentCount,
            pendingAgreementCount
            // TODO: Bekleyen Anketler, Yaklaşan Takipler gibi diğer metrikler eklenebilir
        });

    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        req.flash('error_msg', 'Erreur lors du chargement du tableau de bord administrateur.');
        res.redirect('/dashboard'); // Danışman dashboard'una yönlendir
    }
});

// GET Kullanıcı Listesi
router.get('/users', ensureAuthenticated, ensureConsultant, async (req, res) => {
    try {
        const { userType: typeFilter, forfaitType: forfaitFilter } = req.query;
        let whereClause = {};

        // Filtreleri whereClause'a ekle
        if (typeFilter) {
            whereClause.userType = typeFilter;
        }
        if (forfaitFilter) {
             // 'null' string'i gelirse null olarak filtrele (paketsizler için)
             if (forfaitFilter === 'null') {
                  whereClause.forfaitType = null;
             } else {
                  whereClause.forfaitType = forfaitFilter;
             }
        }

        const users = await User.findAll({
            where: whereClause,
            order: [['lastName', 'ASC'], ['firstName', 'ASC']]
        });

        // Filtre dropdownları için seçenekler
        const forfaits = await Forfait.findAll({ attributes: ['name'], order:[['name','ASC']]});
        const forfaitOptions = forfaits.map(f => f.name);
        const userTypeOptions = User.getAttributes().userType.values;

        res.render('admin/users', {
            title: 'Gestion des Utilisateurs',
            users,
            user: req.user,
            // Filtre seçenekleri ve seçili değerler
            forfaitOptions,
            userTypeOptions,
            selectedUserType: typeFilter,
            selectedForfaitType: forfaitFilter
        });
    } catch (error) {
        console.error('Admin Users List Error:', error);
        req.flash('error_msg', 'Erreur lors du chargement de la liste des utilisateurs.');
        res.redirect('/dashboard');
    }
});

// GET Kullanıcı Düzenleme Sayfası
router.get('/users/:id/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
    try {
        const userToEdit = await User.findByPk(req.params.id);
        if (!userToEdit) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/admin/users');
        }

        // Forfait seçeneklerini DB'den al
        const forfaits = await Forfait.findAll({ attributes: ['name'], order:[['name','ASC']]});
        const forfaitOptions = forfaits.map(f => f.name);
        const userTypeOptions = User.getAttributes().userType.values;

        res.render('admin/user-edit', {
            title: `Modifier Utilisateur: ${userToEdit.firstName} ${userToEdit.lastName}`,
            userToEdit: userToEdit.toJSON(), // Handlebars için JSON'a çevir
            forfaitOptions,
            userTypeOptions,
            user: req.user // Layout için
        });

    } catch (error) {
        console.error('Admin User Edit GET Error:', error);
        req.flash('error_msg', 'Erreur lors du chargement du formulaire utilisateur.');
        res.redirect('/admin/users');
    }
});

// GET Yeni Kullanıcı Ekleme Sayfası
router.get('/users/add', ensureAuthenticated, ensureConsultant, async (req, res) => {
    try {
        const forfaits = await Forfait.findAll({ attributes: ['name'], order:[['name','ASC']]});
        const forfaitOptions = forfaits.map(f => f.name);
        const userTypeOptions = User.getAttributes().userType.values;
        res.render('admin/user-add', {
            title: 'Ajouter un Nouvel Utilisateur',
            forfaitOptions,
            userTypeOptions,
            user: req.user
        });
    } catch (error) {
        console.error('Admin User Add GET Error:', error);
        req.flash('error_msg', 'Erreur lors du chargement du formulaire d\'ajout.');
        res.redirect('/admin/users');
    }
});

// POST Kullanıcı Güncelleme
router.post('/users/:id/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
    const userIdToEdit = req.params.id;
    const { firstName, lastName, userType, forfaitType } = req.body;
    const adminUserId = req.user.id;

    // Kredi ile ilgili doğrulama kaldırıldı
    if (!firstName || !lastName || !userType) {
         req.flash('error_msg', 'Veuillez remplir tous les champs obligatoires (*).');
        return res.redirect(`/admin/users/${userIdToEdit}/edit`);
    }

    try {
        const userToEdit = await User.findByPk(userIdToEdit);
        if (!userToEdit) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/admin/users');
        }

        // Kendini düzenlemesini engelle (opsiyonel ama önerilir)
        if (userToEdit.id === req.user.id) {
            req.flash('error_msg', 'Vous ne pouvez pas modifier votre propre compte depuis cette interface.');
            return res.redirect(`/admin/users/${userIdToEdit}/edit`);
        }

        let newCredits = userToEdit.availableCredits;
        let creditChangeAmount = 0;
        let creditChangeDescription = null;

        const newForfait = forfaitType || null;
        if (userToEdit.forfaitType !== newForfait) {
            // Krediyi DB'den al
            newCredits = await getDefaultCreditsForForfait(newForfait); 
            creditChangeAmount = newCredits - userToEdit.availableCredits;
            creditChangeDescription = `Changement de forfait: ${userToEdit.forfaitType || 'Aucun'} -> ${newForfait || 'Aucun'}`;
        }

        // Kredi değişikliğini logla (eğer değiştiyse)
        const oldCredits = userToEdit.availableCredits;
        const creditChange = newCredits - oldCredits;

        // LOG: Güncelleme öncesi değerleri logla
        console.log(`ADMIN EDIT - Before Update User ID ${userIdToEdit}:`, {
            firstName, lastName, userType, forfaitType: newForfait, availableCredits: newCredits 
        });

        // Kullanıcıyı güncelle (kredi hariç)
        await userToEdit.update({
            firstName,
            lastName,
            userType,
            forfaitType: newForfait, 
            availableCredits: newCredits 
        });

         // LOG: Güncelleme sonrası (başarılıysa)
         console.log(`ADMIN EDIT - After Update User ID ${userIdToEdit}: Success`);

        // Kredi değiştiyse logla
        if (creditChangeAmount !== 0) {
            await logCreditChange(userIdToEdit, creditChangeAmount, 'ADMIN_FORFAIT_CHANGE', 
                creditChangeDescription, adminUserId);
        }

        req.flash('success_msg', 'Utilisateur mis à jour avec succès.' + (creditChangeDescription ? ` ${creditChangeDescription}. Nouveau solde: ${newCredits} crédits.` : ''));
        res.redirect('/admin/users');

    } catch (error) {
        console.error('Admin User Update POST Error:', error);
        req.flash('error_msg', 'Erreur lors de la mise à jour de l\'utilisateur.');
        res.redirect(`/admin/users/${userIdToEdit}/edit`);
    }
});

// POST Yeni Kullanıcı Ekleme
router.post('/users/add', ensureAuthenticated, ensureConsultant, async (req, res) => {
    const { firstName, lastName, email, password, userType, forfaitType, availableCredits } = req.body;
    let errors = [];

    // Doğrulamalar
    if (!firstName || !lastName || !email || !password || !userType || availableCredits === '' || availableCredits === null) {
        errors.push({ msg: 'Veuillez remplir tous les champs obligatoires.' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }
    const credits = parseInt(availableCredits, 10);
    if (isNaN(credits) || credits < 0) {
        errors.push({ msg: 'Le nombre de crédits doit être un nombre positif.' });
    }

    if (errors.length > 0) {
        let forfaitOptions = [];
        let userTypeOptions = [];
        try {
            const forfaits = await Forfait.findAll({ attributes: ['name'], order:[['name','ASC']]});
            forfaitOptions = forfaits.map(f => f.name);
            userTypeOptions = User.getAttributes().userType.values;
        } catch (err) { console.error("Error fetching options for re-render:", err); }
        
        return res.render('admin/user-add', {
            title: 'Ajouter un Nouvel Utilisateur',
            errors,
            formData: req.body,
            forfaitOptions,
            userTypeOptions,
            user: req.user
        });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            errors.push({ msg: 'Cet email est déjà enregistré.' });
            let forfaitOptions = [];
            let userTypeOptions = [];
            try {
                const forfaits = await Forfait.findAll({ attributes: ['name'], order:[['name','ASC']]});
                forfaitOptions = forfaits.map(f => f.name);
                userTypeOptions = User.getAttributes().userType.values;
            } catch (err) { console.error("Error fetching options for re-render:", err); }
            return res.render('admin/user-add', {
                title: 'Ajouter un Nouvel Utilisateur',
                errors,
                formData: req.body,
                forfaitOptions,
                userTypeOptions,
                user: req.user
            });
        }

        // Yeni kullanıcıyı oluştur (şifre hook ile hashlenir)
        await User.create({
            firstName,
            lastName,
            email,
            password,
            userType,
            forfaitType: forfaitType || null,
            availableCredits: credits
        });

        req.flash('success_msg', 'Nouvel utilisateur ajouté avec succès.');
        res.redirect('/admin/users');

    } catch (error) {
        console.error('Admin Add User POST Error:', error);
        req.flash('error_msg', 'Erreur lors de l\'ajout de l\'utilisateur.');
        let forfaitOptions = [];
        let userTypeOptions = [];
        try {
            const forfaits = await Forfait.findAll({ attributes: ['name'], order:[['name','ASC']]});
            forfaitOptions = forfaits.map(f => f.name);
            userTypeOptions = User.getAttributes().userType.values;
        } catch (err) { console.error("Error fetching options for re-render:", err); }
        res.render('admin/user-add', {
            title: 'Ajouter un Nouvel Utilisateur',
            errors: [{ msg: 'Erreur serveur lors de la création.' }],
            formData: req.body,
            forfaitOptions,
            userTypeOptions,
            user: req.user
        });
    }
});

// POST Kullanıcı Silme
router.post('/users/:id/delete', ensureAuthenticated, ensureConsultant, async (req, res) => {
    const userIdToDelete = req.params.id;
    const currentUserId = req.user.id;

    // Kendini silmeyi engelle
    if (userIdToDelete == currentUserId) { // == kullanıldı çünkü biri string, diğeri number olabilir
        req.flash('error_msg', 'Vous ne pouvez pas supprimer votre propre compte.');
        return res.redirect('/admin/users');
    }

    try {
        const userToDelete = await User.findByPk(userIdToDelete);
        if (!userToDelete) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/admin/users');
        }

        // Kullanıcıyı sil (ilişkili veriler CASCADE ile silinmeli)
        await userToDelete.destroy();

        req.flash('success_msg', `Utilisateur ${userToDelete.firstName} ${userToDelete.lastName} supprimé avec succès.`);
        res.redirect('/admin/users');

    } catch (error) {
        console.error('Admin User Delete POST Error:', error);
        req.flash('error_msg', 'Erreur lors de la suppression de l\'utilisateur.');
        res.redirect('/admin/users');
    }
});

// POST Kredi Ayarlama (Admin)
router.post('/users/:id/adjust-credits', ensureAuthenticated, ensureConsultant, async (req, res) => {
    const userIdToAdjust = req.params.id;
    const adminUserId = req.user.id;
    const { amount, reason } = req.body;

    const creditAmount = parseInt(amount, 10);

    if (isNaN(creditAmount)) {
        req.flash('error_msg', 'Veuillez entrer un montant de crédit valide (nombre).');
        return res.redirect('/admin/users'); // Veya modal açık kalacak şekilde?
    }
    if (!reason || reason.trim() === '') {
         req.flash('error_msg', 'Veuillez fournir une raison pour l\'ajustement.');
        return res.redirect('/admin/users');
    }
    // Kendine kredi eklemeyi/çıkarmayı engelle?
     if (userIdToAdjust == adminUserId) {
        req.flash('error_msg', 'Vous ne pouvez pas ajuster vos propres crédits.');
        return res.redirect('/admin/users');
    }

    try {
        const userToAdjust = await User.findByPk(userIdToAdjust);
        if (!userToAdjust) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/admin/users');
        }

        // Krediyi güncelle
        const newCreditTotal = userToAdjust.availableCredits + creditAmount;
         if (newCreditTotal < 0) {
            req.flash('error_msg', 'Le solde de crédits ne peut pas être négatif.');
             return res.redirect('/admin/users');
        }
        
        userToAdjust.availableCredits = newCreditTotal;
        await userToAdjust.save();

        // Kredi değişikliğini logla
        await logCreditChange(userIdToAdjust, creditAmount, 'ADMIN_ADJUSTMENT', 
            `Ajustement manuel: ${reason}`, adminUserId);

        req.flash('success_msg', `Crédits de ${userToAdjust.firstName} ${userToAdjust.lastName} ajustés avec succès (${creditAmount > 0 ? '+' : ''}${creditAmount}). Nouveau solde: ${userToAdjust.availableCredits}`);
        res.redirect('/admin/users');

    } catch (error) {
        console.error('Admin Credit Adjust POST Error:', error);
        req.flash('error_msg', 'Erreur lors de l\'ajustement des crédits.');
        res.redirect('/admin/users');
    }
});

// POST Paket Tipi Güncelleme (Admin)
router.post('/users/:id/update-forfait', ensureAuthenticated, ensureConsultant, async (req, res) => {
    const userIdToUpdate = req.params.id;
    const adminUserId = req.user.id;
    const { forfaitType } = req.body; // Yeni paket tipi

    const newForfait = forfaitType === '' ? null : forfaitType; // Boş seçilirse null yap
    // Config importu yerine Forfait modeli kullan
    const forfaitExists = newForfait === null || await Forfait.findByPk(newForfait);

    if (!forfaitExists) {
         req.flash('error_msg', 'Type de forfait non valide.');
         return res.redirect('/admin/users');
    }
    // Kendini düzenlemeyi engelle
    if (userIdToUpdate == adminUserId) {
        req.flash('error_msg', 'Vous ne pouvez pas modifier votre propre forfait.');
        return res.redirect('/admin/users');
    }

    try {
        const userToUpdate = await User.findByPk(userIdToUpdate);
        if (!userToUpdate) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/admin/users');
        }

        const oldForfait = userToUpdate.forfaitType;
        const oldCredits = userToUpdate.availableCredits;
        let newCredits = oldCredits;

        if (oldForfait !== newForfait) {
            // Krediyi DB'den al
            newCredits = await getDefaultCreditsForForfait(newForfait); 
            const creditChangeAmount = newCredits - oldCredits;
            const description = `Changement de forfait: ${oldForfait || 'Aucun'} -> ${newForfait || 'Aucun'}`;
            
            // Loglama işlemi (kredi değiştiyse)
            if (creditChangeAmount !== 0) {
                await logCreditChange(userIdToUpdate, creditChangeAmount, 'ADMIN_FORFAIT_CHANGE', 
                    description, adminUserId);
            }

            // Kullanıcıyı güncelle
            await userToUpdate.update({
                forfaitType: newForfait,
                availableCredits: newCredits
            });

            req.flash('success_msg', `Forfait de ${userToUpdate.firstName} ${userToUpdate.lastName} mis à jour vers ${newForfait || 'Aucun'}. Crédits ajustés à ${newCredits}.`);
        } else {
            // Paket değişmediyse mesaj verme veya sadece bilgi mesajı ver?
            // req.flash('info_msg', 'Le type de forfait est déjà le même.');
        }

        res.redirect('/admin/users');

    } catch (error) {
        console.error('Admin Forfait Update POST Error:', error);
        req.flash('error_msg', 'Erreur lors de la mise à jour du forfait utilisateur.');
        res.redirect('/admin/users');
    }
});

// --- Forfait (Paket) Yönetimi ---

// GET Paket Listesi
router.get('/forfaits', ensureAuthenticated, ensureConsultant, async (req, res) => {
    try {
        const forfaits = await Forfait.findAll({ order: [['name', 'ASC']] });
        res.render('admin/forfaits', {
            title: 'Gestion des Forfaits',
            forfaits,
            user: req.user
        });
    } catch (error) {
        console.error("Admin Forfaits List Error:", error);
        req.flash('error_msg', 'Erreur lors du chargement des forfaits.');
        res.redirect('/admin');
    }
});

// GET Paket Düzenleme Sayfası
router.get('/forfaits/:name/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
    try {
        const forfaitName = req.params.name;
        const forfaitToEdit = await Forfait.findByPk(forfaitName);
        if (!forfaitToEdit) {
            req.flash('error_msg', 'Forfait non trouvé.');
            return res.redirect('/admin/forfaits');
        }
        res.render('admin/forfait-edit', {
            title: `Modifier Forfait: ${forfaitToEdit.name}`,
            forfaitToEdit,
            user: req.user
        });
    } catch (error) {
        console.error("Admin Forfait Edit GET Error:", error);
        req.flash('error_msg', 'Erreur lors du chargement du formulaire forfait.');
        res.redirect('/admin/forfaits');
    }
});

// POST Paket Güncelleme
router.post('/forfaits/:name/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
    const forfaitName = req.params.name;
    // Paket adının değiştirilemeyeceğini varsayıyoruz (Primary Key)
    const { description, defaultCredits, features } = req.body;

    const credits = parseInt(defaultCredits, 10);
    if (isNaN(credits) || credits < 0) {
        req.flash('error_msg', 'Le nombre de crédits par défaut doit être un nombre positif.');
        return res.redirect(`/admin/forfaits/${forfaitName}/edit`);
    }

    try {
        const forfaitToEdit = await Forfait.findByPk(forfaitName);
        if (!forfaitToEdit) {
            req.flash('error_msg', 'Forfait non trouvé.');
            return res.redirect('/admin/forfaits');
        }

        await forfaitToEdit.update({
            description,
            defaultCredits: credits,
            features // Modeldeki set() bunu işleyecek (array veya string bekliyor)
        });

        req.flash('success_msg', `Forfait '${forfaitName}' mis à jour avec succès.`);
        res.redirect('/admin/forfaits');

    } catch (error) {
         console.error("Admin Forfait Update POST Error:", error);
        req.flash('error_msg', 'Erreur lors de la mise à jour du forfait.');
        res.redirect(`/admin/forfaits/${forfaitName}/edit`);
    }
});

// TODO: Kullanıcı Düzenleme/Silme/Oluşturma rotaları eklenebilir

module.exports = router; 