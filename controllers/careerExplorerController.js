const { Op } = require('sequelize');
const axios = require('axios');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const {
  Beneficiary,
  User,
  AiAnalysis,
  Activity,
  Credit,
  CareerExploration,
  Document,
} = require('../models');
const config = require('../config/constants');
const { updateUserCredits, deductCredits } = require('../utils/credits');
const { ensureConsultant, ensureBeneficiaryAccess } = require('../middlewares/auth');
const logger = require('../config/logger');
const aiService = require('../services/aiService');
const { getMockCareerOpportunities } = require('../utils/careerData');
const { logActivity, getRecentActivitiesFor } = require('../utils/activity');
const creditService = require('../services/creditService');
const { generateCareerExploration, analyzeCompetencies } = require('../services/aiService');
const { getOpenAIClient } = require('../services/openai');

// Credit cost for this AI feature
const CAREER_EXPLORER_CREDIT_COST = 5;

// Constants for credit costs
const CAREER_EXPLORATION_COST = 5; // 5 credits per career exploration

/**
 * Display the career explorer form
 */
exports.showForm = async (req, res) => {
  try {
    let beneficiary = null;

    // If beneficiary ID is provided, load the beneficiary data
    if (req.params.beneficiaryId) {
      beneficiary = await Beneficiary.findByPk(req.params.beneficiaryId, {
        include: [{ model: User, as: 'user' }],
      });

      if (!beneficiary) {
        req.flash('error', 'Bénéficiaire non trouvé');
        return res.redirect('/beneficiaries');
      }
    }

    res.render('career-explorer/form', {
      title: 'Explorateur de Carrière',
      beneficiary,
    });
  } catch (error) {
    console.error('Error in showForm:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement du formulaire');
    res.redirect('/dashboard');
  }
};

/**
 * Process career explorer form submission
 */
exports.processForm = async (req, res) => {
  try {
    const {
      currentRole,
      targetRole,
      yearsExperience,
      education,
      skills,
      experience,
      interests,
      preferences,
      beneficiaryId,
    } = req.body;

    // Validate required fields
    if (!currentRole || !targetRole) {
      req.flash('error', 'Veuillez remplir les champs obligatoires');
      return res.redirect(req.headers.referer || '/career-explorer');
    }

    let beneficiary = null;

    // If we're working with a specific beneficiary
    if (beneficiaryId) {
      beneficiary = await Beneficiary.findByPk(beneficiaryId);
      if (!beneficiary) {
        req.flash('error', 'Bénéficiaire non trouvé');
        return res.redirect('/beneficiaries');
      }

      // Check if the user has enough credits
      const hasEnoughCredits = await deductCredits(req.user.id, CAREER_EXPLORATION_COST);
      if (!hasEnoughCredits) {
        req.flash('error', 'Crédits insuffisants pour effectuer cette analyse');
        return res.redirect(req.headers.referer || '/career-explorer');
      }
    }

    // Generate the career exploration results (mock AI response for now)
    const results = generateCareerExplorationResults({
      currentRole,
      targetRole,
      yearsExperience,
      education,
      skills,
      experience,
      interests,
      preferences,
    });

    // If we have a beneficiary, save to database
    if (beneficiary) {
      const exploration = await CareerExploration.create({
        beneficiaryId: beneficiary.id,
        userId: req.user.id,
        currentRole,
        targetRole,
        yearsExperience: yearsExperience || null,
        education: education || null,
        skills: skills || null,
        experience: experience || null,
        interests: interests || null,
        preferences: preferences || null,
        results: JSON.stringify(results),
        saved: false,
      });

      // Render the results view with the generated data and exploration ID
      return res.render('career-explorer/results', {
        title: "Résultats d'Exploration de Carrière",
        results,
        beneficiary,
        exploration: exploration.get({ plain: true }),
        isSaved: false,
      });
    }

    // For anonymous explorations (no beneficiary), just show results without saving
    res.render('career-explorer/results', {
      title: "Résultats d'Exploration de Carrière",
      results,
    });
  } catch (error) {
    console.error('Error in processForm:', error);
    req.flash('error', 'Une erreur est survenue lors du traitement du formulaire');
    res.redirect(req.headers.referer || '/career-explorer');
  }
};

