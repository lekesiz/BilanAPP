# BilanApp Dokümantasyonu

## İçindekiler
1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Kurulum Kılavuzu](#kurulum-kılavuzu)
3. [Kullanıcı Kılavuzu](#kullanıcı-kılavuzu)
4. [Geliştirme Kılavuzu](#geliştirme-kılavuzu)
5. [Veritabanı Dokümantasyonu](#veritabanı-dokümantasyonu)
6. [Test Kılavuzu](#test-kılavuzu)
7. [Dağıtım Kılavuzu](#dağıtım-kılavuzu)
8. [Proje Durumu](#proje-durumu)
9. [Yol Haritası](#yol-haritası)

## Proje Genel Bakış

BilanApp, Fransa'da "Bilan de Compétences" (Yetenek Değerlendirmesi) süreçlerini yönetmek için bir web platformudur. Bu uygulama, danışmanların değerlendirme yaşam döngüsü boyunca faydalanıcıları, randevuları, belgeleri, anketleri ve iletişimi yönetmesine yardımcı olur.

### Teknoloji Yığını
- **Backend:** Node.js, Express.js
- **Veritabanı:** Sequelize ORM ile SQLite
- **Şablonlama:** Handlebars
- **Kimlik Doğrulama:** Passport.js (Yerel Strateji)
- **Şifre Hashleme:** Bcrypt
- **Dosya Yükleme:** Multer
- **AI Entegrasyonu:** OpenAI
- **Diğer:** dotenv, connect-flash, morgan, cookie-parser, debug

### Özellikler
- **Kullanıcı Rolleri:** Danışman, Faydalanıcı (kullanıcı hesabı), Yönetici
- **Danışman Paneli:** Danışmanlar için genel bakış
- **Faydalanıcı Yönetimi:** CRUD işlemleri, durum/aşama takibi
- **Randevu Takibi:** Faydalanıcılar ve danışmanlarla bağlantılı randevuları yönetme
- **Belge Yönetimi:** Faydalanıcılarla ilgili belgeleri yükleme ve yönetme
- **Anket Yönetimi:** Faydalanıcılara anket oluşturma ve atama
- **Mesajlaşma Sistemi:** Temel iletişim özellikleri
- **Raporlama Modülü:** Danışmanlar için istatistikler
- **Paket/Abonelik Sistemi:** Farklı seviyelerde özelliklerin kilidini açma
- **Kredi Sistemi:** Belirli işlemler için kredileri takip etme ve düşme
- **AI Destekli Taslak Oluşturma:** OpenAI kullanarak taslak sentez ve eylem planı belgeleri oluşturma
- **AI Kullanım Limitleri:** Kullanıcı aboneliği/paketine göre AI oluşturma sayısını kontrol etme

## Kurulum Kılavuzu

Detaylı kurulum talimatları için [Kurulum Kılavuzu](user/installation.md) bölümüne bakın.

## Kullanıcı Kılavuzu

Uygulamayı kullanma hakkında detaylı talimatlar için [Kullanıcı Kılavuzu](user/user-guide.md) bölümüne bakın.

## Geliştirme Kılavuzu

Projeye katkıda bulunma hakkında bilgi için [Geliştirme Kılavuzu](development/development-guide.md) bölümüne bakın.

## Veritabanı Dokümantasyonu

Veritabanı yapısı ve ilişkileri hakkında bilgi için [Veritabanı Dokümantasyonu](development/database.md) bölümüne bakın.

## Test Kılavuzu

Uygulamayı test etme hakkında bilgi için [Test Kılavuzu](development/testing.md) bölümüne bakın.

## Dağıtım Kılavuzu

Uygulamayı dağıtma hakkında bilgi için [Dağıtım Kılavuzu](deployment/deployment.md) bölümüne bakın.

## Proje Durumu

Mevcut proje durumu ve son değişiklikler için [Proje Durumu](development/status.md) bölümüne bakın.

## Yol Haritası

Gelecek planları ve yaklaşan özellikler için [Yol Haritası](development/roadmap.md) bölümüne bakın. 