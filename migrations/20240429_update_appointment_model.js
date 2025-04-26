'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Mevcut tabloyu yedekle
    await queryInterface.renameTable('Appointments', 'Appointments_backup');

    // Yeni tabloyu oluştur
    await queryInterface.createTable('Appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      consultantId: {
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
        allowNull: false,
        references: {
          model: 'Beneficiaries',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM(
          'preliminary_interview',
          'investigation_interview',
          'synthesis_interview',
          'test_session',
          'follow_up',
          'other'
        ),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '{}'
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
        defaultValue: 'scheduled',
        allowNull: false
      },
      cancellationReason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reminderSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      reminderSentAt: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.addIndex('Appointments', ['consultantId']);
    await queryInterface.addIndex('Appointments', ['beneficiaryId']);
    await queryInterface.addIndex('Appointments', ['date']);
    await queryInterface.addIndex('Appointments', ['status']);
    await queryInterface.addIndex('Appointments', ['type']);

    // Eski verileri yeni tabloya aktar
    await queryInterface.sequelize.query(`
      INSERT INTO Appointments (
        id, consultantId, beneficiaryId, date, type, description, location, status,
        createdAt, updatedAt
      )
      SELECT 
        id, consultantId, beneficiaryId, date, 
        CASE type
          WHEN 'preliminary' THEN 'preliminary_interview'
          WHEN 'investigation' THEN 'investigation_interview'
          WHEN 'synthesis' THEN 'synthesis_interview'
          WHEN 'test' THEN 'test_session'
          WHEN 'follow-up' THEN 'follow_up'
          ELSE 'other'
        END as type,
        description, location, status,
        createdAt, updatedAt
      FROM Appointments_backup
    `);

    // Yedek tabloyu sil
    await queryInterface.dropTable('Appointments_backup');
  },

  down: async (queryInterface, Sequelize) => {
    // Geri alma işlemi için yedek tabloyu geri yükle
    await queryInterface.renameTable('Appointments', 'Appointments_new');
    await queryInterface.renameTable('Appointments_backup', 'Appointments');
    await queryInterface.dropTable('Appointments_new');
  }
}; 