/**
 * Save career exploration results
 */
exports.saveResults = async (req, res) => {
  try {
    const { explorationId } = req.params;

    const exploration = await CareerExploration.findByPk(explorationId);
    if (!exploration) {
      req.flash('error', 'Exploration non trouvée');
      return res.redirect('/beneficiaries');
    }

    // Update the saved flag
    exploration.saved = true;
    await exploration.save();

    req.flash('success', "Résultats d'exploration sauvegardés avec succès");
    res.redirect(`/beneficiaries/${exploration.beneficiaryId}/career-explorations`);
  } catch (error) {
    console.error('Error in saveResults:', error);
    req.flash('error', 'Une erreur est survenue lors de la sauvegarde des résultats');
    res.redirect('/beneficiaries');
  }
};

/**
 * List all career explorations for a beneficiary
 */
exports.listExplorations = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;

    const beneficiary = await Beneficiary.findByPk(beneficiaryId, {
      include: [{ model: User, as: 'user' }],
    });

    if (!beneficiary) {
      req.flash('error', 'Bénéficiaire non trouvé');
      return res.redirect('/beneficiaries');
    }

    const explorations = await CareerExploration.findAll({
      where: {
        beneficiaryId,
        saved: true,
      },
      order: [['createdAt', 'DESC']],
    });

    res.render('career-explorer/list', {
      title: 'Explorations de Carrière',
      beneficiary: beneficiary.get({ plain: true }),
      explorations: explorations.map((e) => e.get({ plain: true })),
    });
  } catch (error) {
    console.error('Error in listExplorations:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement des explorations');
    res.redirect('/beneficiaries');
  }
};

/**
 * View a specific career exploration
 */
exports.viewExploration = async (req, res) => {
  try {
    const { explorationId } = req.params;

    const exploration = await CareerExploration.findByPk(explorationId, {
      include: [{ model: Beneficiary, include: [{ model: User, as: 'user' }] }],
    });

    if (!exploration) {
      req.flash('error', 'Exploration non trouvée');
      return res.redirect('/beneficiaries');
    }

    const explorationData = exploration.get({ plain: true });
    const results = JSON.parse(explorationData.results);

    res.render('career-explorer/results', {
      title: "Résultats d'Exploration de Carrière",
      results,
      beneficiary: explorationData.Beneficiary,
      exploration: explorationData,
      isSaved: true,
    });
  } catch (error) {
    console.error('Error in viewExploration:', error);
    req.flash('error', "Une erreur est survenue lors du chargement de l'exploration");
    res.redirect('/beneficiaries');
  }
};

/**
 * Generate mock career exploration results based on input data
 * In a real scenario, this would call an AI service
 */
