const { Op } = require('sequelize');
const {
  Questionnaire,
  Question,
  Answer,
  Beneficiary,
  User,
} = require('../models');
const { logCreditChange } = require('../services/creditService');

// Constants (Consider moving to a config file)
const ASSIGN_COST = 10;

// --- Route Handlers ---

// GET /questionnaires - List Questionnaires
exports.listQuestionnaires = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
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
          }, // Handle empty beneficiary list
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
                [Op.in]:
                    ownBeneficiaryIds.length > 0 ? ownBeneficiaryIds : [-1],
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
      user: req.user,
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
    console.error('Questionnaire list error:', err);
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
  const {
    title, description, category, questions,
  } = req.body;
  const createdBy = req.user.id;
  const errors = [];

  if (!title || !description) errors.push({ msg: 'Titre et description requis.' });

  let validQuestions = [];
  if (questions && Array.isArray(questions)) {
    validQuestions = questions.filter(
      (q) =>
        q && q.text && q.text.trim() !== '' && q.type && q.type.trim() !== '',
    );
    validQuestions.forEach((q) => {
      if (
        ['multiple_choice', 'single_choice'].includes(q.type) &&
        (!q.options || q.options.trim() === '')
      ) {
        errors.push({
          msg: `Options requises pour la question: "${q.text.substring(0, 20)}..."`,
        });
      }
    });
  }
  if (validQuestions.length === 0 && errors.length === 0) {
    errors.push({ msg: 'Ajoutez au moins une question valide.' });
  }

  if (errors.length > 0) {
    const questionTypes = Question.getAttributes().type.values;
    const formData = {
      title,
      description,
      category,
      questions: questions || [{}],
    };
    return res.render('questionnaires/new', {
      title: 'Créer un Questionnaire',
      errors,
      formData,
      questionTypes,
      user: req.user,
    });
  }

  let newQuestionnaire = null;
  try {
    newQuestionnaire = await Questionnaire.create({
      title,
      description,
      category,
      createdBy,
      status: 'draft',
    });

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
          console.warn('Invalid JSON options for question:', q.text);
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
    console.error('Questionnaire creation error:', err);
    // Rollback questionnaire creation if questions failed?
    if (newQuestionnaire?.id) {
      await Question.destroy({
        where: { questionnaireId: newQuestionnaire.id },
      });
      await newQuestionnaire.destroy();
    }
    req.flash('error_msg', 'Erreur serveur création questionnaire.');
    const questionTypes = Question.getAttributes().type.values;
    const formData = {
      title,
      description,
      category,
      questions: questions || [{}],
    };
    res.render('questionnaires/new', {
      title: 'Créer un Questionnaire',
      errors: errors.length > 0 ? errors : [{ msg: 'Erreur serveur.' }],
      formData,
      questionTypes,
      user: req.user,
    });
  }
};

// GET /questionnaires/:id - Show Questionnaire Details / Assign Form
exports.showDetails = async (req, res) => {
  try {
    const isAdmin = req.user.forfaitType === 'Admin';
    const whereClause = { id: req.params.id };
    if (!isAdmin) whereClause.createdBy = req.user.id;

    const questionnaire = await Questionnaire.findOne({
      where: whereClause,
      include: [
        { model: Question, as: 'questions', order: [['order', 'ASC']] },
        {
          model: Beneficiary,
          as: 'beneficiary',
          required: false,
          include: { model: User, as: 'user' },
        },
      ],
    });

    if (!questionnaire) {
      req.flash('error_msg', 'Questionnaire non trouvé ou accès refusé.');
      return res.redirect('/questionnaires');
    }

    let availableBeneficiaries = [];
    const isConsultant = req.user.userType === 'consultant';
    if (!questionnaire.beneficiaryId && (isConsultant || isAdmin)) {
      const whereCondition = isAdmin ? {} : { consultantId: req.user.id };
      const rawBeneficiaries = await Beneficiary.findAll({
        where: whereCondition,
        include: { model: User, as: 'user' },
        order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
      });
      availableBeneficiaries = rawBeneficiaries.map((b) =>
        b.get({ plain: true }),
      );
    }

    res.render('questionnaires/details', {
      title: `Questionnaire: ${questionnaire.title}`,
      questionnaire: questionnaire.get({ plain: true }),
      availableBeneficiaries,
      user: req.user,
      isAdmin,
      isConsultant,
    });
  } catch (err) {
    console.error('Questionnaire details error:', err);
    req.flash('error_msg', 'Erreur chargement détails questionnaire.');
    res.redirect('/questionnaires');
  }
};

// POST /questionnaires/:id/assign - Assign questionnaire
exports.assignQuestionnaire = async (req, res) => {
  const { beneficiaryId, dueDate } = req.body;
  const questionnaireId = req.params.id;
  const consultantId = req.user.id;
  const cost = req.creditCost || ASSIGN_COST;

  try {
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

    req.flash(
      'success_msg',
      `Questionnaire assigné (${cost} crédits déduits).`,
    );
    res.redirect(`/questionnaires/${questionnaireId}`);
  } catch (err) {
    console.error('Questionnaire assign error:', err);
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
    console.error('Questionnaire answer form error:', err);
    req.flash('error_msg', 'Erreur chargement formulaire questionnaire.');
    res.redirect('/questionnaires');
  }
};

// POST /questionnaires/:id/answer - Submit beneficiary answers
exports.submitAnswers = async (req, res) => {
  const questionnaireId = req.params.id;
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
        if (Array.isArray(answerValue)) answerValue = answerValue.join(', '); // Handle potential checkbox array
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
    console.error('Questionnaire submit error:', err);
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
      if (
        beneficiaryProfile &&
        questionnaire.beneficiaryId === beneficiaryProfile.id
      ) {
        canView = true;
        beneficiaryIdForFiltering = questionnaire.beneficiaryId;
      }
    }

    if (!canView) {
      req.flash('error_msg', 'Accès refusé aux résultats.');
      return res.redirect('/questionnaires');
    }

    // Filter answers if a specific beneficiary context exists
    if (beneficiaryIdForFiltering) {
      questionnaire.questions.forEach((q) => {
        q.answers = q.answers.filter(
          (a) => a.beneficiaryId === beneficiaryIdForFiltering,
        );
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
    console.error('Questionnaire results error:', err);
    req.flash('error_msg', 'Erreur chargement résultats.');
    res.redirect('/questionnaires');
  }
};

// GET /questionnaires/:id/edit - Show Edit Questionnaire Form (Stub)
exports.showEditQuestionnaireForm = async (req, res) => {
  req.flash(
    'info_msg',
    "La modification des questionnaires n'est pas encore implémentée.",
  );
  res.redirect(`/questionnaires/${req.params.id}`);
};

// POST /questionnaires/:id/edit - Update Questionnaire (Stub)
exports.updateQuestionnaire = async (req, res) => {
  req.flash(
    'info_msg',
    "La modification des questionnaires n'est pas encore implémentée.",
  );
  res.redirect(`/questionnaires/${req.params.id}`);
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
    console.error(
      `Questionnaire delete error for ID ${questionnaireId}:`,
      error,
    );
    req.flash('error_msg', 'Erreur suppression questionnaire.');
    res.redirect('/questionnaires');
  }
};
