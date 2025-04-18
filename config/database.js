const { Sequelize } = require('sequelize');
const path = require('path');

// Création d'une instance Sequelize avec SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

// Test de la connexion
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
