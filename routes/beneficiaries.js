const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureConsultant } = require('../middlewares/auth');
const { Beneficiary, User, Appointment, Message, Questionnaire, Document, Question, Answer } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { checkAndDeductCredits } = require('../middlewares/credits');
const { checkAccessLevel } = require('../middlewares/permissions');
const { logCreditUsage, logCreditChange } = require('../services/creditService');
const aiService = require('../services/aiService'); // AI servisini import et

// Liste des bénéficiaires
router.get('/', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    let whereClause = { consultantId: req.user.id };
    const { filter, status, phase, consentMissing, agreementMissing } = req.query; // Yeni filtreler
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    let orderClause = [['createdAt', 'DESC']];
    let activeFilterLabel = null; // Aktif filtre etiketini tutmak için

    // Genel Filtreleri Uygula (Raporlardan gelen)
    if (filter === 'upcoming_followup_30days') {
        whereClause.followUpDate = { [Op.ne]: null, [Op.gte]: today, [Op.lte]: next30Days };
        orderClause = [['followUpDate', 'ASC']];
        activeFilterLabel = 'Entretiens de suivi (30 prochains jours)';
    }
    // Durum Filtresi
    if (status) {
        whereClause.status = status;
        activeFilterLabel = `Statut: ${status}`;
    }
    // Aşama Filtresi
    if (phase) {
        whereClause.currentPhase = phase;
        activeFilterLabel = `Phase: ${phase}`;
    }

    // Yeni Filtreler
    if (consentMissing === 'true') {
        whereClause.consentGiven = false;
        activeFilterLabel = 'Consentement Manquant';
    }
    if (agreementMissing === 'true') {
        whereClause.agreementSigned = false;
        activeFilterLabel = 'Convention Non Signée';
    }

    const beneficiaries = await Beneficiary.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user' },
        { model: Appointment, as: 'beneficiaryAppointments', limit: 1, order: [['date', 'DESC']] }
      ],
      order: orderClause 
    });
    
    res.render('beneficiaries/index', {
      title: 'Mes bénéficiaires',
      beneficiaries,
      user: req.user,
      activeFilter: activeFilterLabel // View'a gönderilecek etiket
    });
  } catch (err) {
    console.error('Beneficiary list error:', err);
    req.flash('error_msg', 'Liste des bénéficiaires non chargée.');
    res.redirect('/dashboard');
  }
});

// Formulaire d'ajout d'un bénéficiaire
router.get('/add', ensureAuthenticated, ensureConsultant, (req, res) => {
  res.render('beneficiaries/add', {
    title: 'Ajouter un bénéficiaire',
    user: req.user
  });
});

