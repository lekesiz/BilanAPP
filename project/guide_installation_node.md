# Guide d'installation - Plateforme de Bilan de Compétences (Node.js)

Ce guide vous explique comment installer et démarrer l'application de bilan de compétences en local avec Node.js.

## Prérequis

- Node.js (v16 ou supérieur) installé sur votre ordinateur
  - Téléchargeable sur [https://nodejs.org/](https://nodejs.org/)

## Instructions d'installation

1. **Décompressez le fichier ZIP** dans un dossier de votre choix

2. **Ouvrez un terminal** et naviguez vers le dossier de l'application

   ```
   cd chemin/vers/bilan-app
   ```

3. **Installez les dépendances**

   ```
   npm install
   ```

4. **Configurez les variables d'environnement**

   ```
   cp .env.example .env
   ```

   Note: Si le fichier .env.example n'existe pas, créez un fichier .env avec le contenu suivant:

   ```
   NODE_ENV=development
   PORT=3000
   SESSION_SECRET=bilan_competences_secret_key
   ```

5. **Initialisez la base de données avec des utilisateurs de test**

   ```
   npm run init-db
   ```

   Cette commande crée deux utilisateurs de test :

   - Consultant: consultant@test.com / consultant123
   - Bénéficiaire: beneficiaire@test.com / beneficiary123

6. **Démarrez l'application en mode développement**

   ```
   npm run dev
   ```

7. **Accédez à l'application** dans votre navigateur à l'adresse:
   ```
   http://localhost:3000
   ```

## Structure des fichiers

- `app.js` - Point d'entrée principal de l'application
- `bin/www` - Script de démarrage du serveur
- `config/` - Configuration de la base de données et de l'authentification
- `models/` - Modèles de données (utilisateurs, etc.)
- `routes/` - Routes de l'application
- `views/` - Templates Handlebars pour le rendu des pages
- `public/` - Fichiers statiques (CSS, JavaScript, images)
- `scripts/` - Scripts utilitaires (initialisation de la base de données, etc.)

## Commandes disponibles

- `npm start` - Démarrer l'application en mode production
- `npm run dev` - Démarrer l'application en mode développement avec rechargement automatique
- `npm run init-db` - Initialiser la base de données avec des utilisateurs de test

## Dépannage

### L'application ne démarre pas

- Vérifiez que Node.js est correctement installé: `node -v`
- Vérifiez que toutes les dépendances sont installées: `npm install`
- Vérifiez que le fichier .env existe et contient les bonnes valeurs

### Erreur de connexion à la base de données

- Vérifiez que le dossier de l'application a les permissions d'écriture
- Si nécessaire, supprimez le fichier database.sqlite et réinitialisez la base de données: `npm run init-db`

### Problèmes d'affichage

- Assurez-vous que tous les fichiers dans le dossier views/ sont présents
- Vérifiez que les fichiers CSS sont correctement chargés

## Personnalisation

Pour modifier l'apparence de l'application, vous pouvez éditer les fichiers CSS dans le dossier `public/css/`.

Pour ajouter de nouvelles fonctionnalités, consultez la structure des fichiers et modifiez les fichiers correspondants selon vos besoins.
