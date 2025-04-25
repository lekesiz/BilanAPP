const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const {
  Questionnaire, Question, Answer, Beneficiary, User,
} = require('../models');
const { logCreditChange } = require('../services/creditService');
const sequelize = require('../config/database');
const logger = require('../config/logger');

// Constants (Consider moving to a config file)
const ASSIGN_COST = 10;

// --- Route Handlers ---

// GET /questionnaires - List Questionnaires
exports.listQuestionnaires = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 15;
    const offset = (page - 1) * limit;
    const whereClause = {};
    let viewName = 'questionnaires/index';
    const { userType } = req.user;
    const userId = req.user.id;
    const {
      beneficiary, status, category, filter,
    } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const includeOptions = [
      { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
      {
        model: Beneficiary,
        as: 'beneficiary',
        required: false,
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      },
    ];
    let orderOptions = [['createdAt', 'DESC']];
    const isAdmin = req.user.forfaitType === 'Admin';

    // Build Where Clause based on Role & Filters
    if (isAdmin) {
      if (beneficiary) whereClause.beneficiaryId = beneficiary;
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;
      if (filter === 'overdue') {
        whereClause.status = 'pending';
        whereClause.dueDate = { [Op.ne]: null, [Op.lt]: today };
        orderOptions = [['dueDate', 'ASC']];
      }
    } else if (userType === 'consultant') {
      let beneficiaryFilter = {};
      if (beneficiary) {
        beneficiaryFilter = { id: beneficiary, consultantId: userId }; // Ensure consultant owns this beneficiary
        const benExists = await Beneficiary.count({ where: beneficiaryFilter });
        if (benExists === 0) whereClause.id = -1; // Force no results if invalid beneficiary selected
        else whereClause.beneficiaryId = beneficiary;
      } else {
        // Default: Show questionnaires created by consultant OR assigned to their beneficiaries
        const ownBeneficiaryIds = (
          await Beneficiary.findAll({
            where: { consultantId: userId },
            attributes: ['id'],
          })
        ).map((b) => b.id);
        whereClause[Op.or] = [
          { createdBy: userId },
          {
            beneficiaryId: {
              [Op.in]: ownBeneficiaryIds.length > 0 ? ownBeneficiaryIds : [-1],
            },
          },
        ];
      }
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;
      if (filter === 'overdue') {
        const ownBeneficiaryIds = (
          await Beneficiary.findAll({
            where: { consultantId: userId },
            attributes: ['id'],
          })
        ).map((b) => b.id);
        whereClause.beneficiaryId = whereClause.beneficiaryId ?
          {
            [Op.and]: [
              whereClause.beneficiaryId,
              {
                [Op.in]: ownBeneficiaryIds.length > 0 ? ownBeneficiaryIds : [-1],
              },
            ],
          } :
          {
            [Op.in]: ownBeneficiaryIds.length > 0 ? ownBeneficiaryIds : [-1],
          };
        whereClause.status = 'pending';
        whereClause.dueDate = { [Op.ne]: null, [Op.lt]: today };
        orderOptions = [['dueDate', 'ASC']];
      }
    } else {
      // beneficiary
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId },
        attributes: ['id'],
      });
      if (!beneficiaryProfile) return res.redirect('/dashboard');
      whereClause.beneficiaryId = beneficiaryProfile.id;
      viewName = 'questionnaires/beneficiary_list';
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;
      if (filter === 'overdue') {
        whereClause.status = 'pending';
        whereClause.dueDate = { [Op.ne]: null, [Op.lt]: today };
        orderOptions = [['dueDate', 'ASC']];
      }
    }

    const { count, rows } = await Questionnaire.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      order: orderOptions,
      limit,
      offset,
      distinct: true,
    });
    const questionnaires = rows.map((q) => q.get({ plain: true }));

    let beneficiariesForFilter = [];
    if (isAdmin || userType === 'consultant') {
      const whereCondition = isAdmin ? {} : { consultantId: userId };
      const benefs = await Beneficiary.findAll({
        where: whereCondition,
        attributes: ['id'],
        include: {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      beneficiariesForFilter = benefs.map((b) => b.get({ plain: true }));
    }
    const categories = Questionnaire.getAttributes().category.values;
    const totalPages = Math.ceil(count / limit);

    res.render(viewName, {
      title: 'Mes Questionnaires',
      questionnaires,
      beneficiaries: beneficiariesForFilter,
      categories,
      user: req.user ? req.user.get({ plain: true }) : null,
      isConsultant: userType === 'consultant',
      isAdmin,
      pagination: {
        page,
        limit,
        totalRows: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        beneficiary: req.query.beneficiary || '',
        status: status || '',
        category: category || '',
        filter: filter || '',
      },
    });
  } catch (err) {
    logger.error('Questionnaire list error:', { error: err });
    req.flash('error_msg', 'Erreur chargement questionnaires.');
    res.redirect('/dashboard');
  }
};

// GET /questionnaires/new - Show new questionnaire form
exports.showNewForm = (req, res) => {
  // Pass available question types to the view for the dropdown
  const questionTypes = Question.getAttributes().type.values;
  res.render('questionnaires/new', {
    title: 'Créer un Questionnaire',
    user: req.user,
    questionTypes,
    formData: { questions: [{}] }, // Ensure at least one empty question block for the form
  });
};

// POST /questionnaires/new - Create new questionnaire
exports.createQuestionnaire = async (req, res) => {
  // express-validator sonuçlarını al
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // const questionTypes = Question.getAttributes().type.values;
    return res.render('questionnaires/new', {
      title: 'Créer un Questionnaire',
      errors: errors.array(),
      formData: req.body, // Form verilerini koru
      // questionTypes, // Bu artık view'da doğrudan tanımlı olabilir
      user: req.user,
    });
  }

  // Doğrulama başarılı, devam et
  const {
    title, description, category, questions,
  } = req.body;
  const createdBy = req.user.id;
  // Manuel validasyonlar kaldırıldı

  let newQuestionnaire = null;
  try {
    newQuestionnaire = await Questionnaire.create({
      title,
      description,
      category,
      createdBy,
      status: 'draft',
    });

    // Sadece geçerli soruları al (validator bunu tam yapamıyor olabilir)
    const validQuestions =
      questions && Array.isArray(questions) ?
        questions.filter(
          (q) => q && q.text && q.text.trim() !== '' && q.type && q.type.trim() !== '',
        ) :
        [];

    const questionPromises = validQuestions.map((q, index) => {
      let options = null;
      if (q.options) {
        try {
          options = JSON.stringify(
            q.options
              .split(/\r?\n/)
              .map((opt) => opt.trim())
              .filter((opt) => opt),
          );
        } catch (e) {
          logger.warn('Invalid JSON options for question:', { questionText: q.text });
        }
      }
      return Question.create({
        questionnaireId: newQuestionnaire.id,
        text: q.text.trim(),
        type: q.type,
        options,
        order: index,
      });
    });
    await Promise.all(questionPromises);

    req.flash('success_msg', 'Questionnaire créé (brouillon).');
    res.redirect(`/questionnaires/${newQuestionnaire.id}`);
  } catch (err) {
    logger.error('Questionnaire creation error:', { error: err });
    // Rollback
    if (newQuestionnaire?.id) {
      try {
        await Question.destroy({ where: { questionnaireId: newQuestionnaire.id } });
        await newQuestionnaire.destroy();
        logger.info(`Rolled back questionnaire creation for ID: ${newQuestionnaire.id}`);
      } catch (rollbackError) {
        logger.error(`Error rolling back questionnaire ${newQuestionnaire.id}:`, {
          error: rollbackError,
        });
      }
    }
    req.flash('error_msg', 'Erreur serveur création questionnaire.');
    // Hata durumunda formu tekrar render et
    res.render('questionnaires/new', {
      title: 'Créer un Questionnaire',
      errors: [{ msg: 'Erreur serveur.' }], // Genel hata
      formData: req.body,
      user: req.user,
    });
  }
};

