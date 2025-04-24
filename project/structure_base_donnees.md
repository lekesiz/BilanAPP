# Structure de la base de données

# Plateforme de gestion des bilans de compétences

## Introduction

Ce document présente la structure de la base de données pour la plateforme de gestion des bilans de compétences. Il définit les entités principales, leurs attributs et les relations entre elles. La conception suit les principes de normalisation pour garantir l'intégrité des données, éviter la redondance et optimiser les performances.

## Choix technologique

La base de données sera implémentée avec PostgreSQL, un système de gestion de base de données relationnelle robuste qui offre:

- Support avancé des transactions
- Excellente gestion des données complexes
- Bonnes performances pour les requêtes analytiques
- Fonctionnalités avancées (JSON, full-text search, etc.)

## Schéma conceptuel

Le schéma conceptuel est organisé autour des entités principales suivantes:

1. Utilisateurs (différents types: administrateurs, consultants, bénéficiaires)
2. Bilans de compétences
3. Rendez-vous
4. Questionnaires et tests
5. Documents
6. Communications
7. Facturation

## Modèle de données détaillé

### 1. Gestion des utilisateurs

#### Table: users

| Colonne                | Type         | Contraintes                 | Description                                              |
| ---------------------- | ------------ | --------------------------- | -------------------------------------------------------- |
| id                     | UUID         | PK                          | Identifiant unique                                       |
| email                  | VARCHAR(255) | UNIQUE, NOT NULL            | Adresse email (identifiant de connexion)                 |
| password_hash          | VARCHAR(255) | NOT NULL                    | Hash du mot de passe                                     |
| first_name             | VARCHAR(100) | NOT NULL                    | Prénom                                                   |
| last_name              | VARCHAR(100) | NOT NULL                    | Nom de famille                                           |
| phone                  | VARCHAR(20)  |                             | Numéro de téléphone                                      |
| user_type              | ENUM         | NOT NULL                    | Type d'utilisateur: 'admin', 'consultant', 'beneficiary' |
| role                   | VARCHAR(50)  |                             | Rôle spécifique (ex: 'super_admin', 'consultant_senior') |
| status                 | ENUM         | NOT NULL, DEFAULT 'pending' | Statut: 'pending', 'active', 'inactive', 'blocked'       |
| created_at             | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Date de création                                         |
| updated_at             | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Date de dernière modification                            |
| last_login             | TIMESTAMP    |                             | Date de dernière connexion                               |
| two_factor_enabled     | BOOLEAN      | NOT NULL, DEFAULT false     | Activation de l'authentification à deux facteurs         |
| two_factor_secret      | VARCHAR(255) |                             | Secret pour l'authentification à deux facteurs           |
| password_reset_token   | VARCHAR(255) |                             | Token pour réinitialisation du mot de passe              |
| password_reset_expires | TIMESTAMP    |                             | Date d'expiration du token de réinitialisation           |

#### Table: user_profiles

| Colonne                  | Type         | Contraintes             | Description                                          |
| ------------------------ | ------------ | ----------------------- | ---------------------------------------------------- |
| id                       | UUID         | PK                      | Identifiant unique                                   |
| user_id                  | UUID         | FK (users.id), NOT NULL | Référence à l'utilisateur                            |
| profile_type             | ENUM         | NOT NULL                | Type de profil: 'admin', 'consultant', 'beneficiary' |
| address                  | TEXT         |                         | Adresse postale                                      |
| city                     | VARCHAR(100) |                         | Ville                                                |
| postal_code              | VARCHAR(20)  |                         | Code postal                                          |
| country                  | VARCHAR(100) | DEFAULT 'France'        | Pays                                                 |
| birth_date               | DATE         |                         | Date de naissance (pour bénéficiaires)               |
| job_title                | VARCHAR(255) |                         | Titre du poste actuel                                |
| company                  | VARCHAR(255) |                         | Entreprise actuelle (pour bénéficiaires)             |
| seniority                | INTEGER      |                         | Ancienneté en mois (pour bénéficiaires)              |
| qualification            | TEXT         |                         | Qualifications (pour consultants)                    |
| specialties              | TEXT[]       |                         | Spécialités (pour consultants)                       |
| cv_summary               | TEXT         |                         | Résumé du CV (pour consultants)                      |
| profile_picture          | VARCHAR(255) |                         | Chemin vers la photo de profil                       |
| notification_preferences | JSONB        |                         | Préférences de notification au format JSON           |
| created_at               | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création                                     |
| updated_at               | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de dernière modification                        |

#### Table: user_sessions

| Colonne    | Type         | Contraintes             | Description                          |
| ---------- | ------------ | ----------------------- | ------------------------------------ |
| id         | UUID         | PK                      | Identifiant unique                   |
| user_id    | UUID         | FK (users.id), NOT NULL | Référence à l'utilisateur            |
| token      | VARCHAR(255) | NOT NULL                | Token de session                     |
| ip_address | VARCHAR(45)  | NOT NULL                | Adresse IP                           |
| user_agent | TEXT         |                         | User-Agent du navigateur             |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création                     |
| expires_at | TIMESTAMP    | NOT NULL                | Date d'expiration                    |
| revoked    | BOOLEAN      | NOT NULL, DEFAULT false | Indique si la session a été révoquée |

#### Table: permissions

| Colonne     | Type         | Contraintes             | Description                  |
| ----------- | ------------ | ----------------------- | ---------------------------- |
| id          | UUID         | PK                      | Identifiant unique           |
| name        | VARCHAR(100) | UNIQUE, NOT NULL        | Nom de la permission         |
| description | TEXT         |                         | Description de la permission |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création             |

#### Table: roles

| Colonne     | Type         | Contraintes             | Description         |
| ----------- | ------------ | ----------------------- | ------------------- |
| id          | UUID         | PK                      | Identifiant unique  |
| name        | VARCHAR(100) | UNIQUE, NOT NULL        | Nom du rôle         |
| description | TEXT         |                         | Description du rôle |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création    |

#### Table: role_permissions

| Colonne       | Type      | Contraintes                   | Description               |
| ------------- | --------- | ----------------------------- | ------------------------- |
| role_id       | UUID      | FK (roles.id), NOT NULL       | Référence au rôle         |
| permission_id | UUID      | FK (permissions.id), NOT NULL | Référence à la permission |
| created_at    | TIMESTAMP | NOT NULL, DEFAULT NOW()       | Date de création          |
| PRIMARY KEY   |           | (role_id, permission_id)      | Clé primaire composite    |

