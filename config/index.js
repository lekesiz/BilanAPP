require('dotenv').config();

module.exports = {
  app: {
    name: process.env.APP_NAME || 'Bilan App',
    url: process.env.APP_URL || 'http://localhost:3000',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/bilan-app',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    name: 'bilan.sid'
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    from: process.env.MAIL_FROM || 'noreply@bilanapp.com'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: '1d'
  },
  upload: {
    dir: 'uploads',
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },
  pagination: {
    perPage: 10
  }
}; 