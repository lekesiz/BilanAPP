# BilanApp Geliştirme Kılavuzu

Bu kılavuz, BilanApp projesinde çalışan geliştiriciler için kapsamlı bilgiler sağlar.

## İçindekiler
1. [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
2. [Proje Yapısı](#proje-yapısı)
3. [Kodlama Standartları](#kodlama-standartları)
4. [API Dokümantasyonu](#api-dokümantasyonu)
5. [Veritabanı Yönetimi](#veritabanı-yönetimi)
6. [Test](#test)
7. [Deployment](#deployment)
8. [Sorun Giderme](#sorun-giderme)
9. [Katkıda Bulunma](#katkıda-bulunma)

## Geliştirme Ortamı Kurulumu

### Ön Koşullar
- Node.js (v18.x veya üzeri)
- npm (v9.x veya üzeri)
- SQLite3
- Git

### Kurulum Adımları
1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/your-org/bilan-app.git
   cd bilan-app
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Ortam değişkenlerini yapılandırın:
   ```bash
   cp .env.example .env
   # .env dosyasını kendi yapılandırmanızla düzenleyin
   ```

4. Veritabanını başlatın:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## Proje Yapısı

```
bilan-app/
├── bin/                # Uygulama giriş noktası
├── config/            # Yapılandırma dosyaları
├── controllers/       # Rota kontrolcüleri
├── models/           # Veritabanı modelleri
├── public/           # Statik dosyalar
├── routes/           # Rota tanımları
├── services/         # İş mantığı
├── views/            # Görünüm şablonları
├── tests/            # Test dosyaları
└── docs/             # Dokümantasyon
```

## Kodlama Standartları

### JavaScript/Node.js
- ES6+ özelliklerini kullanın
- async/await desenini takip edin
- Uygun hata yönetimi uygulayın
- Düzgün loglama yapın
- RESTful API prensiplerini takip edin

### Veritabanı
- Şema değişiklikleri için migration'ları kullanın
- Uygun indeksleme yapın
- İsimlendirme kurallarına uyun
- Gerektiğinde transaction'ları kullanın

## API Dokümantasyonu

Detaylı API dokümantasyonu için bakınız:
- [API Genel Bakış](api/api.md)
- [Kimlik Doğrulama](api/authentication.md)
- [Endpoint'ler](api/endpoints.md)

## Veritabanı Yönetimi

### Migration'lar
```bash
# Yeni bir migration oluştur
npm run db:migration:create --name=create_users_table

# Migration'ları çalıştır
npm run db:migrate

# Migration'ları geri al
npm run db:migrate:undo
```

### Seed'ler
```bash
# Yeni bir seed oluştur
npm run db:seed:create --name=seed_users

# Seed'leri çalıştır
npm run db:seed

# Belirli bir seed'i çalıştır
npm run db:seed --seed=seed_users
```

## Test

### Birim Testleri
```bash
# Tüm testleri çalıştır
npm test

# Belirli bir testi çalıştır
npm test -- tests/controllers/user.test.js
```

### Test Kapsamı
```bash
# Kapsam raporu oluştur
npm run test:coverage
```

## Deployment

### Production Kurulumu
1. Ortam değişkenlerini ayarlayın
2. Uygulamayı derleyin
3. Veritabanı migration'larını çalıştırın
4. Sunucuyu başlatın

### Deployment Komutları
```bash
# Uygulamayı derle
npm run build

# Production sunucusunu başlat
npm start
```

## Sorun Giderme

### Yaygın Sorunlar
1. Veritabanı bağlantı sorunları
2. Kimlik doğrulama sorunları
3. API endpoint hataları
4. Performans sorunları

### Hata Ayıklama
- Düzgün loglama kullanın
- Hata mesajlarını kontrol edin
- Sistem kaynaklarını izleyin
- Uygulama loglarını inceleyin

## Katkıda Bulunma

### Pull Request Süreci
1. Depoyu fork edin
2. Özellik dalınızı oluşturun
3. Değişikliklerinizi commit edin
4. Dalı push edin
5. Pull Request oluşturun

### Kod İnceleme
- Kodlama standartlarına uyun
- Testleri ekleyin
- Dokümantasyonu güncelleyin
- Açık commit mesajları sağlayın

## Kaynaklar

### Dokümantasyon
- [Node.js Dokümantasyonu](https://nodejs.org/en/docs/)
- [Express.js Dokümantasyonu](https://expressjs.com/)
- [Sequelize Dokümantasyonu](https://sequelize.org/)
- [Handlebars Dokümantasyonu](https://handlebarsjs.com/)
- [Jest Dokümantasyonu](https://jestjs.io/) 