# Périmètre fonctionnel du MVP

# Plateforme de gestion des bilans de compétences

## Introduction

Ce document définit le périmètre fonctionnel du MVP (Minimum Viable Product) pour la plateforme de gestion des bilans de compétences. Il identifie les fonctionnalités essentielles qui apporteront une valeur immédiate aux utilisateurs tout en constituant une base solide pour les développements futurs.

## Objectifs du MVP

Le MVP a pour objectifs de :

1. Permettre la gestion complète d'un bilan de compétences de bout en bout
2. Digitaliser les interactions entre consultants et bénéficiaires
3. Centraliser les documents et informations essentiels
4. Simplifier les tâches administratives récurrentes
5. Démontrer la valeur ajoutée de la plateforme
6. Recueillir des retours utilisateurs pour orienter les développements futurs

## Fonctionnalités prioritaires par module

### 1. Gestion des utilisateurs et des accès

#### Inclus dans le MVP

- Inscription et authentification sécurisée
- Profils utilisateurs différenciés (admin, consultant, bénéficiaire)
- Gestion basique des droits d'accès
- Tableau de bord simplifié pour chaque type d'utilisateur
- Gestion des mots de passe (création, réinitialisation)

#### Reporté aux versions ultérieures

- Authentification à deux facteurs
- Gestion avancée des rôles et permissions
- Intégration avec des systèmes d'authentification externes
- Personnalisation avancée des tableaux de bord

### 2. Gestion des bénéficiaires

#### Inclus dans le MVP

- Création et gestion des dossiers bénéficiaires
- Informations de base du bénéficiaire (identité, contact, situation professionnelle)
- Suivi de l'avancement du bilan par phases
- Vue d'ensemble des bénéficiaires pour les consultants
- Recherche simple des bénéficiaires

#### Reporté aux versions ultérieures

- Gestion avancée des statuts et workflows
- Tableaux de bord analytiques
- Segmentation et filtres avancés
- Import/export de listes de bénéficiaires
- Historique complet des modifications

### 3. Planification et gestion des rendez-vous

#### Inclus dans le MVP

- Calendrier des rendez-vous pour consultants et bénéficiaires
- Création et modification de rendez-vous
- Gestion des disponibilités des consultants
- Notifications par email pour les rendez-vous
- Association des rendez-vous aux phases du bilan

#### Reporté aux versions ultérieures

- Prise de rendez-vous en ligne par le bénéficiaire
- Intégration native avec des solutions de visioconférence
- Synchronisation avec des calendriers externes (Google, Outlook)
- Rappels SMS
- Gestion des salles de réunion

### 4. Outils d'évaluation en ligne

#### Inclus dans le MVP

- Bibliothèque de questionnaires prédéfinis simples
- Assignation de questionnaires aux bénéficiaires
- Interface de complétion des questionnaires pour les bénéficiaires
- Visualisation des résultats pour les consultants
- Export PDF des résultats

#### Reporté aux versions ultérieures

- Création de questionnaires personnalisés
- Tests psychométriques avancés
- Algorithmes d'analyse sophistiqués
- Comparaison avec des référentiels
- Visualisations graphiques avancées

### 5. Gestion documentaire

#### Inclus dans le MVP

- Bibliothèque de modèles de documents essentiels
  - Convention tripartite
  - Document de synthèse
  - Compte-rendu d'entretien
- Génération de documents à partir des modèles
- Stockage et organisation des documents par bénéficiaire
- Partage de documents avec les bénéficiaires

#### Reporté aux versions ultérieures

- Signature électronique avancée
- Gestion des versions de documents
- Création de modèles personnalisés
- Workflows d'approbation
- Archivage automatique

### 6. Communication

#### Inclus dans le MVP

- Messagerie interne basique entre consultant et bénéficiaire
- Notifications système pour les événements importants
- Historique des messages par bénéficiaire
- Notifications par email pour les nouveaux messages

#### Reporté aux versions ultérieures

- Messagerie de groupe
- Partage de ressources et liens
- Modèles de messages
- Notifications push
- Statistiques de communication

### 7. Facturation et gestion financière

#### Inclus dans le MVP

- Création de devis et factures simples
- Suivi basique des paiements
- Export PDF des documents financiers

#### Reporté aux versions ultérieures

- Intégration avec les OPCO
- Tableaux de bord financiers
- Gestion des relances
- Intégration avec des logiciels comptables
- Gestion des avoirs et remboursements

### 8. Reporting et pilotage

#### Inclus dans le MVP

- Statistiques de base sur les bilans en cours
- Rapports simples sur l'activité des consultants
- Export des données en CSV

#### Reporté aux versions ultérieures

- Tableaux de bord analytiques avancés
- Rapports personnalisables
- Visualisations graphiques sophistiquées
- Prévisions et tendances
- Alertes basées sur les KPIs

## Exigences non fonctionnelles pour le MVP

### Sécurité

- Authentification sécurisée
- Chiffrement des données sensibles
- Contrôle d'accès basique
- Journalisation des actions principales

### Performance

- Temps de réponse < 3s pour 90% des requêtes
- Support de 50 utilisateurs simultanés

### Compatibilité

- Navigateurs : Chrome, Firefox, Safari, Edge (versions récentes)
- Responsive design pour desktop et tablette (mobile en affichage simplifié)

### Disponibilité

- Disponibilité de 99% en heures ouvrées
- Maintenance planifiée hors heures de bureau

## Interfaces utilisateur prioritaires

Pour le MVP, les interfaces suivantes seront développées en priorité :

1. **Page de connexion**
2. **Tableau de bord consultant**
3. **Tableau de bord bénéficiaire**
4. **Liste et recherche des bénéficiaires**
5. **Fiche détaillée d'un bénéficiaire**
6. **Calendrier des rendez-vous**
7. **Interface de questionnaire**
8. **Bibliothèque de documents**
9. **Messagerie interne simple**
10. **Génération de documents**

## Intégrations externes

Pour le MVP, les intégrations externes seront limitées :

#### Inclus dans le MVP

- Export de données au format standard (CSV, PDF)
- Envoi d'emails de notification

#### Reporté aux versions ultérieures

- Intégration avec des solutions de visioconférence
- Synchronisation avec des calendriers externes
- Intégration avec des systèmes comptables
- Intégration avec les plateformes des OPCO
- API publique pour intégrations tierces

## Conclusion

Ce périmètre fonctionnel du MVP permet de couvrir l'ensemble du processus de bilan de compétences avec les fonctionnalités essentielles, tout en restant réalisable dans un délai raisonnable (environ 3 mois). Il offre une base solide pour recueillir les retours utilisateurs et orienter les développements futurs.

Les fonctionnalités ont été sélectionnées selon les critères suivants :

- Valeur ajoutée immédiate pour les utilisateurs
- Couverture du processus de bout en bout
- Complexité technique raisonnable
- Cohérence de l'expérience utilisateur

Cette approche permettra de livrer rapidement une première version fonctionnelle et de l'enrichir progressivement en fonction des retours d'usage et des priorités métier.
