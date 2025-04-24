// controllers/beneficiaryController.js

// --- Gerekli Modüller ---
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
  Beneficiary,
  User,
  Appointment,
  Message,
  Questionnaire,
  Document,
  Question,
  Answer,
  Forfait,
} = require('../models');
// Note: Middleware functions like checkAndDeductCredits, checkAccessLevel, checkAiLimit should be used in the router, not called directly here.
const { logCreditChange } = require('../services/creditService');
const aiService = require('../services/aiService');
const { incrementAiUsage } = require('../middlewares/limits'); // This might be better in the service layer too

// --- Yardımcı Fonksiyonlar ---

// Belirli bir alanı AJAX ile güncellemek için genel fonksiyon (Controller içinde)
async function updateBeneficiaryField(req, res, fieldName) {
  const beneficiaryId = req.params.id;
  const requestingUser = req.user;
  const { [fieldName]: fieldValue } = req.body; // Dinamik alan adı

  try {
    const whereClause = { id: beneficiaryId };
    if (requestingUser.forfaitType !== 'Admin') {
      if (requestingUser.userType === 'consultant') {
        whereClause.consultantId = requestingUser.id;
      } else {
        return res
          .status(403)
          .json({ success: false, message: 'Accès non autorisé.' });
      }
    }
    const beneficiary = await Beneficiary.findOne({ where: whereClause });
    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Bénéficiaire non trouvé ou accès non autorisé.',
      });
    }
    await beneficiary.update({ [fieldName]: fieldValue || '' });
    res.json({
      success: true,
      message: `Champ (${fieldName}) mis à jour.`,
      updatedValue: beneficiary[fieldName],
    });
  } catch (error) {
    console.error(`Beneficiary ${fieldName} update error:`, error);
    res.status(500).json({
      success: false,
      message: `Erreur serveur lors de la mise à jour du champ (${fieldName}).`,
    });
  }
}

// --- Route Handler Fonksiyonları ---

// GET /beneficiaries - Liste des bénéficiaires
exports.listBeneficiaries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const whereClause = {};
    const { search, status, phase } = req.query;

    if (req.user.forfaitType !== 'Admin') {
      if (req.user.userType === 'consultant') {
        whereClause.consultantId = req.user.id;
      } else {
        req.flash('error_msg', 'Accès non autorisé.');
        return res.redirect('/dashboard');
      }
    }
    if (search) {
      whereClause[Op.or] = [
        { '$user.firstName$': { [Op.like]: `%${search}%` } },
        { '$user.lastName$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) whereClause.status = status;
    if (phase) whereClause.currentPhase = phase;

    const { count, rows } = await Beneficiary.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email'],
        },
        {
          model: User,
          as: 'consultant',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      limit,
      offset,
      order: [
        [{ model: User, as: 'user' }, 'lastName', 'ASC'],
        [{ model: User, as: 'user' }, 'firstName', 'ASC'],
      ],
      distinct: true,
    });

    const beneficiaries = rows.map((b) => b.get({ plain: true }));
    const totalPages = Math.ceil(count / limit);

    res.render('beneficiaries/index', {
      title: 'Bénéficiaires',
      beneficiaries,
      user: req.user,
      isAdmin: req.user.forfaitType === 'Admin',
      pagination: {
        page,
        limit,
        totalRows: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      search: search || '',
      filters: { status: status || '', phase: phase || '' },
    });
  } catch (err) {
    console.error('Error loading beneficiaries list:', err);
    req.flash(
      'error_msg',
      'Une erreur est survenue lors du chargement des bénéficiaires.',
    );
    res.redirect('/dashboard');
  }
};

// GET /beneficiaries/add - Formulaire d'ajout
exports.showAddForm = (req, res) => {
  res.render('beneficiaries/add', {
    title: 'Ajouter un bénéficiaire',
    user: req.user,
  });
};

