# Architecture technique simplifiée pour développeur unique

# Plateforme de gestion des bilans de compétences - MVP minimal

## Introduction

Ce document présente une architecture technique simplifiée pour le MVP minimal de la plateforme de gestion des bilans de compétences, conçue spécifiquement pour être réalisable par un développeur unique avec mon assistance. Cette architecture privilégie la simplicité, la rapidité de développement et l'utilisation de composants prêts à l'emploi.

## Principes directeurs

1. **Simplicité maximale** : Réduire la complexité technique à son minimum
2. **Courbe d'apprentissage faible** : Utiliser des technologies accessibles et bien documentées
3. **Composants prêts à l'emploi** : Maximiser l'utilisation de bibliothèques et frameworks existants
4. **Maintenance facile** : Architecture claire et facile à maintenir
5. **Évolutivité raisonnable** : Permettre l'évolution future sans surconception initiale

## Vue d'ensemble de l'architecture

Pour ce MVP minimal, nous recommandons une architecture monolithique simple plutôt qu'une architecture distribuée complexe. Cette approche réduit considérablement la complexité et accélère le développement.

### Diagramme d'architecture simplifiée

```
+------------------+        +------------------+        +------------------+
|                  |        |                  |        |                  |
|  FRONTEND        |        |  BACKEND         |        |  BASE DE DONNÉES |
|  (Pages web)     | <----> |  (Même serveur)  | <----> |  (SQLite)        |
|  HTML/CSS/JS     |  HTTP  |  Node.js/Express |  SQL   |                  |
|                  |        |                  |        |                  |
+------------------+        +------------------+        +------------------+
                                    ^
                                    |
                                    v
                            +------------------+
                            |                  |
                            |  STOCKAGE        |
                            |  FICHIERS        |
                            |  (Local)         |
                            |                  |
                            +------------------+
```

## Stack technologique simplifiée

### Frontend

Pour simplifier le développement frontend, nous recommandons d'éviter les frameworks complexes comme React et d'opter pour une approche plus directe :

- **HTML/CSS/JavaScript** standard
- **Bootstrap 5** pour le design responsive sans effort
- **jQuery** pour la manipulation du DOM et les requêtes AJAX
- **Handlebars** comme moteur de template côté serveur

Cette approche présente plusieurs avantages pour un développeur unique :

- Courbe d'apprentissage beaucoup plus faible que React
- Pas besoin de build process complexe
- Rendu côté serveur qui simplifie le développement
- Documentation abondante et exemples disponibles

### Backend

- **Node.js avec Express.js**

  - Framework léger et facile à apprendre
  - Grande communauté et documentation abondante
  - Nombreux middlewares disponibles

- **Bibliothèques essentielles** :

  - **express-session** : Gestion des sessions
  - **passport.js** : Authentification simplifiée
  - **multer** : Gestion des uploads de fichiers
  - **nodemailer** : Envoi d'emails
  - **pdfkit** : Génération de PDF simple
  - **express-handlebars** : Moteur de templates

- **Structure simplifiée** :
  - Routes
  - Contrôleurs
  - Modèles
  - Vues (templates Handlebars)
  - Middlewares
  - Utilitaires

### Base de données

Pour simplifier l'installation et la maintenance :

- **SQLite** pour le MVP minimal

  - Base de données fichier, pas besoin d'installer un serveur
  - Parfait pour les applications à faible volume
  - Zéro configuration
  - Facile à sauvegarder (simple fichier)

- **Sequelize** comme ORM simplifié
  - Abstraction de la base de données
  - Migrations simples
  - Possibilité de passer à PostgreSQL plus tard sans réécrire le code

### Stockage de fichiers

- **Système de fichiers local**
  - Stockage direct sur le serveur
  - Organisation par dossiers (par utilisateur/bénéficiaire)
  - Simplicité maximale

### Déploiement

Pour un déploiement simple et économique :

- **Heroku** ou **Render**
  - Déploiement en quelques clics
  - Tier gratuit disponible pour les tests
  - Scaling facile si nécessaire
  - Intégration Git

## Schéma de base de données simplifié

Pour le MVP minimal, nous réduisons le schéma à 8 tables essentielles :

1. **users**

   - id (PK)
   - email
   - password_hash
   - first_name
   - last_name
   - user_type (enum: consultant, beneficiary)
   - created_at
   - updated_at

2. **beneficiaries**

   - id (PK)
   - user_id (FK)
   - consultant_id (FK)
   - phone
   - job_title
   - company
   - status (enum: active, completed)
   - notes
   - created_at
   - updated_at

3. **appointments**

   - id (PK)
   - beneficiary_id (FK)
   - title
   - description
   - appointment_date
   - created_at
   - updated_at

4. **questionnaires**

   - id (PK)
   - title
   - description
   - created_at
   - updated_at

5. **questions**

   - id (PK)
   - questionnaire_id (FK)
   - text
   - question_type
   - options (JSON)
   - created_at
   - updated_at

6. **responses**

   - id (PK)
   - beneficiary_id (FK)
   - question_id (FK)
   - answer
   - created_at
   - updated_at

7. **documents**

   - id (PK)
   - beneficiary_id (FK)
   - name
   - description
   - file_path
   - uploaded_by
   - created_at
   - updated_at

8. **messages**
   - id (PK)
   - sender_id (FK)
   - recipient_id (FK)
   - content
   - read_status
   - created_at
   - updated_at

## Composants principaux

### Authentification simplifiée