// GET /questionnaires/:id - Show Questionnaire Details / Assign Form
exports.showDetails = async (req, res) => {
  // --- DEBUG LOGGING START ---
  logger.info('[CONTROLLER] showDetails - Request Params ID:', req.params.id);
  // Log userType and forfaitType instead of role
  logger.info('[CONTROLLER] showDetails - Request User:', { id: req.user?.id, userType: req.user?.userType, forfaitType: req.user?.forfaitType });
  // --- DEBUG LOGGING END ---
  try {
    const questionnaireId = parseInt(req.params.id, 10);
    const { user } = req; // User from session/authentication

    // Validate questionnaireId
    if (Number.isNaN(questionnaireId)) {
      logger.warn('[CONTROLLER] showDetails - Invalid questionnaire ID:', req.params.id);
      req.flash('error', 'ID de questionnaire invalide.');
      return res.redirect('/questionnaires'); // Redirect if ID is not a number
    }

    // Define the where clause for finding the questionnaire
    const whereClause = { id: questionnaireId };
    const isAdmin = user.forfaitType === 'Admin'; // Check admin based on forfaitType

    // --- Authorization Logic --- 
    let canAccess = false;
    if (isAdmin) {
      canAccess = true; // Admin can see all questionnaires
      logger.info('[CONTROLLER] showDetails - Admin access granted.');
    } else if (user.userType === 'consultant') { 
      // Consultant can access if they created it
      whereClause.createdBy = user.id;
      canAccess = true; // Assume access for now, findOne will verify
      logger.info('[CONTROLLER] showDetails - Consultant access: checking createdBy.');
    } else if (user.userType === 'beneficiary') {
      // Beneficiary can access if assigned to them (check below after fetch)
      canAccess = false; // Access check deferred until after fetch
      logger.info('[CONTROLLER] showDetails - Beneficiary access: check needed after fetch.');
    } else {
      // Unknown userType
      logger.warn('[CONTROLLER] showDetails - Unauthorized userType access attempt:', { userId: user.id, userType: user.userType });
      req.flash('error', 'Accès non autorisé.');
      return res.status(403).redirect('/dashboard');
    }

    // --- DEBUG LOGGING START ---
    // Log the clause only if it contains more than just ID (i.e., for consultant)
    if (Object.keys(whereClause).length > 1) {
      logger.info('[CONTROLLER] showDetails - Executing findOne with whereClause:', whereClause);
    }
    // --- DEBUG LOGGING END ---

    // Fetch the questionnaire - Admin fetches by ID only, Consultant by ID + createdBy
    const questionnaire = await Questionnaire.findOne({
      where: whereClause, // Applies createdBy only for consultants
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { 
          model: Beneficiary, as: 'beneficiary', required: false, 
          include: { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
        },
        { 
          model: Question, as: 'questions', 
          include: [{ model: Answer, as: 'answers', required: false }]
        },
      ],
      order: [[{ model: Question, as: 'questions' }, 'order', 'ASC']],
    });

    // --- DEBUG LOGGING START ---
    logger.info('[CONTROLLER] showDetails - Questionnaire found in DB:', !!questionnaire);
    // --- DEBUG LOGGING END ---

    if (!questionnaire) {
      req.flash('error', 'Questionnaire non trouvé ou accès non autorisé.');
      // Determine redirect based on actual userType
      const redirectTarget = user.userType === 'consultant' ? '/questionnaires' : '/dashboard'; 
      logger.warn(`[CONTROLLER] showDetails - Questionnaire not found or consultant access denied. UserType: ${user.userType}. Redirecting to: ${redirectTarget}`);
      return res.redirect(redirectTarget);
    }

    // --- Additional Access Check for Beneficiary ---
    let isAssignedBeneficiary = false;
    if (user.userType === 'beneficiary') {
      // Find the beneficiary profile based on logged-in user ID
      const beneficiaryProfile = await Beneficiary.findOne({ where: { userId: user.id } });
      if (beneficiaryProfile && questionnaire.beneficiaryId === beneficiaryProfile.id) {
        isAssignedBeneficiary = true;
        canAccess = true; // Grant access if assigned
        logger.info('[CONTROLLER] showDetails - Beneficiary access granted (assigned).');
      } else {
        canAccess = false; // Deny access if not assigned
        logger.warn('[CONTROLLER] showDetails - Beneficiary access denied (not assigned):', { userId: user.id, questionnaireId: questionnaire.id, assignedTo: questionnaire.beneficiaryId });
      }
    }

    // --- Fetch Available Beneficiaries for Assignment Modal (if Consultant/Admin) --- 
    let availableBeneficiaries = [];
    if ((user.userType === 'consultant' || isAdmin) && questionnaire.status === 'draft') { // Only fetch if draft and user can assign
      try {
          const benefWhere = isAdmin ? {} : { consultantId: user.id };
          availableBeneficiaries = await Beneficiary.findAll({
              where: benefWhere,
              include: { 
                  model: User, 
                  as: 'user', 
                  attributes: ['id', 'firstName', 'lastName'] 
              },
              order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']]
          });
      } catch (err) {
          logger.error('Error fetching available beneficiaries for questionnaire assignment:', err);
          // Continue without beneficiaries, modal might be empty but page loads
      }
    }

    // Final Access Denied Check (Covers beneficiary case and potentially others)
    if (!canAccess) {
        req.flash('error', 'Accès non autorisé.');
        return res.status(403).redirect('/dashboard');
    }
    
    // --- Render Page ---
    res.render('questionnaires/details', {
      title: `Détails: ${questionnaire.title}`,
      questionnaire: questionnaire.get({ plain: true }),
      user: req.user, // Pass full user object if needed by view
      isAdmin: isAdmin, // Use isAdmin flag defined earlier
      isConsultant: user.userType === 'consultant', // Check userType
      isAssignedBeneficiary, // Pass the result of the beneficiary check
      availableBeneficiaries: availableBeneficiaries.map(b => b.get({ plain: true })), // Pass beneficiaries for modal
      csrfToken: req.csrfToken ? req.csrfToken() : null,
    });

  } catch (err) {
    logger.error('Questionnaire details error:', { error: err, questionnaireId: req.params.id });
    req.flash('error_msg', 'Erreur chargement questionnaire.');
    res.redirect('/questionnaires');
  }
};

