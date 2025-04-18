#!/usr/bin/env node

/**
 * Script pour initialiser la base de données avec des utilisateurs de test
 */

const sequelize = require('../config/database');
const { User, Beneficiary, Appointment, Message, Questionnaire, Document, Question, Answer, CreditLog, Forfait } = require('../models');
const bcrypt = require('bcrypt');

// Forfait verisi doğrudan burada tanımlanabilir veya ayrı bir dosyadan okunabilir
const defaultForfaits = [
    { name: 'Essentiel', defaultCredits: 100, description: 'Fonctionnalités de base...', features: 'Gestion Bénéficiaires\nPlanification RDV\nMessagerie Standard' },
    { name: 'Standard', defaultCredits: 250, description: 'Équilibre idéal...', features: 'Essentiel+\nRapports base\nAssignation Questionnaires' },
    { name: 'Premium', defaultCredits: 500, description: 'Accès avancé...', features: 'Standard+\nGénération IA Ébauches\nSupport prioritaire' },
    { name: 'Entreprise', defaultCredits: 1000, description: 'Solution complète...', features: 'Premium+\nPersonnalisation\nRapports avancés' },
    { name: 'Admin', defaultCredits: 99999, description: 'Accès complet...', features: 'Accès total\nGestion utilisateurs' }
];

async function initDatabase() {
  try {
    // Tüm tabloları senkronize et
    await sequelize.sync({ force: true });
    
    console.log('Veritabanı tabloları başarıyla oluşturuldu.');

    // Varsayılan Forfaitları oluştur
    await Forfait.bulkCreate(defaultForfaits, { ignoreDuplicates: true });
    console.log('Varsayılan forfaitlar oluşturuldu.');

    // Test kullanıcısı oluştur (Krediyi doğrudan veya fonksiyondan alabiliriz)
    const adminForfaitName = 'Admin';
    const adminForfaitData = defaultForfaits.find(f => f.name === adminForfaitName);
    await User.create({
      email: 'test@example.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'Consultant',
      userType: 'consultant',
      forfaitType: adminForfaitName, // Forfait ismini (PK) ata
      availableCredits: adminForfaitData ? adminForfaitData.defaultCredits : 0 
    });

    console.log('Test kullanıcısı oluşturuldu.');

  } catch (error) {
    console.error('Veritabanı oluşturma hatası:', error);
  } finally {
    // Bağlantıyı kapat
    await sequelize.close();
  }
}

// Script'i çalıştır
initDatabase();
