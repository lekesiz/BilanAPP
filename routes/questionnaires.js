const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureConsultant, ensureBeneficiary, ensureConsultantOrBeneficiary } = require('../middlewares/auth');
const { Questionnaire, Question, Answer, Beneficiary, User } = require('../models');
const { Op } = require('sequelize');
const { deductCredits, logCreditUsage } = require('../services/creditService'); // Yol düzeltildi: ../../ -> ../
const { checkAndDeductCredits } = require('../middlewares/credits'); // Yeni middleware
const { logCreditChange } = require('../services/creditService'); // Fonksiyon adı düzeltildi: logCreditUsage -> logCreditChange

// Liste des questionnaires
router.get('/', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
  try {
    let questionnaires;
    let viewName = 'questionnaires/index'; // Varsayılan view
    const queryOptions = {
       include: [
           { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
           { model: Beneficiary, as: 'beneficiary', include: { model: User, as: 'user' } }
       ],
       order: [['createdAt', 'DESC']]
    };
    const userType = req.user.userType;
    const userId = req.user.id;
    const filter = req.query.filter; // Get filter
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (userType === 'consultant') {
      queryOptions.where = { createdBy: userId };
       if (req.query.beneficiary) {
          queryOptions.where.beneficiaryId = req.query.beneficiary;
       }
       // Apply overdue filter for consultant
       if (filter === 'overdue') {
           const ownBeneficiaryIds = (await Beneficiary.findAll({ where: { consultantId: userId }, attributes: ['id']})).map(b => b.id);
           queryOptions.where = {
               ...queryOptions.where, // Keep existing filters like createdBy or beneficiaryId
               beneficiaryId: { [Op.in]: ownBeneficiaryIds }, // Ensure it's their beneficiary
               status: 'pending',
               dueDate: {
                   [Op.ne]: null,
                   [Op.lt]: today
               }
           };
           queryOptions.order = [['dueDate', 'ASC']]; // Order by oldest due date
       }
    } else {
      // Yararlanıcı kendisine atanmış anketleri görür
      const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: userId } });
      if (!beneficiaryProfile) {
         req.flash('error_msg', 'Profiliniz bulunamadı.');
         return res.redirect('/dashboard');
      }
      queryOptions.where = { beneficiaryId: beneficiaryProfile.id };
      viewName = 'questionnaires/beneficiary_list'; // Yararlanıcı için farklı view
      // Apply overdue filter for beneficiary
      if (filter === 'overdue') {
          queryOptions.where.status = 'pending';
          queryOptions.where.dueDate = {
              [Op.ne]: null,
              [Op.lt]: today
          };
          queryOptions.order = [['dueDate', 'ASC']]; 
      }
    }

    questionnaires = await Questionnaire.findAll(queryOptions);

    // Danışman için filtreleme dropdown
    let beneficiaries = [];
    if (userType === 'consultant') {
        beneficiaries = await Beneficiary.findAll({
            where: { consultantId: userId },
            include: { model: User, as: 'user' }
        });
    }

    res.render(viewName, {
      title: 'Mes Questionnaires',
      questionnaires,
      beneficiaries, // Danışman filtresi için
      selectedBeneficiary: req.query.beneficiary, // Seçili filtre
      user: req.user,
      isConsultant: userType === 'consultant',
      activeFilter: filter // Pass active filter
    });

  } catch (err) {
    console.error('Questionnaire list error:', err);
    req.flash('error_msg', 'Anketler yüklenirken bir hata oluştu.');
    res.redirect('/dashboard');
  }
});

// --- Anket Oluşturma (Danışman) ---
router.get('/new', ensureAuthenticated, ensureConsultant, (req, res) => {
  res.render('questionnaires/new', {
    title: 'Créer un Questionnaire',
    user: req.user
  });
});