// POST /questionnaires/:id/assign - Assign questionnaire
exports.assignQuestionnaire = async (req, res) => {
  // express-validator sonuçlarını al
  const errors = validationResult(req);
  const questionnaireId = req.params.id;
  if (!errors.isEmpty()) {
    req.flash(
      'error_msg',
      errors
        .array()
        .map((e) => e.msg)
        .join(', '),
    );
    // Hata varsa detay sayfasına geri yönlendir (modal kapanır)
    return res.redirect(`/questionnaires/${questionnaireId}`);
  }

  // Doğrulama başarılı, devam et
  const { beneficiaryId, dueDate } = req.body;
  const consultantId = req.user.id;
  const cost = req.creditCost || ASSIGN_COST;

  try {
    // Manuel validasyonlar (questionnaire/beneficiary varlığı) hala gerekli
    const questionnaire = await Questionnaire.findOne({
      where: { id: questionnaireId, createdBy: consultantId },
    });
    if (!questionnaire) {
      req.flash('error_msg', 'Questionnaire non trouvé.');
      return res.redirect('/questionnaires');
    }
    if (questionnaire.beneficiaryId) {
      req.flash('error_msg', 'Questionnaire déjà assigné.');
      return res.redirect(`/questionnaires/${questionnaireId}`);
    }
    const beneficiary = await Beneficiary.findOne({
      where: { id: beneficiaryId, consultantId },
    });
    if (!beneficiary) {
      req.flash('error_msg', 'Bénéficiaire invalide.');
      return res.redirect(`/questionnaires/${questionnaireId}`);
    }

    // Güncelleme ve loglama
    await questionnaire.update({
      beneficiaryId,
      dueDate: dueDate || null,
      status: 'pending',
    });
    await logCreditChange(
      consultantId, // userId
      -cost, // amount (negative because it's a deduction)
      'QUESTIONNAIRE_ASSIGN',
      `Assignation questionnaire '${questionnaire.title}' à bénéficiaire ID ${beneficiaryId}`,
      null, // adminUserId (null because it's not an admin action)
      questionnaireId, // relatedResourceId
      'Questionnaire', // relatedResourceType
    );

    req.flash('success_msg', `Questionnaire assigné (${cost} crédits déduits).`);
    res.redirect(`/questionnaires/${questionnaireId}`);
  } catch (err) {
    logger.error('Questionnaire assign error:', {
      error: err,
      questionnaireId,
      beneficiaryId,
    });
    req.flash('error_msg', "Erreur lors de l'assignation.");
    res.redirect(`/questionnaires/${questionnaireId}`);
  }
};

