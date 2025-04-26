# Deployment Guide

This document provides comprehensive information about deploying the BilanApp project.

## Overview

The application can be deployed in different environments:
- Development
- Staging
- Production

## Prerequisites

### Server Requirements
- Node.js v14 or higher
- npm v6 or higher
- SQLite
- Git
- PM2 (for process management)
- Nginx (for reverse proxy)

### Environment Variables
```env
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://bilanapp.com

# Database
DB_DIALECT=sqlite
DB_STORAGE=/path/to/database.sqlite

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# File Upload
UPLOAD_DIR=/path/to/uploads
MAX_FILE_SIZE=5242880 # 5MB
```

## Deployment Process

### 1. Server Setup

```bash
# Update system
sudo apt update
sudo apt upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx
```

### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/your-org/bilan-app.git
cd bilan-app

# Install dependencies
npm install --production

# Build assets (if needed)
npm run build

# Set up environment variables
cp .env.example .env
# Edit .env with production values
```

### 3. Database Setup

```bash
# Run migrations
npx sequelize-cli db:migrate

# Seed initial data (if needed)
npx sequelize-cli db:seed:all
```

### 4. Process Management with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Monitor application
pm2 monit

# View logs
pm2 logs
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/bilanapp
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
        alias /path/to/uploads;
    }
}
```

### 6. SSL Configuration

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d bilanapp.com
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: npm install
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: npm install
      - run: npm run build
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /path/to/bilan-app
            git pull
            npm install --production
            npx sequelize-cli db:migrate
            pm2 restart bilan-app
```

## Monitoring

### Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2-monit

# Start monitoring
pm2 monit
```

### Log Management

```bash
# View application logs
pm2 logs bilan-app

# View error logs
pm2 logs bilan-app --err

# View Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Performance Monitoring

```bash
# Install monitoring tools
npm install -g clinic

# Run performance analysis
clinic doctor -- node app.js
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
sqlite3 database.sqlite ".backup 'backup.sqlite'"

# Schedule daily backups
0 0 * * * /path/to/backup-script.sh
```

### Application Backup

```bash
# Backup application files
tar -czf bilan-app-backup.tar.gz /path/to/bilan-app

# Backup uploads
tar -czf uploads-backup.tar.gz /path/to/uploads
```

## Scaling

### Vertical Scaling

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pm2 restart bilan-app
```

### Horizontal Scaling

```nginx
# Nginx load balancing configuration
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

## Security

### SSL/TLS
- Use HTTPS
- Enable HSTS
- Configure secure headers

### Firewall
```bash
# Configure UFW
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow ssh
sudo ufw enable
```

### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

## Troubleshooting

### Common Issues

1. Application not starting
   - Check PM2 logs
   - Verify environment variables
   - Check port availability

2. Database connection issues
   - Verify database file permissions
   - Check database path in .env
   - Ensure SQLite is installed

3. Nginx configuration issues
   - Check syntax: `sudo nginx -t`
   - Verify server blocks
   - Check error logs

### Debugging

```bash
# Enable debug mode
DEBUG=* pm2 restart bilan-app

# View detailed logs
pm2 logs bilan-app --lines 1000
```

## Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/) 