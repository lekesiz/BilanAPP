// const { fn, col } = require('sequelize'); // Kullanılmadığı için kaldırıldı
const {
  Beneficiary,
  User,
  Questionnaire,
  Question,
  Answer,
  Credit,
  AiAnalysis,
  Appointment,
} = require('../models');
const { logCreditChange } = require('../services/creditService');
const aiService = require('../services/aiService'); // Correct import
const { incrementAiUsage } = require('../middlewares/limits');
// const { checkAiLimit, checkAndDeductCredits } = require('../middlewares/credits'); // Kullanılmadığı için kaldırıldı

// ------ SYNTHESIS GENERATOR ------

// GET /ai/synthesis-generator - Display the synthesis generator UI
exports.showSynthesisGenerator = async (req, res) => {
  try {
    const whereClause = { consultantId: req.user.id };
    if (req.user.forfaitType === 'Admin') {
      delete whereClause.consultantId; // Admin can see all beneficiaries
    }

    const beneficiaries = await Beneficiary.findAll({
      where: whereClause,
      include: {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName'],
      },
      order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
    });

    res.render('ai/synthesis-generator', {
      title: 'Générateur de Synthèse IA',
      user: req.user,
      beneficiaries: beneficiaries.map((b) => b.get({ plain: true })),
      aiCredits: 20, // Cost of one synthesis generation
      selectedBeneficiaryId: req.query.beneficiaryId || '',
    });
  } catch (error) {
    console.error('Synthesis Generator UI error:', error);
    req.flash('error_msg', "Erreur lors du chargement de l'outil de synthèse.");
    res.redirect('/dashboard');
  }
};

// POST /ai/synthesis-generator - Handle synthesis generation request
exports.generateSynthesis = async (req, res) => {
  const { beneficiaryId, instructions } = req.body;

  try {
    // Validate input
    if (!beneficiaryId) {
      req.flash('error_msg', 'Bénéficiaire non spécifié.');
      return res.redirect('/ai/synthesis-generator');
    }

    // Check user access
    const whereClause = { id: beneficiaryId };
    if (req.user.forfaitType !== 'Admin') {
      whereClause.consultantId = req.user.id;
    }

    // Fetch beneficiary with necessary data
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
      req.flash('error_msg', 'Bénéficiaire non trouvé ou accès non autorisé.');
      return res.redirect('/ai/synthesis-generator');
    }

    // Process instructions/customization if provided
    const customInstructions = instructions ? { customInstructions: instructions } : {};
    const beneficiaryData = {
      ...beneficiary.toJSON(),
      user: beneficiary.user.toJSON(),
      ...customInstructions,
    };

    // Generate synthesis
    const generatedText = await aiService.generateSynthesisDraft(beneficiaryData);

    // Update beneficiary with generated text if requested
    if (req.body.updateBeneficiary === 'true') {
      await beneficiary.update({ synthesis: generatedText });
      req.flash('success_msg', 'Synthèse générée et enregistrée pour le bénéficiaire.');
    }

    // Log usage
    await incrementAiUsage(req.user.id);
    await logCreditChange(
      req.user.id,
      -20,
      'AI_GENERATE_SYNTHESIS',
      `Génération synthèse IA pour ${beneficiary.user.firstName}`,
      null,
      beneficiaryId,
      'Beneficiary',
    );

    // Return result page
    res.render('ai/synthesis-result', {
      title: 'Synthèse Générée',
      user: req.user,
      beneficiary: beneficiary.get({ plain: true }),
      generatedText,
      wasSaved: req.body.updateBeneficiary === 'true',
    });
  } catch (error) {
    console.error('Synthesis generation error:', error);
    req.flash('error_msg', `Erreur de génération: ${error.message}`);
    res.redirect('/ai/synthesis-generator');
  }
};

// ------ ACTION PLAN GENERATOR ------

