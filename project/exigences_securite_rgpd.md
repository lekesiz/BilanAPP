# Exigences de sécurité et conformité RGPD

# Plateforme de gestion des bilans de compétences

## Introduction

Ce document définit les exigences de sécurité et de conformité au Règlement Général sur la Protection des Données (RGPD) pour la plateforme de gestion des bilans de compétences. La nature sensible des données traitées (informations personnelles, professionnelles et psychologiques) nécessite une approche rigoureuse en matière de sécurité et de protection des données.

## 1. Cadre réglementaire

### 1.1 Réglementations applicables

La plateforme doit être conforme aux réglementations suivantes :

- **Règlement Général sur la Protection des Données (RGPD)** - Règlement UE 2016/679
- **Loi Informatique et Libertés** modifiée (Loi n° 78-17 du 6 janvier 1978)
- **Code du travail français**, notamment les articles relatifs aux bilans de compétences (L6313-1, L6313-4 et R6313-4 à R6313-8)
- **Directive NIS2** sur la cybersécurité (pour les opérateurs de services essentiels)
- **Règlement eIDAS** pour les signatures électroniques (Règlement UE 910/2014)

### 1.2 Principes fondamentaux du RGPD à respecter

1. **Licéité, loyauté et transparence** : Traitement des données de manière licite, loyale et transparente
2. **Limitation des finalités** : Collecte pour des finalités déterminées, explicites et légitimes
3. **Minimisation des données** : Données adéquates, pertinentes et limitées à ce qui est nécessaire
4. **Exactitude** : Données exactes et tenues à jour
5. **Limitation de la conservation** : Conservation pendant une durée n'excédant pas celle nécessaire
6. **Intégrité et confidentialité** : Traitement garantissant une sécurité appropriée
7. **Responsabilité** : Capacité à démontrer la conformité aux principes précédents

## 2. Gouvernance des données

### 2.1 Rôles et responsabilités

#### Délégué à la Protection des Données (DPO)

- Nomination obligatoire d'un DPO (interne ou externe)
- Missions du DPO :
  - Informer et conseiller sur les obligations RGPD
  - Contrôler le respect du RGPD
  - Coopérer avec l'autorité de contrôle (CNIL)
  - Point de contact pour les personnes concernées
  - Tenir le registre des traitements

#### Responsable de traitement

