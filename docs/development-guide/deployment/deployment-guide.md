# Deployment Guide

## Table of Contents
1. [Deployment Environments](#deployment-environments)
2. [Prerequisites](#prerequisites)
3. [Deployment Process](#deployment-process)
4. [Configuration Management](#configuration-management)
5. [Database Management](#database-management)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Scaling and Performance](#scaling-and-performance)
8. [Backup and Recovery](#backup-and-recovery)
9. [Security Considerations](#security-considerations)

## Deployment Environments

### Development
- Local development setup
- Hot-reloading enabled
- Debug mode active
- Test data available

### Staging
- Production-like environment
- Integration testing
- Performance testing
- User acceptance testing

### Production
- High availability
- Load balancing
- CDN integration
- Monitoring and alerting

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Redis 6.x or higher
- Nginx 1.20.x or higher
- PM2 5.x or higher

### Required Tools
```bash
# Install required tools
npm install -g pm2
sudo apt-get install nginx
sudo apt-get install redis-server
```

### Environment Variables
```env
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your_jwt_secret
```

## Deployment Process

### Local Development
```bash
# Clone repository
git clone https://github.com/your-org/bilan-app.git
cd bilan-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

### Staging Deployment
```bash
# Build application
npm run build

# Set up environment
cp .env.example .env.staging
# Edit .env.staging with staging settings

# Start application with PM2
pm2 start ecosystem.config.js --env staging
```

### Production Deployment
```bash
# Build application
npm run build

# Set up environment
cp .env.example .env.production
# Edit .env.production with production settings

# Start application with PM2
pm2 start ecosystem.config.js --env production
```

## Configuration Management

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'bilan-app',
    script: 'bin/www',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_staging: {
      NODE_ENV: 'staging'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/bilan-app
server {
    listen 80;
    server_name bilan-app.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SSL configuration
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/bilan-app.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bilan-app.com/privkey.pem;
}
```

## Database Management

### Migrations
```bash
# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:undo

# Create new migration
npm run migrate:create --name migration_name
```

### Seeding
```bash
# Seed database
npm run seed

# Seed specific data
npm run seed -- --seeders-path path/to/seeders
```

### Backup
```bash
# Create backup
pg_dump -U user -d dbname > backup.sql

# Restore backup
psql -U user -d dbname < backup.sql
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs

# Generate metrics
pm2 metrics
```

### Log Management
```javascript
// Logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Monitoring Tools
- New Relic
- Datadog
- Prometheus
- Grafana

## Scaling and Performance

### Load Balancing
```nginx
# Nginx load balancing
upstream bilan_app {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://bilan_app;
    }
}
```

### Caching
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = async (key, data, ttl = 3600) => {
    await client.setex(key, ttl, JSON.stringify(data));
};
```

### CDN Configuration
```javascript
// CDN setup
const cdn = {
    url: 'https://cdn.bilan-app.com',
    paths: ['/public', '/uploads']
};
```

## Backup and Recovery

### Automated Backups
```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d)
pg_dump -U user -d dbname > $BACKUP_DIR/backup_$DATE.sql
```

### Recovery Process
```bash
# Restore from backup
psql -U user -d dbname < backup.sql

# Verify restoration
psql -U user -d dbname -c "SELECT COUNT(*) FROM users;"
```

### Disaster Recovery
1. Identify critical systems
2. Document recovery procedures
3. Test recovery process
4. Maintain backup schedule

## Security Considerations

### SSL/TLS
```bash
# Generate SSL certificate
certbot --nginx -d bilan-app.com

# Renew SSL certificate
certbot renew
```

### Firewall Configuration
```bash
# Configure UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Security Headers
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### Regular Updates
```bash
# Update system
sudo apt-get update
sudo apt-get upgrade

# Update Node.js
nvm install node --reinstall-packages-from=node
```

### Monitoring Security
```javascript
// Security monitoring
const securityMonitor = {
    checkVulnerabilities: async () => {
        const audit = await npm.audit();
        return audit.vulnerabilities;
    },
    checkDependencies: async () => {
        const outdated = await npm.outdated();
        return outdated;
    }
};
``` 