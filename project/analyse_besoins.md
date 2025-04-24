# Analyse des besoins pour la plateforme de gestion des bilans de compétences

## 1. Introduction

Ce document présente l'analyse des besoins pour la création d'une plateforme internet permettant de réaliser et gérer les bilans de compétences conformément aux exigences Qualiopi et à la législation en vigueur. Cette plateforme vise à digitaliser l'ensemble du processus de bilan de compétences, de l'inscription du bénéficiaire jusqu'à la génération du document de synthèse et le suivi à 6 mois.

## 2. Objectifs de la plateforme

### 2.1 Objectif principal

Créer une solution numérique complète permettant aux consultants de réaliser des bilans de compétences conformes aux exigences Qualiopi, tout en simplifiant la gestion administrative et en améliorant l'expérience des bénéficiaires.

### 2.2 Objectifs spécifiques

- Digitaliser l'ensemble du processus de bilan de compétences
- Faciliter la gestion administrative des dossiers
- Assurer la conformité avec les exigences Qualiopi et la législation
- Sécuriser les données personnelles des bénéficiaires
- Optimiser le temps des consultants
- Améliorer le suivi et l'accompagnement des bénéficiaires
- Générer automatiquement les documents conformes
- Faciliter le reporting et le pilotage de l'activité

## 3. Utilisateurs cibles

### 3.1 Profils d'utilisateurs

#### Administrateurs

- Responsables de l'organisme de formation
- Gestionnaires administratifs

#### Consultants

- Consultants en bilan de compétences
- Psychologues du travail

#### Bénéficiaires

- Salariés en poste
- Demandeurs d'emploi
- Travailleurs indépendants
- Personnes en reconversion professionnelle

### 3.2 Besoins spécifiques par profil

#### Administrateurs

- Gestion des utilisateurs (consultants et bénéficiaires)
- Suivi global de l'activité
- Gestion des financements
- Reporting et statistiques
- Paramétrage de la plateforme

#### Consultants

- Gestion de leur portefeuille de bénéficiaires
- Planification des rendez-vous
- Administration des outils d'évaluation
- Suivi des parcours individuels
- Génération des documents
- Communication avec les bénéficiaires

#### Bénéficiaires

- Inscription et création de compte
- Accès à leur calendrier de rendez-vous
- Réalisation des tests et questionnaires en ligne
- Accès à leurs documents
- Communication avec leur consultant
- Suivi de leur progression

## 4. Fonctionnalités requises

### 4.1 Gestion des utilisateurs et des accès

- Inscription et création de comptes (administrateurs, consultants, bénéficiaires)
- Gestion des profils et des informations personnelles
- Gestion des droits d'accès et des rôles
- Authentification sécurisée (double facteur recommandé)
- Gestion des mots de passe (récupération, modification)

### 4.2 Gestion des bénéficiaires

- Création et gestion des dossiers bénéficiaires
- Suivi du statut des bilans (en cours, terminé, etc.)
- Historique des actions et des interactions
- Gestion des documents associés
- Tableau de bord de suivi individuel

### 4.3 Planification et gestion des rendez-vous

- Calendrier partagé consultant-bénéficiaire
- Système de prise de rendez-vous en ligne
- Notifications et rappels automatiques
- Visioconférence intégrée pour les entretiens à distance
- Gestion des disponibilités des consultants

### 4.4 Outils d'évaluation en ligne

- Questionnaire d'auto-évaluation des compétences
- Tests de personnalité et d'intérêts professionnels
- Grilles d'analyse des compétences
- Outils de projection professionnelle
- Système de scoring et d'analyse automatique des résultats

### 4.5 Gestion documentaire

- Génération automatique des documents conformes Qualiopi :
  - Document d'information préalable
  - Consentement éclairé
  - Convention tripartite
  - Document de synthèse
- Stockage sécurisé des documents
- Système de signature électronique
- Archivage automatique conforme à la législation

### 4.6 Communication

- Messagerie interne sécurisée
- Notifications par email et/ou SMS
- Partage de ressources et de documents
- Forum ou espace d'échange (optionnel)

### 4.7 Suivi et reporting