#### Table: user_roles

| Colonne     | Type      | Contraintes             | Description               |
| ----------- | --------- | ----------------------- | ------------------------- |
| user_id     | UUID      | FK (users.id), NOT NULL | Référence à l'utilisateur |
| role_id     | UUID      | FK (roles.id), NOT NULL | Référence au rôle         |
| created_at  | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date de création          |
| PRIMARY KEY |           | (user_id, role_id)      | Clé primaire composite    |

### 2. Gestion des bilans de compétences

#### Table: assessments

| Colonne              | Type          | Contraintes             | Description                                                                                                                                                              |
| -------------------- | ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                   | UUID          | PK                      | Identifiant unique                                                                                                                                                       |
| beneficiary_id       | UUID          | FK (users.id), NOT NULL | Référence au bénéficiaire                                                                                                                                                |
| consultant_id        | UUID          | FK (users.id), NOT NULL | Référence au consultant principal                                                                                                                                        |
| status               | ENUM          | NOT NULL                | Statut: 'pre_registration', 'pending_start', 'preliminary', 'investigation', 'conclusion', 'interrupted', 'completed', 'follow_up', 'abandoned', 'cancelled', 'archived' |
| start_date           | DATE          |                         | Date de début effective                                                                                                                                                  |
| expected_end_date    | DATE          |                         | Date de fin prévue                                                                                                                                                       |
| actual_end_date      | DATE          |                         | Date de fin effective                                                                                                                                                    |
| follow_up_date       | DATE          |                         | Date du suivi à 6 mois                                                                                                                                                   |
| funding_type         | ENUM          |                         | Type de financement: 'cpf', 'employer', 'opco', 'personal', 'other'                                                                                                      |
| funding_organization | VARCHAR(255)  |                         | Organisme financeur                                                                                                                                                      |
| funding_amount       | DECIMAL(10,2) |                         | Montant du financement                                                                                                                                                   |
| total_hours          | DECIMAL(5,2)  | DEFAULT 24.0            | Nombre total d'heures                                                                                                                                                    |
| completed_hours      | DECIMAL(5,2)  | DEFAULT 0.0             | Nombre d'heures réalisées                                                                                                                                                |
| progress_percentage  | INTEGER       | DEFAULT 0               | Pourcentage de progression                                                                                                                                               |
| notes                | TEXT          |                         | Notes internes                                                                                                                                                           |
| created_at           | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Date de création                                                                                                                                                         |
| updated_at           | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Date de dernière modification                                                                                                                                            |

#### Table: assessment_phases

| Colonne         | Type         | Contraintes                   | Description                                                              |
| --------------- | ------------ | ----------------------------- | ------------------------------------------------------------------------ |
| id              | UUID         | PK                            | Identifiant unique                                                       |
| assessment_id   | UUID         | FK (assessments.id), NOT NULL | Référence au bilan                                                       |
| phase_type      | ENUM         | NOT NULL                      | Type de phase: 'preliminary', 'investigation', 'conclusion', 'follow_up' |
| status          | ENUM         | NOT NULL                      | Statut: 'pending', 'in_progress', 'completed'                            |
| start_date      | DATE         |                               | Date de début                                                            |
| end_date        | DATE         |                               | Date de fin                                                              |
| hours_allocated | DECIMAL(5,2) |                               | Heures allouées                                                          |
| hours_completed | DECIMAL(5,2) | DEFAULT 0.0                   | Heures réalisées                                                         |
| created_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW()       | Date de création                                                         |
| updated_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW()       | Date de dernière modification                                            |

#### Table: assessment_steps

| Colonne             | Type         | Contraintes                         | Description                                   |
| ------------------- | ------------ | ----------------------------------- | --------------------------------------------- |
| id                  | UUID         | PK                                  | Identifiant unique                            |
| assessment_phase_id | UUID         | FK (assessment_phases.id), NOT NULL | Référence à la phase                          |
| name                | VARCHAR(255) | NOT NULL                            | Nom de l'étape                                |
| description         | TEXT         |                                     | Description de l'étape                        |
| status              | ENUM         | NOT NULL                            | Statut: 'pending', 'in_progress', 'completed' |
| order_index         | INTEGER      | NOT NULL                            | Ordre dans la phase                           |
| scheduled_date      | DATE         |                                     | Date prévue                                   |
| completion_date     | DATE         |                                     | Date de réalisation                           |
| created_at          | TIMESTAMP    | NOT NULL, DEFAULT NOW()             | Date de création                              |
| updated_at          | TIMESTAMP    | NOT NULL, DEFAULT NOW()             | Date de dernière modification                 |

#### Table: assessment_status_history

| Colonne         | Type      | Contraintes                   | Description                              |
| --------------- | --------- | ----------------------------- | ---------------------------------------- |
| id              | UUID      | PK                            | Identifiant unique                       |
| assessment_id   | UUID      | FK (assessments.id), NOT NULL | Référence au bilan                       |
| previous_status | ENUM      |                               | Statut précédent                         |
| new_status      | ENUM      | NOT NULL                      | Nouveau statut                           |
| changed_by      | UUID      | FK (users.id), NOT NULL       | Utilisateur ayant effectué le changement |
| change_reason   | TEXT      |                               | Raison du changement                     |
| created_at      | TIMESTAMP | NOT NULL, DEFAULT NOW()       | Date du changement                       |

#### Table: assessment_notes

| Colonne       | Type      | Contraintes                   | Description                   |
| ------------- | --------- | ----------------------------- | ----------------------------- |
| id            | UUID      | PK                            | Identifiant unique            |
| assessment_id | UUID      | FK (assessments.id), NOT NULL | Référence au bilan            |
| author_id     | UUID      | FK (users.id), NOT NULL       | Auteur de la note             |
| content       | TEXT      | NOT NULL                      | Contenu de la note            |
| is_private    | BOOLEAN   | NOT NULL, DEFAULT true        | Indique si la note est privée |
| created_at    | TIMESTAMP | NOT NULL, DEFAULT NOW()       | Date de création              |
| updated_at    | TIMESTAMP | NOT NULL, DEFAULT NOW()       | Date de dernière modification |

