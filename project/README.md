# Plateforme de Gestion des Bilans de Compétences - MVP

Une application web simple pour gérer les bilans de compétences.

## Fonctionnalités

- Authentification (consultant/bénéficiaire)
- Tableaux de bord différenciés
- Gestion des bénéficiaires (à venir)
- Planification des rendez-vous (à venir)
- Questionnaires en ligne (à venir)
- Gestion documentaire (à venir)
- Messagerie interne (à venir)

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

4. Démarrer l'application

   ```
   npm start
   ```

5. Accéder à l'application
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

## Déploiement

Cette application est déployée sur Render.

## Licence

Ce projet est sous licence MIT.
