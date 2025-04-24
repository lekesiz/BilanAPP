# Spécifications fonctionnelles détaillées

# Plateforme de gestion des bilans de compétences

## Introduction

Ce document présente les spécifications fonctionnelles détaillées pour la plateforme de gestion des bilans de compétences. Il s'appuie sur l'analyse des besoins et l'architecture technique existantes, et vise à préciser tous les aspects fonctionnels nécessaires au développement.

## 1. Gestion des utilisateurs et des accès

### 1.1 Types d'utilisateurs et rôles

#### Administrateurs

- **Super administrateur** : Accès complet à toutes les fonctionnalités et données
- **Administrateur fonctionnel** : Gestion des utilisateurs et paramétrage de la plateforme
- **Administrateur financier** : Accès aux fonctionnalités de facturation et reporting financier

#### Consultants

- **Consultant senior** : Accès complet à son portefeuille de bénéficiaires et aux outils d'évaluation
- **Consultant junior** : Accès limité nécessitant des validations pour certaines actions
- **Psychologue** : Accès spécifique aux tests psychométriques et à leur interprétation

#### Bénéficiaires

- **Bénéficiaire actif** : Personne en cours de bilan de compétences
- **Bénéficiaire en suivi** : Personne ayant terminé son bilan mais en phase de suivi à 6 mois
- **Bénéficiaire archivé** : Personne dont le bilan est terminé et archivé

### 1.2 Processus d'inscription et de validation

#### Inscription des administrateurs et consultants

1. Création du compte par un super administrateur
2. Envoi automatique d'un email d'invitation avec lien de création de mot de passe
3. Définition du mot de passe par l'utilisateur (règles de complexité appliquées)
4. Activation du compte par l'administrateur
5. Configuration optionnelle de l'authentification à deux facteurs

#### Inscription des bénéficiaires

1. Pré-inscription par un consultant ou auto-inscription via formulaire public
2. Validation des informations par un consultant
3. Envoi automatique d'un email d'invitation avec lien de création de mot de passe
4. Définition du mot de passe par le bénéficiaire
5. Accès au compte avec droits limités jusqu'à la signature de la convention tripartite

### 1.3 Structure des profils utilisateurs

#### Profil administrateur

- Informations personnelles : nom, prénom, email, téléphone
- Informations professionnelles : fonction, service
- Paramètres de notification : email, application
- Historique des actions administratives

#### Profil consultant

- Informations personnelles : nom, prénom, email, téléphone
- Informations professionnelles : qualification, spécialités, CV résumé
- Disponibilités : plages horaires, jours non travaillés
- Statistiques d'activité : nombre de bilans en cours, terminés
- Portefeuille de bénéficiaires : liste et accès rapide

#### Profil bénéficiaire

- Informations personnelles : nom, prénom, date de naissance, adresse, email, téléphone
- Informations professionnelles : situation actuelle, employeur, fonction, ancienneté
- Informations administratives : mode de financement, organisme financeur
- Parcours de bilan : étape actuelle, progression, prochains rendez-vous
- Documents associés : convention, synthèses, résultats de tests

### 1.4 Gestion des droits d'accès

#### Matrice des droits par rôle

| Fonctionnalité            | Super Admin   | Admin Fonctionnel | Admin Financier       | Consultant Senior      | Consultant Junior                | Psychologue                         | Bénéficiaire            |
| ------------------------- | ------------- | ----------------- | --------------------- | ---------------------- | -------------------------------- | ----------------------------------- | ----------------------- |
| Gestion des utilisateurs  | Tous          | Tous sauf admins  | Non                   | Non                    | Non                              | Non                                 | Non                     |
| Paramétrage plateforme    | Oui           | Oui               | Non                   | Non                    | Non                              | Non                                 | Non                     |
| Gestion des bénéficiaires | Tous          | Tous              | Tous (vue limitée)    | Son portefeuille       | Son portefeuille avec validation | Son portefeuille (tests uniquement) | Son profil uniquement   |
| Planification RDV         | Tous          | Tous              | Non                   | Ses RDV                | Ses RDV                          | Ses RDV                             | Ses RDV (consultation)  |
| Outils d'évaluation       | Configuration | Configuration     | Non                   | Utilisation            | Utilisation limitée              | Configuration et utilisation        | Complétion uniquement   |
| Génération documents      | Tous          | Tous              | Financiers uniquement | Pour ses bénéficiaires | Avec validation                  | Non                                 | Consultation uniquement |
| Facturation               | Oui           | Non               | Oui                   | Non                    | Non                              | Non                                 | Non                     |
| Reporting                 | Complet       | Fonctionnel       | Financier             | Son activité           | Son activité                     | Son activité                        | Sa progression          |

#### Gestion des permissions spéciales

- Délégation temporaire de droits (ex: remplacement pendant congés)
- Permissions exceptionnelles sur dossiers spécifiques
- Restrictions géographiques ou organisationnelles
- Audit des modifications de droits

### 1.5 Authentification et sécurité

#### Politique de mots de passe

- Longueur minimale : 12 caractères
- Complexité : majuscules, minuscules, chiffres, caractères spéciaux
- Durée de validité : 90 jours
- Historique : interdiction de réutiliser les 5 derniers mots de passe
- Verrouillage après 5 tentatives échouées

#### Authentification à deux facteurs (2FA)

- Obligatoire pour les administrateurs et consultants
- Optionnelle pour les bénéficiaires
- Méthodes supportées : application d'authentification (Google Authenticator, Microsoft Authenticator), SMS
- Procédure de récupération en cas de perte d'accès

#### Gestion des sessions

- Durée de session active : 30 minutes pour les administrateurs, 2 heures pour les autres utilisateurs
- Déconnexion automatique après inactivité
- Limitation à une session active à la fois
- Journalisation des connexions et déconnexions

## 2. Gestion des bénéficiaires

### 2.1 Structure d'un dossier bénéficiaire