### 3. Gestion des rendez-vous

#### Table: appointments

| Colonne                   | Type         | Contraintes                   | Description                                                                          |
| ------------------------- | ------------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| id                        | UUID         | PK                            | Identifiant unique                                                                   |
| assessment_id             | UUID         | FK (assessments.id), NOT NULL | Référence au bilan                                                                   |
| consultant_id             | UUID         | FK (users.id), NOT NULL       | Référence au consultant                                                              |
| beneficiary_id            | UUID         | FK (users.id), NOT NULL       | Référence au bénéficiaire                                                            |
| title                     | VARCHAR(255) | NOT NULL                      | Titre du rendez-vous                                                                 |
| description               | TEXT         |                               | Description du rendez-vous                                                           |
| appointment_type          | ENUM         | NOT NULL                      | Type: 'preliminary', 'investigation', 'conclusion', 'follow_up', 'other'             |
| start_datetime            | TIMESTAMP    | NOT NULL                      | Date et heure de début                                                               |
| end_datetime              | TIMESTAMP    | NOT NULL                      | Date et heure de fin                                                                 |
| duration_minutes          | INTEGER      | NOT NULL                      | Durée en minutes                                                                     |
| location_type             | ENUM         | NOT NULL                      | Type de lieu: 'office', 'remote', 'other'                                            |
| location_details          | TEXT         |                               | Détails sur le lieu                                                                  |
| status                    | ENUM         | NOT NULL                      | Statut: 'scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show' |
| video_conference_link     | TEXT         |                               | Lien de visioconférence                                                              |
| video_conference_provider | VARCHAR(100) |                               | Fournisseur de visioconférence                                                       |
| reminder_sent             | BOOLEAN      | NOT NULL, DEFAULT false       | Indique si le rappel a été envoyé                                                    |
| notes                     | TEXT         |                               | Notes sur le rendez-vous                                                             |
| created_at                | TIMESTAMP    | NOT NULL, DEFAULT NOW()       | Date de création                                                                     |
| updated_at                | TIMESTAMP    | NOT NULL, DEFAULT NOW()       | Date de dernière modification                                                        |

#### Table: appointment_summaries

| Colonne        | Type      | Contraintes                    | Description                   |
| -------------- | --------- | ------------------------------ | ----------------------------- |
| id             | UUID      | PK                             | Identifiant unique            |
| appointment_id | UUID      | FK (appointments.id), NOT NULL | Référence au rendez-vous      |
| author_id      | UUID      | FK (users.id), NOT NULL        | Auteur du compte-rendu        |
| content        | TEXT      | NOT NULL                       | Contenu du compte-rendu       |
| is_shared      | BOOLEAN   | NOT NULL, DEFAULT false        | Partagé avec le bénéficiaire  |
| created_at     | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Date de création              |
| updated_at     | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Date de dernière modification |

#### Table: consultant_availabilities

| Colonne             | Type      | Contraintes                                            | Description                                                 |
| ------------------- | --------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| id                  | UUID      | PK                                                     | Identifiant unique                                          |
| consultant_id       | UUID      | FK (users.id), NOT NULL                                | Référence au consultant                                     |
| day_of_week         | INTEGER   |                                                        | Jour de la semaine (1-7, NULL pour date spécifique)         |
| specific_date       | DATE      |                                                        | Date spécifique (NULL pour récurrent)                       |
| start_time          | TIME      | NOT NULL                                               | Heure de début                                              |
| end_time            | TIME      | NOT NULL                                               | Heure de fin                                                |
| is_available        | BOOLEAN   | NOT NULL, DEFAULT true                                 | Disponible ou bloqué                                        |
| recurrence_type     | ENUM      |                                                        | Type de récurrence: 'weekly', 'biweekly', 'monthly', 'none' |
| recurrence_end_date | DATE      |                                                        | Date de fin de récurrence                                   |
| notes               | TEXT      |                                                        | Notes sur la disponibilité                                  |
| created_at          | TIMESTAMP | NOT NULL, DEFAULT NOW()                                | Date de création                                            |
| updated_at          | TIMESTAMP | NOT NULL, DEFAULT NOW()                                | Date de dernière modification                               |
| CHECK               |           | (day_of_week IS NOT NULL OR specific_date IS NOT NULL) | Contrainte: jour ou date spécifique requis                  |

### 4. Questionnaires et tests

#### Table: questionnaires

| Colonne                | Type         | Contraintes             | Description                                                        |
| ---------------------- | ------------ | ----------------------- | ------------------------------------------------------------------ |
| id                     | UUID         | PK                      | Identifiant unique                                                 |
| title                  | VARCHAR(255) | NOT NULL                | Titre du questionnaire                                             |
| description            | TEXT         |                         | Description du questionnaire                                       |
| instructions           | TEXT         |                         | Instructions pour le questionnaire                                 |
| category               | ENUM         | NOT NULL                | Catégorie: 'skills', 'personality', 'interests', 'values', 'other' |
| estimated_time_minutes | INTEGER      |                         | Temps estimé en minutes                                            |
| is_active              | BOOLEAN      | NOT NULL, DEFAULT true  | Indique si le questionnaire est actif                              |
| is_template            | BOOLEAN      | NOT NULL, DEFAULT false | Indique s'il s'agit d'un modèle                                    |
| created_by             | UUID         | FK (users.id), NOT NULL | Créateur du questionnaire                                          |
| created_at             | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création                                                   |
| updated_at             | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de dernière modification                                      |

#### Table: questionnaire_sections

| Colonne          | Type         | Contraintes                      | Description                           |
| ---------------- | ------------ | -------------------------------- | ------------------------------------- |
| id               | UUID         | PK                               | Identifiant unique                    |
| questionnaire_id | UUID         | FK (questionnaires.id), NOT NULL | Référence au questionnaire            |
| title            | VARCHAR(255) | NOT NULL                         | Titre de la section                   |
| description      | TEXT         |                                  | Description de la section             |
| order_index      | INTEGER      | NOT NULL                         | Ordre dans le questionnaire           |
| is_optional      | BOOLEAN      | NOT NULL, DEFAULT false          | Indique si la section est optionnelle |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()          | Date de création                      |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()          | Date de dernière modification         |

#### Table: questions

