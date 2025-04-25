/**
 * Utility functions for career data and mock career opportunities
 */

// Helper Functions - Moved Up
/**
 * Generate mock career opportunities based on user profile
 * In a production environment, this would be replaced with an actual AI call
 * @param {Object} userProfile - User's professional profile
 * @returns {Array} Array of career opportunities
 */
exports.getMockCareerOpportunities = async (userProfile) => {
  // Extract profile data
  const { skills, educationLevel, yearsOfExperience } = userProfile;

  // Base set of opportunities
  const opportunities = [
    {
      title: 'Responsable Développement Durable',
      shortDescription:
        'Élaborer et mettre en œuvre des stratégies de développement durable pour les entreprises.',
      description:
        "En tant que Responsable Développement Durable, vous serez au cœur de la transformation écologique de l'entreprise. Vous élaborerez la politique RSE, piloterez des projets d'optimisation des ressources et de réduction de l'empreinte carbone, tout en assurant la conformité réglementaire. Votre rôle sera également de sensibiliser les équipes internes et de valoriser les engagements de l'entreprise auprès des parties prenantes externes.",
      sector: 'Environnement et RSE',
      marketTrend: 'En forte croissance',
      matchPercentage: 85,
      requiredSkills: [
        'Connaissances des normes environnementales',
        'Gestion de projet',
        'Communication',
        'Analyse de données',
        'Capacité à fédérer',
      ],
      training:
        'Master en développement durable, environnement ou RSE + formations certifiantes (ISO 14001, Bilan Carbone®)',
      salary: "45 000€ - 70 000€ selon l'expérience et la taille de l'entreprise",
      advantages: [
        "Métier porteur de sens et d'impact positif",
        'Diversité des missions et des interlocuteurs',
        "Fort potentiel d'évolution dans un secteur en pleine expansion",
        'Reconnaissance croissante au sein des organisations',
      ],
      challenges: [
        'Faire face à des résistances au changement',
        'Concilier objectifs économiques et environnementaux',
        'Se tenir constamment informé des évolutions réglementaires',
      ],
      careerPath:
        "Généralement, ce poste est accessible après 5 à 8 ans d'expérience, souvent en passant par des fonctions de chargé de mission environnement ou consultant RSE. L'expertise sectorielle et la maîtrise des certifications environnementales sont des atouts majeurs.",
      growthProspects:
        "Les évolutions possibles incluent des postes de Direction RSE dans de grands groupes, de consultant senior en cabinet spécialisé, ou d'entrepreneur dans l'économie verte. La dimension internationale de ces carrières est également en plein essor.",
    },
    {
      title: 'Consultant en Transformation Digitale',
      shortDescription:
        'Accompagner les entreprises dans leur transition numérique en optimisant leurs processus et en intégrant de nouvelles technologies.',
      description:
        "Le Consultant en Transformation Digitale guide les organisations dans leur évolution vers le numérique. Vous analyserez les besoins, établirez des feuilles de route stratégiques et accompagnerez le changement à tous les niveaux de l'entreprise. Votre expertise sera sollicitée pour identifier les technologies pertinentes, optimiser les processus existants et former les équipes aux nouveaux outils et méthodes de travail.",
      sector: 'Conseil et Technologies',
      marketTrend: 'Marché stable avec forte demande',
      matchPercentage: 92,
      requiredSkills: [
        'Compréhension des enjeux business',
        'Connaissance des technologies digitales',
        'Gestion du changement',
        'Communication',
        'Résolution de problèmes complexes',
      ],
      training:
        "Formation supérieure en management, technologies de l'information ou ingénierie + certifications (Agile, ITIL, etc.)",
      salary: "50 000€ - 90 000€ selon l'expérience et le cabinet",
      advantages: [
        'Environnement de travail stimulant et varié',
        'Exposition à différents secteurs et problématiques',
        'Rémunération attractive',
        'Développement constant de compétences à forte valeur ajoutée',
      ],
      challenges: [
        'Rythme de travail intense avec déplacements fréquents',
        'Nécessité de se former continuellement aux nouvelles technologies',
        'Gestion de la résistance au changement chez les clients',
      ],
      careerPath:
        "Ce poste est généralement accessible après un parcours dans l'IT, le management de projet ou le conseil. Une expérience de 3 à 5 ans dans un rôle opérationnel suivi d'une évolution vers des fonctions plus stratégiques constitue un parcours typique.",
      growthProspects:
        "Les perspectives incluent des postes de directeur de la transformation digitale, de partner dans un cabinet de conseil, ou d'entrepreneur dans les services numériques. L'expertise développée est également valorisée pour des postes de direction générale dans les entreprises technologiques.",
    },
    {
      title: 'Chef de Projet IA & Data',
      shortDescription:
        "Piloter des projets d'intelligence artificielle et de data science pour optimiser les processus et créer de la valeur business.",
      description:
        "En tant que Chef de Projet IA & Data, vous orchestrez le développement et le déploiement de solutions d'intelligence artificielle et d'analyse de données. Vous traduisez les besoins métiers en spécifications techniques, coordonnez les équipes de data scientists et développeurs, et assurez la livraison de produits à forte valeur ajoutée. Votre rôle est crucial pour transformer les données en insights actionnables et en avantages compétitifs.",
      sector: 'Technologies / IA',
      marketTrend: 'En très forte croissance',
      matchPercentage: 88,
      requiredSkills: [
        'Gestion de projet agile',
        "Compréhension des concepts d'IA et de data science",
        'Communication avec des parties prenantes diverses',
        'Vision produit',
        'Résolution de problèmes complexes',
      ],
      training:
        'Formation en informatique, data science, ou management + certifications en gestion de projet (PMP, PRINCE2, PSM) et data (Microsoft, AWS, Google Cloud)',
      salary: "55 000€ - 85 000€ selon l'expérience et le secteur",
      advantages: [
        "Secteur d'avenir à la pointe de l'innovation",
        'Problématiques complexes et stimulantes',
        'Impact mesurable sur la performance des organisations',
        "Forte demande sur le marché de l'emploi",
      ],
      challenges: [
        'Équilibre entre exigences techniques et contraintes business',
        "Gestion des attentes parfois irréalistes concernant l'IA",
        'Évolution rapide des technologies nécessitant une veille constante',
      ],
      careerPath:
        "Ce poste est accessible après un parcours dans la tech, l'analyse de données ou la gestion de projet. Une progression typique commence par un rôle de data analyst ou développeur, puis évolue vers la gestion de projets data avant de se spécialiser dans l'IA.",
      growthProspects:
        "Les évolutions possibles incluent des postes de directeur data & IA, de responsable de l'innovation, ou d'entrepreneur dans les technologies avancées. L'expertise développée ouvre également des portes vers des postes de direction technique ou de product management dans les entreprises technologiques.",
    },
    {
      title: 'Formateur en Compétences Numériques',
      shortDescription:
        'Concevoir et animer des formations sur les outils et compétences numériques pour différents publics.',
      description:
        'En tant que Formateur en Compétences Numériques, vous transmettrez des savoirs essentiels dans un monde en digitalisation croissante. Vous concevrez des programmes pédagogiques adaptés à différents niveaux, animerez des sessions dynamiques en présentiel ou à distance, et évaluerez les progrès des apprenants. Ce rôle combine expertise technique, pédagogie et accompagnement du changement.',
      sector: 'Formation et Éducation',
      marketTrend: 'En croissance',
      matchPercentage: 89,
      requiredSkills: [
        'Maîtrise des outils numériques courants',
        'Compétences pédagogiques',
        'Communication claire',
        'Adaptabilité',
        'Veille technologique',
      ],
      training:
        "Formation initiale dans le domaine d'expertise + certification de formateur (CCP, RNCP) + certification d'outils numériques",
      salary: "35 000€ - 55 000€ selon le statut (salarié/indépendant) et l'expertise",
      advantages: [
        "Flexibilité dans l'organisation du travail",
        "Satisfaction d'accompagner la progression des apprenants",
        'Diversité des missions et des publics',
        'Développement continu de compétences transversales',
      ],
      challenges: [
        'Adaptation constante aux évolutions technologiques',
        'Gestion de groupes hétérogènes',
        'Besoin de renouveler régulièrement les méthodes pédagogiques',
      ],
      careerPath:
        "Ce poste est accessible avec une expérience professionnelle dans un domaine d'expertise technique ou métier, complétée par des compétences pédagogiques. La transition peut se faire depuis un poste opérationnel vers des missions de formation interne, puis vers un rôle de formateur à temps plein.",
      growthProspects:
        "Les évolutions possibles incluent des postes de responsable pédagogique, de concepteur de formations e-learning, de consultant en transformation digitale, ou de créateur d'un organisme de formation spécialisé.",
    },
    {
      title: 'Responsable Marketing Digital',
      shortDescription:
        "Élaborer et piloter la stratégie digitale d'une marque ou d'une entreprise à travers différents canaux web.",
      description:
        "Le Responsable Marketing Digital définit et met en œuvre la stratégie de présence et d'acquisition sur les canaux numériques. Vous superviserez les campagnes sur les réseaux sociaux, le référencement, l'email marketing et le content marketing. Votre mission sera d'optimiser le parcours client digital, d'analyser les performances des actions menées et d'adapter la stratégie en fonction des résultats et des tendances du marché.",
      sector: 'Marketing et Communication',
      marketTrend: 'Marché stable avec évolution constante',
      matchPercentage: 83,
      requiredSkills: [
        "Maîtrise des outils d'analyse web",
        "Connaissance des leviers d'acquisition",
        'Compétences en content marketing',
        'Gestion de projet',
        'Analyse de données marketing',
      ],
      training:
        'Formation supérieure en marketing, commerce ou communication + certifications spécialisées (Google Analytics, Inbound Marketing, etc.)',
      salary: "40 000€ - 70 000€ selon l'expérience et la taille de l'entreprise",
      advantages: [
        'Secteur dynamique en constante évolution',
        'Missions variées entre stratégie et opérationnel',
        "Possibilité de mesurer précisément l'impact des actions",
        "Nombreuses opportunités sur le marché de l'emploi",
      ],
      challenges: [
        'Adaptation permanente aux évolutions des plateformes et algorithmes',
        'Pression sur les résultats et le ROI',
        'Équilibre entre créativité et performance',
      ],
      careerPath:
        'Ce poste est accessible après un parcours en marketing traditionnel ou digital, souvent en passant par des postes de chargé de marketing digital ou community manager. Une expérience en agence constitue un atout important pour appréhender la diversité des problématiques clients.',
      growthProspects:
        "Les évolutions possibles incluent des postes de directeur marketing, directeur de la communication, ou directeur de l'expérience client. L'expertise développée est également valorisée pour des postes de consultant en stratégie digitale ou d'entrepreneur dans les services marketing.",
    },
  ];

  // Calculate match percentages based on user profile
  // This is a simplified example - in a real implementation, this would be more sophisticated
  return (
    opportunities
      .map((opportunity) => {
        let adjustedMatch = opportunity.matchPercentage;

        // Adjust match based on education level
        const educationMatch = calculateEducationMatch(educationLevel, opportunity.training);
        adjustedMatch *= 0.8 + educationMatch * 0.2;

        // Adjust match based on experience
        const expMatch = calculateExperienceMatch(yearsOfExperience, opportunity.careerPath);
        adjustedMatch *= 0.9 + expMatch * 0.1;

        // Adjust match based on skills overlap
        const skillsMatch = calculateSkillsMatch(skills, opportunity.requiredSkills);
        adjustedMatch *= 0.7 + skillsMatch * 0.3;

        // Ensure match is between 65 and 98
        adjustedMatch = Math.max(65, Math.min(98, Math.round(adjustedMatch)));

        return {
          ...opportunity,
          matchPercentage: adjustedMatch,
        };
      })
      // Sort by match percentage
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
  );
};