// GET /questionnaires/:id/answer - Show form for beneficiary to answer
exports.showAnswerForm = async (req, res) => {
  try {
    const beneficiaryProfile = await Beneficiary.findOne({
      where: { userId: req.user.id },
    });
    if (!beneficiaryProfile) return res.redirect('/dashboard');

    const questionnaire = await Questionnaire.findOne({
      where: {
        id: req.params.id,
        beneficiaryId: beneficiaryProfile.id,
        status: 'pending',
      },
      include: { model: Question, as: 'questions', order: [['order', 'ASC']] },
    });
    if (!questionnaire) {
      req.flash('error_msg', 'Questionnaire non trouvé ou déjà soumis.');
      return res.redirect('/questionnaires');
    }

    // --- DEBUG LOGGING: Log questions and their options before rendering --- 
    if (questionnaire.questions && questionnaire.questions.length > 0) {
        logger.info(`[showAnswerForm] Questions for questionnaire ${questionnaire.id}:`);
        questionnaire.questions.forEach((q, index) => {
            logger.info(`  [Q${index+1}] ID: ${q.id}, Type: ${q.type}, Options raw:`, q.options);
        });
    } else {
        logger.info(`[showAnswerForm] No questions found for questionnaire ${questionnaire.id}`);
    }
    // --- END DEBUG LOGGING ---

    // Fetch previous answers if they exist (for re-editing attempt maybe?)
    const previousAnswers = await Answer.findAll({
      where: {
        questionnaireId: req.params.id,
        beneficiaryId: beneficiaryProfile.id,
      },
      raw: true,
    });
    const answersMap = previousAnswers.reduce((map, ans) => {
      map[ans.questionId] = ans.answer;
      return map;
    }, {});

    res.render('questionnaires/answer', {
      title: `Répondre: ${questionnaire.title}`,
      questionnaire: questionnaire.get({ plain: true }),
      answersMap, // Pass previous answers to prefill form
      user: req.user,
    });
  } catch (err) {
    logger.error('Questionnaire answer form error:', {
      error: err,
      questionnaireId: req.params.id,
    });
    req.flash('error_msg', 'Erreur chargement formulaire questionnaire.');
    res.redirect('/questionnaires');
  }
};

