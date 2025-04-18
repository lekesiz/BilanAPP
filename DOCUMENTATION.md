# Documentation des fonctionnalités - Plateforme de Bilan de Compétences

Ce document présente les fonctionnalités implémentées dans la plateforme de gestion des bilans de compétences. Cette application permet aux consultants et bénéficiaires d'interagir efficacement tout au long du processus de bilan de compétences.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Gestion des utilisateurs](#gestion-des-utilisateurs)
3. [Gestion des bénéficiaires](#gestion-des-bénéficiaires)
4. [Gestion des rendez-vous](#gestion-des-rendez-vous)
5. [Messagerie](#messagerie)
6. [Questionnaires](#questionnaires)
7. [Gestion documentaire](#gestion-documentaire)

## Vue d'ensemble

La plateforme propose deux types de profils utilisateurs :
- **Consultants** : professionnels qui accompagnent les bénéficiaires dans leur bilan de compétences
- **Bénéficiaires** : personnes qui suivent un bilan de compétences

Chaque profil dispose d'un tableau de bord personnalisé et d'un accès à des fonctionnalités spécifiques.

## Gestion des utilisateurs

### Authentification
- Connexion sécurisée avec email et mot de passe
- Sessions persistantes avec déconnexion manuelle
- Protection des routes selon le type d'utilisateur

### Tableaux de bord
- **Tableau de bord consultant** : vue d'ensemble des bénéficiaires, rendez-vous à venir et messages récents
- **Tableau de bord bénéficiaire** : informations sur le consultant, rendez-vous à venir, questionnaires à compléter et documents partagés

## Gestion des bénéficiaires

Cette fonctionnalité permet aux consultants de gérer les personnes qu'ils accompagnent.

### Fonctionnalités pour les consultants
- **Liste des bénéficiaires** : vue tabulaire avec filtres et tri
- **Ajout d'un bénéficiaire** : formulaire de création avec informations de contact
- **Fiche détaillée** : vue complète des informations du bénéficiaire
- **Modification** : mise à jour des informations, statut et phase du bilan

### Informations gérées
- Informations personnelles (nom, prénom, email, téléphone)
- Statut du bilan (initial, en cours, terminé)
- Phase actuelle (préliminaire, investigation, conclusion)
- Notes personnalisées

## Gestion des rendez-vous

Cette fonctionnalité permet de planifier et suivre les entretiens entre consultants et bénéficiaires.

### Fonctionnalités pour les consultants
- **Liste des rendez-vous** : vue calendrier et liste
- **Planification** : création de rendez-vous avec choix du bénéficiaire
- **Modification** : changement de date, heure, durée ou statut
- **Annulation** : possibilité d'annuler un rendez-vous planifié

### Fonctionnalités pour les bénéficiaires
- **Consultation** : vue des rendez-vous planifiés
- **Détails** : accès aux informations complètes
- **Annulation** : possibilité de demander l'annulation

### Types de rendez-vous
- Présentiel (avec lieu spécifié)
- En ligne (avec lien de visioconférence)

## Messagerie

Cette fonctionnalité permet la communication directe entre consultants et bénéficiaires.

### Fonctionnalités pour les consultants
- **Liste des conversations** : vue des échanges avec chaque bénéficiaire
- **Conversation** : interface de messagerie avec historique
- **Notifications** : alertes pour les nouveaux messages

### Fonctionnalités pour les bénéficiaires
- **Conversation avec le consultant** : interface de messagerie unique
- **Notifications** : alertes pour les nouveaux messages

### Caractéristiques
- Messages horodatés
- Indicateurs de lecture
- Conservation de l'historique complet

## Questionnaires

Cette fonctionnalité permet de créer, assigner et compléter des questionnaires d'évaluation.

### Fonctionnalités pour les consultants
- **Création** : formulaire de création avec titre, description et type
- **Édition** : ajout et suppression de questions
- **Assignation** : attribution à un bénéficiaire spécifique
- **Résultats** : consultation des réponses fournies

### Fonctionnalités pour les bénéficiaires
- **Liste** : vue des questionnaires à compléter
- **Complétion** : interface pour répondre aux questions
- **Consultation** : visualisation des questionnaires complétés

### Types de questions
- Texte libre
- Choix multiple
- Évaluation (échelle)
- Oui/Non

## Gestion documentaire

Cette fonctionnalité permet le partage et l'organisation des documents liés au bilan.

### Fonctionnalités pour les consultants
- **Téléversement** : ajout de documents avec métadonnées
- **Catégorisation** : classement par type et bénéficiaire
- **Partage** : mise à disposition pour les bénéficiaires

### Fonctionnalités pour les bénéficiaires
- **Consultation** : accès aux documents partagés
- **Téléchargement** : récupération des fichiers
- **Téléversement** : possibilité d'ajouter des documents personnels

### Types de documents
- Contrats et conventions
- Rapports d'évaluation
- Documents de synthèse
- Autres ressources
