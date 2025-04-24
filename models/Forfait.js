const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Forfait extends Model {}

Forfait.init(
  {
    name: {
      // Paket Adı (Primary Key olacak)
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    defaultCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    features: {
      // Özellikler (şimdilik TEXT, JSON da olabilir)
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        // Veritabanından çekerken JSON'a parse et (eğer JSON saklarsak)
        // const rawValue = this.getDataValue('features');
        // return rawValue ? JSON.parse(rawValue) : [];
        // Şimdilik TEXT olarak bırakıp, view'da split edelim
        return this.getDataValue('features');
      },
      set(value) {
        // Veritabanına yazarken JSON'a çevir (eğer JSON saklarsak)
        // this.setDataValue('features', JSON.stringify(value || []));
        // Şimdilik TEXT olarak bırakalım
        this.setDataValue('features', Array.isArray(value) ? value.join('\n') : value);
      },
    },
    // Yeni: Maksimum Yararlanıcı Sayısı
    maxBeneficiaries: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = sınırsız
      defaultValue: null,
    },
    // Yeni: Aylık Maksimum AI Kullanımı
    maxAiGenerationsMonthly: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = sınırsız
      defaultValue: null,
      comment: 'Maximum AI generations allowed per month (null for unlimited)',
    },
    // isActive gibi alanlar eklenebilir
  },
  {
    sequelize,
    modelName: 'Forfait',
    timestamps: false, // createdAt/updatedAt gerekmez
  },
);

// User ile ilişki (Bir kullanıcı bir pakete ait olabilir)
// Bu ilişki User modelinde foreignKey ile zaten kurulabilir
// Forfait.hasMany(User, { foreignKey: 'forfaitType' });

module.exports = Forfait;
