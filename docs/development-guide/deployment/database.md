# Database Management Guide

## Table of Contents
1. [Database Setup](#database-setup)
2. [Migrations](#migrations)
3. [Seeding](#seeding)
4. [Backup and Restore](#backup-and-restore)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring](#monitoring)

## Database Setup

### PostgreSQL Configuration

1. Create database users:
```sql
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
ALTER USER your_db_user WITH SUPERUSER;
```

2. Create databases:
```sql
CREATE DATABASE your_db_name_dev;
CREATE DATABASE your_db_name_staging;
CREATE DATABASE your_db_name_prod;
```

3. Grant privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE your_db_name_dev TO your_db_user;
GRANT ALL PRIVILEGES ON DATABASE your_db_name_staging TO your_db_user;
GRANT ALL PRIVILEGES ON DATABASE your_db_name_prod TO your_db_user;
```

4. Configure PostgreSQL for better performance:
```conf
# postgresql.conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

## Migrations

### Creating Migrations

1. Create a new migration:
```bash
npm run migration:create --name=create_users_table
```

2. Example migration file:
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('users', ['email']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
```

### Running Migrations

1. Run all pending migrations:
```bash
# Development
npm run migrate:dev

# Staging
npm run migrate:staging

# Production
npm run migrate:prod
```

2. Rollback last migration:
```bash
npm run migrate:undo
```

3. Rollback all migrations:
```bash
npm run migrate:undo:all
```

## Seeding

### Creating Seeders

1. Create a new seeder:
```bash
npm run seed:create --name=seed_users
```

2. Example seeder file:
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@example.com',
        password: '$2a$10$X7J3Y5Z9A1B3C5D7E9G1I3K5M7O9Q1S3U5W7Y9A1B3C5D7E9G1I3K5M7O9Q1S3U5',
        firstName: 'Admin',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
```

### Running Seeders

1. Run all seeders:
```bash
# Development
npm run seed:dev

# Staging
npm run seed:staging

# Production
npm run seed:prod
```

2. Run specific seeder:
```bash
npm run seed:run --name=seed_users
```

## Backup and Restore

### Automated Backup Script

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/path/to/backups"
DB_NAME="your_db_name"
DB_USER="your_db_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -F c -b -v -f "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.backup" $DB_NAME

# Compress backup
gzip "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.backup"

# Remove backups older than 30 days
find $BACKUP_DIR -type f -name "*.backup.gz" -mtime +30 -delete
```

### Restoring from Backup

1. Restore a specific backup:
```bash
gunzip -c /path/to/backup.gz | pg_restore -U your_db_user -d your_db_name
```

2. Restore with custom options:
```bash
pg_restore -U your_db_user -d your_db_name --clean --if-exists /path/to/backup
```

## Performance Optimization

### Indexing Strategy

1. Add indexes for frequently queried columns:
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_users_name ON users(firstName, lastName);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';
```

2. Add indexes for foreign keys:
```sql
CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(userId);
```

### Query Optimization

1. Use EXPLAIN to analyze queries:
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';
```

2. Common optimization techniques:
```sql
-- Use appropriate data types
ALTER TABLE users ALTER COLUMN phone TYPE varchar(20);

-- Add constraints
ALTER TABLE users ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Partition large tables
CREATE TABLE users_y2023 PARTITION OF users
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
```

## Monitoring

### Database Metrics

1. Set up monitoring with pg_stat_statements:
```sql
-- Enable extension
CREATE EXTENSION pg_stat_statements;

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

2. Monitor table statistics:
```sql
-- Table size and row count
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as total_size,
    pg_size_pretty(pg_relation_size(quote_ident(table_name))) as table_size,
    (SELECT count(*) FROM quote_ident(table_name)) as row_count
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

### Alerting

1. Set up alerts for:
- High CPU usage
- Long-running queries
- Disk space usage
- Connection count
- Replication lag

2. Example alert configuration:
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
    metrics_path: /metrics
    params:
      query: ['SELECT * FROM pg_stat_activity']
```

### Maintenance

1. Regular maintenance tasks:
```sql
-- Vacuum analyze
VACUUM ANALYZE users;

-- Reindex
REINDEX TABLE users;

-- Update statistics
ANALYZE users;
```

2. Schedule maintenance:
```bash
# Add to crontab
0 2 * * * /usr/bin/vacuumdb -z -a
0 3 * * * /usr/bin/reindexdb -a
``` 