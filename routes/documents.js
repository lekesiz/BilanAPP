const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureConsultantOrBeneficiary } = require('../middlewares/auth');
const { checkAndDeductCredits } = require('../middlewares/credits');
const { Document, Beneficiary, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { logCreditChange } = require('../services/creditService'); // Log servisi

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/documents');
        // Klasör yoksa oluştur
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Benzersiz dosya adı oluştur (timestamp + originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_')); // Boşlukları alt çizgi ile değiştir
    }
});

// Dosya türü filtresi
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|png|jpg|jpeg|xls|xlsx|ppt|pptx|txt/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Desteklenmeyen dosya türü. İzin verilenler: pdf, doc(x), xls(x), ppt(x), txt, png, jpg, jpeg'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
    fileFilter: fileFilter
}).single('documentFile'); // middleware'i burada tanımla

// --- Document Routes ---

// Liste des documents
router.get('/', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
    try {
        let whereClause = {};
        const queryOptions = {
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'firstName', 'lastName', 'userType'] },
                {
                    model: Beneficiary,
                    as: 'beneficiary',
                    required: false, // beneficiary olmasa da dokümanları getir
                    include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        };
        
        let beneficiaries = []; // Danışman filtresi için
        const userType = req.user.userType;
        const userId = req.user.id;

        // Kategori filtresini uygula (varsa)
        if (req.query.category) {
            whereClause.category = req.query.category;
        }

        if (userType === 'consultant') {
             beneficiaries = await Beneficiary.findAll({
                 where: { consultantId: userId },
                 include: { model: User, as: 'user' }
             });
             const ownBeneficiaryIds = beneficiaries.map(b => b.id);

            let beneficiaryFilterClause = {};
            if (req.query.beneficiary && req.query.beneficiary === 'consultant_only') {
                 beneficiaryFilterClause = { uploadedBy: userId, beneficiaryId: null };
             } else if (req.query.beneficiary) {
                 if (ownBeneficiaryIds.includes(parseInt(req.query.beneficiary, 10))) {
                     beneficiaryFilterClause = { beneficiaryId: req.query.beneficiary };
                 } else {
                      beneficiaryFilterClause.id = -1; // Eşleşme olmasın
                 }
            } else {
                 beneficiaryFilterClause = {
                     [Op.or]: [
                         { beneficiaryId: { [Op.in]: ownBeneficiaryIds } },
                         { uploadedBy: userId }
                     ]
                 };
             }
             // Kategori ve yararlanıcı filtrelerini birleştir
             whereClause = { ...whereClause, ...beneficiaryFilterClause };

        } else {
            const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: userId } });
            if (!beneficiaryProfile) {
                req.flash('error_msg', 'Profiliniz bulunamadı.');
                return res.redirect('/dashboard');
            }
            // Yararlanıcı sadece kendine ait olanları görür (kategori filtresiyle birlikte)
            whereClause.beneficiaryId = beneficiaryProfile.id;
        }

        queryOptions.where = whereClause;
        const documents = await Document.findAll(queryOptions);

        // Tüm kategorileri al (filtreleme için)
        const categories = Document.getAttributes().category.values;

        res.render('documents/index', {
            title: 'Mes Documents',
            documents,
            beneficiaries,
            categories, // Kategori filtresi için
            selectedBeneficiary: req.query.beneficiary,
            selectedCategory: req.query.category, // Seçili filtreler
            user: req.user,
            isConsultant: userType === 'consultant'
        });

    } catch (err) {
        console.error('Documents list error:', err);
        req.flash('error_msg', 'Dokümanlar yüklenirken bir hata oluştu.');
        res.redirect('/dashboard');
    }
});

// Formulaire d'upload de document
router.get('/upload', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
   try {
        let beneficiaries = [];
        let preselectedBeneficiary = req.query.beneficiary;

        if (req.user.userType === 'consultant') {
            beneficiaries = await Beneficiary.findAll({
                where: { consultantId: req.user.id },
                include: { model: User, as: 'user' }
            });
        } else {
            // Yararlanıcı sadece kendi için yükleyebilir
             const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: req.user.id } });
             if (!beneficiaryProfile) {
                 req.flash('error_msg', 'Profiliniz bulunamadı.');
                 return res.redirect('/documents');
             }
             preselectedBeneficiary = beneficiaryProfile.id; // Kendi ID'sini ata
        }

        res.render('documents/upload', {
            title: 'Télécharger un document',
            user: req.user,
            beneficiaries, // Danışman için yararlanıcı listesi
            preselectedBeneficiary,
            isConsultant: req.user.userType === 'consultant'
        });
    } catch (error) {
        console.error('Upload form error:', error);
        req.flash('error_msg', 'Yükleme formu açılırken bir hata oluştu.');
        res.redirect('/documents');
    }
});