- Tableau de bord administrateur avec indicateurs clés
- Suivi des bilans en cours et terminés
- Statistiques sur les résultats des bilans
- Rapports d'activité personnalisables
- Indicateurs de performance pour la certification Qualiopi

### 4.8 Facturation et gestion financière

- Gestion des devis et factures
- Suivi des paiements et des financements
- Intégration avec les OPCO et autres financeurs
- Exports comptables

## 5. Exigences techniques

### 5.1 Architecture générale

- Application web responsive (accessible sur ordinateur, tablette, smartphone)
- Architecture modulaire et évolutive
- Base de données sécurisée
- API pour intégrations potentielles avec d'autres systèmes

### 5.2 Sécurité et conformité

- Conformité RGPD complète
- Chiffrement des données sensibles
- Sauvegardes régulières et automatisées
- Journalisation des actions (logs)
- Plan de reprise d'activité
- Politique de confidentialité claire

### 5.3 Performance et disponibilité

- Temps de réponse rapide
- Disponibilité 24/7 avec maintenance planifiée
- Capacité à gérer plusieurs utilisateurs simultanés
- Scalabilité pour accompagner la croissance de l'activité

### 5.4 Compatibilité et intégrations

- Compatibilité avec les principaux navigateurs web
- Intégration possible avec des outils tiers (CRM, comptabilité, etc.)
- Export de données dans des formats standards

## 6. Contraintes et considérations

### 6.1 Contraintes légales et réglementaires

- Conformité avec le Code du travail (articles L6313-1, L6313-4 et R6313-4 à R6313-8)
- Respect des exigences Qualiopi pour les bilans de compétences
- Conformité RGPD et protection des données personnelles
- Conservation et destruction des documents selon les délais légaux

### 6.2 Contraintes techniques

- Choix des technologies en fonction des compétences disponibles
- Hébergement sécurisé (préférence pour l'hébergement en France ou UE)
- Maintenance et mises à jour régulières
- Compatibilité avec l'infrastructure existante

### 6.3 Considérations d'accessibilité

- Conformité aux normes d'accessibilité web (WCAG)
- Interface intuitive adaptée à tous les niveaux de compétence numérique
- Support multilingue (optionnel)

## 7. Livrables attendus

- Plateforme web fonctionnelle et testée
- Documentation technique
- Guide d'utilisation pour chaque profil d'utilisateur
- Formation des administrateurs et consultants
- Support technique initial

## 8. Phases de développement proposées

### Phase 1 : Conception et architecture

- Finalisation des spécifications fonctionnelles
- Conception de l'architecture technique
- Maquettes de l'interface utilisateur
- Validation du plan de développement

### Phase 2 : Développement du cœur fonctionnel

- Système de gestion des utilisateurs
- Gestion des bénéficiaires
- Planification des rendez-vous
- Interface de base

### Phase 3 : Implémentation des outils d'évaluation

- Digitalisation des questionnaires et tests
- Système d'analyse des résultats
- Stockage et visualisation des données

### Phase 4 : Génération de documents et reporting

- Système de génération automatique des documents
- Tableaux de bord et reporting
- Gestion documentaire

### Phase 5 : Sécurité, tests et déploiement

- Mise en place des mesures de sécurité
- Tests complets (fonctionnels, sécurité, performance)
- Déploiement et mise en production

## 9. Questions en suspens et points à clarifier

- Préférence pour l'hébergement (cloud ou serveurs dédiés)
- Budget alloué au projet
- Délai de mise en œuvre souhaité
- Intégrations nécessaires avec des systèmes existants
- Volume d'utilisateurs attendu
- Besoins spécifiques en termes de personnalisation
- Modalités de support et de maintenance après déploiement

## 10. Conclusion

Cette analyse des besoins constitue la base pour le développement d'une plateforme internet complète et conforme pour la réalisation et la gestion des bilans de compétences. Les fonctionnalités identifiées permettront de digitaliser l'ensemble du processus tout en garantissant la conformité avec les exigences Qualiopi et la législation en vigueur.

La prochaine étape consistera à concevoir l'architecture technique détaillée de la plateforme, en tenant compte des besoins identifiés et des contraintes spécifiques du projet.
