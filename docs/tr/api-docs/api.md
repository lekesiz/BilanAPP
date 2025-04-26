# BilanApp API Dokümantasyonu

Bu dokümantasyon, BilanApp uygulamasının API'sini kullanmak için gerekli bilgileri içermektedir.

## Genel Bilgiler

### Kimlik Doğrulama
Tüm API istekleri JWT token ile kimlik doğrulaması gerektirir. Token'ı `Authorization` header'ında `Bearer` şeması ile gönderin:

```
Authorization: Bearer <token>
```

### Temel URL
```
https://api.bilanapp.com/v1
```

## API Endpoint'leri

### Kimlik Doğrulama

#### Giriş
```http
POST /auth/login
```

İstek:
```json
{
  "email": "kullanici@example.com",
  "password": "sifre123"
}
```

Yanıt:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "kullanici@example.com",
    "role": "admin"
  }
}
```

### Kullanıcı Yönetimi

#### Kullanıcı Listesi
```http
GET /users
```

Yanıt:
```json
{
  "users": [
    {
      "id": 1,
      "email": "kullanici@example.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Kullanıcı Oluşturma
```http
POST /users
```

İstek:
```json
{
  "email": "yeni@example.com",
  "password": "sifre123",
  "role": "user"
}
```

### Faydalanıcılar

#### Faydalanıcı Listesi
```http
GET /beneficiaries
```

Yanıt:
```json
{
  "beneficiaries": [
    {
      "id": 1,
      "name": "Ahmet Yılmaz",
      "birthDate": "1990-01-01",
      "status": "active"
    }
  ]
}
```

#### Faydalanıcı Detayları
```http
GET /beneficiaries/:id
```

### Anketler

#### Anket Listesi
```http
GET /questionnaires
```

#### Anket Oluşturma
```http
POST /questionnaires
```

İstek:
```json
{
  "title": "Sağlık Anketi",
  "questions": [
    {
      "text": "Genel sağlık durumunuz nasıl?",
      "type": "multiple_choice",
      "options": ["İyi", "Orta", "Kötü"]
    }
  ]
}
```

### Belgeler

#### Belge Yükleme
```http
POST /documents
Content-Type: multipart/form-data
```

#### Belge Listesi
```http
GET /documents
```

### Randevular

#### Randevu Oluşturma
```http
POST /appointments
```

İstek:
```json
{
  "beneficiaryId": 1,
  "date": "2024-03-20T14:00:00Z",
  "type": "checkup"
}
```

#### Randevu Listesi
```http
GET /appointments
```

### Mesajlar

#### Mesaj Gönderme
```http
POST /messages
```

İstek:
```json
{
  "recipientId": 1,
  "subject": "Önemli Bilgilendirme",
  "content": "Merhaba, lütfen kontrol ediniz."
}
```

#### Mesaj Listesi
```http
GET /messages
```

## Hata Yanıtları

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata mesajı",
    "details": {
      "field": "Hata detayı"
    }
  }
}
```

## Hız Sınırlaması

- API istekleri dakikada 100 istek ile sınırlıdır
- Hız sınırı aşıldığında 429 Too Many Requests yanıtı döner

## Versiyonlama

API versiyonları URL'de belirtilir:
```
/v1/endpoint
```

## Daha Fazla Bilgi

Detaylı API dokümantasyonu için [Swagger UI](https://api.bilanapp.com/docs) adresini ziyaret edin. 