| Colonne       | Type      | Contraintes                              | Description                                                         |
| ------------- | --------- | ---------------------------------------- | ------------------------------------------------------------------- |
| id            | UUID      | PK                                       | Identifiant unique                                                  |
| section_id    | UUID      | FK (questionnaire_sections.id), NOT NULL | Référence à la section                                              |
| text          | TEXT      | NOT NULL                                 | Texte de la question                                                |
| question_type | ENUM      | NOT NULL                                 | Type: 'multiple_choice', 'single_choice', 'scale', 'text', 'matrix' |
| order_index   | INTEGER   | NOT NULL                                 | Ordre dans la section                                               |
| is_required   | BOOLEAN   | NOT NULL, DEFAULT true                   | Indique si la question est obligatoire                              |
| help_text     | TEXT      |                                          | Texte d'aide                                                        |
| created_at    | TIMESTAMP | NOT NULL, DEFAULT NOW()                  | Date de création                                                    |
| updated_at    | TIMESTAMP | NOT NULL, DEFAULT NOW()                  | Date de dernière modification                                       |

#### Table: question_options

| Colonne     | Type         | Contraintes                 | Description                   |
| ----------- | ------------ | --------------------------- | ----------------------------- |
| id          | UUID         | PK                          | Identifiant unique            |
| question_id | UUID         | FK (questions.id), NOT NULL | Référence à la question       |
| text        | TEXT         | NOT NULL                    | Texte de l'option             |
| value       | VARCHAR(255) | NOT NULL                    | Valeur de l'option            |
| order_index | INTEGER      | NOT NULL                    | Ordre des options             |
| score       | INTEGER      |                             | Score associé à l'option      |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Date de création              |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Date de dernière modification |

#### Table: scoring_categories

| Colonne          | Type         | Contraintes                      | Description                   |
| ---------------- | ------------ | -------------------------------- | ----------------------------- |
| id               | UUID         | PK                               | Identifiant unique            |
| questionnaire_id | UUID         | FK (questionnaires.id), NOT NULL | Référence au questionnaire    |
| name             | VARCHAR(255) | NOT NULL                         | Nom de la catégorie           |
| description      | TEXT         |                                  | Description de la catégorie   |
| min_score        | INTEGER      | NOT NULL                         | Score minimum                 |
| max_score        | INTEGER      | NOT NULL                         | Score maximum                 |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()          | Date de création              |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()          | Date de dernière modification |

#### Table: scoring_rules

| Colonne     | Type         | Contraintes                          | Description                       |
| ----------- | ------------ | ------------------------------------ | --------------------------------- |
| id          | UUID         | PK                                   | Identifiant unique                |
| question_id | UUID         | FK (questions.id), NOT NULL          | Référence à la question           |
| category_id | UUID         | FK (scoring_categories.id), NOT NULL | Référence à la catégorie de score |
| weight      | DECIMAL(5,2) | NOT NULL, DEFAULT 1.0                | Poids de la question              |
| formula     | TEXT         |                                      | Formule de calcul (si complexe)   |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()              | Date de création                  |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()              | Date de dernière modification     |

#### Table: interpretation_ranges

| Colonne        | Type      | Contraintes                          | Description                   |
| -------------- | --------- | ------------------------------------ | ----------------------------- |
| id             | UUID      | PK                                   | Identifiant unique            |
| category_id    | UUID      | FK (scoring_categories.id), NOT NULL | Référence à la catégorie      |
| min_value      | INTEGER   | NOT NULL                             | Valeur minimum                |
| max_value      | INTEGER   | NOT NULL                             | Valeur maximum                |
| interpretation | TEXT      | NOT NULL                             | Interprétation textuelle      |
| created_at     | TIMESTAMP | NOT NULL, DEFAULT NOW()              | Date de création              |
| updated_at     | TIMESTAMP | NOT NULL, DEFAULT NOW()              | Date de dernière modification |

#### Table: questionnaire_assignments

| Colonne          | Type      | Contraintes                      | Description                                                 |
| ---------------- | --------- | -------------------------------- | ----------------------------------------------------------- |
| id               | UUID      | PK                               | Identifiant unique                                          |
| questionnaire_id | UUID      | FK (questionnaires.id), NOT NULL | Référence au questionnaire                                  |
| assessment_id    | UUID      | FK (assessments.id), NOT NULL    | Référence au bilan                                          |
| assigned_by      | UUID      | FK (users.id), NOT NULL          | Utilisateur ayant assigné                                   |
| assigned_to      | UUID      | FK (users.id), NOT NULL          | Bénéficiaire assigné                                        |
| status           | ENUM      | NOT NULL                         | Statut: 'assigned', 'in_progress', 'completed', 'cancelled' |
| assigned_date    | TIMESTAMP | NOT NULL, DEFAULT NOW()          | Date d'assignation                                          |
| due_date         | TIMESTAMP |                                  | Date limite                                                 |
| completion_date  | TIMESTAMP |                                  | Date de complétion                                          |
| notes            | TEXT      |                                  | Notes sur l'assignation                                     |
| created_at       | TIMESTAMP | NOT NULL, DEFAULT NOW()          | Date de création                                            |
| updated_at       | TIMESTAMP | NOT NULL, DEFAULT NOW()          | Date de dernière modification                               |

#### Table: questionnaire_responses

| Colonne            | Type        | Contraintes                                 | Description                   |
| ------------------ | ----------- | ------------------------------------------- | ----------------------------- |
| id                 | UUID        | PK                                          | Identifiant unique            |
| assignment_id      | UUID        | FK (questionnaire_assignments.id), NOT NULL | Référence à l'assignation     |
| started_at         | TIMESTAMP   | NOT NULL, DEFAULT NOW()                     | Date de début                 |
| completed_at       | TIMESTAMP   |                                             | Date de fin                   |
| time_spent_seconds | INTEGER     |                                             | Temps passé en secondes       |
| ip_address         | VARCHAR(45) |                                             | Adresse IP                    |
| user_agent         | TEXT        |                                             | User-Agent du navigateur      |
| created_at         | TIMESTAMP   | NOT NULL, DEFAULT NOW()                     | Date de création              |
| updated_at         | TIMESTAMP   | NOT NULL, DEFAULT NOW()                     | Date de dernière modification |

#### Table: question_answers

