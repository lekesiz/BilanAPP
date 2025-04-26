const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const { errorHandler } = require('./middlewares/errorHandler');
const { logger: winstonLogger } = require('./utils/logger');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { engine } = require('express-handlebars');
const config = require('@config');

// Passport config
require('./config/passport')(passport);

const app = express();

// MongoDB bağlantısı
mongoose.connect(config.mongodb.url, config.mongodb.options)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// View engine
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    ...require('./helpers/admin'),
    ...require('./helpers/dashboard')
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
app.use(logger('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongodb.url,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 gün
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/beneficiaries', require('./routes/beneficiaries'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/questionnaires', require('./routes/questionnaires'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/activity-logs', require('./routes/activityLogs'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/email-templates', require('./routes/emailTemplates'));

// Error handling
app.use(errorHandler);

module.exports = app;
