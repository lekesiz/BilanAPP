# BilanApp API Dokümantasyonu

## Temel URL
```
https://api.bilanapp.com/v1
```

## Kimlik Doğrulama
Tüm API istekleri JWT token ile kimlik doğrulaması gerektirir. Token'ı Authorization başlığında belirtin:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoint'ler

### Kullanıcı Yönetimi

#### Kullanıcı Profilini Getir
```http
GET /users/profile
```

**Yanıt**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Kullanıcı Profilini Güncelle
```http
PUT /users/profile
```

**İstek Gövdesi**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com"
}
```

**Yanıt**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Faydalanıcılar

#### Faydalanıcıları Listele
```http
GET /beneficiaries
```

**Sorgu Parametreleri**
- `page` (opsiyonel): Sayfa numarası (varsayılan: 1)
- `limit` (opsiyonel): Sayfa başına öğe sayısı (varsayılan: 10)
- `search` (opsiyonel): Arama terimi
- `status` (opsiyonel): Duruma göre filtreleme

**Yanıt**
```json
{
  "data": [
    {
      "id": "ben_123",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### Faydalanıcı Oluştur
```http
POST /beneficiaries
```

**İstek Gövdesi**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890"
}
```

**Yanıt**
```json
{
  "id": "ben_123",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Anketler

#### Anketleri Listele
```http
GET /questionnaires
```

**Sorgu Parametreleri**
- `page` (opsiyonel): Sayfa numarası (varsayılan: 1)
- `limit` (opsiyonel): Sayfa başına öğe sayısı (varsayılan: 10)
- `status` (opsiyonel): Duruma göre filtreleme
- `type` (opsiyonel): Tipe göre filtreleme

**Yanıt**
```json
{
  "data": [
    {
      "id": "quest_123",
      "title": "İlk Değerlendirme",
      "description": "İlk değerlendirme anketi",
      "type": "assessment",
      "status": "active",
      "questions": [
        {
          "id": "q1",
          "text": "Soru 1",
          "type": "multiple_choice",
          "options": ["Seçenek 1", "Seçenek 2"]
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Anket Yanıtı Gönder
```http
POST /questionnaires/:id/responses
```

**İstek Gövdesi**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": "Seçenek 1"
    }
  ]
}
```

**Yanıt**
```json
{
  "id": "resp_123",
  "questionnaireId": "quest_123",
  "beneficiaryId": "ben_123",
  "answers": [
    {
      "questionId": "q1",
      "answer": "Seçenek 1"
    }
  ],
  "submittedAt": "2024-01-01T00:00:00Z"
}
```

### Belgeler

#### Belge Yükle
```http
POST /documents
```

**İstek Gövdesi (multipart/form-data)**
- `file`: Belge dosyası
- `type`: Belge tipi
- `beneficiaryId`: Faydalanıcı ID
- `description`: Belge açıklaması

**Yanıt**
```json
{
  "id": "doc_123",
  "filename": "belge.pdf",
  "type": "assessment",
  "beneficiaryId": "ben_123",
  "url": "https://storage.bilanapp.com/documents/doc_123.pdf",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Belgeleri Listele
```http
GET /documents
```

**Sorgu Parametreleri**
- `page` (opsiyonel): Sayfa numarası (varsayılan: 1)
- `limit` (opsiyonel): Sayfa başına öğe sayısı (varsayılan: 10)
- `beneficiaryId` (opsiyonel): Faydalanıcıya göre filtreleme
- `type` (opsiyonel): Tipe göre filtreleme

**Yanıt**
```json
{
  "data": [
    {
      "id": "doc_123",
      "filename": "belge.pdf",
      "type": "assessment",
      "beneficiaryId": "ben_123",
      "url": "https://storage.bilanapp.com/documents/doc_123.pdf",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### Randevular

#### Randevu Oluştur
```http
POST /appointments
```

**İstek Gövdesi**
```json
{
  "beneficiaryId": "ben_123",
  "date": "2024-01-01T10:00:00Z",
  "duration": 60,
  "type": "assessment",
  "notes": "İlk değerlendirme randevusu"
}
```

**Yanıt**
```json
{
  "id": "app_123",
  "beneficiaryId": "ben_123",
  "date": "2024-01-01T10:00:00Z",
  "duration": 60,
  "type": "assessment",
  "status": "scheduled",
  "notes": "İlk değerlendirme randevusu",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Randevuları Listele
```http
GET /appointments
```

**Sorgu Parametreleri**
- `page` (opsiyonel): Sayfa numarası (varsayılan: 1)
- `limit` (opsiyonel): Sayfa başına öğe sayısı (varsayılan: 10)
- `startDate` (opsiyonel): Başlangıç tarihine göre filtreleme
- `endDate` (opsiyonel): Bitiş tarihine göre filtreleme
- `status` (opsiyonel): Duruma göre filtreleme
- `type` (opsiyonel): Tipe göre filtreleme

**Yanıt**
```json
{
  "data": [
    {
      "id": "app_123",
      "beneficiaryId": "ben_123",
      "date": "2024-01-01T10:00:00Z",
      "duration": 60,
      "type": "assessment",
      "status": "scheduled",
      "notes": "İlk değerlendirme randevusu",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### Mesajlar

#### Mesaj Gönder
```http
POST /messages
```

**İstek Gövdesi**
```json
{
  "beneficiaryId": "ben_123",
  "subject": "Randevu Hatırlatması",
  "content": "Yarın saat 10:00'da randevunuz bulunmaktadır",
  "type": "notification"
}
```

**Yanıt**
```json
{
  "id": "msg_123",
  "beneficiaryId": "ben_123",
  "subject": "Randevu Hatırlatması",
  "content": "Yarın saat 10:00'da randevunuz bulunmaktadır",
  "type": "notification",
  "status": "sent",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Mesajları Listele
```http
GET /messages
```

**Sorgu Parametreleri**
- `page` (opsiyonel): Sayfa numarası (varsayılan: 1)
- `limit` (opsiyonel): Sayfa başına öğe sayısı (varsayılan: 10)
- `beneficiaryId` (opsiyonel): Faydalanıcıya göre filtreleme
- `type` (opsiyonel): Tipe göre filtreleme
- `status` (opsiyonel): Duruma göre filtreleme

**Yanıt**
```json
{
  "data": [
    {
      "id": "msg_123",
      "beneficiaryId": "ben_123",
      "subject": "Randevu Hatırlatması",
      "content": "Yarın saat 10:00'da randevunuz bulunmaktadır",
      "type": "notification",
      "status": "sent",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

## Hata Yönetimi

Tüm API hataları bu formatta döner:

```json
{
  "error": {
    "code": "HATA_KODU",
    "message": "Hata açıklaması",
    "details": {
      "field": "Ek hata detayları"
    }
  }
}
```

Yaygın hata kodları:
- `INVALID_TOKEN`: Geçersiz veya süresi dolmuş kimlik doğrulama token'ı
- `VALIDATION_ERROR`: İstek doğrulaması başarısız
- `NOT_FOUND`: Kaynak bulunamadı
- `UNAUTHORIZED`: Yetersiz yetki
- `INTERNAL_ERROR`: Sunucu hatası

## İstek Sınırlaması

- Kimlik doğrulanmış kullanıcılar: Dakikada 100 istek
- Kimlik doğrulanmamış kullanıcılar: Dakikada 20 istek

İstek sınırı başlıkları tüm yanıtlarda bulunur:
- `X-RateLimit-Limit`: Dakikada maksimum istek sayısı
- `X-RateLimit-Remaining`: Mevcut pencerede kalan istek sayısı
- `X-RateLimit-Reset`: İstek sınırının sıfırlanacağı zaman (Unix timestamp) 