router.post('/new', ensureAuthenticated, ensureConsultant, async (req, res) => {
  // req.body'den verileri al
  const { title, description, category } = req.body;
  const createdBy = req.user.id;
  let errors = [];
  
  // --- Soruları req.body'den manuel olarak parse et ---
  const questions = [];
  const questionRegex = /^questions\[(\d+)\]\[(text|type|options)\]$/;
  for (const key in req.body) {
      const match = key.match(questionRegex);
      if (match) {
          const index = parseInt(match[1], 10);
          const property = match[2];
          const value = req.body[key];

          // Dizi içinde ilgili index'te obje yoksa oluştur
          if (!questions[index]) {
              questions[index] = {};
          }
          questions[index][property] = value;
      }
  }
  // Undefined (boş) array elemanlarını temizle (varsa)
  const parsedQuestions = questions.filter(q => q !== undefined && q !== null);
   console.log("--- Questionnaire POST /new --- Parsed Questions:", JSON.stringify(parsedQuestions, null, 2)); // Parse edilmiş soruları logla
  // --- Parse etme sonu ---

  if (!title || !description) {
    errors.push({ msg: 'Başlık ve açıklama alanları zorunludur.' });
  }

  // Soruları kontrol et (artık parse edilmiş `parsedQuestions` dizisini kullan)
  let hasValidQuestion = false;
  if (parsedQuestions && Array.isArray(parsedQuestions)) { // parsedQuestions kullanılıyor
      for (const q of parsedQuestions) {
          if (q && q.text && q.text.trim() !== '' && q.type && q.type.trim() !== '') {
              hasValidQuestion = true;
               if ((q.type === 'radio' || q.type === 'checkbox') && (!q.options || q.options.trim() === '')) {
                  errors.push({ msg: `Soru \"${q.text.substring(0, 20)}...\" için seçenekler belirtilmelidir (her seçenek yeni satırda).` });
               }
          }
      }
  }
  
  if (!hasValidQuestion && errors.length === 0) { 
      errors.push({ msg: 'En az bir geçerli soru eklemelisiniz (soru metni ve tipi dolu olmalı).'});
  }

  console.log("--- Questionnaire POST /new --- Validation Check:", { hasValidQuestion, errors });

  if (errors.length > 0) {
      // ... (Hata durumunda render etme - formData'ya parsedQuestions gönder)
       const { FORFAITS } = require('../config/forfaits'); 
       const forfaitOptions = Object.keys(FORFAITS);
       const userTypeOptions = User.getAttributes().userType.values;
       const formData = { title, description, category, questions: parsedQuestions.length > 0 ? parsedQuestions : [{text:'', type:'text'}] }; // Parse edilmiş soruları gönder
      return res.render('questionnaires/new', { 
          title: 'Créer un Questionnaire', 
          errors, 
          formData,
          forfaitOptions,
          userTypeOptions,
          user: req.user 
      });
  }

  try {
    console.log("--- Questionnaire POST /new --- Validation passed, attempting DB create..."); // 3. Try bloğuna girdi
    const newQuestionnaire = await Questionnaire.create({
      title,
      description,
      category, 
      createdBy,
      status: 'draft' 
    });
    console.log("--- Questionnaire POST /new --- Questionnaire created, ID:", newQuestionnaire.id);

    // Soruları oluştur (parsedQuestions dizisini kullan)
    const questionPromises = parsedQuestions.map((q, index) => {
      if (q && q.text && q.text.trim() !== '' && q.type && q.type.trim() !== '') { 
        console.log(`--- Questionnaire POST /new --- Creating question ${index + 1}:`, q.text.substring(0, 30)); // Soru oluşturmayı logla
        return Question.create({
            questionnaireId: newQuestionnaire.id,
            text: q.text.trim(),
            type: q.type,
            options: q.options ? JSON.stringify(q.options.split('\n').map(opt => opt.trim()).filter(opt => opt)) : null, 
            order: index
        });
      }
      return null;
    }).filter(p => p !== null);

    await Promise.all(questionPromises);
    console.log("--- Questionnaire POST /new --- Questions created successfully.");

    req.flash('success_msg', 'Questionnaire créé avec succès...');
    res.redirect(`/questionnaires/${newQuestionnaire.id}`); 

  } catch (err) {
    console.error('--- Questionnaire POST /new --- CATCH BLOCK ERROR:', err);
    req.flash('error_msg', 'Anket oluşturulurken bir hata oluştu.');
    const { FORFAITS } = require('../config/forfaits');
    const forfaitOptions = Object.keys(FORFAITS);
    const userTypeOptions = User.getAttributes().userType.values;
    const formData = { title, description, category, questions: parsedQuestions.length > 0 ? parsedQuestions : [{text:'', type:'text'}] }; // Parse edilmiş soruları gönder
    res.render('questionnaires/new', { 
        title: 'Créer un Questionnaire', 
        errors: errors.length > 0 ? errors : [{ msg: 'Erreur serveur lors de la création.' }],
        formData, 
        forfaitOptions,
        userTypeOptions,
        user: req.user 
    });
  }
});

