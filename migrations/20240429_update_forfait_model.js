'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Mevcut tabloyu yedekle
    await queryInterface.renameTable('Forfaits', 'Forfaits_backup');

    // Yeni tabloyu oluştur
    await queryInterface.createTable('Forfaits', {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      defaultCredits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      features: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '[]',
      },
      maxBeneficiaries: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      maxAiGenerationsMonthly: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'archived'),
        allowNull: false,
        defaultValue: 'active',
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'EUR',
      },
      validityPeriod: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      autoRenew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '{}',
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
    await queryInterface.addIndex('Forfaits', ['status']);
    await queryInterface.addIndex('Forfaits', ['price']);
    await queryInterface.addIndex('Forfaits', ['autoRenew']);

    // Eski verileri yeni tabloya aktar
    await queryInterface.sequelize.query(`
      INSERT INTO Forfaits (
        name, description, defaultCredits, features, maxBeneficiaries,
        maxAiGenerationsMonthly, status, price, currency, validityPeriod,
        autoRenew, metadata, createdAt, updatedAt
      )
      SELECT 
        name, description, defaultCredits,
        CASE 
          WHEN features IS NULL THEN '[]'
          ELSE JSON_ARRAY(features)
        END as features,
        maxBeneficiaries, maxAiGenerationsMonthly,
        'active' as status,
        0 as price,
        'EUR' as currency,
        30 as validityPeriod,
        false as autoRenew,
        '{}' as metadata,
        CURRENT_TIMESTAMP as createdAt,
        CURRENT_TIMESTAMP as updatedAt
      FROM Forfaits_backup
    `);

    // Yedek tabloyu sil
    await queryInterface.dropTable('Forfaits_backup');
  },

  down: async (queryInterface, Sequelize) => {
    // Geri alma işlemi için yedek tabloyu geri yükle
    await queryInterface.renameTable('Forfaits', 'Forfaits_new');
    await queryInterface.renameTable('Forfaits_backup', 'Forfaits');
    await queryInterface.dropTable('Forfaits_new');
  }
}; 