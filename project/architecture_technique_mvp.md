# Architecture technique simplifiée pour le MVP

# Plateforme de gestion des bilans de compétences

## Introduction

Ce document présente l'architecture technique simplifiée pour le MVP (Minimum Viable Product) de la plateforme de gestion des bilans de compétences. Cette architecture est conçue pour être à la fois légère, permettant un développement rapide, et évolutive, facilitant l'ajout de fonctionnalités dans les versions futures.

## Principes directeurs

L'architecture du MVP s'appuie sur les principes suivants :

1. **Simplicité** : Privilégier les solutions éprouvées et simples à mettre en œuvre
2. **Évolutivité** : Concevoir une base solide qui pourra être étendue sans refonte majeure
3. **Maintenabilité** : Adopter des pratiques de développement favorisant la qualité du code
4. **Sécurité** : Intégrer les mesures de sécurité essentielles dès le départ
5. **Rapidité de développement** : Utiliser des frameworks et bibliothèques matures

## Vue d'ensemble de l'architecture

L'architecture du MVP suit un modèle client-serveur classique avec une séparation claire entre :

- Une application frontend (côté client)
- Une API backend (côté serveur)
- Une base de données relationnelle

### Diagramme d'architecture simplifiée

```
+------------------+        +------------------+        +------------------+
|                  |        |                  |        |                  |
|  CLIENT          |        |  SERVEUR         |        |  BASE DE DONNÉES |
|  (Frontend)      | <----> |  (Backend API)   | <----> |  (PostgreSQL)    |
|  React.js        |  HTTP  |  Node.js/Express |  SQL   |                  |
|                  |        |                  |        |                  |
+------------------+        +------------------+        +------------------+
                                    ^
                                    |
                                    v
                            +------------------+
                            |                  |
                            |  STOCKAGE        |
                            |  FICHIERS        |
                            |  (Documents)     |
                            |                  |
                            +------------------+
```

## Stack technologique

### Frontend

- **Framework** : React.js

  - Choisi pour sa popularité, sa maturité et sa grande communauté
  - Permet le développement rapide d'interfaces utilisateur interactives
  - Facilite la création d'une application single-page (SPA)

- **Bibliothèques principales** :

  - **React Router** : Gestion du routage côté client
  - **Axios** : Client HTTP pour les appels API
  - **Material-UI** : Composants UI prêts à l'emploi
  - **React Hook Form** : Gestion simplifiée des formulaires
  - **React Query** : Gestion des états et du cache pour les données

- **État global** :

  - **Context API** de React pour le MVP (plus simple que Redux)
  - Structure permettant une migration vers Redux si nécessaire dans le futur

- **Build et bundling** :
  - **Create React App** : Configuration prête à l'emploi
  - **Webpack** : Bundling des assets (géré par CRA)

### Backend

- **Langage** : JavaScript (Node.js)

  - Cohérence avec le frontend (même langage)
  - Grande communauté et nombreuses bibliothèques disponibles
  - Développement rapide

- **Framework** : Express.js

  - Léger et flexible
  - Facile à prendre en main
  - Extensible via middleware

- **Bibliothèques principales** :

  - **Passport.js** : Authentification
  - **JWT** : Gestion des tokens d'authentification
  - **Multer** : Gestion des uploads de fichiers
  - **Nodemailer** : Envoi d'emails
  - **PDFKit** : Génération de documents PDF
  - **Joi** : Validation des données

- **Structure du projet** :
  - Architecture en couches :
    - Routes (définition des endpoints)
    - Contrôleurs (logique de traitement des requêtes)
    - Services (logique métier)
    - Modèles (interaction avec la base de données)
  - Séparation claire des responsabilités

### Base de données

- **SGBD** : PostgreSQL

  - Robuste et éprouvé
  - Support des transactions ACID
  - Bonnes performances
  - Extensible

- **ORM** : Sequelize

  - Mapping objet-relationnel mature
  - Migrations de schéma
  - Requêtes simplifiées
  - Support des transactions

- **Structure simplifiée** :
  - Schéma relationnel couvrant les entités principales
  - Indexation des champs fréquemment utilisés
  - Contraintes d'intégrité essentielles

### Stockage de fichiers