function generateCareerExplorationResults(data) {
  // Extract the input data
  const { currentRole, targetRole, yearsExperience, skills } = data;

  // Generate sample career paths
  const careerPaths = [
    {
      title: `${currentRole} → Développeur ${targetRole} Junior → ${targetRole} Senior → Architecte ${targetRole}`,
      description: `Parcours progressif permettant de développer vos compétences en ${targetRole} tout en capitalisant sur votre expérience en ${currentRole}.`,
      timeframe: '3-5 ans',
      difficulty: 'Modérée',
    },
    {
      title: `${currentRole} → ${targetRole} Consultant → Chef de Projet ${targetRole}`,
      description: `Transition vers un rôle de conseil puis de management d'équipe spécialisée en ${targetRole}.`,
      timeframe: '2-4 ans',
      difficulty: 'Modérée à élevée',
    },
    {
      title: `Formation Intensive ${targetRole} → ${targetRole} Junior → ${targetRole} Indépendant`,
      description:
        "Reconversion accélérée suivie d'une période en entreprise avant de devenir consultant indépendant.",
      timeframe: '1-3 ans',
      difficulty: 'Élevée',
    },
  ];

  // Generate strengths based on current role and skills
  const strengths = [
    `Expertise technique en ${currentRole}`,
    'Compréhension des processus de développement logiciel',
    "Capacité d'adaptation à de nouveaux environnements techniques",
    'Vision systémique des projets informatiques',
  ];

  // Skills to improve for the target role
  const skillsToImprove = [
    `Maîtrise approfondie des frameworks ${targetRole}`,
    `Architecture logicielle orientée ${targetRole}`,
    `Optimisation des performances dans un contexte ${targetRole}`,
    `Tests et assurance qualité spécifiques à ${targetRole}`,
  ];

  // Recommended training
  const recommendedTraining = [
    {
      title: `Formation Certifiante ${targetRole}`,
      provider: 'OpenClassrooms',
      duration: '6 mois',
      format: 'En ligne, temps partiel',
    },
    {
      title: `Bootcamp Intensif ${targetRole}`,
      provider: 'Le Wagon',
      duration: '3 mois',
      format: 'Présentiel, temps plein',
    },
    {
      title: `Spécialisation ${targetRole} Avancé`,
      provider: 'Coursera',
      duration: '4 mois',
      format: 'En ligne, flexible',
    },
  ];

  // Generate skills analysis (distribution)
  const skillsAnalysis = {
    technical: {
      current: 65,
      required: 85,
      gap: 20,
    },
    methodological: {
      current: 70,
      required: 75,
      gap: 5,
    },
    soft: {
      current: 80,
      required: 70,
      gap: -10, // Already exceeds requirements
    },
    domain: {
      current: 60,
      required: 80,
      gap: 20,
    },
  };

  return {
    careerPaths,
    strengths,
    skillsToImprove,
    recommendedTraining,
    skillsAnalysis,
    summary: `Votre transition de ${currentRole} vers ${targetRole} est tout à fait réalisable en vous appuyant sur vos compétences techniques existantes et en développant une expertise spécifique dans les technologies ${targetRole}. Un parcours de formation de 3 à 6 mois suivi d'une première expérience professionnelle vous permettrait d'atteindre votre objectif dans un délai de 1 à 2 ans.`,
  };
}

/**
 * Display the career explorer form
 */
exports.showCareerExplorerForm = async (req, res) => {
  try {
    // Get user profile data to pre-fill the form if it exists
    let userProfile = {};

    if (req.user) {
      if (req.user.role === 'beneficiary') {
        const beneficiary = await Beneficiary.findOne({
          where: { UserId: req.user.id },
          include: [{ model: User }],
        });

        if (beneficiary) {
          userProfile = {
            currentPosition: beneficiary.currentPosition || '',
            skills: beneficiary.skills || '',
            educationLevel: beneficiary.educationLevel || '',
            yearsOfExperience: beneficiary.yearsOfExperience || '0-2',
            interests: beneficiary.interests || '',
            preferences: beneficiary.preferences || '',
          };
        }
      }
    }

    res.render('career-explorer/index', {
      title: 'Explorateur de Carrière',
      userProfile,
      user: req.user,
    });
  } catch (error) {
    console.error('Error loading career explorer form:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement du formulaire.');
    res.redirect('/dashboard');
  }
};

/**
 * Process career exploration request
 */