// --- Anket Detayı / Atama (Danışman) ---
router.get('/:id', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findOne({
      where: { id: req.params.id, createdBy: req.user.id },
      include: [
          { model: Question, as: 'questions', order: [['order', 'ASC']] },
          { model: Beneficiary, as: 'beneficiary', include: { model: User, as: 'user' } } // Atanmışsa yararlanıcıyı getir
      ]
    });

    if (!questionnaire) {
      req.flash('error_msg', 'Anket bulunamadı.');
      return res.redirect('/questionnaires');
    }

    // Atanmamışsa, atanabilecek yararlanıcıları listele
    let availableBeneficiaries = [];
    if (!questionnaire.beneficiaryId) {
      availableBeneficiaries = await Beneficiary.findAll({
         where: { consultantId: req.user.id },
         include: { model: User, as: 'user' }
      });
    }

    res.render('questionnaires/details', {
      title: `Questionnaire: ${questionnaire.title}`,
      questionnaire,
      availableBeneficiaries, // Atama dropdown için
      user: req.user
    });

  } catch (err) {
    console.error('Questionnaire details error:', err);
    req.flash('error_msg', 'Anket detayları yüklenirken bir hata oluştu.');
    res.redirect('/questionnaires');
  }
});

// Anket Atama (POST)
const ASSIGN_COST = 10;
router.post('/:id/assign', 
    ensureAuthenticated, 
    ensureConsultant, 
    checkAndDeductCredits(ASSIGN_COST), // Kredi kontrol middleware'i eklendi
    async (req, res) => {
        const { beneficiaryId, dueDate } = req.body;
        const questionnaireId = req.params.id;
        const consultantId = req.user.id;
        const cost = req.creditCost || ASSIGN_COST; // Middleware'den maliyeti al (veya varsayılan)

        try {
            // Kredi kontrolü artık middleware tarafından yapıldı.
            
            // Anket ve Yararlanıcı Kontrolleri
            const questionnaire = await Questionnaire.findOne({
                where: { id: questionnaireId, createdBy: consultantId }
            });
            if (!questionnaire) {
                req.flash('error_msg', 'Anket bulunamadı.');
                return res.redirect('/questionnaires');
            }
            if (questionnaire.beneficiaryId) {
                req.flash('error_msg', 'Bu anket zaten bir yararlanıcıya atanmış.');
                return res.redirect(`/questionnaires/${questionnaireId}`);
            }
            const beneficiary = await Beneficiary.findOne({ where: { id: beneficiaryId, consultantId: consultantId } });
            if (!beneficiary) { 
                req.flash('error_msg', 'Geçersiz yararlanıcı seçimi.');
                // Kredi geri yükleme? Middleware bunu otomatik yapmaz.
                return res.redirect(`/questionnaires/${questionnaireId}`);
            }

            // Atama İşlemi
            await questionnaire.update({
                beneficiaryId,
                dueDate: dueDate || null,
                status: 'pending' 
            });

            // Kredi Kullanımını Logla (Fonksiyon adı düzeltildi)
            await logCreditChange(consultantId, cost, 'QUESTIONNAIRE_ASSIGN', 
                `Assignation questionnaire '${questionnaire.title}' à bénéficiaire ID ${beneficiaryId}`,
                questionnaireId, 'Questionnaire');

            req.flash('success_msg', `Questionnaire assigné avec succès (${cost} crédits déduits).`);
            res.redirect(`/questionnaires/${questionnaireId}`);

        } catch (err) {
            console.error('Questionnaire assign error:', err);
            req.flash('error_msg', 'Anket atanırken bir hata oluştu.');
             // Kredi geri yükleme?
            res.redirect(`/questionnaires/${questionnaireId}`);
        }
    }
);