// GET /ai/action-plan-generator - Display the action plan generator UI
exports.showActionPlanGenerator = async (req, res) => {
  try {
    const whereClause = { consultantId: req.user.id };
    if (req.user.forfaitType === 'Admin') {
      delete whereClause.consultantId;
    }

    const beneficiaries = await Beneficiary.findAll({
      where: whereClause,
      include: {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName'],
      },
      order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
    });

    res.render('ai/action-plan-generator', {
      title: "Générateur de Plan d'Action IA",
      user: req.user,
      beneficiaries: beneficiaries.map((b) => b.get({ plain: true })),
      aiCredits: 15, // Cost of one action plan generation
      selectedBeneficiaryId: req.query.beneficiaryId || '',
    });
  } catch (error) {
    console.error('Action Plan Generator UI error:', error);
    req.flash('error_msg', "Erreur lors du chargement de l'outil de plan d'action.");
    res.redirect('/dashboard');
  }
};

// POST /ai/action-plan-generator - Handle action plan generation request
exports.generateActionPlan = async (req, res) => {
  const { beneficiaryId, instructions } = req.body;

  try {
    // Validate input
    if (!beneficiaryId) {
      req.flash('error_msg', 'Bénéficiaire non spécifié.');
      return res.redirect('/ai/action-plan-generator');
    }

    // Check user access
    const whereClause = { id: beneficiaryId };
    if (req.user.forfaitType !== 'Admin') {
      whereClause.consultantId = req.user.id;
    }

    // Fetch beneficiary with necessary data
    const beneficiary = await Beneficiary.findOne({
      where: whereClause,
      include: [{ model: User, as: 'user' }],
    });

    if (!beneficiary) {
      req.flash('error_msg', 'Bénéficiaire non trouvé ou accès non autorisé.');
      return res.redirect('/ai/action-plan-generator');
    }

    // Process instructions/customization if provided
    const customInstructions = instructions ? { customInstructions: instructions } : {};
    const beneficiaryData = {
      ...beneficiary.toJSON(),
      user: beneficiary.user.toJSON(),
      ...customInstructions,
    };

    // Generate action plan
    const actionPlanResult = await aiService.generateActionPlan(beneficiaryData);

    // Update beneficiary with generated text if requested
    if (req.body.updateBeneficiary === 'true') {
      await beneficiary.update({ actionPlan: JSON.stringify(actionPlanResult) });
      req.flash('success_msg', "Plan d'action généré et enregistré pour le bénéficiaire.");
    }

    // Log usage
    await incrementAiUsage(req.user.id);
    await logCreditChange(
      req.user.id,
      -15,
      'AI_GENERATE_ACTIONPLAN',
      `Génération plan d'action IA pour ${beneficiary.user.firstName}`,
      null,
      beneficiaryId,
      'Beneficiary',
    );

    // Return result page
    res.render('ai/action-plan-result', {
      title: "Plan d'Action Généré",
      user: req.user,
      beneficiary: beneficiary.get({ plain: true }),
      actionPlan: JSON.stringify(actionPlanResult),
      wasSaved: req.body.updateBeneficiary === 'true',
    });
  } catch (error) {
    console.error('Action plan generation error:', error);
    req.flash('error_msg', `Erreur de génération: ${error.message}`);
    res.redirect('/ai/action-plan-generator');
  }
};

// ------ CAREER EXPLORER ------

// GET /ai/career-explorer - Display the career explorer UI
exports.showCareerExplorer = (req, res) => {
  res.render('ai/career-explorer', {
    title: 'Explorateur de Carrières IA',
    user: req.user,
    aiCredits: 10, // Example cost for career exploration
  });
};