// Traitement du formulaire d'ajout
router.post('/add', ensureAuthenticated, ensureConsultant, async (req, res) => {
  const { firstName, lastName, email, phone, notes, status, currentPhase, education, experience, identifiedSkills, careerObjectives, actionPlan, synthesis, bilanStartDate, bilanEndDate, synthesisDocumentPath, actionPlanDocumentPath } = req.body;
  const consultantId = req.user.id;

  try {
    // Vérifier si l'email existe déjà dans la table User
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      req.flash('error_msg', 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.');
      return res.render('beneficiaries/add', { 
        title: 'Ajouter un bénéficiaire', 
        user: req.user, 
        error_msg: req.flash('error_msg')[0],
        beneficiaryData: { firstName, lastName, email, phone, notes, status, currentPhase, education, experience, identifiedSkills, careerObjectives, actionPlan, synthesis, bilanStartDate, bilanEndDate, synthesisDocumentPath, actionPlanDocumentPath }
      });
    }
    
    // Yeni bir kullanıcı oluştur (beneficiary tipi ile)
    const defaultPassword = 'password123'; // Geçici şifre, kullanıcı daha sonra değiştirmeli
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType: 'beneficiary'
    });

    // Yeni yararlanıcıyı oluştur (yeni bilan takip alanlarıyla birlikte)
    await Beneficiary.create({
      userId: newUser.id,
      consultantId,
      phone,
      notes,
      status,
      currentPhase,
      education, 
      experience, 
      identifiedSkills, 
      careerObjectives, 
      actionPlan, 
      synthesis,
      bilanStartDate: bilanStartDate || null,
      bilanEndDate: bilanEndDate || null,
      synthesisDocumentPath: synthesisDocumentPath || null,
      actionPlanDocumentPath: actionPlanDocumentPath || null
    });
    
    req.flash('success_msg', 'Yararlanıcı başarıyla eklendi.');
    res.redirect('/beneficiaries');
  } catch (err) {
    console.error('Beneficiary add error:', err);
    // Hata durumunda oluşturulan kullanıcıyı sil (rollback)
    if (err.name === 'SequelizeValidationError' && err.errors) {
      req.flash('error_msg', err.errors.map(e => e.message).join(', '));
    } else {
      req.flash('error_msg', 'Yararlanıcı eklenirken bir hata oluştu.');
    }
    // Kullanıcı oluşturulduysa sil
    const createdUser = await User.findOne({ where: { email } });
    if (createdUser) {
      await createdUser.destroy();
    }
    res.render('beneficiaries/add', { 
      title: 'Ajouter un bénéficiaire', 
      user: req.user, 
      error_msg: req.flash('error_msg')[0],
      beneficiaryData: req.body // Tüm form verilerini geri gönder
    });
  }
});

// Détails d'un bénéficiaire
router.get('/:id', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({
      where: { 
        id: req.params.id,
        consultantId: req.user.id
      },
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'consultant', attributes: ['firstName', 'lastName'] },
        { model: Appointment, as: 'beneficiaryAppointments', order: [['date', 'DESC']] },
        { model: Message, as: 'beneficiaryMessages', limit: 5, order: [['createdAt', 'DESC']], include: { model: User, as: 'sender' } },
        { model: Questionnaire, as: 'assignedQuestionnaires', include: { model: User, as: 'creator' } },
        { model: Document, as: 'beneficiaryDocuments', include: { model: User, as: 'uploader' } }
      ]
    });
    
    if (!beneficiary) {
      req.flash('error_msg', 'Yararlanıcı bulunamadı.');
      return res.redirect('/beneficiaries');
    }
    
    res.render('beneficiaries/details', {
      title: `Bénéficiaire: ${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      beneficiary,
      user: req.user
    });
  } catch (err) {
    console.error('Beneficiary details error:', err);
    req.flash('error_msg', 'Yararlanıcı detayları yüklenirken bir hata oluştu.');
    res.redirect('/beneficiaries');
  }
});

// Formulaire de modification d'un bénéficiaire
router.get('/:id/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({
      where: { 
        id: req.params.id,
        consultantId: req.user.id
      },
      include: { model: User, as: 'user' }
    });
    
    if (!beneficiary) {
      req.flash('error_msg', 'Yararlanıcı bulunamadı.');
      return res.redirect('/beneficiaries');
    }

    // İlgili dokümanları getir (Sentez ve Aksiyon Planı)
    const synthesisDocuments = await Document.findAll({
        where: {
             uploadedBy: req.user.id, // Sadece danışmanın yükledikleri?
             // VEYA hem danışman hem yararlanıcının yükledikleri?
             // VEYA sadece yararlanıcıya atanmış olanlar?
             // Şimdilik danışmanın yüklediklerini alalım
             category: 'Synthèse'
            // beneficiaryId: beneficiary.id // Veya sadece bu yararlanıcıya atanmış olanlar
        },
        order: [['createdAt', 'DESC']]
    });
     const actionPlanDocuments = await Document.findAll({
        where: {
             uploadedBy: req.user.id, 
             category: 'Plan d\'Action'
            // beneficiaryId: beneficiary.id
        },
        order: [['createdAt', 'DESC']]
    });
    
    res.render('beneficiaries/edit', {
      title: `Modifier: ${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      beneficiary,
      synthesisDocuments, // View'a gönder
      actionPlanDocuments, // View'a gönder
      user: req.user
    });
  } catch (err) {
    console.error('Beneficiary edit form error:', err);
    req.flash('error_msg', 'Düzenleme formu yüklenirken bir hata oluştu.');
    res.redirect('/beneficiaries');
  }
});

