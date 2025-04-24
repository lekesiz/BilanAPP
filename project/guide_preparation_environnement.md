# Guide de préparation de l'environnement de développement

# Plateforme de gestion des bilans de compétences - MVP minimal

## Introduction

Ce guide détaille les étapes pour mettre en place un environnement de développement léger mais complet pour le MVP minimal de la plateforme de gestion des bilans de compétences. Il est conçu pour un développeur unique et privilégie la simplicité et la rapidité de mise en œuvre.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

1. **Node.js** (version LTS recommandée, 16.x ou plus récente)

   - Téléchargement : https://nodejs.org/

2. **Git**

   - Téléchargement : https://git-scm.com/downloads

3. **Visual Studio Code**

   - Téléchargement : https://code.visualstudio.com/

4. **SQLite Browser** (optionnel mais utile)
   - Téléchargement : https://sqlitebrowser.org/

## Étape 1 : Configuration de l'environnement de base

### Installation des extensions VS Code

Ouvrez VS Code et installez les extensions suivantes :

1. ESLint
2. Prettier
3. SQLite
4. Handlebars
5. GitLens
6. Live Server
7. Node.js Extension Pack

### Configuration de Git

```bash
# Configurez votre identité Git
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@exemple.com"

# Créez un nouveau dépôt GitHub pour le projet
# Puis initialisez votre dépôt local
mkdir bilan-competences-app
cd bilan-competences-app
git init
git remote add origin https://github.com/votre-username/bilan-competences-app.git
```

## Étape 2 : Création du projet Express.js

### Installation des outils globaux

```bash
# Installez nodemon pour le rechargement automatique
npm install -g nodemon

# Installez Sequelize CLI pour la gestion de la base de données
npm install -g sequelize-cli
```

### Génération du projet de base

```bash
# Utilisez Express Generator pour créer la structure de base
npx express-generator --view=hbs

# Installez les dépendances
npm install

# Testez que tout fonctionne
npm start
```

Ouvrez votre navigateur à l'adresse `http://localhost:3000` pour vérifier que l'application fonctionne.

## Étape 3 : Configuration de la structure du projet

Réorganisez la structure du projet pour qu'elle soit plus claire et maintenable :

```bash
# Créez les dossiers nécessaires
mkdir -p models config controllers middlewares public/uploads views/layouts views/partials
```

Voici la structure recommandée :

```
bilan-competences-app/
├── config/               # Configuration (base de données, auth, etc.)
├── controllers/          # Logique de traitement des requêtes
├── middlewares/          # Middlewares personnalisés
├── models/               # Modèles de données
├── public/               # Fichiers statiques
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/          # Fichiers uploadés
├── routes/               # Définition des routes
├── views/                # Templates Handlebars
│   ├── layouts/          # Layouts principaux
│   ├── partials/         # Composants réutilisables
│   └── ...               # Vues spécifiques
├── app.js                # Point d'entrée de l'application
├── package.json
└── README.md
```

## Étape 4 : Installation des dépendances essentielles

```bash
# Dépendances principales
npm install express-session passport passport-local bcrypt connect-flash
npm install multer nodemailer dotenv helmet morgan
npm install sqlite3 sequelize

# Dépendances de développement
npm install --save-dev nodemon
```

## Étape 5 : Configuration de la base de données

### Initialisation de Sequelize

```bash
# Initialisez Sequelize
npx sequelize-cli init
```

### Configuration de la connexion SQLite

Créez un fichier `config/database.js` :

```javascript
const path = require("path");

module.exports = {
  development: {
    dialect: "sqlite",
    storage: path.join(__dirname, "../database.sqlite"),
    logging: false,
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
  production: {
    dialect: "sqlite",
    storage: path.join(__dirname, "../database.sqlite"),
    logging: false,
  },
};
```

Mettez à jour le fichier `config/config.json` généré par Sequelize avec ces paramètres.

## Étape 6 : Configuration de l'authentification

### Création du modèle User