// --- Anket Yanıtlama (Yararlanıcı) ---
router.get('/:id/answer', ensureAuthenticated, ensureBeneficiary, async (req, res) => {
  try {
    const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: req.user.id } });
    if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profiliniz bulunamadı.');
        return res.redirect('/dashboard');
    }

    const questionnaire = await Questionnaire.findOne({
      where: {
        id: req.params.id,
        beneficiaryId: beneficiaryProfile.id,
        status: 'pending' // Sadece beklemedeki anketler yanıtlanabilir
      },
      include: { model: Question, as: 'questions', order: [['order', 'ASC']] }
    });

    if (!questionnaire) {
      req.flash('error_msg', 'Yanıtlanacak anket bulunamadı veya zaten tamamlanmış.');
      return res.redirect('/questionnaires');
    }

    res.render('questionnaires/answer', {
      title: `Répondre: ${questionnaire.title}`,
      questionnaire,
      user: req.user
    });

  } catch (err) {
    console.error('Questionnaire answer form error:', err);
    req.flash('error_msg', 'Anket formu yüklenirken bir hata oluştu.');
    res.redirect('/questionnaires');
  }
});

router.post('/:id/answer', ensureAuthenticated, ensureBeneficiary, async (req, res) => {
  const questionnaireId = req.params.id;
  const answers = req.body.answers; // { questionId: answerValue, ... }

  try {
    const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: req.user.id } });
    if (!beneficiaryProfile) {
        req.flash('error_msg', 'Profiliniz bulunamadı.');
        return res.redirect('/dashboard');
    }

    const questionnaire = await Questionnaire.findOne({
      where: {
        id: questionnaireId,
        beneficiaryId: beneficiaryProfile.id,
        status: 'pending'
      }
    });

    if (!questionnaire) {
      req.flash('error_msg', 'Anket bulunamadı veya zaten tamamlanmış.');
      return res.redirect('/questionnaires');
    }

    if (!answers || Object.keys(answers).length === 0) {
        req.flash('error_msg', 'Lütfen soruları yanıtlayın.');
        return res.redirect(`/questionnaires/${questionnaireId}/answer`);
    }

    const answerPromises = [];
    for (const questionId in answers) {
      const answerValue = answers[questionId];
      answerPromises.push(
        Answer.create({
          questionnaireId,
          questionId,
          beneficiaryId: beneficiaryProfile.id,
          answer: answerValue
        })
      );
    }

    await Promise.all(answerPromises);

    // Anket durumunu 'tamamlandı' yap
    await questionnaire.update({ status: 'completed' });

    req.flash('success_msg', 'Questionnaire soumis avec succès.');
    res.redirect('/questionnaires');

  } catch (err) {
    console.error('Questionnaire submit error:', err);
    req.flash('error_msg', 'Anket gönderilirken bir hata oluştu.');
    res.redirect(`/questionnaires/${questionnaireId}/answer`);
  }
});