| Colonne          | Type      | Contraintes                               | Description                                  |
| ---------------- | --------- | ----------------------------------------- | -------------------------------------------- |
| id               | UUID      | PK                                        | Identifiant unique                           |
| response_id      | UUID      | FK (questionnaire_responses.id), NOT NULL | Référence à la réponse                       |
| question_id      | UUID      | FK (questions.id), NOT NULL               | Référence à la question                      |
| answer_text      | TEXT      |                                           | Réponse textuelle                            |
| selected_options | UUID[]    |                                           | Options sélectionnées (pour choix multiples) |
| scale_value      | INTEGER   |                                           | Valeur sur échelle                           |
| created_at       | TIMESTAMP | NOT NULL, DEFAULT NOW()                   | Date de création                             |
| updated_at       | TIMESTAMP | NOT NULL, DEFAULT NOW()                   | Date de dernière modification                |

#### Table: response_scores

| Colonne          | Type         | Contraintes                               | Description                   |
| ---------------- | ------------ | ----------------------------------------- | ----------------------------- |
| id               | UUID         | PK                                        | Identifiant unique            |
| response_id      | UUID         | FK (questionnaire_responses.id), NOT NULL | Référence à la réponse        |
| category_id      | UUID         | FK (scoring_categories.id), NOT NULL      | Référence à la catégorie      |
| raw_score        | INTEGER      | NOT NULL                                  | Score brut                    |
| normalized_score | DECIMAL(5,2) |                                           | Score normalisé               |
| percentile       | INTEGER      |                                           | Percentile                    |
| interpretation   | TEXT         |                                           | Interprétation textuelle      |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()                   | Date de création              |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()                   | Date de dernière modification |

### 5. Gestion documentaire

#### Table: document_templates

| Colonne     | Type         | Contraintes             | Description                                                         |
| ----------- | ------------ | ----------------------- | ------------------------------------------------------------------- |
| id          | UUID         | PK                      | Identifiant unique                                                  |
| name        | VARCHAR(255) | NOT NULL                | Nom du modèle                                                       |
| description | TEXT         |                         | Description du modèle                                               |
| category    | ENUM         | NOT NULL                | Catégorie: 'administrative', 'follow_up', 'evaluation', 'synthesis' |
| content     | TEXT         | NOT NULL                | Contenu du modèle (HTML ou base64)                                  |
| format      | ENUM         | NOT NULL                | Format: 'docx', 'pdf', 'html'                                       |
| version     | VARCHAR(50)  | NOT NULL                | Version du modèle                                                   |
| is_active   | BOOLEAN      | NOT NULL, DEFAULT true  | Indique si le modèle est actif                                      |
| created_by  | UUID         | FK (users.id), NOT NULL | Créateur du modèle                                                  |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création                                                    |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de dernière modification                                       |

#### Table: template_variables

| Colonne          | Type         | Contraintes                          | Description                                                |
| ---------------- | ------------ | ------------------------------------ | ---------------------------------------------------------- |
| id               | UUID         | PK                                   | Identifiant unique                                         |
| template_id      | UUID         | FK (document_templates.id), NOT NULL | Référence au modèle                                        |
| name             | VARCHAR(100) | NOT NULL                             | Nom de la variable                                         |
| description      | TEXT         |                                      | Description de la variable                                 |
| variable_type    | ENUM         | NOT NULL                             | Type: 'text', 'date', 'number', 'boolean', 'list', 'table' |
| is_required      | BOOLEAN      | NOT NULL, DEFAULT false              | Indique si la variable est obligatoire                     |
| default_value    | TEXT         |                                      | Valeur par défaut                                          |
| validation_rules | TEXT         |                                      | Règles de validation                                       |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()              | Date de création                                           |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW()              | Date de dernière modification                              |

#### Table: template_sections

| Colonne            | Type         | Contraintes                          | Description                                                                |
| ------------------ | ------------ | ------------------------------------ | -------------------------------------------------------------------------- |
| id                 | UUID         | PK                                   | Identifiant unique                                                         |
| template_id        | UUID         | FK (document_templates.id), NOT NULL | Référence au modèle                                                        |
| title              | VARCHAR(255) | NOT NULL                             | Titre de la section                                                        |
| is_optional        | BOOLEAN      | NOT NULL, DEFAULT false              | Indique si la section est optionnelle                                      |
| condition_variable | VARCHAR(100) |                                      | Variable de condition                                                      |
| condition_operator | ENUM         |                                      | Opérateur: 'equals', 'not_equals', 'greater_than', 'less_than', 'contains' |
| condition_value    | TEXT         |                                      | Valeur de condition                                                        |
| created_at         | TIMESTAMP    | NOT NULL, DEFAULT NOW()              | Date de création                                                           |
| updated_at         | TIMESTAMP    | NOT NULL, DEFAULT NOW()              | Date de dernière modification                                              |

#### Table: documents

| Colonne       | Type         | Contraintes                | Description                                                                  |
| ------------- | ------------ | -------------------------- | ---------------------------------------------------------------------------- |
| id            | UUID         | PK                         | Identifiant unique                                                           |
| assessment_id | UUID         | FK (assessments.id)        | Référence au bilan (NULL si document général)                                |
| template_id   | UUID         | FK (document_templates.id) | Référence au modèle (NULL si document externe)                               |
| name          | VARCHAR(255) | NOT NULL                   | Nom du document                                                              |
| description   | TEXT         |                            | Description du document                                                      |
| category      | ENUM         | NOT NULL                   | Catégorie: 'administrative', 'follow_up', 'evaluation', 'synthesis', 'other' |
| file_path     | VARCHAR(255) | NOT NULL                   | Chemin du fichier                                                            |
| file_size     | INTEGER      |                            | Taille du fichier en octets                                                  |
| file_type     | VARCHAR(100) |                            | Type MIME du fichier                                                         |
| status        | ENUM         | NOT NULL                   | Statut: 'draft', 'final', 'signed', 'archived'                               |
| created_by    | UUID         | FK (users.id), NOT NULL    | Créateur du document                                                         |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()    | Date de création                                                             |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()    | Date de dernière modification                                                |

#### Table: document_variables

| Colonne        | Type         | Contraintes                 | Description                   |
| -------------- | ------------ | --------------------------- | ----------------------------- |
| id             | UUID         | PK                          | Identifiant unique            |
| document_id    | UUID         | FK (documents.id), NOT NULL | Référence au document         |
| variable_name  | VARCHAR(100) | NOT NULL                    | Nom de la variable            |
| variable_value | TEXT         |                             | Valeur de la variable         |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Date de création              |
| updated_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Date de dernière modification |

