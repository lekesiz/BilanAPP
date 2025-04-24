const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Log dizinini oluştur
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Geliştirme ve üretim ortamları için farklı log seviyeleri
const level = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Renkli konsol çıktısı formatı
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Dosya formatı (JSON olabilir veya basit metin)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(), // JSON formatında kaydet
);

const logger = winston.createLogger({
  level: level, // Minimum log seviyesi
  format: winston.format.combine(
    winston.format.errors({ stack: true }), // Hata stack trace'lerini ekle
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'bilan-app' }, // Tüm loglara eklenecek meta veri
  transports: [
    // Konsola yazdırma (geliştirme için daha detaylı)
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Geliştirmede debug seviyesi
      format: consoleFormat,
      handleExceptions: true, // Yakalanmayan exceptionları logla
    }),
    // Dosyaya yazdırma (tüm seviyeler)
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'info', // Dosyaya en az info seviyesini yaz
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5, // En fazla 5 log dosyası tut
      handleExceptions: true, // Yakalanmayan exceptionları logla
    }),
    // Hatalar için ayrı dosya (isteğe bağlı)
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true, // Yakalanmayan exceptionları logla
    }),
  ],
  exitOnError: false, // Hata loglandıktan sonra uygulamayı kapatma
});

// Morgan HTTP isteklerini Winston ile loglamak için bir stream oluştur
logger.stream = {
  write: (message) => {
    // Morgan'ın formatından seviyeyi çıkarmaya çalışabiliriz veya varsayılan olarak http/info kullanabiliriz.
    // Morgan formatı: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
    // Basitçe info seviyesi kullanalım:
    logger.http(message.trim());
  },
};

module.exports = logger; 