exports.processCareerExploration = async (req, res) => {
  try {
    const {
      currentPosition,
      skills,
      educationLevel,
      yearsOfExperience,
      interests,
      preferences,
      constraints,
    } = req.body;

    // Validate required fields
    if (!currentPosition || !skills || !educationLevel) {
      req.flash('error', 'Veuillez remplir tous les champs obligatoires.');
      return res.redirect('/career-explorer');
    }

    // Save or update user profile data if user is logged in
    if (req.user && req.user.role === 'beneficiary') {
      const beneficiary = await Beneficiary.findOne({
        where: { UserId: req.user.id },
      });

      if (beneficiary) {
        await beneficiary.update({
          currentPosition,
          skills,
          educationLevel,
          yearsOfExperience,
          interests,
          preferences: preferences || null,
        });
      }
    }

    // Get career opportunities based on user input
    const opportunities = await getMockCareerOpportunities({
      currentPosition,
      skills: skills.split(',').map((s) => s.trim()),
      educationLevel,
      yearsOfExperience,
      interests: interests.split(',').map((s) => s.trim()),
      preferences: preferences ? preferences.split(',').map((s) => s.trim()) : [],
      constraints: constraints ? constraints.split(',').map((s) => s.trim()) : [],
    });

    // Generate synthetic career analysis
    const careerAnalysis = generateCareerAnalysis(opportunities);

    // Generate global action plan
    const globalActionPlan = generateGlobalActionPlan(opportunities);

    // Log activity if user is logged in
    if (req.user) {
      logActivity(req.user.id, 'career_exploration', {
        currentPosition,
        totalOpportunities: opportunities.length,
      });
    }

    // Render results page
    res.render('career-explorer/results', {
      title: "Résultats de l'exploration de carrière",
      userProfile: {
        currentPosition,
        skills,
        educationLevel,
        yearsOfExperience,
        interests,
        preferences,
      },
      opportunities,
      careerAnalysis,
      globalActionPlan,
      continuingEducation: generateContinuingEducationRecommendations(opportunities),
      user: req.user,
    });
  } catch (error) {
    console.error('Error processing career exploration:', error);
    req.flash('error', 'Une erreur est survenue lors du traitement de votre demande.');
    res.redirect('/career-explorer');
  }
};

/**
 * Generate career analysis based on opportunities
 */
function generateCareerAnalysis(opportunities) {
  if (opportunities.length === 0) {
    return "Nous n'avons pas trouvé d'opportunités correspondant exactement à vos critères. Vous pourriez envisager d'élargir vos paramètres de recherche ou de consulter un conseiller pour une analyse plus approfondie de votre parcours professionnel.";
  }

  const topMatch = opportunities[0];
  const avgMatch =
    opportunities.reduce((sum, opp) => sum + opp.matchPercentage, 0) / opportunities.length;

  return `D'après notre analyse, votre profil présente une forte compatibilité avec le poste de ${topMatch.title} (${topMatch.matchPercentage}% de correspondance). 
  Vos compétences actuelles vous permettent d'envisager plusieurs directions professionnelles avec une compatibilité moyenne de ${Math.round(avgMatch)}%. 
  Ces opportunités s'appuient sur vos points forts tout en offrant des possibilités d'évolution et de développement de nouvelles compétences.`;
}

/**
 * Generate global action plan based on opportunities
 */
function generateGlobalActionPlan(opportunities) {
  if (opportunities.length === 0) {
    return [];
  }

  return [
    {
      title: 'Validation des compétences clés',
      timeframe: 'Court terme (1-3 mois)',
      description:
        'Identifiez les compétences communes requises dans les opportunités présentées et validez votre niveau actuel via une auto-évaluation ou une certification.',
    },
    {
      title: 'Développement des compétences manquantes',
      timeframe: 'Moyen terme (3-6 mois)',
      description: `Suivez une formation dans les domaines identifiés comme essentiels pour le poste de ${opportunities[0].title}.`,
    },
    {
      title: 'Mise en réseau professionnelle',
      timeframe: 'Continu',
      description:
        'Établissez des contacts avec des professionnels du secteur via LinkedIn ou des événements professionnels pour comprendre les réalités du métier.',
    },
    {
      title: 'Validation du projet professionnel',
      timeframe: 'Moyen terme (3-6 mois)',
      description:
        "Effectuez un bilan de compétences complet ou une période d'immersion professionnelle pour confirmer votre intérêt et aptitude pour ces orientations.",
    },
  ];
}

/**
 * Generate continuing education recommendations
 */
function generateContinuingEducationRecommendations(opportunities) {
  if (opportunities.length === 0) {
    return 'Consultez un conseiller en formation pour établir un parcours personnalisé.';
  }

  const topSkills = new Set();
  opportunities.slice(0, 3).forEach((opp) => {
    if (opp.requiredSkills) {
      const skills =
        typeof opp.requiredSkills === 'string'
          ? opp.requiredSkills.split(',').map((s) => s.trim())
          : opp.requiredSkills;

      skills.forEach((skill) => topSkills.add(skill));
    }
  });

  return `Pour renforcer votre employabilité, nous vous recommandons de vous concentrer sur les compétences suivantes : ${Array.from(topSkills).join(', ')}. 
  Des formations certifiantes dans ces domaines, accessibles via votre Compte Personnel de Formation (CPF), vous permettraient de valoriser votre profil professionnel.`;
}

