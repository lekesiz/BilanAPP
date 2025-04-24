# Guide de déploiement - Plateforme de Bilan de Compétences

Ce guide vous accompagnera pas à pas pour déployer votre application de bilan de compétences sur GitHub et Render.

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation locale](#installation-locale)
3. [Déploiement sur GitHub](#déploiement-sur-github)
4. [Déploiement sur Render](#déploiement-sur-render)
5. [Configuration post-déploiement](#configuration-post-déploiement)
6. [Dépannage](#dépannage)

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- Un compte GitHub (https://github.com/signup)
- Un compte Render (https://render.com/signup)
- Git installé sur votre ordinateur (https://git-scm.com/downloads)
- Node.js (v16 ou supérieur) installé sur votre ordinateur (https://nodejs.org/)

## Installation locale

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

   Vous pouvez modifier le fichier .env si nécessaire, mais les valeurs par défaut fonctionneront pour un environnement de développement.

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

7. **Accédez à l'application** dans votre navigateur à l'adresse http://localhost:3000

## Déploiement sur GitHub

1. **Créez un nouveau dépôt sur GitHub**

   - Connectez-vous à votre compte GitHub
   - Cliquez sur le bouton "+" en haut à droite, puis "New repository"
   - Nommez votre dépôt (par exemple "bilan-competences-app")
   - Laissez les autres options par défaut et cliquez sur "Create repository"
   - Ne fermez pas cette page, vous en aurez besoin à l'étape 3

2. **Initialisez Git dans votre dossier local**
   Dans le terminal, à la racine de votre projet :

   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Liez votre dépôt local à GitHub**
   Utilisez les commandes affichées sur la page GitHub que vous avez laissée ouverte. Elles ressembleront à :

   ```
   git remote add origin https://github.com/votre-username/bilan-competences-app.git
   git branch -M main
   git push -u origin main
   ```

4. **Vérifiez que votre code est bien sur GitHub**
   - Rafraîchissez la page de votre dépôt sur GitHub
   - Vous devriez voir tous les fichiers de votre application

## Déploiement sur Render

1. **Connectez-vous à votre compte Render** (https://dashboard.render.com/)

2. **Créez un nouveau service Web**

   - Cliquez sur "New +" puis "Web Service"
   - Dans la section "Connect a repository", cliquez sur "Connect account" à côté de GitHub si ce n'est pas déjà fait
   - Autorisez Render à accéder à vos dépôts GitHub
   - Sélectionnez le dépôt que vous venez de créer

3. **Configurez le service**

   - Nom : Choisissez un nom pour votre application (ex: "bilan-competences-app")
   - Région : Choisissez la région la plus proche de vous
   - Branch : main
   - Runtime : Node
   - Build Command : `npm install`
   - Start Command : `npm start`
   - Plan : Free

4. **Configurez les variables d'environnement**

   - Faites défiler jusqu'à la section "Environment Variables"
   - Ajoutez les variables suivantes :
     - `NODE_ENV` : production
     - `PORT` : 10000 (Render utilisera sa propre valeur)
     - `SESSION_SECRET` : [générez une chaîne aléatoire sécurisée]

5. **Créez le service**

   - Cliquez sur "Create Web Service"
   - Render va automatiquement déployer votre application (cela peut prendre quelques minutes)

6. **Accédez à votre application déployée**
   - Une fois le déploiement terminé, cliquez sur l'URL fournie par Render
   - Votre application est maintenant en ligne !

## Configuration post-déploiement

1. **Initialisez la base de données de production**

   - Dans le tableau de bord Render, allez dans la section "Shell"
   - Exécutez la commande : `node scripts/init-production.js`
   - Cette commande crée un utilisateur consultant par défaut :
     - Email : admin@bilancompetences.com
     - Mot de passe : admin123

2. **Changez le mot de passe par défaut**
   - Connectez-vous à l'application avec les identifiants ci-dessus
   - [Fonctionnalité à venir] Allez dans votre profil pour changer le mot de passe

## Dépannage

### Problèmes courants

1. **L'application ne démarre pas localement**

   - Vérifiez que Node.js est correctement installé : `node -v`
   - Vérifiez que toutes les dépendances sont installées : `npm install`
   - Vérifiez que le fichier .env existe et contient les bonnes valeurs

2. **Erreur lors du déploiement sur Render**

   - Vérifiez les logs de build dans le tableau de bord Render
   - Assurez-vous que le fichier package.json est correctement configuré
   - Vérifiez que les variables d'environnement sont correctement définies

3. **Impossible de se connecter après le déploiement**
   - Vérifiez que vous avez bien exécuté le script d'initialisation de la base de données
   - Vérifiez les logs de l'application dans le tableau de bord Render

### Besoin d'aide supplémentaire ?

Si vous rencontrez des problèmes non couverts par ce guide, n'hésitez pas à :

- Consulter la documentation de Render : https://render.com/docs
- Consulter la documentation de GitHub : https://docs.github.com
- Me contacter pour obtenir de l'aide supplémentaire
