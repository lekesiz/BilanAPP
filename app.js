const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./config/logger');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const { create } = require('express-handlebars');
const dotenv = require('dotenv');
const helpers = require('./config/handlebars-helpers');
const csrf = require('csurf');

// Chargement des variables d'environnement
dotenv.config();

// Configuration de Passport
require('./config/passport')();

// Importation des routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const beneficiariesRouter = require('./routes/beneficiaries');
const appointmentsRouter = require('./routes/appointments');
const messagesRouter = require('./routes/messages');
const questionnairesRouter = require('./routes/questionnaires');
const documentsRouter = require('./routes/documents');
const profileRouter = require('./routes/profile');
const reportsRouter = require('./routes/reports');
const adminRouter = require('./routes/admin');
const aiRouter = require('./routes/ai');
// const careerExplorerRouter = require('./routes/careerExplorer');

const app = express();

// Handlebars instance oluştur ve helperları kaydet
const hbs = create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: false,
    allowProtoMethodsByDefault: false,
  },
});

// Dinamik helperları kaydetmek için (registerDynamicHelpers yerine doğrudan registerHelper kullanılıyor)
hbs.handlebars.registerHelper('addHelper', (name, helperFunc) => {
  hbs.handlebars.registerHelper(name, helperFunc);
});
hbs.handlebars.registerHelper('JSONparse', (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Handlebars JSONparse error:', e);
    return [];
  }
});

// Configuration du moteur de template Handlebars
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(require('morgan')('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret_temporaire',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  }),
);

// Configuration de Flash (CSRF'den ÖNCE)
app.use(flash());

// Configuration de Passport
app.use(passport.initialize());
app.use(passport.session());

// CSRF Koruması - Form parser, session, flash, passport'tan SONRA
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// CSRF Token'ını locals'a ekle (view'larda kullanmak için)
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Her istek için pageScripts dizisini başlat
app.use((req, res, next) => {
  res.locals.pageScripts = [];
  next();
});

// Variables globales
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.user = req.user ? req.user.get({ plain: true }) : null;
  res.locals.currentRoute = req.path;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/beneficiaries', beneficiariesRouter);
app.use('/appointments', appointmentsRouter);
app.use('/messages', messagesRouter);
app.use('/questionnaires', questionnairesRouter);
app.use('/documents', documentsRouter);
app.use('/profile', profileRouter);
app.use('/reports', reportsRouter);
app.use('/admin', adminRouter);
app.use('/ai', aiRouter);
// app.use('/career-explorer', careerExplorerRouter);

// Gestion des erreurs 404
app.use((req, res, next) => {
  const err = new Error("La page que vous recherchez n'existe pas.");
  err.status = 404;
  logger.warn(`404 Not Found - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  next(err);
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    { error: err },
  );

  if (err.code === 'EBADCSRFTOKEN') {
    return res.redirect(req.headers.referer || '/');
  }

  const status = err.status || 500;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (req.flash) {
    req.flash('error_msg', res.locals.message || 'Une erreur inattendue est survenue.');
  }

  res.status(status);
  res.render('error', {
    title: 'Erreur',
    message: err.message,
    error: { status },
  });
});

module.exports = app;
