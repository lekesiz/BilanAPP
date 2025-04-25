const { Model, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const logger = require('../config/logger');

class Document extends Model {}

Document.init(
  {
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        'CV',
        'Lettre de Motivation',
        'Résultats Tests',
        'Synthèse',
        "Plan d'Action",
        'Administratif',
        'Convention',
        'Portfolio',
        'Autre',
      ),
      allowNull: true,
    },
    // --- Bilan Aşaması İlişkisi ---
    bilanPhase: {
      type: DataTypes.ENUM(
        'Preliminaire',
        'Investigation',
        'Conclusion',
        'Suivi', // Takip görüşmesi için
        'General', // Genel/Aşama dışı dokümanlar için
      ),
      allowNull: true, // Belirli bir aşamaya atanmamış olabilir
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    beneficiaryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Beneficiaries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Document',
    hooks: {
      afterDestroy: async (document) => {
        if (document.filePath) {
          const fullPath = path.join(__dirname, '../public/uploads', document.filePath);
          logger.info(`[Hook afterDestroy] Attempting to delete file: ${fullPath}`);
          try {
            await fs.promises.unlink(fullPath);
            logger.info(`[Hook afterDestroy] Successfully deleted file: ${fullPath}`);
          } catch (err) {
            if (err.code === 'ENOENT') {
              logger.warn(`[Hook afterDestroy] File not found for deletion (ENOENT): ${fullPath}`);
            } else {
              logger.error(`[Hook afterDestroy] Error deleting file ${fullPath}:`, err);
            }
          }
        } else {
          logger.warn(`[Hook afterDestroy] Document ID ${document.id} destroyed, but no filePath found.`);
        }
      },
    },
  },
);

module.exports = Document;