- **Fonctionnalités** :

  - Inscription (par le consultant pour les deux types d'utilisateurs)
  - Connexion/déconnexion
  - Sessions basées sur les cookies

- **Implémentation** :
  - Passport.js avec stratégie locale
  - Stockage des sessions en mémoire (pour le MVP)
  - Hachage des mots de passe avec bcrypt

### Routes principales

- **/auth** : Authentification

  - GET /auth/login : Page de connexion
  - POST /auth/login : Traitement de la connexion
  - GET /auth/logout : Déconnexion

- **/dashboard** : Tableaux de bord

  - GET /dashboard : Redirection selon le type d'utilisateur
  - GET /dashboard/consultant : Tableau de bord consultant
  - GET /dashboard/beneficiary : Tableau de bord bénéficiaire

- **/beneficiaries** : Gestion des bénéficiaires

  - GET /beneficiaries : Liste des bénéficiaires
  - GET /beneficiaries/new : Formulaire de création
  - POST /beneficiaries : Création d'un bénéficiaire
  - GET /beneficiaries/:id : Détail d'un bénéficiaire
  - GET /beneficiaries/:id/edit : Formulaire d'édition
  - POST /beneficiaries/:id : Mise à jour d'un bénéficiaire

- **/appointments** : Gestion des rendez-vous

  - GET /appointments : Liste des rendez-vous
  - GET /appointments/new : Formulaire de création
  - POST /appointments : Création d'un rendez-vous
  - GET /appointments/:id : Détail d'un rendez-vous
  - POST /appointments/:id : Mise à jour d'un rendez-vous

- **/questionnaires** : Questionnaires

  - GET /questionnaires : Liste des questionnaires
  - GET /questionnaires/:id : Affichage d'un questionnaire
  - POST /questionnaires/:id/respond : Enregistrement des réponses

- **/documents** : Gestion documentaire

  - GET /documents/:beneficiaryId : Documents d'un bénéficiaire
  - GET /documents/upload/:beneficiaryId : Formulaire d'upload
  - POST /documents/upload : Upload d'un document
  - GET /documents/download/:id : Téléchargement d'un document

- **/messages** : Messagerie
  - GET /messages : Boîte de réception
  - GET /messages/new/:recipientId : Nouveau message
  - POST /messages : Envoi d'un message
  - GET /messages/:id : Lecture d'un message

### Vues principales

Utilisation de templates Handlebars pour les vues principales :

1. **Layout** : Template de base avec header, footer, navigation
2. **Auth** : Pages de connexion et inscription
3. **Dashboard** : Tableaux de bord consultant et bénéficiaire
4. **Beneficiaries** : Liste et détail des bénéficiaires
5. **Appointments** : Gestion des rendez-vous
6. **Questionnaires** : Affichage et réponse aux questionnaires
7. **Documents** : Upload et liste des documents
8. **Messages** : Messagerie simple

## Fonctionnalités transversales simplifiées

### Notifications par email

- Utilisation de Nodemailer avec un service SMTP simple (Gmail, SendGrid)
- Templates d'emails basiques en HTML
- Envoi asynchrone pour ne pas bloquer les requêtes

### Gestion des fichiers

- Upload direct vers le système de fichiers
- Organisation par dossiers (par bénéficiaire)
- Vérification des types de fichiers
- Limitation de taille

### Sécurité de base

- Authentification par session
- Protection CSRF basique
- Validation des entrées utilisateur
- Échappement des sorties HTML
- HTTPS (fourni par la plateforme de déploiement)

## Développement et déploiement

### Environnement de développement

- **Node.js** et **npm** installés localement
- **Visual Studio Code** avec extensions basiques
- **Git** pour le versionnement
- **SQLite** pour la base de données locale
- **Nodemon** pour le rechargement automatique

### Processus de développement

1. Développement local avec données de test
2. Tests manuels des fonctionnalités
3. Commit des changements
4. Déploiement sur Heroku/Render via Git

### Déploiement simplifié

- Compte Heroku ou Render gratuit
- Configuration via variables d'environnement
- Déploiement automatique depuis GitHub
- Base de données SQLite ou PostgreSQL (selon la plateforme)

## Évolutivité future

Cette architecture simplifiée peut évoluer progressivement :

1. **Migration vers PostgreSQL** quand le volume de données augmente
2. **Séparation frontend/backend** si nécessaire plus tard
3. **Ajout de tests automatisés** progressivement
4. **Amélioration de l'UI** avec des frameworks plus avancés
5. **Mise en place de CI/CD** pour automatiser les déploiements

## Avantages de cette architecture

1. **Développement rapide** : Stack technologique simple et directe
2. **Courbe d'apprentissage réduite** : Technologies accessibles
3. **Maintenance facile** : Architecture monolithique claire
4. **Déploiement simple** : Plateformes PaaS avec peu de configuration
5. **Coût minimal** : Possibilité de démarrer avec des tiers gratuits
6. **Base évolutive** : Possibilité d'améliorer progressivement

## Conclusion

Cette architecture technique simplifiée est spécifiquement conçue pour permettre à un développeur unique de créer un MVP minimal fonctionnel pour la plateforme de gestion des bilans de compétences. Elle privilégie la simplicité, la rapidité de développement et l'utilisation de composants prêts à l'emploi.

En évitant les frameworks complexes et en optant pour une approche monolithique avec des technologies accessibles, cette architecture réduit considérablement la charge de développement tout en fournissant une base solide qui pourra évoluer avec le temps.

Cette approche permet de se concentrer sur la livraison rapide de valeur métier plutôt que sur la complexité technique, tout en conservant la possibilité d'améliorer progressivement l'architecture à mesure que le projet se développe.