// Helper Functions

function calculateEducationMatch(userEducation, requiredEducation) {
  // Simple logic - improve with more sophisticated matching
  if (!requiredEducation) return 1; // If no requirement, assume match
  if (!userEducation) return 0.2; // Penalize if user has no education specified

  const levels = {
    Bac: 1,
    'Bac+2': 2,
    'Bac+3': 3,
    Licence: 3,
    'Bac+4': 4,
    'Bac+5': 5,
    Master: 5,
  };
  const userLevel = levels[userEducation] || 0;
  const requiredLevel = levels[requiredEducation] || 0;

  if (userLevel >= requiredLevel) return 1;
  if (userLevel === requiredLevel - 1) return 0.7;
  return 0.3;
}

function calculateExperienceMatch(userExperience, requiredExperience) {
  if (!requiredExperience) return 1;
  if (!userExperience) return 0.2;

  if (userExperience >= requiredExperience) return 1;
  if (userExperience >= requiredExperience * 0.7) return 0.8;
  return 0.4;
}

function calculateSkillsMatch(userSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 1;
  if (!userSkills || userSkills.length === 0) return 0.1;

  const requiredSkillsArray = requiredSkills.map((s) => s.toLowerCase());
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());

  const matchCount = requiredSkillsArray.filter((skill) => userSkillsLower.includes(skill)).length;
  return matchCount / requiredSkillsArray.length;
}