/**
 * Display career explorer results
 */
exports.showResults = async (req, res) => {
  try {
    const { id: beneficiaryId, analysisId } = req.params;

    const analysis = await AiAnalysis.findOne({
      where: {
        id: analysisId,
        beneficiaryId,
        type: 'career-explorer',
      },
      include: [{ model: Beneficiary }],
    });

    if (!analysis) {
      req.flash('error', 'Analyse non trouvée');
      return res.redirect(`/beneficiaries/${beneficiaryId}/career-explorer`);
    }

    const results = JSON.parse(analysis.results);
    const input = JSON.parse(analysis.input);

    res.render('career-explorer/results', {
      analysis: analysis.get({ plain: true }),
      results,
      input,
      beneficiaryId,
      title: "Résultats de l'Explorateur de Carrière",
    });
  } catch (error) {
    console.error('Error showing career explorer results:', error);
    req.flash('error', "Une erreur est survenue lors de l'affichage des résultats");
    res.redirect(`/beneficiaries/${req.params.id}/career-explorer`);
  }
};

/**
 * Render the career explorer form
 */
exports.showExplorerForm = async (req, res) => {
  const { beneficiaryId } = req.params;
  let beneficiary = null;

  // If we have a beneficiary ID, fetch their details
  if (beneficiaryId) {
    try {
      beneficiary = await Beneficiary.findByPk(beneficiaryId, {
        include: [{ model: User }],
      });

      if (!beneficiary) {
        req.flash('error', 'Bénéficiaire non trouvé');
        return res.redirect('/beneficiaries');
      }
    } catch (error) {
      console.error('Error fetching beneficiary:', error);
      req.flash('error', 'Erreur lors du chargement des données du bénéficiaire');
      return res.redirect('/beneficiaries');
    }
  }

  res.render('career-explorer/form', {
    title: 'Explorateur de Carrière IA',
    beneficiary,
    user: req.user,
  });
};

/**
 * Process the form submission and generate career exploration results
 */
exports.processExploration = async (req, res) => {
  try {
    const {
      currentRole,
      targetRole,
      yearsExperience,
      education,
      skills,
      relevantExperience,
      interests,
      workPreferences,
      beneficiaryId,
    } = req.body;

    // Validate required fields
    if (!currentRole || !targetRole) {
      req.flash('error', 'Les champs Poste actuel et Poste visé sont obligatoires');
      return res.redirect(
        beneficiaryId ? `/career-explorer/beneficiary/${beneficiaryId}` : '/career-explorer',
      );
    }

    // Prepare input data for AI analysis
    const inputData = {
      currentRole,
      targetRole,
      yearsExperience,
      education,
      skills,
      relevantExperience,
      interests,
      workPreferences,
    };

    // Get results from OpenAI API
    const results = await generateAICareerExploration(inputData);

    // Save exploration to database
    const exploration = await CareerExploration.create({
      beneficiaryId: beneficiaryId || null,
      consultantId: req.user.id,
      input: inputData,
      results,
    });

    // Log activity
    if (beneficiaryId) {
      await logActivity({
        userId: req.user.id,
        beneficiaryId,
        type: 'career_exploration',
        description: `A créé une exploration de carrière: ${currentRole} → ${targetRole}`,
        data: { explorationId: exploration.id },
      });
    }

    // Redirect to results page
    res.redirect(`/career-explorer/results/${exploration.id}`);
  } catch (error) {
    console.error('Error processing career exploration:', error);
    req.flash('error', 'Une erreur est survenue lors du traitement de votre demande');
    res.redirect(
      req.body.beneficiaryId
        ? `/career-explorer/beneficiary/${req.body.beneficiaryId}`
        : '/career-explorer',
    );
  }
};

