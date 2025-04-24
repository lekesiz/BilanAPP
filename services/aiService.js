const OpenAI = require('openai');
// const axios = require('axios'); // Kullanılmadığı için kaldırıldı
// const { Beneficiary } = require('../models'); // Kullanılmadığı için kaldırıldı
// const config = require('../config/constants'); // Kullanılmadığı için kaldırıldı

// ÖNEMLİ NOT: Bu kodun çalışması için:
// 1. `npm install openai` komutunu çalıştırın.
// 2. OpenAI API anahtarınızı projenin kök dizinindeki `.env` dosyasına
//    `OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx` şeklinde ekleyin.
// 3. `app.js` veya başlangıç dosyanızda `require('dotenv').config();` olduğundan emin olun.

let openai;
try {
  // API anahtarını ortam değişkenlerinden yükle
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API Key bulunamadı. AI özellikleri çalışmayacak.');
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI client başarıyla başlatıldı.');
  }
} catch (error) {
  console.error('OpenAI client başlatılırken hata:', error);
  openai = null; // Hata durumunda null yap
}

// Helper function to format date (already in handlebars helpers, but useful here too)
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR');
  } catch (e) {
    return '';
  }
}

// Anket cevaplarını özetleyen yardımcı fonksiyon (geliştirildi)
function summarizeAnswers(questionnaires) {
  if (!questionnaires || questionnaires.length === 0)
    return 'Aucun questionnaire pertinent trouvé.';

  const summaries = [];
  questionnaires.forEach((q) => {
    if (q.status === 'completed' && q.questions && q.questions.length > 0) {
      const keyPoints = [];
      q.questions.forEach((question) => {
        if (question.answers && question.answers.length > 0) {
          const answerText = question.answers[0].answer;
          keyPoints.push(
            `- ${question.text}: ${answerText.substring(0, 100)}${answerText.length > 100 ? '...' : ''}`,
          );
        }
      });

      if (keyPoints.length > 0) {
        summaries.push(
          `**Questionnaire '${q.title}' (${q.category || 'Non Catégorisé'}):**\n${keyPoints.join('\n')}`,
        );
      }
    }
  });

  if (summaries.length === 0) {
    return 'Aucun questionnaire pertinent complété ou avec réponses trouvées.';
  }

  return summaries.join('\n\n');
}

