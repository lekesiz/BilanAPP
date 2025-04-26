# Testing Guide

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [API Testing](#api-testing)
5. [Database Testing](#database-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Testing Tools](#testing-tools)

## Testing Strategy

### Test Types
- Unit Tests: Test individual components in isolation
- Integration Tests: Test component interactions
- API Tests: Test API endpoints and responses
- Database Tests: Test database operations and migrations
- Performance Tests: Test system performance and scalability
- Security Tests: Test security measures and vulnerabilities

### Test Environment
```bash
# Create test environment
NODE_ENV=test
DB_NAME=your_db_name_test
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Unit Testing

### Test Structure
```javascript
// Example unit test
const { expect } = require('chai');
const UserService = require('@services/UserService');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await UserService.createUser(userData);
      
      expect(user).to.have.property('id');
      expect(user.email).to.equal(userData.email);
      expect(user.firstName).to.equal(userData.firstName);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(UserService.createUser(userData))
        .to.be.rejectedWith('Email already exists');
    });
  });
});
```

### Running Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- path/to/test.js

# Run with coverage
npm run test:unit:coverage
```

## Integration Testing

### Test Setup
```javascript
const { expect } = require('chai');
const app = require('@app');
const db = require('@models');

describe('User Integration', () => {
  before(async () => {
    await db.sequelize.sync({ force: true });
  });

  after(async () => {
    await db.sequelize.close();
  });

  it('should create user and send welcome email', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/v1/users')
      .send(userData);

    expect(response.status).to.equal(201);
    expect(response.body.data).to.have.property('id');
    
    // Verify email was sent
    const emails = await EmailService.getSentEmails();
    expect(emails).to.have.lengthOf(1);
    expect(emails[0].to).to.equal(userData.email);
  });
});
```

## API Testing

### Test Cases
```javascript
describe('Authentication API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.property('token');
    expect(response.body.data.user).to.have.property('id');
  });

  it('should fail login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).to.equal(401);
    expect(response.body.error.code).to.equal('AUTHENTICATION_ERROR');
  });
});
```

### API Test Tools
```bash
# Using Postman
npm run test:api:postman

# Using Insomnia
npm run test:api:insomnia

# Using cURL
npm run test:api:curl
```

## Database Testing

### Migration Tests
```javascript
describe('Database Migrations', () => {
  it('should run all migrations successfully', async () => {
    const result = await db.sequelize.queryInterface.showAllTables();
    expect(result).to.include('users');
    expect(result).to.include('beneficiaries');
    expect(result).to.include('documents');
  });

  it('should rollback migrations successfully', async () => {
    await db.sequelize.queryInterface.dropAllTables();
    const result = await db.sequelize.queryInterface.showAllTables();
    expect(result).to.be.empty;
  });
});
```

### Data Integrity Tests
```javascript
describe('Data Integrity', () => {
  it('should maintain referential integrity', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });

    const beneficiary = await Beneficiary.create({
      userId: user.id,
      firstName: 'Test',
      lastName: 'Beneficiary'
    });

    await user.destroy();
    
    const foundBeneficiary = await Beneficiary.findByPk(beneficiary.id);
    expect(foundBeneficiary).to.be.null;
  });
});
```

## Performance Testing

### Load Testing
```javascript
describe('Performance Tests', () => {
  it('should handle 100 concurrent users', async () => {
    const users = Array(100).fill().map((_, i) => ({
      email: `user${i}@example.com`,
      password: 'password123'
    }));

    const startTime = Date.now();
    const responses = await Promise.all(
      users.map(user => 
        request(app)
          .post('/api/v1/auth/login')
          .send(user)
      )
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).to.be.below(5000); // 5 seconds
    responses.forEach(response => {
      expect(response.status).to.equal(200);
    });
  });
});
```

### Memory Usage Tests
```javascript
describe('Memory Usage', () => {
  it('should not leak memory during heavy usage', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Simulate heavy usage
    for (let i = 0; i < 1000; i++) {
      await User.create({
        email: `user${i}@example.com`,
        password: 'password123'
      });
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).to.be.below(50 * 1024 * 1024); // 50MB
  });
});
```

## Security Testing

### Authentication Tests
```javascript
describe('Security Tests', () => {
  it('should prevent brute force attacks', async () => {
    const attempts = 6;
    const responses = [];

    for (let i = 0; i < attempts; i++) {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      responses.push(response.status);
    }

    expect(responses).to.include(429); // Rate limit exceeded
  });

  it('should validate JWT tokens', async () => {
    const invalidToken = 'invalid.token.here';
    
    const response = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).to.equal(401);
  });
});
```

### Input Validation Tests
```javascript
describe('Input Validation', () => {
  it('should sanitize user input', async () => {
    const maliciousInput = {
      email: 'test@example.com<script>alert("xss")</script>',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/v1/users')
      .send(maliciousInput);

    expect(response.body.data.email).to.not.include('<script>');
  });
});
```

## Testing Tools

### Required Packages
```json
{
  "devDependencies": {
    "mocha": "^10.2.0",
    "chai": "^4.3.7",
    "sinon": "^15.1.0",
    "supertest": "^6.3.3",
    "nyc": "^15.1.0",
    "faker": "^5.5.3",
    "jest": "^29.7.0",
    "eslint-plugin-jest": "^27.6.0"
  }
}
```

### Test Scripts
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:api",
    "test:unit": "mocha test/unit/**/*.test.js",
    "test:integration": "mocha test/integration/**/*.test.js",
    "test:api": "mocha test/api/**/*.test.js",
    "test:coverage": "nyc npm test",
    "test:watch": "mocha --watch test/**/*.test.js"
  }
}
```

### VS Code Testing Configuration
```json
{
  "mochaExplorer.files": "test/**/*.test.js",
  "mochaExplorer.require": ["@babel/register"],
  "mochaExplorer.env": {
    "NODE_ENV": "test"
  }
}
``` 