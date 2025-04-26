# Database Schema Documentation

This document provides detailed information about the BilanApp database schema and models.

## Overview

The application uses SQLite as the database and Sequelize as the ORM. The database schema consists of several interconnected tables that handle different aspects of the application.

## Models

### User

```sql
CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  name VARCHAR(100),
  surname VARCHAR(100),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

**Relationships:**
- Has many Appointments (as consultant)
- Has many Messages (as sender)
- Has many Messages (as receiver)

### Beneficiary

```sql
CREATE TABLE Beneficiaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

**Relationships:**
- Has many Documents
- Has many Appointments
- Has many CreditLogs

### Questionnaire

```sql
CREATE TABLE Questionnaires (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

**Relationships:**
- Has many Questions

### Question

```sql
CREATE TABLE Questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  questionnaireId INTEGER NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (questionnaireId) REFERENCES Questionnaires(id)
);
```

**Relationships:**
- Belongs to Questionnaire

### Document

```sql
CREATE TABLE Documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL,
  beneficiaryId INTEGER NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (beneficiaryId) REFERENCES Beneficiaries(id)
);
```

**Relationships:**
- Belongs to Beneficiary

### Appointment

```sql
CREATE TABLE Appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(50) NOT NULL,
  beneficiaryId INTEGER NOT NULL,
  consultantId INTEGER NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (beneficiaryId) REFERENCES Beneficiaries(id),
  FOREIGN KEY (consultantId) REFERENCES Users(id)
);
```

**Relationships:**
- Belongs to Beneficiary
- Belongs to User (as consultant)

### Message

```sql
CREATE TABLE Messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  senderId INTEGER NOT NULL,
  receiverId INTEGER NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (senderId) REFERENCES Users(id),
  FOREIGN KEY (receiverId) REFERENCES Users(id)
);
```

**Relationships:**
- Belongs to User (as sender)
- Belongs to User (as receiver)

### CreditLog

```sql
CREATE TABLE CreditLogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  beneficiaryId INTEGER NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (beneficiaryId) REFERENCES Beneficiaries(id)
);
```

**Relationships:**
- Belongs to Beneficiary

## Indexes

### User
- email (UNIQUE)

### Beneficiary
- email (UNIQUE)

### Question
- questionnaireId

### Document
- beneficiaryId

### Appointment
- beneficiaryId
- consultantId
- date, time (COMPOSITE)

### Message
- senderId
- receiverId
- createdAt

### CreditLog
- beneficiaryId
- createdAt

## Migrations

The database schema is managed through Sequelize migrations. Each migration file contains the necessary SQL commands to update the database schema.

### Creating Migrations
```bash
npx sequelize-cli migration:generate --name migration-name
```

### Running Migrations
```bash
npx sequelize-cli db:migrate
```

### Rolling Back Migrations
```bash
npx sequelize-cli db:migrate:undo
```

## Seeding

The database can be populated with initial data using seed files.

### Creating Seeds
```bash
npx sequelize-cli seed:generate --name seed-name
```

### Running Seeds
```bash
npx sequelize-cli db:seed:all
```

### Rolling Back Seeds
```bash
npx sequelize-cli db:seed:undo:all
```

## Backup and Recovery

### Backup
```bash
sqlite3 database.sqlite ".backup 'backup.sqlite'"
```

### Recovery
```bash
sqlite3 database.sqlite ".restore 'backup.sqlite'"
```

## Best Practices

1. Always use transactions for complex operations
2. Implement proper indexing for frequently queried columns
3. Use foreign key constraints to maintain data integrity
4. Regularly backup the database
5. Monitor database performance and optimize queries
6. Use prepared statements to prevent SQL injection
7. Implement proper error handling for database operations 