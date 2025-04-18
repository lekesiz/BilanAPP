const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Document extends Model {}

Document.init({
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
        'CV', 
        'Lettre de Motivation', 
        'Résultats Tests', 
        'Synthèse', 
        'Plan d\'Action', 
        'Administratif', 
        'Convention',
        'Portfolio', 
        'Autre'
    ),
    allowNull: true
  },
  // --- Bilan Aşaması İlişkisi ---
  bilanPhase: {
      type: DataTypes.ENUM(
          'Preliminaire', 
          'Investigation', 
          'Conclusion', 
          'Suivi', // Takip görüşmesi için
          'General' // Genel/Aşama dışı dokümanlar için
      ),
      allowNull: true // Belirli bir aşamaya atanmamış olabilir
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  beneficiaryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Beneficiaries',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  sequelize,
  modelName: 'Document'
});

module.exports = Document;