// POST /beneficiaries/add - Traitement du formulaire d'ajout
exports.addBeneficiary = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
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
    bilanStartDate,
    bilanEndDate,
  } = req.body;
  const consultantId = req.user.id;
  let newUser = null;

  try {
    const consultantUser = await User.findByPk(consultantId, {
      include: { model: Forfait, as: 'forfait' },
    });
    const currentBeneficiaryCount = await Beneficiary.count({
      where: { consultantId },
    });
    const maxAllowed = consultantUser?.forfait?.maxBeneficiaries;
    if (maxAllowed !== null && currentBeneficiaryCount >= maxAllowed) {
      req.flash(
        'error_msg',
        `Limite de ${maxAllowed} bénéficiaires atteinte pour votre forfait (${consultantUser.forfaitType}).`,
      );
      return res.redirect('/beneficiaries/add');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      req.flash('error_msg', 'Cet email est déjà enregistré.');
      return res.render('beneficiaries/add', {
        title: 'Ajouter un bénéficiaire',
        user: req.user,
        error_msg: req.flash('error_msg')[0],
        beneficiaryData: req.body,
      });
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    console.log(
      `Generated temporary password for ${email}: ${temporaryPassword}`,
    ); // Consider removing in production

    newUser = await User.create({
      email,
      password: temporaryPassword,
      firstName,
      lastName,
      userType: 'beneficiary',
    });

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
    });

    req.flash(
      'success_msg',
      `Bénéficiaire ${firstName} ${lastName} ajouté. Mot de passe temporaire: ${temporaryPassword} - Veuillez le communiquer au bénéficiaire et lui demander de le changer.`,
    );
    res.redirect('/beneficiaries');
  } catch (err) {
    console.error('Beneficiary add error:', err);
    if (err.name === 'SequelizeValidationError') {
      req.flash('error_msg', err.errors.map((e) => e.message).join(', '));
    } else {
      req.flash('error_msg', "Erreur lors de l'ajout du bénéficiaire.");
    }
    if (newUser?.id) {
      try {
        await User.destroy({ where: { id: newUser.id } });
        console.log(`Rolled back user creation for ${email}`);
      } catch (destroyError) {
        console.error('Error rolling back user creation:', destroyError);
      }
    }
    res.render('beneficiaries/add', {
      title: 'Ajouter un bénéficiaire',
      user: req.user,
      error_msg: req.flash('error_msg')[0],
      beneficiaryData: req.body,
    });
  }
};