// Simplified representation of career data
// In a real application, this might come from a database or external API
const careerDatabase = [
  // ... (data)
];

/**
 * Finds career paths matching given skills and experience level.
 * @param {Array<string>} userSkills - Array of user's skills.
 * @param {number} userExperienceYears - User's years of experience.
 * @returns {Array<object>} - Array of matching career objects.
 */
exports.findMatchingCareers = (userSkills, userExperienceYears) =>
  // const currentPosition = 'Entry-level'; // Not used, removed
  careerDatabase.filter((career) =>
    // Simple matching logic (can be improved)
    true,
  )
;

/**
 * Provides detailed information about a specific career.
 * @param {string} careerTitle - The title of the career.
 * @returns {object|null} - Career details or null if not found.
 */
exports.getCareerDetails = (careerTitle) => careerDatabase.find((c) => c.title.toLowerCase() === careerTitle.toLowerCase()) || null;

/**
 * Calculates the match score between a user profile and a career path.
 * @param {object} userProfile - User's profile data (skills, experience, education).
 * @param {object} career - Career data object.
 * @returns {number} - Match score percentage.
 */
exports.calculateCareerMatchScore = (userProfile, career) => {
  const skillsWeight = 0.5;
  const experienceWeight = 0.3;
  const educationWeight = 0.2;

  const skillsMatch = calculateSkillsMatch(userProfile.skills, career.requiredSkills);
  const experienceMatch = calculateExperienceMatch(
    userProfile.yearsOfExperience,
    career.requiredExperience,
  );
  const educationMatch = calculateEducationMatch(userProfile.educationLevel, career.education);

  const weightedScore =
    skillsMatch * skillsWeight +
    experienceMatch * experienceWeight +
    educationMatch * educationWeight;
  return Math.round(weightedScore * 100);
};
