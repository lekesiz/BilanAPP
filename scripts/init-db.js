#!/usr/bin/env node

/**
 * Script pour initialiser la base de données avec des données de démo (dans le répertoire principal)
 */

// Doğru yolları kullan
// const bcrypt = require('bcryptjs'); // Kullanılmadığı için kaldırıldı
const { Op } = require('sequelize');
const sequelize = require('../config/database'); // config ana dizinde olduğu için ../
const {
  User,
  Beneficiary,
  Appointment,
  Forfait,
  Message,
  Questionnaire,
  Question,
  Document,
  AiAnalysis,
  CreditLog,
} = require('../models'); // models ana dizinde olduğu için ../
const { logCreditChange } = require('../services/creditService'); // CreditLog burada oluşturuluyor
const logger = require('../config/logger'); // Logger import edildi
require('dotenv').config();

let adminUser; // Global scope'a taşı

// --- Helper Functions ---

// Rastgele cevap oluşturucu
const generateDummyAnswer = (questionType, options) => {
  switch (questionType) {
    case 'text':
      return `Réponse textuelle courte exemple ${Math.random().toString(36).substring(7)}.`;
    case 'textarea':
      return `Ceci est une réponse textuelle longue pour la question. Elle contient plus de détails et d'informations que la réponse courte. Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${Math.random()}`;
    case 'radio':
      return options[Math.floor(Math.random() * options.length)];
    case 'checkbox':
      // Rastgele 1 veya 2 seçenek seç
      const shuffled = options.sort(() => 0.5 - Math.random());
      const count = Math.random() < 0.6 ? 1 : 2;
      return shuffled.slice(0, count).join(', ');
    case 'scale':
      return (Math.floor(Math.random() * 5) + 1).toString();
    default:
      return 'Réponse par défaut';
  }
};

// Demo mesaj oluşturucu
const createDemoMessages = async (consultantId, beneficiaryId, count = 3) => {
  const consultant = await User.findByPk(consultantId);
  const beneficiaryUser = await User.findOne({
    where: { '$beneficiaryProfile.id$': beneficiaryId },
    include: 'beneficiaryProfile',
  });

  if (!consultant || !beneficiaryUser) return;

  const messagePromises = [];
  for (let i = 0; i < count; i++) {
    const fromConsultant = i % 2 === 0;
    messagePromises.push(
      Message.create({
        senderId: fromConsultant ? consultant.id : beneficiaryUser.id,
        consultantId: consultant.id,
        beneficiaryId: beneficiaryId,
        subject: `Message de test ${i + 1}`,
        body: `Contenu du message de test ${i + 1} envoyé par ${fromConsultant ? 'consultant' : 'bénéficiaire'}.`,
        isRead: Math.random() < 0.5,
      }),
    );
  }
  await Promise.all(messagePromises);
};

// Demo kredi log oluşturucu
const createDemoCreditLogs = async () => {
  logger.info('Demo kredi logları oluşturuluyor...'); // console.log -> logger.info
  const creditLogPromises = [];
  const allUsers = await User.findAll();
  const demoCreditActions = [
    { code: 'AI_GENERATE_SYNTHESIS', note: 'AI Sentez' },
    { code: 'DOCUMENT_UPLOAD', note: 'Belge Yükleme' },
    { code: 'QUESTIONNAIRE_ASSIGN', note: 'Anket Atama' },
    { code: 'ADMIN_ADJUSTMENT', note: 'Admin Ayarlama' },
    { code: 'AI_GENERATE_ACTIONPLAN', note: 'AI Plan' },
  ];

  allUsers.forEach((user, index) => {
    if (user.userType !== 'beneficiary') {
      const actionIndex = index % demoCreditActions.length;
      const action = demoCreditActions[actionIndex];
      const amount = action.code === 'ADMIN_ADJUSTMENT' ? 50 : -(10 + index * 2);
      creditLogPromises.push(
        logCreditChange(
          user.id,
          amount,
          action.code,
          action.note,
          action.code === 'ADMIN_ADJUSTMENT' ? adminUser?.id : null,
          null,
          null,
        ),
      );
    }
  });
  await Promise.all(creditLogPromises);
  logger.info('Demo kredi logları oluşturuldu.'); // console.log -> logger.info
};

