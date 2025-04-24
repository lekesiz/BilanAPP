# Périmètre du MVP minimal

# Plateforme de gestion des bilans de compétences

## Introduction

Suite à la clarification que le projet sera réalisé uniquement par une personne avec mon assistance, ce document redéfinit le périmètre fonctionnel du MVP pour qu'il soit réalisable dans ces conditions. L'objectif est de créer une version vraiment minimale mais fonctionnelle, qui pourra être enrichie progressivement.

## Principes directeurs pour ce MVP minimal

1. **Simplicité maximale** : Chaque fonctionnalité doit être réduite à son expression la plus simple
2. **Priorisation drastique** : Seules les fonctionnalités absolument essentielles sont conservées
3. **Utilisation de composants existants** : Privilégier les bibliothèques et frameworks qui réduisent le code à écrire
4. **Approche progressive** : Concevoir pour permettre des améliorations incrémentales
5. **Focalisation sur la valeur métier** : Se concentrer sur ce qui apporte une valeur immédiate aux utilisateurs

## Fonctionnalités essentielles par module

### 1. Gestion des utilisateurs et des accès

#### Inclus dans le MVP minimal

- Authentification simple (email/mot de passe)
- Deux types d'utilisateurs uniquement (consultant et bénéficiaire)
- Profil utilisateur basique
- Page d'accueil simple pour chaque type d'utilisateur

#### Reporté aux versions ultérieures

- Gestion avancée des utilisateurs
- Récupération de mot de passe
- Authentification à deux facteurs
- Gestion des rôles et permissions
- Tableaux de bord personnalisés

### 2. Gestion des bénéficiaires

#### Inclus dans le MVP minimal

- Création de dossiers bénéficiaires (informations de base uniquement)
- Liste simple des bénéficiaires
- Fiche bénéficiaire avec informations essentielles
- Statut basique du bilan (en cours/terminé)

#### Reporté aux versions ultérieures

- Recherche et filtrage avancés
- Suivi détaillé par phases
- Historique des modifications
- Tableaux de bord et statistiques
- Import/export de données

### 3. Planification et gestion des rendez-vous

#### Inclus dans le MVP minimal

- Création manuelle de rendez-vous par le consultant
- Liste des rendez-vous à venir
- Notification par email basique (création/modification)

#### Reporté aux versions ultérieures

- Calendrier interactif
- Gestion des disponibilités
- Prise de rendez-vous par le bénéficiaire
- Rappels automatiques
- Intégration visioconférence
- Synchronisation avec calendriers externes

### 4. Outils d'évaluation en ligne

#### Inclus dans le MVP minimal

- 1-2 questionnaires prédéfinis simples
- Interface basique pour répondre aux questionnaires
- Affichage simple des résultats

#### Reporté aux versions ultérieures

- Bibliothèque de questionnaires
- Création de questionnaires personnalisés
- Analyse avancée des résultats
- Visualisations graphiques
- Comparaison avec des référentiels
- Export des résultats

### 5. Gestion documentaire

#### Inclus dans le MVP minimal

- Upload/download de documents
- Stockage organisé par bénéficiaire
- 1-2 modèles de documents essentiels (format simple)

#### Reporté aux versions ultérieures

- Génération automatique de documents
- Bibliothèque de modèles
- Gestion des versions
- Signature électronique
- Partage sécurisé
- Archivage automatique

### 6. Communication

#### Inclus dans le MVP minimal

- Envoi de messages simples entre consultant et bénéficiaire
- Notification par email des nouveaux messages

#### Reporté aux versions ultérieures

- Messagerie avancée
- Pièces jointes
- Notifications en temps réel
- Modèles de messages
- Historique complet
- Statistiques de communication

### 7. Facturation et gestion financière

#### Reporté entièrement aux versions ultérieures

- Cette fonctionnalité est entièrement reportée pour le MVP minimal
- Utilisation de solutions externes pour la facturation dans un premier temps

### 8. Reporting et pilotage

#### Inclus dans le MVP minimal

- Compteurs basiques (nombre de bilans, rendez-vous, etc.)

#### Reporté aux versions ultérieures

- Tableaux de bord
- Rapports personnalisables
- Statistiques avancées
- Exports de données
- Visualisations graphiques

## Interfaces utilisateur prioritaires

Pour le MVP minimal, seules les interfaces suivantes seront développées :

1. **Page de connexion**
2. **Page d'accueil consultant** (liste des bénéficiaires)
3. **Page d'accueil bénéficiaire** (mon bilan, mes rendez-vous)
4. **Fiche bénéficiaire** (informations de base)
5. **Création/modification de rendez-vous**
6. **Questionnaire simple**
7. **Messagerie basique**
8. **Upload/download de documents**

## Exigences non fonctionnelles pour le MVP minimal

### Sécurité

- Authentification de base
- HTTPS
- Contrôle d'accès simple

### Performance

- Temps de réponse raisonnable pour un petit nombre d'utilisateurs
- Pas d'optimisation poussée à ce stade

### Compatibilité

- Focus sur les navigateurs desktop modernes uniquement (Chrome, Firefox)
- Design responsive basique

## Approche technique simplifiée

Pour faciliter le développement par une seule personne :

1. **Utilisation maximale de templates et composants prêts à l'emploi**
2. **Choix de frameworks avec une courbe d'apprentissage faible**
3. **Utilisation de services managés plutôt que d'infrastructure à gérer**
4. **Documentation claire pour faciliter la maintenance**

## Conclusion

Ce périmètre drastiquement réduit permet de créer un MVP réellement minimal mais fonctionnel, qui pourra être développé par une seule personne avec mon assistance. Il couvre les fonctionnalités essentielles pour gérer des bilans de compétences de manière basique, tout en posant les fondations pour des améliorations futures.

L'accent est mis sur la simplicité et la faisabilité, avec une priorisation stricte des fonctionnalités qui apportent une valeur immédiate. Cette approche permettra de livrer plus rapidement une première version utilisable, qui pourra être enrichie progressivement en fonction des retours utilisateurs et des ressources disponibles.