// POST /ai/career-explorer - Handle career exploration request
exports.exploreCareer = async (req, res) => {
  const {
    skills, interests, constraints, educationLevel,
  } = req.body;

  try {
    // Validate input
    if (!skills && !interests) {
      req.flash('error_msg', 'Veuillez spécifier des compétences ou des intérêts.');
      return res.redirect('/ai/career-explorer');
    }

    // Call AI service (to be implemented)
    // const careerSuggestions = await aiService.exploreCareerOptions(skills, interests, constraints, educationLevel);

    // For now, return a placeholder
    const careerSuggestions = {
      message:
        "L'explorateur de carrières est en cours de développement. " +
        "Cette fonctionnalité sera disponible prochainement.",
      suggestions: [
        {
          title: 'Exemple de carrière 1',
          description: 'Description du métier, compétences requises, etc.',
          matchScore: 85,
          educationRequired: 'Bac+3',
        },
        {
          title: 'Exemple de carrière 2',
          description: 'Description du métier, compétences requises, etc.',
          matchScore: 70,
          educationRequired: 'Bac+2',
        },
      ],
    };

    // Log usage (commented until implementation is complete)
    // await incrementAiUsage(req.user.id);
    // await logCreditChange(req.user.id, -COST, 'AI_CAREER_EXPLORATION', 'Exploration de carrière IA');

    // Return results page
    res.render('ai/career-explorer-result', {
      title: 'Résultats Exploration de Carrière',
      user: req.user,
      careerSuggestions,
      inputs: {
        skills,
        interests,
        constraints,
        educationLevel,
      },
    });
  } catch (error) {
    console.error('Career exploration error:', error);
    req.flash(
        'error_msg', 
        `Erreur d'exploration: ${error.message}`
    );
    res.redirect('/ai/career-explorer');
  }
};

// ------ COMPETENCY ANALYZER ------

// GET /ai/competency-analyzer - Display the competency analyzer UI
exports.showCompetencyAnalyzer = (req, res) => {
  res.render('ai/competency-analyzer', {
    title: 'Analyseur de Compétences IA',
    user: req.user,
    aiCredits: 10, // Cost of competency analysis
  });
};

// POST /ai/competency-analyzer - Handle competency analysis request
exports.analyzeCompetencies = async (req, res) => {
  const { cvText, jobDescription } = req.body;

  try {
    // Validate input
    if (!cvText || !jobDescription) {
      req.flash('error_msg', 'Veuillez fournir le texte du CV et la description du poste.');
      return res.redirect('/ai/competency-analyzer');
    }

    // Call AI service (to be implemented)
    // const analysisResults = await aiService.analyzeCompetencies(cvText, jobDescription);

    // For now, return a placeholder
    const analysisResult = await aiService.generateCompetencyAnalysis(cvText, jobDescription);

    // Log usage (commented until implementation is complete)
    // await incrementAiUsage(req.user.id);
    // await logCreditChange(req.user.id, -COST, 'AI_COMPETENCY_ANALYSIS', 'Analyse de compétences IA');

    // Return results page
    res.render('ai/competency-analyzer-result', {
      title: 'Résultats Analyse de Compétences',
      user: req.user,
      analysisResult,
      inputs: {
        cvText: `${cvText.substring(0, 100)}...`,
        jobDescription: `${jobDescription.substring(0, 100)}...`,
      },
    });
  } catch (error) {
    console.error('Competency analysis error:', error);
    req.flash('error_msg',
      `Erreur d'analyse: ${error.message}`
    );
    res.redirect('/ai/competency-analyzer');
  }
};

// Helper to check if user has enough credits
const hasEnoughCredits = async (userId, creditCost) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Credit }],
  });

  if (!user || !user.Credit) return false;
  return user.Credit.balance >= creditCost;
};

// Helper to deduct credits from user
const deductCredits = async (userId, creditAmount, description) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Credit }],
  });

  if (!user || !user.Credit) throw new Error('Utilisateur ou crédits non trouvés');

  user.Credit.balance -= creditAmount;
  await user.Credit.save();

  // TODO: Add transaction record
  console.log(`Débité ${creditAmount} crédits pour: ${description}`);

  return user.Credit.balance;
};