// Display career exploration results
exports.showResults = async (req, res) => {
  try {
    const { id } = req.params;

    const exploration = await CareerExploration.findByPk(id);

    if (!exploration) {
      req.flash('error', 'Exploration de carrière non trouvée');
      return res.redirect('/dashboard');
    }

    // Check if the user has access to this exploration
    // (Admin, the consultant who created it, or a consultant for the same beneficiary)
    if (
      req.user.role !== 'admin' &&
      exploration.consultantId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      // TODO: Implement more sophisticated permission checking if needed
      req.flash('error', "Vous n'avez pas accès à cette exploration");
      return res.redirect('/dashboard');
    }

    // If it's for a beneficiary, include beneficiary info
    let beneficiary = null;
    if (exploration.beneficiaryId) {
      beneficiary = await Beneficiary.findByPk(exploration.beneficiaryId, {
        include: [{ model: User }],
      });
    }

    res.render('career-explorer/results', {
      title: "Résultats d'Exploration de Carrière",
      exploration,
      beneficiary,
      user: req.user,
    });
  } catch (error) {
    console.error('Error displaying career exploration results:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement des résultats');
    res.redirect('/dashboard');
  }
};

// List all explorations for a specific beneficiary
exports.listBeneficiaryExplorations = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;

    const beneficiary = await Beneficiary.findByPk(beneficiaryId, {
      include: [{ model: User }],
    });

    if (!beneficiary) {
      req.flash('error', 'Bénéficiaire non trouvé');
      return res.redirect('/beneficiaries');
    }

    const explorations = await CareerExploration.findAll({
      where: { beneficiaryId },
      order: [['createdAt', 'DESC']],
    });

    res.render('career-explorer/list', {
      title: 'Explorations de Carrière',
      beneficiary,
      explorations,
      user: req.user,
    });
  } catch (error) {
    console.error('Error listing career explorations:', error);
    req.flash('error', 'Une erreur est survenue lors du chargement des explorations');
    res.redirect('/beneficiaries');
  }
};

// Generate career exploration using AI
async function generateAICareerExploration(inputData) {
  const openai = getOpenAIClient();

  try {
    const {
      currentRole,
      targetRole,
      yearsExperience,
      education,
      skills,
      relevantExperience,
      interests,
      workPreferences,
    } = inputData;

    // Construct the prompt
    const prompt = `
Tu es un expert en orientation professionnelle travaillant pour un centre de bilan de compétences en France. 
Analyse le profil professionnel suivant et fournis une exploration de carrière détaillée.

PROFIL DU CANDIDAT:
- Poste actuel: ${currentRole}
- Poste/domaine visé: ${targetRole}
- Années d'expérience: ${yearsExperience || 'Non spécifié'}
- Niveau d'éducation: ${education || 'Non spécifié'}
- Compétences: ${skills || 'Non spécifiées'}
- Expérience pertinente: ${relevantExperience || 'Non spécifiée'}
- Intérêts professionnels: ${interests || 'Non spécifiés'}
- Préférences de travail: ${workPreferences || 'Non spécifiées'}

Fournis une analyse complète et structurée au format JSON avec les sections suivantes:
1. careerPaths: Un tableau de 3 à 5 parcours professionnels recommandés (avec title, description, compatibility en pourcentage, timeline)
2. strengths: Un tableau de points forts identifiés (avec title et description)
3. skillsToImprove: Un tableau de compétences à développer (avec title et description)
4. recommendedTraining: Un tableau de formations recommandées (avec title, description, duration, priority)
5. skillsAnalysis: Un tableau d'analyses par catégorie de compétences (avec category et un tableau skills contenant name et level de 1 à 10)
6. summary: Un résumé concis de l'analyse globale
7. nextSteps: Un tableau d'actions recommandées à court et moyen terme

Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un conseiller expert en orientation professionnelle et bilan de compétences',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    // Parse the response
    const { content } = response.choices[0].message;

    try {
      const jsonMatch = content.match(/({[\s\S]*})/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw content:', content);

      // Return a fallback response if parsing fails
      return {
        error: 'Impossible de générer une analyse complète. Veuillez réessayer.',
        rawResponse: `${content.substring(0, 500)}...`, // Truncated for logging
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      error: "Une erreur est survenue lors de la génération de l'analyse par l'IA.",
      message: error.message,
    };
  }
}
