const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CreditLog extends Model {}

CreditLog.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE' // Kullanıcı silinirse logları da sil
  },
  action: { // Yapılan işlem (örn: ANKET_ATAMA, DOC_YUKLEME)
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: { // Harcanan (-) veya eklenen (+) kredi miktarı
    type: DataTypes.INTEGER,
    allowNull: false 
  },
  description: { // İşlem açıklaması (örn: Anket 'XYZ' atandı)
    type: DataTypes.STRING,
    allowNull: true
  },
  relatedResourceId: { // İlişkili kaynağın ID'si (örn: Questionnaire ID)
      type: DataTypes.INTEGER,
      allowNull: true
  },
  relatedResourceType: { // İlişkili kaynağın türü (örn: 'Questionnaire')
      type: DataTypes.STRING,
      allowNull: true
  },
  adminUserId: { // İşlemi yapan adminin ID'si
      type: DataTypes.INTEGER,
      allowNull: true, // Her log bir admin tarafından yapılmamış olabilir
      references: {
          model: 'Users',
          key: 'id'
      },
      onDelete: 'SET NULL' // Admin silinirse logdan admin bilgisi kalksın
  },
  // timestamp (createdAt) otomatik olarak Sequelize tarafından eklenir
}, {
  sequelize,
  modelName: 'CreditLog',
  timestamps: true, // createdAt ve updatedAt alanlarını etkinleştir
  updatedAt: false // updatedAt alanına gerek yok
});

module.exports = CreditLog; 