// GET /beneficiaries/:id - Détails d'un bénéficiaire
exports.showDetails = async (req, res) => {
  try {
    const beneficiaryId = req.params.id;
    const requestingUser = req.user;
    const whereClause = { id: beneficiaryId };
    if (requestingUser.forfaitType !== 'Admin') {
      if (requestingUser.userType === 'consultant') whereClause.consultantId = requestingUser.id;
      else {
        req.flash('error_msg', 'Accès non autorisé.');
        return res.redirect('/dashboard');
      }
    }

    const beneficiary = await Beneficiary.findOne({
      where: whereClause,
      include: [
        { model: User, as: 'user' },
        {
          model: User,
          as: 'consultant',
          attributes: ['firstName', 'lastName'],
        },
        {
          model: Appointment,
          as: 'beneficiaryAppointments',
          order: [['date', 'DESC']],
        },
        {
          model: Message,
          as: 'beneficiaryMessages',
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: { model: User, as: 'sender' },
        },
        {
          model: Questionnaire,
          as: 'assignedQuestionnaires',
          include: { model: User, as: 'creator' },
        },
        {
          model: Document,
          as: 'beneficiaryDocuments',
          include: { model: User, as: 'uploader' },
        },
      ],
    });

    if (!beneficiary) {
      req.flash('error_msg', 'Bénéficiaire non trouvé ou accès non autorisé.');
      return res.redirect('/beneficiaries');
    }

    res.render('beneficiaries/details', {
      title: `Bénéficiaire: ${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      beneficiary: beneficiary.get({ plain: true }),
      user: req.user,
      isAdmin: requestingUser.forfaitType === 'Admin',
    });
  } catch (err) {
    console.error('Beneficiary details error:', err);
    req.flash('error_msg', 'Erreur lors du chargement des détails.');
    res.redirect('/beneficiaries');
  }
};

// GET /beneficiaries/:id/edit - Formulaire de modification
exports.showEditForm = async (req, res) => {
  try {
    const beneficiaryId = req.params.id;
    const requestingUser = req.user;
    const whereClause = { id: beneficiaryId };
    if (requestingUser.forfaitType !== 'Admin') {
      if (requestingUser.userType === 'consultant') whereClause.consultantId = requestingUser.id;
      else {
        req.flash('error_msg', 'Accès non autorisé.');
        return res.redirect('/dashboard');
      }
    }

    const beneficiary = await Beneficiary.findOne({
      where: whereClause,
      include: { model: User, as: 'user' },
    });
    if (!beneficiary) {
      req.flash('error_msg', 'Bénéficiaire non trouvé ou accès non autorisé.');
      return res.redirect('/beneficiaries');
    }

    // Helper to get documents based on user role
    const getDocuments = async (category) => {
      const docWhereClause = { category };
      if (requestingUser.forfaitType === 'Admin') {
        docWhereClause.beneficiaryId = beneficiary.id; // Admin sees docs for this beneficiary
      } else {
        // Consultant sees docs uploaded by them OR for this beneficiary?
        // Let's assume consultant should see docs for THIS beneficiary for now.
        docWhereClause.beneficiaryId = beneficiary.id;
        // If you want consultant to only see *their* uploads for this bene:
        // docWhereClause.uploadedBy = requestingUser.id;
      }
      return Document.findAll({
        where: docWhereClause,
        order: [['createdAt', 'DESC']],
      });
    };

    const [synthesisDocuments, actionPlanDocuments] = await Promise.all([
      getDocuments('Synthèse'),
      getDocuments("Plan d'Action"),
    ]);

    res.render('beneficiaries/edit', {
      title: `Modifier: ${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
      beneficiary: beneficiary.get({ plain: true }),
      synthesisDocuments: synthesisDocuments.map((d) => d.get({ plain: true })),
      actionPlanDocuments: actionPlanDocuments.map((d) =>
        d.get({ plain: true }),
      ),
      user: req.user,
      isAdmin: requestingUser.forfaitType === 'Admin',
    });
  } catch (err) {
    console.error('Beneficiary edit form error:', err);
    req.flash('error_msg', 'Erreur lors du chargement du formulaire.');
    res.redirect('/beneficiaries');
  }
};

// POST /beneficiaries/:id/edit - Traitement du formulaire de modification
exports.updateBeneficiary = async (req, res) => {
  const beneficiaryId = req.params.id;
  const requestingUser = req.user;
  const formData = req.body;

  try {
    const whereClause = { id: beneficiaryId };
    if (requestingUser.forfaitType !== 'Admin') {
      if (requestingUser.userType === 'consultant') whereClause.consultantId = requestingUser.id;
      else {
        req.flash('error_msg', 'Accès non autorisé.');
        return res.redirect('/dashboard');
      }
    }

    const beneficiary = await Beneficiary.findOne({
      where: whereClause,
      include: { model: User, as: 'user' },
    });
    if (!beneficiary) {
      req.flash('error_msg', 'Bénéficiaire non trouvé ou accès non autorisé.');
      return res.redirect('/beneficiaries');
    }

    // Check email uniqueness if changed
    if (formData.email && formData.email !== beneficiary.user.email) {
      const existingUser = await User.findOne({
        where: { email: formData.email },
      });
      if (existingUser && existingUser.id !== beneficiary.userId) {
        req.flash(
          'error_msg',
          'Cet email est déjà utilisé par un autre utilisateur.',
        );
        // Re-render form with error and old data
        const getDocuments = async (category) =>
          Document.findAll({
            where: { category, beneficiaryId: beneficiary.id },
            order: [['createdAt', 'DESC']],
          });
        const [synthesisDocuments, actionPlanDocuments] = await Promise.all([
          getDocuments('Synthèse'),
          getDocuments("Plan d'Action"),
        ]);
        return res.render('beneficiaries/edit', {
          title: `Modifier: ${beneficiary.user.firstName} ${beneficiary.user.lastName}`,
          beneficiary: beneficiary.get({ plain: true }),
          synthesisDocuments: synthesisDocuments.map((d) =>
            d.get({ plain: true }),
          ),
          actionPlanDocuments: actionPlanDocuments.map((d) =>
            d.get({ plain: true }),
          ),
          user: req.user,
          isAdmin: requestingUser.forfaitType === 'Admin',
          error_msg: req.flash('error_msg')[0],
          beneficiaryData: formData,
        });
      }
    }

    // Update User details
    await User.update(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      },
      { where: { id: beneficiary.userId } },
    );

    // Prepare and Update Beneficiary details
    const getCheckboxValue = (value) => value === 'true' || value === true;
    const checklistFields = [
      'prelim_entretienInfoFait',
      'prelim_analyseDemandeFaite',
      'prelim_conventionSignee',
      'invest_parcoursDetailleFait',
      'invest_competencesEvaluees',
      'invest_interetsExplores',
      'invest_projetExplore',
      'conclu_syntheseRedigee',
      'conclu_planActionDefini',
      'conclu_entretienSyntheseFait',
      'satisfactionSurveySent',
      'suivi_entretien6moisFait',
    ];
    const updateData = {
      phone: formData.phone,
      notes: formData.notes,
      status: formData.status,
      currentPhase: formData.currentPhase,
      education: formData.education,
      experience: formData.experience,
      identifiedSkills: formData.identifiedSkills,
      careerObjectives: formData.careerObjectives,
      actionPlan: formData.actionPlan,
      synthesis: formData.synthesis,
      bilanStartDate: formData.bilanStartDate || null,
      bilanEndDate: formData.bilanEndDate || null,
      followUpDate: formData.followUpDate || null,
      followUpNotes: formData.followUpNotes || null,
      consentGiven: getCheckboxValue(formData.consentGiven),
      consentDate: formData.consentDate || null,
      agreementSigned: getCheckboxValue(formData.agreementSigned),
      agreementDate: formData.agreementDate || null,
    };
    checklistFields.forEach((field) => {
      updateData[field] = getCheckboxValue(formData[field]);
    });

    await beneficiary.update(updateData);
    console.log(
      `Beneficiary ${beneficiaryId} updated by User ${requestingUser.id}`,
    );

    req.flash('success_msg', 'Informations du bénéficiaire mises à jour.');
    res.redirect(`/beneficiaries/${beneficiary.id}`);
  } catch (err) {
    console.error(
      `Beneficiary Edit POST error for ID ${beneficiaryId} by User ${requestingUser.id}:`,
      err,
    );
    req.flash('error_msg', 'Erreur lors de la mise à jour.');
    res.redirect(`/beneficiaries/${beneficiaryId}/edit`);
  }
};