// Traitement du formulaire de modification
router.post('/:id/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
  const { firstName, lastName, email, phone, notes, status, currentPhase, education, experience, identifiedSkills, careerObjectives, actionPlan, synthesis, bilanStartDate, bilanEndDate, followUpDate, followUpNotes, consentGiven, consentDate, agreementSigned, agreementDate, preliminaryInterviewDone, investigationPhaseStarted, synthesisMeetingDone, followUpMeetingDone, synthesisFinalized, synthesisFinalizedDate } = req.body;
  const beneficiaryId = req.params.id;
  const consultantId = req.user.id;

  console.log(`--- Beneficiary Edit POST /${beneficiaryId} --- Received Data:`, {
    synthesisFinalized: req.body.synthesisFinalized,
    synthesisFinalizedDate: req.body.synthesisFinalizedDate
  });

  try {
    const beneficiary = await Beneficiary.findOne({
      where: { id: beneficiaryId, consultantId: consultantId },
      include: { model: User, as: 'user' }
    });
    
    if (!beneficiary) {
      req.flash('error_msg', 'Yararlanıcı bulunamadı.');
      return res.redirect('/beneficiaries');
    }

    // E-posta adresi değiştiyse ve yeni e-posta başka bir kullanıcıya aitse kontrol et
    if (email !== beneficiary.user.email) {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser && existingUser.id !== beneficiary.userId) {
            req.flash('error_msg', 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.');
            return res.redirect(`/beneficiaries/${beneficiaryId}/edit`);
        }
    }

    // Kullanıcı bilgilerini güncelle
    await User.update({ firstName, lastName, email }, { where: { id: beneficiary.userId } });

    // Checkbox değerlerini doğru işle
    const getCheckboxValue = (value) => {
        if (Array.isArray(value)) {
            // Eğer dizi geldiyse, 'true' içeriyor mu kontrol et
            return value.includes('true');
        } else {
            // Dizi değilse, string 'true' mu kontrol et
            return value === 'true';
        }
    };

    const updateData = {
      phone: req.body.phone,
      notes: req.body.notes,
      status: req.body.status,
      currentPhase: req.body.currentPhase,
      education: req.body.education, 
      experience: req.body.experience, 
      identifiedSkills: req.body.identifiedSkills, 
      careerObjectives: req.body.careerObjectives, 
      actionPlan: req.body.actionPlan, 
      synthesis: req.body.synthesis, 
      bilanStartDate: req.body.bilanStartDate || null,
      bilanEndDate: req.body.bilanEndDate || null,
      followUpDate: req.body.followUpDate || null, 
      followUpNotes: req.body.followUpNotes || null,
      consentGiven: getCheckboxValue(req.body.consentGiven),
      consentDate: req.body.consentDate || null,
      agreementSigned: getCheckboxValue(req.body.agreementSigned),
      agreementDate: req.body.agreementDate || null,
      preliminaryInterviewDone: getCheckboxValue(req.body.preliminaryInterviewDone),
      investigationPhaseStarted: getCheckboxValue(req.body.investigationPhaseStarted),
      synthesisMeetingDone: getCheckboxValue(req.body.synthesisMeetingDone),
      followUpMeetingDone: getCheckboxValue(req.body.followUpMeetingDone),
      synthesisFinalized: getCheckboxValue(req.body.synthesisFinalized),
      synthesisFinalizedDate: req.body.synthesisFinalizedDate || null 
    };
    
    console.log(`--- Beneficiary Edit POST /${beneficiaryId} --- Data to Update:`, updateData);

    await beneficiary.update(updateData);
    
    console.log(`--- Beneficiary Edit POST /${beneficiaryId} --- Update Success`);

    req.flash('success_msg', 'Yararlanıcı bilgileri başarıyla güncellendi.');
    res.redirect(`/beneficiaries/${beneficiary.id}`);
  } catch (err) {
    console.error(`--- Beneficiary Edit POST /${beneficiaryId} --- CATCH ERROR:`, err);
    req.flash('error_msg', 'Yararlanıcı güncellenirken bir hata oluştu.');
    res.redirect(`/beneficiaries/${beneficiaryId}/edit`);
  }
});