// POST /questionnaires/:id/answer - Submit beneficiary answers
exports.submitAnswers = async (req, res) => {
  const questionnaireId = req.params.id;

  // express-validator sonuçlarını al
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Hata varsa formu tekrar render et (render edemeyiz, cevapları bilmiyoruz)
    // Geri yönlendirip hata mesajı gösterelim
    req.flash(
      'error_msg',
      errors
        .array()
        .map((e) => e.msg)
        .join(', '),
    );
    return res.redirect(`/questionnaires/${questionnaireId}/answer`);
  }

  // Doğrulama başarılı (ama tüm soruların cevaplandığını manuel kontrol et)
  const receivedAnswersArray = req.body.answers;

  try {
    const beneficiaryProfile = await Beneficiary.findOne({
      where: { userId: req.user.id },
    });
    if (!beneficiaryProfile) return res.redirect('/dashboard');

    const questionnaire = await Questionnaire.findOne({
      where: {
        id: questionnaireId,
        beneficiaryId: beneficiaryProfile.id,
        status: 'pending',
      },
      include: { model: Question, as: 'questions', order: [['order', 'ASC']] },
    });
    if (!questionnaire) {
      req.flash('error_msg', 'Questionnaire non trouvé ou déjà soumis.');
      return res.redirect('/questionnaires');
    }

    // Tüm soruların cevaplandığını manuel kontrol et (bu hala gerekli olabilir)
    let allQuestionsAnswered = true;
    if (
      !receivedAnswersArray ||
      !Array.isArray(receivedAnswersArray) ||
      receivedAnswersArray.length !== questionnaire.questions.length
    ) {
      allQuestionsAnswered = false;
    } else {
      for (let i = 0; i < questionnaire.questions.length; i++) {
        const answerValue = receivedAnswersArray[i];
        if (
          answerValue === undefined ||
          answerValue === null ||
          (typeof answerValue === 'string' && answerValue.trim() === '')
        ) {
          allQuestionsAnswered = false;
          break;
        }
      }
    }
    if (!allQuestionsAnswered) {
      req.flash('error_msg', 'Veuillez répondre à toutes les questions.');
      return res.redirect(`/questionnaires/${questionnaireId}/answer`);
    }

    // Use transaction for atomic delete & insert
    await sequelize.transaction(async (t) => {
      await Answer.destroy({
        where: { questionnaireId, beneficiaryId: beneficiaryProfile.id },
        transaction: t,
      });
      const answerPromises = questionnaire.questions.map((question, i) => {
        let answerValue = receivedAnswersArray[i];
        if (Array.isArray(answerValue)) answerValue = answerValue.join(', ');
        return Answer.create(
          {
            questionnaireId,
            questionId: question.id,
            beneficiaryId: beneficiaryProfile.id,
            answer: answerValue,
          },
          { transaction: t },
        );
      });
      await Promise.all(answerPromises);
      await questionnaire.update({ status: 'completed' }, { transaction: t });
    });

    req.flash('success_msg', 'Questionnaire soumis.');
    res.redirect('/questionnaires');
  } catch (err) {
    logger.error('Questionnaire submit error:', { error: err, questionnaireId });
    req.flash('error_msg', 'Erreur soumission questionnaire.');
    res.redirect(`/questionnaires/${questionnaireId}/answer`);
  }
};