// --- Ana Fonksiyon ---
const initDatabase = async (force = false, createDemoData = true) => {
  try {
    logger.info('Starting database initialization...'); // console.log -> logger.info

    // Skip database creation for SQLite - it's handled by the connection
    // The CREATE DATABASE statement is not valid in SQLite

    // Sync models with database - force true will drop tables if they exist
    await sequelize.sync({ force: true });

    // Create all demo data through the main function
    await createDefaultForfaits();
    if (createDemoData) {
      await createDemoDataInternal();
    }

    logger.info('Database initialized successfully!'); // console.log -> logger.info
  } catch (error) {
    logger.error('Database initialization failed:', { error: error }); // console.error -> logger.error
  }
};

// Başlatma fonksiyonunu çalıştır
// initDatabase(); // Script doğrudan çalıştırılmayacaksa bu kaldırılabilir

// Testlerde kullanmak için export et
module.exports = { createDefaultForfaits, initDatabase };

// Varsayılan Forfait'leri oluşturma fonksiyonu
async function createDefaultForfaits() {
  // ... (Fonksiyon içeriği aynı)
  try {
    logger.info("Varsayılan Forfait'ler oluşturuluyor..."); // console.log -> logger.info
    await Forfait.bulkCreate(
      [
        {
          name: 'Essentiel',
          description: 'Paket Essentiel',
          defaultCredits: 0,
          maxBeneficiaries: 5,
          maxAiGenerationsMonthly: 0,
        },
        {
          name: 'Standard',
          description: 'Paket Standard',
          defaultCredits: 50,
          maxBeneficiaries: 15,
          maxAiGenerationsMonthly: 10,
        },
        {
          name: 'Premium',
          description: 'Paket Premium',
          defaultCredits: 150,
          maxBeneficiaries: 50,
          maxAiGenerationsMonthly: 50,
        },
        {
          name: 'Entreprise',
          description: 'Paket Entreprise',
          defaultCredits: 500,
          maxBeneficiaries: null,
          maxAiGenerationsMonthly: null,
        }, // null = sınırsız
        {
          name: 'Admin',
          description: 'Accès Administrateur',
          defaultCredits: 999,
          maxBeneficiaries: null,
          maxAiGenerationsMonthly: null,
        }, // Admin için
      ],
      { ignoreDuplicates: true },
    );
    logger.info("Varsayılan Forfait'ler başarıyla oluşturuldu/güncellendi."); // console.log -> logger.info
  } catch (error) {
    logger.error('Varsayılan Forfait oluşturulurken hata:', { error: error }); // console.error -> logger.error
    throw error;
  }
}

