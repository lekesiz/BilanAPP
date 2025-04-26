# BilanApp Kurulum Kılavuzu

Bu kılavuz, BilanApp uygulamasının kurulumu için gerekli adımları detaylı olarak açıklamaktadır.

## Sistem Gereksinimleri

### Sunucu Gereksinimleri
- İşletim Sistemi: Ubuntu 20.04 LTS veya üzeri
- CPU: 2 çekirdek veya üzeri
- RAM: 4GB veya üzeri
- Disk Alanı: 20GB veya üzeri
- Ağ: 100Mbps veya üzeri bağlantı

### Yazılım Gereksinimleri
- Node.js v14 veya üzeri
- npm v6 veya üzeri
- SQLite
- Git
- Nginx
- PM2

## Kurulum Adımları

### 1. Sunucu Hazırlığı

```bash
# Sistem güncellemesi
sudo apt update
sudo apt upgrade -y

# Temel araçların kurulumu
sudo apt install -y curl git build-essential
```

### 2. Node.js Kurulumu

```bash
# Node.js deposunu ekleme
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -

# Node.js ve npm kurulumu
sudo apt install -y nodejs

# Versiyon kontrolü
node --version
npm --version
```

### 3. Uygulama Kurulumu

```bash
# Uygulama dizini oluşturma
sudo mkdir -p /var/www/bilanapp
sudo chown $USER:$USER /var/www/bilanapp

# Uygulamayı klonlama
cd /var/www/bilanapp
git clone https://github.com/your-org/bilan-app.git .

# Bağımlılıkları kurma
npm install --production
```

### 4. Veritabanı Kurulumu

```bash
# Veritabanı dizini oluşturma
sudo mkdir -p /var/lib/bilanapp
sudo chown $USER:$USER /var/lib/bilanapp

# Migrasyonları çalıştırma
npx sequelize-cli db:migrate

# Başlangıç verilerini yükleme
npx sequelize-cli db:seed:all
```

### 5. Ortam Değişkenlerinin Ayarlanması

```bash
# .env dosyasını oluşturma
cp .env.example .env

# .env dosyasını düzenleme
nano .env
```

Örnek .env içeriği:
```env
# Uygulama
NODE_ENV=production
PORT=3000
APP_URL=https://bilanapp.com

# Veritabanı
DB_DIALECT=sqlite
DB_STORAGE=/var/lib/bilanapp/database.sqlite

# Kimlik Doğrulama
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# E-posta
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# Dosya Yükleme
UPLOAD_DIR=/var/www/bilanapp/uploads
MAX_FILE_SIZE=5242880
```

### 6. PM2 Kurulumu ve Yapılandırması

```bash
# PM2 kurulumu
sudo npm install -g pm2

# Uygulamayı başlatma
pm2 start ecosystem.config.js

# PM2'yi sistem başlangıcında otomatik başlatma
pm2 startup
pm2 save
```

### 7. Nginx Kurulumu ve Yapılandırması

```bash
# Nginx kurulumu
sudo apt install -y nginx

# Nginx yapılandırması
sudo nano /etc/nginx/sites-available/bilanapp
```

Nginx yapılandırma örneği:
```nginx
server {
    listen 80;
    server_name bilanapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/bilanapp/uploads;
    }
}
```

```bash
# Yapılandırmayı etkinleştirme
sudo ln -s /etc/nginx/sites-available/bilanapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Sertifikası Kurulumu

```bash
# Certbot kurulumu
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası alma
sudo certbot --nginx -d bilanapp.com
```

### 9. Güvenlik Duvarı Yapılandırması

```bash
# UFW kurulumu
sudo apt install -y ufw

# Güvenlik duvarı kuralları
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## Kurulum Sonrası Kontroller

### 1. Uygulama Durumu
```bash
# PM2 durumu
pm2 status

# Nginx durumu
sudo systemctl status nginx

# SSL sertifikası durumu
sudo certbot certificates
```

### 2. Erişim Testi
- Tarayıcıdan `https://bilanapp.com` adresine erişim
- SSL sertifikası kontrolü
- Uygulama giriş sayfası kontrolü

### 3. E-posta Testi
- Kayıt olma işlemi testi
- Şifre sıfırlama testi

## Sorun Giderme

### 1. Uygulama Başlatılamıyor
```bash
# Hata loglarını kontrol etme
pm2 logs bilan-app

# Uygulamayı yeniden başlatma
pm2 restart bilan-app
```

### 2. Nginx Hataları
```bash
# Nginx hata loglarını kontrol etme
sudo tail -f /var/log/nginx/error.log

# Yapılandırma kontrolü
sudo nginx -t
```

### 3. Veritabanı Sorunları
```bash
# Veritabanı dosyası izinlerini kontrol etme
ls -l /var/lib/bilanapp/database.sqlite

# Veritabanı bağlantısını test etme
npx sequelize-cli db:migrate:status
```

## Yedekleme ve Kurtarma

### 1. Veritabanı Yedekleme
```bash
# Manuel yedekleme
sqlite3 /var/lib/bilanapp/database.sqlite ".backup '/backup/database.sqlite'"

# Otomatik yedekleme (cron)
0 0 * * * sqlite3 /var/lib/bilanapp/database.sqlite ".backup '/backup/database-$(date +\%Y\%m\%d).sqlite'"
```

### 2. Uygulama Yedekleme
```bash
# Uygulama dosyalarını yedekleme
tar -czf /backup/bilanapp-$(date +\%Y\%m\%d).tar.gz /var/www/bilanapp

# Yüklenen dosyaları yedekleme
tar -czf /backup/uploads-$(date +\%Y\%m\%d).tar.gz /var/www/bilanapp/uploads
```

## Güncelleme

### 1. Uygulama Güncelleme
```bash
# Değişiklikleri çekme
cd /var/www/bilanapp
git pull

# Bağımlılıkları güncelleme
npm install --production

# Migrasyonları çalıştırma
npx sequelize-cli db:migrate

# Uygulamayı yeniden başlatma
pm2 restart bilan-app
```

## Destek

Teknik destek için:
- E-posta: support@bilanapp.com
- Telefon: +90 212 123 45 67
- Çalışma saatleri: Hafta içi 09:00 - 18:00 