// GET /questionnaires/:id/results - View questionnaire results
exports.showResults = async (req, res) => {
  try {
    const questionnaireId = req.params.id;
    const isAdmin = req.user.forfaitType === 'Admin';
    const isConsultant = req.user.userType === 'consultant';
    const isBeneficiary = req.user.userType === 'beneficiary';

    const questionnaire = await Questionnaire.findOne({
      where: { id: questionnaireId },
      include: [
        {
          model: Question,
          as: 'questions',
          order: [['order', 'ASC']],
          include: { model: Answer, as: 'answers', required: false },
        },
        { model: User, as: 'creator' },
        {
          model: Beneficiary,
          as: 'beneficiary',
          required: false,
          include: { model: User, as: 'user' },
        },
      ],
    });
    if (!questionnaire) {
      req.flash('error_msg', 'Questionnaire non trouvé.');
      return res.redirect('/questionnaires');
    }

    let canView = false;
    let beneficiaryIdForFiltering = null;
    if (isAdmin) {
      canView = true;
      beneficiaryIdForFiltering = questionnaire.beneficiaryId; // Admin sees assigned beneficiary's answers
    } else if (isConsultant) {
      if (questionnaire.createdBy === req.user.id) {
        canView = true;
        beneficiaryIdForFiltering = questionnaire.beneficiaryId; // See assigned answers if createdBy
      } else {
        // Check if assigned to one of consultant's beneficiaries
        if (questionnaire.beneficiaryId) {
          const ben = await Beneficiary.findOne({
            where: {
              id: questionnaire.beneficiaryId,
              consultantId: req.user.id,
            },
          });
          if (ben) {
            canView = true;
            beneficiaryIdForFiltering = questionnaire.beneficiaryId;
          }
        }
      }
    } else if (isBeneficiary) {
      const beneficiaryProfile = await Beneficiary.findOne({
        where: { userId: req.user.id },
        attributes: ['id'],
      });
      if (beneficiaryProfile && questionnaire.beneficiaryId === beneficiaryProfile.id) {
        canView = true;
        beneficiaryIdForFiltering = questionnaire.beneficiaryId;
      }
    }

    if (!canView) {
      req.flash('error_msg', 'Accès refusé aux résultats.');
      logger.info(
          `[DEBUG showResults] Access denied for user ${req.user.id} ` +
          `to questionnaire ${questionnaireId}. Redirecting to /questionnaires.`
      );
      return res.redirect('/questionnaires');
    }

    // Filter answers if a specific beneficiary context exists
    if (beneficiaryIdForFiltering) {
      questionnaire.questions.forEach((q) => {
        q.answers = q.answers.filter((a) => a.beneficiaryId === beneficiaryIdForFiltering);
      });
    } else {
      // If not assigned or admin viewing unassigned, show no answers?
      questionnaire.questions.forEach((q) => {
        q.answers = [];
      });
    }

    res.render('questionnaires/results', {
      title: `Résultats: ${questionnaire.title}`,
      questionnaire: questionnaire.get({ plain: true }),
      user: req.user,
      isAdmin,
      isConsultant,
    });
  } catch (err) {
    logger.error('Questionnaire results error:', { error: err, questionnaireId: req.params.id });
    req.flash('error_msg', 'Erreur chargement résultats.');
    res.redirect('/questionnaires');
  }
};

// GET /questionnaires/:id/edit - Show Edit Questionnaire Form (Stub)
exports.showEditQuestionnaireForm = async (req, res) => {
  req.flash('info_msg', "La modification des questionnaires n'est pas encore implémentée.");
  res.redirect(`/questionnaires/${req.params.id}`);
};

// POST /questionnaires/:id/edit - Update Questionnaire (Stub)
exports.updateQuestionnaire = async (req, res) => {
  req.flash('info_msg', "La modification des questionnaires n'est pas encore implémentée.");
  res.redirect(`/questionnaires/${req.params.id}`);
};