- Identification claire du responsable de traitement (l'organisme prestataire de bilans)
- Responsabilités :
  - Déterminer les finalités et les moyens du traitement
  - Mettre en œuvre des mesures techniques et organisationnelles appropriées
  - Garantir et démontrer la conformité au RGPD

#### Sous-traitants

- Identification des sous-traitants (hébergeur, services tiers, etc.)
- Contrats de sous-traitance conformes à l'article 28 du RGPD :
  - Traitement uniquement sur instruction documentée
  - Confidentialité des personnes autorisées
  - Mesures de sécurité appropriées
  - Assistance au responsable de traitement
  - Suppression ou restitution des données
  - Audits et inspections

### 2.2 Documentation de conformité

#### Registre des traitements

La plateforme doit permettre de générer et maintenir un registre des traitements contenant :

- Finalités du traitement
- Catégories de données et de personnes concernées
- Destinataires des données
- Transferts hors UE éventuels
- Délais de conservation
- Description des mesures de sécurité

#### Analyses d'impact (AIPD)

Une Analyse d'Impact relative à la Protection des Données doit être réalisée car :

- Traitement à grande échelle de données sensibles (profil psychologique)
- Évaluation systématique d'aspects personnels
- Suivi régulier et systématique des personnes

L'AIPD doit contenir :

- Description du traitement et finalités
- Nécessité et proportionnalité du traitement
- Risques pour les droits et libertés
- Mesures pour faire face aux risques

#### Politique de protection des données

Document public expliquant :

- Identité et coordonnées du responsable de traitement et du DPO
- Finalités du traitement et base légale
- Destinataires des données
- Durée de conservation
- Droits des personnes concernées
- Procédure de gestion des violations
- Transferts hors UE éventuels

### 2.3 Bases légales des traitements

Les traitements doivent reposer sur une base légale claire :

- **Consentement** : Pour les tests psychométriques et questionnaires d'évaluation
- **Exécution d'un contrat** : Pour la réalisation du bilan de compétences
- **Obligation légale** : Pour la conservation des documents légaux
- **Intérêt légitime** : Pour certaines analyses statistiques anonymisées

## 3. Cycle de vie des données

### 3.1 Collecte des données

#### Limitation de la collecte

- Collecte uniquement des données nécessaires à la réalisation du bilan
- Justification documentée pour chaque catégorie de données
- Interdiction de collecter des données "au cas où"

#### Information des personnes

- Notice d'information claire et accessible avant la collecte
- Information sur tous les éléments requis par les articles 13 et 14 du RGPD
- Langage simple et compréhensible
- Consentement explicite pour les données sensibles

#### Formulaires de collecte

- Distinction claire entre champs obligatoires et facultatifs
- Pas de cases pré-cochées pour le consentement
- Liens vers la politique de confidentialité
- Mécanisme de retrait du consentement aussi simple que son recueil

### 3.2 Traitement des données

#### Minimisation du traitement

- Accès aux données limité selon le principe du "besoin d'en connaître"
- Pseudonymisation des données quand possible
- Agrégation des données pour les rapports statistiques

#### Exactitude des données

- Mécanismes de validation des données à la saisie
- Processus de mise à jour régulière
- Possibilité pour les utilisateurs de corriger leurs données

#### Traitement des données sensibles

- Identification claire des données sensibles (opinions politiques, santé, orientation sexuelle, etc.)
- Garanties supplémentaires pour ces données (chiffrement renforcé, accès restreint)
- Consentement explicite documenté et horodaté

### 3.3 Conservation et archivage

#### Politique de conservation

| Type de données          | Durée de conservation active | Archivage intermédiaire        | Justification                     |
| ------------------------ | ---------------------------- | ------------------------------ | --------------------------------- |
| Données d'identification | Durée du bilan + 1 an        | 5 ans après la fin du bilan    | Suivi et obligations légales      |
| Documents administratifs | Durée du bilan + 1 an        | 5 ans (obligations comptables) | Obligations légales               |
| Résultats des tests      | Durée du bilan + 1 an        | 2 ans (anonymisés)             | Finalité du bilan                 |
| Document de synthèse     | Durée du bilan + 1 an        | 5 ans après la fin du bilan    | Obligations légales               |
| Données de connexion     | 1 an maximum                 | Aucun                          | Sécurité et détection des fraudes |

#### Mécanismes d'archivage et de purge

- Archivage automatique après la période de conservation active
- Accès restreint aux archives
- Purge automatique après la période d'archivage
- Journalisation des opérations d'archivage et de purge
- Possibilité d'extraction des données avant purge (droit à la portabilité)

### 3.4 Partage et transfert de données

#### Destinataires internes

- Matrice des droits d'accès par rôle
- Journalisation des accès aux données sensibles
- Formation obligatoire à la protection des données

#### Destinataires externes

- Liste exhaustive des destinataires externes (OPCO, employeurs, etc.)
- Limitation des données partagées au strict nécessaire
- Sécurisation des canaux de transmission

#### Transferts hors UE

- Identification des transferts potentiels hors UE (services cloud, sous-traitants)
- Mise en place de garanties appropriées :
  - Décision d'adéquation
  - Clauses contractuelles types
  - Règles d'entreprise contraignantes
  - Consentement explicite dans des cas spécifiques

## 4. Droits des personnes concernées

### 4.1 Mise en œuvre des droits

La plateforme doit permettre l'exercice effectif des droits suivants :

#### Droit d'information

- Politique de confidentialité accessible depuis toutes les pages
- Information claire sur les traitements lors de la collecte
- Mise à jour des informations en cas de modification des traitements

#### Droit d'accès

- Interface permettant aux bénéficiaires de visualiser toutes leurs données
- Possibilité de demander une copie complète des données
- Délai de réponse : 1 mois maximum (extensible à 3 mois si complexité)

#### Droit de rectification

- Interface permettant aux bénéficiaires de corriger leurs données
- Propagation des corrections à tous les destinataires des données
- Notification de la rectification

#### Droit à l'effacement

- Procédure claire pour demander l'effacement
- Effacement effectif dans tous les systèmes (production, sauvegarde, archives)
- Exceptions documentées (obligations légales, intérêt public)

#### Droit à la limitation du traitement

- Mécanisme technique pour "geler" le traitement des données
- Marquage visible des données dont le traitement est limité
- Information des utilisateurs concernés par la limitation

#### Droit à la portabilité

- Export des données dans un format structuré, couramment utilisé et lisible par machine
- Formats supportés : JSON, CSV, XML
- Transfert direct à un autre responsable de traitement lorsque techniquement possible

#### Droit d'opposition

- Mécanisme simple pour s'opposer aux traitements non basés sur le consentement
- Arrêt immédiat du traitement sauf motif légitime impérieux
- Information claire sur les conséquences de l'opposition

### 4.2 Procédures de gestion des demandes

- Formulaire dédié pour l'exercice des droits
- Vérification de l'identité du demandeur
- Traçabilité des demandes et des réponses
- Délais de traitement conformes au RGPD
- Réponses documentées et archivées

## 5. Mesures de sécurité techniques

### 5.1 Sécurité des accès

#### Authentification

- Authentification forte multi-facteurs (MFA) obligatoire pour tous les administrateurs et consultants
- MFA optionnelle mais recommandée pour les bénéficiaires
- Politique de mots de passe robuste :
  - Longueur minimale : 12 caractères
  - Complexité : majuscules, minuscules, chiffres, caractères spéciaux
  - Vérification contre les listes de mots de passe compromis
  - Pas de réutilisation des 10 derniers mots de passe
  - Changement obligatoire en cas de suspicion de compromission

#### Gestion des sessions

- Durée maximale de session : 2 heures pour les consultants, 30 minutes pour les administrateurs
- Déconnexion automatique après inactivité (15 minutes)
- Invalidation des sessions en cas de changement de mot de passe
- Limitation à une session active simultanée par utilisateur (optionnel)

#### Contrôle d'accès

- Principe du moindre privilège
- Séparation des rôles et responsabilités
- Revue périodique des droits d'accès (trimestrielle)
- Procédure formelle d'attribution et de révocation des accès
- Journalisation des modifications de droits

### 5.2 Chiffrement des données

#### Données en transit

- TLS 1.3 minimum pour toutes les communications
- Certificats valides et renouvelés automatiquement
- Configuration sécurisée (suites cryptographiques modernes)
- HSTS activé avec preloading
- Vérification régulière via outils externes (SSL Labs)

#### Données au repos

- Chiffrement de la base de données (transparent ou au niveau des colonnes)
- Chiffrement des sauvegardes
- Chiffrement du stockage de fichiers
- Algorithmes recommandés : AES-256, RSA-2048 ou supérieur
- Gestion sécurisée des clés de chiffrement (rotation, stockage sécurisé)

#### Données sensibles

- Chiffrement supplémentaire pour les données sensibles (résultats de tests psychologiques)
- Hachage des mots de passe avec algorithme moderne (Argon2, bcrypt)
- Pseudonymisation des données pour les environnements de test

### 5.3 Sécurité de l'infrastructure

#### Architecture sécurisée

- Segmentation réseau (zones de sécurité)
- Pare-feu applicatif (WAF)
- Protection DDoS
- Environnements de développement, test et production strictement séparés
- Principe de défense en profondeur

#### Durcissement des systèmes

- Systèmes d'exploitation et logiciels maintenus à jour
- Suppression des services, comptes et ports inutiles
- Configuration selon les bonnes pratiques de sécurité
- Utilisation de comptes à privilèges limités pour les services
- Antivirus/antimalware sur tous les serveurs

#### Surveillance et détection

- Système de détection d'intrusion (IDS/IPS)
- Surveillance des journaux en temps réel
- Alertes sur comportements suspects
- Surveillance des performances et disponibilité
- Analyse régulière des vulnérabilités

### 5.4 Sécurité des applications

#### Développement sécurisé

- Méthodologie de développement sécurisé (SSDLC)
- Formation des développeurs à la sécurité
- Tests de sécurité automatisés dans la CI/CD
- Analyse statique et dynamique du code
- Revue de code par pairs avec focus sécurité

#### Protection contre les vulnérabilités courantes

- Protection contre les injections (SQL, NoSQL, OS command)
- Protection contre le XSS (Cross-Site Scripting)
- Protection contre le CSRF (Cross-Site Request Forgery)
- Gestion sécurisée des sessions
- Validation des entrées côté serveur
- En-têtes de sécurité HTTP appropriés
- Protection contre les attaques de type clickjacking

#### Gestion des dépendances

- Inventaire des bibliothèques et frameworks utilisés
- Vérification automatique des vulnérabilités connues
- Mise à jour régulière des dépendances
- Politique de fin de support

## 6. Mesures de sécurité organisationnelles

### 6.1 Politiques et procédures

#### Documentation de sécurité

- Politique générale de sécurité des systèmes d'information
- Procédures opérationnelles de sécurité
- Plan de continuité d'activité
- Plan de reprise d'activité
- Procédure de gestion des incidents

#### Sensibilisation et formation

- Formation initiale obligatoire pour tous les utilisateurs
- Formations spécifiques pour les rôles sensibles
- Rappels réguliers et mises à jour
- Tests de phishing simulés
- Évaluation des connaissances

#### Gestion des ressources humaines

- Vérification des antécédents pour les postes sensibles
- Accords de confidentialité
- Clauses contractuelles sur la protection des données
- Procédure de départ (révocation des accès)
- Sensibilisation aux responsabilités post-emploi

### 6.2 Gestion des incidents

#### Détection des violations de données

- Définition claire de ce qui constitue une violation
- Mécanismes techniques de détection
- Canaux de signalement (interne et externe)
- Astreinte sécurité 24/7

#### Procédure de réponse aux incidents

- Équipe de réponse aux incidents désignée
- Procédure documentée et testée
- Modèles de communication préparés
- Coordination avec le DPO
- Analyse post-incident et retour d'expérience

#### Notification des violations

- Évaluation du risque pour les personnes concernées
- Notification à la CNIL dans les 72 heures si risque
- Notification aux personnes concernées si risque élevé
- Documentation de toutes les violations (même mineures)
- Registre des violations

### 6.3 Continuité d'activité

#### Sauvegardes

- Politique de sauvegarde formalisée
- Sauvegardes régulières (quotidiennes minimum)
- Sauvegardes chiffrées
- Tests de restauration périodiques
- Conservation hors site

#### Plan de reprise d'activité

- Analyse d'impact sur l'activité (BIA)
- Définition des RTO (Recovery Time Objective) et RPO (Recovery Point Objective)
- Procédures de reprise documentées
- Infrastructure de secours
- Tests réguliers du PRA

#### Gestion des changements

- Procédure formelle de gestion des changements
- Évaluation de l'impact sur la sécurité et la protection des données
- Tests avant déploiement en production
- Possibilité de rollback
- Communication aux utilisateurs

## 7. Contrôles et audits

### 7.1 Journalisation et traçabilité

#### Événements à journaliser

- Connexions et déconnexions (réussies et échouées)
- Actions administratives
- Accès aux données sensibles
- Modifications de données importantes
- Exportations de données
- Changements de configuration
- Alertes de sécurité

#### Caractéristiques des journaux

- Horodatage précis et synchronisé
- Identification de l'utilisateur
- Description de l'action
- Adresse IP source
- Conservation pendant 1 an minimum
- Protection contre la modification
- Centralisation des logs

### 7.2 Surveillance continue

#### Indicateurs de sécurité

- Taux de tentatives d'authentification échouées
- Nombre d'incidents de sécurité
- Délai de correction des vulnérabilités
- Taux de conformité aux politiques
- Couverture des mises à jour de sécurité

#### Revues périodiques

- Revue trimestrielle des droits d'accès
- Revue semestrielle des politiques de sécurité
- Analyse annuelle des risques
- Tests d'intrusion annuels
- Scan de vulnérabilités mensuel

### 7.3 Audits

#### Audits internes

- Programme d'audit interne
- Méthodologie basée sur les risques
- Indépendance des auditeurs
- Suivi des recommandations
- Reporting à la direction

#### Audits externes

- Audit de certification annuel
- Tests d'intrusion par un tiers
- Audit RGPD tous les 2 ans
- Évaluation de la conformité aux normes (ISO 27001, etc.)
- Transparence des résultats

## 8. Gestion des sous-traitants

### 8.1 Sélection des sous-traitants

#### Critères de sélection

- Garanties en matière de protection des données
- Certifications de sécurité (ISO 27001, etc.)
- Localisation des données (préférence UE)
- Transparence sur la chaîne de sous-traitance
- Capacité à répondre aux demandes des personnes concernées

#### Due diligence

- Questionnaire de sécurité et RGPD
- Vérification des certifications
- Analyse des politiques de confidentialité
- Évaluation des mesures techniques et organisationnelles
- Références clients

### 8.2 Contractualisation

#### Clauses contractuelles

- Objet et durée du traitement
- Nature et finalité du traitement
- Type de données et catégories de personnes concernées
- Obligations et droits du responsable de traitement
- Instructions documentées
- Confidentialité des personnes autorisées
- Mesures de sécurité
- Sous-traitance ultérieure
- Assistance au responsable de traitement
- Sort des données en fin de contrat
- Audits et inspections

#### Engagements de niveau de service (SLA)

- Disponibilité du service
- Temps de réponse aux incidents
- Délai de notification des violations
- Délai de réponse aux demandes d'exercice des droits
- Pénalités en cas de non-respect

### 8.3 Contrôle des sous-traitants

#### Suivi régulier

- Revue annuelle des performances
- Vérification du respect des engagements
- Audit sur site ou à distance
- Demande de preuves de conformité
- Gestion des incidents

#### Fin de contrat

- Procédure de récupération des données
- Vérification de la suppression des données
- Période de transition
- Continuité de service
- Retour d'expérience

## 9. Mesures spécifiques aux bilans de compétences

### 9.1 Confidentialité renforcée

#### Séparation des données

- Séparation stricte des dossiers entre bénéficiaires
- Cloisonnement entre consultants
- Accès restreint aux résultats des tests psychométriques
- Anonymisation pour les statistiques globales

#### Protection du document de synthèse

- Chiffrement spécifique du document de synthèse
- Contrôle d'accès renforcé
- Traçabilité des consultations
- Options de partage contrôlées par le bénéficiaire

### 9.2 Consentement spécifique

#### Tests psychométriques

- Information détaillée sur la nature et l'utilisation des tests
- Consentement explicite avant chaque test
- Possibilité de refuser certains tests
- Droit de retrait des résultats

#### Partage avec l'employeur

- Consentement explicite pour tout partage avec l'employeur
- Granularité du consentement (quelles informations précisément)
- Traçabilité du consentement
- Révocation possible du consentement

### 9.3 Droit à l'oubli adapté

- Possibilité d'anonymisation des données tout en conservant les obligations légales
- Suppression des données brutes des tests
- Conservation limitée du document de synthèse (obligation légale)
- Information claire sur ce qui peut être effacé et ce qui doit être conservé

## 10. Plan de mise en conformité

### 10.1 Évaluation initiale

- Cartographie des traitements
- Analyse d'écart RGPD
- Évaluation des risques de sécurité
- Priorisation des actions

### 10.2 Actions prioritaires

| Action                             | Priorité | Échéance               | Responsable      |
| ---------------------------------- | -------- | ---------------------- | ---------------- |
| Nomination d'un DPO                | Haute    | Avant lancement        | Direction        |
| Registre des traitements           | Haute    | Avant lancement        | DPO              |
| Politique de confidentialité       | Haute    | Avant lancement        | DPO + Juridique  |
| Mécanismes de consentement         | Haute    | Avant lancement        | Équipe technique |
| Chiffrement des données sensibles  | Haute    | Avant lancement        | Équipe technique |
| Procédure de gestion des incidents | Haute    | Avant lancement        | RSSI + DPO       |
| Formation des utilisateurs         | Moyenne  | 1 mois après lancement | RH + DPO         |
| Audits de sécurité                 | Moyenne  | 3 mois après lancement | RSSI             |
| Revue des sous-traitants           | Moyenne  | 3 mois après lancement | Achats + DPO     |

### 10.3 Suivi et amélioration continue

- Indicateurs de conformité RGPD
- Revue trimestrielle du plan d'action
- Veille réglementaire
- Mise à jour annuelle de l'analyse de risques
- Exercices de gestion de crise

## 11. Documentation à produire

### 11.1 Documentation technique

- Architecture technique sécurisée
- Schéma de chiffrement des données
- Procédures de sauvegarde et restauration
- Plan de reprise d'activité
- Procédures d'exploitation sécurisées

### 11.2 Documentation juridique

- Politique de confidentialité
- Conditions générales d'utilisation
- Mentions légales
- Clauses contractuelles pour les sous-traitants
- Procédure d'exercice des droits

### 11.3 Documentation organisationnelle

- Registre des traitements
- Analyses d'impact (AIPD)
- Procédures de gestion des incidents
- Registre des violations de données
- Preuves de consentement

## Conclusion

La mise en œuvre de ces exigences de sécurité et de conformité RGPD est essentielle pour garantir la protection des données personnelles traitées dans le cadre des bilans de compétences. Ces mesures permettront non seulement de respecter les obligations légales, mais aussi de renforcer la confiance des utilisateurs dans la plateforme.

La sécurité et la protection des données doivent être intégrées dès la conception (privacy by design) et par défaut (privacy by default) dans tous les aspects de la plateforme. Une approche basée sur les risques permettra d'adapter les mesures de protection à la sensibilité des données traitées.

Enfin, la conformité n'est pas un état mais un processus continu qui nécessite une vigilance constante, des mises à jour régulières et une culture de la protection des données partagée par tous les acteurs impliqués.