// Traitement de l'upload
const UPLOAD_COST = 2; // Doküman yükleme maliyeti
router.post('/upload', 
    ensureAuthenticated, 
    ensureConsultantOrBeneficiary, 
    checkAndDeductCredits(UPLOAD_COST), // Kredi kontrol middleware'i eklendi
    (req, res) => {
        upload(req, res, async (err) => {
            if (err) { // Multer veya fileFilter hatası
                console.error('Multer/Filter error during upload:', err);
                 // Kredi düşüldüyse geri yüklemek gerekir mi? Middleware bunu yapmaz.
                 // Şimdilik sadece hata mesajı gösterelim.
                req.flash('error_msg', `Dosya yükleme hatası: ${err.message}`);
                return res.redirect('/documents/upload');
            }
            if (!req.file) {
                 // Kredi middleware'den geçtiyse ama dosya yoksa (nadiren olmalı)
                req.flash('error_msg', 'Lütfen bir dosya seçin.');
                 // Krediyi geri yükle?
                return res.redirect('/documents/upload');
            }

            // Dosya yüklendi, DB'ye kaydet
            const { beneficiaryId, description, category, bilanPhase } = req.body;
            const uploadedBy = req.user.id;
            const cost = req.creditCost || UPLOAD_COST; // Maliyeti al

            try {
                let finalBeneficiaryId = null;
                if (req.user.userType === 'consultant') {
                     if (beneficiaryId && beneficiaryId !== '') {
                        const isOwnBeneficiary = await Beneficiary.findOne({ where: { id: beneficiaryId, consultantId: req.user.id } });
                        if (!isOwnBeneficiary) {
                            req.flash('error_msg', 'Geçersiz yararlanıcı seçimi.');
                            fs.unlinkSync(req.file.path);
                             // Krediyi geri yükle?
                            return res.redirect('/documents/upload');
                        }
                        finalBeneficiaryId = parseInt(beneficiaryId, 10); // Integer olduğundan emin ol
                     } else {
                         finalBeneficiaryId = null; 
                     }
                } else {
                     const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: req.user.id } });
                     if (!beneficiaryProfile) {
                         req.flash('error_msg', 'Profiliniz bulunamadı.');
                         fs.unlinkSync(req.file.path);
                          // Krediyi geri yükle?
                         return res.redirect('/documents');
                     }
                     finalBeneficiaryId = beneficiaryProfile.id;
                 }

                const newDocument = await Document.create({
                    fileName: req.file.filename,
                    originalName: req.file.originalname,
                    filePath: '/uploads/documents/' + req.file.filename,
                    fileType: req.file.mimetype,
                    fileSize: req.file.size,
                    description,
                    category,
                    bilanPhase: bilanPhase || null,
                    uploadedBy,
                    beneficiaryId: finalBeneficiaryId
                });

                // Kredi Kullanımını Logla (Fonksiyon adı düzeltildi)
                await logCreditChange(uploadedBy, cost, 'DOCUMENT_UPLOAD', 
                    `Téléchargement document '${newDocument.originalName}'`, 
                    newDocument.id, 'Document');

                req.flash('success_msg', `Document téléchargé avec succès (${cost} crédits déduits).`);
                res.redirect('/documents');

            } catch (dbErr) {
                console.error('Document DB save error:', dbErr);
                if (req.file && req.file.path) {
                    try { fs.unlinkSync(req.file.path); } catch (unlinkErr) { console.error("Error deleting file after DB error:", unlinkErr); }
                }
                 // Kredi geri yükleme?
                req.flash('error_msg', 'Doküman bilgileri kaydedilirken bir hata oluştu. (Detaylar konsolda)');
                res.redirect('/documents/upload');
            }
        });
    }
);

// GET Doküman Düzenleme Sayfası
router.get('/:id/edit', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id, {
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'firstName', 'lastName'] },
                { model: Beneficiary, as: 'beneficiary', required: false, include: { model: User, as: 'user' } }
            ]
        });

        if (!document) {
            req.flash('error_msg', 'Document non trouvé.');
            return res.redirect('/documents');
        }

        // Yetki Kontrolü (Sadece yükleyen veya ilgili yararlanıcının danışmanı)
        let canEdit = false;
        if (req.user.id === document.uploadedBy) {
            canEdit = true;
        } else if (req.user.userType === 'consultant' && document.beneficiary && document.beneficiary.consultantId === req.user.id) {
            canEdit = true;
        }

        if (!canEdit) {
            req.flash('error_msg', 'Vous n\'êtes pas autorisé à modifier ce document.');
            return res.redirect('/documents');
        }

        // Danışmansa ve doküman bir yararlanıcıya atanmışsa, yararlanıcı listesi
        let beneficiaries = [];
        if (req.user.userType === 'consultant') {
             beneficiaries = await Beneficiary.findAll({
                 where: { consultantId: req.user.id },
                 include: { model: User, as: 'user' }
             });
         }

        res.render('documents/edit', {
            title: `Modifier: ${document.originalName}`,
            document,
            beneficiaries, // Yararlanıcı atama için
            user: req.user,
            isConsultant: req.user.userType === 'consultant'
        });

    } catch (error) {
        console.error('Document edit form error:', error);
        req.flash('error_msg', 'Erreur lors du chargement du formulaire de modification.');
        res.redirect('/documents');
    }
});

