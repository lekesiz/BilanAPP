const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const { engine, create } = require('express-handlebars');
const dotenv = require('dotenv');
const helpers = require('./config/handlebars-helpers');

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

const app = express();

// Handlebars instance oluştur ve helperları kaydet
const hbs = create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: helpers,
  runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
  }
});

// Dinamik helperları kaydetmek için (registerDynamicHelpers yerine doğrudan registerHelper kullanılıyor)
hbs.handlebars.registerHelper('addHelper', function(name, helperFunc) {
    hbs.handlebars.registerHelper(name, helperFunc);
});
hbs.handlebars.registerHelper('JSONparse', function(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch(e) {
        console.error("Handlebars JSONparse error:", e);
        return [];
    }
});

// Configuration du moteur de template Handlebars
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_temporaire',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Configuration de Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuration de Flash
app.use(flash());

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
  res.locals.user = req.user || null;
  // Aktif rotayı locale ekle (navbar'da kullanmak için)
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

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Page non trouvée',
    message: 'La page que vous recherchez n\'existe pas.',
    error: { status: 404 }
  });
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  // Variables locales, uniquement en développement
  const status = err.status || 500;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Rendu de la page d'erreur
  res.status(status);
  res.render('error', {
    title: 'Erreur',
    message: err.message,
    error: { status }
  });
});

module.exports = app;
