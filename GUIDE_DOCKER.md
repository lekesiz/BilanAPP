# Guide d'utilisation Docker - Plateforme de Bilan de Compétences

Ce guide vous explique comment démarrer facilement l'application de bilan de compétences avec Docker sur votre Mac.

## Prérequis

- Docker Desktop pour Mac installé sur votre ordinateur
  - Téléchargeable sur [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

## Instructions de démarrage rapide

1. **Décompressez le fichier ZIP** dans un dossier de votre choix

2. **Ouvrez Terminal** et naviguez vers le dossier de l'application
   ```
   cd chemin/vers/bilan-app
   ```

3. **Démarrez l'application avec Docker Compose**
   ```
   docker-compose up
   ```
   Cette commande va:
   - Construire l'image Docker de l'application
   - Démarrer le conteneur
   - Initialiser la base de données avec un utilisateur administrateur
   - Démarrer le serveur web

4. **Accédez à l'application** dans votre navigateur à l'adresse:
   ```
   http://localhost:3000
   ```

5. **Connectez-vous** avec les identifiants par défaut:
   - Email: admin@bilancompetences.com
   - Mot de passe: admin123

## Arrêter l'application

Pour arrêter l'application, appuyez sur `Ctrl+C` dans le terminal où Docker Compose est en cours d'exécution.

Pour arrêter et supprimer les conteneurs:
```
docker-compose down
```

## Persistance des données

Les données de la base de données sont stockées dans le dossier `database` qui est monté comme un volume Docker. Cela signifie que:
- Vos données sont conservées même après l'arrêt des conteneurs
- Vous pouvez sauvegarder vos données en copiant simplement ce dossier

## Dépannage

### L'application ne démarre pas
- Vérifiez que Docker Desktop est en cours d'exécution
- Vérifiez qu'aucune autre application n'utilise le port 3000
- Essayez de reconstruire l'image: `docker-compose build --no-cache`

### Réinitialiser la base de données
Si vous souhaitez réinitialiser complètement la base de données:
1. Arrêtez l'application: `docker-compose down`
2. Supprimez le dossier database: `rm -rf database`
3. Redémarrez l'application: `docker-compose up`

### Problèmes de permission
Si vous rencontrez des problèmes de permission sur Mac:
```
docker-compose down
chmod -R 777 database
docker-compose up
```

## Personnalisation

Pour modifier les paramètres de l'application, vous pouvez éditer le fichier `docker-compose.yml` et ajuster les variables d'environnement selon vos besoins.
