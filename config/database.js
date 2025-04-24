const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ana .env dosyasını her zaman yükle

// Test ortamı için ayrı veritabanı yolu
const storagePath =
  process.env.NODE_ENV === 'test'
    ? './database_test.sqlite'
    : process.env.DB_STORAGE || './database.sqlite';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Sadece geliştirme ortamında logla
});

// Bağlantıyı test et (isteğe bağlı)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  }
}

testConnection();

module.exports = sequelize;