- **Système de fichiers local** pour le MVP

  - Plus simple à mettre en œuvre
  - Structure organisée par type de document et par utilisateur
  - Préparé pour une migration future vers un stockage cloud

- **Métadonnées** stockées en base de données
  - Références aux fichiers
  - Informations sur les documents (type, date, etc.)

## Composants principaux

### Module d'authentification

- **Fonctionnalités** :

  - Inscription des utilisateurs
  - Connexion/déconnexion
  - Gestion des sessions via JWT
  - Récupération de mot de passe

- **Sécurité** :
  - Hachage des mots de passe (bcrypt)
  - Protection contre les attaques courantes (CSRF, XSS)
  - Validation des entrées

### API RESTful

- **Conception** :

  - Endpoints organisés par ressource
  - Utilisation des méthodes HTTP standard
  - Réponses au format JSON
  - Gestion des erreurs standardisée

- **Endpoints principaux** :

  - `/api/auth` : Authentification
  - `/api/users` : Gestion des utilisateurs
  - `/api/beneficiaries` : Gestion des bénéficiaires
  - `/api/assessments` : Gestion des bilans
  - `/api/appointments` : Gestion des rendez-vous
  - `/api/questionnaires` : Gestion des questionnaires
  - `/api/documents` : Gestion documentaire
  - `/api/messages` : Communication
  - `/api/invoices` : Facturation

- **Middleware** :
  - Authentification
  - Validation des requêtes
  - Gestion des erreurs
  - Logging

### Interface utilisateur

- **Composants réutilisables** :

  - Formulaires
  - Tableaux de données
  - Modales
  - Notifications
  - Calendrier

- **Pages principales** :

  - Connexion/Inscription
  - Tableau de bord (consultant/bénéficiaire)
  - Liste des bénéficiaires
  - Fiche bénéficiaire
  - Calendrier des rendez-vous
  - Questionnaires
  - Bibliothèque de documents
  - Messagerie

- **Responsive design** :
  - Approche "desktop-first" pour le MVP
  - Adaptation basique pour tablette
  - Support limité pour mobile

### Génération de documents

- **Approche** :

  - Templates HTML convertis en PDF
  - Variables remplacées dynamiquement
  - Génération côté serveur

- **Types de documents** :
  - Convention tripartite
  - Document de synthèse
  - Compte-rendu d'entretien
  - Devis et factures

## Schéma de base de données simplifié

Pour le MVP, le schéma de base de données est simplifié tout en conservant les relations essentielles :

### Tables principales

1. **users**

   - id (PK)
   - email
   - password_hash
   - first_name
   - last_name
   - user_type (enum: admin, consultant, beneficiary)
   - status
   - created_at
   - updated_at

2. **beneficiaries**

   - id (PK)
   - user_id (FK)
   - phone
   - address
   - job_title
   - company
   - notes
   - created_at
   - updated_at

3. **consultants**

   - id (PK)
   - user_id (FK)
   - phone
   - specialties
   - created_at
   - updated_at

4. **assessments** (bilans)

   - id (PK)
   - beneficiary_id (FK)
   - consultant_id (FK)
   - status
   - start_date
   - expected_end_date
   - actual_end_date
   - funding_type
   - notes
   - created_at
   - updated_at

5. **assessment_phases**

   - id (PK)
   - assessment_id (FK)
   - phase_type (enum: preliminary, investigation, conclusion, follow_up)
   - status
   - start_date
   - end_date
   - created_at
   - updated_at

6. **appointments**

   - id (PK)
   - assessment_id (FK)
   - title
   - description
   - start_datetime
   - end_datetime
   - location
   - status
   - created_at
   - updated_at

7. **questionnaires**

   - id (PK)
   - title
   - description
   - category
   - created_at
   - updated_at

8. **questions**

   - id (PK)
   - questionnaire_id (FK)
   - text
   - question_type
   - order_index
   - created_at
   - updated_at

9. **question_options**

   - id (PK)
   - question_id (FK)
   - text
   - value
   - order_index
   - created_at
   - updated_at

10. **questionnaire_assignments**

    - id (PK)
    - questionnaire_id (FK)
    - assessment_id (FK)
    - status
    - assigned_date
    - completion_date
    - created_at
    - updated_at