// POST /:id/questions/add - Add a question to a questionnaire
exports.addQuestion = async (req, res) => {
  const questionnaireId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      'error_msg',
      errors
        .array()
        .map((e) => e.msg)
        .join(', '),
    );
    // Düzenleme sayfasına geri yönlendirebiliriz, ancak o sayfa şu an stub
    return res.redirect(`/questionnaires/${questionnaireId}`); // Şimdilik detay sayfasına yönlendir
  }

  const {
    text, type, options, order,
  } = req.body;
  try {
    // Yetki kontrolü: Sadece anketi oluşturan değiştirebilir
    const questionnaire = await Questionnaire.findOne({
      where: { id: questionnaireId, createdBy: req.user.id },
    });
    if (!questionnaire) {
      req.flash('error_msg', 'Questionnaire non trouvé ou accès refusé.');
      return res.redirect('/questionnaires');
    }

    let optionsJSON = null;
    if ((type === 'radio' || type === 'checkbox') && options) {
      try {
        optionsJSON = JSON.stringify(
          options
            .split(/\r?\n/)
            .map((opt) => opt.trim())
            .filter((opt) => opt),
        );
      } catch (e) {
        logger.warn('Invalid options format on add:', { options });
        // İsteğe bağlı: hata mesajı göster
      }
    } else if (type !== 'radio' && type !== 'checkbox') {
      optionsJSON = null; // Diğer tipler için options null olmalı
    }

    const questionToCreate = {
      questionnaireId,
      text,
      type,
      options: optionsJSON,
      order: order || 0,
    };

    await Question.create(questionToCreate);

    req.flash('success_msg', 'Question ajoutée avec succès.');
    res.redirect(`/questionnaires/${questionnaireId}`); // Detay sayfasına yönlendir
  } catch (error) {
    logger.error('Error adding question:', { error, questionnaireId });
    // Add more detailed logging - REMOVED
    // logger.error('Detailed add question error:', error);
    req.flash('error_msg', "Erreur lors de l'ajout de la question.");
    res.redirect(`/questionnaires/${questionnaireId}`);
  }
};

// POST /questions/:questionId/delete - Delete a question
exports.deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  try {
    // Soruyu bul ve ilişkili anketi getir
    const question = await Question.findByPk(questionId, { include: 'questionnaire' });
    if (!question) {
      req.flash('error_msg', 'Question non trouvée.');
      return res.redirect('back'); // Önceki sayfaya
    }

    // Yetki kontrolü: Sadece anketi oluşturan silebilir
    if (question.questionnaire.createdBy !== req.user.id) {
      req.flash('error_msg', 'Accès refusé.');
      return res.redirect('/questionnaires');
    }

    const { questionnaireId } = question;
    await question.destroy(); // Cascade delete varsa cevapları da siler

    req.flash('success_msg', 'Question supprimée.');
    res.redirect(`/questionnaires/${questionnaireId}`); // Ankete geri dön
  } catch (error) {
    req.flash('error_msg', 'Erreur lors de la suppression de la question.');
    // res.redirect('back'); // Deprecated and potentially unreliable in tests
    // Redirect to questionnaire details or list instead
    const questionnaireId = error?.question?.questionnaireId; // Try to get ID if possible
    if (questionnaireId) {
      res.redirect(`/questionnaires/${questionnaireId}`);
    } else {
      res.redirect('/questionnaires'); // Fallback to list
    }
  }
};

// POST /questionnaires/:id/delete - Delete Questionnaire
exports.deleteQuestionnaire = async (req, res) => {
  const questionnaireId = req.params.id;
  const consultantId = req.user.id;
  try {
    const questionnaire = await Questionnaire.findOne({
      where: { id: questionnaireId, createdBy: consultantId },
    });
    if (!questionnaire) {
      req.flash('error_msg', 'Questionnaire non trouvé ou accès refusé.');
      return res.redirect('/questionnaires');
    }
    // Rely on cascade delete defined in models
    await questionnaire.destroy();
    req.flash('success_msg', 'Questionnaire supprimé.');
    res.redirect('/questionnaires');
  } catch (error) {
    logger.error(`Questionnaire delete error for ID ${questionnaireId}:`, { error });
    req.flash('error_msg', 'Erreur suppression questionnaire.');
    res.redirect('/questionnaires');
  }
};
