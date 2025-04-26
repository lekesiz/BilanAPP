'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Mevcut tabloyu yedekle
    await queryInterface.renameTable('Documents', 'Documents_backup');

    // Yeni tabloyu oluştur
    await queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      originalName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM(
          'cv',
          'motivation_letter',
          'test_results',
          'synthesis',
          'action_plan',
          'administrative',
          'convention',
          'portfolio',
          'other'
        ),
        allowNull: true
      },
      phase: {
        type: Sequelize.ENUM(
          'preliminary',
          'investigation',
          'conclusion',
          'follow_up',
          'general'
        ),
        allowNull: true
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '{}'
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      isLatest: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      beneficiaryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Beneficiaries',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Indexler oluştur
    await queryInterface.addIndex('Documents', ['uploadedBy']);
    await queryInterface.addIndex('Documents', ['beneficiaryId']);
    await queryInterface.addIndex('Documents', ['category']);
    await queryInterface.addIndex('Documents', ['phase']);
    await queryInterface.addIndex('Documents', ['isLatest']);

    // Eski verileri yeni tabloya aktar
    await queryInterface.sequelize.query(`
      INSERT INTO Documents (
        id, fileName, originalName, filePath, fileType, fileSize, description,
        category, phase, uploadedBy, beneficiaryId, createdAt, updatedAt
      )
      SELECT 
        id, fileName, originalName, filePath, fileType, fileSize, description,
        CASE category
          WHEN 'CV' THEN 'cv'
          WHEN 'Lettre de Motivation' THEN 'motivation_letter'
          WHEN 'Résultats Tests' THEN 'test_results'
          WHEN 'Synthèse' THEN 'synthesis'
          WHEN "Plan d'Action" THEN 'action_plan'
          WHEN 'Administratif' THEN 'administrative'
          WHEN 'Convention' THEN 'convention'
          WHEN 'Portfolio' THEN 'portfolio'
          ELSE 'other'
        END as category,
        CASE bilanPhase
          WHEN 'Preliminaire' THEN 'preliminary'
          WHEN 'Investigation' THEN 'investigation'
          WHEN 'Conclusion' THEN 'conclusion'
          WHEN 'Suivi' THEN 'follow_up'
          ELSE 'general'
        END as phase,
        uploadedBy, beneficiaryId, createdAt, updatedAt
      FROM Documents_backup
    `);

    // Yedek tabloyu sil
    await queryInterface.dropTable('Documents_backup');
  },

  down: async (queryInterface, Sequelize) => {
    // Geri alma işlemi için yedek tabloyu geri yükle
    await queryInterface.renameTable('Documents', 'Documents_new');
    await queryInterface.renameTable('Documents_backup', 'Documents');
    await queryInterface.dropTable('Documents_new');
  }
}; 