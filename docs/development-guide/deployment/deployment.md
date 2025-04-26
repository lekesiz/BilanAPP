# Deployment Guide

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Database Migrations](#database-migrations)
3. [Backup and Restore](#backup-and-restore)
4. [Monitoring and Logging](#monitoring-and-logging)
5. [Security Considerations](#security-considerations)
6. [Scaling and Performance](#scaling-and-performance)

## Environment Setup

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- PostgreSQL (v14.x or higher)
- Redis (v6.x or higher)
- PM2 (for process management)

### Configuration Files
1. Create `.env` file in the root directory:
```env
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@your-domain.com

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880 # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Installation Steps
1. Clone the repository:
```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Start the application with PM2:
```bash
pm2 start ecosystem.config.js
```

## Database Migrations

### Initial Setup
1. Create the database:
```bash
createdb your_db_name
```

2. Run migrations:
```bash
npm run migrate
```

3. Seed initial data:
```bash
npm run seed
```

### Migration Commands
- Create new migration:
```bash
npm run migration:create --name=your_migration_name
```

- Run pending migrations:
```bash
npm run migrate
```

- Rollback last migration:
```bash
npm run migrate:undo
```

- Rollback all migrations:
```bash
npm run migrate:undo:all
```

## Backup and Restore

### Database Backup
1. Create backup:
```bash
pg_dump -U your_db_user -d your_db_name > backup_$(date +%Y%m%d).sql
```

2. Compress backup:
```bash
gzip backup_$(date +%Y%m%d).sql
```

### Database Restore
1. Decompress backup:
```bash
gunzip backup_20240315.sql.gz
```

2. Restore database:
```bash
psql -U your_db_user -d your_db_name < backup_20240315.sql
```

### Automated Backups
1. Create backup script:
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d)
pg_dump -U your_db_user -d your_db_name | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
find $BACKUP_DIR -type f -mtime +7 -delete
```

2. Add to crontab:
```bash
0 0 * * * /path/to/backup_script.sh
```

## Monitoring and Logging

### Application Monitoring
1. PM2 Monitoring:
```bash
pm2 monit
```

2. View logs:
```bash
pm2 logs
```

### System Logs
1. View application logs:
```bash
tail -f logs/app.log
```

2. View error logs:
```bash
tail -f logs/error.log
```

### Performance Monitoring
1. Enable Redis monitoring:
```bash
redis-cli monitor
```

2. Database monitoring:
```bash
pg_stat_activity
```

## Security Considerations

### SSL/TLS Configuration
1. Generate SSL certificate:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout private.key -out certificate.crt
```

2. Configure Nginx:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

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

### Security Headers
1. Configure helmet middleware:
```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
```

## Scaling and Performance

### Load Balancing
1. Configure Nginx load balancing:
```nginx
upstream app_servers {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Caching Strategy
1. Redis caching configuration:
```javascript
const redis = require('redis');
const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});
```

2. Cache middleware:
```javascript
const cache = (duration) => {
    return (req, res, next) => {
        const key = req.originalUrl;
        client.get(key, (err, data) => {
            if (data) {
                return res.send(JSON.parse(data));
            }
            res.originalSend = res.send;
            res.send = (body) => {
                client.setex(key, duration, JSON.stringify(body));
                res.originalSend(body);
            };
            next();
        });
    };
};
```

### Database Optimization
1. Configure connection pool:
```javascript
const pool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

2. Add database indexes:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX idx_documents_type ON documents(type);
```

## Troubleshooting

### Common Issues
1. Database connection issues:
```bash
psql -U your_db_user -d your_db_name -c "SELECT 1"
```

2. Redis connection issues:
```bash
redis-cli ping
```

3. Application errors:
```bash
pm2 logs
```

### Performance Issues
1. Check CPU usage:
```bash
top
```

2. Check memory usage:
```bash
free -m
```

3. Check disk usage:
```bash
df -h
```

## Maintenance

### Regular Tasks
1. Update dependencies:
```bash
npm update
```

2. Clean up old logs:
```bash
find /path/to/logs -type f -mtime +30 -delete
```

3. Database maintenance:
```sql
VACUUM ANALYZE;
```

### Emergency Procedures
1. Application restart:
```bash
pm2 restart all
```

2. Database recovery:
```bash
pg_restore -U your_db_user -d your_db_name backup_file.sql
```

3. System recovery:
```bash
systemctl restart nginx
systemctl restart redis
systemctl restart postgresql
``` 