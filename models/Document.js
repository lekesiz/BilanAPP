const { Model, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

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
          const fullPath = path.join(__dirname, '../public', document.filePath); // Assuming filePath starts with /uploads/
          console.log(`Attempting to delete file: ${fullPath}`);
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`Error deleting file ${fullPath}:`, err);
              // Decide if you want to throw an error or just log it
            } else {
              console.log(`Successfully deleted file: ${fullPath}`);
            }
          });
        } else {
          console.warn(`Document ID ${document.id} destroyed, but no filePath found.`);
        }
      },
    },
  },
);

module.exports = Document;