#### Table: document_signatures

| Colonne          | Type        | Contraintes                 | Description                                            |
| ---------------- | ----------- | --------------------------- | ------------------------------------------------------ |
| id               | UUID        | PK                          | Identifiant unique                                     |
| document_id      | UUID        | FK (documents.id), NOT NULL | Référence au document                                  |
| signer_id        | UUID        | FK (users.id), NOT NULL     | Référence au signataire                                |
| signer_type      | ENUM        | NOT NULL                    | Type: 'beneficiary', 'consultant', 'employer', 'other' |
| signature_status | ENUM        | NOT NULL                    | Statut: 'pending', 'signed', 'rejected', 'expired'     |
| signature_date   | TIMESTAMP   |                             | Date de signature                                      |
| signature_method | ENUM        |                             | Méthode: 'electronic', 'handwritten', 'qualified'      |
| signature_proof  | TEXT        |                             | Preuve de signature                                    |
| signature_ip     | VARCHAR(45) |                             | Adresse IP de signature                                |
| created_at       | TIMESTAMP   | NOT NULL, DEFAULT NOW()     | Date de création                                       |
| updated_at       | TIMESTAMP   | NOT NULL, DEFAULT NOW()     | Date de dernière modification                          |

#### Table: document_shares

| Colonne         | Type         | Contraintes                                             | Description                                        |
| --------------- | ------------ | ------------------------------------------------------- | -------------------------------------------------- |
| id              | UUID         | PK                                                      | Identifiant unique                                 |
| document_id     | UUID         | FK (documents.id), NOT NULL                             | Référence au document                              |
| shared_by       | UUID         | FK (users.id), NOT NULL                                 | Utilisateur partageant                             |
| shared_with     | UUID         | FK (users.id)                                           | Utilisateur destinataire (NULL si lien externe)    |
| external_email  | VARCHAR(255) |                                                         | Email externe (si partagé en externe)              |
| access_token    | VARCHAR(255) |                                                         | Token d'accès pour lien externe                    |
| expiration_date | TIMESTAMP    |                                                         | Date d'expiration                                  |
| permissions     | ENUM         | NOT NULL                                                | Permissions: 'view', 'comment', 'edit'             |
| created_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW()                                 | Date de création                                   |
| updated_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW()                                 | Date de dernière modification                      |
| CHECK           |              | (shared_with IS NOT NULL OR external_email IS NOT NULL) | Contrainte: destinataire interne ou externe requis |

### 6. Communications

#### Table: messages

| Colonne           | Type         | Contraintes             | Description                                  |
| ----------------- | ------------ | ----------------------- | -------------------------------------------- |
| id                | UUID         | PK                      | Identifiant unique                           |
| sender_id         | UUID         | FK (users.id), NOT NULL | Expéditeur                                   |
| assessment_id     | UUID         | FK (assessments.id)     | Référence au bilan (NULL si message général) |
| subject           | VARCHAR(255) |                         | Sujet du message                             |
| content           | TEXT         | NOT NULL                | Contenu du message                           |
| is_system_message | BOOLEAN      | NOT NULL, DEFAULT false | Indique s'il s'agit d'un message système     |
| parent_id         | UUID         | FK (messages.id)        | Message parent (pour les réponses)           |
| created_at        | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création                             |
| updated_at        | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de dernière modification                |

#### Table: message_recipients

| Colonne      | Type      | Contraintes                | Description                   |
| ------------ | --------- | -------------------------- | ----------------------------- |
| id           | UUID      | PK                         | Identifiant unique            |
| message_id   | UUID      | FK (messages.id), NOT NULL | Référence au message          |
| recipient_id | UUID      | FK (users.id), NOT NULL    | Destinataire                  |
| read_status  | BOOLEAN   | NOT NULL, DEFAULT false    | Statut de lecture             |
| read_at      | TIMESTAMP |                            | Date de lecture               |
| created_at   | TIMESTAMP | NOT NULL, DEFAULT NOW()    | Date de création              |
| updated_at   | TIMESTAMP | NOT NULL, DEFAULT NOW()    | Date de dernière modification |

#### Table: message_attachments

| Colonne    | Type         | Contraintes                | Description                 |
| ---------- | ------------ | -------------------------- | --------------------------- |
| id         | UUID         | PK                         | Identifiant unique          |
| message_id | UUID         | FK (messages.id), NOT NULL | Référence au message        |
| file_name  | VARCHAR(255) | NOT NULL                   | Nom du fichier              |
| file_path  | VARCHAR(255) | NOT NULL                   | Chemin du fichier           |
| file_size  | INTEGER      |                            | Taille du fichier en octets |
| file_type  | VARCHAR(100) |                            | Type MIME du fichier        |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()    | Date de création            |

#### Table: notifications

| Colonne     | Type         | Contraintes             | Description                                                        |
| ----------- | ------------ | ----------------------- | ------------------------------------------------------------------ |
| id          | UUID         | PK                      | Identifiant unique                                                 |
| user_id     | UUID         | FK (users.id), NOT NULL | Destinataire                                                       |
| type        | ENUM         | NOT NULL                | Type: 'appointment', 'message', 'document', 'assessment', 'system' |
| title       | VARCHAR(255) | NOT NULL                | Titre de la notification                                           |
| content     | TEXT         | NOT NULL                | Contenu de la notification                                         |
| link        | VARCHAR(255) |                         | Lien associé                                                       |
| read_status | BOOLEAN      | NOT NULL, DEFAULT false | Statut de lecture                                                  |
| read_at     | TIMESTAMP    |                         | Date de lecture                                                    |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création                                                   |

#### Table: notification_templates

| Colonne         | Type         | Contraintes             | Description                    |
| --------------- | ------------ | ----------------------- | ------------------------------ |
| id              | UUID         | PK                      | Identifiant unique             |
| name            | VARCHAR(255) | NOT NULL                | Nom du modèle                  |
| type            | ENUM         | NOT NULL                | Type: 'email', 'sms', 'in_app' |
| event_trigger   | VARCHAR(255) | NOT NULL                | Événement déclencheur          |
| subject         | VARCHAR(255) |                         | Sujet (pour emails)            |
| content         | TEXT         | NOT NULL                | Contenu du modèle              |
| variables       | TEXT[]       |                         | Variables utilisables          |
| is_active       | BOOLEAN      | NOT NULL, DEFAULT true  | Indique si le modèle est actif |
| recipient_roles | TEXT[]       | NOT NULL                | Rôles des destinataires        |
| created_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création               |
| updated_at      | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de dernière modification  |