// Mock function to generate competency analysis results
const generateCompetencyAnalysis = (cvText, jobDescription) => {
  // This would be replaced with actual AI API call

  // Calculate a pseudo-random match score between 20-90%
  const matchScore = Math.floor(Math.random() * 70) + 20;

  // Generate some mock strengths based on CV text
  const cvKeywords = cvText.toLowerCase().match(/\b\w{5,}\b/g) || [];
  const strengths = cvKeywords
    .filter((word, index) => index % 4 === 0 && index < 20)
    .map((word) => ({
      skill: word.charAt(0).toUpperCase() + word.slice(1),
      comment: `Expérience démontrée en ${word}.`,
    }))
    .slice(0, 5);

  // Generate some mock gaps based on job description
  const jobKeywords = jobDescription.toLowerCase().match(/\b\w{5,}\b/g) || [];
  const gaps = jobKeywords
    .filter((word, index) => index % 3 === 0 && index < 15)
    .filter((word) => !cvText.toLowerCase().includes(word))
    .map((word) => ({
      skill: word.charAt(0).toUpperCase() + word.slice(1),
      comment: 'Compétence requise mais non identifiée dans le CV.',
    }))
    .slice(0, 5);

  // Generate mock recommendations
  const recommendations = {
    objectives: [
      `Développer des compétences en ${gaps[0]?.skill || 'communication'}`,
      `Renforcer l'expertise en ${gaps[1]?.skill || 'gestion de projet'}`,
      `Acquérir une certification en ${gaps[2]?.skill || 'méthodologie agile'}`,
    ],
    trainings: [
      `Formation en ${gaps[0]?.skill || 'communication'} (35 heures)`,
      `Atelier pratique de ${gaps[1]?.skill || 'gestion de projet'} (21 heures)`,
      `Cours en ligne sur ${gaps[2]?.skill || 'méthodologie agile'} (14 heures)`,
    ],
    experiences: [
      `Participer à un projet impliquant ${gaps[0]?.skill || 'communication'}`,
      `Prendre en charge un rôle de ${gaps[1]?.skill || 'gestion de projet'}`,
      `Contribuer à une équipe utilisant ${gaps[2]?.skill || 'méthodologie agile'}`,
    ],
  };

  let summaryText = 'Le candidat présente des écarts significatifs par rapport aux exigences du poste.';
  if (matchScore >= 70) {
    summaryText = 'Le candidat possède la majorité des compétences requises.';
  } else if (matchScore >= 40) {
    summaryText = 'Le candidat a plusieurs compétences clés mais certaines lacunes importantes.';
  }
  const summary = 
      `Le profil correspond à ${matchScore}% des exigences du poste. ${summaryText}`;

  return {
    matchScore,
    summary,
    strengths,
    gaps,
    strengthsCount: strengths.length,
    gapsCount: gaps.length,
    recommendations,
    cvTextSummary: `${cvText.substring(0, 150)}...`,
    jobDescriptionSummary: `${jobDescription.substring(0, 150)}...`,
  };
};

// Simulated AI analysis using a mock function
// In production, this would call an actual LLM API
const performAiAnalysis = async (type, data) => {
  console.log(`Performing ${type} analysis with data:`, data);

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Placeholder for actual AI analysis results
  switch (type) {
    case 'competency-analyzer':
      return generateCompetencyAnalysis(data.cvText, data.jobDescription);
    // Add other analysis types here
    default:
      throw new Error("Type d'analyse non supporté");
  }
};

// Controller methods
exports.getCompetencyAnalyzer = async (req, res) => {
  try {
    // Get beneficiaries for the consultant to select from
    const beneficiaries = await Beneficiary.findAll({
      where: {
        consultantId: req.user.id,
      },
      attributes: ['id', 'firstName', 'lastName'],
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC'],
      ],
    });

    res.render('ai/competency-analyzer', {
      beneficiaries,
      creditCost: 5,
      user: req.user,
    });
  } catch (error) {
    console.error('Error in getCompetencyAnalyzer:', error);
    req.flash('error',
      "Une erreur est survenue lors du chargement de l'analyseur de compétences.",
    );
    res.redirect('/dashboard');
  }
};

