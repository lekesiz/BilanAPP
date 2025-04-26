# BilanApp Deployment Guide

This guide provides detailed instructions for deploying the BilanApp application in various environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Methods](#deployment-methods)
4. [Database Setup](#database-setup)
5. [SSL Configuration](#ssl-configuration)
6. [Monitoring](#monitoring)
7. [Backup and Recovery](#backup-and-recovery)
8. [Scaling](#scaling)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js v18.x or higher
- npm v9.x or higher
- SQLite3
- Nginx or Apache
- SSL Certificate
- Domain name

### Server Requirements
- CPU: 2+ cores
- RAM: 4GB+
- Storage: 20GB+
- OS: Ubuntu 20.04 LTS or higher

## Environment Setup

### 1. Server Configuration
```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install required packages
sudo apt install -y nodejs npm nginx sqlite3

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Application Setup
```bash
# Clone repository
git clone https://github.com/your-org/bilan-app.git
cd bilan-app

# Install dependencies
npm install

# Build application
npm run build
```

### 3. Environment Variables
Create `.env` file with production settings:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=sqlite:///path/to/production.db
JWT_SECRET=your-secret-key
```

## Deployment Methods

### 1. Manual Deployment
```bash
# Start application with PM2
pm2 start npm --name "bilan-app" -- start

# Save PM2 process list
pm2 save

# Configure PM2 to start on boot
pm2 startup
```

### 2. Docker Deployment
```bash
# Build Docker image
docker build -t bilan-app .

# Run container
docker run -d \
  --name bilan-app \
  -p 3000:3000 \
  -v /path/to/data:/app/data \
  bilan-app
```

### 3. CI/CD Deployment
Configure your CI/CD pipeline (GitHub Actions, GitLab CI, etc.) with the following steps:
1. Install dependencies
2. Run tests
3. Build application
4. Deploy to server

## Database Setup

### 1. Initialize Database
```bash
# Run migrations
npm run db:migrate

# Run seeds
npm run db:seed
```

### 2. Backup Configuration
```bash
# Create backup script
#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M%S)
cp /path/to/database.db /backup/database_$timestamp.db
```

## SSL Configuration

### 1. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

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

## Monitoring

### 1. PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs bilan-app
```

### 2. System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Monitor system resources
htop
```

## Backup and Recovery

### 1. Database Backup
```bash
# Daily backup
0 0 * * * /path/to/backup-script.sh

# Weekly backup
0 0 * * 0 /path/to/full-backup.sh
```

### 2. Recovery Process
1. Stop application
2. Restore database from backup
3. Verify data integrity
4. Restart application

## Scaling

### 1. Vertical Scaling
- Increase server resources
- Optimize application code
- Implement caching

### 2. Horizontal Scaling
- Set up load balancing
- Configure multiple instances
- Implement session sharing

## Troubleshooting

### Common Issues
1. Application not starting
2. Database connection issues
3. SSL certificate problems
4. Performance issues

### Debugging Steps
1. Check application logs
2. Verify database connection
3. Test SSL configuration
4. Monitor system resources

## Security Considerations

### 1. Firewall Configuration
```bash
# Configure UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Security Headers
```javascript
// Add security headers
app.use(helmet());
```

### 3. Regular Updates
```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Update npm packages
npm update
```

## Maintenance

### 1. Regular Tasks
- Update system packages
- Backup database
- Check logs
- Monitor performance

### 2. Scheduled Maintenance
- Database optimization
- SSL certificate renewal
- Security patches
- Performance tuning 