11. **questionnaire_responses**

    - id (PK)
    - assignment_id (FK)
    - question_id (FK)
    - answer_text
    - selected_options
    - created_at
    - updated_at

12. **documents**

    - id (PK)
    - assessment_id (FK)
    - name
    - description
    - category
    - file_path
    - created_by
    - created_at
    - updated_at

13. **messages**

    - id (PK)
    - sender_id (FK)
    - recipient_id (FK)
    - assessment_id (FK)
    - content
    - read_status
    - created_at
    - updated_at

14. **invoices**

    - id (PK)
    - assessment_id (FK)
    - invoice_number
    - invoice_date
    - due_date
    - client_name
    - client_address
    - subtotal
    - tax_rate
    - tax_amount
    - total
    - status
    - created_at
    - updated_at

15. **invoice_items**
    - id (PK)
    - invoice_id (FK)
    - description
    - quantity
    - unit_price
    - amount
    - created_at
    - updated_at

## Sécurité

### Mesures de sécurité essentielles

- **Authentification** :

  - Hachage des mots de passe avec bcrypt
  - Tokens JWT avec expiration
  - Validation des sessions

- **Autorisation** :

  - Contrôle d'accès basé sur les rôles
  - Vérification des permissions pour chaque action

- **Protection des données** :

  - Validation des entrées utilisateur
  - Protection contre les injections SQL (via ORM)
  - Protection XSS
  - En-têtes de sécurité HTTP

- **Transport** :
  - HTTPS obligatoire
  - Certificats TLS valides

### Journalisation

- **Actions importantes** :

  - Connexions/déconnexions
  - Modifications de données sensibles
  - Erreurs d'authentification

- **Format des logs** :
  - Horodatage
  - Utilisateur
  - Action
  - Résultat

## Déploiement

### Environnements

Pour le MVP, deux environnements seront mis en place :

- **Développement** : Pour le développement et les tests
- **Production** : Pour le déploiement du MVP

### Infrastructure

- **Hébergement** : Service cloud simple (DigitalOcean, Heroku ou AWS)
- **Serveur** : Instance unique pour le MVP
  - Ubuntu Server LTS
  - Nginx comme reverse proxy
  - PM2 pour la gestion des processus Node.js
- **Base de données** : Instance PostgreSQL dédiée
- **Stockage** : Système de fichiers local (avec sauvegardes)

### CI/CD simplifié

- **Intégration continue** :

  - Tests automatisés à chaque commit
  - Linting du code

- **Déploiement** :
  - Déploiement manuel pour le MVP
  - Scripts de déploiement automatisés
  - Procédure de rollback

## Monitoring et logging

### Monitoring de base

- **Disponibilité** : Vérification de l'état du service
- **Performance** : Temps de réponse des API
- **Erreurs** : Suivi des erreurs serveur

### Logging

- **Application** : Logs applicatifs
- **Serveur** : Logs système et serveur web
- **Base de données** : Logs de requêtes lentes

## Évolutivité future

Cette architecture simplifiée est conçue pour évoluer facilement vers une architecture plus complexe dans les versions futures :

### Évolutions prévues

- **Frontend** :

  - Migration vers Redux pour la gestion d'état
  - Implémentation de tests E2E
  - Support mobile complet

- **Backend** :

  - Microservices pour certaines fonctionnalités
  - Cache distribué (Redis)
  - File d'attente pour les tâches asynchrones

- **Base de données** :

  - Sharding pour la scalabilité
  - Réplication pour la haute disponibilité

- **Infrastructure** :
  - Architecture multi-serveurs
  - Conteneurisation avec Docker
  - Orchestration avec Kubernetes

## Conclusion

Cette architecture technique simplifiée pour le MVP offre un bon équilibre entre rapidité de développement et évolutivité future. Elle permet de livrer rapidement une première version fonctionnelle tout en posant les bases d'une application robuste et évolutive.

Les choix technologiques (React.js, Node.js/Express, PostgreSQL) sont éprouvés et disposent d'une large communauté, facilitant le développement et la maintenance. La structure modulaire et la séparation claire des responsabilités permettront d'étendre facilement les fonctionnalités dans les versions futures.

Cette architecture couvre l'ensemble des besoins fonctionnels identifiés pour le MVP tout en intégrant les mesures de sécurité essentielles dès le départ.
