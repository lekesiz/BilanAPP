# BilanApp Geliştirme Kılavuzu

Bu kılavuz, BilanApp uygulamasının geliştirilmesi ve bakımı için gerekli bilgileri içermektedir.

## Table of Contents
1. [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
2. [Proje Yapısı](#proje-yapısı)
3. [Kodlama Standartları](#kodlama-standartları)
4. [API Documentation](#api-documentation)
5. [Database Management](#database-management)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Geliştirme Ortamı Kurulumu

### Gereksinimler
- Node.js v14 veya üzeri
- npm v6 veya üzeri
- Git
- SQLite
- Bir metin editörü (VS Code önerilir)

### Kurulum Adımları
1. Projeyi klonlayın:
```bash
git clone https://github.com/your-org/bilan-app.git
cd bilan-app
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Ortam değişkenlerini ayarlayın:
```bash
cp .env.example .env
```

4. Veritabanını oluşturun:
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

5. Uygulamayı başlatın:
```bash
npm run dev
```

## Proje Yapısı

```
bilan-app/
├── bin/                # Uygulama başlatma betikleri
├── config/             # Yapılandırma dosyaları
├── controllers/        # İstek işleyicileri
├── models/             # Veritabanı modelleri
├── public/             # Statik dosyalar
├── routes/             # Rota tanımlamaları
├── services/           # İş mantığı servisleri
├── utils/              # Yardımcı fonksiyonlar
├── views/              # Şablon dosyaları
├── .env.example        # Örnek ortam değişkenleri
├── .eslintrc.js        # ESLint yapılandırması
├── .gitignore          # Git yoksayma dosyası
├── app.js              # Ana uygulama dosyası
├── package.json        # Proje bağımlılıkları
└── README.md           # Proje dokümantasyonu
```

## Kodlama Standartları

### JavaScript
- ES6+ özelliklerini kullanın
- Async/await tercih edin
- Promise zincirlerinden kaçının
- Açıklayıcı değişken ve fonksiyon isimleri kullanın
- Her dosya tek bir sorumluluk taşımalı
- Modülleri mantıklı bir şekilde organize edin

### Veritabanı
- İsimlendirme: snake_case
- İlişkiler: camelCase
- Migrasyonlar: açıklayıcı isimler
- Seed verileri: gerçekçi örnekler

### API
- RESTful standartlarına uyun
- HTTP metodlarını doğru kullanın
- Hata yanıtlarını standartlaştırın
- Versiyonlama yapın
- Dokümantasyonu güncel tutun

## API Documentation

### Authentication
- JWT-based authentication
- Role-based access control
- Session management

### Endpoints
- User management
- Beneficiary operations
- Questionnaire handling
- Document management
- Appointment scheduling
- Messaging system

See [API Documentation](api-docs/api.md) for detailed endpoint information.

## Database Management

### Models
- User
- Beneficiary
- Questionnaire
- Document
- Appointment
- Message
- CreditLog

### Migrations
- Version control for database schema
- Up and down migrations
- Data seeding

### Backup and Recovery
- Regular backups
- Point-in-time recovery
- Data export/import

## Testing

### Unit Tests
- Jest framework
- Test coverage requirements
- Mocking strategies

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows

### E2E Tests
- User workflows
- Critical paths
- Performance testing

See [Testing Guide](testing.md) for detailed testing information.

## Deployment

### Environments
- Development
- Staging
- Production

### CI/CD Pipeline
- Automated testing
- Build process
- Deployment strategies

### Monitoring
- Error tracking
- Performance monitoring
- Log management

See [Deployment Guide](../deployment-guide/deployment.md) for detailed deployment information.

## Troubleshooting

### Common Issues
- Database connection problems
- Authentication errors
- File upload issues
- Performance bottlenecks

### Debugging
- Logging strategies
- Error tracking
- Performance profiling

### Support
- Issue reporting
- Community guidelines
- Contribution process

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## Resources

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [Jest Documentation](https://jestjs.io/)

### Tools
- VS Code
- Postman
- Docker
- Git
- ESLint 