// Sentezden önerileri çıkaran basit bir fonksiyon
function extractRecommendations(synthesisText) {
  if (!synthesisText) return '[Consulter la synthèse]';
  // Çok basit bir arama, gerçek senaryoda daha iyi bir NLP gerekebilir
  const match = synthesisText.match(/## 7\. Conclusion et Préconisations([\s\S]*)/);
  return match && match[1]
    ? `${match[1].trim().substring(0, 300)}...`
    : '[Voir préconisations dans la synthèse]';
}

// --- Career Exploration Helpers ---
function generateCareerPathsFromSkills(skills /*, experience, preferences*/) {
  // This would be a sophisticated AI algorithm in production
  // For demo, we'll use simple logic based on common skill/career mappings

  const paths = [];

  // Sample career paths based on skills
  if (
    skills.includes('programming') ||
    skills.includes('coding') ||
    skills.includes('development')
  ) {
    paths.push({
      title: 'Software Developer',
      match: '92%',
      description: 'Design, develop and maintain software applications and systems',
      commonTransitions: ['Technical Lead', 'Software Architect', 'DevOps Engineer'],
      outlook: 'Strong growth projected through 2030',
    });
  }

  if (
    skills.includes('communication') ||
    skills.includes('management') ||
    skills.includes('leadership')
  ) {
    paths.push({
      title: 'Project Manager',
      match: '88%',
      description:
        'Plan, execute, and oversee projects to ensure they are completed on time and within budget',
      commonTransitions: ['Program Manager', 'Operations Director', 'Business Analyst'],
      outlook: 'Stable demand across industries',
    });
  }

  if (
    skills.includes('design') ||
    skills.includes('creativity') ||
    skills.includes('user experience')
  ) {
    paths.push({
      title: 'UX/UI Designer',
      match: '90%',
      description: 'Create intuitive, engaging user experiences for digital products',
      commonTransitions: ['Product Designer', 'Creative Director', 'Design Strategist'],
      outlook: 'Growing demand in tech and digital sectors',
    });
  }

  if (skills.includes('data') || skills.includes('analysis') || skills.includes('statistics')) {
    paths.push({
      title: 'Data Analyst',
      match: '87%',
      description: 'Interpret data to improve business decisions and performance',
      commonTransitions: ['Data Scientist', 'Business Intelligence Analyst', 'Research Analyst'],
      outlook: 'High demand across all industries',
    });
  }

  // Add default career paths if none match
  if (paths.length === 0) {
    paths.push({
      title: 'Business Analyst',
      match: '82%',
      description: 'Analyze business needs and develop solutions to drive business improvement',
      commonTransitions: ['Project Manager', 'Product Manager', 'Systems Analyst'],
      outlook: 'Steady growth expected',
    });

    paths.push({
      title: 'Marketing Specialist',
      match: '78%',
      description: 'Develop and implement marketing strategies to promote products or services',
      commonTransitions: ['Marketing Manager', 'Brand Manager', 'Digital Marketing Specialist'],
      outlook: 'Evolving with digital transformation',
    });
  }

  return paths;
}

function extractStrengths(skills /*, experience*/) {
  // In production, this would use sophisticated analysis
  // For demo, we'll return sample strengths based on input
  const strengths = [];

  if (skills.includes('communication')) strengths.push('Effective Communicator');
  if (skills.includes('leadership')) strengths.push('Leadership Potential');
  if (skills.includes('problem solving')) strengths.push('Problem-Solving Aptitude');
  if (skills.includes('teamwork')) strengths.push('Collaborative Team Player');
  if (skills.includes('coding') || skills.includes('programming'))
    strengths.push('Technical Proficiency');
  if (skills.includes('creativity')) strengths.push('Creative Thinking');
  if (skills.includes('analysis')) strengths.push('Analytical Mindset');

  // Ensure at least some strengths are returned
  if (strengths.length < 3) {
    const defaultStrengths = ['Adaptability', 'Learning Agility', 'Professional Demeanor'];
    for (const strength of defaultStrengths) {
      if (strengths.length < 3) strengths.push(strength);
    }
  }

  return strengths;
}

function suggestSkillsForDevelopment(/* preferences */) {
  const developmentAreas = [];
  if (developmentAreas.length < 2) {
    developmentAreas.push('Digital Literacy');
    developmentAreas.push('Project Management');
    developmentAreas.push('Effective Communication');
  }
  return developmentAreas;
}

function generateRecommendations(careerPaths /*, data*/) {
  // Generate recommendations based on career paths and user data
  const recommendations = [];

  // Training recommendations
  recommendations.push({
    type: 'training',
    title: 'Recommended Training',
    items: [
      `Professional certification in ${careerPaths[0]?.title || 'your field of interest'}`,
      'Soft skills development workshop',
      'Technical skills enhancement course',
    ],
  });

  // Networking recommendations
  recommendations.push({
    type: 'networking',
    title: 'Networking Opportunities',
    items: [
      `Industry conferences related to ${careerPaths[0]?.title || 'your field'}`,
      'Professional associations membership',
      'LinkedIn groups and connections in target industry',
    ],
  });

  // Job search recommendations
  recommendations.push({
    type: 'jobSearch',
    title: 'Job Search Strategy',
    items: [
      `Resume optimization for ${careerPaths[0]?.title || 'target roles'}`,
      'Portfolio development showcasing relevant projects',
      'Interview preparation specific to the industry',
    ],
  });

  return recommendations;
}

// --- Competency Analysis Helpers ---
function extractCurrentCompetencies(skills /*, experience*/) {
  // In production, this would analyze skills and experience in depth
  // For demo, we'll return a simplified competency assessment

  const competencies = [];

  // Technical competencies
  const technicalSkills = skills.filter((skill) =>
    ['programming', 'coding', 'development', 'data', 'analysis', 'design'].includes(skill),
  );

  if (technicalSkills.length > 0) {
    competencies.push({
      category: 'Technical',
      skills: technicalSkills.map((skill) => ({
        name: skill,
        level: 'Proficient',
        description: `Demonstrated capability in ${skill} through professional experience`,
      })),
    });
  }

  // Soft competencies
  const softSkills = skills.filter((skill) =>
    ['communication', 'teamwork', 'leadership', 'problem solving', 'creativity'].includes(skill),
  );

  if (softSkills.length > 0) {
    competencies.push({
      category: 'Soft Skills',
      skills: softSkills.map((skill) => ({
        name: skill,
        level: 'Advanced',
        description: `Strong ${skill} abilities demonstrated across roles`,
      })),
    });
  }

  // Add default competencies if none found
  if (competencies.length === 0) {
    competencies.push({
      category: 'General',
      skills: [
        {
          name: 'Adaptability',
          level: 'Proficient',
          description: 'Ability to adjust to new conditions and requirements',
        },
        {
          name: 'Professional Communication',
          level: 'Intermediate',
          description: 'Effective written and verbal communication skills',
        },
      ],
    });
  }

  return competencies;
}

function getTargetCompetencies(targetRole) {
  // This would be based on industry standards and job market data in production
  // For demo, we'll use predefined competencies for common roles

  const roleCompetencies = {
    'Software Developer': [
      {
        name: 'Programming',
        level: 'Advanced',
        description: 'Proficiency in multiple programming languages',
      },
      {
        name: 'Problem Solving',
        level: 'Advanced',
        description: 'Ability to debug and solve complex technical issues',
      },
      {
        name: 'Version Control',
        level: 'Advanced',
        description: 'Experience with Git and collaborative development',
      },
    ],
    'Project Manager': [
      {
        name: 'Team Leadership',
        level: 'Advanced',
        description: 'Ability to lead cross-functional teams effectively',
      },
      {
        name: 'Stakeholder Management',
        level: 'Advanced',
        description: 'Experience managing diverse stakeholder expectations',
      },
      {
        name: 'Risk Management',
        level: 'Advanced',
        description: 'Identifying and mitigating project risks',
      },
    ],
    'Data Analyst': [
      {
        name: 'Data Visualization',
        level: 'Advanced',
        description: 'Creating insightful data visualizations',
      },
      {
        name: 'Statistical Analysis',
        level: 'Advanced',
        description: 'Applying statistical methods to data',
      },
      {
        name: 'SQL',
        level: 'Advanced',
        description: 'Writing complex queries to extract insights from databases',
      },
    ],
    'UX/UI Designer': [
      {
        name: 'User Research',
        level: 'Advanced',
        description: 'Conducting and analyzing user research',
      },
      {
        name: 'Prototyping',
        level: 'Advanced',
        description: 'Creating interactive prototypes for testing',
      },
      {
        name: 'Visual Design',
        level: 'Advanced',
        description: 'Creating visually appealing and functional interfaces',
      },
    ],
  };

  // Return competencies for the target role or default set
  return (
    roleCompetencies[targetRole] || [
      {
        name: 'Communication',
        level: 'Advanced',
        description: 'Clear and effective communication skills',
      },
      {
        name: 'Critical Thinking',
        level: 'Advanced',
        description: 'Analyzing situations and making sound decisions',
      },
      {
        name: 'Collaboration',
        level: 'Advanced',
        description: 'Working effectively with diverse teams',
      },
    ]
  );
}

function identifyCompetencyGaps(data) {
  // In production, this would compare current skills with required skills for target role
  // For demo, we'll return sample gaps

  // Generate some plausible gaps based on target role
  if (data.targetRole === 'Software Developer') {
    return [
      {
        name: 'Cloud Architecture',
        description: 'Knowledge of cloud deployment models and services',
      },
      {
        name: 'Agile Methodologies',
        description: 'Experience with Scrum or Kanban frameworks',
      },
    ];
  }
  if (data.targetRole === 'Project Manager') {
    return [
      {
        name: 'Budget Management',
        description: 'Experience managing project budgets and finances',
      },
      {
        name: 'Agile Certification',
        description: 'Formal certification in Agile methodologies',
      },
    ];
  }
  if (data.targetRole === 'Data Analyst') {
    return [
      {
        name: 'Programming in R',
        description: 'Experience with R for statistical analysis',
      },
      {
        name: 'Machine Learning',
        description: 'Understanding of basic machine learning principles',
      },
    ];
  }
  if (data.targetRole === 'UX/UI Designer') {
    return [
      {
        name: 'User Testing Methodologies',
        description: 'Experience conducting formal usability tests',
      },
      {
        name: 'Design Systems',
        description: 'Experience creating and maintaining design systems',
      },
    ];
  }

  // Default gaps
  return [
    {
      name: 'Industry-Specific Knowledge',
      description: 'Deeper understanding of industry standards and practices',
    },
    {
      name: 'Leadership Experience',
      description: 'Experience leading teams or initiatives',
    },
  ];
}

function createDevelopmentPlan(data) {
  // In production, this would create a personalized plan based on gaps and goals
  // For demo, we'll return a sample development plan

  const shortTermActions = [
    `Complete online course on ${data.targetRole || 'target field'}`,
    `Join professional community related to ${data.targetRole || 'your interests'}`,
    'Work on personal project to demonstrate skills',
  ];

  const mediumTermActions = [
    'Pursue relevant certification or formal education',
    'Seek mentorship from industry professional',
    'Attend workshops and networking events',
  ];

  const longTermActions = [
    'Transition to role with more relevant responsibilities',
    'Lead projects that develop target competencies',
    'Build portfolio of achievements in target area',
  ];

  return {
    shortTerm: shortTermActions,
    mediumTerm: mediumTermActions,
    longTerm: longTermActions,
    estimatedTimeframe: '6-12 months',
  };
}

/**
 * Verilen bilgilere göre Bilan de Compétences sentez taslağı oluşturur.
 * @param {object} beneficiaryData Yararlanıcı verileri.
 * @returns {Promise<string>} Oluşturulan sentez taslağı metni.
 */
async function generateSynthesisDraft(beneficiaryData) {
  if (!openai) return Promise.reject('OpenAI client non initialisé. Vérifiez la clé API.');

  const prompt = `
        **Tâche:** Rédiger une ébauche de **Synthèse de Bilan de Compétences** pour le bénéficiaire ci-dessous, en suivant la structure réglementaire (Code du Travail R6313-7) et les exigences Qualiopi.
        Le document doit être objectif, précis, confidentiel et utiliser un langage clair et accessible.
        Utiliser le **markdown** pour la structure (titres ##, listes -, gras **).
        Laisser des sections **[Analyse/Conclusion Consultant à ajouter]** pour l'intervention humaine.

        **Bénéficiaire:** ${beneficiaryData.user?.firstName || ''} ${beneficiaryData.user?.lastName || ''}

        **Informations Fournies (à intégrer et synthétiser):**
        - Parcours (Formation/Expérience): ${beneficiaryData.education || 'Non renseigné'} / ${beneficiaryData.experience || 'Non renseigné'}
        - Compétences clés identifiées: ${beneficiaryData.identifiedSkills || 'À détailler lors des entretiens'}
        - Projet(s) Professionnel(s) envisagé(s): ${beneficiaryData.careerObjectives || 'À explorer'}
        - Contexte/Demande Initiale: ${beneficiaryData.notes || 'Standard'}
        - Synthèse des Questionnaires: ${summarizeAnswers(beneficiaryData.assignedQuestionnaires)}

        **Structure Exigée:**

        ## 1. Circonstances Actuelles et Demande Initiale
        - Contexte professionnel et personnel du bénéficiaire au début du bilan.
        - Objectifs initiaux exprimés par le bénéficiaire.
        - Modalités de déroulement convenues (dates: ${formatDate(beneficiaryData.bilanStartDate)} au ${formatDate(beneficiaryData.bilanEndDate)}, lieu(x), convention signée le ${formatDate(beneficiaryData.agreementDate)}).
        
        ## 2. Parcours Professionnel et Formation
        - Synthèse chronologique et analytique des expériences professionnelles marquantes.
        - Principaux diplômes et formations.
        - [Analyse consultant sur la dynamique du parcours à ajouter]

        ## 3. Compétences et Aptitudes Professionnelles et Personnelles
        - Identification et description des compétences techniques (savoir-faire) et transversales (savoir-être).
        - Aptitudes clés (autonomie, adaptation, etc.).
        - Éléments issus de l'auto-évaluation et des questionnaires (si disponibles).
        - [Validation et approfondissement par le consultant]

        ## 4. Intérêts Professionnels, Motivations et Valeurs
        - Synthèse des intérêts professionnels majeurs.
        - Analyse des principales sources de motivation au travail.
        - Valeurs professionnelles importantes.
        - [Synthèse des résultats des tests/questionnaires spécifiques à ajouter]

        ## 5. Identification du/des Projet(s) Professionnel(s)
        - Description détaillée du projet principal (et éventuellement alternatif) : ${beneficiaryData.careerObjectives || '[Projet principal à définir]'}
        - Analyse de la cohérence du projet avec le profil (compétences, intérêts, valeurs).
        - Évaluation de la faisabilité (opportunités marché, contraintes personnelles).
        - [Analyse approfondie et validation du projet par le consultant]

        ## 6. Principaux Atouts et Points de Vigilance
        - Récapitulatif des points forts du bénéficiaire en lien avec le projet.
        - Identification des freins potentiels et des points de vigilance.
        - Besoins en développement de compétences.

        ## 7. Conclusions Détaillées et Préconisations
        - Réponse argumentée à la demande initiale.
        - Facteurs susceptibles de favoriser la réalisation du projet.
        - Préconisations d'actions concrètes (formations, VAE, démarches réseau...). 
        - [Conclusion finale du consultant à ajouter]

        **Instruction Initiale:** Commence le document par: "[SYNTHÈSE DU BILAN DE COMPÉTENCES - ${new Date().toLocaleDateString('fr-FR')} - ÉBAUCHE IA À VALIDER]"
    `;

  try {
    console.log('SYNTHESIS - Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un expert en bilans de compétences et rédacteur de synthèses conformes Qualiopi.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    console.log('SYNTHESIS - Received response from OpenAI.');
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('SYNTHESIS - Error calling OpenAI API:', error);
    throw new Error("Erreur lors de la communication avec l'API OpenAI pour la synthèse.");
  }
}

/**
 * Verilen bilgilere göre Aksiyon Planı taslağı oluşturur.
 * @param {object} beneficiaryData Yararlanıcı verileri.
 * @returns {Promise<string>} Oluşturulan aksiyon planı taslağı metni.
 */
async function generateActionPlanDraft(beneficiaryData) {
  if (!openai) return Promise.reject('OpenAI client non initialisé. Vérifiez la clé API.');

  const prompt = `
        **Tâche:** Rédiger une ébauche de **Plan d'Action** post-bilan de compétences, structuré et orienté **SMART**.
        Ce plan doit être concret et aider le bénéficiaire à passer à l'action.

        **Informations Disponibles:**
        - Bénéficiaire: ${beneficiaryData.user?.firstName || ''} ${beneficiaryData.user?.lastName || ''}
        - Projet(s) Retenu(s): ${beneficiaryData.careerObjectives || '[Projet principal à confirmer]'}
        - Préconisations issues de la Synthèse: ${beneficiaryData.synthesis ? extractRecommendations(beneficiaryData.synthesis) : 'Consulter la synthèse'}
        - Compétences à développer / Points de vigilance: (Se référer à la synthèse)

        **Structure Demandée (utiliser markdown gras ## et listes):**

        ## 1. Rappel du Projet Professionnel Principal
        - [Reformulation claire et concise de l'objectif professionnel validé]

        ## 2. Actions Prioritaires (Court Terme: 0-6 mois)
        *(Pour chaque action, définir Objectif SMART, Moyens, Échéance Précise, Indicateur de succès)*
        - **Action 1:** [Ex: Se renseigner sur la formation X]
            - *Objectif:* Obtenir le programme détaillé et les modalités de financement.
            - *Moyens:* Site web de l'organisme, contact téléphonique.
            - *Échéance:* JJ/MM/AAAA
            - *Indicateur:* Programme et devis reçus.
        - **Action 2:** [Ex: Contacter 3 professionnels du secteur Y]
            - *Objectif:* Mieux comprendre la réalité du métier et développer son réseau.
            - *Moyens:* LinkedIn, réseau personnel, annuaires.
            - *Échéance:* JJ/MM/AAAA
            - *Indicateur:* 3 entretiens informatifs réalisés.
        - **Action 3:** [Ex: Mettre à jour le CV]
            - *Objectif:* Adapter le CV au projet professionnel visé.
            - *Moyens:* Atelier CV, relecture par le consultant.
            - *Échéance:* JJ/MM/AAAA
            - *Indicateur:* CV finalisé et validé.
        - *[Générer 1-2 autres actions pertinentes basées sur les préconisations si possible]*

        ## 3. Actions Secondaires (Moyen Terme: 6-12 mois)
        - [Action 4]
        - [Action 5]

        ## 4. Ressources et Appuis
        - [Identifier contacts clés, organismes, aides financières...]

        ## 5. Modalités de Suivi
        - Point d'étape prévu avec le consultant le: [Date/Fréquence]
        - Entretien de suivi obligatoire à 6 mois le: ${formatDate(beneficiaryData.followUpDate)}

        **Instruction Initiale:** Commence par: "[PLAN D'ACTION POST-BILAN - ${new Date().toLocaleDateString('fr-FR')} - ÉBAUCHE IA À VALIDER ET PERSONNALISER]"
        Utilise un ton encourageant et motivant.
    `;

  try {
    console.log('ACTION PLAN - Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: "Tu es un coach professionnel expert en plans d'action SMART.",
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    console.log('ACTION PLAN - Received response from OpenAI.');
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('ACTION PLAN - Error calling OpenAI API:', error);
    throw new Error("Erreur lors de la communication avec l'API OpenAI pour le plan d'action.");
  }
}

/**
 * Explores career possibilities based on user's skills, interests, and constraints.
 * @param {object} explorationData User's skills, interests, and other parameters.
 * @returns {Promise<object>} Object containing career suggestions.
 */
async function exploreCareer(explorationData) {
  if (!openai) return Promise.reject('OpenAI client non initialisé. Vérifiez la clé API.');

  const {
    skills = '',
    interests = '',
    constraints = '',
    educationLevel = '',
    experience = '',
  } = explorationData;

  const prompt = `
        **Tâche:** En tant qu'expert en orientation professionnelle, analyse les informations du bénéficiaire ci-dessous et propose des pistes de carrière adaptées. Utilise une approche objective basée sur l'adéquation entre le profil et les métiers suggérés.

        **Informations sur le bénéficiaire:**
        - Compétences: ${skills}
        - Intérêts professionnels: ${interests}
        - Contraintes éventuelles: ${constraints}
        - Niveau d'éducation: ${educationLevel}
        - Expérience: ${experience}

        **Instructions:**
        1. Identifie 3 à 5 pistes de carrière pertinentes basées sur les informations fournies.
        2. Pour chaque piste, indique:
           - Le titre du métier/poste
           - Une brève description
           - Le taux de correspondance (en pourcentage)
           - Formation/éducation requise
           - Compétences clés nécessaires (avec indication de celles déjà possédées)
           - Recommandations spécifiques pour accéder à ce poste

        Format ta réponse en JSON structuré selon ce modèle:
        \`\`\`json
        {
            "suggestions": [
                {
                    "title": "Titre du métier",
                    "description": "Description concise du poste et de ses responsabilités",
                    "matchScore": 85,
                    "educationRequired": "Formation nécessaire",
                    "keySkills": ["Compétence 1", "Compétence 2", "Compétence 3"],
                    "recommendations": ["Recommandation 1", "Recommandation 2"]
                }
            ]
        }
        \`\`\`
    `;

  try {
    console.log('CAREER EXPLORER - Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            "Tu es un conseiller en orientation professionnelle expert, spécialisé dans l'analyse de profils et la recommandation de carrières adaptées.",
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    console.log('CAREER EXPLORER - Received response from OpenAI.');

    // Parse the JSON response
    const content = completion.choices[0].message.content.trim();
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('CAREER EXPLORER - Error parsing OpenAI JSON response:', parseError);
      return {
        message: "Une erreur est survenue lors de l'analyse des résultats. Veuillez réessayer.",
        suggestions: [],
      };
    }
  } catch (error) {
    console.error('CAREER EXPLORER - Error calling OpenAI API:', error);
    throw new Error(
      "Erreur lors de la communication avec l'API OpenAI pour l'exploration de carrière.",
    );
  }
}

/**
 * Analyzes a beneficiary's skills and experience to generate AI-assisted career recommendations
 *
 * @param {Object} data - Data object containing skills, experience, preferences, etc.
 * @returns {Promise<Object>} - Career exploration results
 */
exports.generateCareerExploration = async (data) => {
  try {
    // For demo purposes, we'll simulate an AI response
    // In production, this would call an actual AI API endpoint

    // Simulated processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate sample career paths based on provided skills and experience
    const careerPaths = generateCareerPathsFromSkills(data.skills);

    return {
      careerPaths,
      skills: {
        strengths: extractStrengths(data.skills),
        areasForDevelopment: suggestSkillsForDevelopment(),
      },
      recommendations: generateRecommendations(careerPaths),
    };
  } catch (error) {
    console.error('Error in AI career exploration:', error);
    throw new Error('Failed to generate career exploration analysis');
  }
};

/**
 * Analyzes competencies and skill gaps for career development
 *
 * @param {Object} data - Data object containing current skills, target role, etc.
 * @returns {Promise<Object>} - Competency analysis results
 */
exports.analyzeCompetencies = async (data) => {
  try {
    // For demo purposes, we'll simulate an AI response
    // In production, this would call an actual AI API endpoint

    // Simulated processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return {
      currentCompetencies: extractCurrentCompetencies(data.skills),
      targetCompetencies: getTargetCompetencies(data.targetRole),
      gaps: identifyCompetencyGaps(data),
      developmentPlan: createDevelopmentPlan(data),
    };
  } catch (error) {
    console.error('Error in AI competency analysis:', error);
    throw new Error('Failed to analyze competencies');
  }
};

/**
 * Generates a personalized career and training strategy plan based on competency analysis.
 * @param {object} planData Data including beneficiary information, skills, career goals, etc.
 * @returns {Promise<object>} Object containing the generated strategy plan.
 */
async function generateStrategyPlan(planData) {
  if (!openai) return Promise.reject('OpenAI client non initialisé. Vérifiez la clé API.');

  const {
    beneficiary,
    user,
    skills = '',
    careerGoals = '',
    timeframe = '6-12 months',
    competencyAnalysis = null,
    customInstructions = '',
  } = planData;

  // Prepare skills data from competency analysis if available
  let skillsData = skills;
  let gapsData = '';

  if (competencyAnalysis) {
    if (competencyAnalysis.strengths && competencyAnalysis.strengths.length > 0) {
      skillsData += `\nPoints forts identifiés: ${competencyAnalysis.strengths
        .map((s) => s.skill)
        .join(', ')}`;
    }

    if (competencyAnalysis.gaps && competencyAnalysis.gaps.length > 0) {
      gapsData = `Lacunes identifiées: ${competencyAnalysis.gaps.map((g) => g.skill).join(', ')}`;
    }
  }

  const prompt = `
        **Tâche:** Générer un Plan Stratégique de Carrière et Formation personnalisé pour un bénéficiaire de bilan de compétences.
        
        **Bénéficiaire:**
        - Nom: ${user?.firstName || ''} ${user?.lastName || ''}
        - Compétences actuelles: ${skillsData}
        ${gapsData ? `- ${gapsData}` : ''}
        - Objectifs professionnels: ${careerGoals}
        - Horizon temporel: ${timeframe}
        ${customInstructions ? `\n**Instructions spécifiques:** ${customInstructions}` : ''}
        
        **Format demandé:** JSON structuré selon le modèle suivant:
        \`\`\`json
        {
            "summary": "Résumé exécutif du plan stratégique en 2-3 phrases",
            "careerPath": {
                "primary": "Objectif principal de carrière",
                "alternative": "Plan B si l'objectif principal rencontre des obstacles",
                "timeline": "Estimation du temps nécessaire pour atteindre l'objectif principal",
                "keyMilestones": ["Étape 1", "Étape 2", "Étape 3"]
            },
            "skillDevelopment": {
                "priorities": ["Compétence prioritaire 1", "Compétence prioritaire 2", "Compétence prioritaire 3"],
                "recommendedTraining": [
                    {
                        "name": "Nom de la formation",
                        "focus": "Compétence(s) ciblée(s)",
                        "duration": "Durée estimée",
                        "importance": "Critique/Importante/Complémentaire"
                    }
                ]
            },
            "marketStrategy": {
                "targetSectors": ["Secteur 1", "Secteur 2"],
                "networkingActions": ["Action réseau 1", "Action réseau 2"],
                "personalBranding": ["Conseil 1", "Conseil 2"]
            },
            "implementation": {
                "shortTerm": ["Action immédiate 1", "Action immédiate 2"],
                "mediumTerm": ["Action à moyen terme 1", "Action à moyen terme 2"],
                "longTerm": ["Action à long terme 1", "Action à long terme 2"]
            },
            "successMetrics": ["Métrique 1", "Métrique 2", "Métrique 3"]
        }
        \`\`\`
        
        **Instructions supplémentaires:**
        1. Les compétences prioritaires doivent être directement liées aux objectifs et combler les lacunes identifiées.
        2. Les formations recommandées doivent être réalistes et spécifiques.
        3. La stratégie de marché doit tenir compte des tendances actuelles.
        4. Les actions d'implémentation doivent être SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporellement définies).
        5. Les métriques de succès doivent permettre d'évaluer clairement les progrès.
    `;

  try {
    console.log('STRATEGY PLAN - Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un conseiller en développement de carrière et stratégie professionnelle expert.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    console.log('STRATEGY PLAN - Received response from OpenAI.');

    // Parse the JSON response
    const content = completion.choices[0].message.content.trim();
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('STRATEGY PLAN - Error parsing OpenAI JSON response:', parseError);
      return {
        error: "Une erreur est survenue lors de l'analyse des résultats. Veuillez réessayer.",
        rawContent: content,
      };
    }
  } catch (error) {
    console.error('STRATEGY PLAN - Error calling OpenAI API:', error);
    throw new Error("Erreur lors de la communication avec l'API OpenAI pour le plan stratégique.");
  }
}

module.exports = {
  generateSynthesisDraft,
  generateActionPlanDraft,
  exploreCareer,
  generateStrategyPlan,
};
