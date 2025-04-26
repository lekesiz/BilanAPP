# Environment Setup Guide

## Table of Contents
1. [Development Environment](#development-environment)
2. [Staging Environment](#staging-environment)
3. [Production Environment](#production-environment)
4. [Environment Variables](#environment-variables)
5. [Dependencies](#dependencies)

## Development Environment

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Git
- PostgreSQL (v14.x or higher)
- Redis (v6.x or higher)
- Visual Studio Code (recommended)

### Installation Steps
1. Install Node.js:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or using package manager
# macOS
brew install node@18

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install PostgreSQL:
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14
sudo systemctl start postgresql
```

3. Install Redis:
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server
```

4. Clone the repository:
```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
```

5. Install dependencies:
```bash
npm install
```

6. Create development database:
```bash
createdb your_db_name_dev
```

7. Run migrations:
```bash
npm run migrate:dev
```

8. Seed development data:
```bash
npm run seed:dev
```

9. Start development server:
```bash
npm run dev
```

## Staging Environment

### Prerequisites
- Same as development environment
- PM2 (for process management)
- Nginx (for reverse proxy)

### Installation Steps
1. Install PM2:
```bash
npm install -g pm2
```

2. Install Nginx:
```bash
# macOS
brew install nginx

# Ubuntu/Debian
sudo apt-get install nginx
```

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name staging.your-domain.com;

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

4. Start application with PM2:
```bash
pm2 start ecosystem.config.js --env staging
```

## Production Environment

### Prerequisites
- Same as staging environment
- SSL certificate
- Backup system
- Monitoring tools

### Installation Steps
1. Generate SSL certificate:
```bash
# Using Let's Encrypt
sudo apt-get install certbot
sudo certbot certonly --nginx -d your-domain.com
```

2. Configure Nginx with SSL:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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

3. Start application with PM2:
```bash
pm2 start ecosystem.config.js --env production
```

4. Enable automatic startup:
```bash
pm2 startup
pm2 save
```

## Environment Variables

### Development (.env.development)
```env
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name_dev
DB_USER=your_db_user
DB_PASSWORD=your_db_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=your_jwt_secret_dev
JWT_EXPIRES_IN=24h

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password
SMTP_FROM=noreply@your-domain.com
```

### Staging (.env.staging)
```env
NODE_ENV=staging
PORT=3000
APP_URL=https://staging.your-domain.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name_staging
DB_USER=your_db_user
DB_PASSWORD=your_db_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

JWT_SECRET=your_jwt_secret_staging
JWT_EXPIRES_IN=24h

SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@your-domain.com
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name_prod
DB_USER=your_db_user
DB_PASSWORD=your_db_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

JWT_SECRET=your_jwt_secret_prod
JWT_EXPIRES_IN=24h

SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@your-domain.com
```

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.11",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.7",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0",
    "prettier": "^3.2.4",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### Development Tools
1. VS Code Extensions:
   - ESLint
   - Prettier
   - PostgreSQL
   - Redis
   - GitLens
   - REST Client

2. Browser Extensions:
   - Redux DevTools
   - React Developer Tools
   - JSON Formatter

3. Database Tools:
   - pgAdmin
   - Redis Commander
   - TablePlus

4. API Testing:
   - Postman
   - Insomnia
   - Thunder Client (VS Code) 