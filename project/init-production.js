#!/usr/bin/env node

/**
 * Script pour initialiser l'application en production
 * - Synchronise la base de données
 * - Crée un utilisateur administrateur si nécessaire
 */

const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const sequelize = require('../config/database');
const { User } = require('../models');

// Charger les variables d'environnement
dotenv.config();

async function initializeProduction() {
  try {
    // Synchroniser les modèles avec la base de données (sans force pour préserver les données)
    await sequelize.sync();
    console.log('Base de données synchronisée avec succès.');

    // Vérifier si un consultant existe déjà
    const consultantCount = await User.count({
      where: { userType: 'consultant' },
    });

    if (consultantCount === 0) {
      // Créer un consultant par défaut si aucun n'existe
      const saltRounds = 10;
      const adminPassword = await bcrypt.hash('admin123', saltRounds);

      await User.create({
        email: 'admin@bilancompetences.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Système',
        userType: 'consultant',
      });

      console.log('Consultant par défaut créé avec succès !');
      console.log('Email: admin@bilancompetences.com');
      console.log('Mot de passe: admin123');
      console.log('IMPORTANT: Veuillez changer ce mot de passe après la première connexion.');
    } else {
      console.log('Des consultants existent déjà dans la base de données.');
    }

    console.log('Initialisation terminée avec succès.');
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la production:", error);
    process.exit(1);
  }
}

// Exécuter la fonction d'initialisation
initializeProduction();