// POST /beneficiaries/:id/delete - Delete beneficiary
exports.deleteBeneficiary = async (req, res) => {
  const beneficiaryId = req.params.id;
  const requestingUser = req.user;
  try {
    const whereClause = { id: beneficiaryId };
    if (requestingUser.forfaitType !== 'Admin') {
      if (requestingUser.userType === 'consultant') whereClause.consultantId = requestingUser.id;
      else {
        req.flash('error_msg', 'Accès non autorisé.');
        return res.redirect('/dashboard');
      }
    }

    // Find beneficiary first to get the associated userId
    const beneficiary = await Beneficiary.findOne({
      where: whereClause,
      include: { model: User, as: 'user', attributes: ['email'] },
    });
    if (!beneficiary) {
      req.flash('error_msg', 'Bénéficiaire non trouvé ou accès non autorisé.');
      return res.redirect('/beneficiaries');
    }

    const { userId } = beneficiary;
    const userEmail = beneficiary.user?.email || `ID ${userId}`;

    // Delete the User record, relying on onDelete: CASCADE for Beneficiary and others
    console.log(
      `Attempting delete User ID: ${userId} (${userEmail}) requested by User ID: ${requestingUser.id}`,
    );
    const deletedUserCount = await User.destroy({ where: { id: userId } });

    if (deletedUserCount > 0) {
      console.log(`Successfully deleted User ID: ${userId} via cascade.`);
      req.flash('success_msg', 'Bénéficiaire supprimé.');
    } else {
      // This shouldn't happen if beneficiary was found
      console.error(
        `User delete failed for ID: ${userId}. Beneficiary ID: ${beneficiaryId}.`,
      );
      req.flash(
        'error_msg',
        "Erreur lors de la suppression de l'utilisateur associé.",
      );
    }
    res.redirect('/beneficiaries');
  } catch (error) {
    console.error(
      `Beneficiary delete error for ID ${beneficiaryId} by User ${requestingUser.id}:`,
      error,
    );
    req.flash('error_msg', 'Erreur lors de la suppression.');
    res.redirect('/beneficiaries');
  }
};

