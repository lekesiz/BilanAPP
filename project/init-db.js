#!/usr/bin/env node

/**
 * Script pour initialiser la base de données avec des données de démo
 */

const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const {
  User,
  Beneficiary,
  Appointment,
  Forfait,
  Message,
  Questionnaire,
  Question,
  Document,
} = require('../models');

// Varsayılan Forfait'leri oluşturma fonksiyonu
async function createDefaultForfaits() {
  try {
    console.log("Varsayılan Forfait'ler oluşturuluyor...");
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
        },
        {
          name: 'Admin',
          description: 'Accès Administrateur',
          defaultCredits: 0,
          maxBeneficiaries: null,
          maxAiGenerationsMonthly: null,
        },
      ],
      { ignoreDuplicates: true },
    );
    console.log("Varsayılan Forfait'ler başarıyla oluşturuldu/güncellendi.");
  } catch (error) {
    console.error('Varsayılan Forfait oluşturulurken hata:', error);
    throw error;
  }
}

// Demo veri oluşturma fonksiyonu
async function createDemoData() {
  try {
    console.log('Demo verileri oluşturuluyor...');
    const saltRounds = 10;

    // --- Danışman Oluştur (Manuel Hash ile) ---
    const consultantPassword = await bcrypt.hash('consultant123', saltRounds);
    const consultant = await User.create({
      email: 'consultant@test.com',
      password: consultantPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      userType: 'consultant',
      forfaitType: 'Premium',
    });
    console.log('Danışman oluşturuldu:', consultant.email);
    const consultantId = consultant.id;

    // --- ADMIN Kullanıcısı Oluştur (Manuel Hash ile) ---
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const adminUser = await User.create({
      email: 'admin@test.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'consultant',
      forfaitType: 'Admin',
    });
    console.log('Admin kullanıcısı oluşturuldu:', adminUser.email);

    // --- Faydalanıcılar ve Kullanıcı Hesapları Oluştur (Manuel Hash ile) ---
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

    for (let i = 1; i <= 15; i++) {
      const status = statuses[i % statuses.length];
      const phase =
        status === 'completed' || status === 'initial' ? 'preliminary' : phases[i % phases.length];
      const userEmail = `beneficiary${i}@test.com`;
      const userPassword = await bcrypt.hash(`beneficiary${i}`, saltRounds);

      const beneficiaryUser = await User.create({
        email: userEmail,
        password: userPassword,
        firstName: `Bene${i}`,
        lastName: 'User',
        userType: 'beneficiary',
        forfaitType: null,
      });

      const beneficiary = await Beneficiary.create({
        userId: beneficiaryUser.id,
        consultantId,
        phone: `06000000${i.toString().padStart(2, '0')}`,
        notes: `Demo bénéficiaire ${i} notları.`,
        status,
        currentPhase: phase,
        bilanStartDate: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000),
        agreementSigned: i % 3 !== 0,
        consentGiven: i % 4 !== 0,
      });
      beneficiariesData.push(beneficiary);
      console.log(`Faydalanıcı ${i} (${userEmail}) oluşturuldu.`);
    }

    // --- Randevular Oluştur ---
    const appointmentTypesEnum = [
      'Entretien Préliminaire',
      "Entretien d'Investigation",
      'Entretien de Synthèse',
      'Passation Tests',
      'Suivi',
      'Autre',
    ];
    const today = new Date();
    for (let i = 0; i < beneficiariesData.length; i++) {
      const beneficiary = beneficiariesData[i];
      const pastAppointmentType = appointmentTypesEnum[i % appointmentTypesEnum.length];
      await Appointment.create({
        title: `RDV Passé ${i + 1} - ${pastAppointmentType}`,
        date: new Date(today.getTime() - (i + 1) * 3 * 24 * 60 * 60 * 1000),
        type: pastAppointmentType,
        duration: 60,
        status: 'completed',
        consultantId,
        beneficiaryId: beneficiary.id,
        notes: `Notlar için geçmiş randevu ${i + 1}`,
      });
      if (i % 2 === 0 && beneficiary.status === 'active') {
        const futureAppointmentType = appointmentTypesEnum[(i + 1) % appointmentTypesEnum.length];
        await Appointment.create({
          title: `RDV Futur ${i + 1} - ${futureAppointmentType}`,
          date: new Date(today.getTime() + (i + 1) * 2 * 24 * 60 * 60 * 1000),
          type: futureAppointmentType,
          duration: 90,
          status: 'scheduled',
          consultantId,
          beneficiaryId: beneficiary.id,
        });
      }
    }
    console.log('Demo randevular oluşturuldu.');

    // --- Demo Mesajlar Oluştur ---
    console.log('Demo mesajlar oluşturuluyor...');
    const beneficiaryUser1 = await User.findOne({
      where: { email: 'beneficiary1@test.com' },
    });
    const beneficiaryUser2 = await User.findOne({
      where: { email: 'beneficiary2@test.com' },
    });
    if (beneficiaryUser1 && beneficiariesData[0]) {
      await Message.create({
        consultantId,
        beneficiaryId: beneficiariesData[0].id,
        senderId: consultantId,
        body: 'Bonjour Bene1, bienvenue !',
        isRead: true,
      });
      await Message.create({
        consultantId,
        beneficiaryId: beneficiariesData[0].id,
        senderId: beneficiaryUser1.id,
        body: 'Merci Jean!',
        isRead: false,
      });
    }
    if (beneficiaryUser2 && beneficiariesData[1]) {
      await Message.create({
        consultantId,
        beneficiaryId: beneficiariesData[1].id,
        senderId: consultantId,
        body: "N'oubliez pas notre RDV demain.",
        isRead: false,
      });
    }
    console.log('Demo mesajlar oluşturuldu.');

    // --- Demo Anketler ve Sorular Oluştur ---
    console.log('Demo anketler ve sorular oluşturuluyor...');
    if (beneficiariesData[0] && beneficiariesData[1]) {
      const q1 = await Questionnaire.create({
        title: 'Questionnaire Intérêts Pro',
        description: 'Explorer vos intérêts.',
        type: 'interests',
        status: 'pending',
        createdBy: consultantId,
        beneficiaryId: beneficiariesData[0].id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await Question.create({
        questionnaireId: q1.id,
        text: 'Quel secteur vous attire le plus ?',
        type: 'text',
        order: 1,
      });
      await Question.create({
        questionnaireId: q1.id,
        text: 'Préférez-vous travailler seul ou en équipe ?',
        type: 'single_choice',
        options: '[\"Seul\", \"En équipe\", \"Indifférent\"]',
        order: 2,
      });

      const q2 = await Questionnaire.create({
        title: 'Auto-évaluation Compétences',
        description: 'Évaluez vos compétences clés.',
        type: 'skills',
        status: 'pending',
        createdBy: consultantId,
        beneficiaryId: beneficiariesData[1].id,
      });
      await Question.create({
        questionnaireId: q2.id,
        text: "Notez votre maîtrise de l'anglais (1-5)",
        type: 'scale',
        order: 1,
      });
      await Question.create({
        questionnaireId: q2.id,
        text: 'Décrivez votre expérience en gestion de projet.',
        type: 'text',
        order: 2,
      });
    }
    console.log('Demo anketler ve sorular oluşturuldu.');

    // --- Demo Belgeler Oluştur ---
    console.log('Demo belgeler oluşturuluyor...');
    if (beneficiariesData[0] && beneficiariesData[1]) {
      const dateSuffix = Date.now();
      await Document.create({
        title: 'CV Bene1',
        originalName: 'CV_Bene1_original.pdf',
        fileName: `${dateSuffix}-CV_Bene1.pdf`,
        filePath: `/uploads/${dateSuffix}-CV_Bene1.pdf`,
        fileType: 'pdf',
        fileSize: 12345,
        category: 'CV',
        uploadedBy: consultantId,
        beneficiaryId: beneficiariesData[0].id,
      });
      await Document.create({
        title: 'Synthese Bene2',
        originalName: 'Synthese_Bene2_v1.docx',
        fileName: `${dateSuffix + 1}-Synthese_Bene2.docx`,
        filePath: `/uploads/${dateSuffix + 1}-Synthese_Bene2.docx`,
        fileType: 'docx',
        fileSize: 67890,
        category: 'Synthèse',
        uploadedBy: consultantId,
        beneficiaryId: beneficiariesData[1].id,
      });
    }
    console.log('Demo belgeler oluşturuldu.');

    console.log('-----------------------------------------');
    console.log('Demo Veri Oluşturma Tamamlandı!');
    console.log(`Danışman Girişi: ${consultant.email} / consultant123`);
    console.log(`Admin Girişi: ${adminUser.email} / admin123`);
    console.log('Faydalanıcı Girişleri: beneficiary1@test.com / beneficiary1 ...');
    console.log('-----------------------------------------');
  } catch (error) {
    console.error('Demo veri oluşturulurken hata:', error);
    throw error;
  }
}

// Ana Veritabanı Başlatma Fonksiyonu
async function initializeDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Veritabanı senkronize edildi (Mevcut tablolar silindi ve yeniden oluşturuldu).');
    await createDefaultForfaits();
    await createDemoData();
    console.log('Veritabanı başlatma işlemi başarıyla tamamlandı.');
    process.exit(0);
  } catch (error) {
    console.error('Veritabanı başlatılırken genel hata:', error);
    process.exit(1);
  }
}

// Başlatma fonksiyonunu çalıştır
initializeDatabase();
