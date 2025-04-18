# Guide d'installation et d'utilisation - Plateforme de Bilan de Compétences

Ce guide vous explique comment installer et utiliser la plateforme de gestion des bilans de compétences.

## Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)
- SQLite (inclus, ne nécessite pas d'installation séparée)

## Installation

1. **Décompressez l'archive** dans le répertoire de votre choix

2. **Installez les dépendances**
   ```bash
   cd bilan-app
   npm install
   ```

3. **Configurez les variables d'environnement**
   - Copiez le fichier `.env.example` vers `.env`
   - Modifiez les valeurs selon votre environnement si nécessaire

4. **Initialisez la base de données**
   ```bash
   npm run init-db
   ```
   Cette commande crée la base de données SQLite et y insère des données initiales, notamment :
   - Un compte consultant (email: consultant@test.com, mot de passe: consultant123)
   - Un compte bénéficiaire (email: beneficiaire@test.com, mot de passe: beneficiary123)

## Démarrage de l'application

1. **En mode développement** (avec rechargement automatique)
   ```bash
   npm run dev
   ```

2. **En mode production**
   ```bash
   npm start
   ```

3. **Accédez à l'application** dans votre navigateur à l'adresse http://localhost:3000

## Structure des dossiers

- `/bin` - Scripts de démarrage
- `/config` - Configuration de l'application
- `/controllers` - Contrôleurs (logique métier)
- `/database` - Fichiers de base de données SQLite
- `/middlewares` - Middlewares Express
- `/models` - Modèles de données
- `/public` - Fichiers statiques (CSS, JS, images)
- `/routes` - Routes de l'application
- `/scripts` - Scripts utilitaires
- `/views` - Templates Handlebars (interface utilisateur)

## Fonctionnalités principales

Consultez le fichier `DOCUMENTATION.md` pour une description détaillée de toutes les fonctionnalités.

## Utilisation avec Docker

Si vous préférez utiliser Docker, un Dockerfile et un fichier docker-compose.yml sont inclus.

1. **Construire et démarrer les conteneurs**
   ```bash
   docker-compose up
   ```

2. **Accédez à l'application** dans votre navigateur à l'adresse http://localhost:3000

## Personnalisation

- Les styles peuvent être modifiés dans `/public/css/style.css`
- Les scripts JavaScript côté client se trouvent dans `/public/js/main.js`
- Les templates Handlebars peuvent être modifiés dans le dossier `/views`

## Dépannage

- **Problème de connexion à la base de données** : Vérifiez que le fichier de base de données existe dans le dossier `/database`. Si nécessaire, réexécutez `npm run init-db`.
- **Erreurs d'authentification** : Assurez-vous que la variable `SESSION_SECRET` est correctement définie dans le fichier `.env`.
- **Problèmes d'affichage** : Videz le cache de votre navigateur ou utilisez le mode navigation privée.

## Support

Pour toute question ou problème, veuillez consulter la documentation ou contacter l'administrateur système.