```bash
npx sequelize-cli model:generate --name User --attributes email:string,password:string,firstName:string,lastName:string,userType:enum:'{consultant,beneficiary}'
```

### Configuration de Passport.js

Créez un fichier `config/passport.js` :

```javascript
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User } = require("../models");

module.exports = (app) => {
  // Configuration de Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Stratégie locale
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });

          if (!user) {
            return done(null, false, { message: "Email non trouvé" });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: "Mot de passe incorrect" });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  // Sérialisation/désérialisation
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
```

## Étape 7 : Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```
# Environnement
NODE_ENV=development

# Serveur
PORT=3000

# Session
SESSION_SECRET=votre_secret_tres_securise

# Email (à configurer plus tard)
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASS=
```

Créez également un fichier `.env.example` sans les valeurs sensibles pour le versionnement.

## Étape 8 : Mise à jour du fichier app.js

Modifiez le fichier `app.js` pour intégrer toutes les configurations :

```javascript
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const helmet = require("helmet");
const dotenv = require("dotenv");

// Chargement des variables d'environnement
dotenv.config();

// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// Configuration des vues
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Middlewares
app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configuration de la session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  }),
);

// Configuration de Flash
app.use(flash());

// Configuration de Passport
require("./config/passport")(app);

// Variables globales
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

