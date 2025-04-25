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
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

// Dosya formatı (JSON olabilir veya basit metin)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const logFormat = winston.format.printf(({ level: logLevel, message, timestamp: logTimestamp, stack, metadata: logMetadata }) => {
  let log = `${logTimestamp} ${logLevel}: ${message}`;
  // Metadata'yı stringify et ve log'a ekle (obje veya dizi ise)
  if (logMetadata && Object.keys(logMetadata).length > 0) {
    try {
      // Hataları ve diğer özel nesneleri düzgün işle
      const serializedMetadata = JSON.stringify(logMetadata, (key, value) => {
        if (value instanceof Error) {
          // Hata nesnelerini daha okunabilir formatta serialize et
          return {
            message: value.message,
            stack: value.stack,
            // İsteğe bağlı: Diğer hata özellikleri (örn: code)
            ...(value.code && { code: value.code }),
          };
        }
        return value;
      }, 2); // 2 boşluklu girinti
      // Limit log length for metadata if needed
      // log += ` - Metadata: ${serializedMetadata.substring(0, 1000)}${serializedMetadata.length > 1000 ? '...' : ''}`;
      log += ` - Metadata: ${serializedMetadata}`;
    } catch (e) {
      log += ' - [Metadata serialization error]';
    }
  }
  // Stack trace varsa ekle
  // Format stack trace for better readability on multiple lines
  if (stack) {
    // log += `\nStack: ${stack}`;
    log += `\nStack:\n${stack.split('\n').map((line) => `  ${line}`).join('\n')}`;
  }
  return log;
});

// Console transport options
const consoleTransportOptions = {
  format: winston.format.combine(
    // winston.format.colorize(), // Renklendirme üretimde sorun çıkarabilir, isteğe bağlı
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    winston.format.errors({ stack: true }),
    logFormat,
  ),
  handleExceptions: true,
  handleRejections: true,
};

// File transport options
const fileTransportOptions = {
  filename: path.join(__dirname, '../logs/app.log'),
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    winston.format.errors({ stack: true }),
    logFormat,
    // winston.format.json() // Logları JSON formatında kaydetmek isterseniz
  ),
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  handleExceptions: true,
  handleRejections: true,
};

const logger = winston.createLogger({
  level, // Minimum log seviyesi
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
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