// POST /beneficiaries/:id/update-phase - Update Bilan phase
exports.updatePhase = async (req, res) => {
  const beneficiaryId = req.params.id;
  const requestingUser = req.user;
  const { currentPhase: targetPhase } = req.body;
  const validPhases = Beneficiary.getAttributes().currentPhase.values;

  if (!validPhases.includes(targetPhase)) {
    req.flash('error_msg', 'Phase invalide.');
    return res.redirect(`/beneficiaries/${beneficiaryId}`);
  }
  try {
    const whereClause = { id: beneficiaryId };
    if (requestingUser.forfaitType !== 'Admin') {
      if (requestingUser.userType === 'consultant') whereClause.consultantId = requestingUser.id;
      else {
        req.flash('error_msg', 'Accès non autorisé.');
        return res.redirect('/dashboard');
      }
    }

    const beneficiary = await Beneficiary.findOne({ where: whereClause });
    if (!beneficiary) {
      req.flash('error_msg', 'Bénéficiaire non trouvé ou accès non autorisé.');
      return res.redirect('/beneficiaries');
    }

    // --- Phase Transition Checks ---
    let canProceed = true;
    let errorMessage = '';
    if (
      targetPhase === 'investigation' &&
      beneficiary.currentPhase === 'preliminary' &&
      !beneficiary.prelim_conventionSignee
    ) {
      canProceed = false;
      errorMessage =
        "Impossible de passer à l'Investigation: Convention non signée.";
    } else if (
      targetPhase === 'conclusion' &&
      beneficiary.currentPhase === 'investigation' &&
      (!beneficiary.invest_projetExplore ||
        !beneficiary.invest_competencesEvaluees)
    ) {
      canProceed = false;
      errorMessage =
        'Impossible de passer à la Conclusion: Investigation incomplète.';
    }
    if (!canProceed) {
      req.flash('error_msg', errorMessage);
      return res.redirect(`/beneficiaries/${beneficiaryId}`);
    }
    // --- End Checks ---

    await beneficiary.update({ currentPhase: targetPhase });
    req.flash('success_msg', 'Phase mise à jour.');
    res.redirect(`/beneficiaries/${beneficiaryId}`);
  } catch (error) {
    console.error(
      `Beneficiary phase update error for ID ${beneficiaryId}:`,
      error,
    );
    req.flash('error_msg', 'Erreur lors de la mise à jour de la phase.');
    res.redirect(`/beneficiaries/${beneficiaryId}`);
  }
};

// AJAX Field Update Routes (using the helper function)
exports.updateSkills = (req, res) =>
  updateBeneficiaryField(req, res, 'identifiedSkills');
exports.updateNotes = (req, res) => updateBeneficiaryField(req, res, 'notes');
exports.updateEducation = (req, res) =>
  updateBeneficiaryField(req, res, 'education');
exports.updateExperience = (req, res) =>
  updateBeneficiaryField(req, res, 'experience');
exports.updateObjectives = (req, res) =>
  updateBeneficiaryField(req, res, 'careerObjectives');
exports.updateActionPlan = (req, res) =>
  updateBeneficiaryField(req, res, 'actionPlan');
exports.updateSynthesis = (req, res) =>
  updateBeneficiaryField(req, res, 'synthesis');
exports.updateFollowUpNotes = (req, res) =>
  updateBeneficiaryField(req, res, 'followUpNotes');

// --- AI Functions ---
const GENERATE_SYNTHESIS_COST = 20;
const GENERATE_ACTIONPLAN_COST = 15;