// Gestion des erreurs 404
app.use((req, res, next) => {
  next(createError(404));
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  // Variables locales, uniquement en développement
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Rendu de la page d'erreur
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
```

## Étape 9 : Création des layouts et partials de base

### Layout principal

Créez un fichier `views/layouts/main.hbs` :

```handlebars
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - Plateforme Bilan de Compétences</title>

  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Custom CSS -->
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  {{> header}}

  <div class="container mt-4">
    {{> messages}}
    {{{body}}}
  </div>

  {{> footer}}

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Custom JS -->
  <script src="/js/main.js"></script>
</body>
</html>
```

### Partials

Créez les partials suivants :

`views/partials/header.hbs` :

```handlebars
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
  <div class="container">
    <a class="navbar-brand" href="/">Bilan de Compétences</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto">
        {{#if user}}
          {{#if (eq user.userType "consultant")}}
            <li class="nav-item">
              <a class="nav-link" href="/beneficiaries">Bénéficiaires</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/appointments">Rendez-vous</a>
            </li>
          {{else}}
            <li class="nav-item">
              <a class="nav-link" href="/dashboard">Mon bilan</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/appointments">Mes rendez-vous</a>
            </li>
          {{/if}}
          <li class="nav-item">
            <a class="nav-link" href="/messages">Messages</a>
          </li>
        {{/if}}
      </ul>
      <ul class="navbar-nav">
        {{#if user}}
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              {{user.firstName}}
              {{user.lastName}}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="/profile">Mon profil</a></li>
              <li><hr class="dropdown-divider" /></li>
              <li><a
                  class="dropdown-item"
                  href="/auth/logout"
                >Déconnexion</a></li>
            </ul>
          </li>
        {{else}}
          <li class="nav-item">
            <a class="nav-link" href="/auth/login">Connexion</a>
          </li>
        {{/if}}
      </ul>
    </div>
  </div>
</nav>
```

`views/partials/footer.hbs` :

```handlebars
<footer class="footer mt-auto py-3 bg-light">
  <div class="container text-center">
    <span class="text-muted">© 2025 Plateforme Bilan de Compétences - MVP</span>
  </div>
</footer>
```

`views/partials/messages.hbs` :

```handlebars
{{#if success_msg}}
  <div class="alert alert-success alert-dismissible fade show">
    {{success_msg}}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
{{/if}}

{{#if error_msg}}
  <div class="alert alert-danger alert-dismissible fade show">
    {{error_msg}}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
{{/if}}

{{#if error}}
  <div class="alert alert-danger alert-dismissible fade show">
    {{error}}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
{{/if}}
```

## Étape 10 : Création des fichiers CSS et JS de base

### CSS personnalisé

Créez un fichier `public/css/style.css` :

```css
/* Styles généraux */
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

/* Styles pour les formulaires */
.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* Styles pour les cartes */
.card {
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Styles pour les tableaux */
.table-container {
  overflow-x: auto;
}

/* Styles pour la page de connexion */
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}
```

### JavaScript personnalisé

Créez un fichier `public/js/main.js` :

```javascript
// Fonction pour initialiser les tooltips Bootstrap
function initTooltips() {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Fonction pour initialiser les popovers Bootstrap
function initPopovers() {
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]'),
  );
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

// Fonction pour confirmer les suppressions
function confirmDelete(event, message) {
  if (!confirm(message || "Êtes-vous sûr de vouloir supprimer cet élément ?")) {
    event.preventDefault();
    return false;
  }
  return true;
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
  initTooltips();
  initPopovers();

  // Gestionnaire pour les boutons de suppression
  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", function (e) {
      confirmDelete(e, this.getAttribute("data-confirm-message"));
    });
  });
});
```

## Étape 11 : Création de la page d'accueil et de connexion

### Page d'accueil

Modifiez le fichier `views/index.hbs` :

```handlebars
<div class="jumbotron text-center my-5">
  <h1 class="display-4">Plateforme de Gestion des Bilans de Compétences</h1>
  <p class="lead">Un outil simple et efficace pour gérer vos bilans de
    compétences</p>
  <hr class="my-4" />
  <p>Connectez-vous pour accéder à votre espace personnel</p>
  <a
    class="btn btn-primary btn-lg"
    href="/auth/login"
    role="button"
  >Connexion</a>
</div>

<div class="row mt-5">
  <div class="col-md-4">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Pour les consultants</h5>
        <p class="card-text">Gérez vos bénéficiaires, planifiez vos rendez-vous
          et suivez l'avancement des bilans.</p>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Pour les bénéficiaires</h5>
        <p class="card-text">Suivez l'avancement de votre bilan, accédez à vos
          documents et communiquez avec votre consultant.</p>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Simple et efficace</h5>
        <p class="card-text">Une interface intuitive pour vous concentrer sur
          l'essentiel : l'accompagnement des bénéficiaires.</p>
      </div>
    </div>
  </div>
</div>
```

### Page de connexion

Créez un fichier `views/auth/login.hbs` :

```handlebars
<div class="login-page">
  <div class="form-container">
    <h2 class="text-center mb-4">Connexion</h2>

    <form action="/auth/login" method="POST">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          id="email"
          name="email"
          required
        />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Mot de passe</label>
        <input
          type="password"
          class="form-control"
          id="password"
          name="password"
          required
        />
      </div>
      <div class="d-grid gap-2">
        <button type="submit" class="btn btn-primary">Se connecter</button>
      </div>
    </form>
  </div>
</div>
```

## Étape 12 : Configuration des routes d'authentification

Créez un fichier `routes/auth.js` :

```javascript
const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const { User } = require("../models");

// Page de connexion
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  res.render("auth/login", { title: "Connexion" });
});

// Traitement de la connexion
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
);

// Déconnexion
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Vous êtes déconnecté");
  res.redirect("/");
});

module.exports = router;
```

Mettez à jour le fichier `app.js` pour inclure ces routes :

```javascript
// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

// ...

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
```

## Étape 13 : Création du middleware d'authentification

Créez un fichier `middlewares/auth.js` :

```javascript
module.exports = {
  // Vérifier si l'utilisateur est authentifié
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Veuillez vous connecter pour accéder à cette page");
    res.redirect("/auth/login");
  },

  // Vérifier si l'utilisateur est un consultant
  ensureConsultant: (req, res, next) => {
    if (req.isAuthenticated() && req.user.userType === "consultant") {
      return next();
    }
    req.flash("error_msg", "Accès non autorisé");
    res.redirect("/dashboard");
  },

  // Vérifier si l'utilisateur est un bénéficiaire
  ensureBeneficiary: (req, res, next) => {
    if (req.isAuthenticated() && req.user.userType === "beneficiary") {
      return next();
    }
    req.flash("error_msg", "Accès non autorisé");
    res.redirect("/dashboard");
  },
};
```

## Étape 14 : Création du tableau de bord

Créez un fichier `routes/dashboard.js` :

```javascript
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middlewares/auth");

// Tableau de bord principal (redirection selon le type d'utilisateur)
router.get("/", ensureAuthenticated, (req, res) => {
  if (req.user.userType === "consultant") {
    res.redirect("/dashboard/consultant");
  } else {
    res.redirect("/dashboard/beneficiary");
  }
});

// Tableau de bord consultant
router.get("/consultant", ensureAuthenticated, (req, res) => {
  if (req.user.userType !== "consultant") {
    return res.redirect("/dashboard");
  }

  res.render("dashboard/consultant", {
    title: "Tableau de bord Consultant",
    user: req.user,
  });
});

// Tableau de bord bénéficiaire
router.get("/beneficiary", ensureAuthenticated, (req, res) => {
  if (req.user.userType !== "beneficiary") {
    return res.redirect("/dashboard");
  }

  res.render("dashboard/beneficiary", {
    title: "Mon Bilan de Compétences",
    user: req.user,
  });
});

module.exports = router;
```

Créez les vues correspondantes :

`views/dashboard/consultant.hbs` :

```handlebars
<h1 class="mb-4">Tableau de bord Consultant</h1>

<div class="row">
  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">Mes bénéficiaires</h5>
      </div>
      <div class="card-body">
        <p>Vous n'avez pas encore de bénéficiaires.</p>
        <a href="/beneficiaries/new" class="btn btn-primary">Ajouter un
          bénéficiaire</a>
      </div>
    </div>
  </div>

  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">Prochains rendez-vous</h5>
      </div>
      <div class="card-body">
        <p>Vous n'avez pas de rendez-vous à venir.</p>
        <a href="/appointments/new" class="btn btn-primary">Planifier un
          rendez-vous</a>
      </div>
    </div>
  </div>
</div>

<div class="row">
  <div class="col-md-12">
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Messages récents</h5>
      </div>
      <div class="card-body">
        <p>Vous n'avez pas de messages récents.</p>
        <a href="/messages" class="btn btn-primary">Voir tous les messages</a>
      </div>
    </div>
  </div>
</div>
```

`views/dashboard/beneficiary.hbs` :

```handlebars
<h1 class="mb-4">Mon Bilan de Compétences</h1>

<div class="row">
  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">Mon consultant</h5>
      </div>
      <div class="card-body">
        <p>Information non disponible</p>
      </div>
    </div>
  </div>

  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">Prochains rendez-vous</h5>
      </div>
      <div class="card-body">
        <p>Vous n'avez pas de rendez-vous à venir.</p>
      </div>
    </div>
  </div>
</div>

<div class="row">
  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">Mes questionnaires</h5>
      </div>
      <div class="card-body">
        <p>Vous n'avez pas de questionnaires à compléter.</p>
      </div>
    </div>
  </div>

  <div class="col-md-6">
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">Mes documents</h5>
      </div>
      <div class="card-body">
        <p>Vous n'avez pas encore de documents.</p>
      </div>
    </div>
  </div>
</div>
```

Mettez à jour le fichier `app.js` pour inclure ces routes :

```javascript
// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");

// ...

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
```

## Étape 15 : Création d'un script de démarrage

Modifiez le fichier `package.json` pour ajouter un script de développement :

```json
"scripts": {
  "start": "node ./bin/www",
  "dev": "nodemon ./bin/www"
}
```

## Étape 16 : Création d'un utilisateur de test

Créez un fichier `scripts/create-test-user.js` :

```javascript
const bcrypt = require("bcrypt");
const { User } = require("../models");
const dotenv = require("dotenv");

dotenv.config();

async function createTestUsers() {
  try {
    // Hachage des mots de passe
    const saltRounds = 10;
    const consultantPassword = await bcrypt.hash("consultant123", saltRounds);
    const beneficiaryPassword = await bcrypt.hash("beneficiary123", saltRounds);

    // Création d'un consultant de test
    await User.create({
      email: "consultant@test.com",
      password: consultantPassword,
      firstName: "Jean",
      lastName: "Dupont",
      userType: "consultant",
    });

    // Création d'un bénéficiaire de test
    await User.create({
      email: "beneficiaire@test.com",
      password: beneficiaryPassword,
      firstName: "Marie",
      lastName: "Martin",
      userType: "beneficiary",
    });

    console.log("Utilisateurs de test créés avec succès !");
    console.log("Consultant: consultant@test.com / consultant123");
    console.log("Bénéficiaire: beneficiaire@test.com / beneficiary123");

    process.exit(0);
  } catch (error) {
    console.error(
      "Erreur lors de la création des utilisateurs de test:",
      error,
    );
    process.exit(1);
  }
}

// Exécution de la fonction
createTestUsers();
```

## Étape 17 : Création d'un README

Créez un fichier `README.md` à la racine du projet :

```markdown
# Plateforme de Gestion des Bilans de Compétences - MVP

Une application web simple pour gérer les bilans de compétences.

## Fonctionnalités

- Authentification (consultant/bénéficiaire)
- Gestion des bénéficiaires
- Planification des rendez-vous
- Questionnaires en ligne
- Gestion documentaire
- Messagerie interne

## Prérequis

- Node.js (v16.x ou plus récent)
- npm

## Installation

1. Cloner le dépôt
```

git clone https://github.com/votre-username/bilan-competences-app.git
cd bilan-competences-app

```

2. Installer les dépendances
```

npm install

```

3. Configurer les variables d'environnement
```

cp .env.example .env

# Modifier le fichier .env selon vos besoins

```

4. Exécuter les migrations
```

npx sequelize-cli db:migrate

```

5. Créer des utilisateurs de test (optionnel)
```

node scripts/create-test-user.js

```

6. Démarrer l'application
```

npm run dev

```

7. Accéder à l'application
```

http://localhost:3000

```

## Développement

- `npm run dev` : Démarrer le serveur avec rechargement automatique
- `npm start` : Démarrer le serveur en mode production

## Structure du projet

- `config/` : Configuration (base de données, auth, etc.)
- `controllers/` : Logique de traitement des requêtes
- `middlewares/` : Middlewares personnalisés
- `models/` : Modèles de données
- `public/` : Fichiers statiques
- `routes/` : Définition des routes
- `views/` : Templates Handlebars

## Utilisateurs de test

- Consultant : consultant@test.com / consultant123
- Bénéficiaire : beneficiaire@test.com / beneficiary123
```

## Étape 18 : Initialisation de Git et premier commit

```bash
# Créez un fichier .gitignore
echo "node_modules/
.env
*.sqlite
npm-debug.log
.DS_Store" > .gitignore

# Initialisez Git et faites le premier commit
git add .
git commit -m "Configuration initiale du projet"
git push -u origin main
```

## Étape 19 : Démarrage et test de l'application

```bash
# Exécutez les migrations
npx sequelize-cli db:migrate

# Créez les utilisateurs de test
node scripts/create-test-user.js

# Démarrez l'application en mode développement
npm run dev
```

Ouvrez votre navigateur à l'adresse `http://localhost:3000` et testez la connexion avec les utilisateurs de test.

## Conclusion

Vous avez maintenant un environnement de développement léger mais complet pour commencer à développer le MVP de la plateforme de gestion des bilans de compétences. Cette configuration inclut :

- Une structure de projet claire et organisée
- Un système d'authentification fonctionnel
- Des tableaux de bord de base pour les consultants et bénéficiaires
- Une interface utilisateur responsive avec Bootstrap
- Une base de données SQLite simple à utiliser

Vous pouvez maintenant commencer à développer les fonctionnalités spécifiques du MVP en suivant le planning établi précédemment.

## Prochaines étapes

1. Développer la gestion des bénéficiaires
2. Mettre en place la planification des rendez-vous
3. Créer les questionnaires simples
4. Implémenter la gestion documentaire
5. Développer la messagerie interne

Bon développement !
