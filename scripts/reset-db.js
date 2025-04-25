#!/usr/bin/env node

/**
 * Script to reset the database before re-initializing demo data
 */

const sequelize = require('../config/database');
const logger = require('../config/logger');

async function resetDatabase() {
  try {
    logger.info('Resetting database...');
    
    // For SQLite, directly delete all data from tables
    const tables = [
      'Messages',
      'Conversations',
      'Documents',
      'Questions',
      'Questionnaires',
      'Appointments',
      'AiAnalyses',
      'CreditLogs',
      'Beneficiaries',
      'Consultants',
      'Users',
      'Forfaits'
    ];
    
    // Disable foreign key constraints for SQLite
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    
    // Delete data from all tables
    for (const table of tables) {
      try {
        await sequelize.query(`DELETE FROM ${table};`);
        await sequelize.query(`DELETE FROM sqlite_sequence WHERE name='${table}';`); // Reset autoincrement
        logger.info(`Cleared table ${table}`);
      } catch (err) {
        logger.warn(`Could not clear table ${table}: ${err.message}`);
      }
    }
    
    // Re-enable foreign key constraints
    await sequelize.query('PRAGMA foreign_keys = ON;');
    
    logger.info('Database reset successful!');
    logger.info('Now you can run node scripts/init-db.js to recreate demo data');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error resetting database:', error);
    process.exit(1);
  }
}

// Run the function
resetDatabase(); 