// Yararlanıcı silme
router.post('/:id/delete', ensureAuthenticated, ensureConsultant, async (req, res) => {
  const beneficiaryId = req.params.id;
  const consultantId = req.user.id;

  try {
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: beneficiaryId,
        consultantId: consultantId
      }
    });

    if (!beneficiary) {
      req.flash('error_msg', 'Yararlanıcı bulunamadı.');
      return res.redirect('/beneficiaries');
    }

    const userId = beneficiary.userId;

    // İlişkili verileri sil (opsiyonel, cascade delete ayarlarına bağlı)
    // Örnek: await Appointment.destroy({ where: { beneficiaryId } });

    // Yararlanıcıyı sil
    await beneficiary.destroy();

    // İlişkili kullanıcıyı sil
    await User.destroy({ where: { id: userId } });

    req.flash('success_msg', 'Yararlanıcı başarıyla silindi.');
    res.redirect('/beneficiaries');
  } catch (error) {
    console.error('Beneficiary delete error:', error);
    req.flash('error_msg', 'Yararlanıcı silinirken bir hata oluştu.');
    res.redirect('/beneficiaries');
  }
});

// Yararlanıcının Bilan aşamasını güncelle (POST)
router.post('/:id/update-phase', ensureAuthenticated, ensureConsultant, async (req, res) => {
  const beneficiaryId = req.params.id;
  const consultantId = req.user.id;
  const { currentPhase } = req.body;

  // Geçerli phase değerlerini kontrol et
  const validPhases = Beneficiary.getAttributes().currentPhase.values;
  if (!validPhases.includes(currentPhase)) {
      req.flash('error_msg', 'Geçersiz aşama değeri.');
      return res.redirect(`/beneficiaries/${beneficiaryId}`);
  }

  try {
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: beneficiaryId,
        consultantId: consultantId // Sadece kendi yararlanıcısını güncelleyebilir
      }
    });

    if (!beneficiary) {
      req.flash('error_msg', 'Yararlanıcı bulunamadı veya yetkiniz yok.');
      return res.redirect('/beneficiaries');
    }

    await beneficiary.update({ currentPhase });

    req.flash('success_msg', 'Bilan aşaması başarıyla güncellendi.');
    res.redirect(`/beneficiaries/${beneficiaryId}`);

  } catch (error) {
    console.error('Beneficiary phase update error:', error);
    req.flash('error_msg', 'Aşama güncellenirken bir hata oluştu.');
    res.redirect(`/beneficiaries/${beneficiaryId}`);
  }
});

