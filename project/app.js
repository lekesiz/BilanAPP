const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const { engine } = require('express-handlebars');
const dotenv = require('dotenv');

// Chargement des variables d'environnement
dotenv.config();

// Configuration de Passport
require('./config/passport')();

// Importation des routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');

const app = express();

// Configuration du moteur de template Handlebars
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
      eq(a, b) {
        return a === b;
      },
    },
  }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  }),
);

// Configuration de Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuration de Flash
app.use(flash());

// Variables globales
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Page non trouvée',
    message: "La page que vous recherchez n'existe pas.",
    error: { status: 404 },
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
    error: { status },
  });
});

module.exports = app;