// Demo veri oluşturma fonksiyonu
async function createDemoDataInternal() {
  try {
    logger.info('Demo verileri oluşturuluyor...'); // console.log -> logger.info

    // --- Danışmanlar Oluştur ---
    const consultant = await User.create({
      email: 'consultant@test.com',
      password: 'consultant123',
      firstName: 'Jean',
      lastName: 'Dupont',
      userType: 'consultant',
      forfaitType: 'Premium',
      credits: 120,
    });
    logger.info('Danışman oluşturuldu:', consultant.email); // console.log -> logger.info
    const consultantId = consultant.id;

    const consultant2 = await User.create({
      email: 'consultant2@test.com',
      password: 'consultant123',
      firstName: 'Marie',
      lastName: 'Laurent',
      userType: 'consultant',
      forfaitType: 'Standard',
      credits: 45,
    });
    logger.info('İkinci danışman oluşturuldu:', consultant2.email); // console.log -> logger.info
    const consultant2Id = consultant2.id;

    // --- ADMIN Kullanıcısı Oluştur --- (Global değişkene ata)
    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      userType: 'consultant',
      forfaitType: 'Admin',
      credits: 999,
    });
    logger.info('Admin kullanıcısı oluşturuldu:', adminUser.email); // console.log -> logger.info

    // --- Faydalanıcılar ve Kullanıcı Hesapları Oluştur ---
    logger.info('Faydalanıcılar oluşturuluyor...'); // Yeni log
    const beneficiariesData = [];
    const statuses = ['initial', 'active', 'active', 'active', 'on_hold', 'completed'];
    const phases = [
      'preliminary',
      'investigation',
      'investigation',
      'conclusion',
      'investigation',
      'conclusion',
    ];

    // Daha zengin profil verileri için
    const professions = [
      'Ingénieur informatique',
      'Responsable marketing',
      'Comptable',
      'Assistant administratif',
      'Chef de projet',
      'Designer graphique',
      'Formateur',
      'Commercial',
      'Infirmier',
      'Enseignant',
    ];
    const educationLevels = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'];
    const cities = [
      'Paris',
      'Lyon',
      'Marseille',
      'Toulouse',
      'Bordeaux',
      'Lille',
      'Nantes',
      'Strasbourg',
      'Nice',
      'Rennes',
    ];

    for (let i = 1; i <= 20; i++) {
      const status = statuses[i % statuses.length];
      const phase =
        status === 'completed' || status === 'initial' ? 'preliminary' : phases[i % phases.length];
      const userEmail = `beneficiary${i}@test.com`;

      // Zengin isimlerin kullanımı
      const firstNames = [
        'Sophie',
        'Thomas',
        'Emma',
        'Lucas',
        'Léa',
        'Hugo',
        'Chloé',
        'Raphaël',
        'Inès',
        'Louis',
        'Camille',
        'Jules',
      ];
      const lastNames = [
        'Martin',
        'Bernard',
        'Dubois',
        'Moreau',
        'Petit',
        'Durand',
        'Leroy',
        'Richard',
        'Simon',
        'Laurent',
      ];

      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];

      // İki danışman arasında faydalanıcıları dağıt
      const assignedConsultantId = i % 3 === 0 ? consultant2Id : consultantId;
      const assignedConsultantName = i % 3 === 0 ? 'Marie Laurent' : 'Jean Dupont';

      const beneficiaryUser = await User.create({
        email: userEmail,
        password: `beneficiary${i}`,
        firstName,
        lastName,
        userType: 'beneficiary',
        forfaitType: null,
      });

      const notes = `
Bénéficiaire suivi par ${assignedConsultantName}.
Profession actuelle: ${professions[i % professions.length]}
Formation: ${educationLevels[i % educationLevels.length]}
Ville: ${cities[i % cities.length]}

Informations complémentaires:
- ${i % 2 === 0 ? 'Souhaite une réorientation professionnelle' : 'Cherche à évoluer dans son domaine actuel'}
- ${i % 3 === 0 ? 'Intéressé par la formation continue' : 'Préfère les formations courtes et intensives'}
- ${i % 4 === 0 ? 'Disponible immédiatement' : 'Disponible dans 3 mois'}
      `;

      const beneficiary = await Beneficiary.create({
        userId: beneficiaryUser.id,
        consultantId: assignedConsultantId,
        phone: `06${Math.floor(10000000 + Math.random() * 90000000).toString()}`,
        notes,
        status,
        currentPhase: phase,
        bilanStartDate: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000),
        agreementSigned: i % 3 !== 0,
        consentGiven: i % 4 !== 0,
        currentPosition: professions[i % professions.length],
        educationLevel: educationLevels[i % educationLevels.length],
        yearsOfExperience: 3 + (i % 15),
        address: `${Math.floor(Math.random() * 100) + 1} rue ${['de la Paix', 'Victor Hugo', 'de la République', 'du Commerce', 'Saint-Michel'][i % 5]}, ${cities[i % cities.length]}`,
        dateOfBirth: new Date(1970 + (i % 30), i % 12, 1 + (i % 28)),
      });
      beneficiariesData.push(beneficiary);
      logger.info(`Faydalanıcı ${i} (${userEmail} - ${firstName} ${lastName}) oluşturuldu.`); // console.log -> logger.info
    }

    // --- Randevular Oluştur ---
    logger.info('Demo randevular oluşturuluyor...'); // console.log -> logger.info
    const appointmentTypesEnum = [
      'Entretien Préliminaire',
      "Entretien d'Investigation",
      'Entretien de Synthèse',
      'Passation Tests',
      'Suivi',
      'Autre',
    ];

    const appointmentLocations = [
      'Bureau principal - Paris',
      'Espace coworking - Lyon',
      'Visioconférence',
      'Centre de formation',
      'Café Le Central',
    ];

    const today = new Date();
    const appointmentStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
    const appointmentNotes = [
      'Le bénéficiaire a exprimé ses attentes et ses craintes concernant sa reconversion professionnelle.',
      'Nous avons passé en revue le parcours professionnel et identifié les compétences transférables.',
      'Séance de tests psychométriques réalisée avec succès.',
      'Discussion approfondie sur les résultats des tests et leur interprétation.',
      'Présentation des pistes professionnelles potentielles et discussion sur leur faisabilité.',
      "Élaboration conjointe du plan d'action pour les prochaines étapes.",
    ];

    const appointmentPromises = [];
    for (let i = 0; i < beneficiariesData.length; i++) {
      const beneficiary = beneficiariesData[i];

      // Geçmiş randevular (1-3 adet)
      const pastAppointmentsCount = 1 + (i % 3);
      for (let j = 0; j < pastAppointmentsCount; j++) {
        const pastAppointmentType = appointmentTypesEnum[(i + j) % appointmentTypesEnum.length];
        appointmentPromises.push(
          Appointment.create({
            title: `${pastAppointmentType} - ${beneficiary.User?.firstName || `Bénéficiaire ${i + 1}`}`,
            date: new Date(today.getTime() - (i + j + 1) * 3 * 24 * 60 * 60 * 1000),
            type: pastAppointmentType,
            duration: 60 + j * 30,
            status: 'completed',
            consultantId: beneficiary.consultantId,
            beneficiaryId: beneficiary.id,
            notes: appointmentNotes[j % appointmentNotes.length],
            location: appointmentLocations[j % appointmentLocations.length],
            reminderSent: true,
          })
        );
      }

      // Gelecek randevular (duruma göre 0-2 adet)
      if (beneficiary.status === 'active' || beneficiary.status === 'on_hold') {
        const futureAppointmentsCount = i % 3 === 0 ? 2 : 1;
        for (let j = 0; j < futureAppointmentsCount; j++) {
          const futureAppointmentType =
            appointmentTypesEnum[(i + j + 1) % appointmentTypesEnum.length];
          const futureStatus =
            j === 0 ? 'scheduled' : appointmentStatuses[j % appointmentStatuses.length];
          appointmentPromises.push(
            Appointment.create({
              title: `${futureAppointmentType} - ${beneficiary.User?.firstName || `Bénéficiaire ${i + 1}`}`,
              date: new Date(today.getTime() + (i + j + 1) * 2 * 24 * 60 * 60 * 1000),
              type: futureAppointmentType,
              duration: 90,
              status: futureStatus,
              consultantId: beneficiary.consultantId,
              beneficiaryId: beneficiary.id,
              location: appointmentLocations[(j + 3) % appointmentLocations.length],
              reminderSent: false,
            })
          );
        }
      }
    }
    await Promise.all(appointmentPromises);
    logger.info('Demo randevular oluşturuldu.'); // console.log -> logger.info

    // --- Demo Mesajlar Oluştur ---
    await createDemoMessages(consultantId, beneficiariesData[0].id);

    // --- Demo Anketler ve Sorular Oluştur ---
    logger.info('Demo anketler ve sorular oluşturuluyor...'); // console.log -> logger.info

    const questionnairePromises = [];
    const questionTypes = ['interests', 'skills', 'personality', 'values'];
    const questionnaireTemplates = [
      {
        title: "Questionnaire d'Intérêts Professionnels",
        description:
          "Ce questionnaire vise à explorer vos centres d'intérêt pour mieux identifier les secteurs professionnels qui vous correspondent.",
        type: 'interests',
        questions: [
          {
            text: "Quel secteur d'activité vous attire le plus ?",
            type: 'text',
            order: 1,
          },
          {
            text: 'Préférez-vous travailler seul ou en équipe ?',
            type: 'single_choice',
            options: JSON.stringify(['Seul', 'En équipe', 'Les deux']),
            order: 2,
          },
          {
            text: 'Quelles sont vos trois principales passions ?',
            type: 'text',
            order: 3,
          },
          {
            text: 'Notez votre intérêt pour les domaines suivants (1-5)',
            type: 'scale',
            options: JSON.stringify(['Technologie', 'Santé', 'Éducation', 'Commerce', 'Arts']),
            order: 4,
          },
        ],
      },
      {
        title: 'Auto-évaluation des Compétences',
        description:
          "Évaluez vos compétences techniques et interpersonnelles pour identifier vos atouts et axes d'amélioration.",
        type: 'skills',
        questions: [
          {
            text: 'Notez votre niveau de maîtrise des langues étrangères (1-5)',
            type: 'scale',
            options: JSON.stringify(['Anglais', 'Espagnol', 'Allemand']),
            order: 1,
          },
          {
            text: 'Décrivez votre expérience en gestion de projet',
            type: 'text',
            order: 2,
          },
          {
            text: 'Quelles sont vos compétences techniques principales ?',
            type: 'multi_choice',
            options: JSON.stringify([
              'Informatique',
              'Comptabilité',
              'Marketing',
              'Design',
              'Communication',
              'Vente',
            ]),
            order: 3,
          },
          {
            text: 'Comment évaluez-vous vos compétences en communication (1-5) ?',
            type: 'scale',
            order: 4,
          },
        ],
      },
      {
        title: 'Questionnaire sur les Valeurs Professionnelles',
        description: 'Identifiez les valeurs qui vous animent dans votre vie professionnelle.',
        type: 'values',
        questions: [
          {
            text: "Classez ces valeurs par ordre d'importance pour vous",
            type: 'ranking',
            options: JSON.stringify([
              'Autonomie',
              'Sécurité',
              'Créativité',
              'Reconnaissance',
              'Équilibre vie pro/perso',
            ]),
            order: 1,
          },
          {
            text: "Qu'est-ce qui vous motive principalement dans votre travail ?",
            type: 'text',
            order: 2,
          },
          {
            text: "Dans quel type d'environnement préférez-vous travailler ?",
            type: 'single_choice',
            options: JSON.stringify(['Structuré', 'Flexible', 'Mixte']),
            order: 3,
          },
          {
            text: 'Quelle importance accordez-vous à la mission sociétale de votre entreprise (1-5) ?',
            type: 'scale',
            order: 4,
          },
        ],
      },
    ];

    // Her danışman için birkaç anket oluştur
    for (let i = 0; i < Math.min(beneficiariesData.length, 15); i++) {
      const beneficiary = beneficiariesData[i];

      // 1-2 anket oluştur
      const questionnaireCount = 1 + (i % 2);

      for (let j = 0; j < questionnaireCount; j++) {
        const templateIndex = (i + j) % questionnaireTemplates.length;
        const template = questionnaireTemplates[templateIndex];
        const status = statuses[i % statuses.length];
        const dueDate = new Date(Date.now() + ((i % 14) + 1) * 24 * 60 * 60 * 1000);

        const questionnaire = await Questionnaire.create({
          title: template.title,
          description: template.description,
          type: template.type,
          status,
          createdBy: beneficiary.consultantId,
          beneficiaryId: beneficiary.id,
          dueDate,
          completedDate:
            status === 'completed'
              ? new Date(Date.now() - ((i % 7) + 1) * 24 * 60 * 60 * 1000)
              : null,
        });

        // Anket sorularını oluştur
        for (const questionTemplate of template.questions) {
          await Question.create({
            questionnaireId: questionnaire.id,
            text: questionTemplate.text,
            type: questionTemplate.type,
            options: questionTemplate.options || null,
            order: questionTemplate.order,
            answer:
              status === 'completed'
                ? generateDummyAnswer(questionTemplate.type, questionTemplate.options)
                : null,
          });
        }
      }
    }
    logger.info('Demo anketler ve sorular oluşturuldu.'); // console.log -> logger.info

    // --- Demo Belgeler Oluştur ---
    logger.info('Demo belgeler oluşturuluyor...'); // console.log -> logger.info

    const documentCategories = [
      'CV',
      'Lettre de motivation',
      'Synthèse',
      "Rapport d'entretien",
      'Test de personnalité',
      'Projet professionnel',
    ];
    const documentTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'txt'];

    // İlk 15 faydalanıcı için belgeler oluştur
    for (let i = 0; i < Math.min(beneficiariesData.length, 15); i++) {
      const beneficiary = beneficiariesData[i];
      const documentCount = 1 + (i % 3); // 1-3 belge

      for (let j = 0; j < documentCount; j++) {
        const category = documentCategories[(i + j) % documentCategories.length];
        const fileType = documentTypes[(i + j) % documentTypes.length];
        const dateSuffix = Date.now() + i * 1000 + j;

        const title = `${category} - ${beneficiary.User?.firstName || `Bénéficiaire ${i + 1}`}`;
        const fileName = `${dateSuffix}-${category.replace(/ /g, '_')}.${fileType}`;

        await Document.create({
          title,
          originalName: `original_${fileName}`,
          fileName,
          filePath: `/uploads/${fileName}`,
          fileType,
          fileSize: 10000 + i * 1000 + j * 500,
          category,
          uploadedBy: beneficiary.consultantId,
          beneficiaryId: beneficiary.id,
          description: `Document ${category.toLowerCase()} pour ${beneficiary.User?.firstName || 'le bénéficiaire'} ${beneficiary.User?.lastName || i + 1}.`,
          uploadDate: new Date(Date.now() - ((i % 30) + 1) * 24 * 60 * 60 * 1000),
          isPublic: j === 0,
        });
      }
    }
    logger.info('Demo belgeler oluşturuldu.'); // console.log -> logger.info

    // --- AI Analiz Sonuçları Oluştur ---
    logger.info('Demo AI analiz sonuçları oluşturuluyor...'); // console.log -> logger.info

    const aiAnalysisTypes = [
      'synthesis',
      'action_plan',
      'competency_analysis',
      'career_exploration',
    ];

    // Demo AI Analiz sonuçları
    const aiAnalysisTemplates = [
      {
        type: 'synthesis',
        input: {
          beneficiaryId: 1,
          questionnaires: [{ id: 1, title: "Questionnaire d'Intérêts Professionnels" }],
          appointments: [{ id: 1, date: '2023-03-15', notes: 'Entretien préliminaire...' }],
        },
        results: {
          summary:
            "Synthèse du parcours professionnel.\n\nLe bénéficiaire a un parcours riche dans le domaine marketing avec une expertise particulière en communication digitale. Sa formation initiale en commerce a été complétée par plusieurs certifications professionnelles.\n\nPoints forts identifiés:\n- Excellentes compétences en stratégie de contenu\n- Bonne maîtrise des outils analytiques\n- Capacité à gérer des équipes transverses\n\nAxes d'amélioration:\n- Développer des connaissances en SEO technique\n- Renforcer l'expertise en analyse de données\n\nPistes d'évolution professionnelle recommandées:\n1. Responsable marketing digital\n2. Chef de projet contenu\n3. Consultant en stratégie digitale",
        },
      },
      {
        type: 'action_plan',
        input: {
          beneficiaryId: 2,
          questionnaires: [{ id: 2, title: 'Auto-évaluation des Compétences' }],
          objectives: "Reconversion professionnelle dans le secteur de l'informatique",
        },
        results: {
          title: "Plan d'action pour reconversion en développement web",
          steps: [
            {
              title: 'Formation initiale',
              description: 'Suivre une formation intensive en développement web (3 mois)',
              timeframe: 'Court terme (1-3 mois)',
              resources: 'École 42, OpenClassrooms, Bootcamp',
            },
            {
              title: 'Développement de projets personnels',
              description:
                'Créer un portfolio avec 3-5 projets démontrant les compétences acquises',
              timeframe: 'Moyen terme (3-6 mois)',
              resources: 'GitHub, documentation en ligne',
            },
            {
              title: 'Stage ou alternance',
              description: 'Rechercher une expérience professionnelle dans une entreprise tech',
              timeframe: 'Moyen terme (6-9 mois)',
              resources: 'LinkedIn, Indeed, réseaux professionnels',
            },
          ],
        },
      },
      {
        type: 'competency_analysis',
        input: {
          beneficiaryId: 3,
          profile: {
            currentPosition: 'Responsable marketing',
            experience: '8 ans',
          },
          questionnaires: [{ id: 3, title: 'Auto-évaluation des Compétences' }],
        },
        results: {
          hardSkills: [
            {
              name: 'Marketing digital',
              level: 4.5,
              comment: 'Expertise confirmée',
            },
            { name: 'Gestion de projet', level: 4, comment: 'Bonne maîtrise' },
            {
              name: 'Anglais professionnel',
              level: 3.5,
              comment: 'Niveau intermédiaire avancé',
            },
            { name: 'Outils CRM', level: 3, comment: 'Utilisation régulière' },
          ],
          softSkills: [
            { name: 'Communication', level: 4.5, comment: 'Point fort majeur' },
            {
              name: 'Leadership',
              level: 4,
              comment: 'Capacité à motiver les équipes',
            },
            {
              name: 'Adaptabilité',
              level: 3.5,
              comment: "Bonne capacité d'adaptation",
            },
          ],
          developmentAreas: [
            {
              name: 'Analyse de données',
              priority: 'Haute',
              suggestion: 'Formation en data analytics',
            },
            {
              name: 'Compétences techniques SEO',
              priority: 'Moyenne',
              suggestion: 'Certification Google',
            },
          ],
          ROMECompetencies: [
            { code: 'M1705', name: 'Marketing', match: 'Fort' },
            { code: 'E1103', name: 'Communication', match: 'Moyen' },
          ],
        },
      },
      {
        type: 'career_exploration',
        input: {
          beneficiaryId: 4,
          interests: ['Technologie', 'Éducation'],
          skills: ['Communication', 'Gestion de projet', 'Rédaction'],
        },
        results: {
          recommendedPaths: [
            {
              title: 'Formateur en technologies digitales',
              match: 85,
              description:
                'Combiner compétences techniques et pédagogiques pour former des professionnels aux outils numériques',
              requiredSkills: ['Pédagogie', 'Expertise technique', 'Communication'],
              growthPotential: 'Élevé, marché en expansion',
              nextSteps: ['Certification pédagogique', 'Spécialisation technique'],
            },
            {
              title: 'Chef de projet e-learning',
              match: 78,
              description:
                'Développer des programmes de formation en ligne, gérer leur déploiement',
              requiredSkills: ['Gestion de projet', 'Connaissance LMS', 'Ingénierie pédagogique'],
              growthPotential: 'Moyen à élevé',
              nextSteps: ['Formation en ingénierie pédagogique', "Maîtrise d'outils auteurs"],
            },
          ],
        },
      },
    ];

    // Rastgele faydalanıcılar için AI analiz sonuçları oluştur
    for (let i = 0; i < 8; i++) {
      const beneficiaryIndex = i % beneficiariesData.length;
      const beneficiary = beneficiariesData[beneficiaryIndex];

      if (!beneficiary) continue;

      // Analizin tipini belirle
      const analysisType = aiAnalysisTypes[i % aiAnalysisTypes.length];
      const templateIndex = i % aiAnalysisTemplates.length;
      const template = aiAnalysisTemplates[templateIndex];

      // Şablonu bu faydalanıcı için güncelleyelim
      const inputData = { ...template.input, beneficiaryId: beneficiary.id };

      // Eğer competency_analysis ise, faydalanıcının gerçek bilgilerini kullan
      if (analysisType === 'competency_analysis' && beneficiary.currentPosition) {
        inputData.profile = {
          currentPosition: beneficiary.currentPosition,
          experience: `${beneficiary.yearsOfExperience || 5} ans`,
        };
      }

      await AiAnalysis.create({
        type: analysisType,
        beneficiaryId: beneficiary.id,
        consultantId: beneficiary.consultantId,
        input: JSON.stringify(inputData),
        userId: beneficiary.consultantId, // Analizleri danışman yapmış olarak kaydet
        results: JSON.stringify(template.results),
        createdAt: new Date(Date.now() - ((i % 14) + 1) * 24 * 60 * 60 * 1000),
        creditCost: 5 + (i % 5),
      });
    }
    logger.info('Demo AI analiz sonuçları oluşturuldu.'); // console.log -> logger.info

    // --- Kredi Logları Oluştur ---
    await createDemoCreditLogs();

    logger.info('-----------------------------------------'); // console.log -> logger.info
    logger.info('Demo Veri Oluşturma Tamamlandı!'); // console.log -> logger.info
    logger.info(`Danışman Girişi: consultant@test.com / consultant123`); // console.log -> logger.info
    logger.info(`İkinci Danışman: consultant2@test.com / consultant123`); // console.log -> logger.info
    logger.info(`Admin Girişi: admin@test.com / admin123`); // console.log -> logger.info
    logger.info('Faydalanıcı Girişleri: beneficiary1@test.com / beneficiary1 ...'); // console.log -> logger.info
    logger.info('-----------------------------------------'); // console.log -> logger.info

    // Tamamlanmış anketlerin durumunu güncelle (questionnaireStatuses kullanımı kaldırıldı)
    await Questionnaire.update(
      { status: 'completed' },
      {
        where: {
          id: {
            [Op.in]: questionnaires
              .filter((q) => q.category === 'skills' || q.category === 'interests')
              .map((q) => q.id),
          },
        },
      },
    );
  } catch (error) {
    logger.error('Demo veri oluşturulurken hata:', { error: error }); // console.error -> logger.error
    throw error;
  }
}