exports.postCompetencyAnalyzer = async (req, res) => {
  try {
    const {
      beneficiaryId, cvText, jobDescription, saveToNotes,
    } = req.body;
    const creditCost = 5;

    // Validate inputs
    if (!cvText || !jobDescription) {
      req.flash('error', 'Veuillez fournir à la fois le CV et la description du poste.');
      return res.redirect('/ai/competency-analyzer');
    }

    // Validate beneficiary if provided
    if (beneficiaryId) {
      const beneficiary = await Beneficiary.findOne({
        where: {
          id: beneficiaryId,
          consultantId: req.user.id,
        },
      });

      if (!beneficiary) {
        req.flash('error', 'Bénéficiaire non trouvé ou non autorisé.');
        return res.redirect('/ai/competency-analyzer');
      }
    }

    // Check credits
    const hasSufficientCredits = await hasEnoughCredits(req.user.id, creditCost);
    if (!hasSufficientCredits) {
      req.flash('error',
        `Crédits insuffisants. Cette analyse requiert ${creditCost} crédits.`,
      );
      return res.redirect('/ai/competency-analyzer');
    }

    // Perform analysis
    const analysisResult = await performAiAnalysis('competency-analyzer', {
      cvText,
      jobDescription,
    });

    // Deduct credits
    await deductCredits(
      req.user.id,
      creditCost,
      `Analyse de compétences${beneficiaryId ? ` pour bénéficiaire #${beneficiaryId}` : ''}`,
    );

    // Save analysis if requested
    let analysisId = null;
    if (saveToNotes === 'true' && beneficiaryId) {
      const analysis = await AiAnalysis.create({
        type: 'competency-analyzer',
        beneficiaryId,
        consultantId: req.user.id,
        data: JSON.stringify(analysisResult),
        createdAt: new Date(),
      });
      analysisId = analysis.id;
    }

    // Render results page
    return res.render('ai/competency-analyzer-result', {
      ...analysisResult,
      beneficiaryId: beneficiaryId || null,
      analysisId,
      canSave: saveToNotes !== 'true' && beneficiaryId,
      user: req.user,
    });
  } catch (error) {
    console.error('Error in postCompetencyAnalyzer:', error);
    req.flash('error',
      "Une erreur est survenue lors de l'analyse des compétences.",
    );
    res.redirect('/ai/competency-analyzer');
  }
};

exports.saveCompetencyAnalysis = async (req, res) => {
  try {
    const { beneficiaryId, analysisId } = req.body;

    // Validate inputs
    if (!beneficiaryId) {
      req.flash('error', 'Identifiant du bénéficiaire manquant.');
      return res.redirect('/ai/competency-analyzer');
    }

    // Fetch the beneficiary
    const beneficiary = await Beneficiary.findOne({
      where: {
        id: beneficiaryId,
        consultantId: req.user.id,
      },
    });

    if (!beneficiary) {
      req.flash('error', 'Bénéficiaire non trouvé ou non autorisé.');
      return res.redirect('/ai/competency-analyzer');
    }

    // If we have an analysisId, fetch it from DB
    // Otherwise this would be a new save of results from the current session
    let analysisResults;
    if (analysisId) {
      const analysis = await AiAnalysis.findOne({
        where: {
          id: analysisId,
          beneficiaryId,
          consultantId: req.user.id,
        },
      });

      if (!analysis) {
        req.flash('error', 'Analyse non trouvée ou non autorisée.');
        return res.redirect('/ai/competency-analyzer');
      }

      analysisResults = JSON.parse(analysis.data);
    } else {
      // This would handle saving from session data
      req.flash('error', "Données d'analyse non disponibles.");
      return res.redirect('/ai/competency-analyzer');
    }

    // Create a note with the analysis results
    // This is a placeholder - in a real app you would update the beneficiary notes
    console.log(`Saving analysis results to beneficiary #${beneficiaryId} notes`);

    // Flash success and redirect to results page with saved flag
    req.flash('success', 'Analyse sauvegardée dans les notes du bénéficiaire.');
    return res.render('ai/competency-analyzer-result', {
      ...analysisResults,
      beneficiaryId,
      analysisId,
      saved: true,
      message: 'Analyse sauvegardée avec succès.',
      user: req.user,
    });
  } catch (error) {
    console.error('Error in saveCompetencyAnalysis:', error);
    req.flash('error',
      "Une erreur est survenue lors de la sauvegarde de l'analyse.",
    );
    res.redirect('/ai/competency-analyzer');
  }
};

// ------ STRATEGY PLAN GENERATOR ------