// POST /beneficiaries/:id/generate-synthesis - AI Synthesis Generation
exports.generateSynthesis = async (req, res) => {
  const beneficiaryId = req.params.id;
  const requestingUser = req.user;
  const cost = req.creditCost || GENERATE_SYNTHESIS_COST; // Provided by checkAndDeductCredits middleware
  const { limitInfo } = req; // Provided by checkAiLimit middleware
  const redirectUrl = `/beneficiaries/${beneficiaryId}#conclusion-content`;

  // Middleware should have already checked limits and credits
  if (!limitInfo) {
    // Basic check just in case
    console.error('Limit info missing in generateSynthesis controller');
    req.flash(
      'error_msg',
      'Erreur interne: Information de limite IA manquante.',
    );
    return res.redirect(redirectUrl);
  }
  try {
    const whereClause = { id: beneficiaryId };
    if (requestingUser.forfaitType !== 'Admin') {
      if (requestingUser.userType === 'consultant') whereClause.consultantId = requestingUser.id;
      else throw new Error('Accès non autorisé.');
    }

    // Fetch beneficiary with necessary data for AI
    const beneficiary = await Beneficiary.findOne({
      where: whereClause,
      include: [
        { model: User, as: 'user' },
        {
          model: Questionnaire,
          as: 'assignedQuestionnaires',
          required: false,
          include: [
            {
              model: Question,
              as: 'questions',
              include: [
                {
                  model: Answer,
                  as: 'answers',
                  where: { beneficiaryId },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    if (!beneficiary) {
      throw new Error('Bénéficiaire non trouvé ou accès non autorisé.');
    }

    const beneficiaryDataForAI = {
      ...beneficiary.toJSON(),
      user: beneficiary.user.toJSON(),
    };
    const generatedText =
      await aiService.generateSynthesisDraft(beneficiaryDataForAI);
    await beneficiary.update({ synthesis: generatedText });

    // AI Usage and Credit logging should ideally be handled more robustly,
    // potentially in the middleware or service layer after successful generation.
    // Calling them here assumes middleware didn't already do it.
    await incrementAiUsage(requestingUser.id); // Consider moving this
    await logCreditChange(
      requestingUser.id, // userId
      -cost, // amount (negative because it's a deduction)
      'AI_GENERATE_SYNTHESIS',
      `Génération synthèse pour ${beneficiary.user.firstName}`,
      null, // adminUserId (null because it's not an admin action)
      beneficiaryId, // relatedResourceId
      'Beneficiary', // relatedResourceType
    );

    req.flash(
      'success_msg',
      `Synthèse IA générée (${cost} crédits). Usage: ${limitInfo.currentUsage + 1}/${limitInfo.limit || '∞'}.`,
    );
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('AI Synthesis Generation Error:', error);
    req.flash('error_msg', `Erreur génération IA: ${error.message}`);
    res.redirect(redirectUrl);
  }
};

// POST /beneficiaries/:id/generate-actionplan - AI Action Plan Generation
exports.generateActionPlan = async (req, res) => {
  const beneficiaryId = req.params.id;
  const requestingUser = req.user;
  const cost = req.creditCost || GENERATE_ACTIONPLAN_COST; // From middleware
  const { limitInfo } = req; // From middleware
  const redirectUrl = `/beneficiaries/${beneficiaryId}#conclusion-content`;

  if (!limitInfo) {
    // Basic check
    console.error('Limit info missing in generateActionPlan controller');
    req.flash(
      'error_msg',
      'Erreur interne: Information de limite IA manquante.',
    );
    return res.redirect(redirectUrl);
  }
  try {
    const whereClause = { id: beneficiaryId };
    if (requestingUser.forfaitType !== 'Admin') {
      if (requestingUser.userType === 'consultant') whereClause.consultantId = requestingUser.id;
      else throw new Error('Accès non autorisé.');
    }

    // Fetch beneficiary with necessary data
    const beneficiary = await Beneficiary.findOne({
      where: whereClause,
      include: [
        { model: User, as: 'user' },
        // Include completed questionnaires for context?
        {
          model: Questionnaire,
          as: 'assignedQuestionnaires',
          where: { status: 'completed' },
          required: false,
        },
      ],
    });
    if (!beneficiary) {
      throw new Error('Bénéficiaire non trouvé ou accès non autorisé.');
    }

    const beneficiaryDataForAI = {
      ...beneficiary.toJSON(),
      user: beneficiary.user.toJSON(),
    };
    const generatedText =
      await aiService.generateActionPlanDraft(beneficiaryDataForAI);
    await beneficiary.update({ actionPlan: generatedText });

    // AI Usage and Credit logging - potential duplication with middleware?
    await incrementAiUsage(requestingUser.id); // Consider moving
    await logCreditChange(
      requestingUser.id, // userId
      -cost, // amount (negative because it's a deduction)
      'AI_GENERATE_ACTIONPLAN',
      `Génération plan d'action pour ${beneficiary.user.firstName}`,
      null, // adminUserId (null because it's not an admin action)
      beneficiaryId, // relatedResourceId
      'Beneficiary', // relatedResourceType
    );

    req.flash(
      'success_msg',
      `Plan d'action IA généré (${cost} crédits). Usage: ${limitInfo.currentUsage + 1}/${limitInfo.limit || '∞'}.`,
    );
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('AI Action Plan Generation Error:', error);
    req.flash('error_msg', `Erreur génération IA: ${error.message}`);
    res.redirect(redirectUrl);
  }
};
