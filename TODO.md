# Bilan-App: Tâches Prioritaires

## Priorité Immédiate (Pour la prochaine version)

### Corrections Critiques

- [ ] Résoudre le problème SQLite3 pour assurer la compatibilité avec toutes les architectures
- [ ] Corriger les vulnérabilités de sécurité identifiées par npm audit
- [ ] Standardiser la gestion des erreurs dans les contrôleurs
- [ ] Ajouter des validations dans tous les formulaires

### Améliorations Techniques

- [ ] Implémenter le pattern MVC complet pour tous les modules
- [ ] Déplacer la logique métier des routes vers les contrôleurs
- [ ] Optimiser les requêtes Sequelize pour améliorer les performances
- [ ] Standardiser les réponses d'API (format, codes d'état)

### Interface Utilisateur

- [ ] Rendre toutes les pages responsives pour mobile et tablette
- [ ] Améliorer les messages d'erreur et de confirmation
- [ ] Ajouter des indicateurs de chargement pour les actions longues
- [ ] Standardiser les styles de tous les formulaires

## Court Terme (1-2 mois)

### Fonctionnalités

- [ ] Améliorer l'intégration IA pour l'analyse des compétences
- [ ] Implémenter l'intégration avec Google Calendar pour les rendez-vous
- [ ] Ajouter des fonctionnalités de reporting pour les consultants
- [ ] Développer un système de notifications amélioré

### Qualité et Tests

- [ ] Ajouter des tests unitaires pour les services critiques
- [ ] Configurer ESLint et Prettier pour standardiser le code
- [ ] Implémenter des tests d'intégration pour les flux principaux
- [ ] Ajouter des hooks pre-commit pour vérifier la qualité du code

### Documentation

- [ ] Créer une documentation API avec Swagger/OpenAPI
- [ ] Développer des guides utilisateur pour chaque rôle
- [ ] Ajouter des commentaires JSDoc aux fonctions principales
- [ ] Mettre à jour la documentation d'installation

## Moyen Terme (3-6 mois)

### Infrastructure

- [ ] Configurer un pipeline CI/CD complet
- [ ] Mettre en place des environnements de développement, test et production
- [ ] Implémenter un système de monitoring des performances
- [ ] Configurer des sauvegardes automatiques de la base de données

### Fonctionnalités Avancées

- [ ] Intégrer Pennylane pour la facturation
- [ ] Développer un tableau de bord analytique complet
- [ ] Implémenter l'intégration complète avec Google Workspace
- [ ] Ajouter des fonctionnalités d'export de données

### Expérience Utilisateur

- [ ] Améliorer l'accessibilité (WCAG AA minimum)
- [ ] Créer des tutoriels interactifs pour les nouveaux utilisateurs
- [ ] Optimiser les parcours utilisateur principaux
- [ ] Implémenter des thèmes clairs/sombres

## Notes

- Réviser cette liste chaque semaine lors des réunions d'équipe
- Marquer les tâches terminées et ajouter de nouvelles tâches selon l'évolution du projet
- Prioritiser les tâches qui apportent le plus de valeur aux utilisateurs

## Yapılacaklar

### ESLint Hataları ve Uyarıları (Otomatik Düzeltme Sonrası Kalanlar - 264 Problem)

ESLint, kod kalitesini ve tutarlılığını artırmak için önemli sorunları işaret ediyor. Bunların Geliştirme etabında veya ayrı bir refactoring sürecinde ele alınması önerilir. Başlıca kategoriler:

- **`consistent-return`**: Fonksiyonlardaki return yolu tutarsızlıkları.
- **`no-unused-vars`**: Kullanılmayan değişkenler ve importlar (Uyarı seviyesinde).
- **`max-len`**: 100 karakter sınırını aşan satırlar.
- **`eqeqeq`**: `==`/`!=` yerine `===`/`!==` kullanımı.
- **`no-use-before-define`**: Tanımlanmadan önce kullanım.
- **`camelcase`**: camelCase olmayan değişken isimleri (örn. `date_start`).
- **`no-await-in-loop`**: Döngü içinde `await` kullanımı.
- **`radix`**: `parseInt` içinde radix parametresi eksikliği.
- **`no-plusplus`**: `++`/`--` operatörlerinin kullanımı.
- **`no-restricted-globals`**: `isNaN`, `confirm` gibi global değişkenlerin/fonksiyonların kısıtlı kullanımı.
- **`no-undef`**: Tanımlanmamış değişkenler (`questionnaireController` içinde `sequelize`?)
- **Diğerleri**: `no-shadow`, `no-nested-ternary`, `prefer-promise-reject-errors`, `no-case-declarations`, `no-lonely-if`, `default-case` vb.

**Not:** `careerExplorerController.js` ve ilgili route dosyaları lint işleminden hariç tutuldu.

### Test Sırasında Tespit Edilen Yeni Sorunlar (Terminal Logları)

- **Handlebars `parseJSON` Hatası:** `/questionnaires/:id` sayfasında `options.fn is not a function` hatası. `views/questionnaires/details.hbs` ve `config/handlebars-helpers.js` kontrol edilmeli.
- **Handlebars `isForfaitOrHigher` Uyarısı:** `/questionnaires` sayfasında `userForfait parameter is null or undefined` uyarısı. View'a gönderilen user objesi kontrol edilmeli.
- **CSRF Hatası (Forfait Güncelleme):** `/admin/users/:id/update-forfait` POST isteği `EBADCSRFTOKEN` hatası alıyor. `views/admin/users.hbs` içindeki modal formu kontrol edilmeli.
- **Resim Yolu Hatası:** `GET /images/logo.png` 404 hatası veriyor. Layout/header partial'ındaki logo yolu düzeltilmeli.
- **`/settings` Yolu Hatası:** `GET /settings` 404 hatası veriyor. Uygulama içindeki hatalı link bulunup `/profile/settings` olarak düzeltilmeli.
- **Node.js Deprecation Uyarısı:** `util.isArray` kullanımı. Kaynağı bulunup `Array.isArray` kullanacak şekilde güncellenmeli (Muhtemelen bir bağımlılık içinde).