// GET /ai/strategy-plan-generator - Display the strategy plan generator UI
exports.showStrategyPlanGenerator = async (req, res) => {
  try {
    const whereClause = { consultantId: req.user.id };
    if (req.user.forfaitType === 'Admin') {
      delete whereClause.consultantId;
    }

    const beneficiaries = await Beneficiary.findAll({
      where: whereClause,
      include: {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName'],
      },
      order: [[{ model: User, as: 'user' }, 'lastName', 'ASC']],
    });

    res.render('ai/strategy-plan-generator', {
      title: 'Générateur de Plan Stratégique IA',
      user: req.user,
      beneficiaries: beneficiaries.map((b) => b.get({ plain: true })),
      aiCredits: 15, // Cost of one strategy plan generation
      selectedBeneficiaryId: req.query.beneficiaryId || '',
    });
  } catch (error) {
    console.error('Strategy Plan Generator UI error:', error);
    req.flash('error_msg', "Erreur lors du chargement de l'outil de plan stratégique.");
    res.redirect('/dashboard');
  }
};

// POST /ai/strategy-plan-generator - Handle strategy plan generation request
exports.generateStrategyPlan = async (req, res) => {
  const {
    beneficiaryId, instructions, skills, careerGoals, timeframe,
  } = req.body;

  try {
    // Validate input
    if (!beneficiaryId) {
      req.flash('error_msg', 'Bénéficiaire non spécifié.');
      return res.redirect('/ai/strategy-plan-generator');
    }

    // Check user access
    const whereClause = { id: beneficiaryId };
    if (req.user.forfaitType !== 'Admin') {
      whereClause.consultantId = req.user.id;
    }

    // Fetch beneficiary with necessary data
    const beneficiary = await Beneficiary.findOne({
      where: whereClause,
      include: [
        { model: User, as: 'user' },
        {
          model: AiAnalysis,
          where: { type: 'competency-analyzer' },
          required: false,
          order: [['createdAt', 'DESC']],
          limit: 1,
        },
      ],
    });

    if (!beneficiary) {
      req.flash('error_msg', 'Bénéficiaire non trouvé ou accès non autorisé.');
      return res.redirect('/ai/strategy-plan-generator');
    }

    // Process instructions/customization if provided
    const customInstructions = instructions ? { customInstructions: instructions } : {};
    const planData = {
      beneficiary: beneficiary.toJSON(),
      user: beneficiary.user.toJSON(),
      skills: skills || beneficiary.identifiedSkills || '',
      careerGoals: careerGoals || beneficiary.careerObjectives || '',
      timeframe: timeframe || '6-12 months',
      competencyAnalysis:
        beneficiary.AiAnalyses && beneficiary.AiAnalyses.length > 0 ?
          JSON.parse(beneficiary.AiAnalyses[0].data) :
          null,
      ...customInstructions,
    };

    // Generate strategy plan
    const strategyPlan = await aiService.generateStrategyPlan(planData);

    // Update beneficiary with generated text if requested
    if (req.body.updateBeneficiary === 'true') {
      await beneficiary.update({ strategyPlan: JSON.stringify(strategyPlan) });
      req.flash('success_msg', 'Plan stratégique généré et enregistré pour le bénéficiaire.');
    }

    // Log usage
    await incrementAiUsage(req.user.id);
    await logCreditChange(
      req.user.id,
      -15,
      'AI_GENERATE_STRATEGYPLAN',
      `Génération plan stratégique IA pour ${beneficiary.user.firstName}`,
      null,
      beneficiaryId,
      'Beneficiary',
    );

    // Return result page
    res.render('ai/strategy-plan-result', {
      title: 'Plan Stratégique Généré',
      user: req.user,
      beneficiary: beneficiary.get({ plain: true }),
      strategyPlan,
      wasSaved: req.body.updateBeneficiary === 'true',
    });
  } catch (error) {
    console.error('Strategy plan generation error:', error);
    req.flash('error_msg', `Erreur de génération: ${error.message}`);
    res.redirect('/ai/strategy-plan-generator');
  }
};

module.exports = exports;