### 7. Facturation

#### Table: invoices

| Colonne           | Type          | Contraintes             | Description                                             |
| ----------------- | ------------- | ----------------------- | ------------------------------------------------------- |
| id                | UUID          | PK                      | Identifiant unique                                      |
| assessment_id     | UUID          | FK (assessments.id)     | Référence au bilan                                      |
| invoice_number    | VARCHAR(50)   | UNIQUE, NOT NULL        | Numéro de facture                                       |
| invoice_date      | DATE          | NOT NULL                | Date de facture                                         |
| due_date          | DATE          | NOT NULL                | Date d'échéance                                         |
| client_type       | ENUM          | NOT NULL                | Type: 'individual', 'company', 'organization'           |
| client_id         | UUID          | FK (users.id)           | Référence au client (si utilisateur)                    |
| client_name       | VARCHAR(255)  | NOT NULL                | Nom du client                                           |
| client_address    | TEXT          | NOT NULL                | Adresse du client                                       |
| client_email      | VARCHAR(255)  |                         | Email du client                                         |
| client_phone      | VARCHAR(20)   |                         | Téléphone du client                                     |
| client_vat_number | VARCHAR(50)   |                         | Numéro de TVA du client                                 |
| subtotal          | DECIMAL(10,2) | NOT NULL                | Montant HT                                              |
| vat_rate          | DECIMAL(5,2)  | NOT NULL                | Taux de TVA                                             |
| vat_amount        | DECIMAL(10,2) | NOT NULL                | Montant de TVA                                          |
| total             | DECIMAL(10,2) | NOT NULL                | Montant TTC                                             |
| status            | ENUM          | NOT NULL                | Statut: 'draft', 'sent', 'paid', 'cancelled', 'overdue' |
| payment_terms     | TEXT          |                         | Conditions de paiement                                  |
| notes             | TEXT          |                         | Notes                                                   |
| created_by        | UUID          | FK (users.id), NOT NULL | Créateur de la facture                                  |
| created_at        | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Date de création                                        |
| updated_at        | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Date de dernière modification                           |

#### Table: invoice_items

| Colonne     | Type          | Contraintes                | Description                   |
| ----------- | ------------- | -------------------------- | ----------------------------- |
| id          | UUID          | PK                         | Identifiant unique            |
| invoice_id  | UUID          | FK (invoices.id), NOT NULL | Référence à la facture        |
| description | TEXT          | NOT NULL                   | Description de la ligne       |
| quantity    | DECIMAL(10,2) | NOT NULL                   | Quantité                      |
| unit_price  | DECIMAL(10,2) | NOT NULL                   | Prix unitaire HT              |
| vat_rate    | DECIMAL(5,2)  | NOT NULL                   | Taux de TVA                   |
| amount      | DECIMAL(10,2) | NOT NULL                   | Montant HT                    |
| created_at  | TIMESTAMP     | NOT NULL, DEFAULT NOW()    | Date de création              |
| updated_at  | TIMESTAMP     | NOT NULL, DEFAULT NOW()    | Date de dernière modification |

#### Table: payments

| Colonne        | Type          | Contraintes                | Description                                                       |
| -------------- | ------------- | -------------------------- | ----------------------------------------------------------------- |
| id             | UUID          | PK                         | Identifiant unique                                                |
| invoice_id     | UUID          | FK (invoices.id), NOT NULL | Référence à la facture                                            |
| amount         | DECIMAL(10,2) | NOT NULL                   | Montant du paiement                                               |
| payment_date   | DATE          | NOT NULL                   | Date du paiement                                                  |
| payment_method | ENUM          | NOT NULL                   | Méthode: 'bank_transfer', 'credit_card', 'check', 'cash', 'other' |
| reference      | VARCHAR(255)  |                            | Référence du paiement                                             |
| notes          | TEXT          |                            | Notes sur le paiement                                             |
| created_by     | UUID          | FK (users.id), NOT NULL    | Utilisateur ayant enregistré le paiement                          |
| created_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW()    | Date de création                                                  |
| updated_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW()    | Date de dernière modification                                     |

#### Table: funding_organizations

| Colonne       | Type         | Contraintes             | Description                                             |
| ------------- | ------------ | ----------------------- | ------------------------------------------------------- |
| id            | UUID         | PK                      | Identifiant unique                                      |
| name          | VARCHAR(255) | NOT NULL                | Nom de l'organisme                                      |
| type          | ENUM         | NOT NULL                | Type: 'opco', 'pole_emploi', 'cpf', 'employer', 'other' |
| contact_name  | VARCHAR(255) |                         | Nom du contact                                          |
| contact_email | VARCHAR(255) |                         | Email du contact                                        |
| contact_phone | VARCHAR(20)  |                         | Téléphone du contact                                    |
| address       | TEXT         |                         | Adresse                                                 |
| siret         | VARCHAR(20)  |                         | Numéro SIRET                                            |
| vat_number    | VARCHAR(20)  |                         | Numéro de TVA                                           |
| export_format | VARCHAR(50)  |                         | Format d'export spécifique                              |
| notes         | TEXT         |                         | Notes                                                   |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de création                                        |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de dernière modification                           |

#### Table: quotes

