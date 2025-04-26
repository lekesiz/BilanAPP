# BilanApp

BilanApp, sosyal hizmet kuruluşları için faydalanıcı yönetimi, değerlendirme süreçleri ve hizmet sunumunu kolaylaştırmak üzere tasarlanmış kapsamlı bir sosyal hizmet yönetim platformudur.

## Özellikler

- **Faydalanıcı Yönetimi**: Faydalanıcı bilgilerini, geçmişini ve etkileşimlerini takip etme ve yönetme
- **Değerlendirme Araçları**: Değerlendirme anketleri oluşturma, yönetme ve yanıtları takip etme
- **Belge Yönetimi**: Faydalanıcı belgelerini yükleme, saklama ve düzenleme
- **Randevu Planlama**: Faydalanıcılarla randevuları planlama ve yönetme
- **İletişim**: Faydalanıcılara mesaj ve bildirim gönderme
- **Raporlama**: Hizmet sunumu hakkında rapor ve analizler oluşturma

## Başlangıç

### Ön Koşullar

- Node.js v18.x veya üzeri
- npm v9.x veya üzeri
- SQLite3
- Git

### Kurulum

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

5. Uygulamayı başlatın:
```bash
npm start
```

Uygulama `http://localhost:3000` adresinde erişilebilir olacaktır.

## Dokümantasyon

- [Geliştirme Kılavuzu](docs/tr/development-guide/development-guide.md)
- [Deployment Kılavuzu](docs/tr/deployment-guide/deployment-guide.md)
- [API Dokümantasyonu](docs/tr/api/endpoints.md)

## Proje Yapısı

```
bilan-app/
├── bin/                # Uygulama başlatma scriptleri
├── config/             # Yapılandırma dosyaları
├── controllers/        # Route controller'ları
├── models/             # Veritabanı modelleri
├── public/             # Statik dosyalar
├── routes/             # Route tanımlamaları
├── services/           # İş mantığı
├── utils/              # Yardımcı fonksiyonlar
├── views/              # View şablonları
├── docs/               # Dokümantasyon
│   ├── en/            # İngilizce dokümantasyon
│   └── tr/            # Türkçe dokümantasyon
├── tests/              # Test dosyaları
├── .env.example        # Örnek ortam değişkenleri
├── .gitignore          # Git ignore dosyası
├── package.json        # Proje bağımlılıkları
└── README.md           # Proje dokümantasyonu
```

## Geliştirme

### Kodlama Standartları

- ESLint yapılandırmasını takip edin
- Asenkron işlemler için async/await kullanın
- RESTful API tasarım prensiplerini takip edin
- Yeni özellikler için birim testleri yazın

### Test

Testleri çalıştırmak için:
```bash
npm test
```

### Veritabanı Yönetimi

- Migrations: `npm run db:migrate`
- Seeds: `npm run db:seed`
- Rollback: `npm run db:rollback`

## Deployment

Uygulamanın dağıtımı için detaylı talimatlar için [Deployment Kılavuzu](docs/tr/deployment-guide/deployment-guide.md) bölümüne bakın.

## Katkıda Bulunma

1. Depoyu fork edin
2. Özellik dalınızı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika bir özellik ekle'`)
4. Dalınıza push yapın (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Destek

Destek için support@bilanapp.com adresine e-posta gönderin veya depoda bir issue açın.

## Teşekkürler

- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Handlebars](https://handlebarsjs.com/)
- [Jest](https://jestjs.io/) 