// Yararlanıcının belirlenen becerilerini güncelle (AJAX)
router.post('/:id/update-skills', ensureAuthenticated, ensureConsultant, async (req, res) => {
    const beneficiaryId = req.params.id;
    const consultantId = req.user.id;
    const { identifiedSkills } = req.body;

    try {
        const beneficiary = await Beneficiary.findOne({
            where: {
                id: beneficiaryId,
                consultantId: consultantId
            }
        });

        if (!beneficiary) {
            return res.status(404).json({ success: false, message: 'Yararlanıcı bulunamadı veya yetkiniz yok.' });
        }

        await beneficiary.update({ identifiedSkills: identifiedSkills || '' }); // Boş gönderilirse temizle

        // Başarılı yanıt gönder (güncellenmiş becerilerle birlikte gönderilebilir)
        res.json({ success: true, message: 'Compétences mises à jour avec succès.', updatedSkills: beneficiary.identifiedSkills });

    } catch (error) {
        console.error('Beneficiary skills update error:', error);
        res.status(500).json({ success: false, message: 'Beceriler güncellenirken bir sunucu hatası oluştu.' });
    }
});

// Belirli bir alanı AJAX ile güncellemek için genel fonksiyon
async function updateBeneficiaryField(req, res, fieldName) {
    const beneficiaryId = req.params.id;
    const consultantId = req.user.id;
    const { [fieldName]: fieldValue } = req.body; // Dinamik alan adı

    try {
        const beneficiary = await Beneficiary.findOne({
            where: {
                id: beneficiaryId,
                consultantId: consultantId
            }
        });

        if (!beneficiary) {
            return res.status(404).json({ success: false, message: 'Yararlanıcı bulunamadı veya yetkiniz yok.' });
        }

        // Alanı güncelle
        await beneficiary.update({ [fieldName]: fieldValue || '' });

        res.json({ 
            success: true, 
            message: `Alan (${fieldName}) başarıyla güncellendi.`, 
            updatedValue: beneficiary[fieldName] 
        });

    } catch (error) {
        console.error(`Beneficiary ${fieldName} update error:`, error);
        res.status(500).json({ success: false, message: `Alan (${fieldName}) güncellenirken bir sunucu hatası oluştu.` });
    }
}

// Alan güncelleme rotaları
router.post('/:id/update-notes', ensureAuthenticated, ensureConsultant, (req, res) => updateBeneficiaryField(req, res, 'notes'));
router.post('/:id/update-education', ensureAuthenticated, ensureConsultant, (req, res) => updateBeneficiaryField(req, res, 'education'));
router.post('/:id/update-experience', ensureAuthenticated, ensureConsultant, (req, res) => updateBeneficiaryField(req, res, 'experience'));
router.post('/:id/update-objectives', ensureAuthenticated, ensureConsultant, (req, res) => updateBeneficiaryField(req, res, 'careerObjectives'));
router.post('/:id/update-actionplan', ensureAuthenticated, ensureConsultant, (req, res) => updateBeneficiaryField(req, res, 'actionPlan'));
router.post('/:id/update-synthesis', ensureAuthenticated, ensureConsultant, (req, res) => updateBeneficiaryField(req, res, 'synthesis'));

// Takip notlarını güncelle (AJAX)
router.post('/:id/update-followup-notes', ensureAuthenticated, ensureConsultant, (req, res) => updateBeneficiaryField(req, res, 'followUpNotes'));

// --- AI Doküman Oluşturma Simülasyonu ---
const GENERATE_SYNTHESIS_COST = 20;
const GENERATE_ACTIONPLAN_COST = 15;
const MIN_FORFAIT_AI = 'Premium'; // AI için minimum paket

