const express = require('express');

const router = express.Router();
const { Op } = require('sequelize');
const { ensureAuthenticated, ensureConsultant } = require('../middlewares/auth');
const { Questionnaire, Question, Answer, Beneficiary, User } = require('../models');

// Liste des questionnaires
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    let questionnaires;

    if (req.user.userType === 'consultant') {
      // Pour les consultants, afficher tous les questionnaires qu'ils ont créés
      questionnaires = await Questionnaire.findAll({
        where: { createdBy: req.user.id },
        include: [{ model: Beneficiary, as: 'beneficiary' }],
        order: [['createdAt', 'DESC']],
      });
    } else {
      // Pour les bénéficiaires, trouver leur profil et afficher leurs questionnaires
      const beneficiary = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });

      if (!beneficiary) {
        req.flash('error', 'Profil bénéficiaire non trouvé');
        return res.redirect('/dashboard');
      }

      questionnaires = await Questionnaire.findAll({
        where: { beneficiaryId: beneficiary.id },
        include: [{ model: User, as: 'creator' }],
        order: [['createdAt', 'DESC']],
      });
    }

    res.render('questionnaires/index', {
      title: 'Questionnaires',
      questionnaires,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du chargement des questionnaires');
    res.redirect('/dashboard');
  }
});

// Formulaire de création d'un questionnaire
router.get('/create', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    // Récupérer la liste des bénéficiaires pour le consultant
    const beneficiaries = await Beneficiary.findAll({
      where: { consultantId: req.user.id },
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC'],
      ],
    });

    // Si un ID de bénéficiaire est fourni dans l'URL
    const { beneficiaryId } = req.query;

    res.render('questionnaires/create', {
      title: 'Créer un questionnaire',
      beneficiaries,
      beneficiaryId,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du chargement du formulaire');
    res.redirect('/questionnaires');
  }
});

// Traitement du formulaire de création
router.post('/create', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const { beneficiaryId, title, description, type, dueDate } = req.body;

    // Vérifier que le bénéficiaire appartient bien au consultant
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: beneficiaryId,
        consultantId: req.user.id,
      },
    });

    if (!beneficiary) {
      req.flash('error', 'Bénéficiaire non trouvé ou non autorisé');
      return res.redirect('/questionnaires/create');
    }

    // Créer le questionnaire
    const questionnaire = await Questionnaire.create({
      title,
      description,
      type,
      dueDate: dueDate || null,
      status: 'draft',
      createdBy: req.user.id,
      beneficiaryId,
    });

    req.flash('success', 'Questionnaire créé avec succès');
    res.redirect(`/questionnaires/${questionnaire.id}/edit`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors de la création du questionnaire');
    res.redirect('/questionnaires/create');
  }
});

// Édition d'un questionnaire (ajout/modification des questions)
router.get('/:id/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id,
      },
      include: [
        { model: Beneficiary, as: 'beneficiary' },
        { model: Question, as: 'questions', order: [['order', 'ASC']] },
      ],
    });

    if (!questionnaire) {
      req.flash('error', 'Questionnaire non trouvé ou non autorisé');
      return res.redirect('/questionnaires');
    }

    res.render('questionnaires/edit', {
      title: `Modifier: ${questionnaire.title}`,
      questionnaire,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du chargement du questionnaire');
    res.redirect('/questionnaires');
  }
});

// Traitement de la mise à jour du questionnaire
router.post('/:id/edit', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const { title, description, type, dueDate, status } = req.body;

    const questionnaire = await Questionnaire.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id,
      },
    });

    if (!questionnaire) {
      req.flash('error', 'Questionnaire non trouvé ou non autorisé');
      return res.redirect('/questionnaires');
    }

    // Mettre à jour le questionnaire
    await questionnaire.update({
      title,
      description,
      type,
      dueDate: dueDate || null,
      status,
    });

    req.flash('success', 'Questionnaire mis à jour avec succès');
    res.redirect(`/questionnaires/${questionnaire.id}/edit`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors de la mise à jour du questionnaire');
    res.redirect(`/questionnaires/${req.params.id}/edit`);
  }
});

// Ajout d'une question au questionnaire
router.post('/:id/questions/add', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const { text, type, options, required, order } = req.body;

    const questionnaire = await Questionnaire.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id,
      },
    });

    if (!questionnaire) {
      req.flash('error', 'Questionnaire non trouvé ou non autorisé');
      return res.redirect('/questionnaires');
    }

    // Créer la question
    await Question.create({
      text,
      type,
      options: options ? options.split('\n') : [],
      required: required === 'on',
      order: parseInt(order, 10) || 0,
      questionnaireId: questionnaire.id,
    });

    req.flash('success', 'Question ajoutée avec succès');
    res.redirect(`/questionnaires/${questionnaire.id}/edit`);
  } catch (err) {
    console.error(err);
    req.flash('error', "Une erreur est survenue lors de l'ajout de la question");
    res.redirect(`/questionnaires/${req.params.id}/edit`);
  }
});

