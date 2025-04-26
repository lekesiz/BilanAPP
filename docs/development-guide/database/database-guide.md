# Database Guide

## Table of Contents
1. [Database Architecture](#database-architecture)
2. [Models and Relationships](#models-and-relationships)
3. [Migrations and Seeding](#migrations-and-seeding)
4. [Query Optimization](#query-optimization)
5. [Indexing Strategy](#indexing-strategy)
6. [Data Integrity](#data-integrity)
7. [Backup and Recovery](#backup-and-recovery)
8. [Performance Monitoring](#performance-monitoring)
9. [Security](#security)

## Database Architecture

### PostgreSQL Setup
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
createdb bilan_app

# Create user
createuser bilan_user -P

# Grant privileges
psql -d bilan_app -c "GRANT ALL PRIVILEGES ON DATABASE bilan_app TO bilan_user;"
```

### Database Configuration
```ini
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

## Models and Relationships

### User Model
```javascript
// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // ... other fields
  });

  User.associate = (models) => {
    User.hasMany(models.Beneficiary, { foreignKey: 'userId' });
    User.hasMany(models.Document, { foreignKey: 'userId' });
    User.hasMany(models.Conversation, { foreignKey: 'userId' });
  };

  return User;
};
```

### Beneficiary Model
```javascript
// models/Beneficiary.js
module.exports = (sequelize, DataTypes) => {
  const Beneficiary = sequelize.define('Beneficiary', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // ... other fields
  });

  Beneficiary.associate = (models) => {
    Beneficiary.belongsTo(models.User, { foreignKey: 'userId' });
    Beneficiary.hasMany(models.Document, { foreignKey: 'beneficiaryId' });
    Beneficiary.hasMany(models.Conversation, { foreignKey: 'beneficiaryId' });
  };

  return Beneficiary;
};
```

## Migrations and Seeding

### Migration Example
```javascript
// migrations/YYYYMMDDHHMMSS-create-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      // ... other fields
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
```

### Seeder Example
```javascript
// seeders/YYYYMMDDHHMMSS-demo-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      email: 'admin@bilan-app.com',
      password: await bcrypt.hash('password123', 10),
      // ... other fields
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
```

## Query Optimization

### Index Usage
```javascript
// Add index to frequently queried fields
await queryInterface.addIndex('Users', ['email']);
await queryInterface.addIndex('Beneficiaries', ['userId']);
```

### Query Examples
```javascript
// Efficient query with includes
const user = await User.findOne({
  where: { id: userId },
  include: [{
    model: Beneficiary,
    include: [Document]
  }]
});

// Pagination
const users = await User.findAll({
  limit: 10,
  offset: (page - 1) * 10,
  order: [['createdAt', 'DESC']]
});
```

## Indexing Strategy

### Single Column Indexes
```javascript
// Add indexes for frequently queried columns
await queryInterface.addIndex('Users', ['email']);
await queryInterface.addIndex('Documents', ['userId']);
await queryInterface.addIndex('Conversations', ['userId']);
```

### Composite Indexes
```javascript
// Add composite indexes for complex queries
await queryInterface.addIndex('Documents', ['userId', 'status']);
await queryInterface.addIndex('Conversations', ['userId', 'createdAt']);
```

### Partial Indexes
```javascript
// Add partial indexes for specific conditions
await queryInterface.addIndex('Users', ['email'], {
  where: { status: 'active' }
});
```

## Data Integrity

### Constraints
```javascript
// Add constraints to ensure data integrity
await queryInterface.addConstraint('Beneficiaries', {
  fields: ['userId'],
  type: 'foreign key',
  name: 'fk_beneficiary_user',
  references: {
    table: 'Users',
    field: 'id'
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
```

### Validations
```javascript
// Add model validations
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  }
});
```

## Backup and Recovery

### Automated Backups
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d)
pg_dump -U bilan_user -d bilan_app > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql
```

### Point-in-Time Recovery
```bash
# Enable WAL archiving
wal_level = replica
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'
```

## Performance Monitoring

### Query Analysis
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_statement = 'all';

-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM Users WHERE email = 'user@example.com';
```

### Monitoring Tools
- pg_stat_statements
- pgBadger
- pgAdmin
- Datadog PostgreSQL Integration

## Security

### Access Control
```sql
-- Create role with limited privileges
CREATE ROLE app_user WITH LOGIN PASSWORD 'password';
GRANT SELECT, INSERT, UPDATE ON Users TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
```

### Encryption
```javascript
// Encrypt sensitive data
const encryptedData = crypto.encrypt(data, {
  algorithm: 'aes-256-gcm',
  key: process.env.ENCRYPTION_KEY
});
```

### Audit Logging
```javascript
// Add audit logging
const AuditLog = sequelize.define('AuditLog', {
  tableName: DataTypes.STRING,
  recordId: DataTypes.INTEGER,
  action: DataTypes.STRING,
  userId: DataTypes.INTEGER,
  changes: DataTypes.JSONB
});
``` 