// Sentez Taslağı Oluşturma (AI ile)
router.post('/:id/generate-synthesis', 
    ensureAuthenticated, 
    ensureConsultant, 
    checkAccessLevel(MIN_FORFAIT_AI), // Paket seviyesi kontrolü eklendi
    checkAndDeductCredits(GENERATE_SYNTHESIS_COST), 
    async (req, res) => {
        const beneficiaryId = req.params.id;
        const consultantId = req.user.id;
        const cost = req.creditCost || GENERATE_SYNTHESIS_COST;
        try {
            const beneficiary = await Beneficiary.findOne({ 
                where: { id: beneficiaryId, consultantId },
                 // İlişkili verileri daha detaylı çekelim
                include: [
                    { model: User, as: 'user' }, 
                    { 
                        model: Questionnaire, 
                        as: 'assignedQuestionnaires', 
                        required: false, // Anket olmasa da devam et
                        include: [ // Ankete ait soruları ve cevapları çek
                            { 
                                model: Question, 
                                as: 'questions', 
                                include: [
                                    { 
                                        model: Answer, 
                                        as: 'answers', 
                                        where: { beneficiaryId: beneficiaryId }, // Sadece bu yararlanıcının cevapları
                                        required: false // Cevap olmasa da soruyu getir
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            if (!beneficiary) { throw new Error('Beneficiary not found or not authorized.'); }

            // AI Servisine gönderilecek veri objesini hazırla
            const beneficiaryDataForAI = {
                ...beneficiary.toJSON(), // Tüm beneficiary alanları
                user: beneficiary.user.toJSON() // User bilgisi
                // assignedQuestionnaires: beneficiary.assignedQuestionnaires // Anketler (aiService'de işlenecek)
            };

            const generatedText = await aiService.generateSynthesisDraft(beneficiaryDataForAI); 

            await beneficiary.update({ synthesis: generatedText });
            
            await logCreditChange(consultantId, cost, 'AI_GENERATE_SYNTHESIS', 
                `Génération ébauche synthèse pour ${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
                 beneficiaryId, 'Beneficiary');

            req.flash('success_msg', `Ébauche de synthèse générée par IA (${cost} crédits déduits). Veuillez la vérifier et la compléter.`);
            res.redirect(`/beneficiaries/${beneficiaryId}#conclusion-content`); 

        } catch (error) {
           console.error('Generate synthesis error:', error);
           req.flash('error_msg', `Erreur lors de la génération IA: ${error.message}`);
           res.redirect(`/beneficiaries/${beneficiaryId}`);
        }
    }
);

// Aksiyon Planı Taslağı Oluşturma (AI ile)
router.post('/:id/generate-actionplan', 
    ensureAuthenticated, 
    ensureConsultant, 
    checkAccessLevel(MIN_FORFAIT_AI), // Paket seviyesi kontrolü eklendi
    checkAndDeductCredits(GENERATE_ACTIONPLAN_COST), 
    async (req, res) => {
         const beneficiaryId = req.params.id;
        const consultantId = req.user.id;
        const cost = req.creditCost || GENERATE_ACTIONPLAN_COST;
        try {
             const beneficiary = await Beneficiary.findOne({ 
                 where: { id: beneficiaryId, consultantId },
                  include: [
                    { model: User, as: 'user' }, 
                    // Sentez özeti ve beceriler zaten beneficiary objesinde var
                    // Belki tamamlanmış anketler de faydalı olabilir?
                     { model: Questionnaire, as: 'assignedQuestionnaires', where: {status: 'completed'}, required: false }
                ]
             });
             if (!beneficiary) { throw new Error('Beneficiary not found or not authorized.'); }

             const beneficiaryDataForAI = {
                ...beneficiary.toJSON(),
                user: beneficiary.user.toJSON()
            };

            const generatedText = await aiService.generateActionPlanDraft(beneficiaryDataForAI);

            await beneficiary.update({ actionPlan: generatedText });

             await logCreditChange(consultantId, cost, 'AI_GENERATE_ACTIONPLAN', 
                `Génération ébauche plan d\'action pour ${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
                 beneficiaryId, 'Beneficiary');

             req.flash('success_msg', `Ébauche de plan d'action générée par IA (${cost} crédits déduits). Veuillez la vérifier et la personnaliser.`);
            res.redirect(`/beneficiaries/${beneficiaryId}#conclusion-content`); 

        } catch (error) {
             console.error('Generate action plan error:', error);
             req.flash('error_msg', `Erreur lors de la génération IA: ${error.message}`);
             res.redirect(`/beneficiaries/${beneficiaryId}`);
        }
    }
);

module.exports = router;