// POST Doküman Güncelleme
router.post('/:id/edit', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
    const documentId = req.params.id;
    const { description, category, bilanPhase, beneficiaryId } = req.body;

    try {
        const document = await Document.findByPk(documentId, {
            include: { model: Beneficiary, as: 'beneficiary' }
        });

        if (!document) {
            req.flash('error_msg', 'Document non trouvé.');
            return res.redirect('/documents');
        }

        // Yetki Kontrolü
        let canEdit = false;
         if (req.user.id === document.uploadedBy) {
            canEdit = true;
        } else if (req.user.userType === 'consultant' && document.beneficiary && document.beneficiary.consultantId === req.user.id) {
            canEdit = true;
        }
        if (!canEdit) {
             req.flash('error_msg', 'Vous n\'êtes pas autorisé à modifier ce document.');
            return res.redirect('/documents');
        }
        
        // Danışman yararlanıcı atamasını değiştiriyorsa kontrol et
        let finalBeneficiaryId = document.beneficiaryId;
        if (req.user.userType === 'consultant') {
            if (beneficiaryId && beneficiaryId !== '') {
                 const isOwnBeneficiary = await Beneficiary.findOne({ where: { id: beneficiaryId, consultantId: req.user.id } });
                 if (!isOwnBeneficiary) {
                     req.flash('error_msg', 'Assignation à un bénéficiaire non valide.');
                     return res.redirect(`/documents/${documentId}/edit`);
                 }
                 finalBeneficiaryId = parseInt(beneficiaryId, 10); // Integer olduğundan emin ol
             } else {
                 finalBeneficiaryId = null; // Atamayı kaldır
             }
        } // Yararlanıcı kendi atamasını değiştiremez
        

        await document.update({
            description,
            category,
            bilanPhase: bilanPhase || null,
            beneficiaryId: finalBeneficiaryId
        });

        req.flash('success_msg', 'Document mis à jour avec succès.');
        res.redirect('/documents');

    } catch (error) {
        console.error('Document update error:', error);
        req.flash('error_msg', 'Erreur lors de la mise à jour du document.');
        res.redirect(`/documents/${documentId}/edit`);
    }
});

// Suppression d'un document
router.post('/:id/delete', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
    const documentId = req.params.id;
    const userId = req.user.id;
    const userType = req.user.userType;

    try {
        const document = await Document.findByPk(documentId, {
            include: { model: Beneficiary, as: 'beneficiary' }
        });

        if (!document) {
            req.flash('error_msg', 'Doküman bulunamadı.');
            return res.redirect('/documents');
        }

        // Yetki kontrolü
        let canDelete = false;
        if (userType === 'consultant') {
            const isOwnBeneficiary = document.beneficiary ? document.beneficiary.consultantId === userId : false;
            canDelete = (document.uploadedBy === userId || isOwnBeneficiary);
        } else {
            const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: userId } });
            // Yararlanıcı sadece kendine ait VE KENDİ YÜKLEDİĞİ dokümanı silebilir
            canDelete = (beneficiaryProfile && document.beneficiaryId === beneficiaryProfile.id && document.uploadedBy === userId);
        }

        if (!canDelete) {
             req.flash('error_msg', 'Bu dokümanı silme yetkiniz yok.');
            return res.redirect('/documents');
        }

        // Dosyayı fiziksel olarak sil
        const filePath = path.join(__dirname, '../public', document.filePath);
         try {
             if (fs.existsSync(filePath)) {
                 fs.unlinkSync(filePath);
             }
         } catch (unlinkErr) {
              console.error("Error deleting physical file:", unlinkErr);
         }

        // Veritabanından sil
        await document.destroy();

        req.flash('success_msg', 'Document supprimé avec succès.');
        res.redirect('/documents');

    } catch (err) {
        console.error('Document delete error:', err);
        req.flash('error_msg', 'Doküman silinirken bir hata oluştu.');
        res.redirect('/documents');
    }
});

module.exports = router;