// --- Anket Sonuçları Görüntüleme ---
router.get('/:id/results', ensureAuthenticated, ensureConsultantOrBeneficiary, async (req, res) => {
    try {
        const questionnaireId = req.params.id;
        let whereClause = { id: questionnaireId };
        let canView = false;

        if (req.user.userType === 'consultant') {
            whereClause.createdBy = req.user.id;
            canView = true; // Danışman kendi oluşturduğu anketin sonucunu görebilir
        } else {
            const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: req.user.id } });
            if (!beneficiaryProfile) {
                req.flash('error_msg', 'Profiliniz bulunamadı.');
                return res.redirect('/dashboard');
            }
            whereClause.beneficiaryId = beneficiaryProfile.id;
            canView = true; // Yararlanıcı kendine atanmış anketin sonucunu görebilir
        }

        const questionnaire = await Questionnaire.findOne({
            where: whereClause,
            include: [
                { 
                    model: Question, 
                    as: 'questions', 
                    order: [['order', 'ASC']],
                    include: {
                        model: Answer,
                        as: 'answers',
                        // Sadece bu ankete ait yararlanıcının cevabını getir (eğer yararlanıcı ise)
                        // Danışman ise tüm cevaplar gelebilir veya belirli bir yararlanıcı için filtreleyebilir
                        required: false // Cevap olmasa da soruyu getir
                        // where: req.user.userType === 'beneficiary' ? { beneficiaryId: whereClause.beneficiaryId } : undefined
                    }
                },
                { model: User, as: 'creator' },
                { model: Beneficiary, as: 'beneficiary', include: { model: User, as: 'user' } }
            ]
        });

        if (!questionnaire || !canView) {
            req.flash('error_msg', 'Anket sonucu bulunamadı veya görüntüleme yetkiniz yok.');
            return res.redirect('/questionnaires');
        }
        
        // Eğer danışman bakıyorsa ve belirli bir yararlanıcının cevapları isteniyorsa filtrele
        if (req.user.userType === 'consultant' && questionnaire.beneficiaryId) {
            questionnaire.questions.forEach(q => {
                q.answers = q.answers.filter(a => a.beneficiaryId === questionnaire.beneficiaryId);
            });
        }
        // Eğer danışman bakıyorsa ve anket atanmamışsa (taslaksa vs.), cevap olmayacak.

        res.render('questionnaires/results', {
            title: `Résultats: ${questionnaire.title}`,
            questionnaire,
            user: req.user,
            isConsultant: req.user.userType === 'consultant'
        });

    } catch (err) {
        console.error('Questionnaire results error:', err);
        req.flash('error_msg', 'Anket sonuçları yüklenirken bir hata oluştu.');
        res.redirect('/questionnaires');
    }
});


// --- Anket Düzenleme / Silme (Danışman) ---

// Anket Düzenleme Formu (GET)
router.get('/:id/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
    // ... (Anketin sadece taslak (draft) veya atanmamışken düzenlenebilmesi sağlanmalı)
    // ... (Mevcut soruları forma yükle)
});

// Anket Düzenleme (POST)
router.post('/:id/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
    // ... (Soruları güncelle veya sil/ekle)
});

// Anket Silme (POST)
router.post('/:id/delete', ensureAuthenticated, ensureConsultant, async (req, res) => {
    try {
        const questionnaire = await Questionnaire.findOne({
            where: { id: req.params.id, createdBy: req.user.id }
        });
        if (!questionnaire) {
            req.flash('error_msg', 'Anket bulunamadı.');
            return res.redirect('/questionnaires');
        }
        // İlgili cevapları ve soruları da sil (cascade ayarına bağlı veya manuel)
        await Answer.destroy({ where: { questionnaireId: questionnaire.id } });
        await Question.destroy({ where: { questionnaireId: questionnaire.id } });
        await questionnaire.destroy();

        req.flash('success_msg', 'Anket başarıyla silindi.');
        res.redirect('/questionnaires');
    } catch (error) {
        console.error('Questionnaire delete error:', error);
        req.flash('error_msg', 'Anket silinirken bir hata oluştu.');
        res.redirect('/questionnaires');
    }
});

module.exports = router;