#### Informations administratives

- Identité complète : nom, prénom, date et lieu de naissance, nationalité
- Coordonnées : adresse, téléphone, email
- Situation professionnelle : statut (salarié, demandeur d'emploi, etc.), employeur actuel, poste occupé
- Financement : type (CPF, plan de développement, OPCO, etc.), organisme financeur, montant accordé
- Dates clés : début du bilan, fin prévue, suivi à 6 mois

#### Suivi du bilan

- Phase actuelle : préliminaire, investigation, conclusion, suivi
- Progression : pourcentage de complétion, étapes validées
- Calendrier : rendez-vous passés et à venir
- Notes de suivi : observations du consultant (privées/partageables)
- Points d'attention : éléments nécessitant une vigilance particulière

#### Documents associés

- Documents administratifs : convention tripartite, devis, factures
- Documents de travail : questionnaires complétés, résultats de tests
- Documents de synthèse : synthèses intermédiaires, document final
- Documents personnels : CV, lettres de motivation, certificats

#### Historique des interactions

- Rendez-vous : date, durée, type (présentiel/distanciel), compte-rendu
- Communications : emails, messages internes, appels téléphoniques
- Activités sur la plateforme : connexions, complétion de questionnaires
- Modifications importantes : changements de statut, mises à jour majeures

### 2.2 Cycle de vie d'un dossier bénéficiaire

#### Statuts du bilan et transitions

| Statut                         | Description                            | Transition depuis                        | Transition vers                                    |
| ------------------------------ | -------------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| Pré-inscription                | Dossier créé, en attente de validation | -                                        | En attente de démarrage, Annulé                    |
| En attente de démarrage        | Dossier validé, convention non signée  | Pré-inscription                          | En cours, Annulé                                   |
| En cours - Phase préliminaire  | Phase préliminaire en cours            | En attente de démarrage                  | En cours - Phase investigation, Interrompu, Annulé |
| En cours - Phase investigation | Phase d'investigation en cours         | En cours - Phase préliminaire            | En cours - Phase conclusion, Interrompu, Annulé    |
| En cours - Phase conclusion    | Phase de conclusion en cours           | En cours - Phase investigation           | Terminé, Interrompu, Annulé                        |
| Interrompu                     | Bilan temporairement suspendu          | En cours (toutes phases)                 | En cours (reprise), Abandonné                      |
| Terminé                        | Bilan complété, en attente de suivi    | En cours - Phase conclusion              | Suivi effectué                                     |
| Suivi effectué                 | Entretien de suivi à 6 mois réalisé    | Terminé                                  | Archivé                                            |
| Abandonné                      | Bilan arrêté avant complétion          | Interrompu                               | Archivé                                            |
| Annulé                         | Bilan annulé avant démarrage           | Pré-inscription, En attente de démarrage | Archivé                                            |
| Archivé                        | Dossier conservé pour historique       | Suivi effectué, Abandonné, Annulé        | -                                                  |

#### Règles de transition

- Certaines transitions nécessitent une validation (ex: passage à "Terminé")
- Des documents obligatoires sont requis pour certaines transitions
- Des notifications sont envoyées aux parties prenantes lors des changements de statut
- L'historique des changements de statut est conservé avec date et utilisateur

### 2.3 Tableau de bord de suivi individuel

#### Indicateurs clés

- Progression globale du bilan (pourcentage)
- Temps passé vs temps prévu
- Prochaines échéances
- Documents en attente de complétion
- Alertes et notifications

#### Visualisations

- Timeline du parcours avec étapes passées et à venir
- Graphique radar des compétences identifiées
- Calendrier des rendez-vous
- Activité récente sur la plateforme

#### Filtres et recherche

- Recherche par nom, identifiant, statut
- Filtrage par consultant, phase, financement
- Tri par date de début, progression, prochaine échéance
- Vue personnalisable selon les préférences utilisateur

### 2.4 Règles d'archivage et de conservation

#### Politique de conservation

- Dossiers actifs : conservation complète pendant toute la durée du bilan
- Dossiers terminés : conservation complète pendant 1 an après le suivi à 6 mois
- Dossiers archivés : conservation des données essentielles pendant 5 ans
- Suppression définitive : après 5 ans ou sur demande explicite (droit à l'oubli)

#### Données conservées en archivage

- Informations d'identification minimales
- Dates clés du bilan
- Document de synthèse final (si accord du bénéficiaire)
- Données statistiques anonymisées

#### Processus d'archivage

- Archivage automatique 1 an après le suivi à 6 mois
- Notification préalable au bénéficiaire et au consultant
- Option d'export des données pour le bénéficiaire
- Journalisation des opérations d'archivage

## 3. Planification et gestion des rendez-vous

### 3.1 Gestion des disponibilités des consultants

#### Configuration des disponibilités

- Définition des plages horaires récurrentes (hebdomadaires)
- Ajout de disponibilités exceptionnelles
- Blocage de périodes (congés, formations, etc.)
- Définition du délai minimum de prise de rendez-vous (ex: 24h à l'avance)

#### Règles de disponibilité

- Durée par défaut des rendez-vous selon le type (1h, 2h, 3h)
- Temps de pause obligatoire entre deux rendez-vous (15 min par défaut)
- Nombre maximum de rendez-vous par jour (5 par défaut)
- Plages dédiées à certains types d'entretiens (ex: tests psychométriques le matin)

#### Visualisation des disponibilités

- Vue calendrier (jour, semaine, mois)
- Code couleur par type de rendez-vous
- Indication du taux d'occupation
- Filtres par consultant, type de rendez-vous, lieu

### 3.2 Processus de prise de rendez-vous

#### Prise de rendez-vous par le consultant

1. Sélection du bénéficiaire
2. Choix du type de rendez-vous
3. Sélection de la date et de l'heure parmi les disponibilités
4. Choix du mode (présentiel/distanciel) et du lieu si présentiel
5. Ajout de notes ou instructions particulières
6. Confirmation et envoi automatique d'invitation

#### Prise de rendez-vous par le bénéficiaire

1. Accès à l'espace de prise de rendez-vous
2. Sélection du type de rendez-vous (selon l'étape du bilan)
3. Visualisation des créneaux disponibles
4. Sélection d'un créneau
5. Choix du mode (présentiel/distanciel)
6. Confirmation et notification au consultant

#### Modification d'un rendez-vous

1. Sélection du rendez-vous à modifier
2. Proposition de nouveaux créneaux
3. Indication du motif de modification
4. Validation par l'autre partie
5. Mise à jour automatique des calendriers
6. Notification de la modification

#### Annulation d'un rendez-vous

1. Sélection du rendez-vous à annuler
2. Indication du motif d'annulation
3. Délai d'annulation minimum à respecter (24h par défaut)
4. Proposition automatique de nouveaux créneaux
5. Notification de l'annulation
6. Journalisation de l'annulation (statistiques)

### 3.3 Notifications et rappels

#### Types de notifications

- Confirmation de prise de rendez-vous
- Rappel de rendez-vous (24h et 1h avant)
- Modification de rendez-vous
- Annulation de rendez-vous
- Demande de confirmation de présence

#### Canaux de notification

- Email (par défaut pour tous)
- SMS (optionnel, configurable)
- Notification dans l'application
- Ajout automatique au calendrier (format iCal)

#### Personnalisation des notifications

- Templates personnalisables par l'administrateur
- Variables dynamiques (nom, date, lieu, etc.)
- Fréquence des rappels configurable
- Option de désactivation par type de notification

### 3.4 Intégration de la visioconférence

#### Solutions supportées

- Intégration native avec Zoom
- Intégration avec Microsoft Teams
- Intégration avec Google Meet
- Solution WebRTC propriétaire (option)

#### Fonctionnalités de visioconférence

- Création automatique des liens de réunion
- Salle d'attente virtuelle
- Partage d'écran
- Enregistrement des sessions (avec consentement)
- Tableau blanc collaboratif

#### Processus d'intégration

1. Création automatique de la réunion à la confirmation du rendez-vous
2. Inclusion du lien dans les notifications
3. Rappel avec lien direct 15 minutes avant
4. Accès direct depuis la plateforme
5. Synchronisation du statut (en attente, en cours, terminé)

## 4. Outils d'évaluation en ligne

### 4.1 Structure des questionnaires et tests

#### Types de questionnaires

- Questionnaire d'auto-évaluation des compétences
- Test de personnalité
- Test d'intérêts professionnels
- Grille d'analyse des compétences
- Outil de projection professionnelle

#### Structure de données

```json
{
  "questionnaire_id": "string",
  "title": "string",
  "description": "string",
  "instructions": "string",
  "estimated_time": "number",
  "sections": [
    {
      "section_id": "string",
      "title": "string",
      "description": "string",
      "questions": [
        {
          "question_id": "string",
          "text": "string",
          "type": "enum(multiple_choice, single_choice, scale, text, matrix)",
          "required": "boolean",
          "options": [
            {
              "option_id": "string",
              "text": "string",
              "value": "number"
            }
          ],
          "scoring_rules": {
            "category": "string",
            "weight": "number",
            "formula": "string"
          }
        }
      ]
    }
  ],
  "scoring_categories": [
    {
      "category_id": "string",
      "name": "string",
      "description": "string",
      "min_score": "number",
      "max_score": "number",
      "interpretation_ranges": [
        {
          "min": "number",
          "max": "number",
          "interpretation": "string"
        }
      ]
    }
  ],
  "result_templates": [
    {
      "template_id": "string",
      "title": "string",
      "content": "string with variables"
    }
  ]
}
```

#### Personnalisation des questionnaires

- Activation/désactivation de sections
- Ajout de questions spécifiques
- Modification des instructions
- Personnalisation des échelles de réponse
- Adaptation des interprétations

### 4.2 Algorithmes de scoring et d'analyse

#### Méthodes de scoring

- Somme pondérée des réponses
- Calcul de moyennes par catégorie
- Analyse comparative (percentiles)
- Matrices de correspondance
- Algorithmes spécifiques par type de test

#### Exemple d'algorithme pour test de personnalité

```
Pour chaque dimension (ex: Extraversion):
  score_dimension = 0
  nombre_questions = 0

  Pour chaque question liée à cette dimension:
    Si question.orientation == "positive":
      score_dimension += réponse.valeur
    Sinon:
      score_dimension += (max_échelle - réponse.valeur)
    nombre_questions += 1

  score_final_dimension = (score_dimension / nombre_questions) * 100 / max_échelle

  Déterminer percentile basé sur les normes de référence
  Associer interprétation textuelle selon le percentile
```

#### Analyse croisée

- Corrélation entre différentes dimensions
- Identification de patterns spécifiques
- Comparaison avec profils types
- Suggestions automatisées basées sur les résultats

### 4.3 Présentation des résultats

#### Visualisations graphiques

- Graphiques radar pour les profils multidimensionnels
- Histogrammes pour les comparaisons
- Graphiques en secteurs pour les répartitions
- Courbes d'évolution pour les tests répétés
- Cartes thermiques pour les matrices de compétences

#### Rapports textuels

- Synthèse globale des résultats
- Interprétation détaillée par dimension
- Points forts et axes de développement
- Suggestions personnalisées
- Références aux normes et groupes de comparaison

#### Formats d'export

- PDF pour l'archivage et l'impression
- Données brutes en CSV pour analyses complémentaires
- Graphiques en PNG pour intégration dans d'autres documents
- Rapport complet au format HTML

### 4.4 Gestion des résultats

#### Stockage sécurisé

- Chiffrement des données sensibles
- Accès restreint selon les rôles
- Journalisation des accès aux résultats
- Anonymisation possible pour analyses globales

#### Partage des résultats

- Contrôle par le bénéficiaire des résultats partagés
- Options de partage partiel (certaines dimensions uniquement)
- Génération de liens de partage temporaires
- Traçabilité des partages effectués

#### Historisation

- Conservation de l'historique des tests passés
- Comparaison des résultats dans le temps
- Visualisation de l'évolution
- Annotations contextuelles pour chaque passation

## 5. Gestion documentaire

### 5.1 Modèles de documents

#### Documents administratifs

- Document d'information préalable
- Consentement éclairé
- Convention tripartite
- Devis et factures
- Attestation de présence

#### Documents de suivi

- Support d'entretien pour chaque phase
- Compte-rendu d'entretien
- Synthèse intermédiaire
- Document de synthèse finale
- Questionnaire de satisfaction

#### Structure des modèles

```json
{
  "template_id": "string",
  "name": "string",
  "description": "string",
  "category": "enum(administrative, follow_up, evaluation, synthesis)",
  "format": "enum(docx, pdf, html)",
  "version": "string",
  "created_at": "date",
  "updated_at": "date",
  "content": "string (HTML or base64)",
  "variables": [
    {
      "name": "string",
      "description": "string",
      "type": "enum(text, date, number, boolean, list, table)",
      "required": "boolean",
      "default_value": "any",
      "validation_rules": "string"
    }
  ],
  "sections": [
    {
      "section_id": "string",
      "title": "string",
      "optional": "boolean",
      "conditions": {
        "variable": "string",
        "operator": "enum(equals, not_equals, greater_than, less_than, contains)",
        "value": "any"
      }
    }
  ]
}
```

### 5.2 Génération automatique de documents

#### Variables dynamiques

- Informations du bénéficiaire: `{{beneficiary.first_name}}`, `{{beneficiary.last_name}}`, etc.
- Informations du consultant: `{{consultant.first_name}}`, `{{consultant.last_name}}`, etc.
- Informations du bilan: `{{assessment.start_date}}`, `{{assessment.end_date}}`, etc.
- Résultats des tests: `{{test_results.personality.extraversion}}`, etc.
- Données calculées: `{{assessment.duration_hours}}`, `{{assessment.progress_percentage}}`, etc.

#### Processus de génération

1. Sélection du modèle de document
2. Récupération automatique des variables disponibles
3. Saisie des variables manquantes ou spécifiques
4. Prévisualisation du document
5. Génération au format souhaité (PDF, DOCX)
6. Enregistrement automatique dans le dossier du bénéficiaire

#### Personnalisation à la volée

- Activation/désactivation de sections optionnelles
- Ajout de commentaires spécifiques
- Insertion d'images ou graphiques
- Modification de la mise en page
- Ajout de pièces jointes

### 5.3 Signature électronique

#### Niveaux de signature

- Niveau simple: case à cocher + validation par email
- Niveau avancé: authentification forte + certificat
- Niveau qualifié: signature conforme eIDAS avec certificat qualifié

#### Processus de signature

1. Préparation du document à signer
2. Définition des signataires et de l'ordre de signature
3. Envoi de demandes de signature par email
4. Authentification du signataire
5. Visualisation du document et signature
6. Horodatage et certification
7. Notification de complétion à toutes les parties
8. Archivage du document signé avec preuves

#### Conformité légale

- Piste d'audit complète
- Horodatage qualifié
- Conservation sécurisée des preuves
- Conformité RGPD et eIDAS
- Vérifiabilité des signatures

### 5.4 Organisation et archivage

#### Structure de classement

- Arborescence par bénéficiaire
- Sous-dossiers par catégorie (administratif, évaluation, synthèse)
- Sous-dossiers par phase du bilan
- Nommage standardisé des fichiers

#### Métadonnées des documents

- Type de document
- Date de création/modification
- Auteur/créateur
- Statut (brouillon, final, signé, archivé)
- Mots-clés et tags
- Liens avec d'autres documents

#### Recherche et filtrage

- Recherche plein texte dans le contenu des documents
- Recherche par métadonnées
- Filtrage par type, date, statut
- Recherche avancée avec opérateurs booléens
- Sauvegarde des recherches fréquentes

#### Politique d'archivage

- Archivage automatique selon les règles de conservation
- Compression et chiffrement des archives
- Journalisation des opérations d'archivage
- Procédure de restauration en cas de besoin
- Purge automatique selon les délais légaux

## 6. Communication

### 6.1 Messagerie interne

#### Fonctionnalités de base

- Envoi de messages individuels et de groupe
- Pièces jointes (documents, images)
- Formatage de texte basique
- Indicateurs de lecture
- Réponses et transferts

#### Organisation des conversations

- Fil de discussion par bénéficiaire
- Dossiers de classement personnalisables
- Marquage important/à suivre
- Archivage des conversations anciennes
- Recherche dans l'historique des messages

#### Notifications

- Notification par email des nouveaux messages
- Notifications push dans l'application
- Paramètres de fréquence personnalisables
- Option "ne pas déranger"
- Résumés périodiques des messages non lus

### 6.2 Notifications système

#### Types de notifications

- Administratives: création de compte, changement de mot de passe, etc.
- Liées au bilan: changement de statut, nouvelle étape, etc.
- Liées aux rendez-vous: confirmation, rappel, modification, etc.
- Liées aux documents: nouveau document, demande de signature, etc.
- Liées aux tâches: nouvelle tâche, échéance proche, etc.

#### Modèles de notifications

```json
{
  "notification_template_id": "string",
  "name": "string",
  "type": "enum(email, sms, in_app)",
  "event_trigger": "string",
  "subject": "string",
  "content": "string with variables",
  "variables": ["string"],
  "attachments": ["string"],
  "enabled": "boolean",
  "recipient_roles": ["string"]
}
```

#### Canaux de distribution

- Email: pour les notifications importantes et formelles
- SMS: pour les rappels urgents (rendez-vous)
- Notifications in-app: pour toutes les actions sur la plateforme
- Webhooks: pour intégrations externes (optionnel)

#### Centre de notifications

- Liste centralisée de toutes les notifications
- Filtres par type, date, statut (lu/non lu)
- Marquage comme lu/non lu
- Actions rapides depuis les notifications
- Paramètres de préférences de notification

### 6.3 Partage de ressources

#### Types de ressources

- Documents de référence (fiches métiers, référentiels)
- Articles et contenus pédagogiques
- Vidéos et webinaires
- Liens vers des sites externes
- Outils complémentaires (templates, calculateurs)

#### Organisation des ressources

- Catégorisation thématique
- Tags et mots-clés
- Niveaux d'accès par rôle
- Métadonnées (auteur, date, description)
- Versions et historique des modifications

#### Fonctionnalités de partage

- Partage direct avec un ou plusieurs utilisateurs
- Création de collections personnalisées
- Recommandations automatiques basées sur le profil
- Notifications de nouvelles ressources pertinentes
- Statistiques d'utilisation et de consultation

### 6.4 Forum et espace d'échange (optionnel)

#### Structure du forum

- Catégories thématiques
- Sous-forums par type de public
- Discussions (threads)
- Réponses et commentaires
- Épinglage des sujets importants

#### Fonctionnalités sociales

- Mentions d'utilisateurs (@utilisateur)
- Réactions aux messages (like, utile, etc.)
- Badges et reconnaissance des contributions
- Système de modération et signalement
- Notifications de réponses et mentions

#### Intégration avec le reste de la plateforme

- Référencement des discussions dans les ressources
- Lien entre forum et messagerie privée
- Partage de ressources dans les discussions
- Création de groupes de discussion liés aux bilans
- Statistiques d'engagement et participation

## 7. Facturation et gestion financière

### 7.1 Structure des devis et factures

#### Informations obligatoires

- Identité du prestataire (logo, raison sociale, adresse, SIRET, etc.)
- Identité du client (particulier ou entreprise)
- Numéro unique de devis/facture
- Date d'émission
- Date d'échéance (facture)
- Détail des prestations
- Montants HT, TVA et TTC
- Conditions de paiement
- Mentions légales obligatoires

#### Structure des lignes de facturation

```json
{
  "invoice_id": "string",
  "type": "enum(quote, invoice, credit_note)",
  "status": "enum(draft, sent, paid, cancelled, overdue)",
  "reference": "string",
  "date": "date",
  "due_date": "date",
  "client": {
    "type": "enum(individual, company, organization)",
    "id": "string",
    "name": "string",
    "address": "string",
    "email": "string",
    "phone": "string",
    "vat_number": "string"
  },
  "beneficiary": {
    "id": "string",
    "name": "string"
  },
  "items": [
    {
      "description": "string",
      "quantity": "number",
      "unit_price": "number",
      "vat_rate": "number",
      "amount": "number"
    }
  ],
  "subtotal": "number",
  "vat_amount": "number",
  "total": "number",
  "payment_terms": "string",
  "notes": "string",
  "attachments": ["string"]
}
```

#### Personnalisation

- Templates personnalisables (couleurs, polices, mise en page)
- Champs personnalisés additionnels
- Conditions générales de vente personnalisables
- Ajout de pièces jointes (convention, programme, etc.)
- Personnalisation des emails d'envoi

### 7.2 Processus de facturation

#### Création de devis

1. Sélection du bénéficiaire et du financeur
2. Sélection des prestations et quantités
3. Application des tarifs et remises éventuelles
4. Prévisualisation et ajustements
5. Génération du PDF
6. Envoi par email ou téléchargement
7. Suivi du statut (envoyé, accepté, refusé)

#### Conversion en facture

1. Sélection du devis accepté
2. Vérification et ajustements éventuels
3. Génération de la facture avec numéro unique
4. Envoi automatique par email
5. Enregistrement dans le dossier du bénéficiaire
6. Mise à jour du statut financier du dossier

#### Gestion des paiements

1. Saisie manuelle ou détection automatique des paiements
2. Rapprochement avec les factures correspondantes
3. Génération automatique des reçus
4. Notification au client et mise à jour du statut
5. Gestion des paiements partiels et échelonnés
6. Relances automatiques en cas de retard

#### Avoirs et remboursements

1. Création d'avoir total ou partiel
2. Liaison avec la facture d'origine
3. Justification et motif de l'avoir
4. Gestion des remboursements
5. Suivi comptable des avoirs

### 7.3 Intégration avec les OPCO et financeurs

#### Formats d'échange

- Export au format attendu par chaque OPCO
- Génération des demandes de prise en charge
- Création des attestations de présence
- Production des bilans pédagogiques et financiers
- Factures aux formats spécifiques des financeurs

#### Processus d'intégration

1. Identification du financeur dans le dossier bénéficiaire
2. Sélection du format d'échange approprié
3. Génération automatique des documents requis
4. Transmission électronique quand possible
5. Suivi des demandes et des paiements
6. Gestion des rejets et demandes complémentaires

#### Financeurs supportés

- Tous les OPCO (Constructys, Atlas, Akto, etc.)
- France Travail (Pôle Emploi)
- Caisse des Dépôts (CPF)
- Conseils régionaux
- Employeurs directs

### 7.4 Reporting financier

#### Tableaux de bord financiers

- Chiffre d'affaires (mensuel, trimestriel, annuel)
- Répartition par type de financement
- Taux de conversion devis/factures
- Délai moyen de paiement
- Factures en retard et taux de recouvrement

#### Exports comptables

- Export au format du logiciel comptable (CSV, XML)
- Journal des ventes
- Grand livre
- Balance âgée
- État des règlements
- Déclaration de TVA

#### Analyses et prévisions

- Prévisionnel de trésorerie
- Analyse de rentabilité par type de bilan
- Comparaison avec périodes précédentes
- Projection des revenus basée sur les bilans en cours
- Alertes sur les écarts significatifs

## 8. Reporting et pilotage

### 8.1 Tableaux de bord administrateur

#### Indicateurs clés de performance

- Nombre de bilans en cours, terminés, abandonnés
- Taux de complétion des bilans
- Durée moyenne des bilans
- Taux de satisfaction des bénéficiaires
- Taux de transformation des projets professionnels

#### Visualisations

- Graphiques d'évolution temporelle
- Répartition par statut, consultant, financeur
- Cartes thermiques d'activité
- Indicateurs avec code couleur (vert/orange/rouge)
- Comparaison avec objectifs et périodes précédentes

#### Filtres et segmentation

- Par période (jour, semaine, mois, trimestre, année)
- Par consultant ou équipe
- Par type de bénéficiaire (statut, secteur, âge)
- Par type de financement
- Par localisation géographique

### 8.2 Suivi de l'activité

#### Suivi des bilans

- Nombre de bilans par phase
- Progression moyenne par phase
- Taux d'abandon par phase
- Durée moyenne par phase
- Écart par rapport au calendrier prévisionnel

#### Suivi des consultants

- Nombre de bilans par consultant
- Taux de charge des consultants
- Taux de satisfaction par consultant
- Délai moyen de réponse aux messages
- Respect des délais de production des documents

#### Suivi des rendez-vous

- Taux de présence aux rendez-vous
- Taux d'annulation et report
- Délai moyen entre deux rendez-vous
- Répartition présentiel/distanciel
- Durée moyenne des entretiens

### 8.3 Statistiques sur les résultats des bilans

#### Indicateurs de résultats

- Types de projets professionnels définis
- Secteurs d'activité ciblés
- Besoins en formation identifiés
- Taux de mise en œuvre des projets (à 6 mois)
- Impact sur la situation professionnelle

#### Analyses des compétences

- Compétences les plus fréquemment identifiées
- Écarts entre compétences actuelles et visées
- Besoins en développement de compétences
- Corrélations entre profils et projets
- Tendances émergentes dans les compétences recherchées

#### Analyses démographiques

- Répartition par âge, genre, niveau d'études
- Répartition par secteur d'origine et cible
- Répartition par ancienneté professionnelle
- Corrélation entre profil démographique et résultats
- Évolution des tendances dans le temps

### 8.4 Rapports personnalisables

#### Types de rapports

- Rapport d'activité (mensuel, trimestriel, annuel)
- Rapport de qualité (satisfaction, résultats)
- Rapport financier (CA, rentabilité)
- Rapport de conformité (Qualiopi, RGPD)
- Rapport d'impact (devenir des bénéficiaires)

#### Personnalisation des rapports

- Sélection des indicateurs à inclure
- Choix des visualisations
- Définition de la période d'analyse
- Filtres et segmentation
- Format d'export (PDF, Excel, PowerPoint)

#### Automatisation

- Génération programmée (jour/heure fixe)
- Distribution automatique par email
- Archivage historique des rapports
- Comparaison automatique avec périodes précédentes
- Annotations et commentaires automatiques sur les variations significatives

## 9. Intégrations externes

### 9.1 Intégration avec les calendriers

#### Calendriers supportés

- Google Calendar
- Microsoft Outlook
- Apple Calendar (iCal)
- Autres calendriers supportant le format iCal

#### Fonctionnalités d'intégration

- Synchronisation bidirectionnelle des rendez-vous
- Mise à jour automatique en cas de modification
- Gestion des fuseaux horaires
- Inclusion des informations de visioconférence
- Notifications de conflit d'horaire

#### Processus de synchronisation

1. Autorisation de l'accès au calendrier externe
2. Sélection des types d'événements à synchroniser
3. Définition de la fréquence de synchronisation
4. Gestion des conflits et priorités
5. Personnalisation du format des événements

### 9.2 Intégration avec les outils de comptabilité

#### Logiciels supportés

- QuickBooks
- Sage
- Pennylane
- EBP
- Format d'export générique (CSV, XML)

#### Données synchronisées

- Clients et bénéficiaires
- Devis et factures
- Paiements et avoirs
- Produits et services
- Taxes et comptes comptables

#### Méthodes d'intégration

- API directe quand disponible
- Import/export de fichiers
- Webhooks pour les mises à jour en temps réel
- Synchronisation programmée (quotidienne, hebdomadaire)
- Journalisation des opérations de synchronisation

### 9.3 Intégration avec les outils de communication

#### Outils supportés

- Zoom (visioconférence)
- Microsoft Teams
- Google Meet
- SendGrid/Mailgun (emails)
- Twilio (SMS)

#### Fonctionnalités d'intégration

- Création automatique des réunions
- Envoi des invitations et rappels
- Enregistrement des sessions (avec consentement)
- Suivi des communications envoyées
- Statistiques d'ouverture et de clic (emails)

#### Sécurité des intégrations

- Authentification sécurisée (OAuth 2.0)
- Chiffrement des données échangées
- Audit des accès et opérations
- Révocation possible des accès
- Conformité RGPD des sous-traitants

### 9.4 API publique (optionnelle)

#### Fonctionnalités exposées

- Gestion des bénéficiaires (lecture seule)
- Consultation des rendez-vous
- Statut des bilans
- Statistiques anonymisées
- Webhooks pour les événements importants

#### Sécurité de l'API

- Authentification par clés API
- Jetons JWT avec durée limitée
- Rate limiting par client
- Filtrage IP
- Journalisation complète des appels

#### Documentation

- Spécification OpenAPI/Swagger
- Exemples de code dans différents langages
- Environnement de test (sandbox)
- Guides d'intégration
- Support technique dédié

## 10. Exigences non fonctionnelles

### 10.1 Performance

#### Temps de réponse

- Chargement initial de page < 2 secondes
- Actions utilisateur < 1 seconde
- Génération de documents < 5 secondes
- Recherche < 3 secondes
- Chargement des tableaux de bord < 3 secondes

#### Capacité

- Support de 500 utilisateurs simultanés
- Jusqu'à 10 000 bénéficiaires dans le système
- Jusqu'à 100 000 documents stockés
- Jusqu'à 1 million d'événements de journal par mois
- Croissance annuelle estimée : 30%

#### Optimisation

- Mise en cache des données fréquemment accédées
- Pagination des résultats volumineux
- Chargement différé des composants non critiques
- Compression des assets (images, CSS, JavaScript)
- Optimisation des requêtes de base de données

### 10.2 Disponibilité et fiabilité

#### Objectifs de disponibilité

- Disponibilité globale : 99,9% (environ 8,8 heures d'indisponibilité par an)
- Plage de maintenance planifiée : dimanche 2h-6h (heure de Paris)
- Notification des maintenances 7 jours à l'avance
- Plan de continuité en cas de panne majeure

#### Sauvegarde et restauration

- Sauvegarde complète quotidienne
- Sauvegarde incrémentale toutes les heures
- Conservation des sauvegardes : 30 jours
- Temps de restauration maximum : 4 heures
- Test de restauration mensuel

#### Monitoring et alertes

- Surveillance 24/7 des services critiques
- Alertes automatiques en cas d'anomalie
- Tableau de bord de santé du système
- Historique des incidents et résolutions
- Rapports de disponibilité mensuels

### 10.3 Sécurité

#### Protection des données

- Chiffrement des données sensibles au repos (AES-256)
- Chiffrement des communications (TLS 1.3)
- Hachage des mots de passe (bcrypt)
- Cloisonnement des données entre clients
- Anonymisation des données pour le reporting

#### Contrôles d'accès

- Authentification forte (mot de passe + 2FA)
- Gestion fine des permissions par rôle
- Verrouillage après tentatives échouées
- Session timeout automatique
- Journalisation des accès et actions sensibles

#### Tests de sécurité

- Analyse statique de code
- Tests de pénétration trimestriels
- Scan de vulnérabilités mensuel
- Audit de sécurité annuel
- Programme de bug bounty (optionnel)

### 10.4 Accessibilité

#### Conformité aux standards

- WCAG 2.1 niveau AA
- Support des lecteurs d'écran
- Navigation au clavier complète
- Contraste suffisant des textes
- Textes alternatifs pour les images

#### Adaptations spécifiques

- Redimensionnement du texte sans perte de fonctionnalité
- Compatibilité avec les outils d'agrandissement
- Support des préférences de contraste du système
- Sous-titres pour les contenus vidéo
- Transcriptions pour les contenus audio

#### Tests d'accessibilité

- Validation automatique (outils WAVE, Axe)
- Tests manuels avec technologies d'assistance
- Panel d'utilisateurs en situation de handicap
- Audit d'accessibilité annuel
- Plan d'amélioration continue

### 10.5 Internationalisation (optionnelle)

#### Langues supportées

- Français (langue principale)
- Anglais (optionnel)
- Autres langues européennes (optionnel)

#### Éléments internationalisés

- Interface utilisateur
- Emails et notifications
- Documents générés
- Messages d'erreur et d'aide
- Contenu statique

#### Adaptations culturelles

- Formats de date et heure
- Formats de nombre et devise
- Unités de mesure
- Fuseaux horaires
- Jours fériés et calendriers

## 11. Spécifications techniques complémentaires

### 11.1 Environnements

#### Environnement de développement

- Serveurs de développement individuels
- Base de données de développement avec données anonymisées
- Intégration continue (CI) pour les tests automatisés
- Revue de code obligatoire avant merge
- Déploiement automatique vers l'environnement de test

#### Environnement de test

- Configuration identique à la production
- Données de test représentatives
- Accessible aux testeurs et clients pour validation
- Rafraîchi régulièrement depuis la production (données anonymisées)
- Tests de non-régression automatisés

#### Environnement de production

- Infrastructure haute disponibilité
- Scaling automatique selon la charge
- Monitoring complet
- Sauvegardes régulières
- Procédures de rollback

### 11.2 Déploiement

#### Stratégie de déploiement

- Déploiement blue/green pour minimiser les interruptions
- Fenêtres de maintenance planifiées pour les mises à jour majeures
- Déploiements mineurs sans interruption de service
- Tests automatisés pré-déploiement
- Procédure de rollback automatisée

#### Gestion des versions

- Versionnement sémantique (MAJOR.MINOR.PATCH)
- Notes de version détaillées pour chaque déploiement
- Historique des versions accessible aux administrateurs
- Compatibilité ascendante garantie pour les API
- Migration automatique des données si nécessaire

#### Processus de mise à jour

1. Tests complets en environnement de test
2. Approbation formelle avant déploiement
3. Création d'une sauvegarde pré-déploiement
4. Déploiement progressif (canary release)
5. Vérification post-déploiement
6. Communication aux utilisateurs

### 11.3 Support et maintenance

#### Niveaux de support

- Support niveau 1 : problèmes simples, questions d'utilisation
- Support niveau 2 : problèmes techniques, configuration
- Support niveau 3 : incidents critiques, bugs, développement

#### Canaux de support

- Formulaire de contact dans l'application
- Email dédié
- Téléphone (heures ouvrées)
- Base de connaissances et FAQ
- Tutoriels vidéo

#### SLA (Service Level Agreement)

- Incident critique : réponse < 1h, résolution < 4h
- Incident majeur : réponse < 4h, résolution < 24h
- Incident mineur : réponse < 24h, résolution < 72h
- Demande d'évolution : réponse < 48h, planification < 2 semaines

#### Maintenance évolutive

- Roadmap trimestrielle
- Comité d'évolution mensuel
- Processus de remontée et priorisation des demandes
- Communication anticipée des nouvelles fonctionnalités
- Programme bêta-testeurs pour les fonctionnalités majeures

## 12. Plan de mise en œuvre

### 12.1 Phases de développement détaillées

#### Phase 1 : Fondations (4-6 semaines)

- Mise en place de l'infrastructure
- Développement du système d'authentification
- Création des modèles de données de base
- Développement des interfaces utilisateur principales
- Configuration de l'environnement CI/CD

#### Phase 2 : Fonctionnalités core (8-10 semaines)

- Gestion complète des utilisateurs et des rôles
- Gestion des bénéficiaires
- Planification des rendez-vous
- Système de messagerie interne
- Tableaux de bord de base

#### Phase 3 : Outils d'évaluation (6-8 semaines)

- Système de questionnaires dynamiques
- Algorithmes de scoring
- Visualisation des résultats
- Interprétation automatique
- Historisation et comparaison

#### Phase 4 : Gestion documentaire (6-8 semaines)

- Système de modèles de documents
- Génération automatique de documents
- Intégration de la signature électronique
- Gestion du stockage et de l'archivage
- Système de recherche avancée

#### Phase 5 : Facturation et reporting (4-6 semaines)

- Système de devis et factures
- Intégration avec les OPCO
- Tableaux de bord avancés
- Rapports personnalisables
- Exports comptables

#### Phase 6 : Finalisation (4-6 semaines)

- Tests complets de bout en bout
- Optimisation des performances
- Renforcement de la sécurité
- Documentation utilisateur
- Formation des administrateurs

### 12.2 Jalons clés

| Jalon | Description                   | Livrable                                      | Échéance estimée |
| ----- | ----------------------------- | --------------------------------------------- | ---------------- |
| J1    | Validation des spécifications | Document de spécifications approuvé           | Semaine 0        |
| J2    | Prototype fonctionnel         | Démonstration des interfaces principales      | Semaine 6        |
| J3    | Version alpha                 | Système fonctionnel avec fonctionnalités core | Semaine 16       |
| J4    | Version bêta                  | Système complet pour tests utilisateurs       | Semaine 28       |
| J5    | Recette                       | Validation fonctionnelle complète             | Semaine 32       |
| J6    | Mise en production            | Déploiement en environnement de production    | Semaine 34       |
| J7    | Formation                     | Formation des administrateurs et consultants  | Semaine 35-36    |
| J8    | Lancement                     | Ouverture aux utilisateurs finaux             | Semaine 38       |

### 12.3 Stratégie de test

#### Types de tests

- Tests unitaires : fonctions et composants individuels
- Tests d'intégration : interactions entre modules
- Tests fonctionnels : validation des cas d'utilisation
- Tests de performance : temps de réponse et charge
- Tests de sécurité : vulnérabilités et protection des données
- Tests d'accessibilité : conformité WCAG
- Tests utilisateurs : expérience utilisateur réelle

#### Approche de test

- Tests automatisés pour les fonctionnalités critiques
- Tests manuels pour l'expérience utilisateur
- Tests de non-régression avant chaque déploiement
- Tests de charge périodiques
- Tests de sécurité continus

#### Critères d'acceptation

- Couverture de code > 80% pour les tests unitaires
- 100% des cas d'utilisation critiques testés
- Temps de réponse conformes aux exigences de performance
- Zéro vulnérabilité critique ou majeure
- Conformité WCAG 2.1 niveau AA

### 12.4 Formation et accompagnement

#### Plan de formation

- Formation administrateurs (2 jours)
- Formation consultants (1 jour)
- Formation utilisateurs avancés (0,5 jour)
- Webinaires thématiques (1h par module)
- Tutoriels vidéo pour les bénéficiaires

#### Supports de formation

- Manuels utilisateurs par profil
- Guides pas à pas pour les tâches courantes
- Base de connaissances searchable
- FAQ dynamique
- Vidéos tutorielles

#### Accompagnement au changement

- Communication régulière sur l'avancement du projet
- Implication des utilisateurs clés dans les tests
- Période de transition avec support renforcé
- Recueil et traitement des retours utilisateurs
- Ajustements rapides post-déploiement

## 13. Annexes

### 13.1 Glossaire

| Terme                 | Définition                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| Bilan de compétences  | Dispositif permettant l'analyse des compétences, aptitudes et motivations pour définir un projet professionnel |
| Bénéficiaire          | Personne réalisant un bilan de compétences                                                                     |
| Consultant            | Professionnel accompagnant le bénéficiaire dans son bilan                                                      |
| OPCO                  | Opérateur de Compétences, organisme financeur de formation professionnelle                                     |
| CPF                   | Compte Personnel de Formation                                                                                  |
| Qualiopi              | Certification qualité des prestataires de formation                                                            |
| Convention tripartite | Accord entre le bénéficiaire, l'organisme prestataire et éventuellement l'employeur                            |
| Document de synthèse  | Document final résumant le bilan de compétences                                                                |

### 13.2 Références légales et réglementaires

- Articles L6313-1, L6313-4 et R6313-4 à R6313-8 du Code du travail
- Référentiel national qualité Qualiopi
- Règlement Général sur la Protection des Données (RGPD)
- Règlement eIDAS pour la signature électronique
- Normes d'accessibilité WCAG 2.1

### 13.3 Questions en suspens

1. Quelle est la préférence pour l'hébergement (cloud ou serveurs dédiés) ?
2. Quel est le budget alloué au projet ?
3. Quel est le délai de mise en œuvre souhaité ?
4. Quelles intégrations avec des systèmes existants sont nécessaires ?
5. Quel est le volume d'utilisateurs attendu (concurrent et total) ?
6. Quels sont les besoins spécifiques en termes de personnalisation ?
7. Quelles sont les modalités de support et de maintenance après déploiement ?
8. Quelle est la stratégie de formation des utilisateurs ?
9. Quelles sont les exigences en matière de disponibilité et de temps de réponse ?
10. Quelles sont les préférences technologiques de l'équipe de développement ?
