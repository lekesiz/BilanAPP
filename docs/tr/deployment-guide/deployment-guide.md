# BilanApp Deployment Kılavuzu

Bu kılavuz, BilanApp uygulamasının çeşitli ortamlarda dağıtımı için detaylı talimatlar sağlar.

## İçindekiler
1. [Ön Koşullar](#ön-koşullar)
2. [Ortam Kurulumu](#ortam-kurulumu)
3. [Deployment Yöntemleri](#deployment-yöntemleri)
4. [Veritabanı Kurulumu](#veritabanı-kurulumu)
5. [SSL Yapılandırması](#ssl-yapılandırması)
6. [İzleme](#izleme)
7. [Yedekleme ve Kurtarma](#yedekleme-ve-kurtarma)
8. [Ölçeklendirme](#ölçeklendirme)
9. [Sorun Giderme](#sorun-giderme)

## Ön Koşullar

### Sistem Gereksinimleri
- Node.js v18.x veya üzeri
- npm v9.x veya üzeri
- SQLite3
- Nginx veya Apache
- SSL Sertifikası
- Alan adı

### Sunucu Gereksinimleri
- CPU: 2+ çekirdek
- RAM: 4GB+
- Depolama: 20GB+
- İşletim Sistemi: Ubuntu 20.04 LTS veya üzeri

## Ortam Kurulumu

### 1. Sunucu Yapılandırması
```bash
# Sistem paketlerini güncelle
sudo apt update
sudo apt upgrade -y

# Gerekli paketleri yükle
sudo apt install -y nodejs npm nginx sqlite3

# PM2'yi global olarak yükle
sudo npm install -g pm2
```

### 2. Uygulama Kurulumu
```bash
# Depoyu klonla
git clone https://github.com/your-org/bilan-app.git
cd bilan-app

# Bağımlılıkları yükle
npm install

# Uygulamayı derle
npm run build
```

### 3. Ortam Değişkenleri
Production ayarlarıyla `.env` dosyası oluştur:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=sqlite:///path/to/production.db
JWT_SECRET=your-secret-key
```

## Deployment Yöntemleri

### 1. Manuel Deployment
```bash
# PM2 ile uygulamayı başlat
pm2 start npm --name "bilan-app" -- start

# PM2 süreç listesini kaydet
pm2 save

# PM2'yi önyüklemede başlatacak şekilde yapılandır
pm2 startup
```

### 2. Docker Deployment
```bash
# Docker imajını oluştur
docker build -t bilan-app .

# Konteynerı çalıştır
docker run -d \
  --name bilan-app \
  -p 3000:3000 \
  -v /path/to/data:/app/data \
  bilan-app
```

### 3. CI/CD Deployment
CI/CD pipeline'ınızı (GitHub Actions, GitLab CI, vb.) şu adımlarla yapılandırın:
1. Bağımlılıkları yükle
2. Testleri çalıştır
3. Uygulamayı derle
4. Sunucuya deploy et

## Veritabanı Kurulumu

### 1. Veritabanını Başlat
```bash
# Migration'ları çalıştır
npm run db:migrate

# Seed'leri çalıştır
npm run db:seed
```

### 2. Yedekleme Yapılandırması
```bash
# Yedekleme scripti oluştur
#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M%S)
cp /path/to/database.db /backup/database_$timestamp.db
```

## SSL Yapılandırması

### 1. Nginx Yapılandırması
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## İzleme

### 1. PM2 İzleme
```bash
# Uygulamayı izle
pm2 monit

# Logları görüntüle
pm2 logs bilan-app
```

### 2. Sistem İzleme
```bash
# İzleme araçlarını yükle
sudo apt install -y htop iotop

# Sistem kaynaklarını izle
htop
```

## Yedekleme ve Kurtarma

### 1. Veritabanı Yedekleme
```bash
# Günlük yedekleme
0 0 * * * /path/to/backup-script.sh

# Haftalık yedekleme
0 0 * * 0 /path/to/full-backup.sh
```

### 2. Kurtarma Süreci
1. Uygulamayı durdur
2. Veritabanını yedekten geri yükle
3. Veri bütünlüğünü doğrula
4. Uygulamayı yeniden başlat

## Ölçeklendirme

### 1. Dikey Ölçeklendirme
- Sunucu kaynaklarını artır
- Uygulama kodunu optimize et
- Önbellekleme uygula

### 2. Yatay Ölçeklendirme
- Yük dengeleme kur
- Çoklu örnek yapılandır
- Oturum paylaşımı uygula

## Sorun Giderme

### Yaygın Sorunlar
1. Uygulama başlamıyor
2. Veritabanı bağlantı sorunları
3. SSL sertifika sorunları
4. Performans sorunları

### Hata Ayıklama Adımları
1. Uygulama loglarını kontrol et
2. Veritabanı bağlantısını doğrula
3. SSL yapılandırmasını test et
4. Sistem kaynaklarını izle

## Güvenlik Hususları

### 1. Güvenlik Duvarı Yapılandırması
```bash
# UFW'yi yapılandır
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Güvenlik Başlıkları
```javascript
// Güvenlik başlıklarını ekle
app.use(helmet());
```

### 3. Düzenli Güncellemeler
```bash
# Sistem paketlerini güncelle
sudo apt update
sudo apt upgrade -y

# npm paketlerini güncelle
npm update
```

## Bakım

### 1. Düzenli Görevler
- Sistem paketlerini güncelle
- Veritabanını yedekle
- Logları kontrol et
- Performansı izle

### 2. Zamanlanmış Bakım
- Veritabanı optimizasyonu
- SSL sertifika yenileme
- Güvenlik yamaları
- Performans ayarlaması 