| Colonne        | Type          | Contraintes             | Description                                                             |
| -------------- | ------------- | ----------------------- | ----------------------------------------------------------------------- |
| id             | UUID          | PK                      | Identifiant unique                                                      |
| assessment_id  | UUID          | FK (assessments.id)     | Référence au bilan                                                      |
| quote_number   | VARCHAR(50)   | UNIQUE, NOT NULL        | Numéro de devis                                                         |
| quote_date     | DATE          | NOT NULL                | Date du devis                                                           |
| validity_date  | DATE          | NOT NULL                | Date de validité                                                        |
| client_type    | ENUM          | NOT NULL                | Type: 'individual', 'company', 'organization'                           |
| client_id      | UUID          | FK (users.id)           | Référence au client (si utilisateur)                                    |
| client_name    | VARCHAR(255)  | NOT NULL                | Nom du client                                                           |
| client_address | TEXT          | NOT NULL                | Adresse du client                                                       |
| client_email   | VARCHAR(255)  |                         | Email du client                                                         |
| client_phone   | VARCHAR(20)   |                         | Téléphone du client                                                     |
| subtotal       | DECIMAL(10,2) | NOT NULL                | Montant HT                                                              |
| vat_rate       | DECIMAL(5,2)  | NOT NULL                | Taux de TVA                                                             |
| vat_amount     | DECIMAL(10,2) | NOT NULL                | Montant de TVA                                                          |
| total          | DECIMAL(10,2) | NOT NULL                | Montant TTC                                                             |
| status         | ENUM          | NOT NULL                | Statut: 'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted' |
| notes          | TEXT          |                         | Notes                                                                   |
| created_by     | UUID          | FK (users.id), NOT NULL | Créateur du devis                                                       |
| created_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Date de création                                                        |
| updated_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Date de dernière modification                                           |

#### Table: quote_items

| Colonne     | Type          | Contraintes              | Description                   |
| ----------- | ------------- | ------------------------ | ----------------------------- |
| id          | UUID          | PK                       | Identifiant unique            |
| quote_id    | UUID          | FK (quotes.id), NOT NULL | Référence au devis            |
| description | TEXT          | NOT NULL                 | Description de la ligne       |
| quantity    | DECIMAL(10,2) | NOT NULL                 | Quantité                      |
| unit_price  | DECIMAL(10,2) | NOT NULL                 | Prix unitaire HT              |
| vat_rate    | DECIMAL(5,2)  | NOT NULL                 | Taux de TVA                   |
| amount      | DECIMAL(10,2) | NOT NULL                 | Montant HT                    |
| created_at  | TIMESTAMP     | NOT NULL, DEFAULT NOW()  | Date de création              |
| updated_at  | TIMESTAMP     | NOT NULL, DEFAULT NOW()  | Date de dernière modification |

### 8. Journalisation et audit

#### Table: activity_logs

| Colonne     | Type         | Contraintes             | Description                            |
| ----------- | ------------ | ----------------------- | -------------------------------------- |
| id          | UUID         | PK                      | Identifiant unique                     |
| user_id     | UUID         | FK (users.id)           | Utilisateur concerné (NULL si système) |
| action      | VARCHAR(100) | NOT NULL                | Action réalisée                        |
| entity_type | VARCHAR(100) | NOT NULL                | Type d'entité concernée                |
| entity_id   | UUID         | NOT NULL                | ID de l'entité concernée               |
| details     | JSONB        |                         | Détails de l'action                    |
| ip_address  | VARCHAR(45)  |                         | Adresse IP                             |
| user_agent  | TEXT         |                         | User-Agent du navigateur               |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de l'action                       |

#### Table: login_attempts

| Colonne    | Type         | Contraintes             | Description              |
| ---------- | ------------ | ----------------------- | ------------------------ |
| id         | UUID         | PK                      | Identifiant unique       |
| email      | VARCHAR(255) | NOT NULL                | Email utilisé            |
| success    | BOOLEAN      | NOT NULL                | Succès de la tentative   |
| ip_address | VARCHAR(45)  | NOT NULL                | Adresse IP               |
| user_agent | TEXT         |                         | User-Agent du navigateur |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Date de la tentative     |

## Indexation

Pour optimiser les performances, les index suivants seront créés:

1. Index sur les clés étrangères pour accélérer les jointures
2. Index sur les colonnes fréquemment utilisées pour le filtrage et le tri
3. Index composites pour les requêtes complexes fréquentes
4. Index full-text pour les recherches textuelles

Exemples d'index importants:

- `users_email_idx` sur `users(email)`
- `assessments_beneficiary_id_idx` sur `assessments(beneficiary_id)`
- `assessments_consultant_id_idx` sur `assessments(consultant_id)`
- `assessments_status_idx` sur `assessments(status)`
- `appointments_start_datetime_idx` sur `appointments(start_datetime)`
- `documents_assessment_id_category_idx` sur `documents(assessment_id, category)`
- `messages_recipient_read_status_idx` sur `message_recipients(recipient_id, read_status)`
- `invoices_status_due_date_idx` sur `invoices(status, due_date)`

## Contraintes d'intégrité

Outre les contraintes de clé primaire et de clé étrangère, les contraintes suivantes seront implémentées:

1. Contraintes CHECK pour valider les données (ex: dates, montants positifs)
2. Contraintes UNIQUE pour éviter les doublons (ex: email utilisateur, numéro de facture)
3. Contraintes NOT NULL pour les champs obligatoires
4. Contraintes de domaine pour les énumérations

## Triggers et fonctions

Des triggers seront implémentés pour:

1. Mettre à jour automatiquement les champs `updated_at`
2. Calculer et mettre à jour la progression des bilans
3. Journaliser les modifications importantes
4. Générer automatiquement les numéros de facture et de devis
5. Envoyer des notifications lors d'événements spécifiques

## Considérations de performance

1. Partitionnement des tables volumineuses (ex: logs, messages) par date
2. Utilisation de vues matérialisées pour les rapports complexes
3. Mise en cache des requêtes fréquentes
4. Optimisation des requêtes avec EXPLAIN ANALYZE
5. Configuration appropriée de PostgreSQL (mémoire, parallélisme)

## Sécurité des données

1. Chiffrement des données sensibles au repos
2. Utilisation de rôles et privilèges PostgreSQL
3. Audit des accès aux données sensibles
4. Masquage des données pour les environnements non-production
5. Sauvegarde régulière avec tests de restauration

## Évolutivité

La structure de la base de données est conçue pour être évolutive:

1. Utilisation d'UUID pour les identifiants permet la distribution future
2. Champs JSONB pour les données flexibles et évolutives
3. Versionnement des modèles et documents
4. Structure modulaire permettant l'ajout de nouvelles fonctionnalités

## Conclusion

Cette structure de base de données fournit une fondation solide pour la plateforme de gestion des bilans de compétences. Elle répond aux exigences fonctionnelles détaillées tout en garantissant performance, sécurité et évolutivité.

La prochaine étape consistera à définir les API et les flux de données qui interagiront avec cette base de données.
