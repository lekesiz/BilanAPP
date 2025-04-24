const fs = require('fs');
const path = require('path');

// Veritabanı dizinini oluştur
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Production initialization completed successfully.');
