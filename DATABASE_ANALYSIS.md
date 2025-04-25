# BILAN APP - VERİTABANI ANALİZİ

## 1. VERİTABANI ŞEMALARI

### 1.1 User Schema
```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  credits: { type: Number, default: 0 },
  forfait: {
    type: { type: String, enum: ['basic', 'premium', 'enterprise'] },
    startDate: Date,
    endDate: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### 1.2 Bilan Schema
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['draft', 'completed', 'archived'], 
    default: 'draft' 
  },
  competencies: [{
    name: String,
    level: { type: Number, min: 1, max: 5 },
    description: String,
    category: String
  }],
  experiences: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String,
    skills: [String]
  }],
  education: [{
    degree: String,
    institution: String,
    field: String,
    startDate: Date,
    endDate: Date
  }],
  aiAnalysis: {
    competencyAnalysis: String,
    careerExploration: String,
    actionPlan: String,
    synthesis: String,
    lastUpdated: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### 1.3 Credit Transaction Schema
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['purchase', 'usage', 'refund', 'bonus'], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: String,
  balance: { type: Number, required: true },
  metadata: {
    operation: String,
    bilanId: { type: ObjectId, ref: 'Bilan' },
    paymentId: String
  },
  createdAt: { type: Date, default: Date.now }
}
```

### 1.4 AI Analysis Cache Schema
```javascript
{
  bilanId: { type: ObjectId, ref: 'Bilan', required: true },
  type: { 
    type: String, 
    enum: ['competency', 'career', 'action', 'synthesis'], 
    required: true 
  },
  input: { type: String, required: true },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' }
}
```

### 1.5 Audit Log Schema
```javascript
{
  user: { type: ObjectId, ref: 'User' },
  action: { 
    type: String, 
    required: true,
    enum: ['create', 'update', 'delete', 'view', 'analyze']
  },
  resource: {
    type: { type: String, required: true },
    id: { type: ObjectId, required: true }
  },
  changes: Object,
  metadata: {
    ip: String,
    userAgent: String
  },
  createdAt: { type: Date, default: Date.now }
}
```

## 2. İNDEKSLER

### 2.1 User İndeksleri
```javascript
{
  email: 1,                 // Unique index
  'forfait.endDate': 1,    // TTL index for forfait expiration
  lastLogin: 1,            // For user activity queries
  role: 1                  // For role-based queries
}
```

### 2.2 Bilan İndeksleri
```javascript
{
  user: 1,                 // For user's bilans
  status: 1,              // For status-based queries
  'competencies.name': 1,  // For competency searches
  createdAt: 1            // For timeline queries
}
```

### 2.3 Credit Transaction İndeksleri
```javascript
{
  user: 1,                 // For user's transactions
  type: 1,                // For transaction type queries
  createdAt: 1            // For timeline queries
}
```

### 2.4 AI Analysis Cache İndeksleri
```javascript
{
  bilanId: 1,             // For bilan's cached analyses
  type: 1,                // For analysis type queries
  createdAt: 1            // TTL index for cache expiration
}
```

## 3. VERİTABANI İLİŞKİLERİ

### 3.1 Birincil İlişkiler
- User -> Bilan (1:N)
- User -> CreditTransaction (1:N)
- Bilan -> AIAnalysisCache (1:N)

### 3.2 Referans Bütünlüğü
- User silindiğinde:
  - İlişkili Bilan'lar silinir (cascade)
  - İlişkili CreditTransaction'lar korunur (audit)
  - İlişkili AuditLog'lar korunur (audit)

- Bilan silindiğinde:
  - İlişkili AIAnalysisCache kayıtları silinir (cascade)
  - İlişkili AuditLog'lar korunur (audit)

## 4. VERİTABANI OPTİMİZASYONLARI

### 4.1 Sorgu Optimizasyonları
- Compound indeksler kullanıldı
- Projection ile gereksiz alan çekimi engellendi
- Lean queries ile bellek kullanımı optimize edildi
- Populate işlemleri için seçici yaklaşım benimsendi

### 4.2 Performans İyileştirmeleri
- Redis cache implementasyonu
- Büyük sorgu sonuçları için pagination
- Aggregation pipeline optimizasyonları
- Bulk operasyonlar için batch processing

### 4.3 Veri Tutarlılığı
- Mongoose middleware'leri ile veri doğrulama
- Transactions ile ACID uyumluluğu
- Şema validasyonları
- Referans bütünlüğü kontrolleri

## 5. BACKUP STRATEJİSİ

### 5.1 Yedekleme Planı
- Günlük tam yedekleme (00:00 UTC)
- Saatlik artımlı yedekleme
- 30 günlük yedek saklama süresi
- Coğrafi olarak ayrı lokasyonlarda depolama

### 5.2 Geri Yükleme Prosedürü
- Point-in-time recovery desteği
- Otomatik geri yükleme testleri
- Disaster recovery planı
- Veri tutarlılığı kontrolleri

## 6. İZLEME VE BAKIM

### 6.1 Performans İzleme
- Query performans metrikleri
- İndeks kullanım analizi
- Bellek kullanımı takibi
- Bağlantı havuzu metrikleri

### 6.2 Bakım Görevleri
- İndeks yeniden oluşturma planı
- Veri arşivleme stratejisi
- Düzenli veri temizliği
- Şema güncelleme prosedürleri
