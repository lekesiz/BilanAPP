require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'bilan_app_development',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: console.log
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'bilan_app_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'sqlite',
    storage: 'database_test.sqlite',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'sqlite',
    storage: 'database_production.sqlite',
    logging: false
  }
};