// Suppression d'une question
router.post(
  '/questions/:questionId/delete',
  ensureAuthenticated,
  ensureConsultant,
  async (req, res) => {
    try {
      const question = await Question.findByPk(req.params.questionId, {
        include: [{ model: Questionnaire, as: 'questionnaire' }],
      });

      if (!question || question.questionnaire.createdBy !== req.user.id) {
        req.flash('error', 'Question non trouvée ou non autorisée');
        return res.redirect('/questionnaires');
      }

      const { questionnaireId } = question;

      // Supprimer la question
      await question.destroy();

      req.flash('success', 'Question supprimée avec succès');
      res.redirect(`/questionnaires/${questionnaireId}/edit`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Une erreur est survenue lors de la suppression de la question');
      res.redirect('/questionnaires');
    }
  },
);

// Affichage d'un questionnaire pour le compléter (bénéficiaire)
router.get('/:id/complete', ensureAuthenticated, async (req, res) => {
  try {
    let questionnaire;
    let beneficiary;

    if (req.user.userType === 'beneficiary') {
      // Pour les bénéficiaires, trouver leur profil
      beneficiary = await Beneficiary.findOne({
        where: { userId: req.user.id },
      });

      if (!beneficiary) {
        req.flash('error', 'Profil bénéficiaire non trouvé');
        return res.redirect('/dashboard');
      }

      // Vérifier que le questionnaire est bien assigné à ce bénéficiaire
      questionnaire = await Questionnaire.findOne({
        where: {
          id: req.params.id,
          beneficiaryId: beneficiary.id,
        },
        include: [
          { model: User, as: 'creator' },
          { model: Question, as: 'questions', order: [['order', 'ASC']] },
        ],
      });
    } else {
      // Pour les consultants, vérifier qu'ils ont créé ce questionnaire
      questionnaire = await Questionnaire.findOne({
        where: {
          id: req.params.id,
          createdBy: req.user.id,
        },
        include: [
          { model: Beneficiary, as: 'beneficiary' },
          { model: Question, as: 'questions', order: [['order', 'ASC']] },
        ],
      });

      beneficiary = questionnaire ? questionnaire.beneficiary : null;
    }

    if (!questionnaire) {
      req.flash('error', 'Questionnaire non trouvé ou non autorisé');
      return res.redirect('/questionnaires');
    }

    // Récupérer les réponses existantes
    const answers = await Answer.findAll({
      where: {
        beneficiaryId: beneficiary.id,
        questionId: questionnaire.questions.map((q) => q.id),
      },
    });

    // Organiser les réponses par ID de question
    const answersByQuestionId = {};
    answers.forEach((answer) => {
      answersByQuestionId[answer.questionId] = answer;
    });

    res.render('questionnaires/complete', {
      title: `Questionnaire: ${questionnaire.title}`,
      questionnaire,
      answers: answersByQuestionId,
      user: req.user,
      isConsultant: req.user.userType === 'consultant',
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du chargement du questionnaire');
    res.redirect('/questionnaires');
  }
});

// Traitement des réponses au questionnaire
router.post('/:id/complete', ensureAuthenticated, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un bénéficiaire
    if (req.user.userType !== 'beneficiary') {
      req.flash('error', 'Seuls les bénéficiaires peuvent compléter les questionnaires');
      return res.redirect('/questionnaires');
    }

    // Trouver le profil bénéficiaire
    const beneficiary = await Beneficiary.findOne({
      where: { userId: req.user.id },
    });

    if (!beneficiary) {
      req.flash('error', 'Profil bénéficiaire non trouvé');
      return res.redirect('/dashboard');
    }

    // Vérifier que le questionnaire est bien assigné à ce bénéficiaire
    const questionnaire = await Questionnaire.findOne({
      where: {
        id: req.params.id,
        beneficiaryId: beneficiary.id,
      },
      include: [{ model: Question, as: 'questions' }],
    });

    if (!questionnaire) {
      req.flash('error', 'Questionnaire non trouvé ou non autorisé');
      return res.redirect('/questionnaires');
    }

    // Traiter les réponses
    for (const question of questionnaire.questions) {
      const value = req.body[`question_${question.id}`];

      if (value) {
        // Vérifier si une réponse existe déjà
        const existingAnswer = await Answer.findOne({
          where: {
            questionId: question.id,
            beneficiaryId: beneficiary.id,
          },
        });

        if (existingAnswer) {
          // Mettre à jour la réponse existante
          await existingAnswer.update({
            value,
            submittedAt: new Date(),
          });
        } else {
          // Créer une nouvelle réponse
          await Answer.create({
            value,
            questionId: question.id,
            beneficiaryId: beneficiary.id,
          });
        }
      }
    }

    // Mettre à jour le statut du questionnaire
    await questionnaire.update({
      status: 'completed',
    });

    req.flash('success', 'Questionnaire complété avec succès');
    res.redirect('/questionnaires');
  } catch (err) {
    console.error(err);
    req.flash('error', "Une erreur est survenue lors de l'enregistrement des réponses");
    res.redirect(`/questionnaires/${req.params.id}/complete`);
  }
});

// Affichage des résultats d'un questionnaire
router.get('/:id/results', ensureAuthenticated, ensureConsultant, async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findOne({
      where: {
        id: req.params.id,
        createdBy: req.user.id,
      },
      include: [
        { model: Beneficiary, as: 'beneficiary' },
        { model: Question, as: 'questions', order: [['order', 'ASC']] },
      ],
    });

    if (!questionnaire) {
      req.flash('error', 'Questionnaire non trouvé ou non autorisé');
      return res.redirect('/questionnaires');
    }

    // Récupérer les réponses
    const answers = await Answer.findAll({
      where: {
        beneficiaryId: questionnaire.beneficiaryId,
        questionId: questionnaire.questions.map((q) => q.id),
      },
    });

    // Organiser les réponses par ID de question
    const answersByQuestionId = {};
    answers.forEach((answer) => {
      answersByQuestionId[answer.questionId] = answer;
    });

    res.render('questionnaires/results', {
      title: `Résultats: ${questionnaire.title}`,
      questionnaire,
      answers: answersByQuestionId,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Une erreur est survenue lors du chargement des résultats');
    res.redirect('/questionnaires');
  }
});

module.exports = router;
